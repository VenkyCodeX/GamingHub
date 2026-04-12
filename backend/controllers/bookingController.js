const Booking = require('../models/Booking');
const Product = require('../models/Product');

exports.create = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    // increment bookingCount for each product
    for (const item of req.body.items || []) {
      if (item.product) await Product.findByIdAndUpdate(item.product, { $inc: { bookingCount: 1 } });
    }
    res.status(201).json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, revenue] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    res.json({ total, pending, revenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getByPhone = async (req, res) => {
  try {
    const bookings = await Booking.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Not found' });
    res.json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
