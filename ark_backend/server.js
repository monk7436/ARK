const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const materialsRoutes = require('./routes/materials');
const jobsRoutes = require('./routes/jobs');
const manufacturersRoutes = require('./routes/manufacturers');
const inventoryRoutes = require('./routes/inventory');
const customersRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Increased limit for photo attachments)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/manufacturers', manufacturersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', dashboardRoutes);

// Root Welcome Landing Page
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
      <h1 style="color: #b45309; font-size: 32px;">✨ ARK Jewelry ERP Backend Engine</h1>
      <p style="color: #64748b; font-size: 16px;">Node.js + Neon PostgreSQL API Engine is <strong>ONLINE & HEALTHY 🟢</strong></p>
      <div style="margin-top: 20px;">
        <a href="/api/health" style="background: #d97706; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Check API Health</a>
      </div>
    </div>
  `);
});

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
