import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true,
    enum: ['Immediately', 'Within a week', 'Within a month', 'Flexible']
  },
  budget: {
    type: String,
    required: true,
    enum: ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000 - $10,000', '$10,000+', 'Not sure']
  },
  images: [{
    type: String // Store image URLs/paths
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  quotes: [{
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician'
    },
    amount: Number,
    description: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster searches
jobSchema.index({ city: 1, service: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job; 