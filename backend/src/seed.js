const bcrypt = require('bcryptjs');
const pool = require('./db');

function generateSeats() {
  const seats = [];

  const orchestra = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (const row of orchestra) {
    for (let i = 1; i <= 30; i++) {
      seats.push({ number: `${row}${i}`, category: 'Orchestra', price: 65.00 });
    }
  }

  const mezzanine = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  for (const row of mezzanine) {
    for (let i = 1; i <= 30; i++) {
      seats.push({ number: `${row}${i}`, category: 'Mezzanine', price: 55.00 });
    }
  }

  const balconyCounts = { AA: 30, BB: 30, CC: 30, DD: 28, EE: 24, FF: 24 };
  for (const [row, count] of Object.entries(balconyCounts)) {
    for (let i = 1; i <= count; i++) {
      seats.push({ number: `${row}${i}`, category: 'Balcony', price: 40.00 });
    }
  }

  for (let i = 1; i <= 16; i++) {
    seats.push({ number: `X${i}`, category: 'Box', price: 85.00 });
  }

  return seats;
}

async function seedData() {
  const { rows: existingSeats } = await pool.query('SELECT 1 FROM seat LIMIT 1');
  if (existingSeats.length === 0) {
    const seats = generateSeats();
    for (const seat of seats) {
      await pool.query(
        'INSERT INTO seat (seatnumber, seatcategory, price) VALUES ($1, $2, $3)',
        [seat.number, seat.category, seat.price]
      );
    }
    console.log(`Seeded ${seats.length} seats`);
  }

  const { rows: existingUsers } = await pool.query('SELECT 1 FROM users LIMIT 1');
  if (existingUsers.length === 0) {
    const managerHash = await bcrypt.hash('admin123', 10);
    const clerkHash = await bcrypt.hash('clerk123', 10);
    await pool.query(
      'INSERT INTO users (username, passwordhash, role) VALUES ($1, $2, $3)',
      ['admin', managerHash, 'manager']
    );
    await pool.query(
      'INSERT INTO users (username, passwordhash, role) VALUES ($1, $2, $3)',
      ['clerk', clerkHash, 'clerk']
    );
    console.log('Seeded default admin and clerk users');
  }
}

module.exports = { seedData };
