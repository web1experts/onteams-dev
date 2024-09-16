import React, { createContext, useState, useContext, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prevToasts => [...prevToasts, { id, message, variant }]);

    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000); // Adjust the timeout duration as needed
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(toast => (
          <Toast key={toast.id} bg={toast.variant} autohide>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
