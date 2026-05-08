const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");

// Create appointment
router.post("/", async (req, res) => {
  try {
    const { patientName, doctor, date, time } = req.body;

    // Validation
    if (!patientName || !doctor || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = new Appointment({
      patientName,
      doctor,
      date,
      time
    });

    await appointment.save();
    res.status(201).json({ message: "✅ Appointment created successfully", appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment", error: error.message });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

// Get appointments by date
router.get("/date/:date", async (req, res) => {
  try {
    const appointments = await Appointment.find({ date: req.params.date }).sort({ time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

module.exports = router;