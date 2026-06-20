import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaStethoscope, FaBars, FaTimes, FaSignOutAlt, FaUserCircle,
  FaClipboardList, FaTachometerAlt, FaUserShield,
  FaExclamationCircle, FaCommentDots, FaShoppingCart,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const NAV_LINKS = [
  { label: "Home",            path: "/" },
  { label: "Symptom Checker", path: "/Symptomchecker" },
  { label: "Doctors",         path: "/DoctorBooking" },
  { label: "Shop",            path: "/Shop" },
  { label: "About",           path: "/About" },
];

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .nav-link {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 2px;
    background: #2a9d5c;
    transform: scaleX(0);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px;
  }
  .nav-link:hover {
    color: #1a6e3f !important;
  }
  .nav-link:hover::after {
    transform: scaleX(1);
  }
  .nav-link.active::after {
    transform: scaleX(1);
  }

  .nav-logo {
    transition: all 0.25s ease;
  }
  .nav-logo:hover .nav-logo-icon {
    transform: rotate(-8deg) scale(1.05);
    background: #2a9d5c !important;
  }
  .nav-logo:hover .nav-logo-icon svg {
    color: #fff !important;
  }
  .nav-logo-icon {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .nav-logo-icon svg {
    transition: color 0.3s;
  }

  .nav-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-btn-primary:hover {
    background: #0f4f2e !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(26,110,63,0.35) !important;
  }
  .nav-btn-primary:active {
    transform: translateY(0);
  }

  .nav-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-1px);
  }

  .nav-shop-btn {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-shop-btn:hover {
    background: #fef3c7 !important;
    border-color: #d97706 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(217,119,6,0.18);
  }

  .nav-user-pill {
    transition: all 0.2s ease;
  }
  .nav-user-pill:hover {
    background: #d4eddf !important;
    border-color: #2a9d5c !important;
  }
  .nav-user-pill:hover .nav-avatar {
    transform: scale(1.05);
  }
  .nav-avatar {
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nav-dropdown-item {
    transition: all 0.15s ease;
    position: relative;
  }
  .nav-dropdown-item:hover {
    background: #f4f9f6 !important;
    color: #1a6e3f !important;
    padding-left: 22px !important;
  }
  .nav-dropdown-item:hover .nav-dropdown-icon {
    transform: scale(1.15);
  }
  .nav-dropdown-icon {
    transition: transform 0.25s ease;
  }

  .nav-logout-btn {
    transition: all 0.15s ease;
  }
  .nav-logout-btn:hover {
    background: #fef2f2 !important;
  }

  .nav-hamburger {
    transition: all 0.2s ease;
  }
  .nav-hamburger:hover {
    background: #f4f9f6;
    transform: scale(1.05);
  }

  .nav-mobile-link {
    transition: all 0.2s ease;
  }
  .nav-mobile-link:hover {
    color: #1a6e3f !important;
    padding-left: 10px !important;
  }

  .nav-mobile-auth-btn {
    transition: all 0.2s ease;
  }
  .nav-mobile-auth-btn:hover {
    background: #f4f9f6 !important;
    padding-left: 12px !important;
  }

  @keyframes nav-dropdown-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .nav-dropdown {
    animation: nav-dropdown-in 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 920px) {
    .nav-links-desktop {
      display: none !important;
    }
    .nav-right-buttons {
      display: none !important;
    }
    .nav-hamburger {
      display: flex !important;
      margin-left: auto !important;
    }
  }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return "";
    if (user.first_name) return user.first_name;
    return user.email.split("@")[0];
  };

  return (
    <>
      <style>{hoverStyles}</style>

      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.inner}>

          {/* LOGO */}
          <div style={s.logo} className="nav-logo" onClick={() => navigate("/")}>
            <div style={s.logoIcon} className="nav-logo-icon">
              <FaStethoscope size={18} color={MINT_DARK} />
            </div>
            <span style={s.logoText}>
              Baby<span style={{ color: MINT_DARK }}>Care</span>
            </span>
          </div>

          {/* DESKTOP LINKS */}
          <ul style={s.links} className="nav-links-desktop">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.path)}
                  className={`nav-link ${isActive(l.path) ? "active" : ""}`}
                  style={{ ...s.link, ...(isActive(l.path) ? s.linkActive : {}) }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* RIGHT BUTTONS */}
          <div style={s.right} className="nav-right-buttons">
            <button style={s.btnShop} className="nav-shop-btn" onClick={() => navigate("/shop")}>
              <FaShoppingCart size={12} />
              Shop
            </button>

            {isAuthenticated ? (
              // ═══ LOGGED IN — USER PILL + DROPDOWN ═══
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  style={s.userPill}
                  className="nav-user-pill"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  <div style={s.avatar} className="nav-avatar">{getInitials()}</div>
                  <div style={s.userInfo}>
                    <span style={s.userName}>{getDisplayName()}</span>
                    <span style={s.userRole}>{user.role_display || user.role}</span>
                  </div>
                  <span style={{ ...s.caret, transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                </button>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div style={s.dropdown} className="nav-dropdown">
                    <div style={s.dropdownHeader}>
                      <div style={s.dropdownName}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={s.dropdownEmail}>{user.email}</div>
                      <div style={s.roleBadge}>
                        <FaUserShield size={9} />
                        {(user.role || "user").toUpperCase()}
                      </div>
                    </div>

                    <div style={s.dropdownDivider} />

                    {user.role === "doctor" && (
                      <button
                        style={s.dropdownItem}
                        className="nav-dropdown-item"
                        onClick={() => { navigate("/doctordashboard"); setDropdownOpen(false); }}
                      >
                        <FaTachometerAlt size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                        <span>Doctor Dashboard</span>
                      </button>
                    )}

                    {user.role === "admin" && (
                      <button
                        style={s.dropdownItem}
                        className="nav-dropdown-item"
                        onClick={() => { navigate("/AdminDashboard"); setDropdownOpen(false); }}
                      >
                        <FaUserShield size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    <button
                      style={s.dropdownItem}
                      className="nav-dropdown-item"
                      onClick={() => {
                        if (user.role === "doctor") navigate("/doctordashboard");
                        else if (user.role === "admin") navigate("/AdminDashboard");
                        else navigate("/dashboard");
                        setDropdownOpen(false);
                      }}
                    >
                      <FaTachometerAlt size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      style={s.dropdownItem}
                      className="nav-dropdown-item"
                      onClick={() => { navigate("/my-bookings"); setDropdownOpen(false); }}
                    >
                      <FaClipboardList size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                      <span>My Bookings</span>
                    </button>

                    <button
                      style={s.dropdownItem}
                      className="nav-dropdown-item"
                      onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                    >
                      <FaUserCircle size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                      <span>My Profile</span>
                    </button>

                    <div style={s.dropdownDivider} />

                    {user.role !== "admin" && (
                      <>
                        <button
                          style={s.dropdownItem}
                          className="nav-dropdown-item"
                          onClick={() => { navigate("/my-complaints"); setDropdownOpen(false); }}
                        >
                          <FaCommentDots size={13} color={MINT_DARK} className="nav-dropdown-icon" />
                          <span>My Complaints</span>
                        </button>

                        <button
                          style={s.dropdownItem}
                          className="nav-dropdown-item"
                          onClick={() => { navigate("/file-complaint"); setDropdownOpen(false); }}
                        >
                          <FaExclamationCircle size={13} color="#dc2626" className="nav-dropdown-icon" />
                          <span>File Complaint</span>
                        </button>

                        <div style={s.dropdownDivider} />
                      </>
                    )}

                    <button style={s.logoutBtn} className="nav-logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ═══ NOT LOGGED IN ═══
              <>
                <button style={s.btnOutline} className="nav-btn-outline" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <button style={s.btnPrimary} className="nav-btn-primary" onClick={() => navigate("/login")}>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* HAMBURGER */}
          <button style={s.hamburger} className="nav-hamburger" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <FaTimes size={18} color={TEXT_DARK} /> : <FaBars size={18} color={TEXT_DARK} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div style={s.mobile}>
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                style={{ ...s.mobileLink, ...(isActive(l.path) ? { color: MINT_DARK } : {}) }}
                className="nav-mobile-link"
                onClick={() => { navigate(l.path); setMenuOpen(false); }}
              >
                {l.label}
              </button>
            ))}

            {isAuthenticated ? (
              <>
                <div style={s.mobileUserCard}>
                  <div style={s.avatar}>{getInitials()}</div>
                  <div>
                    <div style={s.mobileUserName}>{user.first_name} {user.last_name}</div>
                    <div style={s.mobileUserEmail}>{user.email}</div>
                  </div>
                </div>

                {user.role === "doctor" && (
                  <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/doctordashboard"); setMenuOpen(false); }}>
                    <FaTachometerAlt size={13} color={MINT_DARK} /> Doctor Dashboard
                  </button>
                )}
                {user.role === "admin" && (
                  <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/AdminDashboard"); setMenuOpen(false); }}>
                    <FaUserShield size={13} color={MINT_DARK} /> Admin Panel
                  </button>
                )}

                <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/my-bookings"); setMenuOpen(false); }}>
                  <FaClipboardList size={13} color={MINT_DARK} /> My Bookings
                </button>
                <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                  <FaUserCircle size={13} color={MINT_DARK} /> My Profile
                </button>

                {user.role !== "admin" && (
                  <>
                    <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/my-complaints"); setMenuOpen(false); }}>
                      <FaCommentDots size={13} color={MINT_DARK} /> My Complaints
                    </button>
                    <button style={s.mobileAuthBtn} className="nav-mobile-auth-btn" onClick={() => { navigate("/file-complaint"); setMenuOpen(false); }}>
                      <FaExclamationCircle size={13} color="#dc2626" /> File Complaint
                    </button>
                  </>
                )}

                <button style={s.mobileLogoutBtn} onClick={handleLogout}>
                  <FaSignOutAlt size={13} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button style={{ ...s.btnOutline, flex: 1 }} className="nav-btn-outline" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                  Sign In
                </button>
                <button style={{ ...s.btnPrimary, flex: 1 }} className="nav-btn-primary" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

const s = {
  nav: {
    background: "rgba(255,255,255,0.92)",
    borderBottom: `1px solid ${BORDER}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    transition: "all 0.3s",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
  },
  navScrolled: {
    background: "rgba(255,255,255,0.98)",
    boxShadow: "0 2px 16px rgba(15,32,24,0.06)",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 68,
    display: "flex",
    alignItems: "center",
    gap: 32,
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
  },

  // LOGO
  logo: { display: "flex", alignItems: "center", gap: 11, cursor: "pointer", flexShrink: 0 },
  logoIcon: {
    width: 40,
    height: 40,
    background: MINT_LIGHT,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${BORDER}`,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.5px",
  },

  // LINKS
  links: {
    display: "flex",
    gap: 2,
    listStyle: "none",
    margin: 0,
    padding: 0,
    flex: 1,
    justifyContent: "center",
  },
  link: {
    background: "none",
    border: "none",
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_BODY,
    cursor: "pointer",
    fontFamily: "inherit",
    position: "relative",
  },
  linkActive: { color: MINT_DARK, fontWeight: 700 },

  // RIGHT
  right: { display: "flex", gap: 8, flexShrink: 0, alignItems: "center" },
  btnShop: {
    background: "#fff",
    color: "#92400e",
    border: "1.5px solid #fde68a",
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  btnOutline: {
    background: "#fff",
    color: TEXT_DARK,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 9,
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "9px 18px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },

  // HAMBURGER
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // MOBILE
  mobile: {
    padding: "14px 24px 20px",
    borderTop: `1px solid ${BORDER}`,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    background: "#fff",
  },
  mobileLink: {
    background: "none",
    border: "none",
    textAlign: "left",
    padding: "12px 4px",
    fontSize: 15,
    fontWeight: 700,
    color: TEXT_DARK,
    cursor: "pointer",
    fontFamily: "inherit",
    borderBottom: `1px solid ${BORDER}`,
  },

  // USER PILL
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: MINT_LIGHT,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 30,
    padding: "5px 14px 5px 5px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  avatar: {
    width: 32,
    height: 32,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(42,157,92,0.3)",
    flexShrink: 0,
  },
  userInfo: { display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15 },
  userName: { fontSize: 13, fontWeight: 800, color: TEXT_DARK, whiteSpace: "nowrap" },
  userRole: { fontSize: 10.5, color: TEXT_MUTED, fontWeight: 700, textTransform: "capitalize" },
  caret: { fontSize: 11, color: MINT_DARK, marginLeft: 2, transition: "transform 0.2s ease" },

  // DROPDOWN
  dropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "10px 0",
    minWidth: 260,
    boxShadow: "0 12px 40px rgba(15,32,24,0.12), 0 0 0 1px rgba(15,32,24,0.04)",
    zIndex: 200,
  },
  dropdownHeader: { padding: "10px 18px 14px" },
  dropdownName: { fontSize: 14.5, fontWeight: 800, color: TEXT_DARK, marginBottom: 3, letterSpacing: "-0.2px" },
  dropdownEmail: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600, wordBreak: "break-all", marginBottom: 8 },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 10.5,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  dropdownDivider: { height: 1, background: BORDER, margin: "4px 12px" },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    padding: "10px 18px",
    background: "none",
    border: "none",
    textAlign: "left",
    color: TEXT_DARK,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    width: "100%",
    padding: "10px 18px",
    background: "none",
    border: "none",
    textAlign: "left",
    color: "#dc2626",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // MOBILE USER
  mobileUserCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: MINT_LIGHT,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "12px 14px",
    marginTop: 14,
    marginBottom: 8,
  },
  mobileUserName: { fontSize: 14, fontWeight: 800, color: TEXT_DARK, marginBottom: 2 },
  mobileUserEmail: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600 },
  mobileAuthBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "none",
    border: "none",
    textAlign: "left",
    padding: "12px 4px",
    fontSize: 14,
    fontWeight: 700,
    color: TEXT_DARK,
    cursor: "pointer",
    fontFamily: "inherit",
    borderBottom: `1px solid ${BORDER}`,
  },
  mobileLogoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 12,
    justifyContent: "center",
  },
};