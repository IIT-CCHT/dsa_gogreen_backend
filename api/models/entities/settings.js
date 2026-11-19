const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('settings', schema);