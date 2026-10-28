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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      onLoginSuccess(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger w-100 py-2 fw-semibold"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="text-center mt-3 text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger text-decoration-none">
                Register
              </Link>
            </div>

            <div className="card bg-dark border-secondary p-2 mt-4 text-center">
              <small className="text-secondary">
                Demo Account: <strong>demo@imovies.com</strong> | <strong>password123</strong>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
