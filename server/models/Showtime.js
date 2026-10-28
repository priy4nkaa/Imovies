const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    dateTime: { type: Date, required: true },
    screen: { type: String, required: true },
    ticketPrice: { type: Number, default: 12 },
    seats: [seatSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
