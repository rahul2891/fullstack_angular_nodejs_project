const express = require('express')
const { register, login, refresh, me } = require('../controllers/auth.controller')
const router = express.Router();

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/me', me)

module.exports = router;