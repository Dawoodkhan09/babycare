import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaUserMd, FaPills, FaBook, FaStethoscope,
  FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaListAlt,
  FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaClock,
  FaArrowRight, FaPlus, FaTimes, FaInfoCircle, FaAward,
  FaBaby, FaMoneyBillWave, FaCommentDots,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { getMyAppointments, updateAppointmentStatus } from "../api/appointments";
import DoctorAvatar from "../components/DoctorAvatar";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const QUICK_ACTIONS = [
  {
    Icon: FaSearch,
    title: "Symptom Checker",
    desc: "Identify your baby's symptoms with our smart checker",
    path: "/Symptomchecker",
    color: "#2a9d5c",
  },
  {
    Icon: FaUserMd,
    title: "Book a Doctor",
    desc: "Schedule an appointment with verified PMDC doctors",
    path: "/DoctorBooking",
    color: "#0891b2",
  },
  {
    Icon: FaPills,
    title: "Order Medicine",
    desc: "Order homeopathic medicines online — delivered to your door",
    path: "/shop",
    color: "#7c3aed",
  },
  {
    Icon: FaBook,
    title: "Health Resources",
    desc: "Useful articles and expert tips on baby healthcare",
    path: "/about",
    color: "#b45309",
  },
];

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  pending:   { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  completed: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

const hoverStyles = `
  .ud-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .ud-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .ud-btn-outline { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .ud-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .ud-btn-danger { transition: all 0.2s ease; }
  .ud-btn-danger:hover:not(:disabled) {
    background: #dc2626 !important;
    color: #fff !important;
    transform: translateY(-2px);
  }

  .ud-logout { transition: all 0.2s ease; }
  .ud-logout:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
    border-color: #fecaca !important;
  }

  .ud-stat { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .ud-stat:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 24px rgba(42,157,92,0.12);
  }
  .ud-stat:hover .ud-stat-icon {
    background: #2a9d5c !important;
    transform: scale(1.1);
  }
  .ud-stat:hover .ud-stat-icon svg {
    color: #fff !important;
  }
  .ud-stat-icon, .ud-stat-icon svg {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ud-action { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
  .ud-action:hover {
    transform: translateY(-6px);
    border-color: #2a9d5c !important;
    box-shadow: 0 16px 32px rgba(42,157,92,0.15);
  }
  .ud-action:hover .ud-action-icon {
    transform: scale(1.1) rotate(-5deg);
  }
  .ud-action-icon { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

  .ud-appt-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .ud-appt-card:hover {
    border-color: #2a9d5c !important;
    box-shadow: 0 8px 20px rgba(42,157,92,0.08);
  }

  .ud-tab { transition: all 0.2s ease; }
  .ud-tab:hover:not(.active) {
    color: #2a9d5c;
  }

  .ud-view-all { transition: all 0.2s ease; }
  .ud-view-all:hover {
    color: #1a6e3f !important;
    transform: translateX(2px);
  }

  /* ═══════════════ MOBILE RESPONSIVE (max-width: 768px) ═══════════════ */
  @media (max-width: 768px) {
    .ud-container { padding: 16px !important; padding-bottom: 80px !important; }

    /* Welcome header — stack on mobile */
    .ud-welcome { padding: 18px 18px !important; gap: 14px !important; }
    .ud-welcome-left { width: 100% !important; }
    .ud-big-avatar { width: 48px !important; height: 48px !important; font-size: 18px !important; }
    .ud-welcome-title { font-size: 18px !important; }
    .ud-welcome-sub { font-size: 12.5px !important; }
    .ud-welcome-right { width: 100%; justify-content: space-between; }
    .ud-logout span { display: none; }
    .ud-logout { padding: 8px 10px !important; }

    /* Tabs — horizontal scroll on mobile */
    .ud-tab-row { overflow-x: auto; flex-wrap: nowrap !important; padding: 4px !important; }
    .ud-tab-row::-webkit-scrollbar { display: none; }
    .ud-tab-btn { flex: 0 0 auto !important; min-width: auto !important; font-size: 12.5px !important; padding: 9px 14px !important; white-space: nowrap; }

    /* Stats grid — 2 columns on mobile */
    .ud-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .ud-stat { padding: 14px 12px !important; }
    .ud-stat-value { font-size: 18px !important; }
    .ud-stat-label { font-size: 10.5px !important; }
    .ud-stat-icon-box { width: 38px !important; height: 38px !important; }

    /* Actions grid — single column */
    .ud-actions-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .ud-action-card { padding: 16px 18px !important; }

    /* Section title smaller */
    .ud-section-title { font-size: 15px !important; }

    /* Appointment cards */
    .ud-appt-card { padding: 14px 16px !important; }
    .ud-appt-top { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
    .ud-appt-body { grid-template-columns: 1fr !important; }
    .ud-appt-actions { width: 100%; flex-direction: column; }
    .ud-appt-actions button, .ud-appt-actions a { width: 100%; justify-content: center; }

    /* Profile */
    .ud-profile-card { padding: 20px 18px !important; }
    .ud-profile-top { gap: 14px !important; }
    .ud-profile-big-avatar { width: 60px !important; height: 60px !important; font-size: 22px !important; }
    .ud-profile-name { font-size: 18px !important; }
    .ud-profile-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 480px) {
    .ud-stats-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Appointments load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelLoadingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      await loadAppointments();
    } catch (err) {
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "User";
    const first = user.first_name || "";
    const last = user.last_name || "";
    return `${first} ${last}`.trim() || user.email.split("@")[0];
  };

  // Stats
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const pendingAppointments = appointments.filter((a) => a.status === "pending").length;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  if (!user) return null;

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container} className="ud-container">

        {/* ═══════════════ WELCOME HEADER ═══════════════ */}
        <div style={s.welcomeHeader} className="ud-welcome">
          <div style={s.welcomeLeft} className="ud-welcome-left">
            <div style={s.bigAvatar} className="ud-big-avatar">{getInitials()}</div>
            <div>
              <h1 style={s.welcomeTitle} className="ud-welcome-title">Welcome back, {user.first_name || "User"}</h1>
              <p style={s.welcomeSub} className="ud-welcome-sub">
                Manage your appointments, track health, and access medical care
              </p>
            </div>
          </div>

          <div style={s.welcomeRight} className="ud-welcome-right">
            <div style={s.memberBadge}>
              <HiOutlineShieldCheck size={11} color={MINT_DARK} />
              <span>Member since {memberSince}</span>
            </div>
            <button style={s.btnLogout} className="ud-logout" onClick={handleLogout}>
              <FaSignOutAlt size={11} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <div style={s.tabRow} className="ud-tab-row">
          {[
            { id: "overview",     Icon: FaListAlt,        label: "Overview",       count: null },
            { id: "appointments", Icon: FaCalendarAlt,    label: "Appointments",   count: totalAppointments },
            { id: "profile",      Icon: FaUser,           label: "Profile",        count: null },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`ud-tab ud-tab-btn ${active ? "active" : ""}`}
                style={{ ...s.tabBtn, ...(active ? s.tabActive : {}) }}
              >
                <tab.Icon size={12} />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span style={{ ...s.tabCount, ...(active ? s.tabCountActive : {}) }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div style={s.statsGrid} className="ud-stats-grid">
              {[
                { Icon: FaCalendarAlt,  label: "Total Appointments", value: totalAppointments },
                { Icon: FaHourglassHalf, label: "Upcoming",           value: upcomingAppointments },
                { Icon: FaCheckCircle,  label: "Completed",          value: completedAppointments },
                { Icon: FaAward,        label: "Member Since",       value: memberSince },
              ].map((stat) => (
                <div key={stat.label} style={s.statCard} className="ud-stat">
                  <div style={s.statIconBox} className="ud-stat-icon-box ud-stat-icon">
                    <stat.Icon size={18} color={MINT_DARK} />
                  </div>
                  <div>
                    <div style={s.statValue} className="ud-stat-value">{stat.value}</div>
                    <div style={s.statLabel} className="ud-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={s.section}>
              <h2 style={s.sectionTitle} className="ud-section-title">Quick Actions</h2>
              <div style={s.actionsGrid} className="ud-actions-grid">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    style={s.actionCard}
                    className="ud-action ud-action-card"
                  >
                    <div
                      style={{ ...s.actionIcon, background: `${action.color}15` }}
                      className="ud-action-icon"
                    >
                      <action.Icon size={20} color={action.color} />
                    </div>
                    <div style={s.actionTitle}>{action.title}</div>
                    <div style={s.actionDesc}>{action.desc}</div>
                    <div style={s.actionArrow}>
                      <FaArrowRight size={10} color={MINT_DARK} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle} className="ud-section-title">Recent Appointments</h2>
                {totalAppointments > 3 && (
                  <button
                    style={s.viewAllBtn}
                    className="ud-view-all"
                    onClick={() => setActiveTab("appointments")}
                  >
                    View All
                    <FaArrowRight size={9} />
                  </button>
                )}
              </div>

              {loading ? (
                <div style={s.loadingBox}>
                  <FaHourglassHalf size={28} color={MINT_DARK} />
                  <p>Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div style={s.list}>
                  {appointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} style={s.listItem} className="ud-appt-card">
                      <DoctorAvatar
                        photoUrl={appt.doctor_photo_url}
                        name={appt.doctor_name}
                        size={44}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.listTitle}>Dr. {appt.doctor_name}</div>
                        <div style={s.listSub}>{appt.doctor_specialty}</div>
                        <div style={s.listMeta}>
                          <FaCalendarAlt size={10} color={TEXT_MUTED} />
                          {appt.appointment_date}
                          <span style={{ color: BORDER }}>·</span>
                          <FaClock size={10} color={TEXT_MUTED} />
                          {appt.time_slot}
                        </div>
                      </div>
                      <span style={{
                        ...s.statusBadge,
                        ...STATUS_COLORS[appt.status],
                        border: `1px solid ${STATUS_COLORS[appt.status]?.border}`,
                      }}>
                        {appt.status_display}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  Icon={FaCalendarAlt}
                  title="No appointments yet"
                  desc="Book your first appointment with a verified pediatric doctor."
                  actionText="Book an Appointment"
                  onAction={() => navigate("/DoctorBooking")}
                />
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ APPOINTMENTS TAB ═══════════════ */}
        {activeTab === "appointments" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle} className="ud-section-title">All My Appointments</h2>
              <button style={s.btnPrimary} className="ud-btn-primary" onClick={() => navigate("/DoctorBooking")}>
                <FaPlus size={11} />
                Book New
              </button>
            </div>

            {loading ? (
              <div style={s.loadingBox}>
                <FaHourglassHalf size={28} color={MINT_DARK} />
                <p>Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div style={s.apptList}>
                {appointments.map((appt) => (
                  <div key={appt.id} style={s.apptCard} className="ud-appt-card">
                    <div style={s.apptTop} className="ud-appt-top">
                      <div style={s.apptHeaderLeft}>
                        <DoctorAvatar
                          photoUrl={appt.doctor_photo_url}
                          name={appt.doctor_name}
                          size={44}
                        />
                        <div>
                          <div style={s.apptDoctorName}>Dr. {appt.doctor_name}</div>
                          <div style={s.apptDoctorSpec}>{appt.doctor_specialty}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={s.apptIdBadge}>#{appt.id}</span>
                        <span style={{
                          ...s.statusBadge,
                          ...STATUS_COLORS[appt.status],
                          border: `1px solid ${STATUS_COLORS[appt.status]?.border}`,
                        }}>
                          {appt.status_display}
                        </span>
                      </div>
                    </div>

                    <div style={s.apptDivider} />

                    <div style={s.apptBody} className="ud-appt-body">
                      <ApptRow Icon={FaCalendarAlt} label="Date" value={appt.appointment_date} />
                      <ApptRow Icon={FaClock} label="Time" value={appt.time_slot} />
                      <ApptRow Icon={FaBaby} label="Baby" value={`${appt.baby_name} (${appt.baby_age})`} />
                      <ApptRow Icon={FaStethoscope} label="Symptom" value={appt.symptom} />
                      <ApptRow Icon={FaMoneyBillWave} label="Fee" value={`Rs. ${appt.doctor_fee}`} />
                      {appt.notes && (
                        <ApptRow Icon={FaCommentDots} label="Notes" value={appt.notes} />
                      )}
                    </div>

                    <div style={s.apptActions} className="ud-appt-actions">
                      {(appt.status === "pending" || appt.status === "confirmed") && (
                        <button
                          style={s.btnDanger}
                          className="ud-btn-danger"
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelLoadingId === appt.id}
                        >
                          <FaTimes size={10} />
                          {cancelLoadingId === appt.id ? "Cancelling..." : "Cancel Appointment"}
                        </button>
                      )}
                      {appt.status === "completed" && (
                        <div style={s.completedNote}>
                          <FaCheckCircle size={12} color="#1e40af" />
                          Appointment completed
                        </div>
                      )}
                      {appt.status === "cancelled" && (
                        <div style={s.cancelledNote}>
                          <FaTimes size={11} color="#991b1b" />
                          Appointment cancelled
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                Icon={FaCalendarAlt}
                title="No appointments yet"
                desc="You haven't booked any appointments. Start by browsing our verified doctors."
                actionText="Book First Appointment"
                onAction={() => navigate("/DoctorBooking")}
              />
            )}
          </div>
        )}

        {/* ═══════════════ PROFILE TAB ═══════════════ */}
        {activeTab === "profile" && (
          <div style={s.profileCard} className="ud-profile-card">
            <div style={s.profileTop} className="ud-profile-top">
              <div style={s.profileBigAvatar} className="ud-profile-big-avatar">{getInitials()}</div>
              <div style={{ flex: 1 }}>
                <h2 style={s.profileName} className="ud-profile-name">{getFullName()}</h2>
                <div style={s.profileBadges}>
                  <span style={s.roleBadge}>
                    <FaUser size={10} />
                    {user.role_display || "Parent"}
                  </span>
                  {user.is_verified && (
                    <span style={s.verifiedBadge}>
                      <HiOutlineShieldCheck size={11} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={s.profileDivider} />

            <h3 style={s.profileSection}>Personal Information</h3>
            <div style={s.profileGrid} className="ud-profile-grid">
              <ProfileItem Icon={FaEnvelope} label="Email" value={user.email} />
              <ProfileItem Icon={FaPhone} label="Phone" value={user.phone || "Not provided"} />
              <ProfileItem Icon={FaUser} label="First Name" value={user.first_name || "Not set"} />
              <ProfileItem Icon={FaUser} label="Last Name" value={user.last_name || "Not set"} />
              <ProfileItem Icon={HiOutlineShieldCheck} label="Role" value={user.role_display || user.role} />
              <ProfileItem Icon={FaCalendarAlt} label="Member Since" value={memberSince} />
            </div>

            <div style={s.profileDivider} />

            <h3 style={s.profileSection}>Activity Summary</h3>
            <div style={s.statsGrid} className="ud-stats-grid">
              <div style={s.statCard} className="ud-stat">
                <div style={s.statIconBox} className="ud-stat-icon-box">
                  <FaCalendarAlt size={16} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.statValue} className="ud-stat-value">{totalAppointments}</div>
                  <div style={s.statLabel} className="ud-stat-label">Total Appointments</div>
                </div>
              </div>
              <div style={s.statCard} className="ud-stat">
                <div style={s.statIconBox} className="ud-stat-icon-box">
                  <FaCheckCircle size={16} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.statValue} className="ud-stat-value">{completedAppointments}</div>
                  <div style={s.statLabel} className="ud-stat-label">Completed Visits</div>
                </div>
              </div>
              <div style={s.statCard} className="ud-stat">
                <div style={s.statIconBox} className="ud-stat-icon-box">
                  <FaHourglassHalf size={16} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.statValue} className="ud-stat-value">{pendingAppointments}</div>
                  <div style={s.statLabel} className="ud-stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApptRow({ Icon, label, value }) {
  return (
    <div style={s.apptRow}>
      <div style={s.apptKeyIcon}>
        <Icon size={11} color={MINT_DARK} />
      </div>
      <div style={{ flex: 1 }}>
        <span style={s.apptKey}>{label}</span>
        <div style={s.apptVal}>{value}</div>
      </div>
    </div>
  );
}

function ProfileItem({ Icon, label, value }) {
  return (
    <div style={s.profileItem}>
      <div style={s.profileItemHeader}>
        <Icon size={10} color={MINT_DARK} />
        <span style={s.profileKey}>{label}</span>
      </div>
      <div style={s.profileValue}>{value}</div>
    </div>
  );
}

function EmptyState({ Icon, title, desc, actionText, onAction }) {
  return (
    <div style={s.emptyState}>
      <div style={s.emptyIconBox}>
        <Icon size={36} color={MINT_DARK} />
      </div>
      <h3 style={s.emptyTitle}>{title}</h3>
      <p style={s.emptyText}>{desc}</p>
      <button style={s.btnPrimary} className="ud-btn-primary" onClick={onAction}>
        {actionText}
        <FaArrowRight size={11} />
      </button>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" },

  // WELCOME HEADER
  welcomeHeader: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "22px 28px",
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    boxShadow: "0 4px 14px rgba(15,32,24,0.04)",
  },
  welcomeLeft: { display: "flex", alignItems: "center", gap: 16 },
  bigAvatar: {
    width: 60, height: 60,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    borderRadius: 14,
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(26,110,63,0.3)",
    flexShrink: 0,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  welcomeSub: { fontSize: 13.5, color: TEXT_MUTED, margin: 0 },
  welcomeRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  memberBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  btnLogout: {
    background: "#fff",
    color: TEXT_BODY,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  // TABS
  tabRow: {
    display: "flex",
    gap: 4,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
    padding: 5,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  tabBtn: {
    flex: 1,
    minWidth: 130,
    background: "transparent",
    border: "none",
    padding: "10px 16px",
    fontSize: 13.5,
    fontWeight: 700,
    color: TEXT_MUTED,
    borderRadius: 7,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  tabActive: {
    background: MINT_DARK,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(26,110,63,0.25)",
  },
  tabCount: {
    background: "#f4f9f6",
    color: TEXT_BODY,
    borderRadius: 5,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 800,
  },
  tabCountActive: {
    background: "rgba(255,255,255,0.25)",
    color: "#fff",
  },

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

  // SECTIONS
  section: { marginBottom: 26 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 14px",
    letterSpacing: "-0.3px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 12,
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

  // ACTIONS GRID
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
    cursor: "pointer",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    width: 26,
    height: 26,
    background: MINT_LIGHT,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // LIST
  list: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  listTitle: {
    fontSize: 14.5,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 3,
    letterSpacing: "-0.2px",
  },
  listSub: { fontSize: 12.5, color: MINT_DARK, fontWeight: 700, marginBottom: 5 },
  listMeta: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
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

  // APPOINTMENTS LIST
  apptList: { display: "flex", flexDirection: "column", gap: 12 },
  apptCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  apptTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  apptHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  apptDoctorName: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 2,
    letterSpacing: "-0.2px",
  },
  apptDoctorSpec: { fontSize: 12.5, color: MINT_DARK, fontWeight: 700 },
  apptIdBadge: {
    background: "#fafffe",
    color: TEXT_MUTED,
    border: `1px solid ${BORDER}`,
    borderRadius: 5,
    padding: "3px 8px",
    fontSize: 11,
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
    width: 28,
    height: 28,
    borderRadius: 7,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  apptActions: { display: "flex", justifyContent: "flex-end", gap: 8 },

  // ACTIONS / NOTES
  btnDanger: {
    background: "#fff",
    color: "#dc2626",
    border: "1.5px solid #fecaca",
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
  completedNote: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "#dbeafe",
    color: "#1e40af",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 700,
  },
  cancelledNote: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 700,
  },

  // PROFILE
  profileCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "28px 30px",
    boxShadow: "0 4px 14px rgba(15,32,24,0.04)",
  },
  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  profileBigAvatar: {
    width: 80, height: 80,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    borderRadius: 18,
    color: "#fff",
    fontSize: 28,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 22px rgba(26,110,63,0.3)",
  },
  profileName: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  profileBadges: { display: "flex", gap: 8, flexWrap: "wrap" },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#dbeafe",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 11.5,
    fontWeight: 800,
  },
  profileDivider: {
    height: 1,
    background: BORDER,
    margin: "24px 0 20px",
  },
  profileSection: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 14px",
    letterSpacing: "-0.2px",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 10,
  },
  profileItem: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 14px",
  },
  profileItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  profileKey: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: 700,
    wordBreak: "break-word",
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
    borderRadius: 14,
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
    width: 72, height: 72,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 8px",
    letterSpacing: "-0.2px",
  },
  emptyText: {
    fontSize: 13.5,
    color: TEXT_MUTED,
    marginBottom: 18,
    maxWidth: 360,
    margin: "0 auto 18px",
    lineHeight: 1.6,
  },

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
};