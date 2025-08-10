#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Technician from '../models/Technician.js';

dotenv.config();

const addEmailsToTechnicians = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hsb_database');
    console.log('✅ Connected to MongoDB');

    // Get all technicians without email
    const technicians = await Technician.find({ 
      $or: [
        { email: { $exists: false } },
        { email: null },
        { email: '' }
      ]
    });

    console.log(`Found ${technicians.length} technicians without email addresses`);

    // Sample email domains for different types of businesses
    const emailDomains = [
      'hvacservices.com',
      'heatingcooling.ca',
      'climatecontrol.com',
      'airtech.ca',
      'hvacpro.com'
    ];

    // Update each technician with a generated email
    for (let i = 0; i < technicians.length; i++) {
      const tech = technicians[i];
      
      // Generate email based on company name
      const cleanName = tech.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .substring(0, 15); // Limit length
      
      const domain = emailDomains[i % emailDomains.length];
      const generatedEmail = `${cleanName}@${domain}`;

      // Update the technician
      await Technician.updateOne(
        { _id: tech._id },
        { $set: { email: generatedEmail } }
      );

      console.log(`✅ Updated ${tech.name} with email: ${generatedEmail}`);
    }

    console.log(`\n🎉 Successfully updated ${technicians.length} technicians with email addresses!`);
    
    // Display updated technicians
    const updatedTechs = await Technician.find({}, 'name email technicianId').limit(10);
    console.log('\n📋 Sample updated technicians:');
    updatedTechs.forEach(tech => {
      console.log(`  ${tech.technicianId}: ${tech.name} - ${tech.email}`);
    });

  } catch (error) {
    console.error('❌ Error updating technicians:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  addEmailsToTechnicians();
}

export default addEmailsToTechnicians; 