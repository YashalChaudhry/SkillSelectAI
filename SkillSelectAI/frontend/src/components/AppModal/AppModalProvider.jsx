import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./AppModal.css";

const AppModalContext = createContext(null);

const initialModalState = {
  isOpen: false,
  title: "",
  message: "",
  variant: "info",
  confirmLabel: "OK",
  cancelLabel: "Cancel",
  showCancel: false,
  resolve: null,
};

const AppModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState(initialModalState);

  const closeWithResult = useCallback((result) => {
    setModalState((prev) => {
      if (typeof prev.resolve === "function") {
        prev.resolve(result);
      }
      return initialModalState;
    });
  }, []);

  const showModal = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        ...initialModalState,
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const modalApi = useMemo(
    () => ({
      info: (title, message, options = {}) =>
        showModal({ title, message, variant: "info", confirmLabel: "OK", ...options }),
      success: (title, message, options = {}) =>
        showModal({ title, message, variant: "success", confirmLabel: "OK", ...options }),
      error: (title, message, options = {}) =>
        showModal({ title, message, variant: "error", confirmLabel: "OK", ...options }),
      warning: (title, message, options = {}) =>
        showModal({ title, message, variant: "warning", confirmLabel: "OK", ...options }),
      confirm: (title, message, options = {}) =>
        showModal({
          title,
          message,
          variant: "warning",
          showCancel: true,
          confirmLabel: "Yes",
          cancelLabel: "Cancel",
          ...options,
        }),
    }),
    [showModal]
  );

  return (
    <AppModalContext.Provider value={modalApi}>
      {children}

      {modalState.isOpen && (
        <div className="app-modal-overlay" onClick={() => closeWithResult(false)}>
          <div
            className={`app-modal app-modal-${modalState.variant}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            aria-describedby="app-modal-message"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="app-modal-head">
              <span className="app-modal-badge" aria-hidden="true">
                {modalState.variant === "success" && "OK"}
                {modalState.variant === "error" && "!"}
                {modalState.variant === "warning" && "?"}
                {modalState.variant === "info" && "i"}
              </span>
              <h3 id="app-modal-title" className="app-modal-title">
                {modalState.title}
              </h3>
            </div>

            <p id="app-modal-message" className="app-modal-message">
              {modalState.message}
            </p>

            <div className="app-modal-actions">
              {modalState.showCancel && (
                <button
                  type="button"
                  className="app-modal-btn app-modal-btn-secondary"
                  onClick={() => closeWithResult(false)}
                >
                  {modalState.cancelLabel}
                </button>
              )}
              <button
                type="button"
                className="app-modal-btn app-modal-btn-primary"
                onClick={() => closeWithResult(true)}
              >
                {modalState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppModalContext.Provider>
  );
};

export const useAppModal = () => {
  const context = useContext(AppModalContext);
  if (!context) {
    throw new Error("useAppModal must be used within AppModalProvider");
  }
  return context;
};

export default AppModalProvider;