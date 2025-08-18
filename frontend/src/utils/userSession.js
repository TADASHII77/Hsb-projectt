// Utility functions for user session management

export const getUserInfo = () => {
  return {
    email: localStorage.getItem('userEmail') || '',
    name: localStorage.getItem('userName') || '',
    phone: localStorage.getItem('userPhone') || '',
    id: localStorage.getItem('userId') || '',
    type: localStorage.getItem('userType') || ''
  };
};

export const isUserLoggedIn = () => {
  const userInfo = getUserInfo();
  return !!(userInfo.email && userInfo.name);
};

export const setUserSession = (userData) => {
  localStorage.setItem('userEmail', userData.email || '');
  localStorage.setItem('userName', userData.name || '');
  localStorage.setItem('userPhone', userData.phone || '');
  localStorage.setItem('userId', userData.id || `user_${Date.now()}`);
  localStorage.setItem('userType', userData.type || 'customer');
};

export const clearUserSession = () => {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
};
