import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import DashboardOverview from '../components/admin/DashboardOverview';
import TechnicianManagement from '../components/admin/TechnicianManagement';
import UserManagement from '../components/admin/UserManagement';
import JobManagement from '../components/admin/JobManagement';
import Analytics from '../components/admin/Analytics';
import Settings from '../components/admin/Settings';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Overview', path: '/admin', icon: '📊', exact: true },
    { name: 'Jobs', path: '/admin/jobs', icon: '💼' },
    { name: 'Technicians', path: '/admin/technicians', icon: '👷' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className='flex gap-2'>
      <div className={` inset-y-0 left-0 w-64 bg-[#213A59] transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0  lg:inset-0 z-30`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-[#1a2d42]">
          <div className="flex items-center">
            <div className="w-8 h-10 mr-3">
              <img src="/LogoIcon1.png" alt="HSB" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-lg">HSB Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#AF2638] text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#1a2d42]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              👤
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@hsb.com</p>
            </div>
          </div>
        </div>
      </div>
    

      {/* Main content */}
      <div >
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                Admin Dashboard
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zM10.59 12.9a.5.5 0 0 1-.09-.8l8.5-8.5a.5.5 0 0 1 .8.09l1.91 1.91a.5.5 0 0 1-.09.8l-8.5 8.5a.5.5 0 0 1-.8-.09L10.59 12.9z" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF2638]">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    👤
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/jobs" element={<JobManagement />} />
                <Route path="/technicians" element={<TechnicianManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 