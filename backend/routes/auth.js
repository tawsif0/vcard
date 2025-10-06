const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const nodemailer = require("nodemailer");
const { auth } = require("../middlewares/auth");
// Setup nodemailer transporter (use your SMTP config)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "arbeittechnology@gmail.com",
    pass: "fgtg sbxq hyrr phby",
  },
});

// Helper to safely send error responses without logging sensitive info
function sendError(res, status = 500, msg = "Server error") {
  return res.status(status).json({ msg });
}

// POST /verify - Verify token and get user data
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    });
  }
});

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

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return sendError(res, 400, "Invalid email format.");
    }

    if (password.length < 8) {
      return sendError(res, 400, "Password must be at least 8 characters.");
    }

    // Check if user already exists in the main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 400, "User already exists.");

    // Delete any existing pending registration
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
    try {
      await transporter.sendMail({
        from: `"YourAppName" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Registration OTP Code",
        text: `Your OTP code is ${otpCode}. It will expire in 15 minutes.`,
        html: `<p>Your OTP code is <b>${otpCode}</b>. It will expire in 15 minutes.</p>`,
      });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return sendError(res, 500, "Failed to send OTP email.");
    }

    return res.json({
      msg: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (err) {
    console.error("Error during registration:", err);
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
      isVerified: true,
      isPremium: false,
      role: "user",
    });

    await newUser.save();

    // Delete pending user
    await PendingUser.deleteOne({ email });

    // Issue JWT token
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) return sendError(res);
        return res.json({
          msg: "Verification successful. Account activated.",
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            isPremium: newUser.isPremium,
            isVerified: newUser.isVerified,
          },
        });
      }
    );
  } catch (error) {
    console.error("Verification error:", error);
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

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) return sendError(res);
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            isVerified: user.isVerified,
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res);
  }
});

// PATCH /update-profile - Update user name and email
router.patch("/update-profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if email is already taken by ANOTHER user (excluding current user)
    if (email !== req.user.email) {
      const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.user.id }, // Exclude current user from the check
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
});

// POST /reset-password - Reset user password
router.post("/reset-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
});

// NEW: Send verification code for email change
router.post("/send-verification-code", auth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken by another user",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code in user document
    await User.findByIdAndUpdate(req.user.id, {
      emailVerification: {
        code: verificationCode,
        expiresAt: verificationExpires,
        pendingEmail: email.trim().toLowerCase(),
      },
    });

    // Send verification email
    try {
      await transporter.sendMail({
        from: `"YourAppName" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Email Change Verification Code",
        text: `Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Change Verification</h2>
            <p>You requested to change your email address. Use the verification code below to confirm this change:</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this change, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification code sending",
    });
  }
});

// NEW: Verify email change code and update email
router.post("/verify-email-code", auth, async (req, res) => {
  try {
    const { code, newEmail } = req.body;

    if (!code || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Verification code and new email are required",
      });
    }

    // Get user with verification data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if verification data exists
    if (!user.emailVerification || !user.emailVerification.code) {
      return res.status(400).json({
        success: false,
        message: "No pending email verification found",
      });
    }

    // Check if code matches
    if (user.emailVerification.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Check if code is expired
    if (user.emailVerification.expiresAt < new Date()) {
      // Clear expired verification data
      await User.findByIdAndUpdate(req.user.id, {
        $unset: { emailVerification: 1 },
      });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Check if the pending email matches
    if (user.emailVerification.pendingEmail !== newEmail.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Email mismatch",
      });
    }

    // Final check if email is still available
    const existingUser = await User.findOne({
      email: newEmail.trim().toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken by another user",
      });
    }

    // Update user email and clear verification data
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        email: newEmail.trim().toLowerCase(),
        $unset: { emailVerification: 1 },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Email updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
});

module.exports = router;
