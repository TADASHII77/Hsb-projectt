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
        } else {
          // Fallback to default values if API fails
          console.warn('Jobs API not available, using default values');
          setJobStats({
            totalJobs: 0,
            pendingJobs: 0,
            inProgressJobs: 0,
            completedJobs: 0
          });
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
        } else {
          // Fallback for user stats
          console.warn('Users API not available, using default values');
          setUserStats({
            totalUsers: 0,
            customers: 0,
            technicians: 0,
            activeUsers: 0
          });
        }

        // Fetch admin statistics
        const adminStatsResponse = await apiService.getAdminStats();
        if (adminStatsResponse.success) {
          console.log('Admin stats fetched successfully:', adminStatsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback values on error
        setJobStats({
          totalJobs: 0,
          pendingJobs: 0,
          inProgressJobs: 0,
          completedJobs: 0
        });
        setUserStats({
          totalUsers: 0,
          customers: 0,
          technicians: 0,
          activeUsers: 0
        });
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900 mt-1">{value}</dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              change.positive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {change.positive ? '↗' : '↘'} {change.percentage}%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
        {trend && (
          <div className="mt-3">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${color.replace('bg-', 'bg-opacity-60 bg-')}`}
                  style={{ width: `${trend}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-gray-500">{trend}%</span>
            </div>
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
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-[#AF2638] hover:text-[#c73545] font-medium">
              View All
            </button>
          </div>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-200 to-transparent" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-4">
                      <div>
                        <span className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-lg shadow-md">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            {activity.customer && (
                              <p className="text-xs text-gray-500 mt-1">by {activity.customer}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {activity.time}
                            </div>
                          </div>
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
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Rated Technicians</h3>
            <button className="text-sm text-[#AF2638] hover:text-[#c73545] font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topTechnicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-900">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900 mr-1">{tech.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                    <span className="text-xs text-gray-500">({tech.reviews} reviews)</span>
                  </div>
                  {tech.verified && (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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
    <div className="space-y-8">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-[#213A59] to-[#AF2638] shadow-xl rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome to HSB Admin Dashboard</h2>
            <p className="text-gray-200 text-lg">
              Monitor your HVAC directory platform performance and manage technicians, users, and analytics.
            </p>
            <div className="mt-4 text-sm text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={jobStats.totalJobs || 0}
          icon="💼"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          change={{ positive: true, percentage: 12 }}
          trend={75}
        />
        <StatCard
          title="Active Technicians"
          value={stats.totalTechnicians || 0}
          icon="👷"
          color="bg-gradient-to-br from-green-500 to-green-600"
          change={{ positive: true, percentage: 8 }}
          trend={85}
        />
        <StatCard
          title="Total Users"
          value={userStats.totalUsers || 0}
          icon="👥"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          change={{ positive: true, percentage: 15 }}
          trend={92}
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating || 0} ⭐`}
          icon="⭐"
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
          change={{ positive: true, percentage: 3 }}
          trend={88}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Jobs"
          value={jobStats.pendingJobs || 0}
          icon="⏳"
          color="bg-gradient-to-br from-orange-500 to-red-500"
          change={{ positive: false, percentage: 5 }}
        />
        <StatCard
          title="Completed Jobs"
          value={jobStats.completedJobs || 0}
          icon="✅"
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          change={{ positive: true, percentage: 18 }}
        />
        <StatCard
          title="Verified Technicians"
          value={stats.verifiedTechnicians || 0}
          icon="🛡️"
          color="bg-gradient-to-br from-indigo-500 to-blue-600"
          change={{ positive: true, percentage: 7 }}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews || 0}
          icon="💬"
          color="bg-gradient-to-br from-pink-500 to-rose-500"
          change={{ positive: true, percentage: 22 }}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentActivity />
        <TopTechnicians />
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
            <span className="mr-3 text-xl group-hover:scale-110 transition-transform">👷</span>
            Add Technician
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
            <span className="mr-3 text-xl group-hover:scale-110 transition-transform">✅</span>
            Verify Pending
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
            <span className="mr-3 text-xl group-hover:scale-110 transition-transform">📊</span>
            View Analytics
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
            <span className="mr-3 text-xl group-hover:scale-110 transition-transform">⚙️</span>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 