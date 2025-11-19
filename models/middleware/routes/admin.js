const express = require('express');
const routerAdmin = express.Router();
const ContentModel = require('../models/Content');
const UserModel = require('../models/User');
const { authMiddleware, requireAdmin, requireModeratorOrAdmin } = require('../middleware/auth');

routerAdmin.use(authMiddleware);

// Add New Content (Moderator or Admin)
routerAdmin.post('/content', requireModeratorOrAdmin, async (req, res) => {
    try {
        const { title, type, slug, description, posterUrl, watchLink } = req.body;
        if (!title || !type || !slug || !watchLink) {
            return res.status(400).json({ error: 'Missing required fields: title, type, slug, watchLink' });
        }
        const newContent = await ContentModel.create({ title, type, slug, description, posterUrl, watchLink });
        res.status(201).json(newContent);
    } catch (e) {
        res.status(500).json({ error: 'Error adding content: ' + e.message });
    }
});

// Ban/Unban User (Moderator or Admin)
routerAdmin.post('/users/:id/ban', requireModeratorOrAdmin, async (req, res) => {
    const userToUpdate = await UserModel.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ error: 'User not found' });
    if (userToUpdate.role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only an Admin can manage other Admins.' });
    }

    await UserModel.findByIdAndUpdate(req.params.id, { banned: true });
    res.json({ ok: true, message: 'User banned.' });
});

routerAdmin.post('/users/:id/unban', requireModeratorOrAdmin, async (req, res) => {
    await UserModel.findByIdAndUpdate(req.params.id, { banned: false });
    res.json({ ok: true, message: 'User unbanned.' });
});

// List All Users (Admin only)
routerAdmin.get('/users', requireAdmin, async (req, res) => {
    const users = await UserModel.find().select('-passwordHash');
    res.json(users);
});

// Set/Remove Moderator Role (Admin only)
routerAdmin.post('/users/:id/set-role', requireAdmin, async (req, res) => {
    const { role } = req.body; 
    if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role.' });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.id, 
        { role }, 
        { new: true }
    ).select('-passwordHash');

    if (!updatedUser) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true, user: updatedUser, message: `Role set to ${role}` });
});

module.exports = routerAdmin;
