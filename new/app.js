const API_BASE = "http://localhost:5001";
const AUTH_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

// Utility Functions
function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getSessionUser() {
  return readJSON(sessionStorage, AUTH_KEY, null);
}

function setSessionUser(user) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// LOGIN PAGE
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegisterBtn");

if (loginForm) {
  if (getSessionUser()) {
    window.location.href = "index.html";
  }

  const loginError = document.getElementById("loginError");
  const dbCheckResult = document.getElementById("dbCheckResult");
  const userCheckForm = document.getElementById("userCheckForm");
  const patientCheckForm = document.getElementById("patientCheckForm");
  const registerRole = document.getElementById("registerRole");
  const registerDoctorName = document.getElementById("registerDoctorName");

  function toggleDoctorNameField() {
    if (!registerRole || !registerDoctorName) return;
    const isDoctorRole = registerRole.value === "doctor";
    registerDoctorName.classList.toggle("is-hidden", !isDoctorRole);
    registerDoctorName.required = isDoctorRole;
  }

  if (showRegisterBtn && registerForm) {
    showRegisterBtn.addEventListener("click", () => {
      registerForm.classList.toggle("is-hidden");
      loginForm.classList.toggle("is-hidden");
      toggleDoctorNameField();
    });
  }

  if (registerRole) {
    registerRole.addEventListener("change", toggleDoctorNameField);
    toggleDoctorNameField();
  }

  if (userCheckForm && dbCheckResult) {
    userCheckForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      dbCheckResult.style.color = "#1f2f46";
      dbCheckResult.textContent = "Checking user...";

      const input = document.getElementById("checkUsername");
      const username = input.value.trim();

      if (!username) {
        dbCheckResult.style.color = "#b42318";
        dbCheckResult.textContent = "Please enter a username.";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/exists/${encodeURIComponent(username)}`);
        const data = await res.json();

        if (!res.ok) {
          dbCheckResult.style.color = "#b42318";
          dbCheckResult.textContent = data.message || "Unable to check user.";
          return;
        }

        if (data.exists) {
          dbCheckResult.style.color = "#067647";
          dbCheckResult.textContent = `User '${username}' exists in MongoDB.`;
        } else {
          dbCheckResult.style.color = "#b42318";
          dbCheckResult.textContent = `User '${username}' is not found in MongoDB.`;
        }
      } catch (error) {
        console.error("User DB check error:", error);
        dbCheckResult.style.color = "#b42318";
        dbCheckResult.textContent = "Connection error while checking user.";
      }
    });
  }

  if (patientCheckForm && dbCheckResult) {
    patientCheckForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      dbCheckResult.style.color = "#1f2f46";
      dbCheckResult.textContent = "Checking patient...";

      const input = document.getElementById("checkPatientName");
      const patientName = input.value.trim();

      if (!patientName) {
        dbCheckResult.style.color = "#b42318";
        dbCheckResult.textContent = "Please enter a patient name.";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/patients/exists/name/${encodeURIComponent(patientName)}`);
        const data = await res.json();

        if (!res.ok) {
          dbCheckResult.style.color = "#b42318";
          dbCheckResult.textContent = data.message || "Unable to check patient.";
          return;
        }

        if (data.exists && data.patient) {
          dbCheckResult.style.color = "#067647";
          dbCheckResult.textContent = `Patient '${patientName}' exists (Dr. ${data.patient.doctor}).`;
        } else {
          dbCheckResult.style.color = "#b42318";
          dbCheckResult.textContent = `Patient '${patientName}' is not found in MongoDB.`;
        }
      } catch (error) {
        console.error("Patient DB check error:", error);
        dbCheckResult.style.color = "#b42318";
        dbCheckResult.textContent = "Connection error while checking patient.";
      }
    });
  }

  // LOGIN FORM SUBMIT
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.style.color = "red";
        loginError.textContent = data.message || "Invalid credentials";
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setSessionUser({ username, role: "user" });
      window.location.href = "index.html";
    } catch (error) {
      console.error("Login error:", error);
      loginError.style.color = "red";
      loginError.textContent = "Connection error. Please try again.";
    }
  });

  // REGISTER FORM SUBMIT
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.textContent = "";

      const username = document.getElementById("registerUsername").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        loginError.style.color = "red";
        loginError.textContent = "Passwords do not match";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, confirmPassword })
        });

        const data = await res.json();

        if (!res.ok) {
          loginError.style.color = "red";
          loginError.textContent = data.message || "Registration failed";
          return;
        }

        loginError.style.color = "green";
        loginError.textContent = "✅ Registered successfully! Please login.";
        registerForm.reset();
        setTimeout(() => {
          registerForm.classList.add("is-hidden");
          loginForm.classList.remove("is-hidden");
        }, 1500);
      } catch (error) {
        console.error("Registration error:", error);
        loginError.style.color = "red";
        loginError.textContent = "Connection error. Please try again.";
      }
    });
  }
}
// DASHBOARD PAGE
const isDashboard = Boolean(
  document.getElementById("patientForm") &&
  document.getElementById("apptForm")
);

