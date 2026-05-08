# MediTrack Hospital Management

A web-based hospital management system designed for small clinics to efficiently manage patient records, appointments, and daily workflows.

## Features

- **User Authentication**: Secure login and registration using JWT tokens
- **Patient Management**: Add and view patient records with details like name, age, disease, and assigned doctor
- **Appointment Scheduling**: Book and view appointments with date and time tracking
- **AI Assistant**: Query system for patient and appointment information using natural language
- **Responsive Web Interface**: Clean, modern UI for easy navigation

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Other**: CORS for cross-origin requests

## Installation

1. Clone the repository:
   ```
   git clone <https://github.com/anushkaagar3477/MediTrack-Hospital-Management-System>
   cd pbl-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - The application connects to MongoDB Atlas. Ensure you have a valid connection string in `server.js`.
   - Update the connection string if needed.

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:5002`

## Usage

- **Login/Register**: Create an account or log in to access the dashboard.
- **Add Patients**: Use the "Add Patient" section to input patient details.
- **Book Appointments**: Schedule appointments by selecting patient, doctor, date, and time.
- **View Records**: Browse patients and appointments from the respective sections.
- **AI Assistant**: Ask questions like "How many patients does Dr. Smith have?" or "What appointments are today?"

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Patients
- `POST /patients` - Add a new patient
- `GET /patients` - Get all patients
- `GET /patients/exists/name/:name` - Check if patient name exists

### Appointments
- `POST /appointments` - Create a new appointment
- `GET /appointments` - Get all appointments
- `GET /appointments/date/:date` - Get appointments by date

### AI Assistant
- `POST /ai/query` - Query the system with natural language

## Project Structure

```
pbl-project/
├── models/
│   ├── User.js
│   ├── Patient.js
│   └── Appointment.js
├── routes/
│   ├── auth.js
│   ├── patient.js
│   ├── appointment.js
│   └── assistant.js
├── server.js
├── app.js
├── index.html
├── login.html
├── style.css
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact [agarwalanushka007@gmail.com]
