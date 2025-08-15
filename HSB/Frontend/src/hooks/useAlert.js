import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'info', title = '', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      message,
      type,
      title,
      duration,
      isOpen: true
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration + animation time
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration + 500);

    return id;
  }, []);

  const closeAlert = useCallback((id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isOpen: false } : alert
    ));
    
    // Remove from state after animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  }, []);

  const success = useCallback((message, title = 'Success') => {
    return showAlert(message, 'success', title);
  }, [showAlert]);

  const error = useCallback((message, title = 'Error') => {
    return showAlert(message, 'error', title);
  }, [showAlert]);

  const warning = useCallback((message, title = 'Warning') => {
    return showAlert(message, 'warning', title);
  }, [showAlert]);

  const info = useCallback((message, title = 'Information') => {
    return showAlert(message, 'info', title);
  }, [showAlert]);

  return {
    alerts,
    showAlert,
    closeAlert,
    success,
    error,
    warning,
    info
  };
};
