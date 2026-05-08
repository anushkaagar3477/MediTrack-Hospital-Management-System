const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

// Add patient
router.post("/", async (req, res) => {
  try {
    const { name, age, disease, doctor } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: "Patient name is required" });
    }

    const patient = new Patient({
      name,
      age: age || 0,
      disease: disease || "Not specified",
      doctor: doctor || "Not assigned"
    });

    await patient.save();
    res.status(201).json({ message: "✅ Patient added successfully", patient });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ message: "Failed to add patient", error: error.message });
  }
});

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Failed to fetch patients", error: error.message });
  }
});

// Check if a patient name exists (for admin quick verification)
router.get("/exists/name/:name", async (req, res) => {
  try {
    const name = req.params.name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Patient name is required" });
    }

    const patient = await Patient.findOne({ name }).select("_id name age disease doctor createdAt");
    return res.json({ exists: Boolean(patient), patient: patient || null });
  } catch (error) {
    console.error("Patient existence check error:", error);
    return res.status(500).json({ message: "Failed to check patient", error: error.message });
  }
});

// Remove doctor and related records
router.delete("/doctor/:doctorName", async (req, res) => {
  try {
    const doctorName = req.params.doctorName?.trim();
    if (!doctorName) {
      return res.status(400).json({ message: "Doctor name is required" });
    }

    const patientsResult = await Patient.deleteMany({ doctor: doctorName });
    const appointmentsResult = await Appointment.deleteMany({ doctor: doctorName });

    return res.json({
      message: `✅ Doctor '${doctorName}' removed`,
      removedPatients: patientsResult.deletedCount,
      removedAppointments: appointmentsResult.deletedCount
    });
  } catch (error) {
    console.error("Error removing doctor:", error);
    return res.status(500).json({ message: "Failed to remove doctor", error: error.message });
  }
});

// Remove patient by ID
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointmentsResult = await Appointment.deleteMany({ patientName: patient.name });
    return res.json({
      message: "✅ Patient removed",
      removedPatient: patient.name,
      removedAppointments: appointmentsResult.deletedCount
    });
  } catch (error) {
    console.error("Error removing patient:", error);
    return res.status(500).json({ message: "Failed to remove patient", error: error.message });
  }
});

// Get patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ message: "Failed to fetch patient", error: error.message });
  }
});

module.exports = router;