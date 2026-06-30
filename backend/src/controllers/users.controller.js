const { db } = require('../data/db');

async function listUsers(req, res) {
  const users = await db.listUsers();
  return res.json({ users });
}

module.exports = { listUsers };
