import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    default: Date.now
  },
  service: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  reviewCount: {
    type: Number,
    default: 0
  }
});

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

// Owner/Personal details schema
const ownerDetailsSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  personalPhone: String,
  personalEmail: String
}, { _id: false });

// Address details schema
const addressDetailsSchema = new mongoose.Schema({
  businessAddress: String,
  streetAddress: String,
  city: String,
  province: String,
  country: String,
  postalCode: String
}, { _id: false });

const technicianSchema = new mongoose.Schema({
  technicianId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: false,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  services: [{
    type: String,
    required: false
  }],
  verified: {
    type: Boolean,
    default: false
  },
  emergency: {
    type: Boolean,
    default: false
  },
  distance: {
    type: Number,
    required: false,
    default: 0
  },
  category: {
    type: String,
    required: false,
    default: 'General'
  },
  address: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  website: {
    type: String
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  serviceAreas: {
    type: String,
    required: false,
    default: ''
  },
  expertise: {
    type: String,
    required: false,
    default: ''
  },
  logo: {
    type: String, // Base64 encoded image or URL
    default: null
  },
  workPhotos: [{
    type: String // Array of Base64 encoded images or URLs
  }],
  reviewsData: [reviewSchema],

  // New fields from BusinessPosting form
  ownerDetails: ownerDetailsSchema,
  
  addressDetails: addressDetailsSchema,
  
  businessPhone: String,
  businessEmail: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values but ensures uniqueness for non-null values
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if email is provided
        if (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        }
        return true;
      },
      message: 'Please enter a valid business email address'
    }
  },
  
  businessWebsite: String,
  businessDescription: String,
  
  // Business hours for each day of the week
  businessHours: {
    monday: businessHoursSchema,
    tuesday: businessHoursSchema,
    wednesday: businessHoursSchema,
    thursday: businessHoursSchema,
    friday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema
  },
  
  // Service radius
  serviceRadius: serviceRadiusSchema,
  
  // Insurance/warranty info
  providesInsurance: {
    type: String,
    enum: ['yes', 'no', ''],
    default: ''
  },
  insuranceNumber: String,
  
  // Payment methods
  acceptedPayments: [{
    type: String,
    enum: ['Cash', 'Debit Card', 'Credit Card', 'Financing']
  }],
  
  // Google Maps integration
  googleMapsLink: String,
  
  // Application status
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  
  // Profile completion status
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for performance and uniqueness
technicianSchema.index({ businessEmail: 1 }, { unique: true, sparse: true });
technicianSchema.index({ technicianId: 1 }, { unique: true });

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician; 