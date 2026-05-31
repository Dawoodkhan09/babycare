import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  adminGetStats,
  adminGetApplications,
  adminGetApplicationDetail,
  adminApproveApplication,
  adminRejectApplication,
  adminGetDoctors,
  adminToggleDoctorActive,
  adminDeleteDoctor,
} from "../api/doctors";
import DoctorAvatar from "../components/DoctorAvatar";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const STATUS_COLORS = {
  pending:  { bg: "#fff8e6", color: "#7a5a10" },
  approved: { bg: "#e8f8ef", color: "#1a6e3f" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },
};

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard",        id: "dashboard" },
  { icon: "⏳", label: "Pending Apps",      id: "pending" },
  { icon: "👨‍⚕️", label: "All Doctors",      id: "doctors" },
  { icon: "📋", label: "All Applications", id: "applications" },
  { icon: "⚙️", label: "Settings",         id: "settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);   // detailed application
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCredentials, setShowCredentials] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── Load Stats ───
  const loadStats = async () => {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      console.error("Stats load error:", err);
    }
  };

  // ─── Load Applications ───
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

  // ─── Load Doctors ───
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

  // ─── On mount + tab change ───
  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeNav === "pending") {
      loadApplications("pending");
    } else if (activeNav === "applications") {
      loadApplications(statusFilter);
    } else if (activeNav === "doctors") {
      loadDoctors();
    }
  }, [activeNav, statusFilter]);

  // ─── View application detail ───
  const viewApplication = async (id) => {
    try {
      const detail = await adminGetApplicationDetail(id);
      setSelectedApp(detail);
    } catch (err) {
      console.error("Detail load error:", err);
    }
  };

  // ─── Approve ───
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

  // ─── Reject ───
  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim() || rejectReason.length < 10) {
      setErrorMsg("Rejection reason kam se kam 10 characters honi chahiye");
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

  // ─── Toggle doctor active/suspend ───
  const handleToggleDoctor = async (doctorId, doctorName, currentlyActive) => {
    const action = currentlyActive ? "suspend" : "activate";
    const msg = currentlyActive
      ? `Kya aap "${doctorName}" ko SUSPEND karna chahte hain?\n\nWoh login nahi kar paa-yenge.`
      : `Kya aap "${doctorName}" ko wapas ACTIVATE karna chahte hain?`;

    if (!window.confirm(msg)) return;

    try {
      await adminToggleDoctorActive(doctorId);
      loadDoctors();
      loadStats();
    } catch (err) {
      alert(`Doctor ${action} fail ho gaya: ${err.response?.data?.detail || "Unknown error"}`);
    }
  };

  // ─── Permanently delete doctor ───
  const handleDeleteDoctor = async (doctorId, doctorName) => {
    const confirm1 = window.confirm(
      `⚠️ WARNING: Kya aap "${doctorName}" ko PERMANENTLY delete karna chahte hain?\n\n` +
      `Yeh action UNDONE nahi ho sakta!\n\n` +
      `- Doctor ka account delete ho jayega\n` +
      `- Saari appointments cancel ho jayengi\n` +
      `- Yeh data wapas nahi aayega`
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      `Confirm karne ke liye doctor ka naam exactly type karein:\n\n"${doctorName}"`
    );
    if (confirm2 !== doctorName) {
      alert("Naam match nahi kiya. Delete cancel ho gaya.");
      return;
    }

    try {
      await adminDeleteDoctor(doctorId);
      alert(`✅ Doctor "${doctorName}" permanently delete ho gaya.`);
      loadDoctors();
      loadStats();
    } catch (err) {
      alert(`Delete fail ho gaya: ${err.response?.data?.detail || "Unknown error"}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 400, height: 400, background: "#d1f5e0", top: "-180px", right: "10%", opacity: 0.35 }} />
      <div className="bc-orb" style={{ width: 320, height: 320, background: "#a7f3c4", bottom: "5%", left: "15%", opacity: 0.3, animationDelay: "3s" }} />

      {/* ─────────── SIDEBAR ─────────── */}
      <div style={{ ...s.sidebar, width: sidebarOpen ? 240 : 64 }} className="bc-anim-fadeLeft">
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon} className="bc-float">🍼</div>
          {sidebarOpen && <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span></span>}
        </div>

        {sidebarOpen && (
          <div style={s.roleBadge} className="bc-anim-fadeUp">
            <span style={{ fontSize: 11 }}>👑</span>
            <span>Admin Panel</span>
          </div>
        )}

        <div style={s.navItems}>
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              style={{ ...s.navItem, ...(activeNav === item.id ? s.navItemActive : {}) }}
              className={`bc-anim-fadeLeft bc-d${i + 1}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={s.navLabel}>{item.label}</span>}
              {sidebarOpen && item.id === "pending" && stats?.pending_applications > 0 && (
                <span style={s.notifBadge}>{stats.pending_applications}</span>
              )}
            </button>
          ))}
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* ─────────── MAIN ─────────── */}
      <div style={s.main}>
        {/* TOP BAR */}
        <div style={s.topBar}>
          <div style={s.topLeft}>
            <button style={s.toggleBtn} onClick={() => setSidebarOpen((o) => !o)}>☰</button>
            <h1 style={s.topTitle} key={activeNav} className="bc-anim-fadeUp">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.icon}{" "}
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>
          <div style={s.topRight}>
            <div style={s.adminPill}>
              <div style={s.adminAvatar}>{user.first_name?.[0]?.toUpperCase() || "A"}</div>
              <div>
                <div style={s.adminName}>{user.first_name || "Admin"}</div>
                <div style={s.adminSub}>Super User</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={s.content}>

          {/* ═══════════════ DASHBOARD OVERVIEW ═══════════════ */}
          {activeNav === "dashboard" && (
            <div key="dashboard" className="bc-anim-fadeUp">
              {stats ? (
                <div style={s.statsGrid}>
                  {[
                    { icon: "👨‍👩‍👧", label: "Total Parents",       value: stats.total_parents,         color: MINT },
                    { icon: "👨‍⚕️", label: "Total Doctors",        value: stats.total_doctors,         color: "#1a5c8a" },
                    { icon: "⏳", label: "Pending Applications", value: stats.pending_applications,  color: "#fbbf24" },
                    { icon: "✅", label: "Approved",             value: stats.approved_applications, color: MINT_DARK },
                    { icon: "❌", label: "Rejected",             value: stats.rejected_applications, color: "#dc2626" },
                    { icon: "👥", label: "Total Users",          value: stats.total_users,           color: "#7c3aed" },
                  ].map((stat, i) => (
                    <div key={stat.label} style={s.statCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}>
                      <div style={{ ...s.statIcon, background: `${stat.color}15` }}>{stat.icon}</div>
                      <div>
                        <div style={s.statValue}>{stat.value}</div>
                        <div style={s.statLabel}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.loadingBox}>
                  <span className="bc-spinner" />
                  <p>Loading stats...</p>
                </div>
              )}

              {/* Quick Action Cards */}
              <div style={s.section} className="bc-anim-fadeUp bc-d5">
                <h2 style={s.sectionTitle}>⚡ Quick Actions</h2>
                <div style={s.actionsGrid}>
                  <button style={s.actionCard} className="bc-glow-on-hover" onClick={() => setActiveNav("pending")}>
                    <span style={{ fontSize: 28 }}>⏳</span>
                    <div style={s.actionTitle}>Review Pending</div>
                    <div style={s.actionDesc}>{stats?.pending_applications || 0} doctors waiting for approval</div>
                  </button>
                  <button style={s.actionCard} className="bc-glow-on-hover" onClick={() => setActiveNav("doctors")}>
                    <span style={{ fontSize: 28 }}>👨‍⚕️</span>
                    <div style={s.actionTitle}>Manage Doctors</div>
                    <div style={s.actionDesc}>View and manage active doctors</div>
                  </button>
                  <button style={s.actionCard} className="bc-glow-on-hover" onClick={() => setActiveNav("applications")}>
                    <span style={{ fontSize: 28 }}>📋</span>
                    <div style={s.actionTitle}>All Applications</div>
                    <div style={s.actionDesc}>View history of all applications</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ PENDING APPLICATIONS ═══════════════ */}
          {activeNav === "pending" && (
            <div style={s.section} key="pending" className="bc-anim-fadeUp">
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>⏳ Pending Doctor Applications</h2>
                <span style={s.countBadge}>{applications.length} pending</span>
              </div>

              {loading ? (
                <div style={s.loadingBox}>
                  <span className="bc-spinner" />
                  <p>Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 56, marginBottom: 12 }} className="bc-float">🎉</div>
                  <p style={{ fontSize: 14, color: "#5a7a6a" }}>No pending applications! All caught up.</p>
                </div>
              ) : (
                <div style={s.appsGrid}>
                  {applications.map((app, i) => (
                    <ApplicationCard key={app.id} app={app} index={i} onView={() => viewApplication(app.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ALL APPLICATIONS ═══════════════ */}
          {activeNav === "applications" && (
            <div style={s.section} key="applications" className="bc-anim-fadeUp">
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>📋 All Applications</h2>
                <span style={s.countBadge}>{applications.length} total</span>
              </div>

              <div style={s.filterRow}>
                {["all", "pending", "approved", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    style={{ ...s.filterPill, ...(statusFilter === f ? s.filterActive : {}) }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={s.loadingBox}><span className="bc-spinner" /><p>Loading...</p></div>
              ) : applications.length === 0 ? (
                <div style={s.emptyState}>
                  <p style={{ fontSize: 14, color: "#5a7a6a" }}>No applications found.</p>
                </div>
              ) : (
                <div style={s.appsGrid}>
                  {applications.map((app, i) => (
                    <ApplicationCard key={app.id} app={app} index={i} onView={() => viewApplication(app.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ACTIVE DOCTORS ═══════════════ */}
          {activeNav === "doctors" && (
            <div style={s.section} key="doctors" className="bc-anim-fadeUp">
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>👨‍⚕️ Active Doctors</h2>
                <span style={s.countBadge}>{doctors.length} total</span>
              </div>

              {loading ? (
                <div style={s.loadingBox}><span className="bc-spinner" /><p>Loading...</p></div>
              ) : doctors.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 56, marginBottom: 12 }} className="bc-float">👨‍⚕️</div>
                  <p style={{ fontSize: 14, color: "#5a7a6a" }}>No approved doctors yet.</p>
                </div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
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
                      {doctors.map((doc, i) => (
                        <tr key={doc.id} style={{ ...s.tr, background: i % 2 === 0 ? "rgba(255,255,255,0.6)" : "rgba(250,255,254,0.6)" }}>
                          <td style={s.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <DoctorAvatar
                                photoUrl={doc.profile_photo_url}
                                name={doc.full_name}
                                size={40}
                                fontSize={14}
                              />
                              <div>
                                <div style={s.tdBold}>{doc.full_name}</div>
                                <div style={{ fontSize: 11, color: "#9ab5a5" }}>{doc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}>{doc.specialty}</td>
                          <td style={s.td}>{doc.pmdc_number}</td>
                          <td style={s.td}>{doc.experience_years} yrs</td>
                          <td style={s.td}>Rs. {doc.consultation_fee}</td>
                          <td style={s.td}>
                            <span style={{ ...s.statusBadge, ...(doc.is_active ? STATUS_COLORS.approved : STATUS_COLORS.rejected) }}>
                              {doc.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={s.td}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                              <button
                                style={doc.is_active ? s.suspendBtn : s.activateBtn}
                                onClick={() => handleToggleDoctor(doc.id, doc.full_name, doc.is_active)}
                                title={doc.is_active ? "Suspend doctor" : "Activate doctor"}
                              >
                                {doc.is_active ? "🔒 Suspend" : "🔓 Activate"}
                              </button>
                              <button
                                style={s.deleteBtn}
                                onClick={() => handleDeleteDoctor(doc.id, doc.full_name)}
                                title="Permanently delete doctor"
                              >
                                🗑️ Delete
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

          {/* ═══════════════ SETTINGS ═══════════════ */}
          {activeNav === "settings" && (
            <div style={s.section} key="settings" className="bc-anim-fadeUp">
              <h2 style={s.sectionTitle}>⚙️ Admin Settings</h2>
              <div style={s.profileGrid}>
                {[
                  ["Email", user.email],
                  ["Role", "Super User / Admin"],
                  ["Account Status", user.is_active ? "Active" : "Inactive"],
                ].map(([k, v]) => (
                  <div key={k} style={s.profileItem}>
                    <div style={s.profileKey}>{k}</div>
                    <div style={s.profileValue}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ APPLICATION DETAIL MODAL ═══════════════ */}
      {selectedApp && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null); }}>
          <div style={s.modal} className="bc-anim-scaleIn">
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>📋 Application Review</h2>
              <button style={s.closeBtn} onClick={() => setSelectedApp(null)}>✕</button>
            </div>

            <div style={s.modalBody}>
              {/* Personal Info */}
              <h3 style={s.modalSection}>👤 Personal Information</h3>
              <div style={s.detailGrid}>
                <DetailItem label="Full Name"  value={selectedApp.full_name} />
                <DetailItem label="Email"      value={selectedApp.email} />
                <DetailItem label="Phone"      value={selectedApp.phone} />
                <DetailItem label="Submitted"  value={new Date(selectedApp.submitted_at).toLocaleString()} />
              </div>

              {/* Professional Info */}
              <h3 style={s.modalSection}>🎓 Professional Information</h3>
              <div style={s.detailGrid}>
                <DetailItem label="PMDC Number"      value={selectedApp.pmdc_number} />
                <DetailItem label="Specialty"         value={selectedApp.specialty_display} />
                <DetailItem label="Experience"       value={`${selectedApp.experience_years} years`} />
                <DetailItem label="Consultation Fee" value={`Rs. ${selectedApp.consultation_fee}`} />
                {selectedApp.clinic_address && (
                  <DetailItem label="Clinic Address" value={selectedApp.clinic_address} fullWidth />
                )}
              </div>

              {/* Documents */}
              <h3 style={s.modalSection}>📄 Uploaded Documents</h3>
              <div style={s.docsGrid}>
                <DocumentPreview label="PMDC License" url={selectedApp.pmdc_license_url} />
                <DocumentPreview label="CNIC Front"   url={selectedApp.cnic_front_url} />
                <DocumentPreview label="CNIC Back"    url={selectedApp.cnic_back_url} />
                <DocumentPreview label="Degree"       url={selectedApp.degree_url} />
                {selectedApp.profile_photo_url && (
                  <DocumentPreview label="Profile Photo" url={selectedApp.profile_photo_url} />
                )}
              </div>

              {/* Status / Rejection reason */}
              {selectedApp.status === "rejected" && selectedApp.rejection_reason && (
                <>
                  <h3 style={s.modalSection}>❌ Rejection Reason</h3>
                  <div style={s.rejectionBox}>{selectedApp.rejection_reason}</div>
                </>
              )}

              {selectedApp.status === "approved" && selectedApp.generated_password && (
                <>
                  <h3 style={s.modalSection}>✅ Generated Credentials</h3>
                  <div style={s.credBox}>
                    <div><strong>Email:</strong> {selectedApp.email}</div>
                    <div><strong>Password:</strong> {selectedApp.generated_password}</div>
                  </div>
                </>
              )}

              {errorMsg && <div style={s.errorBox}>⚠️ {errorMsg}</div>}
            </div>

            {/* Modal Actions */}
            {selectedApp.status === "pending" && (
              <div style={s.modalActions}>
                <button
                  style={s.btnReject}
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                >
                  ❌ Reject
                </button>
                <button
                  style={s.btnApprove}
                  className="bc-btn-glow"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                      Approving...
                    </span>
                  ) : "✅ Approve & Generate Credentials"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ REJECT MODAL ═══════════════ */}
      {showRejectModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxWidth: 500 }} className="bc-anim-scaleIn">
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>❌ Reject Application</h2>
              <button style={s.closeBtn} onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>✕</button>
            </div>

            <div style={s.modalBody}>
              <p style={{ marginBottom: 12, color: "#5a7a6a", fontSize: 14 }}>
                Please provide a reason for rejecting <strong>{selectedApp?.full_name}'s</strong> application.
                The applicant will be notified.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Documents are not clear, PMDC number does not match..."
                style={s.textarea}
                rows={5}
              />

              {errorMsg && <div style={s.errorBox}>⚠️ {errorMsg}</div>}
            </div>

            <div style={s.modalActions}>
              <button style={s.btnOutline} onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>Cancel</button>
              <button
                style={s.btnReject}
                onClick={handleReject}
                disabled={actionLoading || rejectReason.length < 10}
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREDENTIALS DISPLAY MODAL ═══════════════ */}
      {showCredentials && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxWidth: 500 }} className="bc-anim-popIn">
            <div style={s.successWrap}>
              <div className="bc-check-pop" style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={s.modalTitle}>Doctor Approved!</h2>
              <p style={{ color: "#5a7a6a", marginBottom: 24 }}>
                <strong>Dr. {showCredentials.name}</strong> can now login with these credentials:
              </p>

              <div style={s.credCard}>
                <div style={s.credRow}>
                  <span style={s.credLabel}>📧 Email:</span>
                  <code style={s.credValue}>{showCredentials.email}</code>
                </div>
                <div style={s.credRow}>
                  <span style={s.credLabel}>🔑 Password:</span>
                  <code style={s.credValue}>{showCredentials.password}</code>
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: "#9ab5a5", marginTop: 16, lineHeight: 1.6 }}>
                💡 Yeh credentials securely doctor ko bhejein. <br />
                (Backend pretend mode mein hai — production mein actual email jayegi)
              </p>

              <button
                style={{ ...s.btnApprove, width: "100%", marginTop: 20 }}
                className="bc-btn-glow"
                onClick={() => setShowCredentials(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ Helper Components ═══════════════════ */

function ApplicationCard({ app, index, onView }) {
  return (
    <div style={s.appCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(index + 1, 8)}`}>
      <div style={s.appCardTop}>
        <DoctorAvatar
          photoUrl={app.profile_photo_url}
          name={app.full_name}
          size={40}
          fontSize={14}
        />
        <div style={{ flex: 1 }}>
          <div style={s.appName}>{app.full_name}</div>
          <div style={s.appEmail}>{app.email}</div>
        </div>
        <span style={{ ...s.statusBadge, ...STATUS_COLORS[app.status] }}>{app.status_display}</span>
      </div>
      <div style={s.appMeta}>
        <div style={s.appMetaItem}>🎓 {app.specialty_display}</div>
        <div style={s.appMetaItem}>🆔 {app.pmdc_number}</div>
        <div style={s.appMetaItem}>💼 {app.experience_years} yrs</div>
        <div style={s.appMetaItem}>💰 Rs. {app.consultation_fee}</div>
      </div>
      <div style={s.appFooter}>
        <span style={s.appDate}>📅 {new Date(app.submitted_at).toLocaleDateString()}</span>
        <button style={s.viewBtn} className="bc-btn-glow" onClick={onView}>
          {app.status === "pending" ? "Review →" : "View Details"}
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value, fullWidth }) {
  return (
    <div style={{ ...s.detailItem, ...(fullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <div style={s.detailKey}>{label}</div>
      <div style={s.detailValue}>{value || "—"}</div>
    </div>
  );
}

function DocumentPreview({ label, url }) {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div style={s.docCard}>
      <div style={s.docCardHeader}>
        <span style={{ fontSize: 18 }}>📎</span>
        <span style={s.docCardLabel}>{label}</span>
      </div>
      {isImage ? (
        <img src={url} alt={label} style={s.docImage} />
      ) : (
        <div style={s.docPlaceholder}>
          <span style={{ fontSize: 32 }}>📄</span>
          <span style={{ fontSize: 12, color: "#5a7a6a" }}>PDF/Document</span>
        </div>
      )}
      <a href={url} target="_blank" rel="noreferrer" style={s.docOpenBtn}>
        🔗 View Full Size
      </a>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Nunito','Segoe UI',sans-serif",
    background: "linear-gradient(135deg, #f4f9f6 0%, #e8f8ef 100%)",
    position: "relative", overflow: "hidden",
  },

  // SIDEBAR
  sidebar: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px) saturate(140%)", WebkitBackdropFilter: "blur(16px) saturate(140%)", borderRight: "1px solid rgba(224,237,230,0.6)", display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)", overflow: "hidden", minHeight: "100vh", flexShrink: 0, position: "relative", zIndex: 10, boxShadow: "2px 0 18px rgba(42,157,92,0.06)" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid rgba(224,237,230,0.6)" },
  logoIcon: { width: 36, height: 36, background: MINT_LIGHT, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 900, color: "#1a2e24", whiteSpace: "nowrap" },
  roleBadge: { margin: "12px 14px 0", background: "#fff8e6", color: "#7a5a10", borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, border: "1px solid #fde68a" },
  navItems: { flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "all 0.22s ease", position: "relative" },
  navItemActive: { background: MINT_LIGHT, boxShadow: "0 0 0 1px rgba(42,157,92,0.2), 0 4px 14px rgba(42,157,92,0.12)" },
  navIcon: { fontSize: 18, flexShrink: 0 },
  navLabel: { fontSize: 14, fontWeight: 700, color: "#1a2e24", whiteSpace: "nowrap", flex: 1, textAlign: "left" },
  notifBadge: { background: "#dc2626", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10.5, fontWeight: 900, boxShadow: "0 2px 6px rgba(220,38,38,0.4)" },
  logoutBtn: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "none", border: "none", borderTop: "1px solid rgba(224,237,230,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#dc2626", width: "100%" },

  // MAIN
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 2 },
  topBar: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px) saturate(140%)", WebkitBackdropFilter: "blur(14px) saturate(140%)", borderBottom: "1px solid rgba(224,237,230,0.6)", padding: "0 28px", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(42,157,92,0.05)" },
  topLeft: { display: "flex", alignItems: "center", gap: 16 },
  toggleBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#3d5a48", padding: "4px 8px" },
  topTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: 0 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  adminPill: { display: "flex", alignItems: "center", gap: 10, background: MINT_LIGHT, borderRadius: 30, padding: "5px 14px 5px 5px", border: "1px solid rgba(42,157,92,0.18)" },
  adminAvatar: { width: 34, height: 34, background: MINT, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", boxShadow: "0 2px 8px rgba(42,157,92,0.3)" },
  adminName: { fontSize: 13, fontWeight: 800, color: MINT_DARK },
  adminSub: { fontSize: 10.5, color: "#5a7a6a", fontWeight: 600 },

  content: { padding: "24px 28px 60px", flex: 1 },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 14, padding: "20px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 4px 14px rgba(42,157,92,0.07)" },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  statValue: { fontSize: 24, fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px" },
  statLabel: { fontSize: 12.5, color: "#9ab5a5", fontWeight: 700 },

  // Section
  section: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px) saturate(140%)", WebkitBackdropFilter: "blur(14px) saturate(140%)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 16, padding: "22px 24px", marginBottom: 22, boxShadow: "0 4px 18px rgba(42,157,92,0.07)" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 900, color: "#0f2018", margin: 0 },
  countBadge: { background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 800 },

  // Quick Actions
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  actionCard: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.7)", borderRadius: 12, padding: "20px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", flexDirection: "column", gap: 8 },
  actionTitle: { fontSize: 14.5, fontWeight: 900, color: "#0f2018" },
  actionDesc: { fontSize: 12, color: "#5a7a6a", lineHeight: 1.5 },

  // Filter
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  filterPill: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 20, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", transition: "all 0.22s ease" },
  filterActive: { background: MINT_LIGHT, border: `2px solid ${MINT}`, color: MINT_DARK },

  // Application Cards
  appsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  appCard: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.7)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 },
  appCardTop: { display: "flex", alignItems: "center", gap: 12 },
  miniAvatar: { width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 },
  appName: { fontSize: 14.5, fontWeight: 900, color: "#0f2018", marginBottom: 2 },
  appEmail: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600 },
  appMeta: { display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(212,237,223,0.5)" },
  appMetaItem: { fontSize: 12, color: "#3d5a48", fontWeight: 700 },
  appFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(212,237,223,0.5)" },
  appDate: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600 },
  viewBtn: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(42,157,92,0.28)" },

  // Status badge
  statusBadge: { borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 800, display: "inline-block", whiteSpace: "nowrap" },

  // Table
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  thead: { background: "rgba(244,249,246,0.8)" },
  th: { padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 800, color: "#5a7a6a", textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid rgba(240,245,242,0.6)" },
  td: { padding: "12px 14px", fontSize: 13, color: "#3d5a48", verticalAlign: "middle" },
  tdBold: { fontWeight: 800, color: "#0f2018" },

  // Loading & Empty
  loadingBox: { textAlign: "center", padding: "40px 20px", color: "#5a7a6a", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  emptyState: { textAlign: "center", padding: "40px 20px" },

  // Profile
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  profileItem: { background: "rgba(250,255,254,0.6)", border: "1px solid rgba(212,237,223,0.5)", borderRadius: 10, padding: "12px 14px" },
  profileKey: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 700, marginBottom: 4 },
  profileValue: { fontSize: 13.5, color: "#0f2018", fontWeight: 800, wordBreak: "break-word" },

  // ═══ MODAL ═══
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 32, 24, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#fff", borderRadius: 20, maxWidth: 800, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" },
  modalHeader: { padding: "18px 24px", borderBottom: "1px solid #f0f5f2", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a7a6a", padding: "4px 10px", borderRadius: 6 },
  modalBody: { padding: "20px 24px", overflowY: "auto", flex: 1 },
  modalSection: { fontSize: 15, fontWeight: 900, color: "#0f2018", margin: "20px 0 12px", paddingBottom: 8, borderBottom: "2px solid #f0f5f2" },
  modalActions: { padding: "16px 24px", borderTop: "1px solid #f0f5f2", display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" },

  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 },
  detailItem: { background: "#f4f9f6", borderRadius: 9, padding: "10px 12px" },
  detailKey: { fontSize: 11, color: "#9ab5a5", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 13.5, color: "#0f2018", fontWeight: 700, wordBreak: "break-word" },

  docsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 },
  docCard: { background: "#f4f9f6", borderRadius: 11, padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  docCardHeader: { display: "flex", alignItems: "center", gap: 8 },
  docCardLabel: { fontSize: 12.5, fontWeight: 800, color: "#0f2018" },
  docImage: { width: "100%", height: 140, objectFit: "cover", borderRadius: 8, border: "1px solid #e0ede6" },
  docPlaceholder: { width: "100%", height: 140, background: "#fff", border: "1px dashed #d4eddf", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 },
  docOpenBtn: { display: "block", textAlign: "center", background: MINT_LIGHT, color: MINT_DARK, padding: "7px 12px", borderRadius: 7, fontSize: 11.5, fontWeight: 800, textDecoration: "none" },

  rejectionBox: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 600 },
  credBox: { background: "#e8f8ef", color: MINT_DARK, border: `1.5px solid ${MINT}`, borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, fontFamily: "monospace", fontSize: 13.5 },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginTop: 12, border: "1px solid #fca5a5" },

  textarea: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 9, padding: "12px 14px", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "#fafffe", resize: "vertical", boxSizing: "border-box" },

  btnApprove: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.32)" },
  btnReject: { background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },
  btnOutline: { background: "#fff", color: MINT, border: `2px solid ${MINT}`, borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },

  // Credentials success
  successWrap: { textAlign: "center", padding: "32px 28px" },

  credCard: { background: "linear-gradient(135deg, #f0faf4, #e8f8ef)", border: `1.5px solid ${MINT}`, borderRadius: 14, padding: "20px", textAlign: "left", boxShadow: "0 4px 18px rgba(42,157,92,0.15)" },
  credRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed rgba(42,157,92,0.2)" },
  credLabel: { fontSize: 13, fontWeight: 800, color: MINT_DARK },
  credValue: { background: "#fff", padding: "4px 10px", borderRadius: 6, fontFamily: "monospace", fontSize: 13, color: "#0f2018", fontWeight: 700, border: "1px solid #d4eddf" },

  // Action buttons in doctors table
  suspendBtn: { background: "#fff8e6", color: "#7a5a10", border: "1.5px solid #fde68a", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" },
  activateBtn: { background: "#e8f8ef", color: "#1a6e3f", border: "1.5px solid #b2e0cc", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" },
  deleteBtn: { background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" },
};