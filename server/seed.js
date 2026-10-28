const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const User = require('./models/User');
const { generateSeats } = require('./routes/showtimes');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/imovies';

const movies = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: 'Sci-Fi / Action',
    duration: 148,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
    genre: 'Sci-Fi / Adventure',
    duration: 169,
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    genre: 'Action / Crime',
    duration: 152,
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: 'Sci-Fi / Adventure',
    duration: 166,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
  }
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await User.deleteMany({ email: 'demo@imovies.com' });

    // Seed Demo User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@imovies.com',
      password: hashedPassword
    });
    console.log('Seeded demo user: demo@imovies.com / password123');

    // Seed Movies
    const createdMovies = await Movie.insertMany(movies);
    console.log(`Seeded ${createdMovies.length} movies`);

    // Seed Showtimes for each movie
    const today = new Date();
    const showtimesToInsert = [];

    createdMovies.forEach((movie) => {
      // 2 showtimes per movie
      const time1 = new Date(today);
      time1.setHours(14, 30, 0, 0);

      const time2 = new Date(today);
      time2.setHours(18, 0, 0, 0);

      const seats1 = generateSeats();
      // Pre-book a couple of seats to test booked status
      seats1[0].isBooked = true; // A1
      seats1[1].isBooked = true; // A2

      const seats2 = generateSeats();
      seats2[4].isBooked = true; // A5

      showtimesToInsert.push({
        movie: movie._id,
        dateTime: time1,
        screen: 'IMAX Screen 1',
        ticketPrice: 15,
        seats: seats1
      });

      showtimesToInsert.push({
        movie: movie._id,
        dateTime: time2,
        screen: 'Standard Screen 3',
        ticketPrice: 12,
        seats: seats2
      });
    });

    await Showtime.insertMany(showtimesToInsert);
    console.log(`Seeded ${showtimesToInsert.length} showtimes`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
