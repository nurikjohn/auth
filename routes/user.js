const { Router } = require('express');
const auth = require('../controllers/auth');
const user = require('../controllers/user');

const router = Router();

router.post('/signup', auth.signup, auth.generateToken);
router.post('/login', auth.login, auth.generateToken);
router.post('/logout', auth.protect, auth.logout);

router.get('/me', auth.protect, user.me);
router.get('/sessions', auth.protect, user.sessions);

router.delete('/sessions/:id/terminate', auth.protect, user.terminateSession);
router.delete(
    '/sessions/terminateAll',
    auth.protect,
    user.terminateAllSessions
);

module.exports = router;
