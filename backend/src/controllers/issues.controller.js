const { db } = require('../data/db');
const { broadcastIssueEvent } = require('../sockets/realtime');

async function listIssues(req, res) {
  const { projectId, status, assigneeId, search } = req.query;
  const issues = await db.listIssues({ projectId, status, assigneeId, search });
  return res.json({ issues });
}

async function getIssues(req, res) {
  const issue = await db.findIssueById(req.params.id);
  if (!issue) return res.status(404).json({ message: 'Issue not found' });
  return res.json({ issue });
}

async function createIssue(req, res) {
  const { projectId, title, description, status, priority, assigneeId, labels } = req.body;

  if (!projectId || !title) {
    return res.status(400).json({ message: 'projectId and title are required' });
  }
  if (status && !db.STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${db.STATUSES.join(', ')}` });
  }

  const issue = await db.createIssue({
    projectId, title, description, status, priority, assigneeId, labels,
    reporterId: req.user.id,
  });

  broadcastIssueEvent('issue:created', issue);
  return res.status(201).json({ issue });
}

async function updateIssue(req, res) {
  const existing = await db.findIssueById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Issue not found' });

  const patch = req.body;
  if (patch.status && !db.STATUSES.includes(patch.status)) {
    return res.status(400).json({ message: `status must be one of ${db.STATUSES.join(', ')}` });
  }

  const updated = await db.updateIssue(req.params.id, patch);
  broadcastIssueEvent('issue:updated', updated);
  return res.json({ issue: updated });
}

async function deleteIssue(req, res) {
  const existing = await db.findIssueById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Issue not found' });

  await db.deleteIssue(req.params.id);
  broadcastIssueEvent('issue:deleted', { id: req.params.id, projectId: existing.projectId });
  return res.status(204).send();
}

async function checkTitleAvailable(req, res) {
  const { projectId, title, excludeId } = req.query;
  if (!projectId || !title) {
    return res.status(400).json({ message: 'projectId and title query params are required' });
  }
  const duplicate = await db.isTitleDuplicateInProject(projectId, title, excludeId);
  return res.json({ available: !duplicate });
}

module.exports = { listIssues, getIssues, createIssue, updateIssue, deleteIssue, checkTitleAvailable };
