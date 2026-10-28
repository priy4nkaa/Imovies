const express = require('express');
const router = express.Router({ mergeParams: true });
const Showtime = require('../models/Showtime');

// Helper to generate default seat layout if needed (e.g. Rows A-E, 1-8 => 40 seats)
function generateSeats() {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seats = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 8; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: false
      });
    }
  });
  return seats;
}

// GET showtimes by movie ID (when accessed via /api/movies/:movieId/showtimes or /api/showtimes?movieId=...)
router.get('/', async (req, res) => {
  try {
    const movieId = req.params.movieId || req.query.movieId;
    const filter = movieId ? { movie: movieId } : {};
    const showtimes = await Showtime.find(filter).populate('movie').sort({ dateTime: 1 });
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET showtime by ID (for real-time seat polling & seat-selection)
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST create showtime
router.post('/', async (req, res) => {
  try {
    const { movie, dateTime, screen, ticketPrice, seats } = req.body;
    if (!movie || !dateTime || !screen) {
      return res.status(400).json({ message: 'Movie, dateTime, and screen are required' });
    }

    const showtimeSeats = seats && seats.length > 0 ? seats : generateSeats();

    const showtime = await Showtime.create({
      movie,
      dateTime,
      screen,
      ticketPrice: ticketPrice || 12,
      seats: showtimeSeats
    });

    res.status(201).json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
module.exports.generateSeats = generateSeats;
