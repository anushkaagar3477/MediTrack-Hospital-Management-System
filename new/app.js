const AUTH_KEY = "lite_auth";
const USERS_KEY = "lite_users";

function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getUsers() {
  return readJSON(localStorage, USERS_KEY, []);
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessionUser() {
  return readJSON(sessionStorage, AUTH_KEY, null);
}

function setSessionUser(user) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  sessionStorage.removeItem(AUTH_KEY);
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegisterBtn");

if (loginForm) {
  if (getSessionUser()) {
    window.location.href = "index.html";
  }

  const loginError = document.getElementById("loginError");
  const registerRole = document.getElementById("registerRole");
  const registerDoctorName = document.getElementById("registerDoctorName");

  function toggleDoctorNameField() {
    if (!registerRole || !registerDoctorName) {
      return;
    }
    const isDoctorRole = registerRole.value === "doctor";
    registerDoctorName.classList.toggle("is-hidden", !isDoctorRole);
    registerDoctorName.required = isDoctorRole;
  }

  if (showRegisterBtn && registerForm) {
    showRegisterBtn.addEventListener("click", () => {
      registerForm.classList.toggle("is-hidden");
      toggleDoctorNameField();
    });
  }

  if (registerRole) {
    registerRole.addEventListener("change", toggleDoctorNameField);
    toggleDoctorNameField();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.style.color = "#b42318";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const matched = getUsers().find((u) => u.username === username && u.password === password);

    if (!matched) {
      loginError.textContent = "Invalid details. Please enter registered credentials.";
      return;
    }

    setSessionUser({
      username: matched.username,
      role: matched.role || "staff",
      doctorName: matched.doctorName || matched.username,
    });
    window.location.href = "index.html";
  });

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginError.style.color = "#b42318";

      const username = document.getElementById("registerUsername").value.trim();
      const role = (document.getElementById("registerRole") || { value: "staff" }).value;
      const doctorName = (document.getElementById("registerDoctorName") || { value: "" }).value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!username || !password) {
        loginError.textContent = "Username and password are required.";
        return;
      }
      if (password !== confirmPassword) {
        loginError.textContent = "Passwords do not match.";
        return;
      }
      if (role === "doctor" && !doctorName) {
        loginError.textContent = "Doctor display name is required for doctor login.";
        return;
      }

      const users = getUsers();
      const alreadyExists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
      if (alreadyExists) {
        loginError.textContent = "Username already registered. Please sign in.";
        return;
      }

      users.push({ username, password, role, doctorName });
      saveUsers(users);
      registerForm.reset();
      registerForm.classList.add("is-hidden");
      toggleDoctorNameField();
      loginError.style.color = "#0f766e";
      loginError.textContent = "Registration successful. Please sign in.";
    });
  }
}

const isDashboard = Boolean(document.getElementById("patientForm") && document.getElementById("apptForm"));
if (isDashboard && !getSessionUser()) {
  window.location.href = "login.html";
}

