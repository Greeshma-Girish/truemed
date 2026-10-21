const mongoose = require('mongoose');
const ScanHistory = require('../models/ScanHistory');
const Medicine = require('../models/Medicine');
const { analyzePillImage } = require('../utils/mlInference');

// @desc    Perform ML image scan verification on pill
// @route   POST /api/scan/verify
const verifyPillScan = async (req, res) => {
  try {
    const { imageBase64, sampleTag, batchNumber } = req.body;

    const inputData = imageBase64 || sampleTag || 'default_sample';
    const mlResult = await analyzePillImage(inputData);

    let savedMedicineId = null;
    if (mlResult.medicine && mongoose.connection.readyState === 1) {
      try {
        const existing = await Medicine.findOne({ name: mlResult.medicine.name });
        if (existing) {
          savedMedicineId = existing._id;
        }
      } catch (err) {
        // Continue if DB disconnected
      }
    }

    const userId = req.user ? req.user._id : null;

    let scanRecord = null;
    if (userId && mongoose.connection.readyState === 1) {
      try {
        scanRecord = await ScanHistory.create({
          user: userId,
          medicine: savedMedicineId,
          scannedImage: imageBase64 ? (imageBase64.substring(0, 100) + '...') : 'pill_camera_capture.jpg',
          detectedMedicineName: mlResult.medicine ? mlResult.medicine.name : 'Unknown Medication',
          confidenceScore: mlResult.confidence,
          verdict: mlResult.verdict,
          analysisBreakdown: mlResult.breakdown,
          batchNumber: batchNumber || 'BATCH-' + Math.floor(100000 + Math.random() * 900000),
          manufacturer: mlResult.medicine ? mlResult.medicine.manufacturer : 'Pharma Labs'
        });
      } catch (err) {
        // Continue if DB disconnected
      }
    }

    res.status(200).json({
      success: true,
      scanId: scanRecord ? scanRecord._id : 'scan-' + Date.now(),
      verdict: mlResult.verdict,
      confidence: mlResult.confidence,
      medicine: mlResult.medicine,
      breakdown: mlResult.breakdown,
      scannedAt: new Date()
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's scan verification history
// @route   GET /api/scan/history
const getScanHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const history = await ScanHistory.find({ user: req.user._id })
        .populate('medicine')
        .sort({ scannedAt: -1 });
      return res.json(history);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { verifyPillScan, getScanHistory };
