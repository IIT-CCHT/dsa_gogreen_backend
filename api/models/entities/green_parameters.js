const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  createdAt: {type: Date},
  updatedAt: {type: Date},
  deletedAt: {type: Date},
  createdBy: {type: mongoose.Schema.Types.ObjectId},
  updatedBy: {type: mongoose.Schema.Types.ObjectId},
  deletedBy: {type: mongoose.Schema.Types.ObjectId},
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  form: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('green_parameters', schema);