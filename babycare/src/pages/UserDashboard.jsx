import DoctorAvatar from "../components/DoctorAvatar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyAppointments, updateAppointmentStatus } from "../api/appointments";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const QUICK_ACTIONS = [
  { icon: "🔍", title: "Check Symptoms",  desc: "Apne bachay ke symptoms check karein", path: "/Symptomchecker",  color: "#2a9d5c" },
  { icon: "👨‍⚕️", title: "Book a Doctor",   desc: "Verified doctor se appointment lein",  path: "/DoctorBooking",  color: "#1a5c8a" },
  { icon: "💊", title: "Order Medicine",  desc: "Homeopathic medicines online order karein", path: "/shop",          color: "#7c3aed" },
  { icon: "📚", title: "Health Tips",     desc: "Baby health ke liye useful articles",  path: "/about",          color: "#b45309" },
];

const STATUS_COLORS = {
  confirmed: { bg: "#e8f8ef", color: "#1a6e3f" },
  pending:   { bg: "#fff8e6", color: "#7a5a10" },
  completed: { bg: "#e8f0ff", color: "#3730a3" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // ─── Load appointments from backend ───
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

  useEffect(() => {
    loadAppointments();
  }, []);

  // ─── Cancel appointment ───
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Kya aap is appointment ko cancel karna chahte hain?")) return;

    setCancelLoadingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      await loadAppointments();
    } catch (err) {
      alert("Cancel fail ho gaya. Dobara try karein.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // User initials
  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  // Display name
  const getFullName = () => {
    if (!user) return "User";
    const first = user.first_name || "";
    const last = user.last_name || "";
    return `${first} ${last}`.trim() || user.email.split("@")[0];
  };

  // Stats from real appointments
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const pendingAppointments = appointments.filter((a) => a.status === "pending").length;

  // Member since (from user.created_at)
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  if (!user) return null;

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 400, height: 400, background: "#a7f3c4", top: "-150px", right: "5%" }} />
      <div className="bc-orb" style={{ width: 280, height: 280, background: "#d1f5e0", bottom: "10%", left: "-80px", animationDelay: "3s" }} />

      <div style={s.container}>

        {/* ════════════ WELCOME HEADER ════════════ */}
        <div style={s.welcomeHeader} className="bc-anim-fadeUp">
          <div style={s.welcomeLeft}>
            <div style={s.bigAvatar}>{getInitials()}</div>
            <div>
              <h1 style={s.welcomeTitle}>Welcome back, {user.first_name || "there"}! 👋</h1>
              <p style={s.welcomeSub}>Aap ke baby ki sehat ke liye kya kar sakta hoon aaj?</p>
            </div>
          </div>
          <div style={s.welcomeRight}>
            <button style={s.btnLogout} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* ════════════ TABS ════════════ */}
        <div style={s.tabRow} className="bc-anim-fadeUp bc-d1">
          {[
            { id: "overview",     label: "📊 Overview",       count: null },
            { id: "appointments", label: "📋 My Appointments", count: totalAppointments },
            { id: "profile",      label: "👤 My Profile",      count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...s.tabBtn, ...(activeTab === tab.id ? s.tabActive : {}) }}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span style={s.tabCount}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════ OVERVIEW TAB ════════════ */}
        {activeTab === "overview" && (
          <div key="overview" className="bc-anim-fadeUp">

            {/* Stats from real data */}
            <div style={s.statsGrid}>
              {[
                { icon: "📋", label: "Total Appointments", value: totalAppointments },
                { icon: "⏳", label: "Upcoming",            value: upcomingAppointments },
                { icon: "✅", label: "Completed",           value: completedAppointments },
                { icon: "📅", label: "Member Since",        value: memberSince },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={s.statCard}
                  className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
                >
                  <div style={s.statIcon}>{stat.icon}</div>
                  <div style={s.statValue}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={s.section} className="bc-anim-fadeUp bc-d3">
              <h2 style={s.sectionTitle}>⚡ Quick Actions</h2>
              <div style={s.actionsGrid}>
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    style={s.actionCard}
                    className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
                  >
                    <div style={{ ...s.actionIcon, background: `${action.color}15` }}>
                      {action.icon}
                    </div>
                    <div style={s.actionTitle}>{action.title}</div>
                    <div style={s.actionDesc}>{action.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Appointments Preview */}
            <div style={s.section} className="bc-anim-fadeUp bc-d4">
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>📋 Recent Appointments</h2>
                {totalAppointments > 0 && (
                  <button style={s.viewAllBtn} onClick={() => setActiveTab("appointments")}>
                    View All →
                  </button>
                )}
              </div>

              {loading ? (
                <div style={s.loadingBox}>
                  <span className="bc-spinner" />
                  <p>Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div style={s.list}>
                  {appointments.slice(0, 3).map((appt, i) => (
                    <div key={appt.id} style={s.listItem} className={`bc-anim-fadeUp bc-d${i + 1}`}>
                      <DoctorAvatar
  photoUrl={appt.doctor_photo_url}
  name={appt.doctor_name}
  size={42}
/>
                      <div style={{ flex: 1 }}>
                        <div style={s.listTitle}>Dr. {appt.doctor_name}</div>
                        <div style={s.listSub}>{appt.doctor_specialty} · {appt.symptom}</div>
                        <div style={s.listMeta}>📅 {appt.appointment_date} · 🕐 {appt.time_slot}</div>
                      </div>
                      <span style={{ ...s.statusBadge, ...STATUS_COLORS[appt.status] }}>
                        {appt.status_display}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  text="Abhi tak koi appointment nahi"
                  actionText="Pehli Appointment Book Karein"
                  onAction={() => navigate("/DoctorBooking")}
                />
              )}
            </div>
          </div>
        )}

        {/* ════════════ APPOINTMENTS TAB ════════════ */}
        {activeTab === "appointments" && (
          <div style={s.section} key="appointments" className="bc-anim-fadeUp">
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>📋 All My Appointments</h2>
              <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/DoctorBooking")}>
                + Book New Appointment
              </button>
            </div>

            {loading ? (
              <div style={s.loadingBox}>
                <span className="bc-spinner" />
                <p>Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div style={s.list}>
                {appointments.map((appt, i) => (
                  <div key={appt.id} style={s.apptCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}>
                    <div style={s.apptTop}>
                      <div style={s.apptId}>#{appt.id}</div>
                      <span style={{ ...s.statusBadge, ...STATUS_COLORS[appt.status] }}>{appt.status_display}</span>
                    </div>

                    <div style={s.apptBody}>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>👨‍⚕️ Doctor:</span>
                        <span style={s.apptVal}>Dr. {appt.doctor_name}</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>🎓 Specialty:</span>
                        <span style={s.apptVal}>{appt.doctor_specialty}</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>📅 Date:</span>
                        <span style={s.apptVal}>{appt.appointment_date}</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>🕐 Time:</span>
                        <span style={s.apptVal}>{appt.time_slot}</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>🍼 Baby:</span>
                        <span style={s.apptVal}>{appt.baby_name} ({appt.baby_age})</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>🩺 Symptom:</span>
                        <span style={s.apptVal}>{appt.symptom}</span>
                      </div>
                      <div style={s.apptRow}>
                        <span style={s.apptKey}>💰 Fee:</span>
                        <span style={s.apptVal}>Rs. {appt.doctor_fee}</span>
                      </div>
                      {appt.notes && (
                        <div style={s.apptRow}>
                          <span style={s.apptKey}>📝 Notes:</span>
                          <span style={s.apptVal}>{appt.notes}</span>
                        </div>
                      )}
                    </div>

                    <div style={s.apptActions}>
                      {(appt.status === "pending" || appt.status === "confirmed") && (
                        <button
                          style={s.btnDanger}
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelLoadingId === appt.id}
                        >
                          {cancelLoadingId === appt.id ? "Cancelling..." : "✕ Cancel Appointment"}
                        </button>
                      )}
                      {appt.status === "completed" && (
                        <div style={{ fontSize: 13, color: "#3730a3", fontWeight: 700, padding: "8px 0" }}>
                          ✓ Appointment completed
                        </div>
                      )}
                      {appt.status === "cancelled" && (
                        <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 700, padding: "8px 0" }}>
                          ✕ Appointment cancelled
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                text="Aap ne abhi tak koi appointment book nahi ki"
                actionText="Pehli Appointment Book Karein"
                onAction={() => navigate("/DoctorBooking")}
              />
            )}
          </div>
        )}

        {/* ════════════ PROFILE TAB ════════════ */}
        {activeTab === "profile" && (
          <div key="profile" className="bc-anim-fadeUp">
            <div style={s.profileCard} className="bc-anim-scaleIn">
              <div style={s.profileTop}>
                <div style={s.profileBigAvatar}>{getInitials()}</div>
                <div style={{ flex: 1 }}>
                  <h2 style={s.profileName}>{getFullName()}</h2>
                  <p style={s.profileRole}>
                    <span style={s.profileBadge}>{user.role_display || "Parent"}</span>
                    {user.is_verified && <span style={s.verifiedBadge}>✓ Verified</span>}
                  </p>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.profileGrid}>
                {[
                  ["📧 Email",         user.email],
                  ["📞 Phone",         user.phone || "Not provided"],
                  ["👤 First Name",    user.first_name || "Not set"],
                  ["👤 Last Name",     user.last_name  || "Not set"],
                  ["🎭 Role",          user.role_display || user.role],
                  ["📅 Member Since",  memberSince],
                ].map(([key, value], i) => (
                  <div key={key} style={s.profileItem} className={`bc-anim-fadeUp bc-d${i + 1}`}>
                    <div style={s.profileKey}>{key}</div>
                    <div style={s.profileValue}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Account stats */}
              <div style={s.divider} />
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f2018", marginBottom: 14 }}>📊 Activity Summary</h3>
              <div style={s.profileGrid}>
                <div style={s.profileItem}>
                  <div style={s.profileKey}>📋 Total Appointments</div>
                  <div style={s.profileValue}>{totalAppointments}</div>
                </div>
                <div style={s.profileItem}>
                  <div style={s.profileKey}>✅ Completed Visits</div>
                  <div style={s.profileValue}>{completedAppointments}</div>
                </div>
                <div style={s.profileItem}>
                  <div style={s.profileKey}>⏳ Pending</div>
                  <div style={s.profileValue}>{pendingAppointments}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ Empty State Component ═══════════════ */
function EmptyState({ text, actionText, onAction }) {
  return (
    <div style={s.emptyState}>
      <div style={{ fontSize: 56, marginBottom: 12 }} className="bc-float">📭</div>
      <p style={s.emptyText}>{text}</p>
      <button style={s.btnPrimary} className="bc-btn-glow" onClick={onAction}>
        {actionText} →
      </button>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)",
    fontFamily: "'Nunito','Segoe UI',sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 72px", position: "relative", zIndex: 2 },

  welcomeHeader: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px) saturate(140%)", WebkitBackdropFilter: "blur(16px) saturate(140%)", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 20, padding: "24px 28px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", boxShadow: "0 8px 30px rgba(42,157,92,0.12)" },
  welcomeLeft: { display: "flex", alignItems: "center", gap: 16, flex: 1 },
  welcomeRight: { display: "flex", gap: 10 },
  bigAvatar: { width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, boxShadow: "0 6px 18px rgba(42,157,92,0.35)", flexShrink: 0 },
  welcomeTitle: { fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: "#0f2018", margin: "0 0 4px", letterSpacing: "-0.5px" },
  welcomeSub: { fontSize: 14, color: "#5a7a6a", margin: 0 },
  btnLogout: { background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  tabRow: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 14, padding: 6 },
  tabBtn: { flex: 1, minWidth: 130, background: "transparent", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", color: "#5a7a6a", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.22s ease" },
  tabActive: { background: "#fff", color: MINT_DARK, boxShadow: "0 2px 10px rgba(42,157,92,0.15)" },
  tabCount: { background: MINT_LIGHT, color: MINT_DARK, borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 900 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 },
  statCard: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(12px) saturate(140%)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 14, padding: "20px", textAlign: "center", boxShadow: "0 4px 14px rgba(42,157,92,0.07)" },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 900, color: MINT_DARK, letterSpacing: "-0.5px", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#5a7a6a", fontWeight: 700 },

  section: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px) saturate(140%)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 16, padding: "24px 26px", marginBottom: 22, boxShadow: "0 4px 18px rgba(42,157,92,0.07)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: 0, letterSpacing: "-0.3px" },
  viewAllBtn: { background: MINT_LIGHT, color: MINT_DARK, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },

  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  actionCard: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.7)", borderRadius: 14, padding: "22px 18px", cursor: "pointer", fontFamily: "inherit", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "all 0.28s" },
  actionIcon: { width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 4 },
  actionTitle: { fontSize: 15, fontWeight: 900, color: "#0f2018" },
  actionDesc: { fontSize: 12, color: "#5a7a6a", lineHeight: 1.5, textAlign: "center" },

  list: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: { background: "rgba(250,255,254,0.7)", border: "1px solid rgba(212,237,223,0.6)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 },
  listIcon: { width: 42, height: 42, background: MINT_LIGHT, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  listTitle: { fontSize: 14.5, fontWeight: 800, color: "#0f2018", marginBottom: 2 },
  listSub: { fontSize: 12.5, color: "#5a7a6a", marginBottom: 2 },
  listMeta: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600 },

  apptCard: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.7)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 },
  apptTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  apptId: { background: "#f0faf4", color: MINT_DARK, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 800 },
  apptBody: { display: "flex", flexDirection: "column", gap: 8 },
  apptRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  apptKey: { fontSize: 12, color: "#9ab5a5", fontWeight: 700 },
  apptVal: { fontSize: 13, color: "#0f2018", fontWeight: 700, textAlign: "right" },
  apptActions: { display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid rgba(212,237,223,0.5)" },

  profileCard: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(18px) saturate(140%)", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 20, padding: "32px 32px", boxShadow: "0 12px 40px rgba(42,157,92,0.15)" },
  profileTop: { display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" },
  profileBigAvatar: { width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, boxShadow: "0 8px 24px rgba(42,157,92,0.35)", flexShrink: 0 },
  profileName: { fontSize: 24, fontWeight: 900, color: "#0f2018", margin: "0 0 8px", letterSpacing: "-0.5px" },
  profileRole: { display: "flex", gap: 8, flexWrap: "wrap", margin: 0 },
  profileBadge: { background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800 },
  verifiedBadge: { background: "#e8f0ff", color: "#3730a3", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800 },
  divider: { height: 1, background: "#f0f5f2", margin: "24px 0" },
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  profileItem: { background: "rgba(250,255,254,0.6)", border: "1px solid rgba(212,237,223,0.5)", borderRadius: 10, padding: "12px 14px" },
  profileKey: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 700, marginBottom: 4 },
  profileValue: { fontSize: 14, color: "#0f2018", fontWeight: 800, wordBreak: "break-word" },

  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.32)" },
  btnDanger: { background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },

  statusBadge: { borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 800 },

  loadingBox: { textAlign: "center", padding: "40px 20px", color: "#5a7a6a", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  emptyState: { textAlign: "center", padding: "40px 20px" },
  emptyText: { fontSize: 14, color: "#5a7a6a", marginBottom: 16 },
};
