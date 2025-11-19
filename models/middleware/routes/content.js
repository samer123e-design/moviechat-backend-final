const express = require('express');
const routerContent = express.Router();
const ContentModel = require('../models/Content');

routerContent.get('/', async (req, res) => {
  const allContent = await ContentModel.find().sort({ createdAt: -1 });
  res.json(allContent);
});

routerContent.get('/type/:type', async (req, res) => {
    const type = req.params.type; 
    if (!['movie', 'series'].includes(type)) {
        return res.status(400).json({ error: 'Invalid content type.' });
    }
    const contentList = await ContentModel.find({ type }).sort({ createdAt: -1 });
    res.json(contentList);
});

routerContent.get('/:slug', async (req, res) => {
  const content = await ContentModel.findOne({ slug: req.params.slug });
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json(content);
});

routerContent.get('/search/:query', async (req, res) => {
    const query = req.params.query;
    const searchResults = await ContentModel.find({
        $or: [
            { title: { $regex: query, $options: 'i' } }, 
            { description: { $regex: query, $options: 'i' } } 
        ]
    }).sort({ createdAt: -1 });
    res.json(searchResults);
});

module.exports = routerContent;