if (isDashboard) {
  if (!getSessionUser()) {
    window.location.href = "login.html";
  }

  const sessionUser = getSessionUser();
  let patients = [];
  let appointments = [];

  // DOM Elements
  const patientForm = document.getElementById("patientForm");
  const apptForm = document.getElementById("apptForm");
  const patientsList = document.getElementById("patientsList");
  const doctorsList = document.getElementById("doctorsList");
  const appointmentsList = document.getElementById("appointmentsList");
  const patientSelect = document.getElementById("patientSelect");
  const doctorSelect = document.getElementById("doctorSelect");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const logoutBtn = document.getElementById("logoutBtn");
  const aiForm = document.getElementById("aiForm");
  const aiInput = document.getElementById("aiInput");
  const aiMessages = document.getElementById("aiMessages");
  const aiSuggestions = document.getElementById("aiSuggestions");
  const clearAiChatBtn = document.getElementById("clearAiChatBtn");

  function initializeAiChat() {
    if (!aiMessages) return;
    aiMessages.innerHTML = "";
    appendAiMessage(
      "assistant",
      "Hi, I am your Clinic assistant. Ask for summary, today's appointments, or doctor status."
    );
    renderAiSuggestions([
      "Give me a summary",
      "Today's appointments",
      "Doctor status"
    ]);
  }

  function appendAiMessage(role, text) {
    if (!aiMessages) return;
    const item = document.createElement("div");
    item.className = `ai-message ai-message-${role}`;
    item.textContent = text;
    aiMessages.appendChild(item);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function renderAiSuggestions(suggestions) {
    if (!aiSuggestions) return;
    aiSuggestions.innerHTML = "";

    (suggestions || []).forEach((text) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ai-chip";
      chip.textContent = text;
      chip.addEventListener("click", () => {
        if (aiInput) {
          aiInput.value = text;
          aiInput.focus();
        }
      });
      aiSuggestions.appendChild(chip);
    });
  }

  // Load patients from backend
  async function loadPatients() {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (!res.ok) throw new Error("Failed to load patients");
      patients = await res.json();
      render();
    } catch (error) {
      console.error("Error loading patients:", error);
      patientsList.innerHTML = `<li style="color: red;">Error loading patients</li>`;
    }
  }

  // Load appointments from backend
  async function loadAppointments() {
    try {
      const res = await fetch(`${API_BASE}/appointments`);
      if (!res.ok) throw new Error("Failed to load appointments");
      appointments = await res.json();
      render();
    } catch (error) {
      console.error("Error loading appointments:", error);
      appointmentsList.innerHTML = `<li style="color: red;">Error loading appointments</li>`;
    }
  }

  // Render functions
  function render() {
    // Render patients list
    patientsList.innerHTML = patients.length
      ? patients
          .map(
            (p) =>
              `<li class="list-item-row"><span>${p.name} (Age: ${p.age}) - ${p.disease} - Dr. ${p.doctor}</span><button type="button" class="danger-btn" data-patient-id="${p._id}">Remove</button></li>`
          )
          .join("")
      : "<li>No patients yet. Add one to get started.</li>";

    // Populate patient dropdown
    patientSelect.innerHTML =
      '<option value="">Choose patient</option>' +
      patients
        .map((p, i) => `<option value="${p._id || i}">${p.name}</option>`)
        .join("");

    // Extract unique doctors and populate dropdown
    const doctors = [...new Set(patients.map((p) => p.doctor).filter(Boolean))];
    doctorSelect.innerHTML =
      '<option value="">Choose doctor</option>' +
      doctors.map((d) => `<option value="${d}">${d}</option>`).join("");

    if (doctorsList) {
      doctorsList.innerHTML = doctors.length
        ? doctors
            .map((doctorName) => {
              const patientCount = patients.filter((p) => p.doctor === doctorName).length;
              return `<li class="list-item-row"><span>Dr. ${doctorName} (${patientCount} patients)</span><button type="button" class="danger-btn" data-doctor-name="${doctorName}">Remove Doctor</button></li>`;
            })
            .join("")
        : "<li>No doctors yet.</li>";
    }

    // Render appointments list
    appointmentsList.innerHTML = appointments.length
      ? appointments
          .slice()
          .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
          .map((a) =>
            `<li>${a.patientName} → Dr. ${a.doctor} on ${a.date} at ${a.time}</li>`
          )
          .join("")
      : "<li>No appointments scheduled yet.</li>";
  }

  // ADD PATIENT
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      age: parseInt(document.getElementById("age").value) || 0,
      disease: document.getElementById("disease").value.trim(),
      doctor: document.getElementById("doctor").value.trim()
    };

    if (!data.name || !data.disease || !data.doctor) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to add patient");
        return;
      }

      alert(result.message);
      patientForm.reset();
      loadPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Error adding patient. Please try again.");
    }
  });

  // CREATE APPOINTMENT
  apptForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const patientId = patientSelect.value;
    const patient = patients.find(
      (p) => p._id === patientId || patients.indexOf(p) === parseInt(patientId)
    );

    if (!patient) {
      alert("Please select a valid patient");
      return;
    }

    const data = {
      patientName: patient.name,
      doctor: doctorSelect.value,
      date: dateInput.value,
      time: timeInput.value
    };

    if (!data.doctor || !data.date || !data.time) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to create appointment");
        return;
      }

      alert(result.message);
      apptForm.reset();
      loadAppointments();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error creating appointment. Please try again.");
    }
  });

  // REMOVE PATIENT
  if (patientsList) {
    patientsList.addEventListener("click", async (e) => {
      const button = e.target.closest("button[data-patient-id]");
      if (!button) {
        return;
      }

      const patientId = button.dataset.patientId;
      if (!patientId) {
        return;
      }

      const shouldDelete = window.confirm("Remove this patient? Related appointments for this patient will also be removed.");
      if (!shouldDelete) {
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/patients/${patientId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to remove patient");
          return;
        }
        alert(data.message);
        await loadPatients();
        await loadAppointments();
      } catch (error) {
        console.error("Error removing patient:", error);
        alert("Error removing patient. Please try again.");
      }
    });
  }

  // REMOVE DOCTOR
  if (doctorsList) {
    doctorsList.addEventListener("click", async (e) => {
      const button = e.target.closest("button[data-doctor-name]");
      if (!button) {
        return;
      }

      const doctorName = button.dataset.doctorName;
      if (!doctorName) {
        return;
      }

      const shouldDelete = window.confirm(`Remove Dr. ${doctorName}? This will remove all linked patients and appointments.`);
      if (!shouldDelete) {
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/patients/doctor/${encodeURIComponent(doctorName)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to remove doctor");
          return;
        }
        alert(`${data.message}. Removed ${data.removedPatients} patients and ${data.removedAppointments} appointments.`);
        await loadPatients();
        await loadAppointments();
      } catch (error) {
        console.error("Error removing doctor:", error);
        alert("Error removing doctor. Please try again.");
      }
    });
  }

  // LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSessionUser();
      window.location.href = "login.html";
    });
  }

  // AI ASSISTANT
  initializeAiChat();

  if (clearAiChatBtn) {
    clearAiChatBtn.addEventListener("click", () => {
      initializeAiChat();
    });
  }

  if (aiForm && aiInput) {
    aiForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = aiInput.value.trim();
      if (!message) return;

      appendAiMessage("user", message);
      aiInput.value = "";

      try {
        const res = await fetch(`${API_BASE}/ai/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });

        const data = await res.json();
        if (!res.ok) {
          appendAiMessage("assistant", data.message || "I could not process that right now.");
          return;
        }

        appendAiMessage("assistant", data.reply || "No reply available.");
        renderAiSuggestions(data.suggestions);
      } catch (error) {
        console.error("AI assistant request failed:", error);
        appendAiMessage("assistant", "Connection issue while reaching AI assistant.");
      }
    });
  }

  // Initial load
  loadPatients();
  loadAppointments();
}
