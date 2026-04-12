const router = require('express').Router();
const auth = require('../middleware/auth');
const { create, getAll, getStats, getByPhone, updateStatus } = require('../controllers/bookingController');

router.post('/', create);
router.get('/', auth, getAll);
router.get('/stats', auth, getStats);
router.get('/phone/:phone', getByPhone);
router.patch('/:id/status', auth, updateStatus);

module.exports = router;
