import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaTachometerAlt, FaCalendarAlt, FaUser,
  FaSignOutAlt, FaBell, FaBars, FaCheckCircle, FaTimes,
  FaPhone, FaUsers, FaClipboardList, FaClock, FaArrowRight,
  FaUserMd, FaEnvelope, FaIdCard, FaHourglassHalf,
  FaCommentDots, FaBaby,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { getDoctorAppointments, updateAppointmentStatus } from "../api/appointments";
import { getMyDoctorProfile } from "../api/doctors";
import DoctorAvatar from "../components/DoctorAvatar";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  pending:   { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  completed: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

const NAV_ITEMS = [
  { Icon: FaTachometerAlt, label: "Dashboard",    id: "dashboard" },
  { Icon: FaCalendarAlt,   label: "Appointments", id: "appointments" },
  { Icon: FaUser,          label: "My Profile",   id: "profile" },
];

const hoverStyles = `
  .dd-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .dd-btn-primary:hover {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .dd-accept { transition: all 0.25s ease; }
  .dd-accept:hover {
    background: #166534 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(22,101,52,0.3);
  }

  .dd-reject { transition: all 0.2s ease; }
  .dd-reject:hover {
    background: #dc2626 !important;
    color: #fff !important;
    transform: translateY(-2px);
  }

  .dd-complete { transition: all 0.25s ease; }
  .dd-complete:hover {
    background: #1e40af !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(30,64,175,0.3);
  }

  .dd-call { transition: all 0.2s ease; }
  .dd-call:hover {
    background: #2a9d5c !important;
    color: #fff !important;
    transform: translateY(-2px);
  }

  .dd-nav { transition: all 0.2s ease; }
  .dd-nav:hover:not(.active) {
    background: rgba(255,255,255,0.08) !important;
    color: #fff !important;
  }

  .dd-logout { transition: all 0.2s ease; }
  .dd-logout:hover {
    background: rgba(220,38,38,0.15) !important;
    color: #fca5a5 !important;
  }

  .dd-toggle { transition: all 0.2s ease; }
  .dd-toggle:hover {
    background: #f4f9f6 !important;
    transform: scale(1.05);
  }

  .dd-stat { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .dd-stat:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 24px rgba(42,157,92,0.12);
  }

  .dd-appt-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .dd-appt-card:hover {
    border-color: #2a9d5c !important;
    box-shadow: 0 8px 20px rgba(42,157,92,0.08);
  }

  .dd-filter { transition: all 0.2s ease; }
  .dd-filter:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
  }

  .dd-view-all { transition: all 0.2s ease; }
  .dd-view-all:hover {
    color: #1a6e3f !important;
    transform: translateX(2px);
  }

  .dd-bell { transition: all 0.25s ease; }
  .dd-bell:hover {
    background: #fff8e6 !important;
    border-color: #fde68a !important;
    transform: translateY(-2px);
  }

  @keyframes pulse-bell {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .dd-bell-pulse { animation: pulse-bell 2s ease-in-out infinite; }

  /* ═══════════════ MOBILE RESPONSIVE (max-width: 768px) ═══════════════ */
  @media (max-width: 768px) {
    /* Sidebar becomes fixed drawer */
    .dd-sidebar {
      position: fixed !important;
      top: 0; left: 0;
      height: 100vh !important;
      width: 260px !important;
      z-index: 1100;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 4px 0 24px rgba(0,0,0,0.2);
    }
    .dd-sidebar.dd-open { transform: translateX(0); }

    /* Backdrop overlay */
    .dd-backdrop {
      display: block !important;
      position: fixed; inset: 0;
      background: rgba(15,32,24,0.5);
      backdrop-filter: blur(4px);
      z-index: 1099;
      animation: dd-fade-in 0.25s ease;
    }
    @keyframes dd-fade-in { from { opacity: 0; } to { opacity: 1; } }

    /* Main fills full width */
    .dd-main { width: 100% !important; }

    /* Top bar adjustments */
    .dd-top-bar { padding: 12px 16px !important; }
    .dd-top-title { font-size: 16px !important; }
    .dd-doctor-pill-info { display: none !important; }
    .dd-doctor-pill { padding: 4px !important; gap: 0 !important; }
    .dd-verified-tick { display: none !important; }

    /* Content padding */
    .dd-content { padding: 18px 16px 60px !important; }

    /* Welcome banner */
    .dd-welcome-banner { padding: 18px 18px !important; flex-direction: column; align-items: flex-start !important; }
    .dd-welcome-title { font-size: 17px !important; }
    .dd-welcome-sub { font-size: 13px !important; }
    .dd-welcome-banner button { width: 100%; justify-content: center; }

    /* Stats grid */
    .dd-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .dd-stat-card { padding: 14px 12px !important; }
    .dd-stat-value { font-size: 18px !important; }
    .dd-stat-label { font-size: 10.5px !important; }
    .dd-stat-icon-box { width: 38px !important; height: 38px !important; }

    /* Section title */
    .dd-section-title { font-size: 14.5px !important; }

    /* Today's schedule items */
    .dd-schedule-item { grid-template-columns: 1fr !important; gap: 10px !important; padding: 14px !important; }
    .dd-schedule-actions { width: 100%; align-items: flex-start !important; }

    /* Appointment cards */
    .dd-appt-card { padding: 14px 16px !important; }
    .dd-appt-body { grid-template-columns: 1fr !important; }
    .dd-appt-actions { width: 100%; flex-direction: column; }
    .dd-appt-actions button, .dd-appt-actions a { width: 100%; justify-content: center; }
    .dd-appt-top { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }

    /* Filter pills scroll horizontally */
    .dd-filter-row { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
    .dd-filter-row::-webkit-scrollbar { display: none; }
    .dd-filter-row button { flex-shrink: 0; }

    /* Profile */
    .dd-profile-header { padding: 20px 18px !important; gap: 14px !important; }
    .dd-profile-name { font-size: 18px !important; }
    .dd-profile-meta { gap: 10px !important; }
    .dd-details-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 480px) {
    .dd-stats-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Closed by default on mobile, open on desktop
    if (typeof window !== "undefined") return window.innerWidth > 768;
    return true;
  });
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Appointments load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorProfile = async () => {
    try {
      const data = await getMyDoctorProfile();
      setDoctorProfile(data);
    } catch (err) {
      console.error("Profile load error:", err);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadDoctorProfile();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const filteredAppointments = statusFilter === "all"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const todayAppts = appointments.filter((a) => {
    const today = new Date().toISOString().split("T")[0];
    return a.appointment_date === today;
  }).length;

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const totalPatients = new Set(appointments.map((a) => a.patient)).size;

  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  const getDoctorName = () => {
    if (!user) return "Doctor";
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return name || user.email.split("@")[0];
  };

  if (!user) return null;

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      {/* Mobile backdrop — only renders on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="dd-backdrop"
          style={{ display: "none" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside
        style={{ ...s.sidebar, width: sidebarOpen ? 240 : 72 }}
        className={`dd-sidebar ${sidebarOpen ? "dd-open" : ""}`}
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
            <HiOutlineShieldCheck size={11} color="#5fcf8f" />
            <span>Doctor Portal</span>
          </div>
        )}

        <nav style={s.navItems}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
                className={`dd-nav ${active ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.id);
                  // Auto-close sidebar on mobile
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <item.Icon size={15} />
                {sidebarOpen && <span style={s.navLabel}>{item.label}</span>}
                {sidebarOpen && item.id === "appointments" && pendingCount > 0 && (
                  <span style={s.notifBadge}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <button style={s.logoutBtn} className="dd-logout" onClick={handleLogout}>
          <FaSignOutAlt size={14} />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <main style={s.main} className="dd-main">

        {/* TOP BAR */}
        <div style={s.topBar} className="dd-top-bar">
          <div style={s.topLeft}>
            <button
              style={s.toggleBtn}
              className="dd-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <FaBars size={14} color={TEXT_DARK} />
            </button>
            <h1 style={s.topTitle} className="dd-top-title">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div style={s.topRight}>
            {pendingCount > 0 && (
              <button
                style={s.bellBtn}
                className="dd-bell dd-bell-pulse"
                onClick={() => setActiveNav("appointments")}
              >
                <FaBell size={13} color="#92400e" />
                <span style={s.bellCount}>{pendingCount}</span>
              </button>
            )}

            <div style={s.doctorPill} className="dd-doctor-pill">
              <DoctorAvatar
                photoUrl={doctorProfile?.profile_photo_url}
                name={getDoctorName()}
                size={36}
              />
              <div style={s.doctorPillInfo} className="dd-doctor-pill-info">
                <span style={s.doctorName}>Dr. {getDoctorName()}</span>
                <span style={s.doctorSpec}>
                  {user.is_verified ? "Verified Doctor" : "Pending Verification"}
                </span>
              </div>
              {user.is_verified && (
                <div style={s.verifiedTick} className="dd-verified-tick">
                  <HiOutlineShieldCheck size={11} color="#fff" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={s.content} className="dd-content">

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {activeNav === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <div style={s.welcomeBanner} className="dd-welcome-banner">
                <div>
                  <h2 style={s.welcomeTitle} className="dd-welcome-title">
                    Welcome back, Dr. {user.first_name || "Doctor"}
                  </h2>
                  <p style={s.welcomeSub} className="dd-welcome-sub">
                    {loading ? "Loading your dashboard..." : (
                      <>
                        Aap ke pas <strong style={{ color: MINT_DARK }}>{todayAppts} appointments</strong> aaj
                        hain, aur <strong style={{ color: "#7a5a10" }}>{pendingCount} pending</strong> hain.
                      </>
                    )}
                  </p>
                </div>
                <button
                  style={s.btnPrimary}
                  className="dd-btn-primary"
                  onClick={() => setActiveNav("appointments")}
                >
                  View All Appointments
                  <FaArrowRight size={11} />
                </button>
              </div>

              {/* Stats Grid */}
              <div style={s.statsGrid} className="dd-stats-grid">
                {[
                  { Icon: FaCalendarAlt,    label: "Today's Appointments", value: todayAppts },
                  { Icon: FaUsers,          label: "Total Patients",       value: totalPatients },
                  { Icon: FaCheckCircle,    label: "Completed",            value: completedCount },
                  { Icon: FaClipboardList,  label: "Total Bookings",       value: appointments.length },
                ].map((stat) => (
                  <div key={stat.label} style={s.statCard} className="dd-stat dd-stat-card">
                    <div style={s.statIconBox} className="dd-stat-icon-box">
                      <stat.Icon size={18} color={MINT_DARK} />
                    </div>
                    <div>
                      <div style={s.statValue} className="dd-stat-value">{stat.value}</div>
                      <div style={s.statLabel} className="dd-stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Today's Schedule */}
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle} className="dd-section-title">
                    <FaClock size={13} color={MINT_DARK} />
                    Today's Schedule
                  </h2>
                  <button
                    style={s.viewAllBtn}
                    className="dd-view-all"
                    onClick={() => setActiveNav("appointments")}
                  >
                    View All
                    <FaArrowRight size={9} />
                  </button>
                </div>

                {loading ? (
                  <LoadingBox />
                ) : (() => {
                  const today = new Date().toISOString().split("T")[0];
                  const todayList = appointments.filter((a) => a.appointment_date === today);

                  if (todayList.length === 0) {
                    return (
                      <EmptyState
                        Icon={FaCalendarAlt}
                        title="No appointments today"
                        desc="No appointments scheduled for today. Your day is clear."
                      />
                    );
                  }

                  return (
                    <div style={s.scheduleList}>
                      {todayList.map((a) => (
                        <div key={a.id} style={s.scheduleItem} className="dd-appt-card dd-schedule-item">
                          <div style={s.scheduleTime}>
                            <div style={s.timeIconBox}>
                              <FaClock size={14} color={MINT_DARK} />
                            </div>
                            <div>
                              <div style={s.timeLabel}>{a.time_slot}</div>
                              <div style={s.timeSub}>#{a.id}</div>
                            </div>
                          </div>

                          <div style={s.schedulePatient}>
                            <div style={s.patientName}>{a.patient_name}</div>
                            <div style={s.patientBaby}>
                              <FaBaby size={9} color={TEXT_MUTED} />
                              {a.baby_name} ({a.baby_age})
                            </div>
                            <div style={s.patientSymptom}>
                              <FaStethoscope size={9} color={TEXT_MUTED} />
                              {a.symptom}
                            </div>
                          </div>

                          <div style={s.scheduleActions} className="dd-schedule-actions">
                            <span style={{
                              ...s.statusBadge,
                              ...STATUS_COLORS[a.status],
                              border: `1px solid ${STATUS_COLORS[a.status]?.border}`,
                            }}>
                              {a.status_display}
                            </span>
                            {a.status === "pending" && (
                              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <button
                                  style={s.acceptBtn}
                                  className="dd-accept"
                                  onClick={() => handleUpdateStatus(a.id, "confirmed")}
                                >
                                  <FaCheckCircle size={10} />
                                  Accept
                                </button>
                                <button
                                  style={s.rejectBtn}
                                  className="dd-reject"
                                  onClick={() => handleUpdateStatus(a.id, "cancelled")}
                                >
                                  <FaTimes size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* ═══════════════ APPOINTMENTS ═══════════════ */}
          {activeNav === "appointments" && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle} className="dd-section-title">
                  <FaClipboardList size={13} color={MINT_DARK} />
                  All Appointments
                </h2>
                <span style={s.countBadge}>
                  {filteredAppointments.length} of {appointments.length}
                </span>
              </div>

              {/* Filter */}
              <div style={s.filterRow} className="dd-filter-row">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`dd-filter ${statusFilter === f ? "active" : ""}`}
                    style={{ ...s.filterPill, ...(statusFilter === f ? s.filterActive : {}) }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== "all" && (
                      <span style={{ ...s.filterCount, ...(statusFilter === f ? s.filterCountActive : {}) }}>
                        {appointments.filter((a) => a.status === f).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {loading ? (
                <LoadingBox />
              ) : filteredAppointments.length === 0 ? (
                <EmptyState
                  Icon={FaCalendarAlt}
                  title={statusFilter === "all" ? "No appointments yet" : `No ${statusFilter} appointments`}
                  desc="Try selecting a different filter to see other appointments."
                />
              ) : (
                <div style={s.apptList}>
                  {filteredAppointments.map((a) => (
                    <div key={a.id} style={s.apptCard} className="dd-appt-card">
                      <div style={s.apptTop} className="dd-appt-top">
                        <div style={s.apptIdBadge}>#{a.id}</div>
                        <span style={{
                          ...s.statusBadge,
                          ...STATUS_COLORS[a.status],
                          border: `1px solid ${STATUS_COLORS[a.status]?.border}`,
                        }}>
                          {a.status_display}
                        </span>
                      </div>

                      <div style={s.apptDivider} />

                      <div style={s.apptBody} className="dd-appt-body">
                        <ApptRow Icon={FaUser} label="Patient" value={a.patient_name} />
                        <ApptRow Icon={FaBaby} label="Baby" value={`${a.baby_name} (${a.baby_age})`} />
                        <ApptRow Icon={FaCalendarAlt} label="Date" value={a.appointment_date} />
                        <ApptRow Icon={FaClock} label="Time" value={a.time_slot} />
                        <ApptRow Icon={FaStethoscope} label="Symptom" value={a.symptom} />
                        <ApptRow
                          Icon={FaPhone}
                          label="Contact"
                          value={
                            <a href={`tel:${a.contact_phone}`} style={s.phoneLink}>
                              {a.contact_phone}
                            </a>
                          }
                        />
                        {a.notes && (
                          <ApptRow Icon={FaCommentDots} label="Notes" value={a.notes} />
                        )}
                      </div>

                      <div style={s.apptActions} className="dd-appt-actions">
                        {a.status === "pending" && (
                          <>
                            <button
                              style={s.acceptBtn}
                              className="dd-accept"
                              onClick={() => handleUpdateStatus(a.id, "confirmed")}
                            >
                              <FaCheckCircle size={11} />
                              Accept
                            </button>
                            <button
                              style={s.rejectBtn}
                              className="dd-reject"
                              onClick={() => handleUpdateStatus(a.id, "cancelled")}
                            >
                              <FaTimes size={11} />
                              Reject
                            </button>
                          </>
                        )}
                        {a.status === "confirmed" && (
                          <>
                            <button
                              style={s.completeBtn}
                              className="dd-complete"
                              onClick={() => handleUpdateStatus(a.id, "completed")}
                            >
                              <FaCheckCircle size={11} />
                              Mark Complete
                            </button>
                            <a href={`tel:${a.contact_phone}`} style={s.callBtn} className="dd-call">
                              <FaPhone size={10} />
                              Call Patient
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ PROFILE ═══════════════ */}
          {activeNav === "profile" && (
            <div style={s.profileWrap}>
              {/* Profile Header */}
              <div style={s.profileHeader} className="dd-profile-header">
                <DoctorAvatar
                  photoUrl={doctorProfile?.profile_photo_url}
                  name={getDoctorName()}
                  size={96}
                  fontSize={32}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h2 style={s.profileName} className="dd-profile-name">Dr. {getDoctorName()}</h2>
                    {user.is_verified && (
                      <span style={s.verifiedBadge}>
                        <HiOutlineShieldCheck size={11} />
                        Verified Doctor
                      </span>
                    )}
                  </div>
                  <p style={s.profileSpec}>{user.role_display || "Doctor"}</p>
                  <div style={s.profileMeta} className="dd-profile-meta">
                    <span style={s.profileMetaItem}>
                      <FaClipboardList size={10} color={MINT_DARK} />
                      {appointments.length} appointments
                    </span>
                    <span style={s.profileMetaItem}>
                      <FaCheckCircle size={10} color={MINT_DARK} />
                      {completedCount} completed
                    </span>
                    <span style={s.profileMetaItem}>
                      <FaHourglassHalf size={10} color="#7a5a10" />
                      {pendingCount} pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div style={s.section}>
                <h3 style={s.profileSectionTitle}>
                  <FaUser size={11} color={MINT_DARK} />
                  Account Information
                </h3>
                <div style={s.detailsGrid} className="dd-details-grid">
                  <DetailItem Icon={FaEnvelope} label="Email" value={user.email} />
                  <DetailItem Icon={FaPhone} label="Phone" value={user.phone || "Not set"} />
                  <DetailItem Icon={FaUser} label="First Name" value={user.first_name || "Not set"} />
                  <DetailItem Icon={FaUser} label="Last Name" value={user.last_name || "Not set"} />
                  <DetailItem Icon={FaIdCard} label="Role" value={user.role_display || "Doctor"} />
                  <DetailItem
                    Icon={HiOutlineShieldCheck}
                    label="Status"
                    value={user.is_verified ? "Verified" : "Pending"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ApptRow({ Icon, label, value }) {
  return (
    <div style={s.apptRow}>
      <div style={s.apptKeyIcon}>
        <Icon size={11} color={MINT_DARK} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={s.apptKey}>{label}</span>
        <div style={s.apptVal}>{value}</div>
      </div>
    </div>
  );
}

function DetailItem({ Icon, label, value }) {
  return (
    <div style={s.detailItem}>
      <div style={s.detailKeyRow}>
        <Icon size={10} color={MINT_DARK} />
        <span style={s.detailKey}>{label}</span>
      </div>
      <div style={s.detailVal}>{value}</div>
    </div>
  );
}

function LoadingBox() {
  return (
    <div style={s.loadingBox}>
      <FaHourglassHalf size={28} color={MINT_DARK} />
      <p>Loading...</p>
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
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.4px",
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(42,157,92,0.15)",
    border: "1px solid rgba(42,157,92,0.25)",
    color: "#5fcf8f",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 11.5,
    fontWeight: 700,
    margin: "0 8px 20px",
    width: "fit-content",
  },
  navItems: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
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
    position: "relative",
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
    fontSize: 19,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.4px",
  },
  topRight: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  bellBtn: {
    background: "#fff8e6",
    border: "1.5px solid #fde68a",
    borderRadius: 9,
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
  },
  bellCount: {
    background: "#dc2626",
    color: "#fff",
    borderRadius: 10,
    padding: "1px 7px",
    fontSize: 10.5,
    fontWeight: 800,
  },
  doctorPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: MINT_LIGHT,
    border: `1px solid ${BORDER}`,
    borderRadius: 30,
    padding: "5px 14px 5px 5px",
  },
  doctorPillInfo: { display: "flex", flexDirection: "column" },
  doctorName: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_DARK,
    lineHeight: 1.2,
  },
  doctorSpec: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    fontWeight: 700,
    lineHeight: 1.2,
    marginTop: 2,
  },
  verifiedTick: {
    width: 20, height: 20,
    background: MINT_DARK,
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // CONTENT
  content: { padding: "24px 28px 48px" },

  // WELCOME
  welcomeBanner: {
    background: `linear-gradient(135deg, ${MINT_LIGHT} 0%, #fff 100%)`,
    border: `1px solid ${BORDER}`,
    borderLeft: `4px solid ${MINT_DARK}`,
    borderRadius: 14,
    padding: "22px 26px",
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 6px",
    letterSpacing: "-0.4px",
  },
  welcomeSub: { fontSize: 14, color: TEXT_BODY, margin: 0, lineHeight: 1.5 },

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
    width: 46,
    height: 46,
    borderRadius: 11,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 22,
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
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.3px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: MINT_DARK,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  countBadge: {
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "5px 11px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 800,
  },

  // SCHEDULE
  scheduleList: { display: "flex", flexDirection: "column", gap: 10 },
  scheduleItem: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "16px 18px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 16,
    alignItems: "center",
  },
  scheduleTime: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  timeIconBox: {
    width: 44, height: 44,
    background: MINT_LIGHT, borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.2px",
  },
  timeSub: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 2,
  },
  schedulePatient: {},
  patientName: {
    fontSize: 14.5,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  patientBaby: {
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  patientSymptom: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  scheduleActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },

  // STATUS
  statusBadge: {
    borderRadius: 5,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
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
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  filterActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },
  filterCount: {
    background: "#f4f9f6",
    color: TEXT_BODY,
    borderRadius: 5,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 800,
  },
  filterCountActive: {
    background: MINT_DARK,
    color: "#fff",
  },

  // APPOINTMENTS
  apptList: { display: "flex", flexDirection: "column", gap: 12 },
  apptCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  apptTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  apptIdBadge: {
    background: "#fafffe",
    color: TEXT_MUTED,
    border: `1px solid ${BORDER}`,
    borderRadius: 5,
    padding: "3px 9px",
    fontSize: 11.5,
    fontWeight: 800,
  },
  apptDivider: { height: 1, background: BORDER },
  apptBody: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  apptRow: { display: "flex", alignItems: "center", gap: 10 },
  apptKeyIcon: {
    width: 28, height: 28,
    background: MINT_LIGHT, borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  apptKey: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  apptVal: {
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: 700,
    marginTop: 1,
  },
  apptActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  phoneLink: {
    color: MINT_DARK,
    textDecoration: "none",
    fontWeight: 800,
  },

  // BUTTONS
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },
  acceptBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    boxShadow: "0 3px 8px rgba(22,163,74,0.25)",
  },
  rejectBtn: {
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
    gap: 5,
  },
  completeBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    boxShadow: "0 3px 8px rgba(37,99,235,0.25)",
  },
  callBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
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

  // PROFILE
  profileWrap: {},
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
  profileName: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.4px",
  },
  verifiedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#dbeafe",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 800,
  },
  profileSpec: {
    fontSize: 13.5,
    color: MINT_DARK,
    fontWeight: 700,
    margin: "0 0 12px",
  },
  profileMeta: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  profileMetaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: 700,
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
  detailItem: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 14px",
  },
  detailKeyRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 5 },
  detailKey: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailVal: {
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: 700,
    wordBreak: "break-word",
  },
};