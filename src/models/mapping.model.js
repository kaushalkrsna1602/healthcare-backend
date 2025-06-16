const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique active mappings
mappingSchema.index({ patientId: 1, doctorId: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'active' }
});

const Mapping = mongoose.model('Mapping', mappingSchema);

module.exports = Mapping; 