const mongoose = require('mongoose');

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

stockMetadataSchema.statics.findOrCreate = async function (stockCode, name = '', sector = '') {
  let stock = await this.findOne({ code: stockCode.toUpperCase() });
  if (!stock) {
    stock = await this.create({
      code: stockCode.toUpperCase(),
      name: name || stockCode,
      sector: sector || 'Unknown',
    });
  }
  return stock;
};

stockMetadataSchema.methods.touch = function () {
  this.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('StockMetadata', stockMetadataSchema);
