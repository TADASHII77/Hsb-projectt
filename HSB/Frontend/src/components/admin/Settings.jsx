import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Home Service Bureau',
    siteDescription: 'Find trusted HVAC professionals in your area',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoApproval: false,
    maxQuotesPerUser: 5,
    verificationRequired: true,
    apiRateLimit: 100
  });

  const [isDirty, setIsDirty] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    setIsDirty(false);
    // Show success message
  };

  const handleReset = () => {
    // Reset to default values
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-2 text-sm text-gray-700">
            Configure platform settings and preferences.
          </p>
        </div>
        {isDirty && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#AF2638] text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">General Settings</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Quotes Per User</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxQuotesPerUser}
                onChange={(e) => handleSettingChange('maxQuotesPerUser', parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Notification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Send email notifications for new registrations and quotes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF2638]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-500">Send SMS alerts for urgent matters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF2638]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Platform Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF2638]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-Approval</h4> 
                <p className="text-sm text-gray-500">Automatically approve new business registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproval}
                  onChange={(e) => handleSettingChange('autoApproval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF2638]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Verification Required</h4>
                <p className="text-sm text-gray-500">Require verification for all businesses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) => handleSettingChange('verificationRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF2638]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">API Settings</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">API Rate Limit (per minute)</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.apiRateLimit}
                onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="mt-1 text-sm text-gray-500">Maximum API requests per minute per IP</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Information</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">v1.0.0</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Database</dt>
              <dd className="mt-1 text-sm text-gray-900">MongoDB Atlas</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Server Status</dt>
              <dd className="mt-1 text-sm text-green-600">Online</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Backup</dt>
              <dd className="mt-1 text-sm text-gray-900">2 hours ago</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-500">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-red-900 mb-4">Danger Zone</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Clear All Cache</h4>
                <p className="text-sm text-gray-500">Clear all cached data (may affect performance temporarily)</p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50">
                Clear Cache
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Reset All Settings</h4>
                <p className="text-sm text-gray-500">Reset all settings to default values</p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50">
                Reset Settings
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Export Database</h4>
                <p className="text-sm text-gray-500">Download a backup of all data</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 