const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Mapping = require('../models/mapping.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');

// Apply authentication middleware to all routes
router.use(auth);

// Create mapping
router.post('/',
  [
    body('patientId').isMongoId().withMessage('Valid patient ID is required'),
    body('doctorId').isMongoId().withMessage('Valid doctor ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patientId, doctorId } = req.body;

      // Check if patient exists and belongs to the user
      const patient = await Patient.findOne({
        _id: patientId,
        userId: req.user._id
      });

      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      // Check if mapping already exists
      const existingMapping = await Mapping.findOne({
        patientId,
        doctorId,
        status: 'active'
      });

      if (existingMapping) {
        return res.status(400).json({
          status: 'error',
          message: 'Mapping already exists'
        });
      }

      const mapping = await Mapping.create({
        patientId,
        doctorId
      });

      res.status(201).json({
        status: 'success',
        data: { mapping }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error creating mapping'
      });
    }
  }
);

// Get all mappings
router.get('/', async (req, res) => {
  try {
    const mappings = await Mapping.find({})
      .populate({
        path: 'patientId',
        match: { userId: req.user._id },
        select: '-__v'
      })
      .populate('doctorId', '-__v');

    // Filter out mappings where patientId is null (not belonging to user)
    const filteredMappings = mappings.filter(m => m.patientId);

    res.json({
      status: 'success',
      data: { mappings: filteredMappings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching mappings'
    });
  }
});

// Get mappings for a specific patient
router.get('/:patientId', async (req, res) => {
  try {
    const mappings = await Mapping.find({
      patientId: req.params.patientId,
      status: 'active'
    })
      .populate({
        path: 'patientId',
        match: { userId: req.user._id },
        select: '-__v'
      })
      .populate('doctorId', '-__v');

    // Filter out mappings where patientId is null (not belonging to user)
    const filteredMappings = mappings.filter(m => m.patientId);

    res.json({
      status: 'success',
      data: { mappings: filteredMappings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching mappings'
    });
  }
});

// Delete mapping
router.delete('/:id', async (req, res) => {
  try {
    const mapping = await Mapping.findById(req.params.id).populate({
      path: 'patientId',
      match: { userId: req.user._id },
      select: '-__v'
    });

    if (!mapping || !mapping.patientId) {
      return res.status(404).json({
        status: 'error',
        message: 'Mapping not found'
      });
    }

    mapping.status = 'inactive';
    await mapping.save();

    res.json({
      status: 'success',
      message: 'Mapping deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting mapping'
    });
  }
});

module.exports = router; 