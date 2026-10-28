# IMovies 🍿

Online cinema platform to browse movies, pick showtimes, and reserve seats with real-time seat availability.

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, cors, dotenv
- **Frontend:** React, React Router v6, Bootstrap 5, Axios, Vite
- **Testing:** Postman Collection (`postman_collection.json`)

---

## Project Structure
```
imovies/
├─ server/
│  ├─ models/       # User, Movie, Showtime, Booking
│  ├─ routes/       # auth, movies, showtimes, bookings
│  ├─ middleware/   # JWT authentication middleware
│  ├─ server.js     # Express server setup
│  ├─ seed.js       # Database seeder script
│  └─ .env          # Environment variables
├─ client/
│  ├─ src/
│  │  ├─ components/# Navbar, SeatGrid, ProtectedRoute
│  │  ├─ pages/     # Home, MovieDetail, ShowtimeDetail, Login, Register, MyBookings
│  │  ├─ api.js     # Axios client with JWT interceptor
│  │  ├─ App.jsx    # React Router setup
│  │  └─ main.jsx   # Entry point
│  ├─ index.html
│  └─ vite.config.js
└─ postman_collection.json
```

---

## Getting Started

### Prerequisites
- Node.js (≥ 16)
- MongoDB running locally on `mongodb://localhost:27017` (or MongoDB Atlas URI)

---

### 1. Server Setup
```bash
cd server
npm install
```
Configure `.env` if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_secret_key
```

Seed initial movies and showtimes:
```bash
npm run seed
```
> Seeds 4 movies, 8 showtimes, and a demo user (`demo@imovies.com` / `password123`).

Start the server:
```bash
npm run dev
# Server starts on http://localhost:5000
```

---

### 2. Client Setup
Open a second terminal:
```bash
cd client
npm install
npm start
# Client starts on http://localhost:3000
```

---

## Features
- **Authentication:** JWT register & login, protected booking routes, hashed passwords.
- **Movies & Showtimes:** Browse movies, inspect showtime schedules and pricing.
- **Real-time Seats:** Visual seat grid with live polling every 3 seconds for updated availability.
- **Atomic Booking Concurrency:** Guarantees no two users can book the same seat simultaneously.
- **Booking Management:** Review confirmed bookings and cancel reservations to immediately release seats back to the pool.
- **API Collection:** Import `postman_collection.json` directly into Postman to test all REST endpoints.
