import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Sample technician data (from your existing data)
const techniciansData = [
  {
    technicianId: 1,
    name: "All Green Energy Solutions",
    rating: 4.8,
    reviews: 127,
    services: ["Heating", "Cooling", "Ventilation"],
    verified: true,
    emergency: true,
    distance: 2.3,
    category: "Heating",
    address: "9400 ON-27, Vaughan, ON L4H 0J2",
    phone: "(416) 555-0101",
    website: "www.allgreenenergysolutions.com",
    description: "All Green Energy Solutions is a leading HVAC contractor specializing in heating, cooling, and ventilation systems. We provide comprehensive services including installation, maintenance, and emergency repairs for residential and commercial properties across the Greater Toronto Area.",
    serviceAreas: "Toronto, Ontario; Vaughan, Ontario; Mississauga, Ontario; Markham, Ontario; Richmond Hill, Ontario",
    expertise: "HVAC contractor, Heating installation and repair, Air conditioning services, Ventilation systems, Emergency HVAC service, Furnace installation, Heat pump service, Duct cleaning, Thermostat installation, Boiler repair"
  },
  {
    technicianId: 2,
    name: "Toronto HVAC Experts",
    rating: 4.9,
    reviews: 89,
    services: ["AC Repair", "Furnace Service", "Duct Cleaning"],
    verified: true,
    emergency: false,
    distance: 1.8,
    category: "Cooling",
    address: "123 King St, Toronto, ON M5H 1A1",
    phone: "(416) 555-0102",
    website: "www.torontohvacexperts.com",
    description: "Toronto HVAC Experts provides professional heating, ventilation, and air conditioning services throughout Toronto. Our certified technicians specialize in AC repair, furnace service, and comprehensive duct cleaning solutions.",
    serviceAreas: "Toronto, Ontario; North York, Ontario; Scarborough, Ontario; Etobicoke, Ontario",
    expertise: "AC Repair, Furnace Service, Duct Cleaning, HVAC maintenance, Air quality improvement, Commercial HVAC, Residential HVAC"
  },
  {
    technicianId: 3,
    name: "Climate Control Masters",
    rating: 4.7,
    reviews: 156,
    services: ["Installation", "Maintenance", "Emergency Repair"],
    verified: true,
    emergency: true,
    distance: 3.1,
    category: "Installation",
    address: "456 Queen St, Toronto, ON M4C 1N4",
    phone: "(416) 555-0103",
    website: "www.climatecontrolmasters.com",
    description: "Climate Control Masters offers complete HVAC solutions including new installations, routine maintenance, and emergency repairs. We pride ourselves on delivering quality workmanship and exceptional customer service.",
    serviceAreas: "Toronto, Ontario; East York, Ontario; The Beaches, Ontario",
    expertise: "HVAC Installation, System Maintenance, Emergency Repair, Climate Control, Energy Efficiency Solutions"
  },
  {
    technicianId: 4,
    name: "Premier Heating & Cooling",
    rating: 4.6,
    reviews: 203,
    services: ["Heat Pump", "Air Conditioning", "Boiler Service"],
    verified: true,
    emergency: false,
    distance: 4.2,
    category: "Heating",
    address: "789 Bloor St, Toronto, ON M6G 1K5",
    phone: "(416) 555-0104",
    website: "www.premierheatingcooling.com",
    description: "Premier Heating & Cooling specializes in heat pump installations, air conditioning systems, and boiler services. We provide energy-efficient solutions for both residential and commercial properties.",
    serviceAreas: "Toronto, Ontario; Bloor West Village, Ontario; High Park, Ontario",
    expertise: "Heat Pump installation and service, Air Conditioning repair and maintenance, Boiler Service, Energy-efficient heating solutions"
  },
  {
    technicianId: 5,
    name: "Reliable HVAC Services",
    rating: 4.8,
    reviews: 94,
    services: ["Residential", "Commercial", "Industrial"],
    verified: true,
    emergency: true,
    distance: 1.5,
    category: "Repair",
    address: "321 Dundas St, Toronto, ON M5B 1B8",
    phone: "(416) 555-0105",
    website: "www.reliablehvacservices.com",
    description: "Reliable HVAC Services provides comprehensive heating and cooling solutions for residential, commercial, and industrial properties. Our experienced team ensures reliable and efficient HVAC systems.",
    serviceAreas: "Toronto, Ontario; Downtown Toronto, Ontario; Financial District, Ontario",
    expertise: "Residential HVAC, Commercial HVAC, Industrial HVAC, System repair and maintenance, Emergency services"
  },
  {
    technicianId: 6,
    name: "Toronto Comfort Solutions",
    rating: 4.5,
    reviews: 178,
    services: ["Smart Thermostats", "Energy Efficiency", "Maintenance"],
    verified: true,
    emergency: false,
    distance: 5.1,
    category: "Maintenance",
    address: "654 College St, Toronto, ON M6G 1B5",
    phone: "(416) 555-0106",
    website: "www.torontocomfortsolutions.com",
    description: "Toronto Comfort Solutions focuses on smart home technology and energy-efficient HVAC solutions. We specialize in smart thermostat installations and comprehensive maintenance programs.",
    serviceAreas: "Toronto, Ontario; Little Italy, Ontario; Trinity Bellwoods, Ontario",
    expertise: "Smart Thermostats, Energy Efficiency, HVAC Maintenance, Home automation, Preventive maintenance programs"
  },
  {
    technicianId: 7,
    name: "Elite HVAC Technicians",
    rating: 4.9,
    reviews: 112,
    services: ["Emergency Service", "Installation", "Repair"],
    verified: true,
    emergency: true,
    distance: 2.8,
    category: "Emergency",
    address: "987 Spadina Ave, Toronto, ON M5S 2J5",
    phone: "(416) 555-0107",
    website: "www.elitehvactechnicians.com",
    description: "Elite HVAC Technicians provides top-tier emergency HVAC services, installations, and repairs. Our elite team of certified technicians is available 24/7 for all your heating and cooling needs.",
    serviceAreas: "Toronto, Ontario; Kensington Market, Ontario; University of Toronto area, Ontario",
    expertise: "Emergency HVAC Service, Professional Installation, Expert Repair, 24/7 service, Certified technicians"
  },
  {
    technicianId: 8,
    name: "GTA Heating & Air",
    rating: 4.7,
    reviews: 145,
    services: ["Furnace Repair", "AC Installation", "Duct Work"],
    verified: true,
    emergency: false,
    distance: 3.7,
    category: "Installation",
    address: "159 Bay St, Toronto, ON M5J 2R8",
    phone: "(416) 555-0108",
    website: "www.gtaheatingair.com",
    description: "GTA Heating & Air offers comprehensive furnace repair, AC installation, and ductwork services throughout the Greater Toronto Area. We provide reliable solutions for all your HVAC needs.",
    serviceAreas: "Toronto, Ontario; Financial District, Ontario; Harbourfront, Ontario",
    expertise: "Furnace Repair, AC Installation, Duct Work, HVAC system design, Indoor air quality"
  },
  {
    technicianId: 9,
    name: "Fast Fix HVAC",
    rating: 4.4,
    reviews: 67,
    services: ["Emergency Repair", "24/7 Service", "Quick Response"],
    verified: false,
    emergency: true,
    distance: 1.2,
    category: "Emergency",
    address: "753 Yonge St, Toronto, ON M4Y 2B7",
    phone: "(416) 555-0109",
    website: "www.fastfixhvac.com",
    description: "Fast Fix HVAC specializes in emergency repairs and quick response service. We provide 24/7 emergency HVAC services with rapid response times for urgent heating and cooling issues.",
    serviceAreas: "Toronto, Ontario; Yonge and Eglinton, Ontario; Midtown Toronto, Ontario",
    expertise: "Emergency Repair, 24/7 Service, Quick Response, Urgent HVAC issues, Fast diagnosis and repair"
  },
  {
    technicianId: 10,
    name: "Green Energy HVAC",
    rating: 4.6,
    reviews: 198,
    services: ["Eco-Friendly", "Heat Pumps", "Solar Integration"],
    verified: true,
    emergency: false,
    distance: 6.2,
    category: "Installation",
    address: "852 Richmond St, Toronto, ON M6J 1C5",
    phone: "(416) 555-0110",
    website: "www.greenenergyhvac.com",
    description: "Green Energy HVAC specializes in eco-friendly heating and cooling solutions. We focus on energy-efficient heat pumps, solar integration, and sustainable HVAC technologies for environmentally conscious customers.",
    serviceAreas: "Toronto, Ontario; King West, Ontario; Liberty Village, Ontario",
    expertise: "Eco-Friendly HVAC, Heat Pumps, Solar Integration, Sustainable technologies, Energy efficiency, Green building solutions"
  }
];

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(limiter); // Rate limiting
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
})); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Helper function to filter technicians
const filterTechnicians = (technicians, filters) => {
  let filtered = [...technicians];

  if (filters.job) {
    const jobRegex = new RegExp(filters.job, 'i');
    filtered = filtered.filter(tech => 
      tech.name.match(jobRegex) ||
      tech.services.some(service => service.match(jobRegex)) ||
      tech.expertise.match(jobRegex)
    );
  }

  if (filters.city) {
    const cityRegex = new RegExp(filters.city, 'i');
    filtered = filtered.filter(tech => tech.serviceAreas.match(cityRegex));
  }

  if (filters.category && filters.category !== 'Categories') {
    filtered = filtered.filter(tech => tech.category === filters.category);
  }

  if (filters.minRating) {
    const ratingMap = {
      '4.5+ Stars': 4.5,
      '4+ Stars': 4,
      '3+ Stars': 3
    };
    const minRating = ratingMap[filters.minRating] || filters.minRating;
    filtered = filtered.filter(tech => tech.rating >= minRating);
  }

  if (filters.verified !== undefined) {
    filtered = filtered.filter(tech => tech.verified === filters.verified);
  }

  if (filters.emergency !== undefined) {
    filtered = filtered.filter(tech => tech.emergency === filters.emergency);
  }

  // Sort
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'Rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'Distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      default:
        filtered.sort((a, b) => b.rating - a.rating);
    }
  }

  return filtered;
};

