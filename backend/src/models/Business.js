import mongoose from 'mongoose';
import { BaseUser } from './User.js';

// Business hours schema for each day
const businessHoursSchema = new mongoose.Schema({
  start: {
    type: String,
    default: '9:00 AM'
  },
  end: {
    type: String,
    default: '5:00 PM'
  },
  closed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Service radius schema
const serviceRadiusSchema = new mongoose.Schema({
  city: {
    type: String,
    default: ''
  },
  distance: {
    type: String,
    default: '10 km'
  }
}, { _id: false });

// Business discriminator schema
const businessSchema = new mongoose.Schema({
  reviews: {
    type: Number,
    default: 0,
    // This will be a fixed value, no system to update
  },
  logo: {
    type: String, // URL or base64 encoded image
    default: null
  },
  images: [{
    type: String // Array of URLs for carousel
  }],
  expert: {
    type: Boolean,
    default: false
    // Limited to those with 4+ ratings or set through admin
  },
  services: [{
    type: String,
    required: true
    // Services they provide, used to fetch business according to user job requirement
  }],
  ownerName: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    }
  },
  // Business phone number (owner phone is inherited from base schema as 'phone')
  businessPhone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
    // Optional field
  },
  description: {
    type: String,
    required: true,
    trim: true
    // Will also be used to filter business
  },
  operatingHours: {
    monday: businessHoursSchema,
    tuesday: businessHoursSchema,
    wednesday: businessHoursSchema,
    thursday: businessHoursSchema,
    friday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema
  },
  serviceRadius: serviceRadiusSchema,
  insurance: {
    type: Boolean,
    default: false
    // Do they provide insurance or not
  },
  insuranceNumber: {
    type: String,
    trim: true
    // Insurance number if they provide insurance
  },
  acceptedPayments: [{
    type: String,
    trim: true,
    enum: ['cash', 'credit', 'debit', 'financing']
    // Payment methods the business accepts
  }],
  googleBusinessLink: {
    type: String,
    trim: true
  },
  
  // Additional fields for compatibility
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  
  // Application status
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'under_review'
  }
});

// Add indexes for performance and search
businessSchema.index({ services: 1 });
businessSchema.index({ 'ownerName.firstName': 1, 'ownerName.lastName': 1 });
businessSchema.index({ expert: 1 });
businessSchema.index({ rating: -1 });

// Virtual for full owner name
businessSchema.virtual('ownerFullName').get(function() {
  if (!this.ownerName) return '';
  const firstName = this.ownerName.firstName || '';
  const lastName = this.ownerName.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Create Business discriminator using the BaseUser model
const Business = BaseUser.discriminator('Business', businessSchema);

export default Business;
