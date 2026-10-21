const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  genericName: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  imprintCode: {
    type: String,
    default: ''
  },
  shape: {
    type: String,
    enum: ['Round', 'Capsule', 'Oval', 'Triangle', 'Pentagon', 'Hexagon', 'Diamond', 'Rectangle', 'Bullet', 'Other'],
    default: 'Round'
  },
  color: {
    type: String,
    default: 'White'
  },
  activeIngredients: [String],
  uses: [String],
  dosage: String,
  sideEffects: [String],
  warnings: [String],
  manufacturer: String,
  authenticSecurityFeatures: {
    hologramPattern: String,
    serialPrefix: String,
    microprintText: String,
    standardWeightGrams: Number
  },
  imageUrl: String,
  isCounterfeitRiskAlert: {
    type: Boolean,
    default: false
  },
  counterfeitWarningNotice: String,
  authenticVariants: [{
    name: String,
    manufacturer: String,
    shape: String,
    color: String,
    imprintCode: String,
    dosage: String,
    ndc11: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medicine', medicineSchema);
