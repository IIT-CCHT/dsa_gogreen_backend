const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materials',
    required: true
  },
  process: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Processes',
    required: true
  }
});

module.exports = mongoose.model('techniques', schema);