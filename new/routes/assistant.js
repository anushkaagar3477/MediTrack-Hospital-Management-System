const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function findDoctorInMessage(message, doctors) {
  const lower = normalizeText(message);
  const explicit = lower.match(/doctor\s+([a-zA-Z0-9 ._-]+)/i);
  if (explicit && explicit[1]) {
    const requested = explicit[1].trim().toLowerCase();
    const exact = doctors.find((d) => d.toLowerCase() === requested);
    if (exact) return exact;

    const partial = doctors.find((d) => d.toLowerCase().includes(requested));
    if (partial) return partial;
  }

  return doctors.find((d) => lower.includes(d.toLowerCase())) || null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toDateTime(date, time) {
  return new Date(`${date}T${time || "00:00"}:00`);
}

function buildSummary(patients, appointments) {
  const doctors = [...new Set(patients.map((p) => p.doctor).filter(Boolean))];
  const diseases = patients.reduce((acc, p) => {
    const key = p.disease || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topDiseases = Object.entries(diseases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count})`)
    .join(", ");

  const today = todayIso();
  const todaysAppointments = appointments.filter((a) => a.date === today);

  const nextAppointment = appointments
    .filter((a) => a.date)
    .slice()
    .sort((a, b) => toDateTime(a.date, a.time) - toDateTime(b.date, b.time))[0];

  let reply = `Hospital snapshot: ${patients.length} patients, ${doctors.length} doctors, and ${appointments.length} total appointments.`;
  reply += ` Today has ${todaysAppointments.length} appointment(s).`;

  if (topDiseases) {
    reply += ` Top diseases: ${topDiseases}.`;
  }

  if (nextAppointment) {
    reply += ` Next appointment: ${nextAppointment.patientName} with Dr. ${nextAppointment.doctor} on ${nextAppointment.date} at ${nextAppointment.time}.`;
  }

  return reply;
}

function buildTodayReply(appointments) {
  const today = todayIso();
  const todaysAppointments = appointments
    .filter((a) => a.date === today)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  if (!todaysAppointments.length) {
    return "There are no appointments scheduled for today.";
  }

  const lines = todaysAppointments
    .slice(0, 8)
    .map((a) => `- ${a.time} | ${a.patientName} with Dr. ${a.doctor}`)
    .join("\n");

  return `Today's appointments:\n${lines}`;
}

function buildDoctorReply(doctor, patients, appointments) {
  if (!doctor) {
    return "I could not find that doctor. Try including the full doctor name, for example: 'doctor Sharma'.";
  }

  const doctorPatients = patients.filter((p) => p.doctor === doctor);
  const doctorAppointments = appointments.filter((a) => a.doctor === doctor);
  const today = todayIso();
  const doctorToday = doctorAppointments.filter((a) => a.date === today);

  let reply = `Dr. ${doctor}: ${doctorPatients.length} patient(s), ${doctorAppointments.length} total appointment(s), ${doctorToday.length} for today.`;

  if (doctorToday.length) {
    const todayLines = doctorToday
      .slice(0, 5)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
      .map((a) => `${a.time} (${a.patientName})`)
      .join(", ");
    reply += ` Today's schedule: ${todayLines}.`;
  }

  return reply;
}

router.post("/assistant", async (req, res) => {
  try {
    const message = (req.body?.message || "").toString().trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [patients, appointments] = await Promise.all([
      Patient.find().lean(),
      Appointment.find().lean()
    ]);

    const doctors = [...new Set(patients.map((p) => p.doctor).filter(Boolean))];
    const lower = normalizeText(message);

    let reply;
    if (/(summary|overview|snapshot|status|report)/.test(lower)) {
      reply = buildSummary(patients, appointments);
    } else if (/(today|todays|today's)/.test(lower)) {
      reply = buildTodayReply(appointments);
    } else if (/(doctor|dr\.?)/.test(lower)) {
      const doctor = findDoctorInMessage(message, doctors);
      reply = buildDoctorReply(doctor, patients, appointments);
    } else if (/(disease|diagnosis|common)/.test(lower)) {
      reply = buildSummary(patients, appointments);
    } else {
      reply = "I can help with hospital insights. Ask: 'summary', 'today appointments', or 'doctor <name> status'.";
    }

    return res.json({
      reply,
      suggestions: [
        "Give me a summary",
        "Today's appointments",
        "Doctor status"
      ]
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return res.status(500).json({ message: "AI assistant failed", error: error.message });
  }
});

module.exports = router;
