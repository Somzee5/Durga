const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13 years'],
    max: [120, 'Age must be less than 120 years']
  },
  
  // Contact Information
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    trim: true,
    match: [
      /^[6-9]\d{9}$/,
      'Please provide a valid 10-digit Indian mobile number'
    ]
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [
        /^[1-9][0-9]{5}$/,
        'Please provide a valid 6-digit Indian pincode'
      ]
    }
  },
  
  // Security & Privacy
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Emergency Contacts (Optional)
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      enum: ['family', 'friend', 'colleague', 'neighbor', 'other']
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // App Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'bn', 'te', 'ta', 'gu', 'mr', 'pa']
    },
    notifications: {
      type: Boolean,
      default: true
    },
    locationSharing: {
      type: Boolean,
      default: false
    },
    emergencyMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Safety Statistics
  safetyStats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    emergencyTriggers: {
      type: Number,
      default: 0
    },
    lastEmergencyDate: {
      type: Date
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ contactNumber: 1 });
userSchema.index({ 'address.city': 1, 'address.state': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name || 'Anonymous User';
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user data (without sensitive info)
userSchema.methods.getSafeData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
};

// Static method to find users by location
userSchema.statics.findByLocation = function(city, state) {
  return this.find({
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    isActive: true
  });
};

// Static method to get emergency contacts in area
userSchema.statics.getEmergencyContacts = function(city, state, limit = 10) {
  return this.find({
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    isActive: true,
    'preferences.locationSharing': true
  })
  .select('name contactNumber address emergencyContacts')
  .limit(limit);
};

module.exports = mongoose.model('User', userSchema);
