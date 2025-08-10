import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = express.Router();

// Get all jobs (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      city, 
      service, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (service) filter.service = new RegExp(service, 'i');

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(filter)
      .populate('assignedTechnician', 'name phone email')
      .populate('quotes.technicianId', 'name rating')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('assignedTechnician')
      .populate('quotes.technicianId', 'name rating reviews verified');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// Create new job posting
router.post('/', async (req, res) => {
  try {
    const {
      service,
      postalCode,
      city,
      description,
      startTime,
      budget,
      customerInfo,
      images = []
    } = req.body;

    // Validate required fields
    if (!service || !postalCode || !city || !description || !startTime || !budget) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create new job
    const newJob = new Job({
      service,
      postalCode,
      city,
      description,
      startTime,
      budget,
      customerInfo,
      images,
      status: 'pending'
    });

    const savedJob = await newJob.save();

    // If customer info provided, try to find or create user
    if (customerInfo && customerInfo.email) {
      try {
        let user = await User.findOne({ email: customerInfo.email });
        
        if (!user) {
          user = new User({
            name: customerInfo.name || 'Unknown',
            email: customerInfo.email,
            phone: customerInfo.phone,
            role: 'Customer'
          });
          await user.save();
        }

        // Add job to user's posted jobs
        user.jobsPosted.push(savedJob._id);
        await user.save();
      } catch (userError) {
        console.error('Error handling user:', userError);
        // Continue even if user creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: savedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job posting',
      error: error.message
    });
  }
});

// Update job status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message
    });
  }
});

// Assign technician to job
router.patch('/:id/assign', async (req, res) => {
  try {
    const { technicianId } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTechnician: technicianId,
        status: 'in_progress'
      },
      { new: true }
    ).populate('assignedTechnician');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Technician assigned successfully',
      data: job
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning technician',
      error: error.message
    });
  }
});

// Add quote to job
router.post('/:id/quotes', async (req, res) => {
  try {
    const { technicianId, amount, description } = req.body;

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if technician has already quoted
    const existingQuote = job.quotes.find(
      quote => quote.technicianId.toString() === technicianId
    );

    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: 'Technician has already submitted a quote for this job'
      });
    }

    job.quotes.push({
      technicianId,
      amount,
      description
    });

    await job.save();

    const updatedJob = await Job.findById(req.params.id)
      .populate('quotes.technicianId', 'name rating reviews verified');

    res.json({
      success: true,
      message: 'Quote added successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error adding quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding quote',
      error: error.message
    });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
});

// Get job statistics for dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const inProgressJobs = await Job.countDocuments({ status: 'in_progress' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    // Jobs by city
    const jobsByCity = await Job.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Jobs by service type
    const jobsByService = await Job.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('service city status createdAt customerInfo.name');

    res.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          pendingJobs,
          inProgressJobs,
          completedJobs
        },
        distribution: {
          byCity: jobsByCity,
          byService: jobsByService
        },
        recent: recentJobs
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message
    });
  }
});

export default router; 