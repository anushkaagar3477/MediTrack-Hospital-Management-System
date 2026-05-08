const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, "secretkey", { expiresIn: "24h" });

    res.json({ token, message: "✅ Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Check if a username exists (for admin quick verification)
router.get("/exists/:username", async (req, res) => {
  try {
    const username = req.params.username?.trim();
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username }).select("_id username");
    return res.json({ exists: Boolean(user), user: user || null });
  } catch (error) {
    console.error("User existence check error:", error);
    return res.status(500).json({ message: "Failed to check username", error: error.message });
  }
});

module.exports = router;