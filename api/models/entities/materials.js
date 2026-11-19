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
  },
  active: {
    type: Boolean,
  },
  type: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    required: 'Please enter a valid file name'
  },
  reference_unit: {
    type: String,
    trim: true
  },
  reference_amount: {
    type: String,
    trim: true
  },
  lca_data: {
    type: Object,
  },
  
  physical_state: {
    type: String,
    trim: true,
  },
 is_solvent: {
    type: Boolean
  }
});

module.exports = mongoose.model('materials', schema);