import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Hashed password for authentication (optional for customers who haven't set one)
  passwordHash: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['Customer', 'Technician', 'Admin'],
    default: 'Customer'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Canada'
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    serviceCategories: [{
      type: String
    }]
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  // For business/technician users
  businessInfo: {
    companyName: String,
    businessNumber: String,
    licenseNumber: String,
    insuranceInfo: String,
    website: String,
    serviceAreas: [String],
    specialties: [String]
  },
  // User activity tracking
  jobsPosted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  jobsCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'address.city': 1, 'address.postalCode': 1 });

// Virtual for full name if needed
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.street || ''}, ${this.address.city || ''}, ${this.address.province || ''} ${this.address.postalCode || ''}`.trim();
});

const User = mongoose.model('User', userSchema);

export default User; 