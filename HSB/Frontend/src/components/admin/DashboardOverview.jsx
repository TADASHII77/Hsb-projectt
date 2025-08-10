import React, { useState, useEffect } from 'react';
import { useTechnicians } from '../../hooks/useTechnicians';
import apiService from '../../services/api';

const DashboardOverview = () => {
  const { technicians, loading } = useTechnicians();
  const [stats, setStats] = useState({
    totalTechnicians: 0,
    verifiedTechnicians: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    customers: 0,
    technicians: 0,
    activeUsers: 0
  });

  useEffect(() => {
    if (technicians.length > 0) {
      const totalTechnicians = technicians.length;
      const verifiedTechnicians = technicians.filter(tech => tech.verified).length;
      const totalReviews = technicians.reduce((sum, tech) => sum + tech.reviews, 0);
      const averageRating = technicians.reduce((sum, tech) => sum + tech.rating, 0) / totalTechnicians;

      setStats({
        totalTechnicians,
        verifiedTechnicians,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      });
    }
  }, [technicians]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch job statistics
        const jobStatsResponse = await apiService.get('/jobs/admin/stats');
        if (jobStatsResponse.success) {
          setJobStats(jobStatsResponse.data.overview);
          setRecentJobs(jobStatsResponse.data.recent);
        }

        // Fetch user statistics
        const userStatsResponse = await apiService.get('/admin/users?limit=1000');
        if (userStatsResponse.success) {
          const users = userStatsResponse.data;
          setUserStats({
            totalUsers: users.length,
            customers: users.filter(u => u.role === 'Customer').length,
            technicians: users.filter(u => u.role === 'Technician').length,
            activeUsers: users.filter(u => u.status === 'Active').length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${color} rounded-md flex items-center justify-center text-white text-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-2">
            <span className={`text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.positive ? '↗' : '↘'} {change.percentage}%
            </span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </div>
    </div>
  );

  const RecentActivity = () => {
    // Convert recent jobs to activity format
    const jobActivities = recentJobs.map(job => ({
      id: job._id,
      type: 'job_posted',
      message: `New job: "${job.service}" in ${job.city}`,
      time: new Date(job.createdAt).toLocaleDateString(),
      customer: job.customerInfo?.name || 'Anonymous'
    }));

    const recentActivities = [
      ...jobActivities,
      { id: 'tech1', type: 'technician_added', message: 'New technician "Elite HVAC" registered', time: '2 hours ago' },
      { id: 'review1', type: 'review_added', message: 'New review for "Toronto HVAC Experts"', time: '4 hours ago' },
      { id: 'tech2', type: 'technician_verified', message: 'Verified "Climate Control Masters"', time: '6 hours ago' },
      { id: 'user1', type: 'user_registered', message: 'New user registration from Toronto', time: '8 hours ago' },
    ].slice(0, 8);

    const getActivityIcon = (type) => {
      const icons = {
        job_posted: '💼',
        technician_added: '👷',
        review_added: '⭐',
        technician_verified: '✅',
        user_registered: '👤',
        quote_requested: '💰'
      };
      return icons[type] || '📝';
    };

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const TopTechnicians = () => {
    const topTechnicians = technicians
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Rated Technicians</h3>
          <div className="space-y-3">
            {topTechnicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                    <p className="text-sm text-gray-500">{tech.category}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{tech.rating}</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-500 ml-2">({tech.reviews})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to HSB Admin Dashboard</h2>
        <p className="text-gray-600">
          Monitor your HVAC directory platform performance and manage technicians, users, and analytics.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={jobStats.totalJobs}
          icon="💼"
          color="bg-blue-500"
          change={{ positive: true, percentage: 12 }}
        />
        <StatCard
          title="Pending Jobs"
          value={jobStats.pendingJobs}
          icon="⏳"
          color="bg-orange-500"
          change={{ positive: false, percentage: 5 }}
        />
        <StatCard
          title="Active Jobs"
          value={jobStats.inProgressJobs}
          icon="🔧"
          color="bg-green-500"
          change={{ positive: true, percentage: 8 }}
        />
        <StatCard
          title="Completed Jobs"
          value={jobStats.completedJobs}
          icon="✅"
          color="bg-purple-500"
          change={{ positive: true, percentage: 15 }}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          icon="👥"
          color="bg-indigo-500"
          change={{ positive: true, percentage: 7 }}
        />
        <StatCard
          title="Total Technicians"
          value={stats.totalTechnicians}
          icon="👷"
          color="bg-blue-500"
          change={{ positive: true, percentage: 12 }}
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating} ⭐`}
          icon="⭐"
          color="bg-yellow-500"
          change={{ positive: true, percentage: 3 }}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon="💬"
          color="bg-pink-500"
          change={{ positive: true, percentage: 15 }}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity />
        <TopTechnicians />
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <span className="mr-2">👷</span>
            Add Technician
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <span className="mr-2">✅</span>
            Verify Pending
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <span className="mr-2">📊</span>
            View Analytics
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <span className="mr-2">⚙️</span>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 