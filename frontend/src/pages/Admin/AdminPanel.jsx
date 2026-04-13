import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import "./AdminPanel.css";
import { adminApi } from "../../services/adminService";
import adminAnimation from "../../assets/lottie/admin.json";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const formatUptime = (seconds) => {
  const total = Math.floor(Number(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const authUser = useMemo(() => safeParse(window.localStorage.getItem("authUser")) || {}, []);

  const isAdmin = authUser?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [reports, setReports] = useState({ logs: [], activity: [] });
  const [analytics, setAnalytics] = useState({ userGrowth: [], interviewsByDay: [] });

  const [search, setSearch] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const loadUsers = async (searchTerm = "") => {
    const userData = await adminApi.getUsers(searchTerm);
    setUsers(userData.users || []);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewData, settingsData, healthData, reportsData, analyticsData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getSettings(),
        adminApi.getHealth(),
        adminApi.getReports(),
        adminApi.getAnalytics(),
      ]);

      setOverview(overviewData);
      setSettings(settingsData.config || null);
      setHealth(healthData);
      setReports(reportsData || { logs: [], activity: [] });
      setAnalytics(analyticsData || { userGrowth: [], interviewsByDay: [] });

      await loadUsers(search);
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authUser");
    navigate("/admin/login", { replace: true });
  };

  const handlePermissionToggle = async (userId, key, currentValue) => {
    try {
      await adminApi.updateUserPermissions(userId, { [key]: !currentValue });
      await loadUsers(search);
    } catch (err) {
      setError(err.message || "Failed to update permission");
    }
  };

  const handleDeleteUser = async (userId, email) => {
    const confirmed = window.confirm(`Delete recruiter ${email}? This also removes their jobs and related interview records.`);
    if (!confirmed) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to delete recruiter");
    }
  };

  const onSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      await loadUsers(search);
    } catch (err) {
      setError(err.message || "Failed to search users");
    }
  };

  const handleIntegrationField = (providerKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [providerKey]: {
          ...prev.integrations[providerKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      const payload = {
        aiConfiguration: settings.aiConfiguration,
        integrations: {
          openai: settings.integrations.openai,
          huggingFace: settings.integrations.huggingFace,
          googleSpeech: settings.integrations.googleSpeech,
        },
      };
      await adminApi.updateSettings(payload);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleGenerateSystemReport = async () => {
    try {
      setIsGeneratingReport(true);
      const now = new Date();
      const reportPayload = {
        generatedAt: now.toISOString(),
        generatedBy: authUser?.email || "admin",
        summary: {
          recruiters: overview?.users?.recruiters || 0,
          candidates: overview?.hiring?.candidates || 0,
          interviews: overview?.hiring?.interviews || 0,
          dbStatus: overview?.platform?.dbStatus || "unknown",
        },
        health,
        analytics,
        reports,
      };

      const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTime = now.toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `system-report-${safeTime}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to generate system report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1 className="admin-title">SkillSelectAI Admin</h1>
          <p className="admin-subtitle">Platform oversight and system management</p>
        </div>

        <div className="admin-topbar-actions">
          <button className="admin-btn admin-btn-outline" type="button" onClick={loadAll}>
            Refresh
          </button>
          <button className="admin-btn admin-btn-danger" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {loading && <div className="admin-banner">Loading admin dashboard...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && overview && (
        <section className="admin-grid admin-grid-kpis">
          <article className="admin-card">
            <h3>Recruiters</h3>
            <strong>{overview.users.recruiters}</strong>
            <p>+{overview.users.newRecruitersThisWeek} this week</p>
          </article>
          <article className="admin-card">
            <h3>Candidates</h3>
            <strong>{overview.hiring.candidates}</strong>
            <p>Avg match {overview.hiring.averageMatchScore}</p>
          </article>
          <article className="admin-card">
            <h3>Interviews</h3>
            <strong>{overview.hiring.interviews}</strong>
            <p>{overview.hiring.completedInterviews} completed</p>
          </article>
          <article className="admin-card">
            <h3>Platform</h3>
            <strong>{overview.platform.dbStatus}</strong>
            <p>Uptime {formatUptime(overview.platform.uptimeSeconds)}</p>
          </article>
        </section>
      )}

      <section className="admin-grid admin-grid-main">
        <article className="admin-card admin-card-span-2">
          <div className="admin-section-head">
            <h2>Recruiter Management</h2>
            <form onSubmit={onSearchSubmit} className="admin-search-row">
              <input
                className="admin-input"
                placeholder="Search recruiters by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="admin-btn admin-btn-primary" type="submit">Search</button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name || "-"}</td>
                    <td>{u.email}</td>
                    <td>
                      <div className="admin-permissions">
                        {[
                          ["manageRecruiters", "Recruiters"],
                          ["manageSystemSettings", "System"],
                          ["manageIntegrations", "Integrations"],
                          ["viewAnalytics", "Analytics"],
                          ["viewTechnicalLogs", "Logs"],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            className={`admin-pill ${u.permissions?.[key] ? "active" : ""}`}
                            type="button"
                            onClick={() => handlePermissionToggle(u._id, key, Boolean(u.permissions?.[key]))}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn-danger"
                        type="button"
                        onClick={() => handleDeleteUser(u._id, u.email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-card">
          <h2>Generate System Reports</h2>
          <p className="admin-muted">Export current platform status, analytics, technical logs, and API health into a structured JSON report.</p>
          <div className="admin-report-lottie" aria-hidden="true">
            <Lottie
              animationData={adminAnimation}
              loop
              autoplay
              rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="admin-report-actions admin-report-actions-spaced">
            <button
              className="admin-btn admin-btn-primary"
              type="button"
              onClick={handleGenerateSystemReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </article>
      </section>

      <section className="admin-grid admin-grid-main">
        <article className="admin-card admin-card-span-2">
          <h2>API Integrations</h2>
          {settings && (
            <div className="admin-integrations">
              {Object.entries(settings.integrations || {}).map(([key, value]) => (
                <div key={key} className="admin-integration-item">
                  <div className="admin-integration-head">
                    <h4>{value.provider}</h4>
                    <span className={`admin-status ${value.status}`}>{value.status}</span>
                  </div>
                  <p className="admin-muted">Endpoint: {value.endpoint || "-"}</p>
                  <p className="admin-muted">Key: {value.keyMask || "Not configured"}</p>
                  <label>
                    New API Key (optional)
                    <input
                      className="admin-input"
                      type="password"
                      value={value.rawKey || ""}
                      onChange={(e) => handleIntegrationField(key, "rawKey", e.target.value)}
                      placeholder="Enter new key"
                    />
                  </label>
                  <label className="admin-inline-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(value.enabled)}
                      onChange={(e) => handleIntegrationField(key, "enabled", e.target.checked)}
                    />
                    Integration enabled
                  </label>
                </div>
              ))}
              <button className="admin-btn admin-btn-primary" type="button" onClick={handleSaveSettings} disabled={isSavingSettings}>
                Update Integrations
              </button>
            </div>
          )}
        </article>

        <article className="admin-card">
          <h2>System Health</h2>
          {health && (
            <div className="admin-health-list">
              <div className="admin-health-item">
                <span>Server</span>
                <strong>{health.server.status}</strong>
              </div>
              <div className="admin-health-item">
                <span>DB</span>
                <strong>{health.database.status}</strong>
              </div>
              <div className="admin-health-item">
                <span>OpenAI</span>
                <strong>{health.apis.openai.status}</strong>
              </div>
              <div className="admin-health-item">
                <span>Hugging Face</span>
                <strong>{health.apis.huggingFace.status}</strong>
              </div>
              <div className="admin-health-item">
                <span>Google Speech</span>
                <strong>{health.apis.googleSpeech.status}</strong>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="admin-grid admin-grid-main">
        <article className="admin-card admin-card-span-2">
          <h2>Technical Logs</h2>
          <div className="admin-log-list">
            {(reports.logs || []).slice(0, 20).map((log) => (
              <div key={log._id} className="admin-log-item">
                <div>
                  <strong>{log.category}</strong>
                  <p>{log.message}</p>
                </div>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <h2>Usage Analytics</h2>
          <div className="admin-analytics-list">
            <p>Recruiter signups (30d): {(analytics.userGrowth || []).reduce((acc, item) => acc + item.count, 0)}</p>
            <p>Interviews created (30d): {(analytics.interviewsByDay || []).reduce((acc, item) => acc + item.count, 0)}</p>
            <p>Status groups: {(reports.activity || []).length}</p>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminPanel;
