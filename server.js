const app = require('express')();
const mongoose = require('mongoose');
const isURLvalid = require('valid-url').isWebUri;

// Connects to Database
mongoose.connect('mongodb://localhost/jshort');

// Define ShortURl Model
const Shorturl = mongoose.model('Shorturl',
  {
    url: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
      unique: true,
      dropDups: true,
      required: true,
    },
  });

// Define Shortener URL endpoint
app.get('/create', (req, res) => {
  if (!req.query.url) {
    return res.send('NO URL SENT');
  }

  if (!isURLvalid(req.query.url)) {
    return res.send('URL Non valido');
  }
});

// Listen Port
app.listen(3000);