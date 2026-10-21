const mongoose = require('mongoose');
require('dotenv').config();
const Medicine = require('./models/Medicine');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Medicine.countDocuments();
    console.log('MongoDB total count:', count);

    const all = await Medicine.find({}, 'name genericName brandName imprintCode shape color').lean();
    const aspirin = all.filter(m => 
      (m.name && m.name.toLowerCase().includes('aspirin')) ||
      (m.genericName && m.genericName.toLowerCase().includes('aspirin')) ||
      (m.brandName && m.brandName.toLowerCase().includes('aspirin'))
    );
    console.log('Aspirin in DB:', aspirin.length);
    if (aspirin.length > 0) {
      console.log('Sample Aspirin in DB:', aspirin.slice(0, 3));
    }

    const paracetamol = all.filter(m => 
      (m.name && (m.name.toLowerCase().includes('paracetamol') || m.name.toLowerCase().includes('acetaminophen')))
    );
    console.log('Paracetamol/Acetaminophen in DB:', paracetamol.length);

    console.log('Total distinct generic names:', new Set(all.map(m => m.genericName)).size);
    process.exit(0);
  } catch (err) {
    console.error('Mongo test error:', err);
    process.exit(1);
  }
}

run();
