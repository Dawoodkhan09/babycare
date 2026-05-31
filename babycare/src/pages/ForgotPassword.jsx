import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../api/auth";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);   // 1 = email, 2 = OTP, 3 = new password, 4 = success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugOtp, setDebugOtp] = useState(""); // Development OTP show karne ke liye

  // ─── Step 1: Request OTP ───
  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await requestPasswordReset(email);
      // Dev mode mein OTP dikha do (helpful for testing)
      if (res.debug_otp) setDebugOtp(res.debug_otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Email send nahi hua. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");

    try {
      await verifyResetOTP(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Galat OTP. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ───
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords match nahi karte!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password kam se kam 8 character ka hona chahiye");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || "Password reset fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />
      <div className="bc-orb" style={{ width: 260, height: 260, background: "#d1f5e0", bottom: "10%", left: "-60px", animationDelay: "3s" }} />

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header} className="bc-anim-fadeUp">
          <div style={s.logo}>
            <span style={s.logoEmoji} className="bc-float">🔐</span>
            <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span></span>
          </div>
          <p style={s.tagline}>Password Recovery</p>
        </div>

        {/* PROGRESS INDICATOR */}
        {step < 4 && (
          <div style={s.progress} className="bc-anim-fadeUp bc-d1">
            {["Email", "Verify OTP", "New Password"].map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={s.progStep}>
                    <div
                      className={active ? "bc-glow-pulse" : ""}
                      style={{
                        ...s.progDot,
                        background: done || active ? MINT : "#e0ede6",
                        color: done || active ? "#fff" : "#9ab5a5",
                      }}
                    >
                      {done ? "✓" : num}
                    </div>
                    <span style={{ ...s.progLabel, color: active ? MINT_DARK : done ? MINT : "#9ab5a5" }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ ...s.progLine, background: step > num ? MINT : "#e0ede6" }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ STEP 1: EMAIL ═══════════════ */}
        {step === 1 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <h2 style={s.cardTitle}>Forgot Your Password? 🤔</h2>
            <p style={s.cardSub}>Koi baat nahi! Apna email enter karein aur hum aap ko OTP bhejenge.</p>

            <label style={s.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={s.input}
              className="bc-input-glow"
              autoFocus
            />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <button
              style={{ ...s.btnPrimary, opacity: email && !loading ? 1 : 0.5 }}
              className={email && !loading ? "bc-btn-glow" : ""}
              disabled={!email || loading}
              onClick={handleRequestOTP}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                  Sending OTP...
                </span>
              ) : "Send OTP →"}
            </button>

            <p style={s.linkText}>
              Password yaad aa gaya?{" "}
              <button style={s.linkBtn} onClick={() => navigate("/login")}>Back to Login</button>
            </p>
          </div>
        )}

        {/* ═══════════════ STEP 2: VERIFY OTP ═══════════════ */}
        {step === 2 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <button style={s.backBtn} onClick={() => { setStep(1); setOtp(""); setError(""); }}>← Back</button>

            <h2 style={s.cardTitle}>Check Your Email 📧</h2>
            <p style={s.cardSub}>
              Hum ne <strong>{email}</strong> par 6-digit OTP code bheja hai.
              <br />
              Yeh code 10 minutes ke liye valid hai.
            </p>

            {/* DEV MODE: Show OTP from backend */}
            {debugOtp && (
              <div style={s.devBox}>
                <strong>🔧 Dev Mode:</strong> Your OTP is <code style={s.codeBox}>{debugOtp}</code>
                <br />
                <small>(Production mein yeh real email mein bhejega)</small>
              </div>
            )}

            <label style={s.label}>Enter 6-Digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              style={{ ...s.input, fontSize: 22, letterSpacing: 8, textAlign: "center", fontWeight: 900 }}
              className="bc-input-glow"
              maxLength={6}
              autoFocus
            />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <button
              style={{ ...s.btnPrimary, opacity: otp.length === 6 && !loading ? 1 : 0.5 }}
              className={otp.length === 6 && !loading ? "bc-btn-glow" : ""}
              disabled={otp.length !== 6 || loading}
              onClick={handleVerifyOTP}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                  Verifying...
                </span>
              ) : "Verify OTP →"}
            </button>

            <p style={s.linkText}>
              OTP nahi mila?{" "}
              <button style={s.linkBtn} onClick={() => { setStep(1); setOtp(""); setDebugOtp(""); }}>
                Resend OTP
              </button>
            </p>
          </div>
        )}

        {/* ═══════════════ STEP 3: NEW PASSWORD ═══════════════ */}
        {step === 3 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <h2 style={s.cardTitle}>Set New Password 🔒</h2>
            <p style={s.cardSub}>Apna naya password choose karein. Yeh kam se kam 8 character ka hona chahiye.</p>

            <label style={s.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Naya password (min 8 chars)"
              style={s.input}
              className="bc-input-glow"
              autoFocus
            />

            <label style={s.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Wahi password dobara"
              style={s.input}
              className="bc-input-glow"
            />

            {/* Password strength indicator */}
            {newPassword && (
              <div style={s.strengthBox}>
                <div style={{ fontSize: 11, color: "#5a7a6a", fontWeight: 700, marginBottom: 6 }}>
                  Password Strength:
                </div>
                <div style={s.strengthRow}>
                  <CheckItem ok={newPassword.length >= 8} text="At least 8 characters" />
                  <CheckItem ok={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
                  <CheckItem ok={/[0-9]/.test(newPassword)} text="One number" />
                  <CheckItem ok={newPassword === confirmPassword && newPassword} text="Passwords match" />
                </div>
              </div>
            )}

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <button
              style={{
                ...s.btnPrimary,
                opacity: newPassword.length >= 8 && newPassword === confirmPassword && !loading ? 1 : 0.5,
              }}
              className={newPassword.length >= 8 && newPassword === confirmPassword && !loading ? "bc-btn-glow" : ""}
              disabled={newPassword.length < 8 || newPassword !== confirmPassword || loading}
              onClick={handleResetPassword}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                  Updating...
                </span>
              ) : "Reset Password →"}
            </button>
          </div>
        )}

        {/* ═══════════════ STEP 4: SUCCESS ═══════════════ */}
        {step === 4 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <div style={s.successWrap}>
              <div className="bc-check-pop" style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
              <h2 style={s.successTitle}>Password Changed! 🎉</h2>
              <p style={s.successText}>
                Aap ka password successfully reset ho gaya hai.
                <br />
                Ab apne naye password se login kar sakte hain.
              </p>
              <button
                style={{ ...s.btnPrimary, width: "100%" }}
                className="bc-btn-glow"
                onClick={() => navigate("/login")}
              >
                Login Now →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ ok, text }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, fontWeight: 700,
      color: ok ? MINT : "#9ab5a5",
    }}>
      <span style={{ fontSize: 14 }}>{ok ? "✅" : "⭕"}</span>
      {text}
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)",
    fontFamily: "'Nunito','Segoe UI',sans-serif",
    position: "relative", overflow: "hidden",
    padding: "40px 20px",
    display: "flex",
    alignItems: "center",
  },
  container: { maxWidth: 480, width: "100%", margin: "0 auto", position: "relative", zIndex: 2 },

  header: { textAlign: "center", marginBottom: 28 },
  logo: { display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 },
  logoEmoji: { fontSize: 32 },
  logoText: { fontSize: 24, fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px" },
  tagline: { fontSize: 14, color: "#5a7a6a", margin: 0 },

  progress: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  progStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  progDot: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 },
  progLabel: { fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" },
  progLine: { width: 60, height: 2, margin: "0 8px", marginBottom: 22 },

  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    border: "1.5px solid rgba(255,255,255,0.7)",
    borderRadius: 20, padding: "36px 32px",
    boxShadow: "0 12px 40px rgba(42,157,92,0.15)",
  },
  backBtn: { background: "none", border: "none", color: MINT, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 12, padding: 0 },
  cardTitle: { fontSize: 22, fontWeight: 900, color: "#0f2018", margin: "0 0 8px", letterSpacing: "-0.3px" },
  cardSub: { fontSize: 14, color: "#5a7a6a", margin: "0 0 24px", lineHeight: 1.6 },

  label: { display: "block", fontSize: 13, fontWeight: 800, color: "#3d5a48", marginBottom: 8, marginTop: 16 },
  input: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 10, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "rgba(250,255,254,0.7)", boxSizing: "border-box" },

  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginTop: 16, border: "1px solid #fca5a5" },

  devBox: { background: "#fef3c7", border: "1.5px dashed #fde68a", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "#7a5a10", marginBottom: 16, marginTop: 16 },
  codeBox: { background: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 16, fontWeight: 900, color: "#7a5a10", letterSpacing: 2, fontFamily: "monospace" },

  btnPrimary: {
    width: "100%",
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 11,
    padding: "14px 26px", fontWeight: 800, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 18px rgba(42,157,92,0.35)",
    marginTop: 24,
  },

  linkText: { textAlign: "center", margin: "16px 0 0", fontSize: 13.5, color: "#5a7a6a" },
  linkBtn: { background: "none", border: "none", color: MINT, fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  strengthBox: { background: "rgba(250,255,254,0.6)", border: "1px solid #d4eddf", borderRadius: 10, padding: "12px 14px", marginTop: 12 },
  strengthRow: { display: "flex", flexDirection: "column", gap: 6 },

  successWrap: { textAlign: "center" },
  successTitle: { fontSize: 24, fontWeight: 900, color: "#0f2018", marginBottom: 12, letterSpacing: "-0.5px" },
  successText: { fontSize: 14.5, color: "#5a7a6a", lineHeight: 1.7, marginBottom: 24 },
};
