const mongoose = require('mongoose');

// Set mongoURL
let mongoUrl;
if (process.env.MONGO_URL) {
  mongoUrl = process.env.MONGO_URL;
} else {
  mongoUrl = 'localhost';
}

// Connects to Database
mongoose.connect(`mongodb://${mongoUrl}/jshort`);

// Define ShortURl Model
module.exports = mongoose.model('Shorturl',
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
