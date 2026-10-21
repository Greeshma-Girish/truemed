const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription, deletePrescription, ocrPrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ocr', ocrPrescription);
router.get('/', protect, getPrescriptions);
router.post('/', protect, createPrescription);
router.delete('/:id', protect, deletePrescription);

module.exports = router;

