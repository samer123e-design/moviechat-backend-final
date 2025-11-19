const express = require('express');
const routerAds = express.Router();
const AdBlockModel = require('../models/AdBlock');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// PUBLIC ROUTE: GET active ads for frontend
routerAds.get('/', async (req, res) => {
    const activeAds = await AdBlockModel.find({ isActive: true }).select('location adCode');
    res.json(activeAds);
});

// ADMIN ROUTES: Manage Ads
routerAds.use(authMiddleware, requireAdmin); 

// 1. Create a new ad block
routerAds.post('/', async (req, res) => {
    const { location, adCode } = req.body;
    if (!location || !adCode) {
        return res.status(400).json({ error: 'Location and Ad Code are required.' });
    }
    try {
        const newAd = await AdBlockModel.create({ location, adCode });
        res.status(201).json(newAd);
    } catch (e) {
        res.status(500).json({ error: 'Error creating ad block (Location might already exist).' });
    }
});

// 2. Update existing ad block
routerAds.put('/:location', async (req, res) => {
    const { adCode, isActive } = req.body;
    const updatedAd = await AdBlockModel.findOneAndUpdate(
        { location: req.params.location },
        { adCode, isActive },
        { new: true }
    );
    if (!updatedAd) return res.status(404).json({ error: 'Ad Block not found.' });
    res.json(updatedAd);
});

// 3. List all ad blocks (Admin view)
routerAds.get('/admin', async (req, res) => {
    const allAds = await AdBlockModel.find().sort({ location: 1 });
    res.json(allAds);
});

module.exports = routerAds;
