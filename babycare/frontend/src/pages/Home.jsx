import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaLeaf, FaShieldAlt, FaUserMd, FaSearch, FaCalendarCheck,
  FaClipboardList, FaHeartbeat, FaPhoneAlt, FaArrowRight, FaCheckCircle,
  FaQuoteLeft, FaAward, FaLock, FaClock, FaStar,
} from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineShieldCheck } from "react-icons/hi";
import { IoMdMedical } from "react-icons/io";

const MINT       = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK  = "#1a6e3f";
const TEXT_DARK  = "#0a1f15";
const TEXT_BODY  = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER     = "#e0ede6";

// ─── DATA ───
const SYMPTOMS = [
  { Icon: FaHeartbeat,   label: "Fever",            color: "#dc2626" },
  { Icon: HiOutlineSparkles, label: "Cold & Cough", color: "#0891b2" },
  { Icon: IoMdMedical,   label: "Teething Pain",    color: "#7c3aed" },
  { Icon: FaHeartbeat,   label: "Diarrhea",         color: "#ea580c" },
  { Icon: FaClock,       label: "Sleep Issues",     color: "#4338ca" },
  { Icon: FaShieldAlt,   label: "Feeding Issues",   color: "#0891b2" },
];

const SERVICES = [
  { Icon: FaLeaf, title: "Homeopathic Remedies", desc: "Evidence-based homeopathic treatments curated by certified practitioners for common pediatric conditions." },
  { Icon: FaStethoscope, title: "Doctor Consultations", desc: "Connect with PMDC-verified pediatric specialists offering both in-person and online consultations." },
  { Icon: FaSearch, title: "Symptom Assessment", desc: "Comprehensive symptom analysis tool providing immediate guidance and treatment recommendations." },
  { Icon: FaCalendarCheck, title: "Appointment Booking", desc: "Schedule consultations with leading specialists across Pakistan with real-time availability." },
  { Icon: FaClipboardList, title: "Medical Records", desc: "Secure, encrypted storage of your child's complete medical history and treatment timeline." },
  { Icon: HiOutlineShieldCheck, title: "Verified Care", desc: "Every doctor and treatment recommendation is verified by our medical advisory board." },
];

const DOCTORS = [
  { name: "Dr. Ayesha Malik", spec: "Pediatric Homeopathy", exp: "8+ Years", qual: "MBBS, DHMS", initials: "AM", rating: 4.9, reviews: 247 },
  { name: "Dr. Usman Raza",   spec: "Child Specialist",     exp: "12+ Years", qual: "MBBS, FCPS", initials: "UR", rating: 4.8, reviews: 312 },
  { name: "Dr. Sana Tariq",   spec: "Organic Medicine",     exp: "6+ Years",  qual: "MBBS, MD",   initials: "ST", rating: 4.9, reviews: 189 },
];

const STEPS = [
  { num: "01", title: "Describe Symptoms",      desc: "Use our symptom checker to describe your baby's condition in detail." },
  { num: "02", title: "Get Recommendations",    desc: "Receive evidence-based treatment options from our medical database." },
  { num: "03", title: "Consult Specialist",     desc: "Book an appointment with a verified pediatric doctor for confirmation." },
];

const TESTIMONIALS = [
  { text: "BabyCare ne mujhe meri 8-month-old beti ke liye sahi homeopathic doctor dhundne mein help ki. Process bohot smooth aur professional tha.", name: "Fatima A.", role: "Mother of 2 · Karachi" },
  { text: "Symptom checker bohot accurate hai. Doctor consultation ke baad confirm hua. Highly recommended for new parents.", name: "Mehwish K.", role: "First-time Mother · Lahore" },
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #2a9d5c, #1a6e3f)",
  "linear-gradient(135deg, #0891b2, #155e75)",
  "linear-gradient(135deg, #7c3aed, #5b21b6)",
];