if (isDashboard) {
  const sessionUser = getSessionUser();
  const patients = readJSON(localStorage, "lite_patients", []);
  const doctors = readJSON(localStorage, "lite_doctors", []);
  const appointmentsRaw = readJSON(localStorage, "lite_appointments", []);

  let mutated = false;
  const appointments = appointmentsRaw.map((a, index) => {
    const updated = {
      id: a.id || index + 1,
      patient: a.patient || "Unknown patient",
      doctor: a.doctor || "Unknown doctor",
      date: a.date || "",
      time: a.time || "09:00",
      status: a.status || "scheduled",
      notes: a.notes || "",
    };
    if (!a.id || !a.time || !a.status || typeof a.notes !== "string") {
      mutated = true;
    }
    return updated;
  });

  const patientForm = document.getElementById("patientForm");
  const doctorForm = document.getElementById("doctorForm");
  const apptForm = document.getElementById("apptForm");
  const patientsList = document.getElementById("patientsList");
  const doctorsList = document.getElementById("doctorsList");
  const appointmentsList = document.getElementById("appointmentsList");
  const patientSelect = document.getElementById("patientSelect");
  const doctorSelect = document.getElementById("doctorSelect");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const logoutBtn = document.getElementById("logoutBtn");
  const doctorTodayNav = document.querySelector('a[href="#doctor-today"]');
  const doctorTodaySection = document.getElementById("doctor-today");
  const doctorTodayTitle = document.getElementById("doctorTodayTitle");
  const doctorTodayList = document.getElementById("doctorTodayList");

  function saveData() {
    localStorage.setItem("lite_patients", JSON.stringify(patients));
    localStorage.setItem("lite_doctors", JSON.stringify(doctors));
    localStorage.setItem("lite_appointments", JSON.stringify(appointments));
  }

  function nextAppointmentId() {
    return appointments.length ? Math.max(...appointments.map((a) => a.id)) + 1 : 1;
  }

  function renderDoctorToday() {
    if (!doctorTodaySection || !doctorTodayList || !doctorTodayTitle) {
      return;
    }

    const isDoctorUser = sessionUser && sessionUser.role === "doctor";
    doctorTodaySection.classList.toggle("is-hidden", !isDoctorUser);
    if (doctorTodayNav) {
      doctorTodayNav.classList.toggle("is-hidden", !isDoctorUser);
    }
    if (!isDoctorUser) {
      return;
    }

    const doctorName = (sessionUser.doctorName || sessionUser.username || "").toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    const todaysAppointments = appointments
      .filter((a) => a.date === today && a.doctor.toLowerCase() === doctorName)
      .sort((a, b) => a.time.localeCompare(b.time));

    doctorTodayTitle.textContent = `Logged in as Dr. ${sessionUser.doctorName || sessionUser.username}`;

    doctorTodayList.innerHTML = todaysAppointments.length
      ? todaysAppointments
          .map(
            (a) => `
              <div class="doctor-appt-card" data-id="${a.id}">
                <p><strong>${a.patient}</strong> at ${a.time}</p>
                <label>
                  Status
                  <select class="doctor-status" data-id="${a.id}">
                    <option value="scheduled" ${a.status === "scheduled" ? "selected" : ""}>Scheduled</option>
                    <option value="completed" ${a.status === "completed" ? "selected" : ""}>Completed</option>
                    <option value="rescheduled" ${a.status === "rescheduled" ? "selected" : ""}>Rescheduled</option>
                  </select>
                </label>
                <div class="doctor-row">
                  <input class="reschedule-date" data-id="${a.id}" type="date" value="${a.date}">
                  <input class="reschedule-time" data-id="${a.id}" type="time" value="${a.time}">
                </div>
                <textarea class="doctor-notes" data-id="${a.id}" rows="2" placeholder="Add notes">${a.notes}</textarea>
                <div class="doctor-actions">
                  <button type="button" class="small-btn mark-completed" data-id="${a.id}">Mark Completed</button>
                  <button type="button" class="small-btn mark-rescheduled" data-id="${a.id}">Reschedule</button>
                  <button type="button" class="small-btn save-notes" data-id="${a.id}">Save Notes</button>
                </div>
              </div>
            `
          )
          .join("")
      : "<p class=\"login-hint\">No appointments for today.</p>";
  }

  function render() {
    patientsList.innerHTML = patients.length
      ? patients.map((p) => `<li>${p.name}${p.contact ? ` - ${p.contact}` : ""}</li>`).join("")
      : "<li>No patients yet.</li>";

    patientSelect.innerHTML = '<option value="">Choose patient</option>' + patients.map((p, i) => `<option value="${i}">${p.name}</option>`).join("");
    doctorsList.innerHTML = doctors.length ? doctors.map((d) => `<li>${d.name} - ${d.speciality}</li>`).join("") : "<li>No doctors yet.</li>";
    doctorSelect.innerHTML = '<option value="">Choose doctor</option>' + doctors.map((d, i) => `<option value="${i}">${d.name} (${d.speciality})</option>`).join("");

    appointmentsList.innerHTML = appointments.length
      ? appointments
          .slice()
          .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
          .map((a) => `<li>${a.patient} with ${a.doctor} on ${a.date} at ${a.time} (${a.status})</li>`)
          .join("")
      : "<li>No appointments yet.</li>";

    renderDoctorToday();
  }

  patientForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    if (!name) {
      return;
    }
    patients.push({ name, contact });
    patientForm.reset();
    saveData();
    render();
  });

  doctorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("doctorName").value.trim();
    const speciality = document.getElementById("speciality").value.trim();
    if (!name || !speciality) {
      return;
    }
    doctors.push({ name, speciality });
    doctorForm.reset();
    saveData();
    render();
  });

  apptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const patientIdx = patientSelect.value;
    const doctorIdx = doctorSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    if (patientIdx === "" || doctorIdx === "" || !date || !time) {
      return;
    }
    appointments.push({
      id: nextAppointmentId(),
      patient: patients[patientIdx].name,
      doctor: doctors[doctorIdx].name,
      date,
      time,
      status: "scheduled",
      notes: "",
    });
    apptForm.reset();
    saveData();
    render();
  });

  if (doctorTodayList) {
    doctorTodayList.addEventListener("change", (e) => {
      const statusSelect = e.target.closest(".doctor-status");
      if (!statusSelect) {
        return;
      }
      const id = Number(statusSelect.dataset.id);
      const appt = appointments.find((a) => a.id === id);
      if (!appt) {
        return;
      }
      appt.status = statusSelect.value;
      saveData();
      render();
    });

    doctorTodayList.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) {
        return;
      }
      const id = Number(button.dataset.id);
      const appt = appointments.find((a) => a.id === id);
      if (!appt) {
        return;
      }

      if (button.classList.contains("mark-completed")) {
        appt.status = "completed";
      }

      if (button.classList.contains("mark-rescheduled")) {
        const dateEl = doctorTodayList.querySelector(`.reschedule-date[data-id="${id}"]`);
        const timeEl = doctorTodayList.querySelector(`.reschedule-time[data-id="${id}"]`);
        if (dateEl && timeEl && dateEl.value && timeEl.value) {
          appt.date = dateEl.value;
          appt.time = timeEl.value;
          appt.status = "rescheduled";
        }
      }

      if (button.classList.contains("save-notes")) {
        const notesEl = doctorTodayList.querySelector(`.doctor-notes[data-id="${id}"]`);
        if (notesEl) {
          appt.notes = notesEl.value.trim();
        }
      }

      saveData();
      render();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSessionUser();
      window.location.href = "login.html";
    });
  }

  if (mutated) {
    saveData();
  }
  render();
}
