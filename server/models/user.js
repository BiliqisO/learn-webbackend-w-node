var mongoose = require("mongoose");

var User = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    unique: true,
  },
});
module.exports = { User };
