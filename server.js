const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const shorten = require('./routes/shorten');
const redirectRoute = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://ahana70:base2145@cluster1.v4qjxdy.mongodb.net/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/api', shorten.router);
app.use('/', redirectRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
