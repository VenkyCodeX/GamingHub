require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  { name: 'PS5 + Games (100+) + 1 Controller', category: 'PS5 Console', price: 2999, trending: true, bookingCount: 271, description: 'PlayStation 5 with 100+ games and 1 DualSense controller', image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400' },
  { name: 'PS5 All in one Combo + 2 Controllers', category: 'PS5 Console', price: 3499, trending: true, bookingCount: 364, description: 'PS5 with 2 DualSense controllers and 100+ games', image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400' },
  { name: 'PS5 + Games (100+) + 2 Controllers', category: 'PS5 Console', price: 3299, trending: true, bookingCount: 198, image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400' },
  { name: 'PS5 + Spider-Man + 1 Controller', category: 'PS5 Games', price: 2799, trending: false, bookingCount: 145, image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400' },
  { name: 'Xbox Series X + 2 Controllers', category: 'Xbox Console', price: 2499, trending: true, bookingCount: 189, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400' },
  { name: 'Nintendo Switch + 2 Games', category: 'Xbox Console', price: 1999, trending: true, bookingCount: 221, image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400' },
  { name: 'Oculus Quest 3S', category: 'VR', price: 1999, trending: true, bookingCount: 239, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400' },
  { name: 'Oculus Quest 2', category: 'VR', price: 1499, trending: true, bookingCount: 276, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400' },
  { name: 'Logitech G29 Racing Wheel', category: 'Racing Wheel', price: 1799, trending: true, bookingCount: 156, image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400' },
  { name: 'Thrustmaster T300RS Racing Wheel', category: 'Racing Wheel', price: 2199, trending: false, bookingCount: 89, image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400' },
  { name: 'Epson EB-X51 Projector', category: 'Projectors', price: 1499, trending: true, bookingCount: 112, image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
  { name: 'BenQ TH585P Projector', category: 'Projectors', price: 1799, trending: false, bookingCount: 78, image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
  { name: 'Sony SRS-XP500 Wireless Speaker', category: 'Speakers', price: 999, trending: true, bookingCount: 339, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
  { name: 'JBL PartyBox 110 Speaker', category: 'Speakers', price: 1199, trending: true, bookingCount: 267, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
  { name: 'Speaker & Mic Combo', category: 'Speakers', price: 1299, trending: true, bookingCount: 308, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
  { name: 'Blue Yeti USB Microphone', category: 'Mics', price: 799, trending: false, bookingCount: 98, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400' },
  { name: 'HyperX QuadCast Microphone', category: 'Mics', price: 899, trending: true, bookingCount: 134, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400' },
  { name: 'Women Riding Jacket - Level 2', category: 'Riding Gear', price: 599, trending: true, bookingCount: 230, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: 'Riding Pant for Men and Women', category: 'Riding Gear', price: 299, trending: true, bookingCount: 167, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: 'TREK 100 Trekking Shoes - Women\'s', category: 'Trekking Shoes', price: 399, trending: true, bookingCount: 184, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: 'Trek100 Trekking Shoes - Men', category: 'Trekking Shoes', price: 399, trending: true, bookingCount: 201, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: 'Camping Tent - 4 Person', category: 'Camping Gear', price: 499, trending: false, bookingCount: 134, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400' },
  { name: 'Trekking Backpack 50L', category: 'Trekking Gear', price: 349, trending: true, bookingCount: 178, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
  { name: 'Snow Boots - Unisex', category: 'Snow Boots', price: 449, trending: false, bookingCount: 67, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gamingrentalhub.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({ email: adminEmail, password: adminPassword, role: 'admin' });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
