const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const User = require('../models/User');
const shortid = require('shortid');

const tempStorage = new Map();

router.post('/shorten', async (req, res) => {
  const { longUrl, username } = req.body;

  if (!longUrl) {
    return res.status(400).json({ message: 'URL is required' });
  }

  const shortCode = shortid.generate();
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

  try {
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        await new Url({
          originalUrl: longUrl,
          shortCode,
          userId: user._id
        }).save();
        return res.json({ shortUrl });
      }
    }

    tempStorage.set(shortCode, longUrl);
    return res.json({ shortUrl, warning: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/history/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const history = await Url.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete/:shortCode', async (req, res) => {
  try {
    const result = await Url.deleteOne({ shortCode: req.params.shortCode });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = { router, tempStorage };
