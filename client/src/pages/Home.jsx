import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/movies')
      .then((res) => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load movies');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-light">Now Showing</h1>
          <p className="text-secondary mb-0">Select a movie to check available showtimes and book your seats.</p>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {movies.map((movie) => (
          <div key={movie._id} className="col">
            <div className="card movie-card h-100 shadow-sm">
              <img
                src={movie.poster}
                className="card-img-top"
                alt={movie.title}
                style={{ height: '320px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Poster';
                }}
              />
              <div className="card-body d-flex flex-column">
                <span className="badge bg-secondary mb-2 align-self-start">{movie.genre}</span>
                <h5 className="card-title text-light fw-bold">{movie.title}</h5>
                <p className="card-text text-secondary small flex-grow-1">
                  {movie.description.length > 90
                    ? `${movie.description.substring(0, 90)}...`
                    : movie.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
                  <small className="text-secondary">⏱️ {movie.duration} mins</small>
                  <Link to={`/movies/${movie._id}`} className="btn btn-danger btn-sm">
                    Book Tickets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
