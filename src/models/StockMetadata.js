const mongoose = require('mongoose');

/**
 * StockMetadata Schema - Only schema definition
 * Queries moved to Repository layer
 */
const stockMetadataSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Stock code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  sector: {
    type: String,
    trim: true,
    default: 'Unknown',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'stockmetadatas',
});

// Simple statics only
stockMetadataSchema.statics.findByCode = function (code) {
  return this.findOne({ code: code.toUpperCase() });
};

module.exports = mongoose.model('StockMetadata', stockMetadataSchema);
