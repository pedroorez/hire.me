const app = require('express')();
const alias = require('./alias');
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
  const requestStart = new Date().getTime();
  let urlAlias;

  if (!req.query.url) {
    return res.send('NO URL SENT');
  }

  if (!isURLvalid(req.query.url)) {
    return res.send('URL Non valido');
  }

  if (req.query.CUSTOM_ALIAS) {
    if (!alias.check(req.query.CUSTOM_ALIAS)) {
      return res.send('Alias invalido');
    }
    urlAlias = req.query.CUSTOM_ALIAS;
  } else {
    urlAlias = alias.gen();
  }

  return Shorturl
    .find({ alias: urlAlias })
    .then((search) => {
      if (search.length > 0) {
        res.send('Already Exist');
      }
      return Shorturl
        .create({
          url: req.query.url,
          alias: urlAlias,
        })
        .then((result) => {
          res.send({
            alias: result.alias,
            url: `${req.headers.host}/${result.alias}`,
            statistics: {
              timeTaken: `${new Date().getTime() - requestStart} ms`,
            },
          });
        })
    });
});
});

// Listen Port
app.listen(3000);