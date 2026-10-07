# EventLay — MVP Event Management Platform

EventLay is a full-stack MERN (MongoDB, Express, React, Node.js) event management platform built as a deployable MVP. It enables event **Organizers** to host and manage events and **Participants** to browse, register, and generate unique digital QR tickets.

---

## 🚀 MVP Features & Scope

### Roles Included
- **Organizer**: Hosts events, creates draft/published events, edits/deletes owned events, and views participant registration tables.
- **Participant**: Browses published events, views event details, registers for events, and views/downloads unique QR code tickets.

### Core User Loop
1. **Organizer** creates and publishes an event.
2. **Participant** browses published events.
3. **Participant** registers for an event.
4. System generates a unique token (`crypto.randomUUID()`) and server/client-rendered **QR Ticket**.
5. **Participant** views and downloads their QR ticket (PNG).
6. **Organizer** views attendee list under "Event Participants".

### Explicitly Excluded (Out of Scope for MVP)
- Volunteer role
- QR code scanning / check-in validation
- Attendance tracking
- Badge generation / printing
- Reports & Analytics dashboards
- Notifications & Activity logs

---

## 🎨 Design System & Aesthetics
- **Typeface**: Geist / Outfit sans-serif
- **Palette**:
  - **Primary**: Deep Burgundy (`#4A0E17`, `#5C121E`, `#2B070C`)
  - **Secondary**: Warm Amber (`#F59E0B`, `#D97706`)
  - **Highlight**: Coral (`#F43F5E`, `#FB7185`)
  - **Danger States Only**: True Red (`#EF4444`, `#DC2626`)
- **Aesthetics**: Glassmorphism cards, glowing borders, smooth CSS transitions.

---

## 🏗️ Architecture

```
Routes ──> Controllers ──> Services ──> Models ──> MongoDB
```

- **Controllers**: Thin HTTP interface layer, delegating logic to services.
- **Services**: Enforces business logic and event ownership security checks.
- **Models**: Mongoose schemas only (`User`, `Event`, `Registration`).

---

## 📂 Project Structure

```
mvp/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── models/          # User, Event, Registration Mongoose schemas
│   │   ├── middleware/      # JWT requireAuth and requireRole middleware
│   │   ├── services/        # Business logic & QR token generation
│   │   ├── controllers/     # Express route handlers
│   │   ├── routes/          # Express route definitions
│   │   └── server.js        # Express application entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Cards, Glass containers
│   │   ├── context/         # AuthContext (JWT & user state)
│   │   ├── pages/           # Auth, MyEvents, CreateEditEvent, Participants, Browse, Details, Registrations, QRTicket
│   │   ├── services/        # API fetch wrapper
│   │   ├── styles/          # Deep burgundy CSS design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env
│   └── package.json
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventlay?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 📡 API Reference

### Auth
- `POST /api/auth/register` — Register a new account (`organizer` or `participant`).
- `POST /api/auth/login` — Sign in and receive JWT token.

### Events
- `GET /api/events` — Get all published events (Public).
- `GET /api/events/:id` — Get single event by ID (Public).
- `GET /api/events/organizer/mine` — Get organizer's hosted events with registration counts (Organizer only).
- `POST /api/events` — Create a new event (Organizer only).
- `PUT /api/events/:id` — Update event details (Organizer only, owned events).
- `DELETE /api/events/:id` — Delete event (Organizer only, owned events).

### Registrations
- `POST /api/registrations` — Register for an event and generate unique QR token (Participant only).
- `GET /api/registrations/mine` — Get participant's registrations & QR tickets (Participant only).
- `GET /api/events/:id/registrations` — View table of registered attendees for an event (Organizer only, owned events).

---

## ☁️ AWS Deployment Guide

### Backend (Node.js / Express) ➔ AWS App Runner / EC2 / Elastic Beanstalk
1. **Environment Variables**: In AWS App Runner / Elastic Beanstalk configuration, set:
   - `MONGODB_URI`: Connection string to your MongoDB Atlas cloud database cluster.
   - `JWT_SECRET`: A strong secret key for token generation.
   - `PORT`: `5000` or `8080`.
   - `FRONTEND_URL`: Your deployed CloudFront / Amplify domain (e.g. `https://d111111abcdef8.cloudfront.net`).
2. **Build Command**: `npm install`
3. **Start Command**: `npm start` (`node src/server.js`)

### Frontend (Static SPA Build) ➔ AWS Amplify / S3 + CloudFront
1. Build the production static asset bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the contents of `frontend/dist/` to an S3 bucket configured for static web hosting or deploy directly via AWS Amplify connected to Git.
3. Configure `VITE_API_BASE_URL` in Amplify build settings pointing to your backend endpoint (e.g., `https://api.eventlay.com/api`).

## Sprint 8 CI Integration

EventLay now uses Jenkins for continuous integration with GitHub and Docker.