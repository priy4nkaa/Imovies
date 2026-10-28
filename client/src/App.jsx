import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import ShowtimeDetail from './pages/ShowtimeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('imovies_token');
    const storedUser = localStorage.getItem('imovies_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('imovies_user');
      }
    }

    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, []);

  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('imovies_token', token);
    localStorage.setItem('imovies_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
  };

  if (loadingUser) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-dark text-light">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/showtimes/:id" element={<ShowtimeDetail user={user} />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" /> : <Register onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute user={user}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="py-3 border-top border-secondary text-center text-secondary small">
          &copy; {new Date().getFullYear()} IMovies Cinema Platform. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
