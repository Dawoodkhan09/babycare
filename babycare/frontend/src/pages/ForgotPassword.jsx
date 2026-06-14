import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaEnvelope, FaKey, FaShieldAlt, FaCheckCircle,
  FaArrowRight, FaArrowLeft, FaLock, FaInfoCircle,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../api/auth";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const hoverStyles = `
  .fp-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .fp-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .fp-btn-outline { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .fp-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .fp-input { transition: all 0.2s ease; }
  .fp-input:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    outline: none;
  }

  .fp-otp-input { transition: all 0.2s ease; }
  .fp-otp-input:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    transform: scale(1.05);
    outline: none;
  }

  .fp-link { transition: color 0.2s ease; }
  .fp-link:hover { color: #1a6e3f !important; }

  @keyframes pop-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .fp-pop { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
`;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugOtp, setDebugOtp] = useState("");

  // ─── Step 1: Request OTP ───
  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await requestPasswordReset(email);
      if (res.debug_otp) setDebugOtp(res.debug_otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send email. Please try again.");
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
      setError(err.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ───
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header}>
          <div style={s.logo} onClick={() => navigate("/")}>
            <div style={s.logoIcon}>
              <FaStethoscope size={18} color={MINT_DARK} />
            </div>
            <span style={s.logoText}>
              Baby<span style={{ color: MINT_DARK }}>Care</span>
            </span>
          </div>
        </div>

        {/* CARD */}
        <div style={s.card}>

          {/* TITLE & PROGRESS */}
          {step < 4 && (
            <>
              <div style={s.titleSection}>
                <div style={s.titleIcon}>
                  <FaLock size={20} color={MINT_DARK} />
                </div>
                <h1 style={s.title}>Password Recovery</h1>
                <p style={s.subtitle}>
                  {step === 1 && "We'll send a verification code to your email"}
                  {step === 2 && "Enter the 6-digit OTP sent to your email"}
                  {step === 3 && "Set a new secure password"}
                </p>
              </div>

              {/* PROGRESS */}
              <div style={s.progress}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={s.progItem}>
                    <div style={{
                      ...s.progDot,
                      background: step >= n ? MINT_DARK : "#fff",
                      color: step >= n ? "#fff" : TEXT_MUTED,
                      borderColor: step >= n ? MINT_DARK : BORDER,
                    }}>
                      {step > n ? <FaCheckCircle size={11} /> : n}
                    </div>
                    {n < 3 && (
                      <div style={{
                        ...s.progLine,
                        background: step > n ? MINT_DARK : BORDER,
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 1 - EMAIL */}
          {step === 1 && (
            <>
              <label style={s.label}>Registered Email Address</label>
              <div style={s.inputWrap}>
                <FaEnvelope size={14} color={TEXT_MUTED} style={s.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={s.input}
                  className="fp-input"
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={s.errorBox}>
                  <FaInfoCircle size={12} color="#dc2626" />
                  {error}
                </div>
              )}

              <button
                onClick={handleRequestOTP}
                disabled={loading || !email}
                style={{ ...s.btnPrimary, opacity: loading || !email ? 0.5 : 1 }}
                className="fp-btn-primary"
              >
                {loading ? "Sending..." : (
                  <>
                    Send Verification Code
                    <FaArrowRight size={11} />
                  </>
                )}
              </button>

              <div style={s.helperBox}>
                <HiOutlineShieldCheck size={13} color={MINT_DARK} />
                <span>OTP 10 minutes ke liye valid hota hai</span>
              </div>

              <button
                onClick={() => navigate("/login")}
                style={s.linkBtn}
                className="fp-link"
              >
                ← Back to Login
              </button>
            </>
          )}

          {/* STEP 2 - OTP */}
          {step === 2 && (
            <>
              <div style={s.emailDisplay}>
                <FaEnvelope size={12} color={MINT_DARK} />
                <span>Code sent to <strong>{email}</strong></span>
              </div>

              {debugOtp && (
                <div style={s.debugBox}>
                  <FaInfoCircle size={12} color="#7a5a10" />
                  <span><strong>Dev Mode:</strong> Your OTP is <strong>{debugOtp}</strong></span>
                </div>
              )}

              <label style={s.label}>Enter 6-Digit OTP</label>
              <div style={s.inputWrap}>
                <FaKey size={14} color={TEXT_MUTED} style={s.inputIcon} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ ...s.input, ...s.otpInput }}
                  className="fp-otp-input"
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={s.errorBox}>
                  <FaInfoCircle size={12} color="#dc2626" />
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                style={{ ...s.btnPrimary, opacity: loading || otp.length !== 6 ? 0.5 : 1 }}
                className="fp-btn-primary"
              >
                {loading ? "Verifying..." : (
                  <>
                    Verify Code
                    <FaArrowRight size={11} />
                  </>
                )}
              </button>

              <button
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
                style={s.linkBtn}
                className="fp-link"
              >
                ← Change Email Address
              </button>
            </>
          )}

          {/* STEP 3 - NEW PASSWORD */}
          {step === 3 && (
            <>
              <label style={s.label}>New Password</label>
              <div style={s.inputWrap}>
                <FaLock size={14} color={TEXT_MUTED} style={s.inputIcon} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={s.input}
                  className="fp-input"
                  disabled={loading}
                />
              </div>

              <label style={s.label}>Confirm New Password</label>
              <div style={s.inputWrap}>
                <FaLock size={14} color={TEXT_MUTED} style={s.inputIcon} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={s.input}
                  className="fp-input"
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={s.errorBox}>
                  <FaInfoCircle size={12} color="#dc2626" />
                  {error}
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                style={{ ...s.btnPrimary, opacity: loading || !newPassword || !confirmPassword ? 0.5 : 1 }}
                className="fp-btn-primary"
              >
                {loading ? "Resetting..." : (
                  <>
                    Reset Password
                    <FaCheckCircle size={12} />
                  </>
                )}
              </button>

              <div style={s.helperBox}>
                <FaShieldAlt size={11} color={MINT_DARK} />
                <span>Strong password: 8+ chars, mix of letters & numbers</span>
              </div>
            </>
          )}

          {/* STEP 4 - SUCCESS */}
          {step === 4 && (
            <div style={s.successWrap}>
              <div style={s.successIconBox} className="fp-pop">
                <FaCheckCircle size={48} color={MINT_DARK} />
              </div>
              <h2 style={s.successTitle}>Password Reset Successful</h2>
              <p style={s.successSub}>
                Aap ka password successfully reset ho gaya. Ab naye password se login karein.
              </p>

              <button
                onClick={() => navigate("/login")}
                style={s.btnPrimary}
                className="fp-btn-primary"
              >
                Go to Login
                <FaArrowRight size={11} />
              </button>
            </div>
          )}
        </div>

        {/* TRUST FOOTER */}
        <div style={s.trustFooter}>
          <FaShieldAlt size={11} color={TEXT_MUTED} />
          <span>Secured by SSL Encryption · HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    padding: "40px 20px",
  },
  container: { maxWidth: 460, width: "100%", margin: "0 auto" },

  // HEADER
  header: { textAlign: "center", marginBottom: 24 },
  logo: { display: "inline-flex", alignItems: "center", gap: 11, cursor: "pointer" },
  logoIcon: {
    width: 40, height: 40,
    background: MINT_LIGHT, borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${BORDER}`,
  },
  logoText: { fontSize: 20, fontWeight: 800, color: TEXT_DARK, letterSpacing: "-0.5px" },

  // CARD
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 32px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 12px 40px rgba(15,32,24,0.06)",
  },

  // TITLE
  titleSection: { textAlign: "center", marginBottom: 22 },
  titleIcon: {
    width: 56, height: 56,
    background: MINT_LIGHT, borderRadius: 14,
    margin: "0 auto 14px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: {
    fontSize: 22, fontWeight: 800, color: TEXT_DARK,
    margin: "0 0 8px", letterSpacing: "-0.3px",
  },
  subtitle: { fontSize: 13.5, color: TEXT_MUTED, fontWeight: 600, lineHeight: 1.5 },

  // PROGRESS
  progress: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  progItem: { display: "flex", alignItems: "center" },
  progDot: {
    width: 32, height: 32, borderRadius: "50%",
    border: "2px solid", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800,
    transition: "all 0.3s",
  },
  progLine: { width: 48, height: 2, margin: "0 8px", transition: "background 0.3s" },

  // INPUTS
  label: {
    fontSize: 13, fontWeight: 700, color: TEXT_BODY,
    display: "block", marginBottom: 8,
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center", marginBottom: 14 },
  inputIcon: { position: "absolute", left: 14, pointerEvents: "none", zIndex: 2 },
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
  otpInput: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 8,
    paddingLeft: 14,
  },

  // EMAIL DISPLAY
  emailDisplay: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: MINT_LIGHT,
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 600,
    marginBottom: 18,
  },

  // DEBUG BOX (dev)
  debugBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff8e6",
    border: "1px solid #fde68a",
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 12.5,
    color: "#7a5a10",
    fontWeight: 600,
    marginBottom: 14,
  },

  // ERROR
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 14,
    border: "1px solid #fecaca",
  },

  // BUTTONS
  btnPrimary: {
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
    marginTop: 4,
  },
  linkBtn: {
    width: "100%",
    background: "none",
    border: "none",
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "12px 0 0",
    textAlign: "center",
  },

  // HELPER
  helperBox: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 14px",
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 9,
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 14,
  },

  // SUCCESS
  successWrap: { textAlign: "center", padding: "12px 0" },
  successIconBox: {
    width: 80, height: 80,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 18px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontSize: 22, fontWeight: 800, color: TEXT_DARK,
    margin: "0 0 10px", letterSpacing: "-0.3px",
  },
  successSub: {
    fontSize: 14, color: TEXT_BODY,
    marginBottom: 24, lineHeight: 1.6,
  },

  // TRUST FOOTER
  trustFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 20,
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
};