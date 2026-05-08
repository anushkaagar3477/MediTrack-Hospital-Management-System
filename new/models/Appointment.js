const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientName: String,
  doctor: String,
  date: String,
  time: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);