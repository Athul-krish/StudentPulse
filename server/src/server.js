const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { seedInitialData } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Auto-seed database if empty so demo data is immediately available
  try {
    await seedInitialData();
  } catch (seedErr) {
    console.warn('[SEED WARNING] Auto-seed failed or skipped:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` STUDENTPULSE BACKEND API IS RUNNING ON PORT ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health URL: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
};

startServer();
