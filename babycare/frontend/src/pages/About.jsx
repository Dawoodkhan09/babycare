import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd, FaLeaf, FaShieldAlt, FaHeart, FaUsers, FaHandshake,
  FaArrowRight, FaCheckCircle, FaQuoteLeft, FaSearch, FaPills,
  FaStethoscope, FaAward, FaPlus, FaMinus,
} from "react-icons/fa";
import { HiOutlineShieldCheck, HiOutlineSparkles } from "react-icons/hi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

// ─── DATA ───
const STATS = [
  { value: "5,000+",  label: "Verified Parents",   Icon: FaUsers },
  { value: "50+",     label: "PMDC Doctors",       Icon: FaUserMd },
  { value: "12,000+", label: "Consultations",      Icon: FaStethoscope },
  { value: "98%",     label: "Satisfaction Rate",  Icon: FaAward },
];

const VALUES = [
  {
    Icon: FaLeaf,
    title: "Natural-First Approach",
    desc: "We believe in safe, evidence-based homeopathic and organic treatments for children — free from the harmful side effects of synthetic medications.",
  },
  {
    Icon: HiOutlineShieldCheck,
    title: "Verified & Trusted",
    desc: "All our doctors are PMDC registered and thoroughly vetted. Every treatment recommendation is reviewed by qualified medical professionals.",
  },
  {
    Icon: FaHeart,
    title: "Parent-Centric Design",
    desc: "Every feature is built around real parental needs — intuitive, accessible, and available 24/7 from anywhere in Pakistan.",
  },
  {
    Icon: FaHandshake,
    title: "Local Community Care",
    desc: "Built for Pakistani parents — featuring local doctors, regionally trusted remedies, and culturally sensitive care designed for our community.",
  },
];

const STEPS = [
  { num: "01", Icon: FaSearch,      title: "Assess Symptoms",   desc: "Use our comprehensive symptom checker to identify your child's condition accurately." },
  { num: "02", Icon: FaLeaf,        title: "Get Recommendations", desc: "Receive evidence-based homeopathic and organic treatment options instantly." },
  { num: "03", Icon: FaUserMd,      title: "Consult a Specialist", desc: "Book appointments with verified pediatric doctors whenever a professional opinion is needed." },
  { num: "04", Icon: FaPills,       title: "Order Medicines",    desc: "Get genuine homeopathic medicines delivered to your doorstep across Pakistan." },
];

const TEAM = [
  { name: "Dawood Khan",    role: "Founder & Lead Developer",  initials: "DA", gradient: "linear-gradient(135deg, #2a9d5c, #1a6e3f)", bio: "Full-stack developer leading product development and engineering" },
  { name: "Dr. Ayesha Malik", role: "Chief Medical Advisor",     initials: "AM", gradient: "linear-gradient(135deg, #7c3aed, #5b21b6)", bio: "Pediatric Homeopath with 8+ years of clinical experience" },
  { name: "Dr. Usman Raza",   role: "Pediatric Consultant",      initials: "UR", gradient: "linear-gradient(135deg, #0891b2, #155e75)", bio: "Child Specialist (MBBS, FCPS) with 12+ years experience" },
  { name: "Sana Tariq",       role: "Research & Content Lead",   initials: "ST", gradient: "linear-gradient(135deg, #db2777, #9d174d)", bio: "Organic medicine researcher and medical content specialist" },
];

