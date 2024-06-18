const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: Number,
  surname: String,
  name: String,
  credentials: [
    {
      login: String,
      password: String,
      email: String,
    },
  ],
  reserved: [
    {
      reservationId: Number,
      hour: String,
      date: String,
      fieldId: Number,
    },
  ],
});

module.exports = mongoose.model("User", userSchema, "users");
