// Global alert system
class AlertManager {
  constructor() {
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(message, type = 'info', title = '', duration = 5000) {
    const alert = {
      id: Date.now() + Math.random(),
      message,
      type,
      title,
      duration,
      isOpen: true,
      timestamp: Date.now()
    };

    this.listeners.forEach(listener => listener(alert));
    return alert.id;
  }

  success(message, title = 'Success') {
    return this.emit(message, 'success', title);
  }

  error(message, title = 'Error') {
    return this.emit(message, 'error', title);
  }

  warning(message, title = 'Warning') {
    return this.emit(message, 'warning', title);
  }

  info(message, title = 'Information') {
    return this.emit(message, 'info', title);
  }
}

const alertManager = new AlertManager();

// Global alert functions that can be used anywhere
export const showAlert = (message, type, title, duration) => 
  alertManager.emit(message, type, title, duration);

export const showSuccess = (message, title) => 
  alertManager.success(message, title);

export const showError = (message, title) => 
  alertManager.error(message, title);

export const showWarning = (message, title) => 
  alertManager.warning(message, title);

export const showInfo = (message, title) => 
  alertManager.info(message, title);

export default alertManager;
