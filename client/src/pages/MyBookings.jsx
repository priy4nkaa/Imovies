import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to load bookings'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      setMessage({ type: 'success', text: res.data.message || 'Booking cancelled successfully' });
      fetchBookings();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel booking'
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold mb-4">My Bookings</h2>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-secondary fs-5 mb-3">You don't have any bookings yet.</p>
          <div>
            <Link to="/" className="btn btn-danger">
              Browse Movies & Book Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((b) => {
            const showtime = b.showtime;
            const movie = showtime?.movie;
            const dateObj = showtime ? new Date(showtime.dateTime) : null;
            const formattedDate = dateObj
              ? dateObj.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })
              : 'N/A';
            const formattedTime = dateObj
              ? dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'N/A';

            return (
              <div
                key={b._id}
                className={`card p-3 border-${
                  b.status === 'cancelled' ? 'secondary' : 'dark'
                } bg-dark shadow-sm`}
              >
                <div className="row align-items-center g-3">
                  <div className="col-auto">
                    <img
                      src={movie?.poster || 'https://via.placeholder.com/80x120?text=Movie'}
                      alt={movie?.title || 'Movie'}
                      className="rounded"
                      style={{ width: '80px', height: '110px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="text-light fw-bold mb-0">{movie?.title || 'Unknown Movie'}</h5>
                      <span
                        className={`badge ${
                          b.status === 'confirmed' ? 'bg-success' : 'bg-secondary'
                        } text-uppercase`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-secondary small mb-2">
                      {showtime?.screen} &bull; {formattedDate} at {formattedTime}
                    </div>
                    <div className="text-light">
                      <strong>Seats:</strong>{' '}
                      <span className="text-warning fw-semibold">{b.seats.join(', ')}</span>
                      <span className="ms-3">
                        <strong>Total:</strong> ${b.totalPrice}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-auto text-md-end">
                    {b.status === 'confirmed' ? (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                        className="btn btn-outline-danger btn-sm"
                      >
                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    ) : (
                      <span className="text-muted small">Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
