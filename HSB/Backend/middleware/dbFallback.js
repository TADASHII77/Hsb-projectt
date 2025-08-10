// Fallback data for development when MongoDB is not available

let fallbackJobs = [];
let fallbackUsers = [
  {
    _id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Customer',
    status: 'Active',
    joinDate: new Date('2024-01-15'),
    lastActive: new Date(),
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@hvac.com',
    role: 'Technician',
    status: 'Active',
    joinDate: new Date('2024-01-10'),
    lastActive: new Date(),
    createdAt: new Date('2024-01-10')
  }
];

export const dbFallbackMiddleware = (req, res, next) => {
  // Check if MongoDB is connected
  const mongoose = req.app.get('mongoose');
  
  if (!mongoose || mongoose.connection.readyState !== 1) {
    console.log('⚠️  Using fallback data (MongoDB not connected)');
    
    // Add fallback methods to req object
    req.fallback = {
      isActive: true,
      jobs: {
        find: () => Promise.resolve(fallbackJobs),
        create: (data) => {
          const newJob = { ...data, _id: Date.now().toString(), createdAt: new Date() };
          fallbackJobs.push(newJob);
          return Promise.resolve(newJob);
        },
        updateStatus: (id, status) => {
          const job = fallbackJobs.find(j => j._id === id);
          if (job) job.status = status;
          return Promise.resolve(job);
        },
        stats: () => Promise.resolve({
          totalJobs: fallbackJobs.length,
          pendingJobs: fallbackJobs.filter(j => j.status === 'pending').length,
          inProgressJobs: fallbackJobs.filter(j => j.status === 'in_progress').length,
          completedJobs: fallbackJobs.filter(j => j.status === 'completed').length
        })
      },
      users: {
        find: () => Promise.resolve(fallbackUsers),
        create: (data) => {
          const newUser = { ...data, _id: Date.now().toString(), createdAt: new Date() };
          fallbackUsers.push(newUser);
          return Promise.resolve(newUser);
        }
      }
    };
  }
  
  next();
};

export default dbFallbackMiddleware; 