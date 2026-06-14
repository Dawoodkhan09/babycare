import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaStethoscope, FaShieldAlt, FaArrowRight, FaCheckCircle,
  FaUserMd, FaLeaf, FaAward, FaLock, FaEnvelope, FaPhone,
  FaUser, FaKey,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .login-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .login-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .login-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-btn-google {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .login-btn-google:hover {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(42,157,92,0.1);
  }

  .login-input {
    transition: all 0.2s ease;
  }
  .login-input:focus {
    border-color: #2a9d5c !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    background: #fff !important;
  }

  .login-input-wrap {
    transition: all 0.2s ease;
  }
  .login-input-wrap:focus-within {
    transform: translateY(-1px);
  }

  .login-tab {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .login-tab:hover:not(.active) {
    color: #2a9d5c;
  }

  .login-link {
    transition: color 0.2s ease;
  }
  .login-link:hover {
    color: #1a6e3f !important;
  }

  .login-forgot-link {
    transition: all 0.2s ease;
  }
  .login-forgot-link:hover {
    color: #1a6e3f !important;
    text-decoration: underline !important;
  }

  .login-doctor-card {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .login-doctor-card:hover {
    background: rgba(232,248,239,0.7) !important;
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(42,157,92,0.12);
  }

  .login-feature-item {
    transition: all 0.2s ease;
  }
  .login-feature-item:hover .login-feature-icon {
    transform: scale(1.1) rotate(-5deg);
    background: rgba(255,255,255,0.25) !important;
  }
  .login-feature-icon {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }
  .login-status-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @media (max-width: 968px) {
    .login-root {
      flex-direction: column !important;
    }
    .login-left {
      display: none !important;
    }
  }
`;

export default function LoginRegister() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [error, setError] = useState("");
  const from = location.state?.from?.pathname || "/";

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const data = await login(form.email, form.password);
        setSuccess(true);

        setTimeout(() => {
          const cameFromProtectedRoute = from !== "/";
          if (data.user.role === "doctor") navigate("/doctordashboard");
          else if (data.user.role === "admin") navigate("/AdminDashboard");
          else if (cameFromProtectedRoute) navigate(from, { replace: true });
          else navigate("/dashboard");
        }, 1500);

      } else {
        if (form.password !== form.confirm) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        const nameParts = form.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await register({
          email: form.email,
          password: form.password,
          first_name: firstName,
          last_name: lastName,
          phone: form.phone,
        });

        setSuccess(true);

        setTimeout(() => {
          if (from !== "/") navigate(from, { replace: true });
          else navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Auth error:", err.response?.data);
      const errorData = err.response?.data;
      if (errorData?.detail) setError(errorData.detail);
      else if (errorData?.email) setError("Yeh email pehle se registered hai.");
      else if (errorData?.password) setError("Password must be at least 8 characters long.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root} className="login-root">
      <style>{hoverStyles}</style>

      {/* ═══ LEFT PANEL — Brand & Trust ═══ */}
      <div style={s.left} className="login-left">
        <div style={s.leftInner}>

          {/* Logo */}
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <FaStethoscope size={20} color="#fff" />
            </div>
            <span style={s.logoText}>
              Baby<span style={{ color: "#a7f3c4" }}>Care</span>
            </span>
          </div>

          {/* Trust Badge */}
          <div style={s.trustBadge}>
            <HiOutlineShieldCheck size={14} color="#fff" />
            <span>PMDC Verified Platform</span>
          </div>

          {/* Title */}
          <h2 style={s.leftTitle}>
            Pakistan's Most Trusted<br />
            Pediatric Healthcare<br />
            Platform
          </h2>

          <p style={s.leftDesc}>
            Connect with certified pediatric specialists, access evidence-based
            homeopathic treatments, and manage your child's healthcare — all
            in one secure platform.
          </p>

          {/* Feature list */}
          <div style={s.features}>
            {[
              { Icon: FaUserMd,    text: "PMDC verified doctors" },
              { Icon: FaLeaf,      text: "Evidence-based treatments" },
              { Icon: FaLock,      text: "SSL encrypted & HIPAA compliant" },
              { Icon: FaAward,     text: "Trusted by 5,000+ Pakistani parents" },
            ].map(({ Icon, text }, i) => (
              <div key={text} style={s.feature} className="login-feature-item">
                <div style={s.featureIconBox} className="login-feature-icon">
                  <Icon size={13} color="#fff" />
                </div>
                <span style={s.featureText}>{text}</span>
              </div>
            ))}
          </div>

          {/* Stats footer */}
          <div style={s.statsFooter}>
            <div style={s.statsHeader}>
              <div style={s.statusDot} className="login-status-dot" />
              <span style={s.statsLabel}>Live Platform Status</span>
            </div>
            <div style={s.statsRow}>
              {[["5,000+", "Parents"], ["50+", "Doctors"], ["98%", "Satisfaction"]].map(([v, l]) => (
                <div key={l} style={s.statItem}>
                  <div style={s.statValue}>{v}</div>
                  <div style={s.statLabel}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div style={s.right}>
        <div style={s.formWrap}>

          {/* Mobile Logo (visible only on mobile) */}
          <div style={s.mobileLogo}>
            <div style={{ ...s.logoIcon, background: MINT_DARK }}>
              <FaStethoscope size={20} color="#fff" />
            </div>
            <span style={{ ...s.logoText, color: TEXT_DARK }}>
              Baby<span style={{ color: MINT }}>Care</span>
            </span>
          </div>

          <div style={s.card}>
            {/* Tabs */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(mode === "login" ? s.tabActive : {}) }}
                className={`login-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setSuccess(false); setError(""); }}
              >
                Sign In
              </button>
              <button
                style={{ ...s.tab, ...(mode === "register" ? s.tabActive : {}) }}
                className={`login-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => { setMode("register"); setSuccess(false); setError(""); }}
              >
                Create Account
              </button>
            </div>

            {success ? (
              <div style={s.successBox}>
                <div style={s.successIcon}>
                  <FaCheckCircle size={48} color={MINT} />
                </div>
                <h3 style={s.successTitle}>
                  {mode === "login" ? "Sign In Successful" : "Account Created"}
                </h3>
                <p style={s.successText}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                <h2 style={s.cardTitle}>
                  {mode === "login" ? "Welcome Back" : "Create Your Account"}
                </h2>
                <p style={s.cardSub}>
                  {mode === "login"
                    ? "Sign in to access your healthcare dashboard"
                    : "Join thousands of Pakistani parents today"}
                </p>

                {error && (
                  <div style={s.errorBox}>
                    <span style={{ fontSize: 14 }}>⚠️</span>
                    {error}
                  </div>
                )}

                <div style={s.formGroup}>
                  {mode === "register" && (
                    <>
                      <FormField
                        label="Full Name"
                        Icon={FaUser}
                        name="name"
                        value={form.name}
                        onChange={handle}
                        placeholder="Sara Ahmed"
                      />
                      <FormField
                        label="Phone Number"
                        Icon={FaPhone}
                        name="phone"
                        value={form.phone}
                        onChange={handle}
                        placeholder="0300-1234567"
                      />
                    </>
                  )}

                  <FormField
                    label="Email Address"
                    Icon={FaEnvelope}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handle}
                    placeholder="you@example.com"
                  />

                  <FormField
                    label="Password"
                    Icon={FaKey}
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Enter your password"
                  />

                  {mode === "register" && (
                    <FormField
                      label="Confirm Password"
                      Icon={FaKey}
                      name="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={handle}
                      placeholder="Re-enter password"
                    />
                  )}
                </div>

                {mode === "login" && (
                  <div style={s.forgotRow}>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      style={s.forgotBtn}
                      className="login-forgot-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  style={{ ...s.btnSubmit, opacity: loading ? 0.7 : 1 }}
                  className="login-btn-primary"
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                      Please wait...
                    </span>
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <FaArrowRight size={12} />
                    </>
                  )}
                </button>

                <div style={s.divider}>
                  <span style={s.dividerText}>or continue with</span>
                </div>

                <button style={s.btnGoogle} className="login-btn-google">
                  <span style={s.googleG}>G</span>
                  Continue with Google
                </button>

                <p style={s.switchText}>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    style={s.switchBtn}
                    className="login-link"
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setSuccess(false); setError(""); }}
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>

                {/* Doctor signup card */}
                <div style={s.doctorCard} className="login-doctor-card" onClick={() => navigate("/doctor-register")}>
                  <div style={s.doctorIconBox}>
                    <FaUserMd size={16} color={MINT_DARK} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.doctorTitle}>Are you a healthcare professional?</div>
                    <div style={s.doctorSub}>Register as a doctor on our platform</div>
                  </div>
                  <FaArrowRight size={12} color={MINT_DARK} />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <FaShieldAlt size={11} color={TEXT_MUTED} />
            <span>Secured by SSL Encryption · HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ Form Field Component ═══════════════
function FormField({ label, Icon, ...inputProps }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={s.label}>{label}</label>
      <div style={s.inputWrap} className="login-input-wrap">
        <Icon size={14} color={TEXT_MUTED} style={s.inputIcon} />
        <input
          {...inputProps}
          style={s.input}
          className="login-input"
        />
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    background: "#fff",
  },

  // ═══════════════ LEFT PANEL ═══════════════
  left: {
    flex: "1 1 480px",
    background: `linear-gradient(145deg, ${MINT_DARK} 0%, ${MINT} 100%)`,
    display: "flex",
    alignItems: "center",
    padding: "48px 48px",
    position: "relative",
    overflow: "hidden",
  },
  leftInner: {
    maxWidth: 460,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  logoIcon: {
    width: 44,
    height: 44,
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "6px 13px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  leftTitle: {
    fontSize: "clamp(28px, 3vw, 38px)",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.15,
    letterSpacing: "-1px",
    marginBottom: 18,
  },
  leftDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.7,
    marginBottom: 32,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 32,
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "4px 0",
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    fontWeight: 600,
  },
  statsFooter: {
    paddingTop: 26,
    borderTop: "1px solid rgba(255,255,255,0.2)",
  },
  statsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#5fcf8f",
    boxShadow: "0 0 0 4px rgba(95,207,143,0.3)",
  },
  statsLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statsRow: {
    display: "flex",
    gap: 32,
  },
  statItem: {},
  statValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 600,
    marginTop: 3,
  },

  // ═══════════════ RIGHT PANEL ═══════════════
  right: {
    flex: "1 1 480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    background: "#fafffe",
  },
  formWrap: {
    width: "100%",
    maxWidth: 440,
  },
  mobileLogo: {
    display: "none",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 12px 40px rgba(15,32,24,0.06)",
  },

  // Tabs
  tabs: {
    display: "flex",
    background: "#f4f9f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: "10px",
    borderRadius: 7,
    border: "none",
    background: "transparent",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    color: TEXT_MUTED,
    fontFamily: "inherit",
  },
  tabActive: {
    background: "#fff",
    color: MINT_DARK,
    boxShadow: "0 2px 8px rgba(15,32,24,0.08)",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  cardSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 24,
  },

  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 18,
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 12.5,
    fontWeight: 700,
    color: TEXT_BODY,
    marginBottom: 7,
    display: "block",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    pointerEvents: "none",
    zIndex: 2,
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    borderRadius: 10,
    border: `1.5px solid ${BORDER}`,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: TEXT_DARK,
    background: "#fafffe",
    boxSizing: "border-box",
  },

  forgotRow: {
    textAlign: "right",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: MINT_DARK,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
  },

  btnSubmit: {
    width: "100%",
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "13px",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  divider: {
    position: "relative",
    margin: "22px 0",
    textAlign: "center",
  },
  dividerText: {
    background: "#fff",
    padding: "0 12px",
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    position: "relative",
    zIndex: 2,
    display: "inline-block",
  },

  btnGoogle: {
    width: "100%",
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 11,
    padding: "11px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleG: {
    background: "linear-gradient(135deg, #4285f4 0%, #ea4335 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 900,
    fontSize: 18,
  },

  switchText: {
    textAlign: "center",
    marginTop: 22,
    fontSize: 13.5,
    color: TEXT_MUTED,
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: MINT_DARK,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
  },

  doctorCard: {
    marginTop: 22,
    padding: "14px 16px",
    background: "#fafffe",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  doctorIconBox: {
    width: 36,
    height: 36,
    background: MINT_LIGHT,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  doctorTitle: {
    fontSize: 13.5,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  doctorSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 600,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },

  successBox: {
    textAlign: "center",
    padding: "40px 0",
  },
  successIcon: {
    width: 72,
    height: 72,
    margin: "0 auto 20px",
    background: MINT_LIGHT,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
};