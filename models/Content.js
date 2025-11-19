const mongoose = require('mongoose');
const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['movie', 'series'], 
    required: true, 
    index: true 
  },
  slug: { type: String, index: true, unique: true, required: true },
  description: String,
  posterUrl: String,
  watchLink: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Content', ContentSchema);
