const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('processes', schema);