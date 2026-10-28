const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// GET all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET movie by id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST create movie
router.post('/', async (req, res) => {
  try {
    const { title, description, genre, duration, poster } = req.body;
    if (!title || !description || !genre || !duration || !poster) {
      return res.status(400).json({ message: 'All movie fields are required' });
    }
    const movie = await Movie.create({ title, description, genre, duration, poster });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
