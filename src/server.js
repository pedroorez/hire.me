// Modules
const app = require('express')();
const isURLvalid = require('valid-url').isWebUri;

// Custom Libs
const alias = require('./alias');
const Shorturl = require('./Shorturl');

// Define Shortener URL endpoint
app.get('/create', (req, res) => {
  const requestStart = new Date().getTime();
  let urlAlias;

  if (!req.query.url) {
    return res.send({
      errCode: '003',
      description: 'No URL to be shorten provided.',
    });
  }

  if (!isURLvalid(req.query.url)) {
    return res.send({
      errCode: '004',
      url: req.query.url,
      description: 'URL is not Valid.',
    });
  }

  if (req.query.CUSTOM_ALIAS) {
    if (!alias.check(req.query.CUSTOM_ALIAS)) {
      return res.send({
        errCode: '005',
        customAlias: req.query.CUSTOM_ALIAS,
        description: 'Invalid CUSTOM_ALIAS.',
      });
    }
    urlAlias = req.query.CUSTOM_ALIAS;
  } else {
    urlAlias = alias.gen();
  }

  return Shorturl
    .find({ alias: urlAlias })
    .then((search) => {
      if (search.length > 0) {
        res.send({
          errCode: '001',
          alias: urlAlias,
          description: 'CUSTOM ALIAS ALREADY EXISTS.',
        });
      }
      return Shorturl
        .create({
          url: req.query.url,
          alias: urlAlias,
        })
        .then((result) => {
          res.send({
            alias: result.alias,
            visitors: result.visitors,
            url: `${req.headers.host}/${result.alias}`,
            statistics: {
              timeTaken: `${new Date().getTime() - requestStart} ms`,
            },
          });
        });
    });
});

// Define Retrive URL endpoint
app.get('/:alias', (req, res) => {
  Shorturl
    .findOneAndUpdate({ alias: req.params.alias }, { $inc: { visitors: 1 } })
    .then(entry => res.redirect(entry.url))
    .catch(() => {
      res.send({
        errCode: '002',
        alias: req.params.alias,
        description: 'SHORTENED URL NOT FOUND.',
      });
    });
});

// Listen Port
app.listen(3000);
