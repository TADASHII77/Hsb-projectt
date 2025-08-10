#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 HSB MongoDB Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# MongoDB Configuration
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/hsb_database

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Admin Email
ADMIN_EMAIL=admin@example.com

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
  } catch (error) {
    console.log('❌ Could not create .env file:', error.message);
    console.log('Please create it manually with your MongoDB connection string.');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🔧 Setup Options:\n');
console.log('1. LOCAL MONGODB (Recommended for development):');
console.log('   - Install MongoDB Community Edition');
console.log('   - Run: mongod');
console.log('   - Use: mongodb://localhost:27017/hsb_database');
console.log('');
console.log('2. MONGODB ATLAS (Cloud):');
console.log('   - Create account at https://cloud.mongodb.com');
console.log('   - Create cluster and get connection string');
console.log('   - Add your IP to whitelist');
console.log('   - Update MONGODB_URI in .env file');
console.log('');
console.log('3. DOCKER MONGODB:');
console.log('   - Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
console.log('   - Use: mongodb://localhost:27017/hsb_database');
console.log('');

// Check if MongoDB is running locally
import { spawn } from 'child_process';

console.log('🔍 Checking if MongoDB is running locally...');

const mongoCheck = spawn('mongosh', ['--eval', 'db.runCommand("ping").ok'], { stdio: 'pipe' });

mongoCheck.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Local MongoDB is running!');
  } else {
    console.log('❌ Local MongoDB is not running');
    console.log('💡 To start MongoDB:');
    console.log('   - Windows: Run "mongod" in command prompt');
    console.log('   - macOS: brew services start mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod');
  }
  
  console.log('\n🚀 After setting up MongoDB, restart the server with: npm start');
  console.log('⚠️  Remember to update your .env file with actual credentials!');
});

mongoCheck.on('error', (error) => {
  console.log('❌ MongoDB CLI not found. Please install MongoDB or use Atlas.');
  console.log('\n🚀 After setting up MongoDB, restart the server with: npm start');
  console.log('⚠️  Remember to update your .env file with actual credentials!');
}); 