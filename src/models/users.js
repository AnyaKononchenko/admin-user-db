const { Schema, model } = require('mongoose');
import isEmail from 'validator/lib/isEmail';

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: [2, "Name can't consist of less than 2 characters"],
    maxlength: [150, "Name can't consist of more than 150 characters"],
    required: [true, "Provide a name"],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: isEmail(),
      message: "Email is not valid"
    },
    required: [true, "Provide an email"],
  },
  password: {
    type: String,
    minlength: [8, "Password should consist of at least 8 characters"],
    required: [true, "Provide a password"],
  },
  phone: {
    type: String,
    minlength: [10, "Phone should consist of at least 10 digits"],
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model('users', userSchema);

module.exports = User;