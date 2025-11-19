const express = require('express');
const routerAuth = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

routerAuth.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User with this email already exists.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ email, passwordHash: hash, role: 'user' });
    res.status(201).json({ ok: true, message: 'Registration successful.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

routerAuth.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials.' });

    if (user.banned) return res.status(403).json({ error: 'Account banned.' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: 'Server error during login.' }); }
});

module.exports = routerAuth;
