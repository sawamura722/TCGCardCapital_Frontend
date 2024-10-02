import React, { useEffect } from 'react';

const Alert = ({ message, success, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null; // ไม่แสดงถ้าไม่มีข้อความ

  return (
    <div
      className={`alert ${success ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
      role="alert"
      aria-live="assertive" // เพิ่มสำหรับการเข้าถึง
    >
      <strong>{message}</strong>
      <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
    </div>
  );
};

export default Alert;
