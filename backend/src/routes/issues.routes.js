const express = require('express');
const {
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  checkTitleAvailable,
} = require('../controllers/issues.controller');
const { listComments, createComment } = require('../controllers/comments.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { db } = require('../data/db');

const router = express.Router();

router.use(requireAuth);

outer.get('/check-title', checkTitleAvailable);

router.get('/', listIssues);
router.get('/:id', getIssue);
router.post('/', createIssue);
router.patch('/:id', updateIssue);
router.delete('/:id', requireRole(db.ROLES.ADMIN, db.ROLES.MANAGER), deleteIssue);

router.get('/:issueId/comments', listComments);
router.post('/:issueId/comments', createComment);

module.exports = router;