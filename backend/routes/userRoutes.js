const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  
  body('contactNumber')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('address.street')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Street address must be between 3 and 200 characters'),
  
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City name must be between 2 and 50 characters'),
  
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State name must be between 2 and 50 characters'),
  
  body('address.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid 6-digit Indian pincode'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Debug endpoint to test mobile connectivity
router.post('/debug', (req, res) => {
  console.log('Debug request received:', {
    body: req.body,
    headers: req.headers,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.json({
    message: 'Debug endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/v1/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    console.log('Registration request received:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const {
      name,
      email,
      age,
      contactNumber,
      address,
      password,
      emergencyContacts = []
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { contactNumber }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Contact number is already registered',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      age,
      contactNumber,
      address,
      password,
      emergencyContacts
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: '  User registered successfully with Durga\'s protection',
      user: user.getSafeData(),
      token,
      code: 'REGISTRATION_SUCCESS'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: '🛡️ Profile retrieved successfully',
      user: user.getSafeData(),
      code: 'PROFILE_SUCCESS'
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('contactNumber').optional().matches(/^[6-9]\d{9}$/),
  body('address.street').optional().trim().isLength({ min: 5, max: 200 }),
  body('address.city').optional().trim().isLength({ min: 2, max: 50 }),
  body('address.state').optional().trim().isLength({ min: 2, max: 50 }),
  body('address.pincode').optional().matches(/^[1-9][0-9]{5}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const allowedUpdates = [
      'name', 'age', 'contactNumber', 'address', 
      'emergencyContacts', 'preferences'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: '  Profile updated successfully',
      user: user.getSafeData(),
      code: 'UPDATE_SUCCESS'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile',
      code: 'UPDATE_ERROR'
    });
  }
});

// @route   POST /api/v1/users/emergency-contacts
// @desc    Add emergency contact
// @access  Private
router.post('/emergency-contacts', auth, [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('relationship').isIn(['family', 'friend', 'colleague', 'neighbor', 'other']),
  body('contactNumber').matches(/^[6-9]\d{9}$/),
  body('isPrimary').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { name, relationship, contactNumber, isPrimary = false } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      user.emergencyContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }

    user.emergencyContacts.push({
      name,
      relationship,
      contactNumber,
      isPrimary
    });

    await user.save();

    res.status(201).json({
      message: '🛡️ Emergency contact added successfully',
      emergencyContacts: user.emergencyContacts,
      code: 'CONTACT_ADDED'
    });

  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to add emergency contact',
      message: 'An error occurred while adding emergency contact',
      code: 'CONTACT_ERROR'
    });
  }
});

// @route   GET /api/v1/users/emergency-contacts
// @desc    Get emergency contacts
// @access  Private
router.get('/emergency-contacts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('emergencyContacts');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: '  Emergency contacts retrieved successfully',
      emergencyContacts: user.emergencyContacts,
      code: 'CONTACTS_SUCCESS'
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch emergency contacts',
      message: 'An error occurred while fetching emergency contacts',
      code: 'CONTACTS_ERROR'
    });
  }
});

// @route   GET /api/v1/users/location/:city/:state
// @desc    Get users in specific location (for emergency support)
// @access  Private
router.get('/location/:city/:state', auth, async (req, res) => {
  try {
    const { city, state } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.getEmergencyContacts(city, state, limit);

    res.json({
      message: '🛡️ Emergency contacts in your area retrieved',
      location: { city, state },
      contacts: users,
      count: users.length,
      code: 'LOCATION_CONTACTS_SUCCESS'
    });

  } catch (error) {
    console.error('Location contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch location contacts',
      message: 'An error occurred while fetching location contacts',
      code: 'LOCATION_CONTACTS_ERROR'
    });
  }
});

// @route   POST /api/v1/users/safety-stats
// @desc    Update safety statistics
// @access  Private
router.post('/safety-stats', auth, [
  body('type').isIn(['session', 'emergency']),
  body('increment').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { type, increment = 1 } = req.body;

    const updateField = type === 'session' 
      ? 'safetyStats.totalSessions' 
      : 'safetyStats.emergencyTriggers';

    const updateData = {
      $inc: { [updateField]: increment }
    };

    if (type === 'emergency') {
      updateData.$set = { 'safetyStats.lastEmergencyDate': new Date() };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('safetyStats');

    res.json({
      message: '  Safety statistics updated',
      safetyStats: user.safetyStats,
      code: 'STATS_UPDATED'
    });

  } catch (error) {
    console.error('Safety stats update error:', error);
    res.status(500).json({
      error: 'Failed to update safety statistics',
      message: 'An error occurred while updating safety statistics',
      code: 'STATS_ERROR'
    });
  }
});

module.exports = router;
