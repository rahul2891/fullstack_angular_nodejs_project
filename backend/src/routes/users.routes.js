const express = require('express');
const { listUsers } = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', listUsers);

module.exports = router;
