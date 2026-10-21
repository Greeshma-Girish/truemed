const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById, seedMedicines } = require('../controllers/medicineController');

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/seed', seedMedicines);

module.exports = router;
