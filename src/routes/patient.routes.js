const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Patient = require('../models/patient.model');

// Apply authentication middleware to all routes
router.use(auth);

// Create patient
router.post('/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
    body('address').trim().notEmpty().withMessage('Address is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const patient = await Patient.create({
        ...req.body,
        userId: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { patient }
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating patient'
      });
    }
  }
);

// Get all patients for the authenticated user
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.user._id });

    res.json({
      status: 'success',
      data: { patients }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patients'
    });
  }
});

// Get specific patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient'
    });
  }
});

// Update patient
router.put('/:id',
  [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('dateOfBirth').optional().isDate().withMessage('Valid date of birth is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('contactNumber').optional().trim().notEmpty().withMessage('Contact number cannot be empty'),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const patient = await Patient.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user._id
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      res.json({
        status: 'success',
        data: { patient }
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error updating patient'
      });
    }
  }
);

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting patient'
    });
  }
});

module.exports = router; 