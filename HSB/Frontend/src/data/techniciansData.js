// Shared technician data for consistent information across components
export const techniciansData = {
  1: {
    id: 1,
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
    email: "business1@allgreenenergy.com",
    website: "www.allgreenenergysolutions.com",
    description: "All Green Energy Solutions is a leading HVAC contractor specializing in heating, cooling, and ventilation systems. We provide comprehensive services including installation, maintenance, and emergency repairs for residential and commercial properties across the Greater Toronto Area.",
    serviceAreas: "Toronto, Ontario; Vaughan, Ontario; Mississauga, Ontario; Markham, Ontario; Richmond Hill, Ontario",
    expertise: "HVAC contractor, Heating installation and repair, Air conditioning services, Ventilation systems, Emergency HVAC service, Furnace installation, Heat pump service, Duct cleaning, Thermostat installation, Boiler repair",
    workPhotos: ["/portfolio-1.png", "/image.png", "/hero-background.png", "/company-logo.png"] // Test work photos
  },
  2: {
    id: 2,
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
    email: "info@torontohvacexperts.com",
    website: "www.torontohvacexperts.com",
    description: "Toronto HVAC Experts provides professional heating, ventilation, and air conditioning services throughout Toronto. Our certified technicians specialize in AC repair, furnace service, and comprehensive duct cleaning solutions.",
    serviceAreas: "Toronto, Ontario; North York, Ontario; Scarborough, Ontario; Etobicoke, Ontario",
    expertise: "AC Repair, Furnace Service, Duct Cleaning, HVAC maintenance, Air quality improvement, Commercial HVAC, Residential HVAC"
  },
  3: {
    id: 3,
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
    email: "contact@climatecontrolmasters.com",
    website: "www.climatecontrolmasters.com",
    description: "Climate Control Masters offers complete HVAC solutions including new installations, routine maintenance, and emergency repairs. We pride ourselves on delivering quality workmanship and exceptional customer service.",
    serviceAreas: "Toronto, Ontario; East York, Ontario; The Beaches, Ontario",
    expertise: "HVAC Installation, System Maintenance, Emergency Repair, Climate Control, Energy Efficiency Solutions"
  },
  4: {
    id: 4,
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
  5: {
    id: 5,
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
  6: {
    id: 6,
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
  7: {
    id: 7,
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
  8: {
    id: 8,
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
  9: {
    id: 9,
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
  10: {
    id: 10,
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
};

// Convert to array format for list display
export const allTechnicians = Object.values(techniciansData);

// Sample reviews data
export const reviewsData = {
  1: [
    {
      id: 1,
      customerName: "User Full Name",
      rating: 4,
      date: "2024-01-15",
      service: "HVAC Service",
      comment: "I don't tend to write many reviews, however, I am extremely happy with the service from All Green Energy Solutions. I have been working with many contractors while renovating my house, and have endured many ups and downs. However, with All Green Energy Solutions, I had absolutely no issues. The consultant was great, the crew was exceptional and the office staff was very congenial and professional. The crew did a great job, and cleaned up nicely. They were very courteous to the neighbors on either side of us. What a nice break after dealing with a variety of contractors.",
      verified: true,
      reviewCount: 4
    },
    {
      id: 2,
      customerName: "Sarah Johnson",
      rating: 5,
      date: "2024-01-10",
      service: "Installation",
      comment: "Excellent service from start to finish. The team at All Green Energy Solutions was professional, punctual, and incredibly knowledgeable. They installed our new HVAC system efficiently and explained everything clearly. The pricing was fair and transparent. Highly recommend for anyone needing HVAC services.",
      verified: true,
      reviewCount: 7
    },
    {
      id: 3,
      customerName: "Mike Thompson",
      rating: 4,
      date: "2024-01-05",
      service: "Maintenance",
      comment: "Very satisfied with the maintenance service provided. The technician arrived on time, was courteous, and thoroughly inspected our heating system. They identified a minor issue and fixed it promptly. Great communication throughout the process. Will definitely use their services again.",
      verified: true,
      reviewCount: 2
    }
  ],
  // Add reviews for other technicians as needed
  2: [
    {
      id: 1,
      customerName: "David Kim",
      rating: 5,
      date: "2024-01-20",
      service: "AC Repair",
      comment: "Toronto HVAC Experts saved the day! Our AC broke down during a heatwave and they came out the same day. Professional service, fair pricing, and they fixed the issue quickly. The technician was knowledgeable and explained what went wrong. Excellent service!",
      verified: true,
      reviewCount: 3
    }
  ]
  // Continue for other technicians...
}; 