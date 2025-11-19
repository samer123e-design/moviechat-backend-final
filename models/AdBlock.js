const mongoose = require('mongoose');

const AdBlockSchema = new mongoose.Schema({
  location: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  adCode: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('AdBlock', AdBlockSchema);
