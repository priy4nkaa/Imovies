import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Register({ onLoginSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password });
      onLoginSuccess(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card p-4 shadow">
            <h2 className="text-light fw-bold text-center mb-4">Create Account</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-light">Email address</label>
                <input
                  type="email"
                  className="form-control bg-dark text-light border-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-light">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-light border-secondary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger w-100 py-2 fw-semibold"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="text-center mt-3 text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-danger text-decoration-none">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
