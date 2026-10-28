import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imovies_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo fallback data when backend is not running or on static host (GitHub Pages)
const DEMO_MOVIES = [
  {
    _id: 'm1',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: 'Sci-Fi / Action',
    duration: 148,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: 'm2',
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
    genre: 'Sci-Fi / Adventure',
    duration: 169,
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: 'm3',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    genre: 'Action / Crime',
    duration: 152,
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: 'm4',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: 'Sci-Fi / Adventure',
    duration: 166,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
  }
];

function generateSeats() {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seats = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 8; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: row === 'A' && (i === 1 || i === 2)
      });
    }
  });
  return seats;
}

const getStoredShowtimes = () => {
  const stored = localStorage.getItem('imovies_demo_showtimes');
  if (stored) return JSON.parse(stored);

  const showtimes = [];
  DEMO_MOVIES.forEach((movie) => {
    const today = new Date();
    const t1 = new Date(today.setHours(14, 30, 0, 0));
    const t2 = new Date(today.setHours(18, 0, 0, 0));

    showtimes.push({
      _id: `st_${movie._id}_1`,
      movie,
      dateTime: t1.toISOString(),
      screen: 'IMAX Screen 1',
      ticketPrice: 15,
      seats: generateSeats()
    });

    showtimes.push({
      _id: `st_${movie._id}_2`,
      movie,
      dateTime: t2.toISOString(),
      screen: 'Standard Screen 3',
      ticketPrice: 12,
      seats: generateSeats()
    });
  });

  localStorage.setItem('imovies_demo_showtimes', JSON.stringify(showtimes));
  return showtimes;
};

// Response interceptor: graceful fallback to demo data if backend is offline / static host
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response || error.response.status === 404;

    if (isNetworkError) {
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();

      // Auth me
      if (url.includes('/auth/me')) {
        const storedUser = localStorage.getItem('imovies_user');
        if (storedUser) {
          return Promise.resolve({ data: { user: JSON.parse(storedUser) } });
        }
      }

      // Auth login
      if (url.includes('/auth/login')) {
        const demoUser = { id: 'u1', name: 'Demo User', email: 'demo@imovies.com' };
        return Promise.resolve({
          data: { token: 'demo_token_123', user: demoUser }
        });
      }

      // Auth register
      if (url.includes('/auth/register')) {
        const body = JSON.parse(error.config?.data || '{}');
        const user = { id: `u_${Date.now()}`, name: body.name || 'User', email: body.email };
        return Promise.resolve({
          data: { token: 'demo_token_123', user }
        });
      }

      // Movies list
      if (url === '/movies' || url === '/movies/') {
        return Promise.resolve({ data: DEMO_MOVIES });
      }

      // Single movie
      if (url.startsWith('/movies/') && !url.includes('/showtimes')) {
        const id = url.replace('/movies/', '');
        const movie = DEMO_MOVIES.find((m) => m._id === id) || DEMO_MOVIES[0];
        return Promise.resolve({ data: movie });
      }

      // Movie showtimes
      if (url.includes('/movies/') && url.includes('/showtimes')) {
        const parts = url.split('/');
        const movieId = parts[2];
        const all = getStoredShowtimes();
        const showtimes = all.filter((s) => s.movie._id === movieId);
        return Promise.resolve({ data: showtimes });
      }

      // Single showtime
      if (url.startsWith('/showtimes/')) {
        const stId = url.replace('/showtimes/', '');
        const all = getStoredShowtimes();
        const found = all.find((s) => s._id === stId) || all[0];
        return Promise.resolve({ data: found });
      }

      // Bookings: POST
      if (url.includes('/bookings') && method === 'post') {
        const body = JSON.parse(error.config?.data || '{}');
        const all = getStoredShowtimes();
        const stIndex = all.findIndex((s) => s._id === body.showtimeId);
        if (stIndex !== -1) {
          body.seats?.forEach((seatNo) => {
            const seat = all[stIndex].seats.find((s) => s.seatNumber === seatNo);
            if (seat) seat.isBooked = true;
          });
          localStorage.setItem('imovies_demo_showtimes', JSON.stringify(all));
        }

        const showtime = all[stIndex] || all[0];
        const newBooking = {
          _id: `b_${Date.now()}`,
          showtime,
          seats: body.seats || [],
          totalPrice: (body.seats?.length || 0) * (showtime.ticketPrice || 12),
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };

        const existingBookings = JSON.parse(localStorage.getItem('imovies_demo_bookings') || '[]');
        existingBookings.unshift(newBooking);
        localStorage.setItem('imovies_demo_bookings', JSON.stringify(existingBookings));

        return Promise.resolve({
          data: { message: 'Booking confirmed successfully', booking: newBooking }
        });
      }

      // Bookings: GET me
      if (url.includes('/bookings/me')) {
        const bookings = JSON.parse(localStorage.getItem('imovies_demo_bookings') || '[]');
        return Promise.resolve({ data: bookings });
      }

      // Bookings: DELETE cancel
      if (url.includes('/bookings/') && method === 'delete') {
        const bId = url.split('/bookings/')[1];
        const bookings = JSON.parse(localStorage.getItem('imovies_demo_bookings') || '[]');
        const target = bookings.find((b) => b._id === bId);
        if (target) {
          target.status = 'cancelled';
          localStorage.setItem('imovies_demo_bookings', JSON.stringify(bookings));

          const all = getStoredShowtimes();
          const st = all.find((s) => s._id === target.showtime?._id);
          if (st) {
            target.seats?.forEach((seatNo) => {
              const seat = st.seats.find((s) => s.seatNumber === seatNo);
              if (seat) seat.isBooked = false;
            });
            localStorage.setItem('imovies_demo_showtimes', JSON.stringify(all));
          }
        }
        return Promise.resolve({ data: { message: 'Booking cancelled successfully' } });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
