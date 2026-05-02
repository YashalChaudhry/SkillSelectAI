import React from "react";
import Lottie from "lottie-react";
import settingsAnimation from "../../assets/lottie/settings.json";
import "./Settings.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const Settings = ({ onLogout }) => {
  const user = React.useMemo(
    () => safeParse(window.localStorage.getItem("authUser")) || {},
    []
  );

  const email = user.email || "—";
  const companyName = user.name || user.companyName || "—";

  const avatarLetter = React.useMemo(() => {
    const seed = (companyName !== "—" ? companyName : email).trim();
    return seed ? seed[0].toUpperCase() : "S";
  }, [companyName, email]);

  const [isPwdModalOpen, setIsPwdModalOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [pwdStatus, setPwdStatus] = React.useState({ type: "", message: "" });
  const [isPwdSubmitting, setIsPwdSubmitting] = React.useState(false);

  const resetPwdModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwdStatus({ type: "", message: "" });
  };

  const openPwdModal = () => {
    resetPwdModal();
    setIsPwdModalOpen(true);
  };

  const closePwdModal = () => {
    setIsPwdModalOpen(false);
    resetPwdModal();
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdStatus({ type: "", message: "" });

    const token = window.localStorage.getItem("authToken");
    if (!token) {
      setPwdStatus({ type: "error", message: "You are not logged in." });
      return;
    }
    if (!currentPassword || !newPassword) {
      setPwdStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }
    if (newPassword.length < 8) {
      setPwdStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    try {
      setIsPwdSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwdStatus({ type: "error", message: data.message || "Failed to change password." });
        return;
      }

      setPwdStatus({ type: "success", message: data.message || "Password updated successfully." });
      // Close shortly after success
      setTimeout(() => closePwdModal(), 900);
    } catch {
      setPwdStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsPwdSubmitting(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    const token = window.localStorage.getItem("authToken");

    // Best-effort server-side invalidation (if supported)
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout-all`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore; still clear local auth
    } finally {
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("authUser");
      if (onLogout) onLogout();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-content">
        <header className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account</p>
        </header>

        {/* Profile Information (Read-only) */}
        <section className="settings-card settings-profile-card" aria-label="Profile information">
          <div className="settings-avatar" aria-hidden="true">
            {avatarLetter}
          </div>
          <div className="settings-profile-text">
            <div className="settings-email">{email}</div>
            <div className="settings-company">{companyName}</div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="settings-card" aria-label="Account actions">
          <div className="settings-section-head">
            <div className="settings-divider" />
            <h2 className="settings-section-title">Account</h2>
          </div>

          <div className="settings-actions">
            <button type="button" className="settings-btn settings-btn-outline" onClick={openPwdModal}>
              Change Password
            </button>

            <button
              type="button"
              className="settings-btn settings-btn-danger"
              onClick={handleLogoutAllDevices}
            >
              Logout from all devices
            </button>
          </div>
        </section>
      </div>

      <div className="settings-bottom-lottie" aria-hidden="true">
        <Lottie
          animationData={settingsAnimation}
          loop
          autoplay
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Change Password Modal */}
      {isPwdModalOpen && (
        <div className="settings-modal-overlay" onClick={closePwdModal} role="dialog" aria-modal="true">
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-head">
              <h3 className="settings-modal-title">Change Password</h3>
              <button type="button" className="settings-modal-close" onClick={closePwdModal} aria-label="Close">
                ×
              </button>
            </div>

            <form className="settings-form" onSubmit={handleChangePasswordSubmit}>
              <label className="settings-label">
                Current password
                <input
                  className="settings-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label className="settings-label">
                New password
                <input
                  className="settings-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="settings-label">
                Confirm new password
                <input
                  className="settings-input"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </label>

              {pwdStatus.message && (
                <div
                  className={`settings-inline-msg ${
                    pwdStatus.type === "success" ? "settings-inline-success" : "settings-inline-error"
                  }`}
                >
                  {pwdStatus.message}
                </div>
              )}

              <div className="settings-modal-actions">
                <button type="button" className="settings-btn settings-btn-outline" onClick={closePwdModal}>
                  Cancel
                </button>
                <button type="submit" className="settings-btn settings-btn-primary" disabled={isPwdSubmitting}>
                  {isPwdSubmitting ? "Saving..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
