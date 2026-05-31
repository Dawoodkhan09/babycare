import { useNavigate } from "react-router-dom";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const STATS = [
  { value: "5,000+", label: "Happy Parents",      icon: "👨‍👩‍👧" },
  { value: "50+",    label: "Verified Doctors",   icon: "👨‍⚕️" },
  { value: "12,000+",label: "Symptom Checks",     icon: "🔍" },
  { value: "100%",   label: "Natural & Safe",     icon: "🌿" },
];

const VALUES = [
  {
    icon: "🌿",
    title: "Natural First",
    desc: "Hum maante hain ke chote bachon ke liye natural homeopathic aur organic treatments sab se safe hain — bina kisi side effects ke."
  },
  {
    icon: "🛡️",
    title: "Verified & Trusted",
    desc: "Hamaray sab doctors PMDC registered hain aur unke documents thoroughly verify kiye jaate hain pehle approval se."
  },
  {
    icon: "💚",
    title: "Parent-Centric",
    desc: "Har feature parents ki real zaroorat ko dekh ke design kiya gaya hai — easy, accessible, aur 24/7 available."
  },
  {
    icon: "🤝",
    title: "Community Care",
    desc: "Pakistani parents ke liye, Pakistani context mein — local doctors, local remedies, aur Urdu/English support."
  },
];

const STEPS = [
  { num: "01", icon: "🔍", title: "Check Symptoms",     desc: "Apne bachay ke symptoms select karo hamare easy symptom checker se." },
  { num: "02", icon: "🌿", title: "Get Treatments",     desc: "Homeopathic aur organic — dono tarah ki treatment suggestions paayein." },
  { num: "03", icon: "👨‍⚕️", title: "Book a Doctor",     desc: "Agar zaroorat ho to verified pediatric doctor se appointment book karein." },
  { num: "04", icon: "💊", title: "Order Medicines",   desc: "BabyCare Shop se genuine homeopathic medicines ghar par mangwayein." },
];

const TEAM = [
  { name: "Dawood Ahmed",   role: "Founder & Developer",   avatar: "DA", color: "#2a9d5c", bio: "FYP project lead — Full Stack Developer" },
  { name: "Dr. Ayesha Malik",role: "Medical Advisor",       avatar: "AM", color: "#7c3aed", bio: "Pediatric Homeopath, 8+ years experience" },
  { name: "Dr. Usman Raza",  role: "Pediatric Consultant",  avatar: "UR", color: "#1a5c8a", bio: "Child Specialist, 12+ years experience" },
  { name: "Sana Tariq",      role: "Content & Research",    avatar: "ST", color: "#be123c", bio: "Organic medicine researcher" },
];

