const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  createdAt: {type: Date},
  updatedAt: {type: Date},
  deletedAt: {type: Date},
  createdBy: {type: mongoose.Schema.Types.ObjectId},
  updatedBy: {type: mongoose.Schema.Types.ObjectId},
  deletedBy: {type: mongoose.Schema.Types.ObjectId},
  version: {
    type: Number,
    required: 'Please enter a valid version number'
  },
  file_name: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('ecoinvent_versions', schema);