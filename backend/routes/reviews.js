const router = require('express').Router();
const { getByProduct, create } = require('../controllers/reviewController');

router.get('/:productId', getByProduct);
router.post('/:productId', create);

module.exports = router;
