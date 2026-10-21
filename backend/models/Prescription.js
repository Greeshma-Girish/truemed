const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: String,
  clinicName: String,
  patientName: String,
  prescribedDate: {
    type: Date,
    default: Date.now
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    verifiedStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Counterfeit Warning'],
      default: 'Verified'
    }
  }],
  notes: String,
  prescriptionImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