const FAQS = [
  {
    q: "Who can use BabyCare?",
    a: "BabyCare is designed for parents and caregivers seeking trusted natural healthcare for children aged 0–5 years. Our platform is free to join and available to families across Pakistan.",
  },
  {
    q: "Are the remedies on this platform safe?",
    a: "Yes. Every homeopathic and organic remedy listed on BabyCare has been reviewed by certified pediatricians and PMDC-registered homeopathic practitioners. However, for serious or persistent symptoms, we always recommend consulting a doctor directly.",
  },
  {
    q: "How does the doctor consultation process work?",
    a: "You can browse verified pediatricians in your area, view their profiles, and book appointments in just a few clicks. Booking, payment, and consultation are all handled securely through the BabyCare platform, with real-time availability for added convenience.",
  },
  {
    q: "Is BabyCare available in every city in Pakistan?",
    a: "BabyCare currently operates in Karachi, Lahore, Islamabad, and other major Pakistani cities. We are rapidly expanding our network and aim to reach families in every major city across the country in the coming months.",
  },
  {
    q: "How does medicine delivery work?",
    a: "You can conveniently order medicines from our verified homeopathic partner stores. Same-day delivery is available in Karachi, while other major cities typically receive orders within 2–3 working days.",
  },
  {
    q: "How secure is my personal data?",
    a: "Your privacy is our top priority. All data is protected using industry-standard SSL encryption, and medical records are stored in accordance with HIPAA-equivalent standards. Your information is shared only with your treating physician — never with third parties.",
  },
];

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .about-stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-stat-card:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 24px rgba(42,157,92,0.12);
  }
  .about-stat-card:hover .about-stat-icon {
    background: #2a9d5c !important;
    transform: scale(1.1);
  }
  .about-stat-card:hover .about-stat-icon svg {
    color: #fff !important;
  }
  .about-stat-icon, .about-stat-icon svg {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .about-value-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .about-value-card:hover {
    transform: translateY(-6px);
    border-color: #2a9d5c !important;
    box-shadow: 0 16px 32px rgba(42,157,92,0.12);
  }
  .about-value-card:hover .about-value-icon {
    background: #2a9d5c !important;
    transform: scale(1.08) rotate(-5deg);
  }
  .about-value-card:hover .about-value-icon svg {
    color: #fff !important;
  }
  .about-value-icon, .about-value-icon svg {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .about-step {
    transition: transform 0.3s ease;
  }
  .about-step:hover {
    transform: translateY(-4px);
  }
  .about-step:hover .about-step-num {
    transform: scale(1.08);
    box-shadow: 0 12px 28px rgba(26,110,63,0.35);
  }
  .about-step-num {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .about-team-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-team-card:hover {
    transform: translateY(-6px);
    border-color: #b2e0cc !important;
    box-shadow: 0 16px 32px rgba(42,157,92,0.1);
  }
  .about-team-card:hover .about-team-avatar {
    transform: scale(1.08) rotate(-3deg);
    box-shadow: 0 12px 28px rgba(15,32,24,0.25);
  }
  .about-team-avatar {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .about-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-btn-primary:hover {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .about-btn-primary:active {
    transform: translateY(0);
  }

  .about-btn-secondary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-btn-secondary:hover {
    background: #f4f9f6 !important;
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(42,157,92,0.1);
  }

  .about-cta-btn-light {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-cta-btn-light:hover {
    background: #f4f9f6 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
  }
  .about-cta-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .about-cta-btn-outline:hover {
    background: rgba(255,255,255,0.15) !important;
    transform: translateY(-2px);
  }

  .about-faq-item {
    transition: all 0.25s ease;
  }
  .about-faq-item:hover {
    border-color: #b2e0cc !important;
  }
  .about-faq-question {
    transition: all 0.2s ease;
  }
  .about-faq-question:hover {
    background: #fafffe !important;
  }
  .about-faq-icon {
    transition: transform 0.3s ease;
  }
  .about-faq-item.open .about-faq-icon {
    transform: rotate(180deg);
  }

  .about-trust-badge {
    transition: all 0.25s ease;
  }
  .about-trust-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(42,157,92,0.18) !important;
  }

  /* ═══════════════ MOBILE RESPONSIVE ═══════════════ */
  @media (max-width: 768px) {
    .about-hero { padding: 48px 16px 36px !important; }
    .about-hero-title { font-size: 32px !important; }
    .about-hero-sub { font-size: 14.5px !important; }
    .about-cta-inner { padding: 40px 24px !important; }
    .about-cta-title { font-size: 24px !important; }
    .about-cta-sub { font-size: 14.5px !important; }
    .about-faq-question { padding: 14px 16px !important; }
    .about-faq-q-text { font-size: 14px !important; }
    .about-faq-answer { padding: 0 16px 16px !important; font-size: 13.5px !important; }
  }
`;

export default function About() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={s.hero} className="about-hero">
        <div style={s.heroBg} />
        <div style={s.secInner}>
          <div style={s.heroContent}>
            <div style={s.trustBadge} className="about-trust-badge">
              <HiOutlineShieldCheck size={14} color={MINT_DARK} />
              <span>Pakistan's Trusted Healthcare Platform</span>
            </div>

            <h1 style={s.heroTitle} className="about-hero-title">
              About <span style={{ color: MINT_DARK }}>BabyCare</span>
            </h1>

            <p style={s.heroSub} className="about-hero-sub">
              We are revolutionizing pediatric healthcare in Pakistan by combining
              traditional homeopathic wisdom with modern technology — making safe,
              natural treatments accessible to every parent.
            </p>

            <div style={s.heroBtns}>
              <button style={s.btnPrimary} className="about-btn-primary" onClick={() => navigate("/DoctorBooking")}>
                Find a Doctor
                <FaArrowRight size={12} />
              </button>
              <button style={s.btnSecondary} className="about-btn-secondary" onClick={() => navigate("/Symptomchecker")}>
                <FaStethoscope size={13} />
                Try Symptom Checker
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section style={{ ...s.section, paddingTop: 20, paddingBottom: 40 }}>
        <div style={s.secInner}>
          <div style={s.statsGrid}>
            {STATS.map(({ value, label, Icon }, i) => (
              <div key={label} style={s.statCard} className="about-stat-card">
                <div style={s.statIconBox} className="about-stat-icon">
                  <Icon size={20} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.statValue}>{value}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION ═══════════════ */}
      <section style={{ ...s.section, background: "#fafffe" }}>
        <div style={s.secInner}>
          <div style={s.missionGrid}>
            <div>
              <span style={s.secTag}>Our Mission</span>
              <h2 style={s.secTitle}>Empowering Pakistani Parents</h2>
              <p style={s.missionDesc}>
                BabyCare is on a mission to make trustworthy, accessible, and
                affordable pediatric healthcare available to every Pakistani
                family — combining the wisdom of traditional remedies with the
                power of modern technology.
              </p>
              <p style={s.missionDesc}>
                We believe every child deserves safe, natural, and evidence-based
                care, regardless of city or economic background. Our platform is
                built to make that vision a reality — empowering parents with the
                tools, knowledge, and verified medical support they need.
              </p>
              <div style={s.missionPoints}>
                {[
                  "PMDC certified medical advisors",
                  "Evidence-based treatment protocols",
                  "100% data privacy & encryption",
                  "Affordable consultation pricing",
                ].map((point) => (
                  <div key={point} style={s.missionPoint}>
                    <FaCheckCircle size={13} color={MINT_DARK} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.missionVisual}>
              <div style={s.missionCard}>
                <FaQuoteLeft size={20} color={MINT_LIGHT} />
                <p style={s.quoteText}>
                  Every parent in Pakistan deserves access to world-class
                  pediatric care — without barriers, without compromise.
                  It's not just our mission; it's our responsibility.
                </p>
                <div style={s.quoteAuthor}>
                  <div style={s.quoteAvatar}>DA</div>
                  <div>
                    <div style={s.quoteName}>Dawood Khan</div>
                    <div style={s.quoteRole}>Founder, BabyCare</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VALUES ═══════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <div style={s.secHeader}>
            <span style={s.secTag}>Our Values</span>
            <h2 style={s.secTitle}>What We Stand For</h2>
            <p style={s.secSub}>
              Our core principles guide every decision and feature on the platform
            </p>
          </div>

          <div style={s.valuesGrid}>
            {VALUES.map(({ Icon, title, desc }) => (
              <div key={title} style={s.valueCard} className="about-value-card">
                <div style={s.valueIcon} className="about-value-icon">
                  <Icon size={22} color={MINT_DARK} />
                </div>
                <h3 style={s.valueTitle}>{title}</h3>
                <p style={s.valueDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ ...s.section, background: "#fafffe" }}>
        <div style={s.secInner}>
          <div style={s.secHeader}>
            <span style={s.secTag}>How It Works</span>
            <h2 style={s.secTitle}>Simple Four-Step Process</h2>
            <p style={s.secSub}>
              From symptom assessment to medicine delivery — everything in one platform
            </p>
          </div>

          <div style={s.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.num} style={s.stepCol} className="about-step">
                <div style={s.stepNum} className="about-step-num">{step.num}</div>
                <div style={s.stepIconBox}>
                  <step.Icon size={20} color={MINT_DARK} />
                </div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TEAM ═══════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <div style={s.secHeader}>
            <span style={s.secTag}>Our Team</span>
            <h2 style={s.secTitle}>Meet the People Behind BabyCare</h2>
            <p style={s.secSub}>
              A dedicated team of developers, doctors, and researchers working together
            </p>
          </div>

          <div style={s.teamGrid}>
            {TEAM.map((member) => (
              <div key={member.name} style={s.teamCard} className="about-team-card">
                <div style={{ ...s.teamAvatar, background: member.gradient }} className="about-team-avatar">
                  {member.initials}
                </div>
                <h3 style={s.teamName}>{member.name}</h3>
                <p style={s.teamRole}>{member.role}</p>
                <p style={s.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section style={{ ...s.section, background: "#fafffe" }}>
        <div style={s.secInner}>
          <div style={s.secHeader}>
            <span style={s.secTag}>FAQ</span>
            <h2 style={s.secTitle}>Frequently Asked Questions</h2>
            <p style={s.secSub}>
              Common questions about the BabyCare platform and our services
            </p>
          </div>

          <div style={s.faqWrap}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={s.faqItem} className={`about-faq-item ${open ? "open" : ""}`}>
                  <button
                    style={s.faqQuestion}
                    className="about-faq-question"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span style={s.faqQText} className="about-faq-q-text">{faq.q}</span>
                    <div style={s.faqIconWrap} className="about-faq-icon">
                      {open ? <FaMinus size={11} color={MINT_DARK} /> : <FaPlus size={11} color={MINT_DARK} />}
                    </div>
                  </button>
                  {open && (
                    <div style={s.faqAnswer} className="about-faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section style={s.ctaSection}>
        <div style={s.secInner}>
          <div style={s.ctaInner} className="about-cta-inner">
            <h2 style={s.ctaTitle} className="about-cta-title">Ready to Get Started?</h2>
            <p style={s.ctaSub} className="about-cta-sub">
              Join 5,000+ Pakistani parents who trust BabyCare for their child's healthcare needs.
              Sign up free today — no credit card required.
            </p>
            <div style={s.ctaBtns}>
              <button
                style={s.btnCtaLight}
                className="about-cta-btn-light"
                onClick={() => navigate("/login")}
              >
                Create Free Account
                <FaArrowRight size={12} />
              </button>
              <button
                style={s.btnCtaOutline}
                className="about-cta-btn-outline"
                onClick={() => navigate("/DoctorBooking")}
              >
                <FaUserMd size={12} />
                Browse Doctors
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#fff",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },

  // HERO
  hero: {
    position: "relative",
    padding: "80px 24px 60px",
    overflow: "hidden",
    background: "linear-gradient(180deg, #fafffe 0%, #ffffff 100%)",
  },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: `radial-gradient(circle at 90% 10%, ${MINT_LIGHT} 0%, transparent 40%), radial-gradient(circle at 10% 90%, #f0faf4 0%, transparent 40%)`,
    pointerEvents: "none",
  },
  heroContent: {
    textAlign: "center",
    maxWidth: 760,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    background: "#fff",
    border: `1.5px solid ${MINT}`,
    borderRadius: 30,
    fontSize: 12.5,
    fontWeight: 700,
    color: MINT_DARK,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(42,157,92,0.1)",
    cursor: "default",
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 56px)",
    fontWeight: 800,
    color: TEXT_DARK,
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 17,
    color: TEXT_BODY,
    lineHeight: 1.7,
    marginBottom: 32,
    maxWidth: 640,
    margin: "0 auto 32px",
  },
  heroBtns: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  // SECTIONS
  section: { padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: "#fff" },
  secInner: { maxWidth: 1200, margin: "0 auto" },
  secHeader: { textAlign: "center", maxWidth: 640, margin: "0 auto 56px" },
  secTag: {
    display: "inline-block",
    padding: "5px 12px",
    background: MINT_LIGHT,
    color: MINT_DARK,
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  secTitle: {
    fontSize: "clamp(26px, 3vw, 38px)",
    fontWeight: 800,
    color: TEXT_DARK,
    lineHeight: 1.2,
    letterSpacing: "-1px",
    marginBottom: 14,
  },
  secSub: { fontSize: 16, color: TEXT_BODY, lineHeight: 1.7 },

  // BUTTONS
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 24px",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },
  btnSecondary: {
    background: "#fff",
    color: TEXT_DARK,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 22px",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  // STATS
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 4,
  },

  // MISSION
  missionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 40,
    alignItems: "center",
  },
  missionDesc: {
    fontSize: "clamp(14px, 2.2vw, 15.5px)",
    color: TEXT_BODY,
    lineHeight: 1.75,
    marginBottom: 18,
  },
  missionPoints: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  missionPoint: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: TEXT_BODY,
    fontWeight: 600,
  },
  missionVisual: {},
  missionCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 12px 32px rgba(15,32,24,0.06)",
  },
  quoteText: {
    fontSize: "clamp(14px, 2.2vw, 15.5px)",
    color: TEXT_BODY,
    lineHeight: 1.7,
    margin: "16px 0 24px",
    fontStyle: "italic",
  },
  quoteAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingTop: 20,
    borderTop: `1px solid ${BORDER}`,
  },
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
  },
  quoteName: { fontSize: 14, fontWeight: 800, color: TEXT_DARK },
  quoteRole: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600, marginTop: 2 },

  // VALUES
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
  valueCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "30px 26px",
  },
  valueIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  valueTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 10,
    letterSpacing: "-0.3px",
  },
  valueDesc: { fontSize: 14, color: TEXT_BODY, lineHeight: 1.65 },

  // STEPS
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
  },
  stepCol: { textAlign: "center", padding: "0 16px" },
  stepNum: {
    width: 56,
    height: 56,
    margin: "0 auto 20px",
    borderRadius: "50%",
    background: MINT_DARK,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(26,110,63,0.25)",
  },
  stepIconBox: {
    width: 44,
    height: 44,
    margin: "0 auto 14px",
    borderRadius: 11,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 10,
    letterSpacing: "-0.3px",
  },
  stepDesc: { fontSize: 14, color: TEXT_BODY, lineHeight: 1.65 },

  // TEAM
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  teamCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "28px 22px",
    textAlign: "center",
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 18,
    margin: "0 auto 16px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 800,
    boxShadow: "0 8px 22px rgba(15,32,24,0.18)",
  },
  teamName: {
    fontSize: 16,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 4,
    letterSpacing: "-0.3px",
  },
  teamRole: {
    fontSize: 13,
    color: MINT_DARK,
    fontWeight: 700,
    marginBottom: 10,
  },
  teamBio: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 1.6,
    fontWeight: 500,
  },

  // FAQ
  faqWrap: { maxWidth: 760, margin: "0 auto" },
  faqItem: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  faqQuestion: {
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "18px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    gap: 16,
  },
  faqQText: {
    fontSize: 15,
    fontWeight: 700,
    color: TEXT_DARK,
    flex: 1,
  },
  faqIconWrap: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  faqAnswer: {
    padding: "0 22px 20px",
    fontSize: 14.5,
    color: TEXT_BODY,
    lineHeight: 1.75,
  },

  // CTA
  ctaSection: { padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 24px)", background: "#fff" },
  ctaInner: {
    background: `linear-gradient(135deg, ${MINT_DARK} 0%, ${MINT} 100%)`,
    borderRadius: 24,
    padding: "60px 40px",
    textAlign: "center",
    maxWidth: 800,
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "clamp(26px, 3vw, 38px)",
    fontWeight: 800,
    color: "#fff",
    marginBottom: 14,
    letterSpacing: "-1px",
    lineHeight: 1.2,
  },
  ctaSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.7,
    marginBottom: 32,
  },
  ctaBtns: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnCtaLight: {
    background: "#fff",
    color: MINT_DARK,
    border: "none",
    borderRadius: 10,
    padding: "13px 26px",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  btnCtaOutline: {
    background: "transparent",
    color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.4)",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
};