// Admin Routes
app.get('/api/admin/stats', (req, res) => {
  try {
    const totalTechnicians = techniciansData.length;
    const verifiedTechnicians = techniciansData.filter(tech => tech.verified).length;
    const emergencyTechnicians = techniciansData.filter(tech => tech.emergency).length;
    const averageRating = techniciansData.reduce((sum, tech) => sum + tech.rating, 0) / totalTechnicians;
    const totalReviews = techniciansData.reduce((sum, tech) => sum + tech.reviews, 0);

    const categoryDistribution = techniciansData.reduce((acc, tech) => {
      acc[tech.category] = (acc[tech.category] || 0) + 1;
      return acc;
    }, {});

    const topTechnicians = [...techniciansData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        overview: {
          totalTechnicians,
          verifiedTechnicians,
          emergencyTechnicians,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        },
        categoryDistribution: Object.entries(categoryDistribution).map(([category, count]) => ({
          _id: category,
          count
        })),
        topTechnicians
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

app.get('/api/admin/technicians', (req, res) => {
  try {
    const { search, category, verified, emergency } = req.query;
    
    let filtered = [...techniciansData];
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filtered = filtered.filter(tech => 
        tech.name.match(searchRegex) ||
        tech.address.match(searchRegex) ||
        tech.phone.match(searchRegex)
      );
    }
    
    if (category) filtered = filtered.filter(tech => tech.category === category);
    if (verified !== undefined) filtered = filtered.filter(tech => tech.verified === (verified === 'true'));
    if (emergency !== undefined) filtered = filtered.filter(tech => tech.emergency === (emergency === 'true'));

    res.json({
      success: true,
      data: filtered,
      pagination: {
        page: 1,
        limit: filtered.length,
        total: filtered.length,
        pages: 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
});

app.patch('/api/admin/technicians/:id/verify', (req, res) => {
  try {
    const technicianIndex = techniciansData.findIndex(tech => tech.technicianId == req.params.id);
    
    if (technicianIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    techniciansData[technicianIndex].verified = !techniciansData[technicianIndex].verified;

    res.json({
      success: true,
      data: techniciansData[technicianIndex],
      message: `Technician ${techniciansData[technicianIndex].verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
});

// Routes
// Get all technicians
app.get('/api/technicians', (req, res) => {
  try {
    const sortedTechnicians = [...techniciansData].sort((a, b) => b.rating - a.rating);
    res.json({
      success: true,
      count: sortedTechnicians.length,
      data: sortedTechnicians
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

// Get technician by ID
app.get('/api/technicians/:id', (req, res) => {
  try {
    const technician = techniciansData.find(tech => tech.technicianId == req.params.id);
    
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
app.get('/api/technicians/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');

    const technicians = techniciansData.filter(tech => 
      tech.name.match(searchRegex) ||
      tech.services.some(service => service.match(searchRegex)) ||
      tech.category.match(searchRegex) ||
      tech.expertise.match(searchRegex) ||
      tech.serviceAreas.match(searchRegex)
    ).sort((a, b) => b.rating - a.rating);

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

// Filter technicians
app.post('/api/technicians/filter', (req, res) => {
  try {
    const filters = req.body;
    const filtered = filterTechnicians(techniciansData, filters);

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HSB Backend API is running successfully (Temporary In-Memory Mode)',
    timestamp: new Date().toISOString(),
    mode: 'in-memory'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Home Service Bureau API (Temporary Mode)',
    version: '1.0.0',
    mode: 'in-memory',
    endpoints: {
      health: '/api/health',
      technicians: '/api/technicians',
      technicianById: '/api/technicians/:id',
      searchTechnicians: '/api/technicians/search/:query',
      filterTechnicians: '/api/technicians/filter'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Mode: In-Memory (Temporary)`);
  console.log(`🌐 API Documentation available at: http://localhost:${PORT}`);
  console.log(`💡 Note: This is a temporary server without MongoDB. Once MongoDB connection is fixed, use the main server.js`);
}); 