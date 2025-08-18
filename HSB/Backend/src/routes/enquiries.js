import express from "express";
import Enquiry from "../models/Enquiry.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

const router = express.Router();

// Create a new enquiry
router.post("/", async (req, res) => {
  try {
    const {
      businessId,
      customerName,
      customerEmail,
      service,
      location,
      description,
      category,
      estimatedBudget,
      preferredDate,
      preferredTime,
      contactPreference,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (!businessId || !customerName || !customerEmail || !service || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: businessId, customerName, customerEmail, service, description, category"
      });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    // Find or create user by email
    let user = await User.findOne({ email: customerEmail });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enquiries left
    if (user.enquiryCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No enquiries remaining. Please upgrade your account."
      });
    }

    // Create the enquiry
    const enquiry = new Enquiry({
      business: businessId,
      user: user._id,
      service: Array.isArray(service) ? service : [service],
      location: location || {},
      description,
      category,
      estimatedBudget: estimatedBudget || { min: 0, max: 0 },
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      preferredTime,
      contactPreference: contactPreference || 'email',
      additionalNotes
    });

    await enquiry.save();

    // Send email notifications
    try {
      // Send email to business
      await emailService.sendBusinessEnquiryNotification(business, enquiry, user);
      
      // Send confirmation email to customer
      await emailService.sendCustomerEnquiryConfirmation(user, enquiry, business);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      data: {
        enquiryId: enquiry._id,
        remainingEnquiries: user.enquiryCount - 1
      }
    });

  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create enquiry",
      error: error.message
    });
  }
});

// Get enquiries for a business
router.get("/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { business: businessId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const enquiries = await Enquiry.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Enquiry.countDocuments(filter);

    res.json({
      success: true,
      count: enquiries.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: enquiries
    });

  } catch (error) {
    console.error("Error fetching business enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message
    });
  }
});

// Get enquiries for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const enquiries = await Enquiry.find(filter)
      .populate('business', 'name logo category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Enquiry.countDocuments(filter);

    res.json({
      success: true,
      count: enquiries.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: enquiries
    });

  } catch (error) {
    console.error("Error fetching user enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message
    });
  }
});

// Update enquiry status
router.patch("/:enquiryId/status", async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, in_progress, completed, cancelled"
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status },
      { new: true }
    ).populate('business user');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: enquiry
    });

  } catch (error) {
    console.error("Error updating enquiry status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry status",
      error: error.message
    });
  }
});

// Get enquiry by ID
router.get("/:enquiryId", async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findById(enquiryId)
      .populate('business', 'name logo category email phone')
      .populate('user', 'name email phone');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
      error: error.message
    });
  }
});

export default router;
