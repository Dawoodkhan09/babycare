import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaShieldAlt, FaLock, FaAward, FaArrowRight,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .footer-link {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .footer-link::before {
    content: '→';
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: #5fcf8f;
    font-weight: 800;
    margin-right: -6px;
  }
  .footer-link:hover {
    color: #ffffff !important;
    padding-left: 2px;
  }
  .footer-link:hover::before {
    opacity: 1;
    transform: translateX(0);
    margin-right: 4px;
  }

  .footer-social {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .footer-social:hover {
    background: #2a9d5c !important;
    color: #ffffff !important;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(42,157,92,0.4);
  }

  .footer-contact-item {
    transition: all 0.2s ease;
  }
  .footer-contact-item:hover {
    color: #ffffff !important;
  }
  .footer-contact-item:hover .footer-contact-icon {
    background: #2a9d5c !important;
    transform: scale(1.08);
  }
  .footer-contact-icon {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .footer-contact-icon svg {
    transition: color 0.25s;
  }
  .footer-contact-item:hover .footer-contact-icon svg {
    color: #ffffff !important;
  }

  .footer-logo {
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .footer-logo:hover .footer-logo-icon {
    background: #2a9d5c !important;
    transform: rotate(-8deg) scale(1.05);
  }
  .footer-logo:hover .footer-logo-icon svg {
    color: #ffffff !important;
  }
  .footer-logo-icon, .footer-logo-icon svg {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .footer-cta-btn {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .footer-cta-btn:hover {
    background: #ffffff !important;
    color: #1a6e3f !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255,255,255,0.15);
  }

  .footer-trust-item {
    transition: all 0.2s ease;
  }
  .footer-trust-item:hover {
    color: #ffffff !important;
  }
  .footer-trust-item:hover svg {
    transform: scale(1.15);
  }
  .footer-trust-item svg {
    transition: transform 0.25s ease;
  }
`;

export default function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <style>{hoverStyles}</style>

      <footer style={s.footer}>
        {/* ═══════════════ CTA BAND ═══════════════ */}
        <div style={s.ctaBand}>
          <div style={s.ctaInner}>
            <div style={s.ctaText}>
              <h3 style={s.ctaTitle}>
                Need expert pediatric advice?
              </h3>
              <p style={s.ctaSub}>
                Connect with PMDC-verified doctors today. Free consultations for first-time users.
              </p>
            </div>
            <button style={s.ctaBtn} className="footer-cta-btn" onClick={() => navigate("/DoctorBooking")}>
              Find a Doctor
              <FaArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <div style={s.inner}>

          {/* TOP ROW */}
          <div style={s.topRow}>
            {/* Brand */}
            <div style={s.brandCol}>
              <div style={s.logo} className="footer-logo" onClick={() => navigate("/")}>
                <div style={s.logoIcon} className="footer-logo-icon">
                  <FaStethoscope size={18} color={MINT_LIGHT} />
                </div>
                <span style={s.logoText}>
                  Baby<span style={{ color: "#5fcf8f" }}>Care</span>
                </span>
              </div>

              <p style={s.brandDesc}>
                Pakistan's trusted pediatric healthcare platform.
                Connecting families with PMDC-verified doctors and
                evidence-based homeopathic treatments.
              </p>

              {/* Trust Badges */}
              <div style={s.trustBadges}>
                <div style={s.trustBadge} className="footer-trust-item">
                  <HiOutlineShieldCheck size={13} color="#5fcf8f" />
                  <span>PMDC Verified</span>
                </div>
                <div style={s.trustBadge} className="footer-trust-item">
                  <FaLock size={11} color="#5fcf8f" />
                  <span>SSL Secure</span>
                </div>
              </div>

              {/* Socials */}
              <div style={s.socials}>
                <a href="#" style={s.socialIcon} className="footer-social" aria-label="Facebook">
                  <FaFacebookF size={13} />
                </a>
                <a href="#" style={s.socialIcon} className="footer-social" aria-label="Twitter">
                  <FaTwitter size={13} />
                </a>
                <a href="#" style={s.socialIcon} className="footer-social" aria-label="Instagram">
                  <FaInstagram size={13} />
                </a>
                <a href="#" style={s.socialIcon} className="footer-social" aria-label="LinkedIn">
                  <FaLinkedinIn size={13} />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div style={s.col}>
              <h4 style={s.colTitle}>Platform</h4>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/Symptomchecker")}>
                Symptom Checker
              </button>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/DoctorBooking")}>
                Find Doctors
              </button>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/Shop")}>
                Pharmacy Shop
              </button>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/dashboard")}>
                My Dashboard
              </button>
            </div>

            {/* Company */}
            <div style={s.col}>
              <h4 style={s.colTitle}>Company</h4>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/About")}>
                About Us
              </button>
              <button style={s.footLink} className="footer-link">
                Privacy Policy
              </button>
              <button style={s.footLink} className="footer-link">
                Terms of Service
              </button>
              <button style={s.footLink} className="footer-link" onClick={() => navigate("/doctor-register")}>
                Doctor Registration
              </button>
            </div>

            {/* Contact */}
            <div style={s.col}>
              <h4 style={s.colTitle}>Get in Touch</h4>
              <div style={s.contactItem} className="footer-contact-item">
                <div style={s.contactIconBox} className="footer-contact-icon">
                  <FaMapMarkerAlt size={11} color="#5fcf8f" />
                </div>
                <div>
                  <div style={s.contactLabel}>Location</div>
                  <div style={s.contactValue}>Karachi, Pakistan</div>
                </div>
              </div>

              <a href="mailto:info@babycare.pk" style={{ ...s.contactItem, textDecoration: "none" }} className="footer-contact-item">
                <div style={s.contactIconBox} className="footer-contact-icon">
                  <FaEnvelope size={11} color="#5fcf8f" />
                </div>
                <div>
                  <div style={s.contactLabel}>Email</div>
                  <div style={s.contactValue}>info@babycare.pk</div>
                </div>
              </a>

              <a href="tel:+923001234567" style={{ ...s.contactItem, textDecoration: "none" }} className="footer-contact-item">
                <div style={s.contactIconBox} className="footer-contact-icon">
                  <FaPhoneAlt size={11} color="#5fcf8f" />
                </div>
                <div>
                  <div style={s.contactLabel}>Phone</div>
                  <div style={s.contactValue}>0300-1234567</div>
                </div>
              </a>
            </div>
          </div>

          {/* MEDICAL DISCLAIMER */}
          <div style={s.disclaimer}>
            <div style={s.disclaimerIcon}>
              <FaShieldAlt size={14} color="#5fcf8f" />
            </div>
            <div>
              <strong style={{ color: "#fff", fontSize: 13 }}>Medical Disclaimer:</strong>
              <span style={{ marginLeft: 6 }}>
                BabyCare provides informational guidance only. Always consult a certified
                medical professional before administering any treatment. In case of emergency,
                contact your nearest hospital immediately.
              </span>
            </div>
          </div>

          {/* TRUST INDICATORS */}
          <div style={s.trustStrip}>
            <div style={s.trustItem} className="footer-trust-item">
              <FaShieldAlt size={12} color="#5fcf8f" />
              <span>HIPAA Compliant</span>
            </div>
            <div style={s.trustDivider} />
            <div style={s.trustItem} className="footer-trust-item">
              <FaLock size={12} color="#5fcf8f" />
              <span>SSL Encrypted</span>
            </div>
            <div style={s.trustDivider} />
            <div style={s.trustItem} className="footer-trust-item">
              <FaAward size={12} color="#5fcf8f" />
              <span>PMDC Verified</span>
            </div>
            <div style={s.trustDivider} />
            <div style={s.trustItem} className="footer-trust-item">
              <HiOutlineShieldCheck size={13} color="#5fcf8f" />
              <span>Data Protected</span>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div style={s.bottom}>
            <div style={s.bottomLeft}>
              © 2026 BabyCare. All rights reserved.
            </div>
            <div style={s.bottomRight}>
              Final Year Project · Department of Computer Science
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

const s = {
  footer: {
    background: "#0a1f15",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    position: "relative",
  },

  // CTA BAND (top)
  ctaBand: {
    background: `linear-gradient(135deg, ${MINT_DARK} 0%, ${MINT} 100%)`,
    padding: "32px 24px",
  },
  ctaInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  ctaText: { flex: 1, minWidth: 260 },
  ctaTitle: {
    fontSize: "clamp(20px, 2.5vw, 26px)",
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  ctaSub: {
    fontSize: 14.5,
    color: "rgba(255,255,255,0.85)",
    margin: 0,
    lineHeight: 1.5,
  },
  ctaBtn: {
    background: "transparent",
    color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.5)",
    borderRadius: 10,
    padding: "12px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  // MAIN INNER
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "56px 24px 28px",
  },

  // TOP ROW (4 columns)
  topRow: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
    gap: 48,
    marginBottom: 44,
  },

  // BRAND COL
  brandCol: {},
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  logoIcon: {
    width: 42,
    height: 42,
    background: "rgba(42,157,92,0.2)",
    border: "1px solid rgba(42,157,92,0.35)",
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  brandDesc: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
    marginBottom: 18,
    maxWidth: 320,
  },
  trustBadges: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(42,157,92,0.12)",
    border: "1px solid rgba(42,157,92,0.25)",
    color: "rgba(255,255,255,0.85)",
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  socials: {
    display: "flex",
    gap: 8,
  },
  socialIcon: {
    width: 36,
    height: 36,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
  },

  // OTHER COLS
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 13,
  },
  colTitle: {
    fontSize: 11.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#5fcf8f",
    marginBottom: 6,
    margin: "0 0 6px",
  },
  footLink: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.65)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    padding: 0,
    fontFamily: "inherit",
  },

  // CONTACT
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
  },
  contactIconBox: {
    width: 32,
    height: 32,
    background: "rgba(42,157,92,0.12)",
    border: "1px solid rgba(42,157,92,0.2)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
  },

  // DISCLAIMER
  disclaimer: {
    background: "rgba(42,157,92,0.08)",
    border: "1px solid rgba(42,157,92,0.2)",
    borderLeft: `3px solid ${MINT}`,
    borderRadius: 10,
    padding: "14px 18px",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    fontSize: 12.5,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.65,
    marginBottom: 28,
  },
  disclaimerIcon: {
    width: 30,
    height: 30,
    background: "rgba(42,157,92,0.15)",
    border: "1px solid rgba(42,157,92,0.3)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },

  // TRUST STRIP
  trustStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: "18px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },
  trustItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12.5,
    fontWeight: 700,
  },
  trustDivider: {
    width: 1,
    height: 14,
    background: "rgba(255,255,255,0.1)",
  },

  // BOTTOM
  bottom: {
    paddingTop: 20,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 12.5,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
  },
  bottomLeft: {},
  bottomRight: { color: "rgba(255,255,255,0.35)" },
};