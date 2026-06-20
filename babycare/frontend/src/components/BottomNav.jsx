import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserMd, FaStethoscope, FaShoppingCart, FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const MINT_DARK  = "#1a6e3f";
const MINT_LIGHT = "#e8f8ef";
const TEXT_MUTED = "#5a7a6a";
const BORDER     = "#e0ede6";

const BASE_ITEMS = [
  { label: "Home",    Icon: FaHome,         path: "/" },
  { label: "Doctors", Icon: FaUserMd,       path: "/DoctorBooking" },
  { label: "Symptoms",Icon: FaStethoscope,  path: "/Symptomchecker" },
  { label: "Shop",    Icon: FaShoppingCart, path: "/Shop" },
  { label: "Me",      Icon: FaUser,         path: null },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getMePath = () => {
    if (!isAuthenticated) return "/login";
    if (user?.role === "doctor") return "/doctordashboard";
    if (user?.role === "admin") return "/AdminDashboard";
    return "/dashboard";
  };

  const getPath = (item) => item.path ?? getMePath();

  const isActive = (item) => {
    const path = getPath(item);
    if (path === "/") return location.pathname === "/" || location.pathname === "/home";
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <nav className="bc-bottom-nav" style={s.nav}>
      {BASE_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <button
            key={item.label}
            onClick={() => navigate(getPath(item))}
            style={s.item}
            aria-label={item.label}
          >
            <div style={{ ...s.iconWrap, ...(active ? s.iconWrapActive : {}) }}>
              <item.Icon size={20} color={active ? MINT_DARK : TEXT_MUTED} />
            </div>
            <span style={{ ...s.label, color: active ? MINT_DARK : TEXT_MUTED }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const s = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTop: `1px solid ${BORDER}`,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-around",
    zIndex: 98,
    boxShadow: "0 -4px 20px rgba(15,32,24,0.07)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    height: "calc(64px + env(safe-area-inset-bottom, 0px))",
  },
  item: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 2px",
    minHeight: 44,
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    WebkitTapHighlightColor: "transparent",
  },
  iconWrap: {
    width: 44,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    transition: "background 0.18s ease",
  },
  iconWrapActive: {
    background: MINT_LIGHT,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.2,
    lineHeight: 1,
  },
};
