import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastApi = useMemo(
    () => ({
      success: (message, duration) => addToast(message, "success", duration),
      error: (message, duration) => addToast(message, "error", duration),
      info: (message, duration) => addToast(message, "info", duration),
      warning: (message, duration) => addToast(message, "warning", duration),
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
            aria-live="polite"
          >
            <div className="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "!"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export default ToastProvider;
