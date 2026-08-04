const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const materialsRoutes = require('./routes/materials');
const manufacturersRoutes = require('./routes/manufacturers');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/manufacturers', manufacturersRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ARK Jewelry ERP Backend Engine',
    timestamp: new Date().toISOString(),
    liveMetalRates: {
      gold24k: 7200,
      gold22k: 6850,
      silver999: 88
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ARK Backend API Server running on port ${PORT}`);
  console.log(`👉 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
