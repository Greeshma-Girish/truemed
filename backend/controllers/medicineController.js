const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const fs = require('fs');
const path = require('path');

// @desc    Get all medicines or search by query
// @route   GET /api/medicines
const getMedicines = async (req, res) => {
  try {
    const { query, shape, color } = req.query;

    if (mongoose.connection.readyState === 1) {
      let filter = {};
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { genericName: { $regex: query, $options: 'i' } },
          { brandName: { $regex: query, $options: 'i' } },
          { imprintCode: { $regex: query, $options: 'i' } },
          { uses: { $regex: query, $options: 'i' } }
        ];
      }
      if (shape) filter.shape = shape;
      if (color) filter.color = color;

      const medicines = await Medicine.find(filter).sort({ name: 1 });
      if (medicines.length > 0) return res.json(medicines);
    }

    // Fallback JSON Dataset
    const datasetPath = path.join(__dirname, '../ml/pill_dataset.json');
    if (fs.existsSync(datasetPath)) {
      let dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      if (query) {
        const q = query.toLowerCase();
        dataset = dataset.filter(item =>
          item.name.toLowerCase().includes(q) ||
          item.genericName.toLowerCase().includes(q) ||
          item.imprintCode.toLowerCase().includes(q) ||
          item.uses.some(u => u.toLowerCase().includes(q))
        );
      }
      return res.json(dataset);
    }

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
const getMedicineById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const medicine = await Medicine.findById(req.params.id);
        if (medicine) return res.json(medicine);
      } catch (e) {}
    }

    const datasetPath = path.join(__dirname, '../ml/pill_dataset.json');
    if (fs.existsSync(datasetPath)) {
      const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      const item = dataset.find(m => m.id === req.params.id || m._id === req.params.id);
      if (item) return res.json(item);
    }

    res.status(404).json({ message: 'Medicine details not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed initial dataset into database
// @route   POST /api/medicines/seed
const seedMedicines = async (req, res) => {
  try {
    const datasetPath = path.join(__dirname, '../ml/pill_dataset.json');
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ message: 'Dataset file missing' });
    }

    const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    if (mongoose.connection.readyState === 1) {
      await Medicine.deleteMany({});
      const inserted = await Medicine.insertMany(data);
      return res.status(201).json({ message: 'Database seeded successfully', count: inserted.length });
    }
    res.json({ message: 'Running in high-availability mode with dataset file', count: data.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMedicines, getMedicineById, seedMedicines };
