import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import SeatGrid from '../components/SeatGrid';

function ShowtimeDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Store selected seats in ref so polling doesn't wipe user's current selection
  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  const fetchShowtime = async (isInitial = false) => {
    try {
      const res = await api.get(`/showtimes/${id}`);
      setShowtime(res.data);

      // If any currently selected seat was booked by another user during polling, remove it
      if (!isInitial) {
        const newlyBooked = new Set(
          res.data.seats.filter((s) => s.isBooked).map((s) => s.seatNumber)
        );
        setSelectedSeats((prev) => prev.filter((seatNo) => !newlyBooked.has(seatNo)));
      }
      if (isInitial) setLoading(false);
    } catch (err) {
      if (isInitial) {
        setError(err.response?.data?.message || 'Failed to load showtime');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchShowtime(true);

    // E4 Task 12: Real-time seat availability polling every 3 seconds (no sockets)
    const interval = setInterval(() => {
      fetchShowtime(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleToggleSeat = (seatNumber) => {
    setError('');
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookTickets = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/showtimes/${id}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        showtimeId: id,
        seats: selectedSeats
      });

      setSuccessBooking(res.data.booking);
      setSelectedSeats([]);
      fetchShowtime(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      // Refresh seats to sync booked state
      fetchShowtime(false);
    } finally {
      setBookingLoading(false);
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

  if (!showtime) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Showtime not found'}</div>
        <Link to="/" className="btn btn-secondary">← Back to Movies</Link>
      </div>
    );
  }

  const dateObj = new Date(showtime.dateTime);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  const totalPrice = selectedSeats.length * (showtime.ticketPrice || 12);

  // If successfully booked, show Confirmation View
  if (successBooking) {
    return (
      <div className="container py-5">
        <div className="card max-w-lg mx-auto p-4 border-success text-center">
          <div className="display-4 text-success mb-2">🎉</div>
          <h2 className="text-light fw-bold">Booking Confirmed!</h2>
          <p className="text-secondary">Thank you for booking with IMovies.</p>
          <hr className="border-secondary" />

          <div className="text-start bg-dark p-3 rounded mb-3">
            <h5 className="text-danger fw-bold">{successBooking.showtime?.movie?.title}</h5>
            <p className="mb-1 text-light"><strong>Screen:</strong> {successBooking.showtime?.screen}</p>
            <p className="mb-1 text-light"><strong>Seats:</strong> {successBooking.seats.join(', ')}</p>
            <p className="mb-1 text-light"><strong>Total Paid:</strong> ${successBooking.totalPrice}</p>
            <p className="mb-0 text-light"><strong>Status:</strong> <span className="badge bg-success">Confirmed</span></p>
          </div>

          <div className="d-flex justify-content-center gap-2">
            <Link to="/my-bookings" className="btn btn-danger">
              View My Bookings
            </Link>
            <Link to="/" className="btn btn-outline-light">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
        <div>
          <Link to={`/movies/${showtime.movie?._id}`} className="text-secondary text-decoration-none small">
            ← {showtime.movie?.title}
          </Link>
          <h2 className="text-light fw-bold mb-1">{showtime.movie?.title}</h2>
          <p className="text-info mb-0">
            {showtime.screen} &bull; {formattedDate} at {formattedTime}
          </p>
        </div>
        <div className="text-end mt-2 mt-sm-0">
          <span className="badge bg-danger fs-6">${showtime.ticketPrice || 12} per seat</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Seat Map */}
        <div className="col-lg-8">
          <div className="card p-4">
            <SeatGrid
              seats={showtime.seats || []}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
            />
          </div>
        </div>

        {/* Booking Summary */}
        <div className="col-lg-4">
          <div className="card p-4 sticky-top" style={{ top: '80px' }}>
            <h4 className="text-light fw-bold mb-3">Booking Summary</h4>

            <div className="mb-3">
              <label className="text-secondary small">Selected Seats</label>
              <div className="fs-5 fw-semibold text-warning">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-secondary small">Tickets</label>
              <div className="text-light">{selectedSeats.length} &times; ${showtime.ticketPrice || 12}</div>
            </div>

            <hr className="border-secondary" />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 text-light fw-bold">Total:</span>
              <span className="fs-4 text-success fw-bold">${totalPrice}</span>
            </div>

            {!user && (
              <div className="alert alert-warning small py-2">
                You will need to log in to complete your booking.
              </div>
            )}

            <button
              onClick={handleBookTickets}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className="btn btn-danger w-100 py-2 fw-semibold"
            >
              {bookingLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                `Book ${selectedSeats.length} Seat${selectedSeats.length === 1 ? '' : 's'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowtimeDetail;
