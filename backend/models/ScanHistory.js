const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  scannedImage: String,
  detectedMedicineName: String,
  confidenceScore: Number, // 0 - 100%
  verdict: {
    type: String,
    enum: ['IDENTIFIED', 'GENUINE', 'SUSPICIOUS', 'COUNTERFEIT'],
    default: 'IDENTIFIED'
  },
  status: {
    type: String,
    default: 'IDENTIFIED'
  },
  analysisBreakdown: {
    imprintMatchScore: Number,
    colorHistogramScore: Number,
    shapeContourScore: Number,
    matchQuality: String,
    identificationNotes: [String],
    hologramVerification: String,
    activeCompoundStatus: String,
    riskFactors: [String]
  },
  batchNumber: String,
  manufacturer: String,
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
