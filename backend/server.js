const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Configure DNS servers (Google/Cloudflare) to resolve MongoDB SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const scanRoutes = require('./routes/scanRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'TrueMed AI Counterfeit Verification System',
    version: '1.0.0',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'standalone_mode'
  });
});

// Database Connection with graceful fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://greeshmagirish108_db_user:hmTiCYPK0PyJA9Ot@truemed.63edmxj.mongodb.net/truemed?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(async () => {
    console.log('⚡ Connected to MongoDB Atlas successfully.');
    try {
      const Medicine = require('./models/Medicine');
      const count = await Medicine.countDocuments();
      if (count === 0) {
        const datasetPath = path.join(__dirname, 'ml/pill_dataset.json');
        if (fs.existsSync(datasetPath)) {
          const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
          await Medicine.insertMany(dataset);
          console.log(`🌱 Automatically seeded ${dataset.length} reference medicines into MongoDB.`);
        }
      }
    } catch (err) {
      console.warn('Seed notice:', err.message);
    }
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection attempt note:', err.message);
    console.log('🛡️ TrueMed running with automatic fallback database mode for high availability.');
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 TrueMed Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use. Trying port ${Number(PORT) + 1}...`);
    app.listen(Number(PORT) + 1, () => {
      console.log(`🚀 TrueMed Server running on fallback port ${Number(PORT) + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
