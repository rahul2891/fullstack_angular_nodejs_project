const { db } = require('../data/db');
const { broadcastIssueEvent } = require('../sockets/realtime');

function listComments(req, res) {
    const issue = db.findIssueById(req.params.issueId);
  if (!issue) return res.status(404).json({ message: 'Issue not found' });

  const comments = db.listCommentsForIssue(req.params.issueId);
  return res.json({ comments });
}

function createComment(req, res) {
    const issue = db.findIssueById(req.params.issueId);
  if (!issue) return res.status(404).json({ message: 'Issue not found' });

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'text is required' });
  }

  const comment = db.createComment({ issueId: req.params.issueId, authorId: req.user.id, text });
  broadcastIssueEvent('comment:created', comment);
  return res.status(201).json({ comment });
}

module.exports = { listComments, createComment }