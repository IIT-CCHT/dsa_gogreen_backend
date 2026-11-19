const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  order: {
    type: Number,
  },
  topic: {
    type: String,
  },
  medium_type: {
    type: String,
  },
  access: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  owner: {
    type: String,
  },
  relevant: {
    type: Boolean
  }
});

module.exports = mongoose.model('resources', schema);