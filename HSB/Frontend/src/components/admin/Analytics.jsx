import React, { useState, useEffect } from 'react';
import { useBusinesses } from '../../hooks/useBusinesses.jsx';

const Analytics = () => {
  const { businesses, loading } = useBusinesses();
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    totalViews: 12543,
    totalQuotes: 892,
    conversionRate: 7.1,
    averageResponseTime: 2.4
  });

  const performanceData = [
    { period: 'Jan', businesses: 8, quotes: 145, views: 2340 },
    { period: 'Feb', businesses: 9, quotes: 178, views: 2890 },
    { period: 'Mar', businesses: 10, quotes: 203, views: 3120 },
    { period: 'Apr', businesses: 10, quotes: 189, views: 2980 },
    { period: 'May', businesses: 11, quotes: 234, views: 3560 },
    { period: 'Jun', businesses: 10, quotes: 198, views: 3240 }
  ];

  const categoryDistribution = businesses.reduce((acc, business) => {
    acc[business.category] = (acc[business.category] || 0) + 1;
    return acc;
  }, {});

  const MetricCard = ({ title, value, change, icon, color }) => (
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
        <div className="mt-2">
          <span className={`text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? '↗' : '↘'} {change.percentage}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );

  const SimpleChart = ({ data, title }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.quotes));
          const percentage = (item.quotes / maxValue) * 100;
          
          return (
            <div key={item.period} className="flex items-center">
              <div className="w-12 text-sm text-gray-600">{item.period}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-[#AF2638] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-gray-900 text-right">{item.quotes}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CategoryChart = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Businesses by Category</h3>
      <div className="space-y-4">
        {Object.entries(categoryDistribution).map(([category, count]) => {
          const maxCount = Math.max(...Object.values(categoryDistribution));
          const percentage = (count / maxCount) * 100;
          const colors = {
            'Heating': 'bg-red-500',
            'Cooling': 'bg-blue-500',
            'Installation': 'bg-green-500',
            'Repair': 'bg-yellow-500',
            'Maintenance': 'bg-purple-500',
            'Expert': 'bg-orange-500'
          };
          
          return (
            <div key={category} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">{category}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-6">
                  <div 
                    className={`${colors[category] || 'bg-gray-500'} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 20 && <span className="text-white text-xs font-medium">{count}</span>}
                  </div>
                </div>
              </div>
              <div className="w-8 text-sm text-gray-900 text-right">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TopPerformers = () => {
    const topPerformers = businesses
      .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
      .slice(0, 5);

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-4">
          {topPerformers.map((business, index) => (
            <div key={business.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">#{index + 1}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{business.name}</p>
                  <p className="text-sm text-gray-500">{business.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{business.rating} ⭐</p>
                <p className="text-sm text-gray-500">{business.reviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-2 text-sm text-gray-700">
            Track performance metrics and insights for your HVAC platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Page Views"
          value={analytics.totalViews.toLocaleString()}
          icon="👁️"
          color="bg-blue-500"
          change={{ positive: true, percentage: 23 }}
        />
        <MetricCard
          title="Quote Requests"
          value={analytics.totalQuotes.toLocaleString()}
          icon="💼"
          color="bg-green-500"
          change={{ positive: true, percentage: 12 }}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          icon="📈"
          color="bg-purple-500"
          change={{ positive: false, percentage: 2 }}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${analytics.averageResponseTime}h`}
          icon="⏱️"
          color="bg-orange-500"
          change={{ positive: true, percentage: 8 }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SimpleChart data={performanceData} title="Monthly Quote Requests" />
        <CategoryChart />
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopPerformers />
        
        {/* Recent Activity Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New business registrations</span>
              <span className="text-sm font-medium text-gray-900">12 this month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verification requests</span>
              <span className="text-sm font-medium text-gray-900">8 pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User complaints</span>
              <span className="text-sm font-medium text-gray-900">2 open</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average rating</span>
              <span className="text-sm font-medium text-gray-900">4.7 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            📊 Export Analytics
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            👷 Export Businesses
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            💼 Export Quotes
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            📈 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 