const bcrypt = require('bcryptjs');
const { db, publicUser } = require('../data/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are all required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  if (await db.findUserByEmail(email)) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = bcrypt.hashSync(password, 8);
  const user = await db.createUser({
    name,
    email,
    password: hashed,
    role: db.ROLES.MEMBER,
    avatarColor: randomColor(),
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return res.status(201).json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const matches = bcrypt.compareSync(password, user.password);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return res.json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await db.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return res.json({ accessToken, refreshToken: newRefreshToken, user: publicUser(user) });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

async function me(req, res) {
  const user = await db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: publicUser(user) });
}

function randomColor() {
  const palette = ['#7C5CFC', '#FF8A5B', '#2BB7A3', '#E25C8A', '#4C8DFF', '#F2B84B'];
  return palette[Math.floor(Math.random() * palette.length)];
}

module.exports = { register, login, refresh, me };
