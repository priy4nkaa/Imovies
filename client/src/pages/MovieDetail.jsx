import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/movies/${id}/showtimes`)
    ])
      .then(([movieRes, showtimesRes]) => {
        setMovie(movieRes.data);
        setShowtimes(showtimesRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Movie not found'}</div>
        <Link to="/" className="btn btn-secondary">← Back to Movies</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4 mb-5">
        <div className="col-md-4 text-center">
          <img
            src={movie.poster}
            alt={movie.title}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '450px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400?text=No+Poster';
            }}
          />
        </div>
        <div className="col-md-8">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-danger">{movie.genre}</span>
            <span className="text-secondary">•</span>
            <span className="text-secondary">{movie.duration} mins</span>
          </div>
          <h1 className="display-5 fw-bold text-light mb-3">{movie.title}</h1>
          <p className="lead text-light mb-4">{movie.description}</p>

          <hr className="border-secondary my-4" />

          <h3 className="h4 text-light mb-3">Available Showtimes</h3>
          {showtimes.length === 0 ? (
            <p className="text-secondary">No showtimes currently scheduled for this movie.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 g-3">
              {showtimes.map((st) => {
                const dateObj = new Date(st.dateTime);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const availableSeats = st.seats?.filter((s) => !s.isBooked).length || 0;

                return (
                  <div key={st._id} className="col">
                    <div className="card p-3 border-secondary bg-dark text-light h-100">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold mb-1 text-info">{st.screen}</h6>
                          <div className="fs-5 fw-semibold">{formattedTime}</div>
                          <small className="text-secondary">{formattedDate}</small>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-success mb-1">${st.ticketPrice || 12}</span>
                          <div>
                            <small className="text-secondary">{availableSeats} seats left</small>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/showtimes/${st._id}`}
                        className="btn btn-outline-danger btn-sm mt-3 w-100"
                      >
                        Select Seats
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
