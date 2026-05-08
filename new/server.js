const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/patients", require("./routes/patient"));
app.use("/appointments", require("./routes/appointment"));
app.use("/ai", require("./routes/assistant"));

// MongoDB Atlas Connection
mongoose.connect("mongodb+srv://admin:admin%401@cluster0.iys5dnf.mongodb.net/hospitalDB")
  .then(() => console.log(" MongoDB Atlas Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server running successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});