const Review = require('../models/Review');

exports.getByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, product: req.params.productId });
    res.status(201).json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
