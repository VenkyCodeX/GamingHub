require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB().then(autoSeed);

async function autoSeed() {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const count = await Product.countDocuments();
    if (count < 10) {
      console.log('Auto-seeding products...');
      const { execSync } = require('child_process');
      execSync('node ' + path.join(__dirname, 'seed.js'), { stdio: 'inherit' });
    }
  } catch (e) { console.error('Auto-seed error:', e.message); }
}

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
