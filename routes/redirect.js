const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { tempStorage } = require('./shorten');

router.get('/:code', async (req, res) => {
  const code = req.params.code;

  try {
    const record = await Url.findOne({ shortCode: code });
    if (record) {
      return res.redirect(record.originalUrl);
    }

    if (tempStorage.has(code)) {
      return res.redirect(tempStorage.get(code));
    }

    res.status(404).send('<h2>URL not found</h2>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
