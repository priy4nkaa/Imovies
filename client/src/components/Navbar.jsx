import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-secondary">
      <div className="container">
        <Link className="navbar-brand fw-bold text-danger fs-3" to="/">
          🍿 IMovies
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Movies
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings">
                  My Bookings
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-light me-2">Hi, <strong>{user.name}</strong></span>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-danger btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