// ═══════════════ HOVER STYLES (CSS) ═══════════════
const hoverStyles = `
  /* ─── Service Cards ─── */
  .home-service-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .home-service-card:hover {
    transform: translateY(-6px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 32px rgba(42,157,92,0.15);
  }
  .home-service-card:hover .home-service-icon {
    background: #2a9d5c !important;
    transform: scale(1.05);
  }
  .home-service-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-service-card:hover .home-service-icon svg {
    color: #ffffff !important;
  }
  .home-service-icon svg {
    transition: color 0.3s;
  }

  /* ─── Doctor Cards ─── */
  .home-doc-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-doc-card:hover {
    transform: translateY(-8px);
    border-color: #2a9d5c !important;
    box-shadow: 0 20px 40px rgba(42,157,92,0.12);
  }
  .home-doc-card:hover .home-doc-avatar {
    transform: scale(1.08) rotate(-3deg);
    box-shadow: 0 12px 28px rgba(15,32,24,0.25);
  }
  .home-doc-avatar {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ─── Primary Buttons ─── */
  .home-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-btn-primary:hover {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .home-btn-primary:active {
    transform: translateY(0);
  }

  /* ─── Secondary Buttons ─── */
  .home-btn-secondary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-btn-secondary:hover {
    background: #f4f9f6 !important;
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(42,157,92,0.1);
  }
  .home-btn-secondary:active {
    transform: translateY(0);
  }

  /* ─── Ghost Buttons ─── */
  .home-btn-ghost {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-btn-ghost:hover {
    background: #e8f8ef !important;
    transform: translateY(-2px);
  }

  /* ─── Doctor "Book Consultation" Button ─── */
  .home-doc-btn {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-doc-btn:hover {
    background: #2a9d5c !important;
    color: #ffffff !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(42,157,92,0.3);
  }

  /* ─── Symptom Buttons ─── */
  .home-sym-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-sym-btn:hover:not(.active) {
    background: #f4f9f6 !important;
    border-color: #2a9d5c !important;
    transform: translateY(-2px);
  }
  .home-sym-btn.active {
    box-shadow: 0 4px 12px rgba(42,157,92,0.2);
  }

  /* ─── Symptom Check CTA Button ─── */
  .home-sym-check-btn {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .home-sym-check-btn:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.35);
  }

  /* ─── Step Cards ─── */
  .home-step {
    transition: transform 0.3s ease;
  }
  .home-step:hover {
    transform: translateY(-4px);
  }
  .home-step:hover .home-step-num {
    transform: scale(1.1);
    box-shadow: 0 12px 28px rgba(26,110,63,0.35);
  }
  .home-step-num {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ─── Testimonial Cards ─── */
  .home-testi-card {
    transition: all 0.3s ease;
  }
  .home-testi-card:hover {
    transform: translateY(-4px);
    border-color: #b2e0cc !important;
    box-shadow: 0 8px 24px rgba(42,157,92,0.08);
  }

  /* ─── Trust Badge ─── */
  .home-trust-badge {
    transition: all 0.25s ease;
  }
  .home-trust-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(42,157,92,0.18) !important;
  }

  /* ─── Verified Badge on doctor cards ─── */
  .home-verified-badge {
    transition: all 0.2s ease;
  }
  .home-doc-card:hover .home-verified-badge {
    background: #2a9d5c !important;
    color: #ffffff !important;
  }
  .home-doc-card:hover .home-verified-badge svg {
    color: #ffffff !important;
  }

  /* ─── Pulse animation for status dot ─── */
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }
  .home-status-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }

  /* ─── Stats card subtle hover ─── */
  .home-stats-card {
    transition: all 0.3s ease;
  }
  .home-stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 70px rgba(15,32,24,0.1), 0 0 0 1px rgba(42,157,92,0.15) !important;
  }

  /* ─── Mobile responsive ─── */
  @media (max-width: 968px) {
    .home-hero-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }
    .home-sym-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }
  }
`;

