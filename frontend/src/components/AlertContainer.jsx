import React, { useState, useEffect } from 'react';
import CustomAlert from './CustomAlert';
import alertManager from '../utils/alert';

const AlertContainer = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = alertManager.subscribe((newAlert) => {
      setAlerts(prev => [...prev, newAlert]);

      // Auto remove after duration + animation time
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
      }, newAlert.duration + 500);
    });

    return unsubscribe;
  }, []);

  const closeAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isOpen: false } : alert
    ));
    
    // Remove from state after animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  };

  return (
    <>
      {alerts.map((alert) => (
        <CustomAlert
          key={alert.id}
          isOpen={alert.isOpen}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={alert.duration}
          onClose={() => closeAlert(alert.id)}
        />
      ))}
    </>
  );
};

export default AlertContainer;
