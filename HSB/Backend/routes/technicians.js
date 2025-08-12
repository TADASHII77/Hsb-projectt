import express from 'express';
import Technician from '../models/Technician.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Get all technicians
router.get('/', async (req, res) => {
  try {
    const technicians = await Technician.find().sort({ rating: -1 });
    res.json({
      success: true,
      count: technicians.length,
      data: technicians
    });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Find technician by owner's personal email
router.get('/by-owner-email', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query param is required' });
    }

    const technician = await Technician.findOne({ 'ownerDetails.personalEmail': email });
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Technician not found for owner email' });
    }

    res.json({ success: true, data: technician });
  } catch (error) {
    console.error('Error finding technician by owner email:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// Find technician by business email
router.get('/by-business-email', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query param is required' });
    }

    const technician = await Technician.findOne({ businessEmail: email });
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Technician not found for business email' });
    }

    res.json({ success: true, data: technician });
  } catch (error) {
    console.error('Error finding technician by business email:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// Get technician by ID
router.get('/:id', async (req, res) => {
  try {
    const technician = await Technician.findOne({ technicianId: req.params.id });
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    res.json({
      success: true,
      data: technician
    });
  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Search technicians
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');

    const technicians = await Technician.find({
      $or: [
        { name: searchRegex },
        { services: { $in: [searchRegex] } },
        { category: searchRegex },
        { expertise: searchRegex },
        { serviceAreas: searchRegex }
      ]
    }).sort({ rating: -1 });

    res.json({
      success: true,
      count: technicians.length,
      data: technicians
    });
  } catch (error) {
    console.error('Error searching technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Filter technicians by criteria
router.post('/filter', async (req, res) => {
  try {
    const { 
      job, 
      city, 
      category, 
      minRating, 
      verified, 
      emergency, 
      sortBy 
    } = req.body;

    let query = {};

    // Build query based on filters
    if (job) {
      const jobRegex = new RegExp(job, 'i');
      query.$or = [
        { name: jobRegex },
        { services: { $in: [jobRegex] } },
        { expertise: jobRegex }
      ];
    }

    if (city) {
      const cityRegex = new RegExp(city, 'i');
      query.serviceAreas = cityRegex;
    }

    if (category && category !== 'Categories') {
      query.category = category;
    }

    if (minRating) {
      const ratingMap = {
        '4.5+ Stars': 4.5,
        '4+ Stars': 4,
        '3+ Stars': 3
      };
      query.rating = { $gte: ratingMap[minRating] || minRating };
    }

    if (verified !== undefined) {
      query.verified = verified;
    }

    if (emergency !== undefined) {
      query.emergency = emergency;
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'Rating':
        sortCriteria = { rating: -1 };
        break;
      case 'Reviews':
        sortCriteria = { reviews: -1 };
        break;
      case 'Distance':
        sortCriteria = { distance: 1 };
        break;
      default:
        sortCriteria = { rating: -1 };
    }

    const technicians = await Technician.find(query).sort(sortCriteria);

    res.json({
      success: true,
      count: technicians.length,
      data: technicians
    });
  } catch (error) {
    console.error('Error filtering technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Create new technician (for admin use)
router.post('/', async (req, res) => {
  try {
    console.log('🔧 POST /technicians - Received technician data:');
    console.log('📋 Technician ID:', req.body.technicianId);
    console.log('🏢 Business Name:', req.body.name);
    console.log('📧 Business Email:', req.body.businessEmail);
    console.log('📱 Business Phone:', req.body.businessPhone);
    console.log('👤 Owner Details:', req.body.ownerDetails);
    console.log('🏠 Address Details:', req.body.addressDetails);
    console.log('⏰ Business Hours:', req.body.businessHours ? 'Present' : 'Missing');
    console.log('💰 Payment Methods:', req.body.acceptedPayments);
    console.log('📄 Application Status:', req.body.applicationStatus);
    
    // Check for duplicate business email before creating
    if (req.body.businessEmail) {
      const existingTechnician = await Technician.findOne({ 
        businessEmail: req.body.businessEmail.toLowerCase().trim() 
      });
      
      if (existingTechnician) {
        console.log('❌ Duplicate business email detected:', req.body.businessEmail);
        return res.status(400).json({
          success: false,
          message: 'DUPLICATE_EMAIL',
          details: 'A business with this email address is already registered. Each business can only register once per email address.',
          field: 'businessEmail',
          existingBusiness: existingTechnician.name
        });
      }
    }
    
    const technician = new Technician(req.body);
    console.log('🔨 Attempting to save technician...');
    
    const savedTechnician = await technician.save();
    console.log('✅ Technician saved successfully:', savedTechnician.technicianId);
    
    res.status(201).json({
      success: true,
      data: savedTechnician
    });
  } catch (error) {
    console.error('❌ Error creating technician:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.businessEmail) {
      console.log('❌ MongoDB duplicate key error for businessEmail');
      return res.status(400).json({
        success: false,
        message: 'DUPLICATE_EMAIL',
        details: 'A business with this email address is already registered. Each business can only register once per email address.',
        field: 'businessEmail'
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error('❌ Technician validation errors:', error.errors);
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating technician',
      error: error.message
    });
  }
});

// Request quote from technician
router.post('/:id/quote', async (req, res) => {
  try {
    console.log('Quote request received:', {
      technicianId: req.params.id,
      body: req.body
    });

    const { customerName, customerEmail } = req.body;
    
    // Validate required fields
    if (!customerName || !customerEmail) {
      console.log('Validation failed:', { customerName, customerEmail });
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required',
        received: { customerName, customerEmail }
      });
    }

    // Find the technician
    const technician = await Technician.findOne({ technicianId: req.params.id });
    
    if (!technician) {
      console.log('Technician not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
        technicianId: req.params.id
      });
    }

    console.log('Found technician:', { id: technician.technicianId, name: technician.name, email: technician.email });

    // Check if technician has email
    if (!technician.email) {
      console.log('Technician missing email:', technician.technicianId);
      return res.status(400).json({
        success: false,
        message: 'Technician email not configured',
        technicianId: technician.technicianId
      });
    }

    // Send emails
    const emailResult = await emailService.sendQuoteRequestEmails(
      technician.email,
      customerEmail,
      technician.name,
      customerName
    );

    if (emailResult.success) {
      console.log('Quote request processed successfully');
      res.json({
        success: true,
        message: 'Quote request sent successfully',
        data: {
          technician: {
            id: technician.technicianId,
            name: technician.name,
            email: technician.email
          },
          customer: {
            name: customerName,
            email: customerEmail
          },
          emailResults: emailResult.results
        }
      });
    } else {
      console.log('Email sending failed:', emailResult.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send quote request emails',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Error processing quote request:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Update technician profile (for business dashboard)
router.put('/:id', async (req, res) => {
  try {
    console.log('🔧 PUT /technicians/:id - Updating technician profile');
    console.log('📋 Technician ID:', req.params.id);
    console.log('📝 Update data keys:', Object.keys(req.body));
    
    const updatedTechnician = await Technician.findOneAndUpdate(
      { technicianId: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTechnician) {
      console.log('❌ Technician not found');
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    console.log('✅ Technician updated successfully');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedTechnician
    });
  } catch (error) {
    console.error('❌ Error updating technician:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

export default router; 