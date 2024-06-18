const mongoose = require("mongoose");

const reservationsSchema = new mongoose.Schema({
  id: Number,
  date: String,
  reservations: [
    {
      userId: Number,
      hour: String,
      fieldid: Number,
    },
  ],
});

module.exports = mongoose.model(
  "DayReservation",
  reservationsSchema,
  "dayreservations"
);
