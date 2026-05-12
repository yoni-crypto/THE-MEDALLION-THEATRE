require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { runSchema } = require('./src/schema');
const { seedData } = require('./src/seed');

const authRoutes = require('./src/routes/auth');
const patronRoutes = require('./src/routes/patrons');
const productionRoutes = require('./src/routes/productions');
const performanceRoutes = require('./src/routes/performances');
const ticketRoutes = require('./src/routes/tickets');
const reportRoutes = require('./src/routes/reports');
const statsRoutes = require('./src/routes/stats');
const usersRoutes = require('./src/routes/users');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patrons', patronRoutes);
app.use('/api/productions', productionRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', usersRoutes);

/*
 * init
 * Runs schema creation and seeding once per cold start.
 * Uses a flag so it only runs on the first request in serverless environments.
 */
let initialized = false;
async function init() {
  if (initialized) return;
  initialized = true;
  await runSchema();
  await seedData();
}

app.use((req, res, next) => {
  init().then(next).catch(next);
});

const PORT = process.env.PORT || 4000;

(async () => {
  await init();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

/* Vercel serverless export */
module.exports = app;
