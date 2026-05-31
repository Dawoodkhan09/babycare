import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBaby, FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaClipboardList, FaTachometerAlt, FaUserShield, FaExclamationCircle, FaCommentDots } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

const MINT       = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK  = "#1a6e3f";

const NAV_LINKS = [
  { label: "Home",            path: "/" },
  { label: "Symptom Checker", path: "/Symptomchecker" },
  { label: "Doctors",         path: "/DoctorBooking" },
  { label: "Shop",            path: "/Shop" },
  { label: "About",           path: "/About" },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Click outside dropdown — close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname.toLowerCase() === path.toLowerCase();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  // User ki initials nikalo (avatar ke liye)
  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  // Display name
  const getDisplayName = () => {
    if (!user) return "";
    if (user.first_name) return user.first_name;
    return user.email.split("@")[0];
  };

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      <div style={s.inner}>

        {/* LOGO */}
        <div style={s.logo} onClick={() => navigate("/")}>
          <div style={s.logoIcon}><FaBaby size={18} color={MINT} /></div>
          <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span></span>
        </div>

        {/* DESKTOP LINKS */}
        <ul style={s.links}>
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => navigate(l.path)}
                style={{ ...s.link, ...(isActive(l.path) ? s.linkActive : {}) }}
              >
                {l.label}
                {isActive(l.path) && <div style={s.linkDot} />}
              </button>
            </li>
          ))}
        </ul>

        {/* RIGHT BUTTONS */}
        <div style={s.right}>
          <button style={s.btnShop} onClick={() => navigate("/shop")}>
            <FaCartShopping size={14} /> Shop
          </button>

          {isAuthenticated ? (
            // ═══ LOGGED IN — USER PILL + DROPDOWN ═══
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                style={s.userPill}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <div style={s.avatar}>{getInitials()}</div>
                <div style={s.userInfo}>
                  <span style={s.userName}>{getDisplayName()}</span>
                  <span style={s.userRole}>{user.role_display || user.role}</span>
                </div>
                <span style={{ ...s.caret, transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>

              {/* DROPDOWN */}
              {dropdownOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropdownHeader}>
                    <div style={s.dropdownName}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div style={s.dropdownEmail}>{user.email}</div>
                  </div>

                  <div style={s.dropdownDivider} />

                  {/* Doctor link */}
                  {user.role === "doctor" && (
                    <button
                      style={s.dropdownItem}
                      onClick={() => { navigate("/doctordashboard"); setDropdownOpen(false); }}
                    >
                      <FaTachometerAlt size={13} color={MINT} />
                      <span>Doctor Dashboard</span>
                    </button>
                  )}

                  {/* Admin link */}
                  {user.role === "admin" && (
                    <button
                      style={s.dropdownItem}
                      onClick={() => { navigate("/AdminDashboard"); setDropdownOpen(false); }}
                    >
                      <FaUserShield size={13} color={MINT} />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  {/* Dashboard link — sab logged in users ke liye */}
                  <button
                    style={s.dropdownItem}
                    onClick={() => {
                      if (user.role === "doctor") navigate("/doctordashboard");
                      else if (user.role === "admin") navigate("/AdminDashboard");
                      else navigate("/dashboard");
                      setDropdownOpen(false);
                    }}
                  >
                    <FaTachometerAlt size={13} color={MINT} />
                    <span>My Dashboard</span>
                  </button>

                  {/* Common items (sab users ke liye) */}
                  <button
                    style={s.dropdownItem}
                    onClick={() => { navigate("/my-bookings"); setDropdownOpen(false); }}
                  >
                    <FaClipboardList size={13} color={MINT} />
                    <span>My Bookings</span>
                  </button>

                  <button
                    style={s.dropdownItem}
                    onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                  >
                    <FaUserCircle size={13} color={MINT} />
                    <span>My Profile</span>
                  </button>

                  <div style={s.dropdownDivider} />

                  {/* ⬇️ NEW: Complaints (sirf user aur doctor ke liye, admin ka apna section hai) */}
                  {user.role !== "admin" && (
                    <>
                      <button
                        style={s.dropdownItem}
                        onClick={() => { navigate("/my-complaints"); setDropdownOpen(false); }}
                      >
                        <FaCommentDots size={13} color={MINT} />
                        <span>My Complaints</span>
                      </button>

                      <button
                        style={s.dropdownItem}
                        onClick={() => { navigate("/file-complaint"); setDropdownOpen(false); }}
                      >
                        <FaExclamationCircle size={13} color="#dc2626" />
                        <span>File Complaint</span>
                      </button>

                      <div style={s.dropdownDivider} />
                    </>
                  )}

                  <button style={s.logoutBtn} onClick={handleLogout}>
                    <FaSignOutAlt size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ═══ NOT LOGGED IN — LOGIN + CHECK SYMPTOMS ═══
            <>
              <button style={s.btnOutline} onClick={() => navigate("/login")}>Login</button>
              <button style={s.btnPrimary} onClick={() => navigate("/Symptomchecker")}>
                Check Symptoms
              </button>
            </>
          )}
        </div>

        {/* HAMBURGER */}
        <button style={s.hamburger} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <FaTimes size={20} color="#1a2e24" /> : <FaBars size={20} color="#1a2e24" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={s.mobile}>
          {/* Nav links */}
          {NAV_LINKS.map((l) => (
            <button key={l.label}
              style={{ ...s.mobileLink, ...(isActive(l.path) ? { color: MINT } : {}) }}
              onClick={() => { navigate(l.path); setMenuOpen(false); }}>
              {l.label}
            </button>
          ))}

          {/* Auth section */}
          {isAuthenticated ? (
            <>
              {/* User info card */}
              <div style={s.mobileUserCard}>
                <div style={s.avatar}>{getInitials()}</div>
                <div>
                  <div style={s.mobileUserName}>{user.first_name} {user.last_name}</div>
                  <div style={s.mobileUserEmail}>{user.email}</div>
                </div>
              </div>

              {/* Role-specific link */}
              {user.role === "doctor" && (
                <button style={s.mobileAuthBtn} onClick={() => { navigate("/doctordashboard"); setMenuOpen(false); }}>
                  <FaTachometerAlt size={13} /> Doctor Dashboard
                </button>
              )}
              {user.role === "admin" && (
                <button style={s.mobileAuthBtn} onClick={() => { navigate("/AdminDashboard"); setMenuOpen(false); }}>
                  <FaUserShield size={13} /> Admin Panel
                </button>
              )}

              {/* Common items */}
              <button style={s.mobileAuthBtn} onClick={() => { navigate("/my-bookings"); setMenuOpen(false); }}>
                <FaClipboardList size={13} /> My Bookings
              </button>
              <button style={s.mobileAuthBtn} onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                <FaUserCircle size={13} /> My Profile
              </button>

              {/* ⬇️ NEW: Complaint links (user/doctor only) */}
              {user.role !== "admin" && (
                <>
                  <button style={s.mobileAuthBtn} onClick={() => { navigate("/my-complaints"); setMenuOpen(false); }}>
                    <FaCommentDots size={13} /> My Complaints
                  </button>
                  <button style={s.mobileAuthBtn} onClick={() => { navigate("/file-complaint"); setMenuOpen(false); }}>
                    <FaExclamationCircle size={13} color="#dc2626" /> File Complaint
                  </button>
                </>
              )}

              {/* Logout */}
              <button style={s.mobileLogoutBtn} onClick={handleLogout}>
                <FaSignOutAlt size={13} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => { navigate("/login"); setMenuOpen(false); }}>Login</button>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => { navigate("/Symptomchecker"); setMenuOpen(false); }}>Get Started</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav:        { background: "rgba(255,255,255,0.96)", borderBottom: "1px solid #e0ede6", position: "sticky", top: 0, zIndex: 100, transition: "box-shadow 0.3s", backdropFilter: "blur(10px)" },
  navScrolled:{ boxShadow: "0 2px 20px rgba(42,157,92,0.10)" },
  inner:      { maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 24 },
  logo:       { display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 },
  logoIcon:   { width: 38, height: 38, background: MINT_LIGHT, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText:   { fontSize: 19, fontWeight: 900, color: "#1a2e24", letterSpacing: "-0.3px" },
  links:      { display: "flex", gap: 4, listStyle: "none", margin: 0, padding: 0, flex: 1 },
  link:       { background: "none", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#3d5a48", cursor: "pointer", fontFamily: "inherit", position: "relative", transition: "background 0.15s" },
  linkActive: { color: MINT_DARK, background: MINT_LIGHT },
  linkDot:    { position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, background: MINT, borderRadius: "50%" },
  right:      { display: "flex", gap: 8, flexShrink: 0, alignItems: "center" },
  btnShop:    { background: "#fff8e6", color: "#b45309", border: "1.5px solid #f5d78a", borderRadius: 9, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 },
  btnOutline: { background: "transparent", color: MINT, border: `2px solid ${MINT}`, borderRadius: 9, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary: { background: MINT, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  hamburger:  { display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 },
  mobile:     { padding: "14px 24px 20px", borderTop: "1px solid #e0ede6", display: "flex", flexDirection: "column", gap: 4 },
  mobileLink: { background: "none", border: "none", textAlign: "left", padding: "10px 4px", fontSize: 15, fontWeight: 700, color: "#1a2e24", cursor: "pointer", fontFamily: "inherit", borderBottom: "1px solid #f0f5f2" },

  // ─── User pill (logged in) ───
  userPill: {
    display: "flex", alignItems: "center", gap: 9,
    background: MINT_LIGHT, border: "1.5px solid rgba(42,157,92,0.2)",
    borderRadius: 30, padding: "5px 12px 5px 5px",
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  avatar: {
    width: 32, height: 32, background: MINT,
    borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 900, color: "#fff",
    boxShadow: "0 2px 8px rgba(42,157,92,0.3)",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex", flexDirection: "column",
    alignItems: "flex-start", lineHeight: 1.15,
  },
  userName: { fontSize: 13, fontWeight: 800, color: MINT_DARK, whiteSpace: "nowrap" },
  userRole: { fontSize: 10, color: "#5a7a6a", fontWeight: 700, textTransform: "capitalize" },
  caret: { fontSize: 9, color: MINT_DARK, marginLeft: 2, transition: "transform 0.2s ease" },

  // ─── Dropdown ───
  dropdown: {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    background: "rgba(255,255,255,0.98)",
    backdropFilter: "blur(20px) saturate(140%)",
    WebkitBackdropFilter: "blur(20px) saturate(140%)",
    border: "1.5px solid rgba(224,237,230,0.8)",
    borderRadius: 12, padding: "8px 0",
    minWidth: 240,
    boxShadow: "0 12px 36px rgba(42,157,92,0.18), 0 2px 8px rgba(0,0,0,0.05)",
    zIndex: 200,
    animation: "bc-fadeInUp 0.2s cubic-bezier(0.22, 1, 0.36, 1) both",
  },
  dropdownHeader: { padding: "10px 16px" },
  dropdownName: { fontSize: 14, fontWeight: 800, color: "#0f2018", marginBottom: 2 },
  dropdownEmail: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600, wordBreak: "break-all" },
  dropdownDivider: { height: 1, background: "#f0f5f2", margin: "4px 0" },
  dropdownItem: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "10px 16px",
    background: "none", border: "none", textAlign: "left",
    color: "#1a2e24", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.15s",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "10px 16px",
    background: "none", border: "none", textAlign: "left",
    color: "#dc2626", fontSize: 13, fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.15s",
  },

  // ─── Mobile user section ───
  mobileUserCard: {
    display: "flex", alignItems: "center", gap: 12,
    background: MINT_LIGHT, border: "1px solid rgba(42,157,92,0.18)",
    borderRadius: 11, padding: "12px 14px",
    marginTop: 12, marginBottom: 6,
  },
  mobileUserName: { fontSize: 14, fontWeight: 800, color: MINT_DARK, marginBottom: 2 },
  mobileUserEmail: { fontSize: 11.5, color: "#5a7a6a", fontWeight: 600 },
  mobileAuthBtn: {
    display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", textAlign: "left",
    padding: "10px 4px", fontSize: 14, fontWeight: 700,
    color: "#1a2e24", cursor: "pointer", fontFamily: "inherit",
    borderBottom: "1px solid #f0f5f2",
  },
  mobileLogoutBtn: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#fee2e2", border: "1px solid #fca5a5",
    color: "#991b1b", borderRadius: 9, padding: "10px 14px",
    fontSize: 14, fontWeight: 800, cursor: "pointer",
    fontFamily: "inherit", marginTop: 10,
    justifyContent: "center",
  },
};