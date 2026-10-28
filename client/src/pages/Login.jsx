import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const fillDemoAccount = () => {
    setEmail('demo@imovies.com');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      });
      onLoginSuccess(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card p-4 shadow">
            <h2 className="text-light fw-bold text-center mb-4">Welcome Back</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light">Email address</label>
                <input
                  type="email"
                  className="form-control bg-dark text-light border-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-light">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-light border-secondary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger w-100 py-2 fw-semibold mb-3"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <button
              type="button"
              onClick={fillDemoAccount}
              className="btn btn-outline-info btn-sm w-100 mb-3"
            >
              ⚡ Auto-Fill Demo Credentials (demo@imovies.com)
            </button>

            <div className="text-center text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger text-decoration-none">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
