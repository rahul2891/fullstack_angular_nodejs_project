const express = require('express')
const { db } = require('../data/db')
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { listProjects, getProject, createProject } = require('../controllers/projects.controller');

const router = express.Router()

router.use(requireAuth);

router.get('/', listProjects)
router.get('/:id', getProject)
router.post('/', requireRole(db.ROLES.ADMIN, db.ROLES.MANAGER), createProject)

module.exports = router