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
    body('patientId').isUUID().withMessage('Valid patient ID is required'),
    body('doctorId').isUUID().withMessage('Valid doctor ID is required')
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
        where: {
          id: patientId,
          userId: req.user.id
        }
      });

      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findOne({
        where: { id: doctorId }
      });

      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      // Check if mapping already exists
      const existingMapping = await Mapping.findOne({
        where: {
          patientId,
          doctorId,
          status: 'active'
        }
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
    const mappings = await Mapping.findAll({
      include: [
        {
          model: Patient,
          where: { userId: req.user.id },
          required: true
        },
        {
          model: Doctor,
          required: true
        }
      ]
    });

    res.json({
      status: 'success',
      data: { mappings }
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
    const mappings = await Mapping.findAll({
      where: {
        patientId: req.params.patientId,
        status: 'active'
      },
      include: [
        {
          model: Patient,
          where: { userId: req.user.id },
          required: true
        },
        {
          model: Doctor,
          required: true
        }
      ]
    });

    res.json({
      status: 'success',
      data: { mappings }
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
    const mapping = await Mapping.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Patient,
          where: { userId: req.user.id },
          required: true
        }
      ]
    });

    if (!mapping) {
      return res.status(404).json({
        status: 'error',
        message: 'Mapping not found'
      });
    }

    await mapping.update({ status: 'inactive' });

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