export default function Home() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const toggleSymptom = (label) =>
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner} className="home-hero-grid">

          {/* LEFT — Content */}
          <div style={s.heroLeft} className="bc-anim-fadeLeft">
            <div style={s.trustBadge} className="bc-anim-fadeUp home-trust-badge">
              <HiOutlineShieldCheck size={14} color={MINT_DARK} />
              <span>PMDC Verified Healthcare Platform</span>
            </div>

            <h1 style={s.heroTitle} className="bc-anim-fadeUp bc-d1">
              Pakistan's Trusted<br />
              <span style={{ color: MINT_DARK }}>Pediatric Healthcare</span><br />
              Platform
            </h1>

            <p style={s.heroSub} className="bc-anim-fadeUp bc-d2">
              Connect with certified pediatric specialists, access evidence-based
              homeopathic treatments, and manage your child's healthcare journey
              — all in one secure platform.
            </p>

            <div style={s.heroBtns} className="bc-anim-fadeUp bc-d3">
              <button style={s.btnPrimary} className="home-btn-primary" onClick={() => navigate("/DoctorBooking")}>
                Find a Doctor
                <FaArrowRight size={12} />
              </button>
              <button style={s.btnSecondary} className="home-btn-secondary" onClick={() => navigate("/Symptomchecker")}>
                <FaStethoscope size={13} />
                Symptom Checker
              </button>
            </div>

            <div style={s.trustIndicators} className="bc-anim-fadeUp bc-d4">
              <div style={s.trustItem}>
                <FaLock size={11} color={MINT_DARK} />
                <span>SSL Encrypted</span>
              </div>
              <div style={s.trustDivider} />
              <div style={s.trustItem}>
                <FaAward size={11} color={MINT_DARK} />
                <span>PMDC Verified</span>
              </div>
              <div style={s.trustDivider} />
              <div style={s.trustItem}>
                <FaCheckCircle size={11} color={MINT_DARK} />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Stats Card */}
          <div style={s.heroRight} className="bc-anim-fadeRight bc-d2">
            <div style={s.statsCard} className="home-stats-card">
              <div style={s.statsHeader}>
                <div style={s.statusDot} className="home-status-dot" />
                <span style={s.statsLabel}>Live Platform Statistics</span>
              </div>

              <div style={s.statsGrid}>
                <div style={s.statItem}>
                  <div style={s.statValue}>5,000+</div>
                  <div style={s.statLabel}>Verified Parents</div>
                </div>
                <div style={s.statItem}>
                  <div style={s.statValue}>50+</div>
                  <div style={s.statLabel}>Certified Doctors</div>
                </div>
                <div style={s.statItem}>
                  <div style={s.statValue}>12,000+</div>
                  <div style={s.statLabel}>Consultations</div>
                </div>
                <div style={s.statItem}>
                  <div style={s.statValue}>98%</div>
                  <div style={s.statLabel}>Satisfaction Rate</div>
                </div>
              </div>

              <div style={s.statsFooter}>
                <div style={s.responseIndicator}>
                  <div style={{ ...s.statusDot, background: "#10b981" }} className="home-status-dot" />
                  <span style={{ fontSize: 12, color: TEXT_BODY, fontWeight: 600 }}>
                    Doctors available within 2 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES SECTION ═══════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <div style={s.secHeader} className="bc-anim-fadeUp">
            <span style={s.secTag}>Our Services</span>
            <h2 style={s.secTitle}>Comprehensive Pediatric Care</h2>
            <p style={s.secSub}>
              From symptom assessment to specialist consultations — we provide
              end-to-end healthcare solutions for your child.
            </p>
          </div>

          <div style={s.servicesGrid}>
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                style={s.serviceCard}
                className={`home-service-card bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}
              >
                <div style={s.serviceIconWrap} className="home-service-icon">
                  <Icon size={22} color={MINT_DARK} />
                </div>
                <h3 style={s.serviceTitle}>{title}</h3>
                <p style={s.serviceDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ ...s.section, background: "#fafffe" }}>
        <div style={s.secInner}>
          <div style={s.secHeader} className="bc-anim-fadeUp">
            <span style={s.secTag}>How It Works</span>
            <h2 style={s.secTitle}>Three Steps to Better Care</h2>
            <p style={s.secSub}>
              Get started with BabyCare in minutes. No complicated forms, no long wait times.
            </p>
          </div>

          <div style={s.stepsRow}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={s.stepCol} className={`home-step bc-anim-fadeUp bc-d${i + 2}`}>
                <div style={s.stepNum} className="home-step-num">{step.num}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SYMPTOM CHECKER ═══════════════ */}
      <section style={s.symSection}>
        <div style={s.secInner}>
          <div style={s.symGrid} className="home-sym-grid">
            <div style={s.symLeft} className="bc-anim-fadeLeft">
              <span style={{ ...s.secTag, background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Try It Now
              </span>
              <h2 style={{ ...s.secTitle, color: "#fff" }}>
                Quick Symptom<br />Assessment
              </h2>
              <p style={{ ...s.secSub, color: "rgba(255,255,255,0.85)" }}>
                Select your child's symptoms to get instant treatment recommendations.
                Our medical database analyzes thousands of cases to provide accurate guidance.
              </p>
              <div style={s.symStats}>
                <div>
                  <div style={s.symStatNum}>98%</div>
                  <div style={s.symStatLbl}>Accuracy Rate</div>
                </div>
                <div>
                  <div style={s.symStatNum}>{"<60s"}</div>
                  <div style={s.symStatLbl}>Average Time</div>
                </div>
              </div>
            </div>

            <div style={s.symRight} className="bc-anim-fadeRight bc-d1">
              <div style={s.symCardHeader}>
                <h3 style={s.symCardTitle}>Select Symptoms</h3>
                <span style={s.symCardCount}>
                  {selectedSymptoms.length} selected
                </span>
              </div>

              <div style={s.symBtnGrid}>
                {SYMPTOMS.map(({ Icon, label, color }, i) => {
                  const active = selectedSymptoms.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleSymptom(label)}
                      className={`home-sym-btn ${active ? "active" : ""}`}
                      style={{ ...s.symBtn, ...(active ? s.symBtnActive : {}) }}
                    >
                      <div style={{ ...s.symBtnIcon, background: active ? color + "20" : "#f4f9f6" }}>
                        <Icon size={18} color={active ? color : TEXT_MUTED} />
                      </div>
                      <span style={{ ...s.symBtnLabel, color: active ? TEXT_DARK : TEXT_BODY }}>
                        {label}
                      </span>
                      {active && (
                        <FaCheckCircle size={14} color={MINT} style={{ marginLeft: "auto" }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                style={{
                  ...s.symCheckBtn,
                  opacity: selectedSymptoms.length > 0 ? 1 : 0.5,
                  cursor: selectedSymptoms.length > 0 ? "pointer" : "not-allowed",
                }}
                className="home-sym-check-btn"
                disabled={selectedSymptoms.length === 0}
                onClick={() => navigate("/Symptomchecker")}
              >
                Get Treatment Recommendations
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DOCTORS SECTION ═══════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <div style={s.secHeader} className="bc-anim-fadeUp">
            <span style={s.secTag}>Our Specialists</span>
            <h2 style={s.secTitle}>Meet Our Certified Doctors</h2>
            <p style={s.secSub}>
              All doctors on our platform are verified by PMDC (Pakistan Medical &
              Dental Council) and have passed our rigorous quality standards.
            </p>
          </div>

          <div style={s.docGrid}>
            {DOCTORS.map((doc, i) => (
              <div key={doc.name} style={s.docCard} className={`home-doc-card bc-anim-fadeUp bc-d${i + 2}`}>
                <div style={s.docCardTop}>
                  <div style={{ ...s.docAvatar, background: AVATAR_GRADIENTS[i] }} className="home-doc-avatar">
                    {doc.initials}
                  </div>
                  <div style={s.verifiedBadge} className="home-verified-badge">
                    <HiOutlineShieldCheck size={14} color={MINT_DARK} />
                    <span>Verified</span>
                  </div>
                </div>

                <h3 style={s.docName}>{doc.name}</h3>
                <p style={s.docSpec}>{doc.spec}</p>

                <div style={s.docQual}>
                  <FaAward size={11} color={TEXT_MUTED} />
                  <span>{doc.qual}</span>
                  <span style={s.docDot}>·</span>
                  <span>{doc.exp}</span>
                </div>

                <div style={s.docRating}>
                  <FaStar size={13} color="#f59e0b" />
                  <span style={{ fontWeight: 700, color: TEXT_DARK, fontSize: 14 }}>
                    {doc.rating}
                  </span>
                  <span style={{ color: TEXT_MUTED, fontSize: 13 }}>
                    ({doc.reviews} reviews)
                  </span>
                </div>

                <button style={s.docBtn} className="home-doc-btn" onClick={() => navigate("/DoctorBooking")}>
                  Book Consultation
                  <FaArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }} className="bc-anim-fadeUp bc-d5">
            <button style={s.btnGhost} className="home-btn-ghost" onClick={() => navigate("/DoctorBooking")}>
              View All 50+ Doctors
              <FaArrowRight size={11} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section style={{ ...s.section, background: "#fafffe" }}>
        <div style={s.secInner}>
          <div style={s.secHeader} className="bc-anim-fadeUp">
            <span style={s.secTag}>Testimonials</span>
            <h2 style={s.secTitle}>What Parents Are Saying</h2>
          </div>

          <div style={s.testiGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={s.testiCard} className={`home-testi-card bc-anim-fadeUp bc-d${i + 2}`}>
                <FaQuoteLeft size={22} color={MINT_LIGHT} />
                <p style={s.testiText}>{t.text}</p>
                <div style={s.testiAuthor}>
                  <div style={s.testiAvatar}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={s.testiName}>{t.name}</div>
                    <div style={s.testiRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section style={s.ctaSection}>
        <div style={s.secInner}>
          <div style={s.ctaInner} className="bc-anim-fadeUp">
            <div style={s.ctaContent}>
              <h2 style={s.ctaTitle}>
                Ready to Get Started?
              </h2>
              <p style={s.ctaSub}>
                Join thousands of Pakistani parents who trust BabyCare for their child's healthcare.
                Sign up today — no credit card required.
              </p>
              <div style={s.ctaBtns}>
                <button
                  style={{ ...s.btnPrimary, background: "#fff", color: MINT_DARK, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  className="home-btn-ghost"
                  onClick={() => navigate("/login")}
                >
                  Create Free Account
                  <FaArrowRight size={12} />
                </button>
                <button
                  style={{ ...s.btnPrimary, background: "#fff", color: MINT_DARK, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  className="home-btn-secondary"
                  onClick={() => navigate("/DoctorBooking")}
                >
                  <FaPhoneAlt size={12} />
                  Browse Doctors
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#fff", fontFamily: "'Inter','Nunito','Segoe UI',sans-serif", color: TEXT_DARK },

  // HERO
  hero: { position: "relative", padding: "80px 24px 100px", overflow: "hidden", background: "linear-gradient(180deg, #fafffe 0%, #ffffff 100%)" },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: `radial-gradient(circle at 90% 10%, ${MINT_LIGHT} 0%, transparent 40%), radial-gradient(circle at 10% 90%, #f0faf4 0%, transparent 40%)`,
    pointerEvents: "none",
  },
  heroInner: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2 },
  heroLeft: {},
  trustBadge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#fff", border: `1.5px solid ${MINT}`, borderRadius: 30, fontSize: 12.5, fontWeight: 700, color: MINT_DARK, marginBottom: 24, boxShadow: "0 2px 8px rgba(42,157,92,0.1)", cursor: "default" },
  heroTitle: { fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, color: TEXT_DARK, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 },
  heroSub: { fontSize: 16.5, color: TEXT_BODY, lineHeight: 1.7, marginBottom: 32, maxWidth: 520 },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 },
  trustIndicators: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  trustItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT_MUTED, fontWeight: 700 },
  trustDivider: { width: 1, height: 12, background: BORDER },

  heroRight: {},
  statsCard: { background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 20px 60px rgba(15,32,24,0.08), 0 0 0 1px rgba(15,32,24,0.04)", border: `1px solid ${BORDER}` },
  statsHeader: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 18, borderBottom: `1px solid ${BORDER}`, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", background: MINT, boxShadow: `0 0 0 4px ${MINT}33` },
  statsLabel: { fontSize: 12.5, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 0.5, textTransform: "uppercase" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  statItem: { padding: "8px 0" },
  statValue: { fontSize: 28, fontWeight: 800, color: TEXT_DARK, letterSpacing: "-0.5px", lineHeight: 1.1 },
  statLabel: { fontSize: 12.5, color: TEXT_MUTED, fontWeight: 600, marginTop: 4 },
  statsFooter: { marginTop: 22, paddingTop: 18, borderTop: `1px solid ${BORDER}` },
  responseIndicator: { display: "flex", alignItems: "center", gap: 8 },

  // BUTTONS
  btnPrimary: { background: MINT_DARK, color: "#fff", border: "none", borderRadius: 10, padding: "13px 24px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(26,110,63,0.25)" },
  btnSecondary: { background: "#fff", color: TEXT_DARK, border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "12px 22px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 },
  btnGhost: { background: "transparent", color: MINT_DARK, border: `1.5px solid ${MINT}`, borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 },

  // SECTIONS
  section: { padding: "80px 24px", background: "#fff" },
  secInner: { maxWidth: 1200, margin: "0 auto" },
  secHeader: { textAlign: "center", maxWidth: 640, margin: "0 auto 56px" },
  secTag: { display: "inline-block", padding: "5px 12px", background: MINT_LIGHT, color: MINT_DARK, borderRadius: 6, fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 },
  secTitle: { fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: TEXT_DARK, lineHeight: 1.2, letterSpacing: "-1px", marginBottom: 14 },
  secSub: { fontSize: 16, color: TEXT_BODY, lineHeight: 1.7 },

  // SERVICES
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  serviceCard: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "28px 24px" },
  serviceIconWrap: { width: 48, height: 48, borderRadius: 11, background: MINT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  serviceTitle: { fontSize: 17, fontWeight: 800, color: TEXT_DARK, marginBottom: 10, letterSpacing: "-0.3px" },
  serviceDesc: { fontSize: 14, color: TEXT_BODY, lineHeight: 1.65 },

  // STEPS
  stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 },
  stepCol: { textAlign: "center", padding: "0 16px" },
  stepNum: { width: 56, height: 56, margin: "0 auto 20px", borderRadius: "50%", background: MINT_DARK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, letterSpacing: 0.5, boxShadow: "0 8px 20px rgba(26,110,63,0.25)" },
  stepTitle: { fontSize: 18, fontWeight: 800, color: TEXT_DARK, marginBottom: 10, letterSpacing: "-0.3px" },
  stepDesc: { fontSize: 14, color: TEXT_BODY, lineHeight: 1.65, maxWidth: 280, margin: "0 auto" },

  // SYMPTOM CHECKER
  symSection: { padding: "80px 24px", background: `linear-gradient(135deg, ${MINT_DARK} 0%, ${MINT} 100%)`, position: "relative", overflow: "hidden" },
  symGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" },
  symLeft: { color: "#fff" },
  symStats: { display: "flex", gap: 40, marginTop: 28 },
  symStatNum: { fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.1 },
  symStatLbl: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 4 },
  symRight: { background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  symCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` },
  symCardTitle: { fontSize: 16, fontWeight: 800, color: TEXT_DARK },
  symCardCount: { background: MINT_LIGHT, color: MINT_DARK, padding: "4px 11px", borderRadius: 6, fontSize: 11.5, fontWeight: 800 },
  symBtnGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 },
  symBtn: { background: "#fafffe", border: `1.5px solid ${BORDER}`, borderRadius: 11, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit", textAlign: "left" },
  symBtnActive: { background: MINT_LIGHT, border: `2px solid ${MINT}` },
  symBtnIcon: { width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  symBtnLabel: { fontSize: 13, fontWeight: 700 },
  symCheckBtn: { width: "100%", background: MINT_DARK, color: "#fff", border: "none", borderRadius: 11, padding: "14px", fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },

  // DOCTORS
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  docCard: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "24px" },
  docCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  docAvatar: { width: 56, height: 56, borderRadius: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, boxShadow: "0 6px 16px rgba(15,32,24,0.15)" },
  verifiedBadge: { display: "inline-flex", alignItems: "center", gap: 5, background: MINT_LIGHT, color: MINT_DARK, padding: "4px 9px", borderRadius: 5, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3 },
  docName: { fontSize: 16.5, fontWeight: 800, color: TEXT_DARK, marginBottom: 4, letterSpacing: "-0.3px" },
  docSpec: { fontSize: 13.5, color: MINT_DARK, fontWeight: 700, marginBottom: 12 },
  docQual: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: TEXT_MUTED, fontWeight: 600, marginBottom: 14 },
  docDot: { color: BORDER, margin: "0 2px" },
  docRating: { display: "flex", alignItems: "center", gap: 6, paddingBottom: 14, borderBottom: `1px solid ${BORDER}`, marginBottom: 14 },
  docBtn: { width: "100%", background: "#fff", color: MINT_DARK, border: `1.5px solid ${MINT}`, borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 },

  // TESTIMONIALS
  testiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 },
  testiCard: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "26px" },
  testiText: { fontSize: 14.5, color: TEXT_BODY, lineHeight: 1.7, margin: "14px 0 22px", fontStyle: "italic" },
  testiAuthor: { display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: `1px solid ${BORDER}` },
  testiAvatar: { width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 },
  testiName: { fontSize: 14, fontWeight: 800, color: TEXT_DARK },
  testiRole: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600, marginTop: 2 },

  // CTA
  ctaSection: { padding: "80px 24px", background: "#fff" },
  ctaInner: { background: `linear-gradient(135deg, ${MINT_DARK} 0%, ${MINT} 100%)`, borderRadius: 24, padding: "60px 40px", textAlign: "center", position: "relative", overflow: "hidden" },
  ctaContent: { position: "relative", zIndex: 2, maxWidth: 600, margin: "0 auto" },
  ctaTitle: { fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-1px", lineHeight: 1.2 },
  ctaSub: { fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, marginBottom: 32 },
  ctaBtns: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
};