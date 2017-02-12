const mongoose = require('mongoose');

// Connects to Database
mongoose.connect('mongodb://localhost/jshort');

// Define ShortURl Model
module.export = mongoose.model('Shorturl',
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
