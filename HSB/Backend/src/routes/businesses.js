import express from "express";
import Business from "../models/Business.js";
import emailService from "../services/emailService.js";
import cloudinary from "../services/cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";
import bcrypt from "bcryptjs";

const router = express.Router();
const upload = multer();

// Public upload route for business registration
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    // Get business name from query parameter if available
    const businessName = req.query.businessName || "temp";
    const sanitizedBusinessName = businessName
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `hsb/${sanitizedBusinessName}`,
            public_id: `${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    const result = await streamUpload();
    return res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Get all businesses
router.get("/", async (req, res) => {
  try {
    const {
      status = "approved",
      limit = 50,
      page = 1,
      sort = "rating",
    } = req.query;

    const filter = { applicationStatus: status };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    let sortOption = { rating: -1 };
    if (sort === "name") sortOption = { name: 1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const businesses = await Business.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments(filter);

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: businesses,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get business by ID
router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Search businesses
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { status = "approved" } = req.query; // Only show approved businesses by default

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const filter = {
      applicationStatus: status,
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { services: searchRegex },
        { description: searchRegex },
        { "ownerName.firstName": searchRegex },
        { "ownerName.lastName": searchRegex },
        { "address.province": searchRegex },
        { "address.state": searchRegex },
        { "serviceRadius.city": searchRegex },
      ],
    };

    const businesses = await Business.find(filter)
      .sort({ rating: -1, verified: -1, expert: -1 })
      .limit(50); // Limit results for performance

    res.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("Error searching businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Filter businesses
router.post("/filter", async (req, res) => {
  try {
    console.log("Filter request body:", req.body);
    
    const {
      category,
      verified,
      expert,
      rating,
      city,
      province,
      services,
      status = "approved",
      paymentMethods,
      insurance,
      limit = 50,
      page = 1,
      sortBy,
      distance,
    } = req.body;

    const filter = { applicationStatus: status };

    // Basic filters
    if (category) filter.category = new RegExp(category, "i");
    if (verified !== undefined) filter.verified = verified;
    if (expert !== undefined) filter.expert = expert;
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    if (insurance !== undefined) filter.insurance = insurance;

    // Location filters
    if (city) {
      // Search in multiple location fields
      filter.$or = [
        { "address.province": new RegExp(city, "i") },
        { "address.state": new RegExp(city, "i") },
        { "serviceRadius.city": new RegExp(city, "i") },
      ];
      
      console.log("City filter applied:", { city, filter: filter.$or });
    }
    if (province) filter["address.province"] = new RegExp(province, "i");

    // Services filter
    if (services && services.length > 0) {
      filter.services = { $in: services.map((s) => new RegExp(s, "i")) };
    }

    // Payment methods filter
    if (paymentMethods && paymentMethods.length > 0) {
      filter.acceptedPayments = { $in: paymentMethods };
    }

    // Distance filter (if provided)
    if (distance) {
      // Filter businesses within the specified distance
      // The serviceRadius.distance is stored as a string like "10 km", so we need to extract the number
      const distanceNum = parseFloat(distance);
      if (!isNaN(distanceNum)) {
        // We'll handle distance filtering in the aggregation pipeline
        // For now, we'll just ensure the serviceRadius.distance field exists
        filter["serviceRadius.distance"] = { $exists: true, $ne: null };
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    let sortOption = { rating: -1, verified: -1, expert: -1 }; // default sort
    if (sortBy) {
      switch (sortBy.toLowerCase()) {
        case 'rating':
          sortOption = { rating: -1, verified: -1, expert: -1 };
          break;
        case 'reviews':
          sortOption = { reviews: -1, rating: -1, verified: -1 };
          break;
        case 'distance':
          sortOption = { "serviceRadius.distance": 1, rating: -1, verified: -1 };
          break;
        default:
          sortOption = { rating: -1, verified: -1, expert: -1 };
      }
    }

    // If distance filter is applied, use aggregation to properly handle string distance values
    if (distance && !isNaN(parseFloat(distance))) {
      const distanceNum = parseFloat(distance);
      
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            distanceValue: {
              $toDouble: {
                $replaceAll: {
                  input: { $replaceAll: { input: "$serviceRadius.distance", find: " ", replacement: "" } },
                  find: "km",
                  replacement: ""
                }
              }
            }
          }
        },
        { $match: { distanceValue: { $lte: distanceNum } } },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limitNum },
        { $unset: "distanceValue" }
      ];

      const businesses = await Business.aggregate(pipeline);
      const totalPipeline = [
        { $match: filter },
        {
          $addFields: {
            distanceValue: {
              $toDouble: {
                $replaceAll: {
                  input: { $replaceAll: { input: "$serviceRadius.distance", find: " ", replacement: "" } },
                  find: "km",
                  replacement: ""
                }
              }
            }
          }
        },
        { $match: { distanceValue: { $lte: distanceNum } } },
        { $count: "total" }
      ];
      
      const totalResult = await Business.aggregate(totalPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;
      
      return res.json({
        success: true,
        count: businesses.length,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        data: businesses,
      });
    }

    // Regular query for non-distance filtering
    const businesses = await Business.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments(filter);
    
    console.log("Filter results:", { 
      filter, 
      found: businesses.length, 
      total,
      sortBy,
      distance,
      sampleBusiness: businesses[0] ? {
        name: businesses[0].name,
        serviceRadius: businesses[0].serviceRadius,
        address: businesses[0].address
      } : null
    });

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: businesses,
    });
  } catch (error) {
    console.error("Error filtering businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Create new business
router.post("/", async (req, res) => {
  try {
    const businessData = req.body;

    // Check for duplicate email
    const existingBusiness = await Business.findOne({
      email: businessData.email.toLowerCase(),
    });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "DUPLICATE_EMAIL",
        existingBusiness: existingBusiness.name,
      });
    }

    // Hash password if provided
    if (businessData.password) {
      const salt = await bcrypt.genSalt(10);
      businessData.password = await bcrypt.hash(businessData.password, salt);
    }

    // Ensure email is lowercase
    if (businessData.email) {
      businessData.email = businessData.email.toLowerCase().trim();
    }

    // Set default values according to schema
    businessData.applicationStatus =
      businessData.applicationStatus || "under_review";
    businessData.verified = businessData.verified || false;
    businessData.expert = businessData.expert || false;
    businessData.rating = businessData.rating || 0;
    businessData.reviews = businessData.reviews || 0;

    // Set expert status based on rating (4+ stars)
    if (businessData.rating >= 4) {
      businessData.expert = true;
    }

    // Ensure address structure matches schema
    if (businessData.address && typeof businessData.address === "string") {
      businessData.address = {
        street: businessData.address,
        city: businessData.city || "",
        province: businessData.province || "",
        country: businessData.country || "Canada",
      };
    }

    // Ensure ownerName structure matches schema
    if (businessData.ownerName && typeof businessData.ownerName === "string") {
      const nameParts = businessData.ownerName.split(" ");
      businessData.ownerName = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      };
    }

    // Handle phone number mapping from frontend to backend
    if (businessData.personalPhone) {
      businessData.phone = businessData.personalPhone; // Use base schema phone field for owner
      delete businessData.personalPhone;
    }
    if (businessData.businessPhone) {
      // Keep businessPhone as is, it's already correctly named
    }

    const business = new Business(businessData);
    await business.save();

    // Send welcome email to business and notification to admin
    if (business.email) {
      try {
        const businessData = {
          businessName: business.name,
          businessEmail: business.email,
          ownerName: business.ownerName,
          businessPhone: business.businessPhone,
          ownerPhone: business.phone, // Use base schema phone field
          address: business.address,
          services: business.services,
          description: business.description,
          registrationDate: new Date().toLocaleDateString(),
        };

        await emailService.sendBusinessRegistrationEmails(businessData);
      } catch (emailError) {
        console.error(
          "Error sending business registration emails:",
          emailError
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Business created successfully",
      data: business,
    });
  } catch (error) {
    console.error("Error creating business:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "DUPLICATE_EMAIL",
        existingBusiness: "Business with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Update business
router.put("/:id", async (req, res) => {
  try {
    const updateData = req.body;

    // Ensure email is lowercase if being updated
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();

      // Check for duplicate email (excluding current business)
      const existingBusiness = await Business.findOne({
        email: updateData.email,
        _id: { $ne: req.params.id },
      });
      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: "DUPLICATE_EMAIL",
          existingBusiness: existingBusiness.name,
        });
      }
    }

    // Hash password if being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Ensure address structure matches schema
    if (updateData.address && typeof updateData.address === "string") {
      updateData.address = {
        street: updateData.address,
        city: updateData.city || "",
        province: updateData.province || "",
        country: updateData.country || "Canada",
      };
    }

    // Ensure ownerName structure matches schema
    if (updateData.ownerName && typeof updateData.ownerName === "string") {
      const nameParts = updateData.ownerName.split(" ");
      updateData.ownerName = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      };
    }

    // Handle phone number mapping from frontend to backend
    if (updateData.personalPhone) {
      updateData.phone = updateData.personalPhone; // Use base schema phone field for owner
      delete updateData.personalPhone;
    }
    if (updateData.businessPhone) {
      // Keep businessPhone as is, it's already correctly named
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      message: "Business updated successfully",
      data: business,
    });
  } catch (error) {
    console.error("Error updating business:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "DUPLICATE_EMAIL",
        existingBusiness: "Business with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Delete business
router.delete("/:id", async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Update business hours
router.put("/:id/hours", async (req, res) => {
  try {
    const { operatingHours } = req.body;

    // Validate operating hours structure
    if (!operatingHours || typeof operatingHours !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid operating hours format",
      });
    }

    // Validate each day has required fields
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    for (const day of days) {
      if (operatingHours[day] && typeof operatingHours[day] === "object") {
        const dayHours = operatingHours[day];
        if (dayHours.closed === false) {
          if (!dayHours.start || !dayHours.end) {
            return res.status(400).json({
              success: false,
              message: `Start and end times are required for ${day} when not closed`,
            });
          }
        }
      }
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { operatingHours },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      message: "Business hours updated successfully",
      data: business.operatingHours,
    });
  } catch (error) {
    console.error("Error updating business hours:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Update expert status (admin only)
router.put("/:id/expert", async (req, res) => {
  try {
    const { expert } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { expert },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      message: `Expert status ${expert ? "enabled" : "disabled"} successfully`,
      data: business,
    });
  } catch (error) {
    console.error("Error updating expert status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get businesses by category
router.get("/category/:category", async (req, res) => {
  try {
    const businesses = await Business.find({
      category: new RegExp(req.params.category, "i"),
    }).sort({ rating: -1 });

    res.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("Error fetching businesses by category:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get businesses by application status
router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const validStatuses = ["pending", "approved", "rejected", "under_review"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: pending, approved, rejected, under_review",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const businesses = await Business.find({ applicationStatus: status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments({ applicationStatus: status });

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: businesses,
    });
  } catch (error) {
    console.error("Error fetching businesses by status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get verified businesses
router.get("/verified/all", async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const businesses = await Business.find({
      verified: true,
      applicationStatus: "approved",
    })
      .sort({ rating: -1, expert: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments({
      verified: true,
      applicationStatus: "approved",
    });

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: businesses,
    });
  } catch (error) {
    console.error("Error fetching verified businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get expert businesses
router.get("/expert/all", async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const businesses = await Business.find({
      expert: true,
      applicationStatus: "approved",
    })
      .sort({ rating: -1, verified: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments({
      expert: true,
      applicationStatus: "approved",
    });

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: businesses,
    });
  } catch (error) {
    console.error("Error fetching expert businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export default router;
