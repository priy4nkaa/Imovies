const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    poster: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
