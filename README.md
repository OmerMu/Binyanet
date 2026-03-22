# 🏢 Binyanet – Building Management System

## 📌 Overview

**Binyanet** is a full-stack web application designed to manage residential buildings efficiently.
The system provides a centralized platform for tenants, committee members, business managers, and administrators to handle building operations, communication, payments, and maintenance.

This project was developed as a final academic project in Software Engineering, with a focus on real-world usability, scalability, and clean architecture.

---

## 🚀 Key Features

### 👤 Authentication & Authorization

- User registration with approval system
- Login with JWT authentication
- Role-based access control:
  - Admin
  - Business Manager
  - Committee Member
  - Tenant

---

### 🛠️ Fault Management

- Report building issues (e.g., plumbing, electricity)
- Track status updates
- Add treatment history (e.g., "plumber arrived", "issue unresolved")

---

### 💬 Tenant Chat System

- Real-time-like communication between tenants
- Internal messaging system within the building

---

### 📢 Announcements Board

- Admin / Committee can publish announcements
- Visible to all residents

---

### 💳 Payments System

- Manage building fees
- Prepare for integration with:
  - PayPal
  - Apple Pay
  - Google Pay
  - Bit (planned)

---

### 📊 Business Dashboard

- Analytics for business managers:
  - Fault distribution
  - Performance metrics
  - Future: revenue tracking by city/month

---

### 🧑‍💼 Admin Panel

- Approve / reject new users
- Manage all users (CRUD)
- Assign roles
- View system statistics

---

### 📞 Leads Management (NEW)

- Public lead form (contact form)
- Data saved to MongoDB
- Admin dashboard includes:
  - View all leads
  - Filter & search
  - Update lead status (new / contacted / closed)
  - Delete leads

---

## 🧱 Tech Stack

### Frontend

- React.js
- React Router
- Axios
- TailwindCSS
- Recharts (charts & analytics)

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)

### Authentication

- JWT (JSON Web Token)
- Role-based middleware

---

## 📂 Project Structure

```
binyanet/
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│
├── server/                # Backend (Node + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/OmerMu/Binyanet.git
cd Binyanet
```

---

### 2️⃣ Backend setup

```bash
cd server
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run server:

```bash
npm run dev
```

---

### 3️⃣ Frontend setup

```bash
cd client
npm install
npm start
```

---

## 🌐 API Structure (Main Endpoints)

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Users

```
GET /api/system/users
PATCH /api/system/approve-user/:id
DELETE /api/system/users/:id
```

### Faults

```
POST /api/faults
GET /api/faults
```

### Leads

```
POST /api/leads              # Public form
GET /api/leads               # Admin only
PATCH /api/leads/:id/status
DELETE /api/leads/:id
```

---

## 🔐 Roles & Permissions

| Role      | Permissions         |
| --------- | ------------------- |
| Admin     | Full system control |
| Company   | Business analytics  |
| Committee | Manage building     |
| Tenant    | Report faults, chat |

---

## 🎯 Project Goals

- Simulate a real-world SaaS system
- Implement full CRUD architecture
- Work with authentication & roles
- Build scalable client-server structure
- Practice DevOps workflows (Git, deployment)

---

## 🧠 Future Improvements

- Real payment integration (PayPal / Bit)
- Push notifications
- Mobile optimization (PWA)
- AI-based fault prediction
- Advanced analytics dashboard

---

## 👨‍💻 Developer

**Omer Musay**
Software Engineering Student (3rd Year)
Full Stack Developer (MERN Stack)

---

## 📎 Notes

- The system is designed for educational purposes but follows real-world architecture.
- Built with scalability and modularity in mind.
- Clean separation between frontend and backend.

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to explore or contribute!
