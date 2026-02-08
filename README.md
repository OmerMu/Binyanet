# 🏢 Binyanet – Building Management System

Binyanet is a full-stack web application for managing residential buildings.
The system allows tenants and administrators to manage building-related operations such as fault reports, announcements, and future payment management.

This project was developed as a **final project (Project גמר)** for the MAHAT Software Engineering program.

---

## ✨ Features

### 👤 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Role-based access control (Admin / Tenant)
- Google reCAPTCHA integration for login security

### 🛠 Fault Management (Issues)

- Tenants can open fault reports
- View personal fault history
- Admin can view all faults
- Admin can update fault status and add notes
- Fault statuses: `open`, `in_progress`, `closed`

### 📊 Admin Dashboard

- Overview of all reported faults
- Management actions available only to admins

---

## 🧱 Project Structure

```
Binyanet/
├── client/        # React frontend
├── server/        # Node.js + Express backend
├── package.json   # Root scripts
├── .gitignore
└── README.md
```

---

## 🛠 Technologies Used

### Frontend

- React
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT (JSON Web Tokens)

### Dev Tools

- Git & GitHub
- Concurrently
- Nodemon

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RECAPTCHA_SECRET=your_recaptcha_secret_key
```

### Client (`client/.env`)

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

> ⚠️ Do not upload `.env` files to GitHub.
> Use `.env.example` files for sharing configuration structure.

---

## ▶️ Installation & Running the Project

### 1️⃣ Clone the repository

```
git clone https://github.com/OmerMu/Binyanet.git
cd Binyanet
```

### 2️⃣ Install dependencies

```
npm run install:all
```

### 3️⃣ Run the project (Client + Server)

```
npm run dev
```

- Client: [http://localhost:3000](http://localhost:3000)
- Server: [http://localhost:5000](http://localhost:5000)

---

## 👥 Team Collaboration Guidelines

- `main` branch is always stable
- New features should be developed in `feature/*` branches
- Use Pull Requests before merging to `main`
- Do not commit `.env` or `node_modules`

---

## 🚀 Future Enhancements

- File/image upload for fault reports
- Announcements board
- Payment management module
- Real-time notifications
- Analytics dashboard

---

## 👨‍💻 Author

**Omer Musai**
Software Engineering Student – MAHAT
GitHub: [https://github.com/OmerMu](https://github.com/OmerMu)
