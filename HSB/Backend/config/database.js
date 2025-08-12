import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false; // serverless connection cache

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsb_database';

    if (process.env.NODE_ENV !== 'production') {
      console.log('Attempting to connect to MongoDB...');
      console.log('MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = !!conn.connections?.[0]?.readyState;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Make sure MongoDB is installed and running locally');
      console.log('2. Or create a .env file with your MongoDB Atlas connection string');
      console.log('3. If using Atlas, check your IP whitelist settings');
      console.log('4. Run "mongod" to start local MongoDB server\n');
    }

    // In serverless environments, do not exit process; bubble up error
    if (process.env.VERCEL) {
      throw error;
    }

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing without database connection (development mode)');
    }
  }
};

export default connectDB;