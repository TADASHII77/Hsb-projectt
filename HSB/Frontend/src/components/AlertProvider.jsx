import React from 'react';
import { useAlert } from '../hooks/useAlert';
import CustomAlert from './CustomAlert';

const AlertProvider = ({ children }) => {
  const { alerts, closeAlert } = useAlert();

  return (
    <>
      {children}
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

export default AlertProvider;
