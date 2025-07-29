const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.json({ success: false, message: 'All fields required' });
  }

  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match' });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.json({ success: false, message: 'User already exists' });

    const user = new User({ username, password });
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/verify', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    return res.json({ valid: !!user });
  } catch (err) {
    return res.json({ valid: false });
  }
});

module.exports = router;
