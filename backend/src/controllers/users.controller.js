const { db } = require('../data/db')

function listUsers(req, res) {
    return res.json({ users: db.listUsers() })
}

module.exports = { listUsers };