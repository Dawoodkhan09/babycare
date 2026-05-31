import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

export default function LoginRegister() {
  const [mode, setMode] = useState("login"); // "login" | "register"
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
        // ═══ LOGIN ═══
        const data = await login(form.email, form.password);

        setSuccess(true);

        setTimeout(() => {
          const cameFromProtectedRoute = from !== "/";

          if (data.user.role === "doctor") {
            navigate("/doctordashboard");
          } else if (data.user.role === "admin") {
            navigate("/AdminDashboard");
          } else if (cameFromProtectedRoute) {
            navigate(from, { replace: true });
          } else {
            navigate("/dashboard");
          }
        }, 1500);

      } else {
        // ═══ REGISTER ═══
        if (form.password !== form.confirm) {
          setError("Passwords match nahi karte!");
          setLoading(false);
          return;
        }

        const nameParts = form.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const data = await register({
          email: form.email,
          password: form.password,
          first_name: firstName,
          last_name: lastName,
          phone: form.phone,
        });

        setSuccess(true);

        setTimeout(() => {
          if (from !== "/") {
            navigate(from, { replace: true });
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Auth error:", err.response?.data);

      const errorData = err.response?.data;

      if (errorData?.detail) {
        setError(errorData.detail);
      } else if (errorData?.email) {
        setError("Yeh email pehle se registered hai.");
      } else if (errorData?.password) {
        setError("Password kam se kam 8 character ka hona chahiye.");
      } else {
        setError("Kuch problem aa gayi. Dobara try karein.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* LEFT PANEL */}
      <div style={s.left}>
        <div className="bc-orb" style={{ width: 320, height: 320, background: "#5fcf8f", top: "-80px", left: "-60px" }} />
        <div className="bc-orb" style={{ width: 260, height: 260, background: "#7ce0a4", bottom: "-60px", right: "-40px", animationDelay: "2s" }} />
        <div className="bc-orb" style={{ width: 180, height: 180, background: "#fff", top: "40%", right: "20%", opacity: 0.18, animationDelay: "4s" }} />

        <div style={s.leftInner} className="bc-anim-fadeRight">
          <div style={s.logo} className="bc-anim-fadeUp bc-d1">
            <div style={s.logoIcon} className="bc-float">🍼</div>
            <span style={s.logoText}>Baby<span style={{ color: "#a7f3c4" }}>Care</span></span>
          </div>
          <h2 style={s.leftTitle} className="bc-anim-fadeUp bc-d2">Your Baby's Health,<br />Our Priority.</h2>
          <p style={s.leftDesc} className="bc-anim-fadeUp bc-d3">Get trusted homeopathic & organic treatment suggestions. Connect with certified pediatric doctors — all in one place.</p>
          <div style={s.featureList}>
            {["🌿 Natural homeopathic remedies", "🥦 Organic treatment suggestions", "👨‍⚕️ Book certified doctors", "📋 Track health history"].map((f, i) => (
              <div key={f} style={s.featureItem} className={`bc-anim-fadeLeft bc-d${i + 3}`}>{f}</div>
            ))}
          </div>
          <div style={s.statRow} className="bc-anim-fadeUp bc-d7">
            {[["5K+", "Parents"], ["50+", "Doctors"], ["100%", "Safe"]].map(([v, l]) => (
              <div key={l} style={s.statItem}>
                <span style={s.statV}>{v}</span>
                <span style={s.statL}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.rightBgOrb} />

        <div style={s.card} className="bc-anim-scaleIn bc-d2">
          {/* Tab switcher */}
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(mode === "login" ? s.tabActive : {}) }}
              onClick={() => { setMode("login"); setSuccess(false); setError(""); }}
            >Login</button>
            <button
              style={{ ...s.tab, ...(mode === "register" ? s.tabActive : {}) }}
              onClick={() => { setMode("register"); setSuccess(false); setError(""); }}
            >Register</button>
          </div>

          {success ? (
            <div style={s.successBox} className="bc-anim-popIn">
              <div className="bc-check-pop" style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontWeight: 800, color: MINT_DARK, marginBottom: 8 }}>
                {mode === "login" ? "Login Successful!" : "Account Created!"}
              </h3>
              <p style={{ color: "#5a7a6a", fontSize: 14 }}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <div key={mode} className="bc-anim-fadeUp">
              <h2 style={s.cardTitle}>{mode === "login" ? "Welcome Back 👋" : "Create Account 🌿"}</h2>
              <p style={s.cardSub}>{mode === "login" ? "Login to your BabyCare account" : "Join thousands of parents today"}</p>

              {/* Error display */}
              {error && (
                <div style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  border: "1px solid #fca5a5",
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={s.formGroup}>
                {mode === "register" && (
                  <>
                    <label style={s.label}>Full Name</label>
                    <input name="name" value={form.name} onChange={handle} placeholder="e.g. Sara Ahmed" style={s.input} className="bc-input-glow" />
                    <label style={s.label}>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handle} placeholder="03XX-XXXXXXX" style={s.input} className="bc-input-glow" />
                  </>
                )}
                <label style={s.label}>Email Address</label>
                <input name="email" value={form.email} onChange={handle} placeholder="you@example.com" style={s.input} className="bc-input-glow" type="email" />
                <label style={s.label}>Password</label>
                <input name="password" value={form.password} onChange={handle} placeholder="••••••••" style={s.input} className="bc-input-glow" type="password" />
                {mode === "register" && (
                  <>
                    <label style={s.label}>Confirm Password</label>
                    <input name="confirm" value={form.confirm} onChange={handle} placeholder="••••••••" style={s.input} className="bc-input-glow" type="password" />
                  </>
                )}
              </div>

              {/* ⬇️ UPDATED: Forgot Password — ab actual route pe jata hai */}
              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: 8, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    style={s.forgotBtn}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                style={{ ...s.btnSubmit, opacity: loading ? 0.85 : 1 }}
                className="bc-btn-glow"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                    Please wait...
                  </span>
                ) : mode === "login" ? "Login to BabyCare →" : "Create My Account →"}
              </button>

              <div style={s.divider}><span style={s.dividerText}>or continue with</span></div>

              <button style={s.btnGoogle} className="bc-btn-outline-glow">
                <span style={{ fontSize: 18 }}>G</span> Continue with Google
              </button>

              <p style={s.switchText}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button style={s.switchBtn} onClick={() => { setMode(mode === "login" ? "register" : "login"); setSuccess(false); setError(""); }}>
                  {mode === "login" ? "Register here" : "Login here"}
                </button>
              </p>

              {/* Doctor signup link */}
              <div style={s.doctorSignupBox}>
                <span style={{ fontSize: 13, color: "#5a7a6a", fontWeight: 700 }}>
                  👨‍⚕️ Doctor hain?{" "}
                </span>
                <button
                  style={s.doctorSignupBtn}
                  onClick={() => navigate("/doctor-register")}
                >
                  Yahan register karein →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Nunito','Segoe UI',sans-serif" },
  left: {
    flex: "1 1 400px",
    background: `linear-gradient(145deg, ${MINT_DARK} 0%, ${MINT} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
    position: "relative", overflow: "hidden",
  },
  leftInner: { maxWidth: 420, position: "relative", zIndex: 2 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 40 },
  logoIcon: {
    width: 42, height: 42,
    background: "rgba(255,255,255,0.22)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22,
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
  logoText: { fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" },
  leftTitle: { fontSize: "clamp(26px,3vw,38px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" },
  leftDesc: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: 32 },
  featureList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 },
  featureItem: { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", gap: 8 },
  statRow: { display: "flex", gap: 32, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.25)" },
  statItem: { display: "flex", flexDirection: "column" },
  statV: { fontSize: 24, fontWeight: 900, color: "#fff" },
  statL: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 },

  right: {
    flex: "1 1 380px",
    background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
    position: "relative", overflow: "hidden",
  },
  rightBgOrb: {
    position: "absolute",
    width: 380, height: 380,
    background: "radial-gradient(circle, rgba(42,157,92,0.12) 0%, transparent 70%)",
    top: "-100px", right: "-80px",
    pointerEvents: "none",
  },

  card: {
    width: "100%", maxWidth: 420,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px) saturate(140%)",
    WebkitBackdropFilter: "blur(20px) saturate(140%)",
    borderRadius: 22,
    padding: "36px 32px",
    boxShadow: "0 12px 50px rgba(42,157,92,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset",
    border: "1.5px solid rgba(255,255,255,0.7)",
    position: "relative", zIndex: 2,
  },
  tabs: { display: "flex", background: MINT_LIGHT, borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 },
  tab: { flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "transparent", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#5a7a6a", fontFamily: "inherit", transition: "all 0.22s ease" },
  tabActive: { background: "#fff", color: MINT_DARK, boxShadow: "0 2px 10px rgba(42,157,92,0.18)" },
  cardTitle: { fontSize: 22, fontWeight: 900, color: "#0f2018", marginBottom: 6, letterSpacing: "-0.3px" },
  cardSub: { fontSize: 14, color: "#5a7a6a", marginBottom: 24 },
  formGroup: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 },
  label: { fontSize: 12.5, fontWeight: 700, color: "#3d5a48", marginTop: 12, marginBottom: 4 },
  input: { padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d4eddf", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1a2e24", background: "#fafffe" },

  // ⬇️ NEW: Forgot Password button styling
  forgotBtn: {
    background: "none",
    border: "none",
    color: MINT,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
    padding: 0,
    transition: "color 0.2s",
  },

  btnSubmit: {
    width: "100%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 11, padding: "13px",
    fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
    boxShadow: `0 4px 18px rgba(42,157,92,0.35)`,
  },
  divider: { display: "flex", alignItems: "center", margin: "20px 0", gap: 10 },
  dividerText: { fontSize: 12, color: "#9ab5a5", fontWeight: 600, whiteSpace: "nowrap", flex: 1, textAlign: "center", borderTop: "1px solid #e0ede6" },
  btnGoogle: {
    width: "100%", background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    border: "1.5px solid #d4eddf", borderRadius: 11, padding: "11px",
    fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#1a2e24",
  },
  switchText: { textAlign: "center", marginTop: 20, fontSize: 13.5, color: "#5a7a6a" },
  switchBtn: { background: "none", border: "none", color: MINT, fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  // Doctor signup section
  doctorSignupBox: {
    textAlign: "center",
    marginTop: 16,
    padding: "12px 16px",
    background: "rgba(232,248,239,0.5)",
    borderRadius: 10,
    border: "1px dashed #b2e0cc",
  },
  doctorSignupBtn: {
    background: "none",
    border: "none",
    color: MINT,
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "underline",
  },

  successBox: { textAlign: "center", padding: "32px 0" },
};