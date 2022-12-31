const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  emailAuthenticated: {
    type: Boolean,
  },
  college: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
});

module.exports = mongoose.model("users", userSchema);
