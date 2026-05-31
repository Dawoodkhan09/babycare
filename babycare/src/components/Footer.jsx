import { useNavigate } from "react-router-dom";
import { FaBaby, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        {/* TOP ROW */}
        <div style={s.topRow}>
          {/* Brand */}
          <div style={s.brand}>
            <div style={s.logo}>
              <div style={s.logoIcon}><FaBaby size={18} color={MINT} /></div>
              <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span></span>
            </div>
            <p style={s.brandDesc}>
              Pakistan's trusted homeopathic & organic baby health advisory platform.
              Safe, natural guidance for your little one.
            </p>
            <div style={s.socials}>
              <a href="#" style={s.socialIcon}><FaFacebookF size={14} /></a>
              <a href="#" style={s.socialIcon}><FaTwitter size={14} /></a>
              <a href="#" style={s.socialIcon}><FaInstagram size={14} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Platform</h4>
            <button style={s.footLink} onClick={() => navigate("/symptom-checker")}>Symptom Checker</button>
            <button style={s.footLink} onClick={() => navigate("/treatment-results")}>Treatment Results</button>
            <button style={s.footLink} onClick={() => navigate("/doctor-booking")}>Book a Doctor</button>
            <button style={s.footLink} onClick={() => navigate("/login")}>My Account</button>
          </div>

          {/* Company */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Company</h4>
            <button style={s.footLink}>About Us</button>
            <button style={s.footLink}>Privacy Policy</button>
            <button style={s.footLink}>Terms of Service</button>
            <button style={s.footLink} onClick={() => navigate("/admin")}>Admin Panel</button>
          </div>

          {/* Contact */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Contact</h4>
            <div style={s.contactItem}><FaMapMarkerAlt size={13} color={MINT} /><span>Karachi, Pakistan</span></div>
            <div style={s.contactItem}><FaEnvelope size={13} color={MINT} /><span>info@babycare.pk</span></div>
            <div style={s.contactItem}><FaPhoneAlt size={13} color={MINT} /><span>0300-1234567</span></div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={s.disclaimer}>
          <MdLocalHospital size={16} color={MINT} />
          <span>
            BabyCare provides informational guidance only. Always consult a certified medical professional before administering any treatment to your baby.
          </span>
        </div>

        {/* BOTTOM */}
        <div style={s.bottom}>
          <span>© 2025 BabyCare · Final Year Project — Department of Computer Science</span>
          <span style={{ color: "#4a6858" }}>Made with 💚 for Pakistani parents</span>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: "#0f2018", padding: "52px 24px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto" },
  topRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40, flexWrap: "wrap" },
  brand: { },
  logo: { display: "flex", alignItems: "center", gap: 9, marginBottom: 14 },
  logoIcon: { width: 36, height: 36, background: "rgba(42,157,92,0.2)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 900, color: "#fff" },
  brandDesc: { fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 18, maxWidth: 280 },
  socials: { display: "flex", gap: 10 },
  socialIcon: { width: 34, height: 34, background: "rgba(255,255,255,0.07)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "background 0.2s" },
  col: { display: "flex", flexDirection: "column", gap: 10 },
  colTitle: { fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4, margin: 0 },
  footLink: { background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" },
  contactItem: { display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.55)", fontSize: 13 },
  disclaimer: { background: "rgba(42,157,92,0.08)", border: "1px solid rgba(42,157,92,0.2)", borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 28 },
  bottom: { borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.25)" },
};