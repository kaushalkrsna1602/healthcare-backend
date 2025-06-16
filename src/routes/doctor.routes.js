const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Doctor = require('../models/doctor.model');

// Apply authentication middleware to all routes
router.use(auth);

// Create doctor
router.post('/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
    body('email').isEmail().withMessage('Please enter a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const doctor = await Doctor.create({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({
        status: 'success',
        data: { doctor }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error creating doctor'
      });
    }
  }
);

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll();

    res.json({
      status: 'success',
      data: { doctors }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors'
    });
  }
});

// Get specific doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: { id: req.params.id }
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctor'
    });
  }
});

// Update doctor
router.put('/:id',
  [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
    body('licenseNumber').optional().trim().notEmpty().withMessage('License number cannot be empty'),
    body('contactNumber').optional().trim().notEmpty().withMessage('Contact number cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const doctor = await Doctor.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      await doctor.update(req.body);

      res.json({
        status: 'success',
        data: { doctor }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error updating doctor'
      });
    }
  }
);

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    await doctor.destroy();

    res.json({
      status: 'success',
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting doctor'
    });
  }
});

module.exports = router; 