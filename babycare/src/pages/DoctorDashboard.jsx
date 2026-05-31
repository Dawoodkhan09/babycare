import { getMyDoctorProfile } from "../api/doctors";
import DoctorAvatar from "../components/DoctorAvatar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDoctorAppointments, updateAppointmentStatus } from "../api/appointments";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const STATUS_COLORS = {
  confirmed: { bg: "#e8f8ef", color: "#1a6e3f" },
  pending:   { bg: "#fff8e6", color: "#7a5a10" },
  completed: { bg: "#e8f0ff", color: "#3730a3" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard",    id: "dashboard" },
  { icon: "📋", label: "Appointments", id: "appointments" },
  { icon: "👤", label: "My Profile",   id: "profile" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // ─── Load doctor's own profile (with photo) ───
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
      alert("Status update fail ho gaya");
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
  const totalPatients = new Set(appointments.map(a => a.patient)).size;

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
      <div className="bc-orb" style={{ width: 400, height: 400, background: "#d1f5e0", top: "-180px", right: "10%", opacity: 0.35 }} />
      <div className="bc-orb" style={{ width: 320, height: 320, background: "#a7f3c4", bottom: "5%", left: "15%", opacity: 0.3, animationDelay: "3s" }} />

      {/* SIDEBAR */}
      <div style={{ ...s.sidebar, width: sidebarOpen ? 230 : 64 }} className="bc-anim-fadeLeft">
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon} className="bc-float">🍼</div>
          {sidebarOpen && <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span></span>}
        </div>

        {sidebarOpen && (
          <div style={s.roleBadge} className="bc-anim-fadeUp">
            <span style={{ fontSize: 11 }}>👨‍⚕️</span>
            <span>Doctor Portal</span>
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
              {sidebarOpen && item.id === "appointments" && pendingCount > 0 && (
                <span style={s.notifBadge}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topBar}>
          <div style={s.topLeft}>
            <button style={s.toggleBtn} onClick={() => setSidebarOpen((o) => !o)}>☰</button>
            <h1 style={s.topTitle} key={activeNav} className="bc-anim-fadeUp">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.icon}{" "}
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>
          <div style={s.topRight}>
            {pendingCount > 0 && (
              <button style={s.bellBtn} className="bc-glow-pulse" onClick={() => setActiveNav("appointments")}>
                🔔 <span style={s.bellCount}>{pendingCount}</span>
              </button>
            )}
            <div style={s.doctorPill}>
              <DoctorAvatar
                photoUrl={doctorProfile?.profile_photo_url}
                name={getDoctorName()}
                size={36}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={s.doctorName}>{getDoctorName()}</span>
                <span style={s.doctorSpec}>Doctor</span>
              </div>
              {user.is_verified && <span style={s.verifiedTick}>✓</span>}
            </div>
          </div>
        </div>

        <div style={s.content} key={activeNav}>

          {/* DASHBOARD */}
          {activeNav === "dashboard" && (
            <>
              <div style={s.welcomeBanner} className="bc-anim-fadeUp">
                <div>
                  <h2 style={s.welcomeTitle}>Welcome back, Dr. {user.first_name || "Doctor"}! 👋</h2>
                  <p style={s.welcomeSub}>
                    {loading ? "Loading..." : (
                      <>
                        Aap ke pas <strong style={{ color: MINT_DARK }}>{todayAppts} appointments</strong> aaj hain,
                        aur <strong style={{ color: "#7a5a10" }}>{pendingCount} pending</strong> hain.
                      </>
                    )}
                  </p>
                </div>
                <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => setActiveNav("appointments")}>
                  View Appointments →
                </button>
              </div>

              <div style={s.statsGrid}>
                {[
                  { icon: "📅", label: "Today's Appointments", value: todayAppts },
                  { icon: "👨‍👩‍👧", label: "Total Patients",   value: totalPatients },
                  { icon: "✅", label: "Completed",            value: completedCount },
                  { icon: "📋", label: "Total Bookings",       value: appointments.length },
                ].map((stat, i) => (
                  <div key={stat.label} style={s.statCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}>
                    <div style={s.statIcon}>{stat.icon}</div>
                    <div>
                      <div style={s.statValue}>{stat.value}</div>
                      <div style={s.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.section} className="bc-anim-fadeUp bc-d5">
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Today's Schedule</h2>
                  <button style={s.viewAllBtn} onClick={() => setActiveNav("appointments")}>View All →</button>
                </div>

                {loading ? (
                  <div style={s.loadingBox}><span className="bc-spinner" /><p>Loading...</p></div>
                ) : (() => {
                  const today = new Date().toISOString().split("T")[0];
                  const todayList = appointments.filter((a) => a.appointment_date === today);
                  if (todayList.length === 0) {
                    return (
                      <div style={s.emptyState}>
                        <div style={{ fontSize: 48, marginBottom: 12 }} className="bc-float">📭</div>
                        <p style={{ fontSize: 14, color: "#5a7a6a" }}>Aaj koi appointment schedule nahi</p>
                      </div>
                    );
                  }
                  return (
                    <div style={s.scheduleList}>
                      {todayList.map((a, i) => (
                        <div key={a.id} style={s.scheduleItem} className={`bc-anim-fadeUp bc-d${i + 1}`}>
                          <div style={s.scheduleTime}>
                            <div style={s.timeIcon}>🕐</div>
                            <div>
                              <div style={s.timeLabel}>{a.time_slot}</div>
                              <div style={s.timeSub}>#{a.id}</div>
                            </div>
                          </div>
                          <div style={s.schedulePatient}>
                            <div style={s.patientName}>{a.patient_name}</div>
                            <div style={s.patientBaby}>{a.baby_name} ({a.baby_age})</div>
                            <div style={s.patientSymptom}>🩺 {a.symptom}</div>
                          </div>
                          <div style={s.scheduleActions}>
                            <span style={{ ...s.statusBadge, ...STATUS_COLORS[a.status] }}>{a.status_display}</span>
                            {a.status === "pending" && (
                              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <button style={s.acceptBtn} onClick={() => handleUpdateStatus(a.id, "confirmed")}>✓ Accept</button>
                                <button style={s.rejectBtn} onClick={() => handleUpdateStatus(a.id, "cancelled")}>✕</button>
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

          {/* APPOINTMENTS */}
          {activeNav === "appointments" && (
            <div style={s.section} className="bc-anim-fadeUp">
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>All Appointments</h2>
                <span style={s.countBadge}>{filteredAppointments.length} of {appointments.length}</span>
              </div>

              <div style={s.filterRow}>
                {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                  <button key={f} onClick={() => setStatusFilter(f)} style={{ ...s.filterPill, ...(statusFilter === f ? s.filterActive : {}) }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== "all" && <span style={s.filterCount}>{appointments.filter((a) => a.status === f).length}</span>}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={s.loadingBox}><span className="bc-spinner" /><p>Loading appointments...</p></div>
              ) : filteredAppointments.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 48, marginBottom: 12 }} className="bc-float">📭</div>
                  <p style={{ fontSize: 14, color: "#5a7a6a" }}>
                    {statusFilter === "all" ? "Abhi koi appointment nahi" : `No ${statusFilter} appointments`}
                  </p>
                </div>
              ) : (
                <div style={s.apptList}>
                  {filteredAppointments.map((a, i) => (
                    <div key={a.id} style={s.apptCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}>
                      <div style={s.apptTop}>
                        <div style={s.apptId}>#{a.id}</div>
                        <span style={{ ...s.statusBadge, ...STATUS_COLORS[a.status] }}>{a.status_display}</span>
                      </div>
                      <div style={s.apptBody}>
                        <div style={s.apptRow}><span style={s.apptKey}>👤 Patient:</span><span style={s.apptVal}>{a.patient_name}</span></div>
                        <div style={s.apptRow}><span style={s.apptKey}>🍼 Baby:</span><span style={s.apptVal}>{a.baby_name} ({a.baby_age})</span></div>
                        <div style={s.apptRow}><span style={s.apptKey}>📅 Date:</span><span style={s.apptVal}>{a.appointment_date}</span></div>
                        <div style={s.apptRow}><span style={s.apptKey}>🕐 Time:</span><span style={s.apptVal}>{a.time_slot}</span></div>
                        <div style={s.apptRow}><span style={s.apptKey}>🩺 Symptom:</span><span style={s.apptVal}>{a.symptom}</span></div>
                        <div style={s.apptRow}><span style={s.apptKey}>📞 Contact:</span><span style={s.apptVal}><a href={`tel:${a.contact_phone}`} style={{ color: MINT, textDecoration: "none", fontWeight: 700 }}>{a.contact_phone}</a></span></div>
                        {a.notes && <div style={s.apptRow}><span style={s.apptKey}>📝 Notes:</span><span style={s.apptVal}>{a.notes}</span></div>}
                      </div>
                      <div style={s.apptActions}>
                        {a.status === "pending" && (
                          <>
                            <button style={s.acceptBtn} onClick={() => handleUpdateStatus(a.id, "confirmed")}>✓ Accept</button>
                            <button style={s.rejectBtn} onClick={() => handleUpdateStatus(a.id, "cancelled")}>✕ Reject</button>
                          </>
                        )}
                        {a.status === "confirmed" && (
                          <>
                            <button style={s.completeBtn} onClick={() => handleUpdateStatus(a.id, "completed")}>✓ Mark Complete</button>
                            <a href={`tel:${a.contact_phone}`} style={s.callBtn}>📞 Call</a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeNav === "profile" && (
            <div style={s.profileWrap} className="bc-anim-fadeUp">
              <div style={s.profileHeader} className="bc-anim-scaleIn">
                <DoctorAvatar
                  photoUrl={doctorProfile?.profile_photo_url}
                  name={getDoctorName()}
                  size={96}
                  fontSize={32}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 style={s.profileName}>Dr. {getDoctorName()}</h2>
                    {user.is_verified && <span style={s.verifiedBadge}>✓ Verified Doctor</span>}
                  </div>
                  <p style={s.profileSpec}>{user.role_display || "Doctor"}</p>
                  <div style={s.profileMeta}>
                    <span>📋 {appointments.length} appointments</span>
                    <span>✅ {completedCount} completed</span>
                    <span>⏳ {pendingCount} pending</span>
                  </div>
                </div>
              </div>

              <div style={s.section}>
                <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Account Information</h2></div>
                <div style={s.detailsGrid}>
                  {[
                    ["📧 Email",         user.email],
                    ["📞 Phone",         user.phone || "Not set"],
                    ["👤 First Name",    user.first_name || "Not set"],
                    ["👤 Last Name",     user.last_name || "Not set"],
                    ["🎭 Role",          user.role_display || "Doctor"],
                    ["✅ Status",        user.is_verified ? "Verified" : "Pending"],
                  ].map(([k, v], i) => (
                    <div key={k} style={s.detailItem} className={`bc-anim-fadeUp bc-d${i + 1}`}>
                      <div style={s.detailKey}>{k}</div>
                      <div style={s.detailVal}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.section}>
                <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Verification Status</h2></div>
                <div style={s.verifyStatusBox}>
                  <div style={s.verifyIcon}>✓</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: MINT_DARK, marginBottom: 4 }}>Your account is verified</div>
                    <div style={{ fontSize: 13, color: "#5a7a6a", lineHeight: 1.6 }}>
                      Admin team ne aap ke documents verify kar diye hain. Aap patient appointments accept kar sakte hain.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Nunito','Segoe UI',sans-serif", background: "linear-gradient(135deg, #f4f9f6 0%, #e8f8ef 100%)", position: "relative", overflow: "hidden" },
  sidebar: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px) saturate(140%)", WebkitBackdropFilter: "blur(16px) saturate(140%)", borderRight: "1px solid rgba(224,237,230,0.6)", display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden", minHeight: "100vh", flexShrink: 0, position: "relative", zIndex: 10, boxShadow: "2px 0 18px rgba(42,157,92,0.06)" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid rgba(224,237,230,0.6)" },
  logoIcon: { width: 36, height: 36, background: MINT_LIGHT, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 900, color: "#1a2e24", whiteSpace: "nowrap" },
  roleBadge: { margin: "12px 14px 0", background: MINT_LIGHT, color: MINT_DARK, borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(42,157,92,0.18)" },
  navItems: { flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", width: "100%", position: "relative" },
  navItemActive: { background: MINT_LIGHT, boxShadow: "0 0 0 1px rgba(42,157,92,0.2)" },
  navIcon: { fontSize: 18, flexShrink: 0 },
  navLabel: { fontSize: 14, fontWeight: 700, color: "#1a2e24", whiteSpace: "nowrap", flex: 1, textAlign: "left" },
  notifBadge: { background: "#dc2626", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10.5, fontWeight: 900 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "none", border: "none", borderTop: "1px solid rgba(224,237,230,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#dc2626", width: "100%" },

  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 2 },
  topBar: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(224,237,230,0.6)", padding: "0 28px", minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexWrap: "wrap", gap: 12 },
  topLeft: { display: "flex", alignItems: "center", gap: 16 },
  toggleBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#3d5a48", padding: "4px 8px" },
  topTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: 0 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  bellBtn: { background: "rgba(255,243,205,0.8)", border: "1.5px solid #fbbf24", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#7a5a10" },
  bellCount: { background: "#dc2626", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 900 },
  doctorPill: { display: "flex", alignItems: "center", gap: 10, background: MINT_LIGHT, borderRadius: 30, padding: "6px 14px 6px 6px", border: "1px solid rgba(42,157,92,0.18)" },
  doctorAvatar: { width: 36, height: 36, background: MINT, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" },
  doctorName: { fontSize: 13, fontWeight: 800, color: MINT_DARK, lineHeight: 1.2 },
  doctorSpec: { fontSize: 10.5, color: "#5a7a6a", fontWeight: 600 },
  verifiedTick: { width: 18, height: 18, borderRadius: "50%", background: MINT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 },

  content: { padding: "28px 28px 60px", flex: 1 },
  welcomeBanner: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 16, padding: "22px 26px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" },
  welcomeTitle: { fontSize: 20, fontWeight: 900, color: "#0f2018", margin: "0 0 6px" },
  welcomeSub: { fontSize: 14, color: "#5a7a6a", margin: 0, lineHeight: 1.6 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 },
  statCard: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 14, padding: "20px", display: "flex", gap: 14, alignItems: "center" },
  statIcon: { fontSize: 30, flexShrink: 0 },
  statValue: { fontSize: 22, fontWeight: 900, color: "#0f2018" },
  statLabel: { fontSize: 12.5, color: "#9ab5a5", fontWeight: 600 },

  section: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px)", border: "1.5px solid rgba(224,237,230,0.6)", borderRadius: 16, padding: "22px 24px", marginBottom: 24 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 900, color: "#0f2018", margin: 0 },
  viewAllBtn: { background: MINT_LIGHT, color: MINT_DARK, border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  countBadge: { background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 800 },

  scheduleList: { display: "flex", flexDirection: "column", gap: 12 },
  scheduleItem: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.6)", borderRadius: 12, padding: "16px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" },
  scheduleTime: { display: "flex", alignItems: "center", gap: 10 },
  timeIcon: { width: 40, height: 40, background: MINT_LIGHT, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  timeLabel: { fontSize: 14, fontWeight: 900, color: MINT_DARK },
  timeSub: { fontSize: 11, color: "#9ab5a5", fontWeight: 600 },
  schedulePatient: { minWidth: 0 },
  patientName: { fontSize: 14, fontWeight: 800, color: "#0f2018", marginBottom: 2 },
  patientBaby: { fontSize: 12.5, color: "#5a7a6a", marginBottom: 4 },
  patientSymptom: { fontSize: 12, color: MINT_DARK, fontWeight: 700 },
  scheduleActions: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },

  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  filterPill: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 20, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", display: "flex", alignItems: "center", gap: 6 },
  filterActive: { background: MINT_LIGHT, border: `2px solid ${MINT}`, color: MINT_DARK },
  filterCount: { background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 900 },

  apptList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  apptCard: { background: "rgba(250,255,254,0.7)", border: "1.5px solid rgba(212,237,223,0.7)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 },
  apptTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  apptId: { background: "#f0faf4", color: MINT_DARK, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 800 },
  apptBody: { display: "flex", flexDirection: "column", gap: 8 },
  apptRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  apptKey: { fontSize: 12, color: "#9ab5a5", fontWeight: 700 },
  apptVal: { fontSize: 13, color: "#0f2018", fontWeight: 700, textAlign: "right" },
  apptActions: { display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid rgba(212,237,223,0.5)" },

  acceptBtn: { flex: 1, minWidth: 90, background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(42,157,92,0.3)" },
  rejectBtn: { flex: 1, minWidth: 90, background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 8, padding: "8px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" },
  completeBtn: { flex: 1, minWidth: 110, background: `linear-gradient(135deg, #3730a3, #1e3a8a)`, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" },
  callBtn: { flex: 1, minWidth: 100, background: "#fff", color: MINT, border: `2px solid ${MINT}`, borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", textAlign: "center" },

  statusBadge: { borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 800, display: "inline-block" },
  loadingBox: { textAlign: "center", padding: "40px 20px", color: "#5a7a6a", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  emptyState: { textAlign: "center", padding: "40px 20px", color: "#9ab5a5" },

  profileWrap: { maxWidth: 900 },
  profileHeader: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 18, padding: "28px 30px", marginBottom: 22, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" },
  bigAvatar: { width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#fff", flexShrink: 0 },
  profileName: { fontSize: 22, fontWeight: 900, color: "#0f2018", margin: 0 },
  verifiedBadge: { background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20, padding: "4px 12px", fontSize: 11.5, fontWeight: 800, border: `1px solid ${MINT}` },
  profileSpec: { fontSize: 14, color: MINT, fontWeight: 700, margin: "4px 0 10px" },
  profileMeta: { display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12.5, color: "#5a7a6a", fontWeight: 600 },

  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  detailItem: { background: "rgba(250,255,254,0.6)", border: "1px solid rgba(212,237,223,0.5)", borderRadius: 10, padding: "12px 14px" },
  detailKey: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 700, marginBottom: 4 },
  detailVal: { fontSize: 13.5, color: "#0f2018", fontWeight: 800, wordBreak: "break-word" },

  verifyStatusBox: { background: "rgba(232,248,239,0.7)", border: `1.5px solid ${MINT}`, borderRadius: 12, padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start" },
  verifyIcon: { width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, flexShrink: 0 },

  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.32)" },
};
