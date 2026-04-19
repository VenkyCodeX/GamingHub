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
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gamingrentalhub.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Always ensure admin user exists
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({ email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('Admin user created');
    }

    // Reseed products if any have base64 images or no products exist
    const products = await Product.find({});
    const hasBase64 = products.some(p => p.image && p.image.startsWith('data:'));
    if (products.length === 0 || hasBase64) {
      console.log('Reseeding products...');
      const { execSync } = require('child_process');
      execSync('node ' + path.join(__dirname, 'seed.js'), { stdio: 'inherit' });
    }
  } catch (e) { console.error('Auto-seed error:', e.message); }
}

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0', timestamp: new Date() }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