const FAQS = [
  {
    q: "BabyCare ka use kaun kar sakta hai?",
    a: "Koi bhi parent ya caregiver jo apne 0-5 saal ke bachay ki sehat ke liye natural aur safe treatment options dhundh raha ho. App bilkul free hai signup ke liye.",
  },
  {
    q: "Kya yahan diye gaye remedies safe hain?",
    a: "Haan! Sab homeopathic aur organic remedies certified pediatric doctors aur homeopaths ne review kiye hain. Lekin agar bachay ki condition serious ho to hamesha doctor se consult karein.",
  },
  {
    q: "Doctor booking kaise kaam karti hai?",
    a: "Aap apni location share karo, nearest available doctors dekho, time slot select karo, aur appointment confirm karo. Doctor aap ko notification ke zariye milega.",
  },
  {
    q: "Doctor kaise verify hote hain?",
    a: "Har doctor ko apna PMDC license, CNIC, aur medical degree upload karna parta hai. Hamari admin team 24-48 hours mein documents verify karti hai phir doctor active hota hai.",
  },
  {
    q: "Kya yeh service Karachi ke ilawa kahin aur bhi hai?",
    a: "Abhi hum sirf Karachi mein launch hue hain, lekin jaldi hi Lahore, Islamabad, aur Pakistan ke baqi major cities mein bhi expand karenge. InshaAllah!",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={s.root}>

      {/* ════════════ HERO ════════════ */}
      <section style={s.hero}>
        {/* Animated background orbs */}
        <div className="bc-orb" style={{ width: 420, height: 420, background: "#a7f3c4", top: "-150px", right: "-100px" }} />
        <div className="bc-orb" style={{ width: 320, height: 320, background: "#d1f5e0", bottom: "-100px", left: "10%", animationDelay: "3s" }} />
        <div className="bc-orb" style={{ width: 240, height: 240, background: "#7ce0a4", top: "40%", left: "-80px", animationDelay: "5s" }} />

        <div style={s.heroInner}>
          <span style={s.heroBadge} className="bc-anim-fadeUp">
            🌿 About BabyCare
          </span>
          <h1 style={s.heroTitle} className="bc-anim-fadeUp bc-d1">
            Caring for Pakistan's<br />
            <span style={{ color: MINT }}>Tiniest Patients</span> 💚
          </h1>
          <p style={s.heroSub} className="bc-anim-fadeUp bc-d2">
            BabyCare is a digital healthcare platform built specifically for Pakistani parents — combining
            <strong style={{ color: MINT_DARK }}> homeopathic wisdom </strong> with
            <strong style={{ color: MINT_DARK }}> modern technology </strong> to provide safe, natural treatment options for babies.
          </p>

          <div style={s.heroBtns} className="bc-anim-fadeUp bc-d3">
            <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/")}>
              Get Started →
            </button>
            <button style={s.btnOutline} className="bc-btn-outline-glow" onClick={() => navigate("/DoctorBooking")}>
              Meet Our Doctors
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section style={s.statsSec}>
        <div style={s.statsGrid}>
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={s.statCard}
              className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
            >
              <div style={s.statIcon}>{stat.icon}</div>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ OUR STORY ════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <div style={s.storyGrid}>
            <div className="bc-anim-fadeLeft">
              <p style={s.secTag}>Our Story</p>
              <h2 style={s.secTitle}>Why We Built BabyCare</h2>
              <p style={s.storyText}>
                Pakistan mein har saal lakhon naye walidain (parents) banti hain — aur unme se zyada tar ko apne bachon ki
                chhoti chhoti illnesses ke liye reliable, safe guidance nahi milti. Internet par ulti seedhi information hai,
                aur har choti baat par doctor jaana mushkil aur mehnga hota hai.
              </p>
              <p style={s.storyText}>
                <strong>BabyCare ki shuruwat</strong> ek hi maqsad se hui: Pakistani parents ko ek aisa platform dena jahan
                woh apne bachon ke symptoms check kar sakein, <em>homeopathic aur organic treatments</em> ki suggestions paayein,
                aur zaroorat ho to certified pediatric doctors se ghar baithe consult karein.
              </p>
              <div style={s.taglineBox} className="bc-anim-fadeUp bc-d2">
                <span style={{ fontSize: 26 }}>💡</span>
                <p style={{ margin: 0, fontSize: 14.5, color: MINT_DARK, fontWeight: 700, lineHeight: 1.65 }}>
                  "Safe natural care for every Pakistani baby — easy, accessible, aur trustworthy."
                </p>
              </div>
            </div>

            <div style={s.storyVisual} className="bc-anim-fadeRight bc-d1">
              <div style={s.storyCard} className="bc-float">
                <div style={s.storyEmoji}>🍼</div>
                <h3 style={s.storyCardTitle}>Mission</h3>
                <p style={s.storyCardDesc}>
                  Pakistan ke har bachay tak safe, natural, aur affordable baby healthcare pohanchana.
                </p>
              </div>
              <div style={{ ...s.storyCard, marginLeft: 30, marginTop: 16, background: "rgba(232,240,255,0.78)" }} className="bc-float" >
                <div style={s.storyEmoji}>🎯</div>
                <h3 style={s.storyCardTitle}>Vision</h3>
                <p style={s.storyCardDesc}>
                  Pakistan ki sab se trusted baby healthcare platform banna — homeopathy + technology ka best combination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ OUR VALUES ════════════ */}
      <section style={{ ...s.section, background: "linear-gradient(135deg, #f0faf4 0%, #e8f8ef 100%)", position: "relative", overflow: "hidden" }}>
        <div className="bc-orb" style={{ width: 280, height: 280, background: "#a7f3c4", top: "10%", right: "-80px", animationDelay: "1.5s" }} />

        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">What We Stand For</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">Our Core Values</h2>
          <p style={s.secSub} className="bc-anim-fadeUp bc-d2">
            Yeh principles hain jin par BabyCare ki har feature, har decision based hai.
          </p>

          <div style={s.valuesGrid}>
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                style={s.valueCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
              >
                <div style={s.valueIcon}>{v.icon}</div>
                <h3 style={s.valueTitle}>{v.title}</h3>
                <p style={s.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section style={s.section}>
        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">Simple 4-Step Process</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">How BabyCare Helps You</h2>

          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                style={s.stepCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
              >
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepIcon}>{step.icon}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TEAM ════════════ */}
      <section style={{ ...s.section, background: "linear-gradient(135deg, #f0faf4 0%, #e8f8ef 100%)", position: "relative", overflow: "hidden" }}>
        <div className="bc-orb" style={{ width: 300, height: 300, background: "#d1f5e0", bottom: "-80px", left: "-50px", animationDelay: "2s" }} />

        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">Meet The Team</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">The People Behind BabyCare</h2>
          <p style={s.secSub} className="bc-anim-fadeUp bc-d2">
            A passionate mix of developers, doctors, aur researchers working together.
          </p>

          <div style={s.teamGrid}>
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                style={s.teamCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
              >
                <div style={{ ...s.teamAvatar, background: member.color }}>{member.avatar}</div>
                <h3 style={s.teamName}>{member.name}</h3>
                <p style={s.teamRole}>{member.role}</p>
                <p style={s.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FAQs ════════════ */}
      <section style={s.section}>
        <div style={{ ...s.secInner, maxWidth: 800 }}>
          <p style={s.secTag} className="bc-anim-fadeUp">Got Questions?</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">Frequently Asked Questions</h2>

          <div style={s.faqList}>
            {FAQS.map((faq, i) => (
              <details
                key={i}
                style={s.faqItem}
                className={`bc-anim-fadeUp bc-d${i + 1}`}
              >
                <summary style={s.faqQ}>
                  <span style={{ fontSize: 18, color: MINT }}>Q.</span>
                  <span style={{ flex: 1 }}>{faq.q}</span>
                  <span style={s.faqToggle}>+</span>
                </summary>
                <p style={s.faqA}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CONTACT / CTA ════════════ */}
      <section style={s.cta}>
        <div className="bc-orb" style={{ width: 360, height: 360, background: "#5fcf8f", top: "-100px", right: "-80px" }} />
        <div className="bc-orb" style={{ width: 280, height: 280, background: "#7ce0a4", bottom: "-80px", left: "-40px", animationDelay: "2.5s" }} />

        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle} className="bc-anim-fadeUp">Have Questions or Feedback?</h2>
          <p style={s.ctaSub} className="bc-anim-fadeUp bc-d1">
            Hum aap se sunna chahte hain! Reach out to us anytime — humari team aap ki help ke liye taiyar hai.
          </p>

          <div style={s.contactGrid}>
            <a href="mailto:support@babycare.pk" style={s.contactCard} className="bc-glow-on-hover bc-anim-fadeUp bc-d2">
              <span style={s.contactIcon}>📧</span>
              <div>
                <div style={s.contactLabel}>Email Us</div>
                <div style={s.contactValue}>support@babycare.pk</div>
              </div>
            </a>
            <a href="tel:+923001234567" style={s.contactCard} className="bc-glow-on-hover bc-anim-fadeUp bc-d3">
              <span style={s.contactIcon}>📞</span>
              <div>
                <div style={s.contactLabel}>Call Us</div>
                <div style={s.contactValue}>+92 300 1234567</div>
              </div>
            </a>
            <div style={s.contactCard} className="bc-glow-on-hover bc-anim-fadeUp bc-d4">
              <span style={s.contactIcon}>📍</span>
              <div>
                <div style={s.contactLabel}>Visit Us</div>
                <div style={s.contactValue}>Karachi, Pakistan 🇵🇰</div>
              </div>
            </div>
          </div>

          <button
            style={s.ctaBtn}
            className="bc-btn-glow bc-anim-fadeUp bc-d5"
            onClick={() => navigate("/login")}
          >
            Start Using BabyCare →
          </button>
        </div>
      </section>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#fff", fontFamily: "'Nunito','Segoe UI',sans-serif", color: "#1a2e24" },

  // HERO
  hero: { position: "relative", background: "linear-gradient(135deg, #fff 0%, #fafffe 100%)", overflow: "hidden", padding: "70px 24px 80px" },
  heroInner: { maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 },
  heroBadge: {
    display: "inline-block",
    background: "rgba(232,248,239,0.85)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: MINT_DARK, borderRadius: 20, padding: "6px 18px",
    fontSize: 13, fontWeight: 800, marginBottom: 20,
    border: "1px solid rgba(42,157,92,0.18)",
  },
  heroTitle: {
    fontSize: "clamp(32px,5vw,52px)", fontWeight: 900,
    lineHeight: 1.15, margin: "0 0 18px",
    color: "#0f2018", letterSpacing: "-1.2px",
  },
  heroSub: { fontSize: 16, color: "#4a6858", lineHeight: 1.75, margin: "0 0 32px", maxWidth: 640, marginLeft: "auto", marginRight: "auto" },
  heroBtns: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 11,
    padding: "13px 28px", fontWeight: 800, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 18px rgba(42,157,92,0.35)",
  },
  btnOutline: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: MINT, border: `2px solid ${MINT}`, borderRadius: 11,
    padding: "13px 28px", fontWeight: 800, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
  },

  // STATS
  statsSec: { padding: "0 24px", marginTop: -40, position: "relative", zIndex: 3 },
  statsGrid: {
    maxWidth: 1000, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    border: "1.5px solid rgba(255,255,255,0.7)",
    borderRadius: 16, padding: "26px 20px",
    textAlign: "center",
    boxShadow: "0 8px 28px rgba(42,157,92,0.12)",
  },
  statIcon: { fontSize: 32, marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: 900, color: MINT_DARK, letterSpacing: "-0.5px", marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#5a7a6a", fontWeight: 700 },

  // SECTION COMMON
  section: { padding: "70px 24px", position: "relative" },
  secInner: { maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 },
  secTag: { color: MINT, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, margin: 0 },
  secTitle: { fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.7px", margin: "8px 0 14px" },
  secSub: { fontSize: 15, color: "#5a7a6a", lineHeight: 1.7, marginBottom: 36, maxWidth: 600 },

  // STORY
  storyGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" },
  storyText: { fontSize: 15, color: "#3d5a48", lineHeight: 1.8, margin: "12px 0" },
  taglineBox: {
    background: "rgba(232,248,239,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: `1.5px solid ${MINT}`, borderRadius: 12,
    padding: "16px 20px", marginTop: 18,
    display: "flex", gap: 14, alignItems: "center",
    boxShadow: "0 4px 16px rgba(42,157,92,0.12)",
  },
  storyVisual: { position: "relative" },
  storyCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1.5px solid rgba(255,255,255,0.7)",
    borderRadius: 18, padding: "26px 24px",
    boxShadow: "0 8px 30px rgba(42,157,92,0.12)",
  },
  storyEmoji: { fontSize: 38, marginBottom: 12 },
  storyCardTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: "0 0 8px" },
  storyCardDesc: { fontSize: 14, color: "#5a7a6a", lineHeight: 1.7, margin: 0 },

  // VALUES
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 },
  valueCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1.5px solid rgba(212,237,223,0.7)",
    borderRadius: 16, padding: "28px 24px",
    boxShadow: "0 6px 22px rgba(42,157,92,0.08)",
  },
  valueIcon: { fontSize: 38, marginBottom: 14 },
  valueTitle: { fontSize: 17, fontWeight: 900, color: "#0f2018", margin: "0 0 10px" },
  valueDesc: { fontSize: 14, color: "#5a7a6a", lineHeight: 1.7, margin: 0 },

  // STEPS
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  stepCard: {
    background: "rgba(248,253,251,0.7)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(212,237,223,0.8)",
    borderRadius: 14, padding: "26px 22px",
    position: "relative",
  },
  stepNum: {
    position: "absolute", top: 16, right: 18,
    fontSize: 36, fontWeight: 900,
    color: "transparent", WebkitTextStroke: `1.5px ${MINT}`,
    opacity: 0.4,
  },
  stepIcon: { fontSize: 36, marginBottom: 14 },
  stepTitle: { fontSize: 16, fontWeight: 900, color: "#0f2018", margin: "0 0 8px" },
  stepDesc: { fontSize: 13.5, color: "#5a7a6a", lineHeight: 1.65, margin: 0 },

  // TEAM
  teamGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 },
  teamCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1.5px solid rgba(212,237,223,0.7)",
    borderRadius: 16, padding: "28px 22px",
    textAlign: "center",
    boxShadow: "0 6px 22px rgba(42,157,92,0.1)",
  },
  teamAvatar: {
    width: 72, height: 72, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 900, color: "#fff",
    margin: "0 auto 14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
  teamName: { fontSize: 16, fontWeight: 900, color: "#0f2018", margin: "0 0 4px" },
  teamRole: { fontSize: 12.5, color: MINT, fontWeight: 800, margin: "0 0 8px" },
  teamBio: { fontSize: 12.5, color: "#5a7a6a", lineHeight: 1.55, margin: 0 },

  // FAQ
  faqList: { display: "flex", flexDirection: "column", gap: 12 },
  faqItem: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(212,237,223,0.7)",
    borderRadius: 12, padding: "4px 4px",
    boxShadow: "0 3px 14px rgba(42,157,92,0.06)",
  },
  faqQ: {
    cursor: "pointer", padding: "16px 20px",
    fontSize: 15, fontWeight: 800, color: "#0f2018",
    display: "flex", alignItems: "center", gap: 12,
    listStyle: "none", userSelect: "none",
  },
  faqToggle: {
    width: 26, height: 26, borderRadius: "50%",
    background: MINT_LIGHT, color: MINT_DARK,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 900, flexShrink: 0,
  },
  faqA: { padding: "0 20px 18px 50px", fontSize: 14, color: "#5a7a6a", lineHeight: 1.75, margin: 0 },

  // CTA
  cta: {
    background: `linear-gradient(135deg, ${MINT_DARK}, ${MINT})`,
    padding: "72px 24px", position: "relative", overflow: "hidden",
  },
  ctaInner: { maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 },
  ctaTitle: { fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px" },
  ctaSub: { color: "rgba(255,255,255,0.9)", fontSize: 16, margin: "0 0 36px", lineHeight: 1.7 },
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 32 },
  contactCard: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: "1.5px solid rgba(255,255,255,0.25)",
    borderRadius: 14, padding: "20px 22px",
    display: "flex", alignItems: "center", gap: 14,
    textAlign: "left", textDecoration: "none", color: "#fff",
  },
  contactIcon: { fontSize: 28, flexShrink: 0 },
  contactLabel: { fontSize: 12, opacity: 0.85, fontWeight: 600, marginBottom: 2 },
  contactValue: { fontSize: 14.5, fontWeight: 900 },
  ctaBtn: {
    background: "#fff", color: MINT_DARK, border: "none",
    borderRadius: 12, padding: "14px 32px",
    fontWeight: 900, fontSize: 15.5,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
  },
};

// ─── Make story grid responsive ───
const mediaStyles = `
  @media (max-width: 768px) {
    [data-story-grid] {
      grid-template-columns: 1fr !important;
      gap: 30px !important;
    }
  }
`;
// Inject media query
if (typeof document !== "undefined" && !document.getElementById("about-mq")) {
  const styleEl = document.createElement("style");
  styleEl.id = "about-mq";
  styleEl.textContent = mediaStyles;
  document.head.appendChild(styleEl);
}
