const router = require('express').Router();
const { login } = require('../controllers/authController');
const auth = require('../middleware/auth');
router.post('/login', login);
router.get('/verify', auth, (req, res) => res.json({ ok: true, role: req.user.role }));
module.exports = router;
