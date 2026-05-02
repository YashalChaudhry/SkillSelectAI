import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { adminApi } from "../../services/adminService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await adminApi.login({ username: username.trim(), password: password.trim() });

      if (data?.user?.role !== "admin") {
        setError("Admin access required.");
        return;
      }

      window.localStorage.setItem("authToken", data.token);
      window.localStorage.setItem("authUser", JSON.stringify(data.user));
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="admin-login-page"
      style={{ backgroundImage: "url('/LandingPage.png')" }}
    >
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin Portal</h1>
        <p className="admin-login-subtitle">SkillSelectAI platform management</p>

        <form onSubmit={onSubmit} className="admin-login-form">
          <label className="admin-login-label">
            Username
            <input
              className="admin-login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              autoFocus
            />
          </label>

          <label className="admin-login-label">
            Password
            <input
              className="admin-login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
