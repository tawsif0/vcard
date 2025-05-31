const router = require("express").Router();
const { auth, isAdmin } = require("../middlewares/auth");
const User = require("../models/User");

// Get all users (admin only)
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
