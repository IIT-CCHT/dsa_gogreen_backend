const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    createdAt: {type: Date},
    updatedAt: {type: Date},
    deletedAt: {type: Date},
    createdBy: {type: mongoose.Schema.Types.ObjectId},
    updatedBy: {type: mongoose.Schema.Types.ObjectId},
    deletedBy: {type: mongoose.Schema.Types.ObjectId},
    session_id: {
      type: String,
      trim: true,
    },
    last_access: {
      type: String
    },
    folders: [],
    pages:{},
    user_id: {type: mongoose.Schema.Types.ObjectId}
  }
);

const workbenches = mongoose.model('workbenches', schema);

module.exports = workbenches