const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const authMiddleware = require('../middleware/auth');

// POST /api/bookings (auth): atomically check and book seats
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'showtimeId and non-empty seats array are required' });
    }

    // Check showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Atomic update: ensure none of the requested seats are already booked
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: seats },
              isBooked: true
            }
          }
        }
      },
      {
        $set: {
          'seats.$[elem].isBooked': true
        }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seats } }],
        new: true
      }
    );

    if (!updatedShowtime) {
      return res.status(400).json({
        message: 'One or more selected seats are already booked. Please choose other seats.'
      });
    }

    const totalPrice = seats.length * (showtime.ticketPrice || 12);

    const booking = await Booking.create({
      user: req.user.id,
      showtime: showtimeId,
      seats,
      totalPrice,
      status: 'confirmed'
    });

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtime',
      populate: { path: 'movie' }
    });

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/bookings/me (auth): get user's bookings
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE /api/bookings/:id (cancel -> free seats)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Free the seats in Showtime
    await Showtime.updateOne(
      { _id: booking.showtime },
      {
        $set: {
          'seats.$[elem].isBooked': false
        }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: booking.seats } }]
      }
    );

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
