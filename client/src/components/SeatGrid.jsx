import React from 'react';

function SeatGrid({ seats, selectedSeats, onToggleSeat }) {
  // Group seats by row (e.g. A, B, C...)
  const rows = {};
  seats.forEach((seat) => {
    const rowLetter = seat.seatNumber.charAt(0);
    if (!rows[rowLetter]) rows[rowLetter] = [];
    rows[rowLetter].push(seat);
  });

  return (
    <div className="d-flex flex-column align-items-center my-4">
      <div className="w-100 text-center mb-4">
        <div className="screen-indicator mx-auto" style={{ maxWidth: '400px' }}></div>
        <small className="text-secondary text-uppercase tracking-wider">Screen</small>
      </div>

      <div className="d-flex flex-column gap-2">
        {Object.keys(rows).map((rowLetter) => (
          <div key={rowLetter} className="d-flex align-items-center justify-content-center gap-1">
            <span className="text-secondary fw-bold me-2" style={{ width: '20px' }}>
              {rowLetter}
            </span>
            {rows[rowLetter].map((seat) => {
              const isSelected = selectedSeats.includes(seat.seatNumber);
              let seatClass = 'seat-available';
              if (seat.isBooked) seatClass = 'seat-booked';
              else if (isSelected) seatClass = 'seat-selected';

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  disabled={seat.isBooked}
                  onClick={() => onToggleSeat(seat.seatNumber)}
                  className={`seat-btn ${seatClass}`}
                  title={seat.isBooked ? `${seat.seatNumber} (Booked)` : seat.seatNumber}
                >
                  {seat.seatNumber.slice(1)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="d-flex justify-content-center gap-4 mt-4 text-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-available" style={{ width: 22, height: 22 }}></div>
          <small className="text-light">Available</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-selected" style={{ width: 22, height: 22 }}></div>
          <small className="text-light">Selected</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-booked" style={{ width: 22, height: 22 }}></div>
          <small className="text-light">Booked</small>
        </div>
      </div>
    </div>
  );
}

export default SeatGrid;
