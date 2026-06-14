import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaTachometerAlt, FaHourglassHalf, FaUserMd,
  FaClipboardList, FaCommentDots, FaCog, FaSignOutAlt,
  FaBars, FaUsers, FaCheckCircle, FaTimesCircle, FaUserShield,
  FaExclamationCircle, FaExclamationTriangle, FaArrowRight,
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap,
  FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaTimes,
  FaPaperclip, FaFileAlt, FaImage, FaLock, FaUnlock,
  FaTrashAlt, FaPlay, FaPaperPlane, FaKey, FaCopy, FaTag,
  FaCrown, FaBriefcase, FaInfoCircle,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import {
  adminGetStats, adminGetApplications, adminGetApplicationDetail,
  adminApproveApplication, adminRejectApplication,
  adminGetDoctors, adminToggleDoctorActive, adminDeleteDoctor,
} from "../api/doctors";
import {
  adminGetComplaints, adminGetComplaintDetail,
  adminRespondComplaint, adminGetComplaintStats,
} from "../api/complaints";
import DoctorAvatar from "../components/DoctorAvatar";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const STATUS_COLORS = {
  pending:  { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  approved: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

const COMPLAINT_STATUS_COLORS = {
  open:        { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  in_progress: { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  resolved:    { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  closed:      { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
};

const COMPLAINT_PRIORITY_COLORS = {
  low:    { bg: "#f0f9ff", color: "#075985" },
  medium: { bg: "#fff8e6", color: "#7a5a10" },
  high:   { bg: "#ffedd5", color: "#9a3412" },
  urgent: { bg: "#fee2e2", color: "#991b1b" },
};

const NAV_ITEMS = [
  { Icon: FaTachometerAlt, label: "Dashboard",        id: "dashboard" },
  { Icon: FaHourglassHalf, label: "Pending Apps",      id: "pending" },
  { Icon: FaUserMd,        label: "All Doctors",      id: "doctors" },
  { Icon: FaClipboardList, label: "All Applications", id: "applications" },
  { Icon: FaCommentDots,   label: "Complaints",       id: "complaints" },
  { Icon: FaCog,           label: "Settings",         id: "settings" },
];

const hoverStyles = `
  .ad-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .ad-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .ad-btn-outline { transition: all 0.25s ease; }
  .ad-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .ad-approve { transition: all 0.25s ease; }
  .ad-approve:hover:not(:disabled) {
    background: #166534 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(22,101,52,0.3);
  }

  .ad-reject { transition: all 0.2s ease; }
  .ad-reject:hover:not(:disabled) {
    background: #dc2626 !important;
    color: #fff !important;
    transform: translateY(-2px);
  }

  .ad-suspend { transition: all 0.2s ease; }
  .ad-suspend:hover {
    background: #fef3c7 !important;
    border-color: #f59e0b !important;
    color: #92400e !important;
    transform: translateY(-1px);
  }

  .ad-activate { transition: all 0.2s ease; }
  .ad-activate:hover {
    background: #16a34a !important;
    color: #fff !important;
    transform: translateY(-1px);
  }

  .ad-delete { transition: all 0.2s ease; }
  .ad-delete:hover {
    background: #dc2626 !important;
    color: #fff !important;
    border-color: #dc2626 !important;
  }

  .ad-nav { transition: all 0.2s ease; }
  .ad-nav:hover:not(.active) {
    background: rgba(255,255,255,0.08) !important;
    color: #fff !important;
  }

  .ad-logout { transition: all 0.2s ease; }
  .ad-logout:hover {
    background: rgba(220,38,38,0.15) !important;
    color: #fca5a5 !important;
  }

  .ad-toggle { transition: all 0.2s ease; }
  .ad-toggle:hover {
    background: #f4f9f6 !important;
    transform: scale(1.05);
  }

  .ad-stat { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .ad-stat:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 24px rgba(42,157,92,0.12);
  }

  .ad-action { transition: all 0.3s ease; cursor: pointer; }
  .ad-action:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 28px rgba(42,157,92,0.15);
  }

  .ad-app-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .ad-app-card:hover {
    border-color: #2a9d5c !important;
    box-shadow: 0 8px 20px rgba(42,157,92,0.08);
    transform: translateY(-2px);
  }

  .ad-view-btn { transition: all 0.2s ease; }
  .ad-view-btn:hover {
    background: #2a9d5c !important;
    color: #fff !important;
    border-color: #2a9d5c !important;
  }

  .ad-close { transition: all 0.2s ease; }
  .ad-close:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
  }

  .ad-doc { transition: all 0.25s ease; }
  .ad-doc:hover {
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(42,157,92,0.1);
  }

  .ad-status-btn { transition: all 0.2s ease; }
  .ad-status-btn:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
  }

  .ad-input:focus, .ad-textarea:focus, .ad-select:focus {
    border-color: #2a9d5c !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    outline: none;
  }
  .ad-input, .ad-textarea, .ad-select { transition: all 0.2s ease; }

  .ad-tr { transition: all 0.15s ease; }
  .ad-tr:hover {
    background: #fafffe !important;
  }

  @keyframes pop-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .ad-pop { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

  /* ═══════════════ MOBILE RESPONSIVE (max-width: 768px) ═══════════════ */
  @media (max-width: 768px) {
    /* Sidebar becomes fixed drawer */
    .ad-sidebar {
      position: fixed !important;
      top: 0; left: 0;
      height: 100vh !important;
      width: 260px !important;
      z-index: 1100;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 4px 0 24px rgba(0,0,0,0.2);
    }
    .ad-sidebar.ad-open { transform: translateX(0); }

    /* Backdrop overlay */
    .ad-backdrop {
      display: block !important;
      position: fixed; inset: 0;
      background: rgba(15,32,24,0.5);
      backdrop-filter: blur(4px);
      z-index: 1099;
      animation: ad-fade-in 0.25s ease;
    }
    @keyframes ad-fade-in { from { opacity: 0; } to { opacity: 1; } }

    /* Main fills full width */
    .ad-main { width: 100% !important; }

    /* Top bar */
    .ad-top-bar { padding: 12px 16px !important; gap: 10px !important; }
    .ad-top-title { font-size: 15px !important; }
    .ad-admin-info { display: none !important; }
    .ad-admin-pill { padding: 4px !important; gap: 0 !important; }

    /* Content padding */
    .ad-content { padding: 18px 16px 60px !important; }

    /* Stats grid */
    .ad-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .ad-stat-card { padding: 14px 12px !important; }
    .ad-stat-value { font-size: 18px !important; }
    .ad-stat-label { font-size: 10.5px !important; }
    .ad-stat-icon-box { width: 38px !important; height: 38px !important; }

    /* Actions grid */
    .ad-actions-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .ad-action-card { padding: 16px 18px !important; }

    /* Apps grid — single column */
    .ad-apps-grid { grid-template-columns: 1fr !important; }
    .ad-app-card { padding: 14px 16px !important; }
    .ad-app-meta { grid-template-columns: 1fr 1fr !important; }

    /* Section header */
    .ad-section-title { font-size: 14.5px !important; }

    /* Filter row scrolls */
    .ad-filter-row { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
    .ad-filter-row::-webkit-scrollbar { display: none; }
    .ad-filter-row button { flex-shrink: 0; }

    /* Complaint filters wrap */
    .ad-complaint-filter-row select { flex: 1 1 calc(50% - 5px); min-width: 0; }

    /* TABLES → CARDS on mobile */
    .ad-table-wrap { background: transparent !important; border: none !important; }
    .ad-table { border-collapse: separate !important; }
    .ad-table thead { display: none !important; }
    .ad-table, .ad-table tbody, .ad-table tr, .ad-table td {
      display: block !important;
      width: 100% !important;
    }
    .ad-table tr {
      background: #fff;
      border: 1px solid #e0ede6 !important;
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(15,32,24,0.04);
    }
    .ad-table td {
      padding: 6px 0 !important;
      border: none !important;
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .ad-table td::before {
      content: attr(data-label);
      font-size: 11px;
      font-weight: 800;
      color: #5a7a6a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .ad-table td:first-child::before { display: none; }
    .ad-table td:first-child {
      padding-bottom: 12px !important;
      margin-bottom: 8px;
      border-bottom: 1px solid #e0ede6 !important;
      justify-content: flex-start;
    }
    .ad-table td:last-child {
      padding-top: 12px !important;
      margin-top: 8px;
      border-top: 1px solid #e0ede6 !important;
      flex-direction: column;
      align-items: stretch;
    }
    .ad-table td:last-child::before { margin-bottom: 8px; }
    .ad-table td:last-child > div { width: 100%; }
    .ad-table td:last-child button { flex: 1; justify-content: center; }

    /* Modal full-screen on mobile */
    .ad-modal {
      max-width: 100vw !important;
      width: 100vw !important;
      max-height: 100vh !important;
      height: 100vh !important;
      border-radius: 0 !important;
    }
    .ad-modal-body { padding: 16px !important; }
    .ad-modal-header { padding: 14px 16px !important; }
    .ad-modal-actions { padding: 12px 16px !important; flex-direction: column; }
    .ad-modal-actions button { width: 100%; }
    .ad-detail-grid { grid-template-columns: 1fr !important; }
    .ad-docs-grid { grid-template-columns: 1fr !important; }

    /* Profile (settings) */
    .ad-profile-header { padding: 20px 18px !important; gap: 14px !important; }
    .ad-profile-name { font-size: 18px !important; }
    .ad-details-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 480px) {
    .ad-stats-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth > 768;
    return true;
  });

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState(null);
  const [complaintFilter, setComplaintFilter] = useState({ status: "", priority: "", category: "" });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("in_progress");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApp, setSelectedApp] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCredentials, setShowCredentials] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadStats = async () => {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      console.error("Stats load error:", err);
    }
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (complaintFilter.status) filters.status = complaintFilter.status;
      if (complaintFilter.priority) filters.priority = complaintFilter.priority;
      if (complaintFilter.category) filters.category = complaintFilter.category;
      const data = await adminGetComplaints(filters);
      setComplaints(data);
    } catch (err) {
      console.error("Complaints load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadComplaintStats = async () => {
    try {
      const data = await adminGetComplaintStats();
      setComplaintStats(data);
    } catch (err) {
      console.error("Complaint stats error:", err);
    }
  };

  const viewComplaintDetail = async (id) => {
    try {
      const data = await adminGetComplaintDetail(id);
      setSelectedComplaint(data);
      setResponseText(data.admin_response || "");
      setResponseStatus(data.status === "open" ? "in_progress" : data.status);
    } catch (err) {
      console.error("Detail error:", err);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || responseText.length < 5) {
      setErrorMsg("Response must be at least 5 characters long");
      return;
    }
    setActionLoading(true);
    setErrorMsg("");
    try {
      await adminRespondComplaint(selectedComplaint.id, responseText, responseStatus);
      setSelectedComplaint(null);
      setResponseText("");
      loadComplaints();
      loadComplaintStats();
      alert(`✓ Response submitted! Status: ${responseStatus}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit response");
    } finally {
      setActionLoading(false);
    }
  };

  const loadApplications = async (filter = null) => {
    setLoading(true);
    try {
      const data = await adminGetApplications(filter === "all" ? null : filter);
      setApplications(data);
    } catch (err) {
      console.error("Applications load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await adminGetDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Doctors load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadComplaintStats();
  }, []);

  useEffect(() => {
    if (activeNav === "pending") {
      loadApplications("pending");
    } else if (activeNav === "applications") {
      loadApplications(statusFilter);
    } else if (activeNav === "doctors") {
      loadDoctors();
    } else if (activeNav === "complaints") {
      loadComplaints();
      loadComplaintStats();
    }
  }, [activeNav, statusFilter, complaintFilter]);

  const viewApplication = async (id) => {
    try {
      const detail = await adminGetApplicationDetail(id);
      setSelectedApp(detail);
    } catch (err) {
      console.error("Detail load error:", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    setErrorMsg("");
    try {
      const result = await adminApproveApplication(selectedApp.id);
      setShowCredentials({
        name: selectedApp.full_name,
        email: result.credentials.email,
        password: result.credentials.password,
      });
      setSelectedApp(null);
      loadStats();
      if (activeNav === "pending") loadApplications("pending");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim() || rejectReason.length < 10) {
      setErrorMsg("Rejection reason must be at least 10 characters long");
      return;
    }
    setActionLoading(true);
    setErrorMsg("");
    try {
      await adminRejectApplication(selectedApp.id, rejectReason);
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectReason("");
      loadStats();
      if (activeNav === "pending") loadApplications("pending");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDoctor = async (doctorId, doctorName, currentlyActive) => {
    const action = currentlyActive ? "suspend" : "activate";
    const msg = currentlyActive
      ? `Are you sure you want to SUSPEND "${doctorName}"?\n\nThey will not be able to log in.`
      : `Are you sure you want to ACTIVATE "${doctorName}" again?`;
    if (!window.confirm(msg)) return;
    try {
      await adminToggleDoctorActive(doctorId);
      loadDoctors();
      loadStats();
    } catch (err) {
      alert(`Failed to ${action} doctor: ${err.response?.data?.detail || "Unknown error"}`);
    }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    const confirm1 = window.confirm(
      `WARNING: Are you sure you want to PERMANENTLY delete "${doctorName}"?\n\n` +
      `This action CANNOT be undone!\n\n` +
      `- The doctor's account will be deleted\n` +
      `- All appointments will be cancelled\n` +
      `- This data cannot be recovered`
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      `To confirm, please type the doctor's name exactly:\n\n"${doctorName}"`
    );
    if (confirm2 !== doctorName) {
      alert("Name does not match. Delete cancelled.");
      return;
    }

    try {
      await adminDeleteDoctor(doctorId);
      alert(`Doctor "${doctorName}" has been permanently deleted.`);
      loadDoctors();
      loadStats();
    } catch (err) {
      alert(`Failed to delete: ${err.response?.data?.detail || "Unknown error"}`);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!user) return null;

  const currentNavItem = NAV_ITEMS.find((n) => n.id === activeNav);

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      {/* Mobile backdrop — only renders on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="ad-backdrop"
          style={{ display: "none" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside
        style={{ ...s.sidebar, width: sidebarOpen ? 240 : 72 }}
        className={`ad-sidebar ${sidebarOpen ? "ad-open" : ""}`}
      >
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>
            <FaStethoscope size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <span style={s.logoText}>
              Baby<span style={{ color: "#5fcf8f" }}>Care</span>
            </span>
          )}
        </div>

        {sidebarOpen && (
          <div style={s.roleBadge}>
            <FaCrown size={10} color="#fbbf24" />
            <span>Admin Panel</span>
          </div>
        )}

        <nav style={s.navItems}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
                className={`ad-nav ${active ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.id);
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <item.Icon size={15} />
                {sidebarOpen && <span style={s.navLabel}>{item.label}</span>}
                {sidebarOpen && item.id === "pending" && stats?.pending_applications > 0 && (
                  <span style={s.notifBadge}>{stats.pending_applications}</span>
                )}
                {sidebarOpen && item.id === "complaints" && complaintStats?.open > 0 && (
                  <span style={s.notifBadge}>{complaintStats.open}</span>
                )}
              </button>
            );
          })}
        </nav>

        <button style={s.logoutBtn} className="ad-logout" onClick={handleLogout}>
          <FaSignOutAlt size={14} />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <main style={s.main} className="ad-main">
        {/* TOP BAR */}
        <div style={s.topBar} className="ad-top-bar">
          <div style={s.topLeft}>
            <button
              style={s.toggleBtn}
              className="ad-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <FaBars size={14} color={TEXT_DARK} />
            </button>
            <h1 style={s.topTitle} className="ad-top-title">
              {currentNavItem && <currentNavItem.Icon size={16} color={MINT_DARK} />}
              {currentNavItem?.label}
            </h1>
          </div>
          <div style={s.topRight}>
            <div style={s.adminPill} className="ad-admin-pill">
              <div style={s.adminAvatar}>
                {user.first_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={s.adminInfo} className="ad-admin-info">
                <span style={s.adminName}>{user.first_name || "Admin"}</span>
                <span style={s.adminSub}>Super User</span>
              </div>
              <div style={s.adminBadge}>
                <FaCrown size={9} color="#fff" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={s.content} className="ad-content">

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {activeNav === "dashboard" && (
            <>
              {stats ? (
                <div style={s.statsGrid} className="ad-stats-grid">
                  {[
                    { Icon: FaUsers,             label: "Total Parents",       value: stats.total_parents },
                    { Icon: FaUserMd,            label: "Total Doctors",       value: stats.total_doctors },
                    { Icon: FaHourglassHalf,     label: "Pending Applications", value: stats.pending_applications },
                    { Icon: FaCheckCircle,       label: "Approved",            value: stats.approved_applications },
                    { Icon: FaTimesCircle,       label: "Rejected",            value: stats.rejected_applications },
                    { Icon: FaUserShield,        label: "Total Users",         value: stats.total_users },
                  ].map((stat) => (
                    <div key={stat.label} style={s.statCard} className="ad-stat ad-stat-card">
                      <div style={s.statIconBox} className="ad-stat-icon-box">
                        <stat.Icon size={18} color={MINT_DARK} />
                      </div>
                      <div>
                        <div style={s.statValue} className="ad-stat-value">{stat.value}</div>
                        <div style={s.statLabel} className="ad-stat-label">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingBox text="Loading dashboard statistics..." />
              )}

              {/* Quick Actions */}
              <div style={s.section}>
                <h2 style={s.sectionTitle} className="ad-section-title">Quick Actions</h2>
                <div style={s.actionsGrid} className="ad-actions-grid">
                  <button style={s.actionCard} className="ad-action ad-action-card" onClick={() => setActiveNav("pending")}>
                    <div style={{ ...s.actionIconBox, background: "#fff8e6" }}>
                      <FaHourglassHalf size={22} color="#92400e" />
                    </div>
                    <div style={s.actionTitle}>Review Pending</div>
                    <div style={s.actionDesc}>
                      {stats?.pending_applications || 0} doctors waiting for approval
                    </div>
                    <div style={s.actionArrow}>
                      <FaArrowRight size={11} color={MINT_DARK} />
                    </div>
                  </button>

                  <button style={s.actionCard} className="ad-action ad-action-card" onClick={() => setActiveNav("doctors")}>
                    <div style={{ ...s.actionIconBox, background: "#dcfce7" }}>
                      <FaUserMd size={22} color={MINT_DARK} />
                    </div>
                    <div style={s.actionTitle}>Manage Doctors</div>
                    <div style={s.actionDesc}>View and manage active doctors</div>
                    <div style={s.actionArrow}>
                      <FaArrowRight size={11} color={MINT_DARK} />
                    </div>
                  </button>

                  <button style={s.actionCard} className="ad-action ad-action-card" onClick={() => setActiveNav("applications")}>
                    <div style={{ ...s.actionIconBox, background: "#dbeafe" }}>
                      <FaClipboardList size={22} color="#1e40af" />
                    </div>
                    <div style={s.actionTitle}>All Applications</div>
                    <div style={s.actionDesc}>View history of all applications</div>
                    <div style={s.actionArrow}>
                      <FaArrowRight size={11} color={MINT_DARK} />
                    </div>
                  </button>

                  <button style={s.actionCard} className="ad-action ad-action-card" onClick={() => setActiveNav("complaints")}>
                    <div style={{ ...s.actionIconBox, background: "#fee2e2" }}>
                      <FaCommentDots size={22} color="#991b1b" />
                    </div>
                    <div style={s.actionTitle}>Complaints</div>
                    <div style={s.actionDesc}>
                      {complaintStats?.open || 0} open complaints
                    </div>
                    <div style={s.actionArrow}>
                      <FaArrowRight size={11} color={MINT_DARK} />
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════ PENDING APPLICATIONS ═══════════════ */}
          {activeNav === "pending" && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle} className="ad-section-title">
                  <FaHourglassHalf size={14} color="#92400e" />
                  Pending Doctor Applications
                </h2>
                <span style={s.countBadge}>{applications.length} pending</span>
              </div>

              {loading ? (
                <LoadingBox text="Loading applications..." />
              ) : applications.length === 0 ? (
                <EmptyState
                  Icon={FaCheckCircle}
                  title="All caught up!"
                  desc="No pending applications. Your inbox is clear."
                />
              ) : (
                <div style={s.appsGrid} className="ad-apps-grid">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} app={app} onView={() => viewApplication(app.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ALL APPLICATIONS ═══════════════ */}
          {activeNav === "applications" && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle} className="ad-section-title">
                  <FaClipboardList size={14} color={MINT_DARK} />
                  All Applications
                </h2>
                <span style={s.countBadge}>{applications.length} total</span>
              </div>

              <div style={s.filterRow} className="ad-filter-row">
                {["all", "pending", "approved", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`ad-status-btn ${statusFilter === f ? "active" : ""}`}
                    style={{ ...s.filterPill, ...(statusFilter === f ? s.filterActive : {}) }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <LoadingBox text="Loading applications..." />
              ) : applications.length === 0 ? (
                <EmptyState
                  Icon={FaClipboardList}
                  title="No applications found"
                  desc="Try selecting a different filter to see applications."
                />
              ) : (
                <div style={s.appsGrid} className="ad-apps-grid">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} app={app} onView={() => viewApplication(app.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ACTIVE DOCTORS ═══════════════ */}
          {activeNav === "doctors" && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle} className="ad-section-title">
                  <FaUserMd size={14} color={MINT_DARK} />
                  Active Doctors
                </h2>
                <span style={s.countBadge}>{doctors.length} total</span>
              </div>

              {loading ? (
                <LoadingBox text="Loading doctors..." />
              ) : doctors.length === 0 ? (
                <EmptyState
                  Icon={FaUserMd}
                  title="No approved doctors yet"
                  desc="Approve pending applications to see them here."
                />
              ) : (
                <div style={s.tableWrap} className="ad-table-wrap">
                  <table style={s.table} className="ad-table">
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Doctor</th>
                        <th style={s.th}>Specialty</th>
                        <th style={s.th}>PMDC</th>
                        <th style={s.th}>Experience</th>
                        <th style={s.th}>Fee</th>
                        <th style={s.th}>Status</th>
                        <th style={s.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doc) => (
                        <tr key={doc.id} style={s.tr} className="ad-tr">
                          <td style={s.td} data-label="Doctor">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <DoctorAvatar
                                photoUrl={doc.profile_photo_url}
                                name={doc.full_name}
                                size={40}
                                fontSize={14}
                              />
                              <div>
                                <div style={s.tdBold}>{doc.full_name}</div>
                                <div style={s.tdEmail}>{doc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={s.td} data-label="Specialty">{doc.specialty}</td>
                          <td style={s.td} data-label="PMDC">
                            <code style={s.codeText}>{doc.pmdc_number}</code>
                          </td>
                          <td style={s.td} data-label="Experience">{doc.experience_years} yrs</td>
                          <td style={s.td} data-label="Fee">
                            <strong style={{ color: MINT_DARK }}>Rs. {doc.consultation_fee}</strong>
                          </td>
                          <td style={s.td} data-label="Status">
                            <span style={{
                              ...s.statusBadge,
                              ...(doc.is_active ? STATUS_COLORS.approved : STATUS_COLORS.rejected),
                              border: `1px solid ${doc.is_active ? STATUS_COLORS.approved.border : STATUS_COLORS.rejected.border}`,
                            }}>
                              {doc.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={s.td} data-label="Actions">
                            <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                              <button
                                style={doc.is_active ? s.suspendBtn : s.activateBtn}
                                className={doc.is_active ? "ad-suspend" : "ad-activate"}
                                onClick={() => handleToggleDoctor(doc.id, doc.full_name, doc.is_active)}
                                title={doc.is_active ? "Suspend doctor" : "Activate doctor"}
                              >
                                {doc.is_active ? <FaLock size={9} /> : <FaUnlock size={9} />}
                                {doc.is_active ? "Suspend" : "Activate"}
                              </button>
                              <button
                                style={s.deleteBtn}
                                className="ad-delete"
                                onClick={() => handleDeleteDoctor(doc.id, doc.full_name)}
                                title="Permanently delete doctor"
                              >
                                <FaTrashAlt size={9} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ COMPLAINTS ═══════════════ */}
          {activeNav === "complaints" && (
            <>
              {complaintStats && (
                <div style={s.statsGrid} className="ad-stats-grid">
                  {[
                    { Icon: FaClipboardList,    label: "Total Complaints", value: complaintStats.total },
                    { Icon: FaExclamationCircle, label: "Open",            value: complaintStats.open, color: "#dc2626" },
                    { Icon: FaHourglassHalf,    label: "In Progress",     value: complaintStats.in_progress, color: "#7a5a10" },
                    { Icon: FaCheckCircle,      label: "Resolved",        value: complaintStats.resolved, color: "#166534" },
                    { Icon: FaExclamationTriangle, label: "Urgent",       value: complaintStats.urgent, color: "#991b1b" },
                    { Icon: FaUserMd,           label: "Against Doctors", value: complaintStats.against_doctors },
                  ].map((stat) => (
                    <div key={stat.label} style={s.statCard} className="ad-stat ad-stat-card">
                      <div style={s.statIconBox} className="ad-stat-icon-box">
                        <stat.Icon size={18} color={stat.color || MINT_DARK} />
                      </div>
                      <div>
                        <div style={s.statValue} className="ad-stat-value">{stat.value}</div>
                        <div style={s.statLabel} className="ad-stat-label">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle} className="ad-section-title">
                    <FaCommentDots size={14} color={MINT_DARK} />
                    All Complaints
                  </h2>
                  <span style={s.countBadge}>{complaints.length} complaints</span>
                </div>

                {/* Filters */}
                <div style={s.complaintFilterRow} className="ad-complaint-filter-row">
                  <select
                    value={complaintFilter.status}
                    onChange={(e) => setComplaintFilter({ ...complaintFilter, status: e.target.value })}
                    style={s.filterSelect}
                    className="ad-select"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={complaintFilter.priority}
                    onChange={(e) => setComplaintFilter({ ...complaintFilter, priority: e.target.value })}
                    style={s.filterSelect}
                    className="ad-select"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  <select
                    value={complaintFilter.category}
                    onChange={(e) => setComplaintFilter({ ...complaintFilter, category: e.target.value })}
                    style={s.filterSelect}
                    className="ad-select"
                  >
                    <option value="">All Categories</option>
                    <option value="against_doctor">Against Doctor</option>
                    <option value="against_user">Against User</option>
                    <option value="system_issue">System Issue</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="appointment">Appointment</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>

                  {(complaintFilter.status || complaintFilter.priority || complaintFilter.category) && (
                    <button
                      style={s.filterReset}
                      className="ad-btn-outline"
                      onClick={() => setComplaintFilter({ status: "", priority: "", category: "" })}
                    >
                      <FaTimes size={10} />
                      Clear Filters
                    </button>
                  )}
                </div>

                {loading ? (
                  <LoadingBox text="Loading complaints..." />
                ) : complaints.length === 0 ? (
                  <EmptyState
                    Icon={FaCommentDots}
                    title="No complaints found"
                    desc="No complaints match the current filters. Try changing your filter selection."
                  />
                ) : (
                  <div style={s.appsGrid} className="ad-apps-grid">
                    {complaints.map((c) => (
                      <div key={c.id} style={s.appCard} className="ad-app-card">
                        <div style={s.appCardTop}>
                          <div style={s.appId}>#{c.id}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ ...s.statusBadge, ...COMPLAINT_PRIORITY_COLORS[c.priority] }}>
                              {c.priority_display}
                            </span>
                            <span style={{
                              ...s.statusBadge,
                              ...COMPLAINT_STATUS_COLORS[c.status],
                              border: `1px solid ${COMPLAINT_STATUS_COLORS[c.status]?.border}`,
                            }}>
                              {c.status_display}
                            </span>
                          </div>
                        </div>

                        <div style={s.appSubject}>{c.subject}</div>
                        <div style={s.appCategory}>
                          <FaTag size={9} color={TEXT_MUTED} />
                          {c.category_display}
                        </div>

                        <div style={s.appDivider} />

                        <div style={s.appSubmitterInfo}>
                          <div style={s.appSubmitter}>
                            <FaUser size={10} color={MINT_DARK} />
                            <span>{c.submitted_by_name}</span>
                            <span style={s.roleTag}>({c.submitted_by_role?.toUpperCase()})</span>
                          </div>
                          {c.against_doctor_name && (
                            <div style={s.appAgainst}>
                              <FaUserMd size={10} color="#dc2626" />
                              <span>Against: Dr. {c.against_doctor_name}</span>
                            </div>
                          )}
                          {c.against_user_name && (
                            <div style={s.appAgainst}>
                              <FaUser size={10} color="#dc2626" />
                              <span>Against: {c.against_user_name}</span>
                            </div>
                          )}
                        </div>

                        <div style={s.appFooter}>
                          <div style={s.appDate}>
                            <FaCalendarAlt size={9} color={TEXT_MUTED} />
                            {new Date(c.created_at).toLocaleDateString()}
                          </div>
                          <button
                            style={s.viewBtn}
                            className="ad-view-btn"
                            onClick={() => viewComplaintDetail(c.id)}
                          >
                            {c.status === "open" ? "Respond" : "View Details"}
                            <FaArrowRight size={9} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════════════ SETTINGS ═══════════════ */}
          {activeNav === "settings" && (
            <div style={s.section}>
              <div style={s.profileHeader} className="ad-profile-header">
                <div style={s.profileBigAvatar}>
                  {user.first_name?.[0]?.toUpperCase() || "A"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h2 style={s.profileName} className="ad-profile-name">{user.first_name || "Admin"}</h2>
                    <span style={s.adminCrown}>
                      <FaCrown size={9} />
                      Super Admin
                    </span>
                  </div>
                  <p style={s.profileSpec}>System Administrator</p>
                </div>
              </div>

              <h3 style={s.profileSectionTitle}>
                <FaUser size={11} color={MINT_DARK} />
                Account Information
              </h3>
              <div style={s.detailsGrid} className="ad-details-grid">
                <DetailItem Icon={FaEnvelope} label="Email" value={user.email} />
                <DetailItem Icon={FaIdCard} label="Role" value="Super User / Admin" />
                <DetailItem
                  Icon={HiOutlineShieldCheck}
                  label="Account Status"
                  value={user.is_active ? "Active" : "Inactive"}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════════ APPLICATION DETAIL MODAL ═══════════════ */}
      {selectedApp && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null); }}>
          <div style={s.modal} className="ad-modal">
            <div style={s.modalHeader} className="ad-modal-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.modalIdBadge}>Application Review</div>
                <h2 style={s.modalTitle}>{selectedApp.full_name}</h2>
              </div>
              <button style={s.closeBtn} className="ad-close" onClick={() => setSelectedApp(null)}>
                <FaTimes size={14} />
              </button>
            </div>

            <div style={s.modalBody} className="ad-modal-body">
              <h3 style={s.modalSection}>
                <FaUser size={11} color={MINT_DARK} />
                Personal Information
              </h3>
              <div style={s.detailGrid} className="ad-detail-grid">
                <DetailItem Icon={FaUser} label="Full Name" value={selectedApp.full_name} />
                <DetailItem Icon={FaEnvelope} label="Email" value={selectedApp.email} />
                <DetailItem Icon={FaPhone} label="Phone" value={selectedApp.phone} />
                <DetailItem Icon={FaCalendarAlt} label="Submitted" value={new Date(selectedApp.submitted_at).toLocaleString()} />
              </div>

              <h3 style={s.modalSection}>
                <FaGraduationCap size={11} color={MINT_DARK} />
                Professional Information
              </h3>
              <div style={s.detailGrid} className="ad-detail-grid">
                <DetailItem Icon={FaIdCard} label="PMDC Number" value={selectedApp.pmdc_number} />
                <DetailItem Icon={FaStethoscope} label="Specialty" value={selectedApp.specialty_display} />
                <DetailItem Icon={FaBriefcase} label="Experience" value={`${selectedApp.experience_years} years`} />
                <DetailItem Icon={FaMoneyBillWave} label="Consultation Fee" value={`Rs. ${selectedApp.consultation_fee}`} />
                {selectedApp.clinic_address && (
                  <DetailItem Icon={FaMapMarkerAlt} label="Clinic Address" value={selectedApp.clinic_address} fullWidth />
                )}
              </div>

              <h3 style={s.modalSection}>
                <FaPaperclip size={11} color={MINT_DARK} />
                Uploaded Documents
              </h3>
              <div style={s.docsGrid} className="ad-docs-grid">
                <DocumentPreview label="PMDC License" url={selectedApp.pmdc_license_url} />
                <DocumentPreview label="CNIC Front" url={selectedApp.cnic_front_url} />
                <DocumentPreview label="CNIC Back" url={selectedApp.cnic_back_url} />
                <DocumentPreview label="Degree" url={selectedApp.degree_url} />
                {selectedApp.profile_photo_url && (
                  <DocumentPreview label="Profile Photo" url={selectedApp.profile_photo_url} />
                )}
              </div>

              {selectedApp.status === "rejected" && selectedApp.rejection_reason && (
                <>
                  <h3 style={s.modalSection}>
                    <FaTimesCircle size={11} color="#dc2626" />
                    Rejection Reason
                  </h3>
                  <div style={s.rejectionBox}>{selectedApp.rejection_reason}</div>
                </>
              )}

              {selectedApp.status === "approved" && selectedApp.generated_password && (
                <>
                  <h3 style={s.modalSection}>
                    <FaCheckCircle size={11} color={MINT_DARK} />
                    Generated Credentials
                  </h3>
                  <div style={s.credBox}>
                    <div style={s.credRow}>
                      <FaEnvelope size={10} color={MINT_DARK} />
                      <strong>Email:</strong> <code>{selectedApp.email}</code>
                    </div>
                    <div style={s.credRow}>
                      <FaKey size={10} color={MINT_DARK} />
                      <strong>Password:</strong> <code>{selectedApp.generated_password}</code>
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div style={s.errorBox}>
                  <FaInfoCircle size={12} color="#dc2626" />
                  {errorMsg}
                </div>
              )}
            </div>

            {selectedApp.status === "pending" && (
              <div style={s.modalActions} className="ad-modal-actions">
                <button
                  style={s.btnReject}
                  className="ad-reject"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                >
                  <FaTimesCircle size={11} />
                  Reject
                </button>
                <button
                  style={s.btnApprove}
                  className="ad-approve"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  <FaCheckCircle size={11} />
                  {actionLoading ? "Approving..." : "Approve & Generate Credentials"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ REJECT MODAL ═══════════════ */}
      {showRejectModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxWidth: 520 }} className="ad-modal">
            <div style={s.modalHeader} className="ad-modal-header">
              <div style={{ flex: 1 }}>
                <div style={s.modalIdBadgeRed}>Reject Application</div>
                <h2 style={s.modalTitle}>Provide Rejection Reason</h2>
              </div>
              <button
                style={s.closeBtn}
                className="ad-close"
                onClick={() => { setShowRejectModal(false); setRejectReason(""); setErrorMsg(""); }}
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div style={s.modalBody} className="ad-modal-body">
              <p style={s.modalDescription}>
                Please provide a reason for rejecting <strong>{selectedApp?.full_name}'s</strong> application.
                The applicant will be notified.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Documents are not clear, PMDC number does not match official records..."
                style={s.textarea}
                className="ad-textarea"
                rows={5}
              />
              <div style={s.charCount}>
                {rejectReason.length} / minimum 10 characters
              </div>

              {errorMsg && (
                <div style={s.errorBox}>
                  <FaInfoCircle size={12} color="#dc2626" />
                  {errorMsg}
                </div>
              )}
            </div>

            <div style={s.modalActions} className="ad-modal-actions">
              <button
                style={s.btnOutline}
                className="ad-btn-outline"
                onClick={() => { setShowRejectModal(false); setRejectReason(""); setErrorMsg(""); }}
              >
                Cancel
              </button>
              <button
                style={s.btnReject}
                className="ad-reject"
                onClick={handleReject}
                disabled={actionLoading || rejectReason.length < 10}
              >
                <FaTimesCircle size={11} />
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREDENTIALS MODAL ═══════════════ */}
      {showCredentials && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxWidth: 500 }} className="ad-modal">
            <div style={s.successWrap}>
              <div style={s.successIconBox} className="ad-pop">
                <FaCheckCircle size={56} color={MINT_DARK} />
              </div>
              <h2 style={s.successTitle}>Doctor Approved!</h2>
              <p style={s.successSub}>
                <strong>Dr. {showCredentials.name}</strong> can now login with these credentials:
              </p>

              <div style={s.credCard}>
                <div style={s.credCardRow}>
                  <div style={s.credCardLabel}>
                    <FaEnvelope size={11} color={MINT_DARK} />
                    Email
                  </div>
                  <div style={s.credCardValueWrap}>
                    <code style={s.credCardValue}>{showCredentials.email}</code>
                    <button
                      style={s.copyBtn}
                      onClick={() => copyToClipboard(showCredentials.email)}
                      title="Copy email"
                    >
                      <FaCopy size={10} />
                    </button>
                  </div>
                </div>
                <div style={s.credCardRow}>
                  <div style={s.credCardLabel}>
                    <FaKey size={11} color={MINT_DARK} />
                    Password
                  </div>
                  <div style={s.credCardValueWrap}>
                    <code style={s.credCardValue}>{showCredentials.password}</code>
                    <button
                      style={s.copyBtn}
                      onClick={() => copyToClipboard(showCredentials.password)}
                      title="Copy password"
                    >
                      <FaCopy size={10} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={s.credInfoBox}>
                <FaInfoCircle size={11} color={MINT_DARK} />
                <span>
                  Please share these credentials securely with the doctor. In production, an actual email will be sent automatically.
                </span>
              </div>

              <button
                style={{ ...s.btnPrimary, width: "100%", marginTop: 16 }}
                className="ad-btn-primary"
                onClick={() => setShowCredentials(null)}
              >
                <FaCheckCircle size={11} />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ COMPLAINT DETAIL & RESPOND MODAL ═══════════════ */}
      {selectedComplaint && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setSelectedComplaint(null); setResponseText(""); setErrorMsg(""); } }}>
          <div style={s.modal} className="ad-modal">
            <div style={s.modalHeader} className="ad-modal-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.modalIdBadge}>Complaint #{selectedComplaint.id}</div>
                <h2 style={s.modalTitle}>{selectedComplaint.subject}</h2>
              </div>
              <button
                style={s.closeBtn}
                className="ad-close"
                onClick={() => { setSelectedComplaint(null); setResponseText(""); setErrorMsg(""); }}
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div style={s.modalBody} className="ad-modal-body">
              <h3 style={s.modalSection}>
                <FaClipboardList size={11} color={MINT_DARK} />
                Complaint Info
              </h3>
              <div style={s.detailGrid} className="ad-detail-grid">
                <DetailItem Icon={FaTag} label="Category" value={selectedComplaint.category_display} />
                <DetailItem Icon={FaExclamationCircle} label="Priority" value={selectedComplaint.priority_display} />
                <DetailItem Icon={FaInfoCircle} label="Status" value={selectedComplaint.status_display} />
                <DetailItem Icon={FaCalendarAlt} label="Submitted" value={new Date(selectedComplaint.created_at).toLocaleString()} />
              </div>

              <h3 style={s.modalSection}>
                <FaUser size={11} color={MINT_DARK} />
                Submitted By
              </h3>
              <div style={s.detailGrid} className="ad-detail-grid">
                <DetailItem Icon={FaUser} label="Name" value={selectedComplaint.submitted_by_name} />
                <DetailItem Icon={FaEnvelope} label="Email" value={selectedComplaint.submitted_by_email} />
                <DetailItem Icon={FaIdCard} label="Role" value={(selectedComplaint.submitted_by_role || "").toUpperCase()} />
              </div>

              {(selectedComplaint.against_doctor_name || selectedComplaint.against_user_name) && (
                <>
                  <h3 style={s.modalSection}>
                    <FaExclamationTriangle size={11} color="#dc2626" />
                    Complaint Against
                  </h3>
                  <div style={s.detailGrid} className="ad-detail-grid">
                    {selectedComplaint.against_doctor_name && (
                      <DetailItem Icon={FaUserMd} label="Doctor" value={`Dr. ${selectedComplaint.against_doctor_name}`} fullWidth />
                    )}
                    {selectedComplaint.against_user_name && (
                      <DetailItem Icon={FaUser} label="User" value={selectedComplaint.against_user_name} fullWidth />
                    )}
                  </div>
                </>
              )}

              <h3 style={s.modalSection}>
                <FaFileAlt size={11} color={MINT_DARK} />
                Full Description
              </h3>
              <div style={s.descBox}>{selectedComplaint.description}</div>

              {selectedComplaint.attachment_url && (
                <>
                  <h3 style={s.modalSection}>
                    <FaPaperclip size={11} color={MINT_DARK} />
                    Attachment
                  </h3>
                  <a
                    href={selectedComplaint.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    style={s.attachmentLink}
                  >
                    <FaPaperclip size={11} />
                    View Attachment
                    <FaArrowRight size={9} />
                  </a>
                </>
              )}

              {selectedComplaint.admin_response && (
                <>
                  <h3 style={s.modalSection}>
                    <FaCommentDots size={11} color={MINT_DARK} />
                    Previous Response
                  </h3>
                  <div style={s.responseBox}>
                    <div style={s.responseHeader}>
                      By: <strong>{selectedComplaint.resolved_by_name || "Admin"}</strong>
                      {selectedComplaint.resolved_at && (
                        <span> · {new Date(selectedComplaint.resolved_at).toLocaleString()}</span>
                      )}
                    </div>
                    <p style={s.responseText}>{selectedComplaint.admin_response}</p>
                  </div>
                </>
              )}

              {selectedComplaint.status !== "closed" && (
                <>
                  <h3 style={s.modalSection}>
                    <FaPaperPlane size={11} color={MINT_DARK} />
                    {selectedComplaint.admin_response ? "Update Response" : "Write Response"}
                  </h3>

                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response here. This message will also be sent to the user via email..."
                    style={s.textarea}
                    className="ad-textarea"
                    rows={5}
                  />
                  <div style={s.charCount}>
                    {responseText.length} / minimum 5 characters
                  </div>

                  <label style={s.statusLabel}>Mark Status As:</label>
                  <div style={s.statusBtnRow}>
                    {[
                      { value: "in_progress", label: "In Progress", Icon: FaHourglassHalf, bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
                      { value: "resolved", label: "Resolved", Icon: FaCheckCircle, bg: "#dcfce7", color: "#166534", border: "#86efac" },
                      { value: "closed", label: "Closed", Icon: FaLock, bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
                    ].map((opt) => {
                      const active = responseStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setResponseStatus(opt.value)}
                          className={`ad-status-btn ${active ? "active" : ""}`}
                          style={{
                            ...s.statusBtn,
                            ...(active ? {
                              background: opt.bg,
                              color: opt.color,
                              border: `2px solid ${opt.border}`,
                            } : {}),
                          }}
                        >
                          <opt.Icon size={10} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {errorMsg && (
                    <div style={s.errorBox}>
                      <FaInfoCircle size={12} color="#dc2626" />
                      {errorMsg}
                    </div>
                  )}
                </>
              )}

              {selectedComplaint.status === "closed" && (
                <div style={s.closedBox}>
                  <FaLock size={14} color="#374151" />
                  <span>This complaint is closed and cannot be updated.</span>
                </div>
              )}
            </div>

            {selectedComplaint.status !== "closed" && (
              <div style={s.modalActions} className="ad-modal-actions">
                <button
                  style={s.btnOutline}
                  className="ad-btn-outline"
                  onClick={() => { setSelectedComplaint(null); setResponseText(""); setErrorMsg(""); }}
                >
                  Cancel
                </button>
                <button
                  style={{ ...s.btnApprove, opacity: responseText.length >= 5 && !actionLoading ? 1 : 0.5 }}
                  className="ad-approve"
                  disabled={responseText.length < 5 || actionLoading}
                  onClick={handleSubmitResponse}
                >
                  <FaPaperPlane size={11} />
                  {actionLoading ? "Sending..." : `Submit Response`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ HELPER COMPONENTS ═══════════════════ */

function ApplicationCard({ app, onView }) {
  return (
    <div style={s.appCard} className="ad-app-card">
      <div style={s.appCardTop}>
        <DoctorAvatar
          photoUrl={app.profile_photo_url}
          name={app.full_name}
          size={44}
          fontSize={14}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.appName}>{app.full_name}</div>
          <div style={s.appEmail}>{app.email}</div>
        </div>
        <span style={{
          ...s.statusBadge,
          ...STATUS_COLORS[app.status],
          border: `1px solid ${STATUS_COLORS[app.status]?.border}`,
        }}>
          {app.status_display}
        </span>
      </div>

      <div style={s.appMeta} className="ad-app-meta">
        <div style={s.appMetaItem}>
          <FaGraduationCap size={10} color={MINT_DARK} />
          {app.specialty_display}
        </div>
        <div style={s.appMetaItem}>
          <FaIdCard size={10} color={MINT_DARK} />
          {app.pmdc_number}
        </div>
        <div style={s.appMetaItem}>
          <FaBriefcase size={10} color={MINT_DARK} />
          {app.experience_years} yrs
        </div>
        <div style={s.appMetaItem}>
          <FaMoneyBillWave size={10} color={MINT_DARK} />
          Rs. {app.consultation_fee}
        </div>
      </div>

      <div style={s.appFooter}>
        <div style={s.appDate}>
          <FaCalendarAlt size={9} color={TEXT_MUTED} />
          {new Date(app.submitted_at).toLocaleDateString()}
        </div>
        <button style={s.viewBtn} className="ad-view-btn" onClick={onView}>
          {app.status === "pending" ? "Review" : "View Details"}
          <FaArrowRight size={9} />
        </button>
      </div>
    </div>
  );
}

function DetailItem({ Icon, label, value, fullWidth }) {
  return (
    <div style={{ ...s.detailItem, ...(fullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <div style={s.detailKeyRow}>
        {Icon && <Icon size={10} color={MINT_DARK} />}
        <span style={s.detailKey}>{label}</span>
      </div>
      <div style={s.detailValue}>{value || "—"}</div>
    </div>
  );
}

function DocumentPreview({ label, url }) {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div style={s.docCard} className="ad-doc">
      <div style={s.docCardHeader}>
        {isImage ? (
          <FaImage size={13} color={MINT_DARK} />
        ) : (
          <FaFileAlt size={13} color={MINT_DARK} />
        )}
        <span style={s.docCardLabel}>{label}</span>
      </div>
      {isImage ? (
        <img src={url} alt={label} style={s.docImage} />
      ) : (
        <div style={s.docPlaceholder}>
          <FaFileAlt size={28} color={TEXT_MUTED} />
          <span style={{ fontSize: 11.5, color: TEXT_MUTED, fontWeight: 700, marginTop: 8 }}>
            PDF / Document
          </span>
        </div>
      )}
      <a href={url} target="_blank" rel="noreferrer" style={s.docOpenBtn}>
        <FaArrowRight size={9} />
        View Full Size
      </a>
    </div>
  );
}

function LoadingBox({ text = "Loading..." }) {
  return (
    <div style={s.loadingBox}>
      <FaHourglassHalf size={28} color={MINT_DARK} />
      <p>{text}</p>
    </div>
  );
}

function EmptyState({ Icon, title, desc }) {
  return (
    <div style={s.emptyState}>
      <div style={s.emptyIconBox}>
        <Icon size={32} color={MINT_DARK} />
      </div>
      <h3 style={s.emptyTitle}>{title}</h3>
      <p style={s.emptyText}>{desc}</p>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },

  // SIDEBAR
  sidebar: {
    background: "#0a1f15",
    minHeight: "100vh",
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "sticky",
    top: 0,
  },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "0 8px",
    marginBottom: 24,
  },
  logoIcon: {
    width: 40, height: 40,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(42,157,92,0.4)",
  },
  logoText: { fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(251,191,36,0.15)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 11.5,
    fontWeight: 700,
    margin: "0 8px 20px",
    width: "fit-content",
  },
  navItems: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  navItem: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.65)",
    padding: "11px 12px",
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
  },
  navItemActive: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff",
    boxShadow: "0 4px 12px rgba(26,110,63,0.4)",
  },
  navLabel: { flex: 1 },
  notifBadge: {
    background: "#dc2626",
    color: "#fff",
    borderRadius: 12,
    padding: "2px 7px",
    fontSize: 10.5,
    fontWeight: 800,
    minWidth: 18,
    textAlign: "center",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.65)",
    padding: "11px 12px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  // MAIN
  main: { flex: 1, minWidth: 0 },
  topBar: {
    background: "#fff",
    borderBottom: `1px solid ${BORDER}`,
    padding: "14px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    gap: 16,
    flexWrap: "wrap",
  },
  topLeft: { display: "flex", alignItems: "center", gap: 14 },
  toggleBtn: {
    width: 36, height: 36,
    background: "#f4f9f6",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.4px",
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  adminPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff8e6",
    border: "1.5px solid #fde68a",
    borderRadius: 30,
    padding: "5px 14px 5px 5px",
    position: "relative",
  },
  adminAvatar: {
    width: 34, height: 34,
    background: `linear-gradient(135deg, #fbbf24, #d97706)`,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(217,119,6,0.3)",
  },
  adminInfo: { display: "flex", flexDirection: "column" },
  adminName: { fontSize: 13, fontWeight: 800, color: "#7a5a10", lineHeight: 1.2 },
  adminSub: { fontSize: 10.5, color: "#92400e", fontWeight: 700, lineHeight: 1.2, marginTop: 2 },
  adminBadge: {
    width: 18, height: 18,
    background: "#d97706",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // CONTENT
  content: { padding: "24px 28px 48px" },

  // STATS
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    marginBottom: 26,
  },
  statCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statIconBox: {
    width: 46, height: 46,
    borderRadius: 11,
    background: MINT_LIGHT,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.4px",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 4,
  },

  // SECTION
  section: { marginBottom: 28 },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.3px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "5px 11px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 800,
  },

  // ACTIONS
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  actionCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "20px 22px",
    textAlign: "left",
    fontFamily: "inherit",
    position: "relative",
  },
  actionIconBox: {
    width: 48, height: 48,
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 6,
    letterSpacing: "-0.2px",
  },
  actionDesc: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  actionArrow: {
    position: "absolute",
    top: 22,
    right: 22,
    width: 26, height: 26,
    background: MINT_LIGHT,
    borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // APPS GRID
  appsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
  },
  appCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  appCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  appId: {
    background: "#fafffe",
    color: MINT_DARK,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 11.5,
    fontWeight: 800,
  },
  appName: {
    fontSize: 14.5,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 2,
    letterSpacing: "-0.2px",
  },
  appEmail: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600 },
  appMeta: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    padding: "12px 0",
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },
  appMetaItem: {
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  appFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appDate: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  appSubject: {
    fontSize: 14.5,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.2px",
    lineHeight: 1.4,
  },
  appCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  appDivider: { height: 1, background: BORDER },
  appSubmitterInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  appSubmitter: {
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  roleTag: {
    fontSize: 10,
    color: TEXT_MUTED,
    fontWeight: 700,
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    padding: "1px 6px",
    borderRadius: 4,
  },
  appAgainst: {
    fontSize: 12.5,
    color: "#991b1b",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  viewBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 8,
    padding: "7px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  // STATUS BADGES
  statusBadge: {
    borderRadius: 5,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    letterSpacing: 0.3,
  },

  // FILTER
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  filterPill: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    color: TEXT_BODY,
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },

  // COMPLAINT FILTERS
  complaintFilterRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterSelect: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 9,
    padding: "8px 32px 8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    color: TEXT_BODY,
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%235a7a6a'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "14px",
  },
  filterReset: {
    background: "#fff",
    color: "#dc2626",
    border: "1.5px solid #fecaca",
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  // TABLE
  tableWrap: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "inherit",
  },
  thead: { background: "#fafffe", borderBottom: `1px solid ${BORDER}` },
  th: {
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 800,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: `1px solid ${BORDER}` },
  td: {
    padding: "14px 16px",
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 600,
    verticalAlign: "middle",
  },
  tdBold: {
    fontSize: 13.5,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  tdEmail: { fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600 },
  codeText: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 5,
    padding: "2px 7px",
    fontSize: 11.5,
    fontWeight: 700,
    color: TEXT_DARK,
    fontFamily: "monospace",
  },

  // TABLE ACTION BUTTONS
  suspendBtn: {
    background: "#fff",
    color: "#92400e",
    border: "1.5px solid #fde68a",
    borderRadius: 7,
    padding: "6px 11px",
    fontWeight: 700,
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  activateBtn: {
    background: "#fff",
    color: "#166534",
    border: "1.5px solid #86efac",
    borderRadius: 7,
    padding: "6px 11px",
    fontWeight: 700,
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  deleteBtn: {
    background: "#fff",
    color: "#dc2626",
    border: "1.5px solid #fecaca",
    borderRadius: 7,
    padding: "6px 11px",
    fontWeight: 700,
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },

  // LOADING / EMPTY
  loadingBox: {
    textAlign: "center",
    padding: "60px 20px",
    color: TEXT_MUTED,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
  },
  emptyState: {
    textAlign: "center",
    padding: "50px 28px",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
  },
  emptyIconBox: {
    width: 64, height: 64,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 14px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 8px",
  },
  emptyText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 1.5,
    margin: 0,
    maxWidth: 360,
    margin: "0 auto",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,32,24,0.55)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    maxWidth: 720,
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
    border: `1px solid ${BORDER}`,
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: `1px solid ${BORDER}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  modalIdBadge: {
    display: "inline-block",
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalIdBadgeRed: {
    display: "inline-block",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.3px",
    lineHeight: 1.3,
  },
  closeBtn: {
    width: 34, height: 34,
    background: "#f4f9f6",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    color: TEXT_MUTED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalBody: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  },
  modalSection: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 7,
    margin: "20px 0 12px",
  },
  modalDescription: {
    fontSize: 13.5,
    color: TEXT_BODY,
    lineHeight: 1.6,
    marginBottom: 14,
  },
  modalActions: {
    padding: "16px 24px",
    borderTop: `1px solid ${BORDER}`,
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },

  // DETAILS
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  detailItem: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "10px 12px",
  },
  detailKeyRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  detailKey: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: 700,
    wordBreak: "break-word",
  },

  // DOCS
  docsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  docCard: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  docCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  docCardLabel: {
    fontSize: 12.5,
    fontWeight: 800,
    color: TEXT_DARK,
  },
  docImage: {
    width: "100%",
    height: 130,
    objectFit: "cover",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    background: "#fff",
  },
  docPlaceholder: {
    width: "100%",
    height: 130,
    background: "#fff",
    border: `1px dashed ${BORDER}`,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  docOpenBtn: {
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "7px 12px",
    borderRadius: 8,
    fontSize: 11.5,
    fontWeight: 800,
    textDecoration: "none",
    textAlign: "center",
    border: `1px solid ${MINT}30`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  // BOXES
  rejectionBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderLeft: "3px solid #dc2626",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 13.5,
    color: "#7f1d1d",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  credBox: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT}`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  credRow: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  descBox: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 14,
    color: TEXT_BODY,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  attachmentLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "10px 16px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "none",
    border: `1.5px solid ${MINT}`,
  },
  responseBox: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT}`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 11,
    padding: "12px 16px",
  },
  responseHeader: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 700,
    marginBottom: 6,
  },
  responseText: {
    margin: 0,
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  closedBox: {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 13,
    color: "#374151",
    fontWeight: 700,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  // ERROR
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginTop: 14,
    border: "1px solid #fecaca",
  },

  // TEXTAREA
  textarea: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT_DARK,
    background: "#fafffe",
    resize: "vertical",
    boxSizing: "border-box",
    minHeight: 110,
    lineHeight: 1.6,
    outline: "none",
  },
  charCount: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 5,
    textAlign: "right",
  },

  // STATUS BUTTONS
  statusLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_BODY,
    display: "block",
    margin: "14px 0 8px",
  },
  statusBtnRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBtn: {
    background: "#fff",
    color: TEXT_BODY,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 9,
    padding: "9px 16px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  // BUTTONS
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },
  btnApprove: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
  },
  btnReject: {
    background: "#fff",
    color: "#dc2626",
    border: "1.5px solid #fecaca",
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },
  btnOutline: {
    background: "#fff",
    color: TEXT_BODY,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // CREDENTIALS DISPLAY
  successWrap: {
    padding: "32px 28px",
    textAlign: "center",
  },
  successIconBox: {
    width: 84, height: 84,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 18px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  successSub: {
    fontSize: 14,
    color: TEXT_BODY,
    marginBottom: 22,
    lineHeight: 1.6,
  },
  credCard: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT}`,
    borderRadius: 12,
    padding: "16px 18px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  credCardRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  credCardLabel: {
    fontSize: 11,
    color: MINT_DARK,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  credCardValueWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    padding: "8px 12px",
  },
  credCardValue: {
    flex: 1,
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: 700,
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  copyBtn: {
    width: 26, height: 26,
    background: MINT_LIGHT,
    border: `1px solid ${MINT}`,
    borderRadius: 6,
    cursor: "pointer",
    color: MINT_DARK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  credInfoBox: {
    background: "#fff8e6",
    border: "1px solid #fde68a",
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 12,
    color: "#7a5a10",
    fontWeight: 600,
    marginTop: 16,
    textAlign: "left",
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    lineHeight: 1.5,
  },

  // PROFILE (Settings)
  profileHeader: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "26px 28px",
    display: "flex",
    alignItems: "center",
    gap: 22,
    flexWrap: "wrap",
    marginBottom: 24,
    boxShadow: "0 4px 14px rgba(15,32,24,0.04)",
  },
  profileBigAvatar: {
    width: 80, height: 80,
    background: `linear-gradient(135deg, #fbbf24, #d97706)`,
    borderRadius: 18,
    color: "#fff",
    fontSize: 28,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 22px rgba(217,119,6,0.3)",
  },
  profileName: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.4px",
  },
  adminCrown: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#fff8e6",
    color: "#92400e",
    border: "1px solid #fde68a",
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 800,
  },
  profileSpec: {
    fontSize: 13.5,
    color: MINT_DARK,
    fontWeight: 700,
    margin: "0",
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 14px",
    letterSpacing: "-0.2px",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 10,
  },
};