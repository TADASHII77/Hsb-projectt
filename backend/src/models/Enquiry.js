import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from 'UserAdmin' to 'User' to match discriminator
    required: true
  },
  service: [{
    type: String,
    required: true
  }],
  location: {
    street: String,
    province: String,
    state: String,
    country: {
      type: String,
      default: 'Canada'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedBudget: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    }
  },
  preferredDate: {
    type: Date
  },
  preferredTime: {
    type: String
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance and search
enquirySchema.index({ business: 1, createdAt: -1 });
enquirySchema.index({ user: 1, createdAt: -1 });
enquirySchema.index({ category: 1 });
enquirySchema.index({ service: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ 'location.province': 1, 'location.state': 1 });

// Virtual for full location
enquirySchema.virtual('fullLocation').get(function() {
  if (!this.location) return '';
  return `${this.location.street || ''}, ${this.location.province || ''}, ${this.location.state || ''}, ${this.location.country || ''}`.trim();
});

// Pre-save middleware to update user's enquiry count
enquirySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Import User model dynamically to avoid circular dependency
      const { User } = await import('./User.js');
      await User.findByIdAndUpdate(
        this.user,
        { $inc: { enquiryCount: -1 } }
      );
    } catch (error) {
      console.error('Error updating user enquiry count:', error);
    }
  }
  next();
});

// Pre-remove middleware to restore user's enquiry count
enquirySchema.pre('remove', async function(next) {
  try {
    // Import User model dynamically to avoid circular dependency
    const { User } = await import('./User.js');
    await User.findByIdAndUpdate(
      this.user,
      { $inc: { enquiryCount: 1 } }
    );
  } catch (error) {
    console.error('Error restoring user enquiry count:', error);
  }
  next();
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
