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

const PORT = process.env.PORT || 4000;

(async () => {
  await runSchema();
  await seedData();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
