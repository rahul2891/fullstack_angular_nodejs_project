const { db } = require('../data/db')

function requireAuth(req, res, next) {}

function requireRole(...allowedRoles) {}

module.exports = { requireAuth, requireRole }