const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const nodemailer = require("nodemailer");

// Setup nodemailer transporter (use your SMTP config)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper to safely send error responses without logging sensitive info
function sendError(res, status = 500, msg = "Server error") {
  return res.status(status).json({ msg });
}

// POST /register - Save pending user and send OTP
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email and password are required.");
    }

    email = email.trim().toLowerCase();
    name = name.trim();
    password = password.trim();

    if (!/\S+@\S+\.\S+/.test(email)) {
      return sendError(res, 400, "Invalid email format.");
    }

    if (password.length < 8) {
      return sendError(res, 400, "Password must be at least 8 characters.");
    }

    // Check if user already exists in main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 400, "User already exists.");

    // Delete pending registration if exists (atomic find & delete)
    await PendingUser.findOneAndDelete({ email });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create pending user record
    const pending = new PendingUser({
      name,
      email,
      passwordHash: hashedPassword,
      otp: {
        code: otpCode,
        expiresAt: otpExpiresAt,
      },
    });

    await pending.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"YourAppName" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Registration OTP Code",
      text: `Your OTP code is ${otpCode}. It will expire in 15 minutes.`,
      html: `<p>Your OTP code is <b>${otpCode}</b>. It will expire in 15 minutes.</p>`,
    });

    return res.json({
      msg: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch {
    // Don't leak error details in response
    return sendError(res);
  }
});

// POST /register/verify - Verify OTP and create real user
router.post("/register/verify", async (req, res) => {
  try {
    let { email, code } = req.body;

    if (!email || !code) {
      return sendError(res, 400, "Email and OTP code are required.");
    }

    email = email.trim().toLowerCase();
    code = code.trim();

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      return sendError(res, 400, "OTP code must be exactly 4 digits.");
    }

    // Find pending user record
    const pending = await PendingUser.findOne({ email });
    if (!pending)
      return sendError(
        res,
        400,
        "No pending registration found. Please register first."
      );

    if (!pending.otp || !pending.otp.code || !pending.otp.expiresAt) {
      return sendError(res, 400, "OTP not found. Please request again.");
    }

    if (pending.otp.expiresAt < new Date()) {
      await PendingUser.deleteOne({ email }); // Cleanup expired OTP
      return sendError(res, 400, "OTP expired. Please register again.");
    }

    if (pending.otp.code !== code) {
      return sendError(res, 400, "Invalid OTP.");
    }

    // Create new user in main User collection
    const newUser = new User({
      name: pending.name,
      email: pending.email,
      password: pending.passwordHash,
      isVerified: true, // auto verified since OTP confirmed
      role: "user",
    });

    await newUser.save();

    // Delete pending user
    await PendingUser.deleteOne({ email });

    // Issue JWT token
    const payload = { user: { id: newUser.id, role: newUser.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) return sendError(res);
        return res.json({
          msg: "Verification successful. Account activated.",
          token,
          user: { id: newUser.id, name: newUser.name, role: newUser.role },
        });
      }
    );
  } catch {
    return sendError(res);
  }
});

// POST /login - only verified users can login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user) return sendError(res, 400, "Invalid credentials.");

    if (!user.isVerified)
      return sendError(res, 400, "Email not verified. Please verify first.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 400, "Invalid credentials.");

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) return sendError(res);
        return res.json({
          token,
          user: { id: user.id, name: user.name, role: user.role },
        });
      }
    );
  } catch {
    return sendError(res);
  }
});

module.exports = router;
