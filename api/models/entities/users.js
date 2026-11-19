var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

const schema = new mongoose.Schema(
  {
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
    },
   email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
    },
    role_slug: {
      type: String,
      trim: true,
    },
     role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'roles'
    },
    hash: String,
    salt: String
  }
);

schema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', schema);