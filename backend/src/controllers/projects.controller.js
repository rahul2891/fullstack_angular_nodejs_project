const { db } = require('../data/db');

async function listProjects(req, res) {
  const all = await db.listProjects();
  const visible =
    req.user.role === db.ROLES.ADMIN
      ? all
      : all.filter((p) => p.memberIds.includes(req.user.id));
  return res.json({ projects: visible });
}

async function getProject(req, res) {
  const project = await db.findProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  return res.json({ project });
}

async function createProject(req, res) {
  const { name, key, description } = req.body;
  if (!name || !key) {
    return res.status(400).json({ message: 'Name and key are required' });
  }
  const project = await db.createProject({ name, key, description, ownerId: req.user.id });
  return res.status(201).json({ project });
}

module.exports = { listProjects, getProject, createProject };
