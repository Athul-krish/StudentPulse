const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const riskRoutes = require('./routes/riskRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'StudentPulse-Express-Backend',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
