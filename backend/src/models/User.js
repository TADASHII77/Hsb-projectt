import mongoose from 'mongoose';

// Base schema for common fields between User/Admin and Business
const baseSchema = new mongoose.Schema({
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
  password: {
    type: String,
    select: false
  },
  address: {
    street: String,
    province: String,
    state: String,
    country: {
      type: String,
      default: 'Canada'
    }
  }
}, {
  timestamps: true,
  discriminatorKey: 'userType', // This will be used to differentiate between User/Admin and Business
  collection: 'users' // Explicitly set collection name
});

// Indexes for the base schema
baseSchema.index({ email: 1 }, { unique: true });
baseSchema.index({ 'address.province': 1, 'address.state': 1 });

// Virtual for full address
baseSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.street || ''}, ${this.address.province || ''}, ${this.address.state || ''}, ${this.address.country || ''}`.trim();
});

// User/Admin discriminator schema
const userAdminSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['Customer', 'Admin'],
    default: 'Customer'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
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
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  enquiryCount: {
    type: Number,
    default: 3
  },
  enquiries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  }]
});

// Indexes for User/Admin
userAdminSchema.index({ role: 1, status: 1 });
userAdminSchema.index({ enquiryCount: 1 });

// Create the base model with a unique name to avoid conflicts
const BaseUser = mongoose.model('BaseUser', baseSchema);

// Create User/Admin discriminator
const User = BaseUser.discriminator('User', userAdminSchema);

export { BaseUser, User };
export default User; 