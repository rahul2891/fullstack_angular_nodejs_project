const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ROLES    = { ADMIN: 'admin', MANAGER: 'manager', MEMBER: 'member' };
const STATUSES   = ['backlog', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// USERS
async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function listUsers() {
  const { rows } = await pool.query('SELECT id, name, email, role, avatar_color FROM users ORDER BY name');
  return rows.map(toPublicUser);
}

async function createUser({ name, email, password, role, avatarColor }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, avatar_color)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, password, role, avatarColor]
  );
  return rows[0];
}

// PROJECTS
async function listProjects() {
  const { rows } = await pool.query(`
    SELECT p.*, array_agg(pm.user_id) AS "memberIds"
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return rows.map(toProject);
}

async function findProjectById(id) {
  const { rows } = await pool.query(`
    SELECT p.*, array_agg(pm.user_id) AS "memberIds"
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `, [id]);
  return rows[0] ? toProject(rows[0]) : null;
}

async function createProject({ name, key, description, ownerId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO projects (key, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [key.toUpperCase(), name, description || '']
    );
    const project = rows[0];
    await client.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`,
      [project.id, ownerId]
    );
    await client.query('COMMIT');
    return { ...toProject(project), memberIds: [ownerId] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ISSUES
async function listIssues({ projectId, status, assigneeId, search } = {}) {
  const conditions = [];
  const values = [];
  let i = 1;

  if (projectId)  { conditions.push(`project_id = $${i++}`);  values.push(projectId); }
  if (status)     { conditions.push(`status = $${i++}`);       values.push(status); }
  if (assigneeId) { conditions.push(`assignee_id = $${i++}`);  values.push(assigneeId); }
  if (search) {
    conditions.push(`(title ILIKE $${i} OR description ILIKE $${i} OR key ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM issues ${where} ORDER BY created_at DESC`, values
  );
  return rows.map(toIssue);
}

async function findIssueById(id) {
  const { rows } = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
  return rows[0] ? toIssue(rows[0]) : null;
}

async function createIssue(payload) {
  const count = await pool.query(
    'SELECT COUNT(*) FROM issues WHERE project_id = $1', [payload.projectId]
  );
  const projectRow = await pool.query('SELECT key FROM projects WHERE id = $1', [payload.projectId]);
  const projectKey = projectRow.rows[0]?.key || 'GEN';
  const issueKey = `${projectKey}-${Number(count.rows[0].count) + 1}`;

  const { rows } = await pool.query(
    `INSERT INTO issues
       (project_id, key, title, description, status, priority, assignee_id, reporter_id, checklist, labels)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      payload.projectId, issueKey, payload.title,
      payload.description || '', payload.status || 'backlog',
      payload.priority || 'medium', payload.assigneeId || null,
      payload.reporterId, JSON.stringify(payload.checklist || []),
      payload.labels || [],
    ]
  );
  return toIssue(rows[0]);
}

async function updateIssue(id, patch) {
  const fields = [];
  const values = [];
  let i = 1;

  const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'checklist', 'labels'];
  const columnMap = { assigneeId: 'assignee_id' };

  for (const [key, val] of Object.entries(patch)) {
    const col = columnMap[key] || key;
    if (allowed.includes(col)) {
      fields.push(`${col} = $${i++}`);
      values.push(col === 'checklist' ? JSON.stringify(val) : val);
    }
  }

  if (!fields.length) return findIssueById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE issues SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values
  );
  return rows[0] ? toIssue(rows[0]) : null;
}

async function deleteIssue(id) {
  const { rowCount } = await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  return rowCount > 0;
}

async function isTitleDuplicateInProject(projectId, title, excludeId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM issues WHERE project_id=$1 AND LOWER(title)=LOWER($2) AND id != $3`,
    [projectId, title, excludeId || '']
  );
  return rows.length > 0;
}

// COMMENTS
async function listCommentsForIssue(issueId) {
  const { rows } = await pool.query(
    'SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC', [issueId]
  );
  return rows.map(toComment);
}

async function createComment({ issueId, authorId, text }) {
  const { rows } = await pool.query(
    'INSERT INTO comments (issue_id, author_id, text) VALUES ($1,$2,$3) RETURNING *',
    [issueId, authorId, text]
  );
  return toComment(rows[0]);
}

// Shape helpers — map snake_case DB columns → camelCase JS objects
function toPublicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, avatarColor: row.avatar_color };
}

function toProject(row) {
  return {
    id: row.id, key: row.key, name: row.name,
    description: row.description,
    memberIds: (row.memberIds || []).filter(Boolean),
    createdAt: row.created_at,
  };
}

function toIssue(row) {
  return {
    id: row.id, projectId: row.project_id, key: row.key,
    title: row.title, description: row.description,
    status: row.status, priority: row.priority,
    assigneeId: row.assignee_id, reporterId: row.reporter_id,
    checklist: row.checklist || [],
    labels: row.labels || [],
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toComment(row) {
  return { id: row.id, issueId: row.issue_id, authorId: row.author_id, text: row.text, createdAt: row.created_at };
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

const db = {
  ROLES, STATUSES, PRIORITIES,
  findUserByEmail, findUserById, listUsers, createUser,
  listProjects, findProjectById, createProject,
  listIssues, findIssueById, createIssue, updateIssue, deleteIssue, isTitleDuplicateInProject,
  listCommentsForIssue, createComment,
};

module.exports = { db, publicUser };
