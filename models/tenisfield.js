const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema({
  id: Number,
  Type: String,
  Price: String,
});

module.exports = mongoose.model("Court", courtSchema, "tenisfield");
