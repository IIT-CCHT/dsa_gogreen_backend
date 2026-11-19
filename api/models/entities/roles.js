const mongoose = require('mongoose');
const schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  createdAt: {type: Date},
  updatedAt: {type: Date},
  deletedAt: {type: Date},
  createdBy: {type: mongoose.Schema.Types.ObjectId},
  updatedBy: {type: mongoose.Schema.Types.ObjectId},
  deletedBy: {type: mongoose.Schema.Types.ObjectId},
  name: {
    type: String,
    trim: true,
    required: 'Please enter a valid role name'
  },
  slug: {
    type: String,
    trim: true,
    required: 'Please enter a valid role slug name'
  }
});

module.exports = mongoose.model('roles', schema);