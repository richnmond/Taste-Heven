const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone: phone || '', passwordHash, role: 'user' });
  const token = createToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

module.exports = router;
