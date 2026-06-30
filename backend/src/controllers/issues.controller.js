const { db } = require('../data/db')

function listIssues(req, res) {
    const {projectId, status, assigneedId, search } = req.query;
    const issues = db.listIssues({projectId, status, assigneedId, search});
    return res.json({issues})
}

function getIssues(req, res) {
    const issue = db.findIssueById(req.params.id);
  if (!issue) return res.status(404).json({ message: 'Issue not found' });
  return res.json({ issue });
}

function createIssue(req, res) {
     const { projectId, title, description, status, priority, assigneeId, labels } = req.body;

     if(!projectId || !title) {
        return req.status(400).json({message: 'projectId and title are required'})
     }
      if (status && !db.STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${db.STATUSES.join(', ')}` });
  }

  const issue = db.createIssue({
    projectId,
    title,
    description,
    status,
    priority,
    assigneeId,
    labels,
    reporterId: req.user.id,
  });

   return res.status(201).json({ issue });
}

function updateIssue(req, res) {
    const existing = db.findIssueById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Issue not found' });

  const patch = req.body;
  if (patch.status && !db.STATUSES.includes(patch.status)) {
    return res.status(400).json({ message: `status must be one of ${db.STATUSES.join(', ')}` });
  }

  const updated = db.updateIssue(req.params.id, patch);
  broadcastIssueEvent('issue:updated', updated);
  return res.json({ issue: updated });
}

function deleteIssue(req, res) {
     const existing = db.findIssueById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Issue not found' });

  db.deleteIssue(req.params.id);
  broadcastIssueEvent('issue:deleted', { id: req.params.id, projectId: existing.projectId });
  return res.status(204).send();
}

function checkTitleAvailable(req, res) {
    const { projectId, title, excludeId } = req.query;
  if (!projectId || !title) {
    return res.status(400).json({ message: 'projectId and title query params are required' });
  }
  const duplicate = db.isTitleDuplicateInProject(projectId, title, excludeId);
  return res.json({ available: !duplicate });
}

module.exports = {
    listIssues,
    getIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    checkTitleAvailable
}