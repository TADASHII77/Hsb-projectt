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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 z-30 border-r border-gray-200`}>
          
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gradient-to-r from-[#213A59] to-[#AF2638]">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <img src="/LogoIcon1.png" alt="HSB" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">HSB Admin</span>
                <div className="text-xs text-gray-200">Dashboard</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#AF2638] to-[#c73545] text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-4 text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  {({ isActive }) => isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#213A59] to-[#AF2638] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@hsb.com</p>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
    

              {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 z-10">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page title and breadcrumb */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold leading-7 text-gray-900">
                    Admin Dashboard
                  </h1>
                  <div className="ml-4 text-sm text-gray-500">
                    / {window.location.pathname.split('/').pop() || 'overview'}
                  </div>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#AF2638] focus:border-[#AF2638] text-sm"
                      placeholder="Search..."
                    />
                  </div>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3M15 17v-3a6 6 0 10-12 0v3m12 0H9m0 0l-3 3" />
                  </svg>
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AF2638] p-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#213A59] to-[#AF2638] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">A</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="py-8">
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