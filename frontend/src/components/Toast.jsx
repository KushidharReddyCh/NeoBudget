import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      // Start exit animation before actually closing
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 200); // Start exit animation 200ms before duration ends

      // Close toast after exit animation
      const closeTimer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✨';
    }
  };

  return (
    <div className={`toast-container ${type} ${isExiting ? 'exit' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast; 