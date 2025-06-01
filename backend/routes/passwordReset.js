const router = require("express").Router();
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /password-reset/request
router.post("/request", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Always respond success to avoid email enumeration
      return res.json({
        msg: "If this email is registered, a code has been sent.",
      });
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.findOneAndUpdate(
      { userId: user._id },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send email with code
    await transporter.sendMail({
      from: `"YourAppName" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}. It is valid for 15 minutes.`,
      html: `<p>Your password reset code is: <b>${code}</b>. It is valid for 15 minutes.</p>`,
    });

    res.json({ msg: "If this email is registered, a code has been sent." });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /password-reset/verify-code
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  if (!code || code.length !== 4) {
    return res
      .status(400)
      .json({ msg: "Please provide a valid 4-digit code." });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid email or code." });

    const resetRecord = await PasswordReset.findOne({ userId: user._id });
    if (!resetRecord)
      return res.status(400).json({ msg: "Invalid or expired code." });

    if (resetRecord.expiresAt < new Date()) {
      await resetRecord.deleteOne();
      return res.status(400).json({ msg: "Code expired." });
    }

    if (resetRecord.code !== code)
      return res.status(400).json({ msg: "Invalid code." });

    res.json({ msg: "Code verified." });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /password-reset/reset-password
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      msg: "New password is required and must be at least 8 characters.",
    });
  }
  if (!code || code.length !== 4) {
    return res
      .status(400)
      .json({ msg: "Please provide a valid 4-digit code." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid email or code." });

    const resetRecord = await PasswordReset.findOne({ userId: user._id });
    if (!resetRecord)
      return res.status(400).json({ msg: "Invalid or expired code." });

    if (resetRecord.expiresAt < new Date()) {
      await resetRecord.deleteOne();
      return res.status(400).json({ msg: "Code expired." });
    }

    if (resetRecord.code !== code)
      return res.status(400).json({ msg: "Invalid code." });

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove reset record
    await resetRecord.deleteOne();

    res.json({ msg: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
