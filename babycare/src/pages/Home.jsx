import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaLeaf, FaCarrot, FaUserMd, FaSearch, FaClipboardList, FaBell,
  FaStar, FaCheckCircle, FaArrowRight, FaShieldAlt, FaHeart
} from "react-icons/fa";
import { MdBabyChangingStation, MdOutlineSick, MdHotelClass } from "react-icons/md";
import { GiBabyFace } from "react-icons/gi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const SYMPTOMS = [
  { Icon: MdOutlineSick, label: "Fever" },
  { Icon: FaHeart, label: "Cold & Cough" },
  { Icon: GiBabyFace, label: "Teething Pain" },
  { Icon: MdOutlineSick, label: "Diarrhea" },
  { Icon: FaBell, label: "Sleep Issues" },
  { Icon: MdBabyChangingStation, label: "Feeding Problems" },
];

const FEATURES = [
  { Icon: FaLeaf, title: "Homeopathic Remedies", desc: "Safe, natural homeopathic treatment suggestions for your baby's common illnesses." },
  { Icon: FaCarrot, title: "Organic Treatments", desc: "Trusted organic home remedies passed down through generations, verified by experts." },
  { Icon: FaUserMd, title: "Doctor Consultation", desc: "Book appointments with certified pediatric doctors directly through our platform." },
  { Icon: FaSearch, title: "Symptom Checker", desc: "Input your baby's symptoms and instantly receive dual treatment recommendations." },
  { Icon: FaClipboardList, title: "Treatment History", desc: "Track your baby's health history and previous treatments in one secure place." },
  { Icon: FaBell, title: "Health Reminders", desc: "Set reminders for medication schedules and upcoming doctor appointments." },
];

const DOCTORS = [
  { name: "Dr. Ayesha Malik", spec: "Pediatric Homeopath", exp: "8 yrs", avail: "Available Today", avatar: "AM", rating: 4.9 },
  { name: "Dr. Usman Raza", spec: "Child Specialist", exp: "12 yrs", avail: "Available Tomorrow", avatar: "UR", rating: 4.8 },
  { name: "Dr. Sana Tariq", spec: "Organic Medicine", exp: "6 yrs", avail: "Available Today", avatar: "ST", rating: 4.7 },
];

const STEPS = [
  { num: "01", Icon: FaSearch, title: "Select Symptoms", desc: "Choose your baby's symptoms from our easy-to-use symptom selector." },
  { num: "02", Icon: FaLeaf, title: "Get Treatments", desc: "Receive both homeopathic and organic remedy suggestions instantly." },
  { num: "03", Icon: FaUserMd, title: "Consult a Doctor", desc: "Not sure? Book a quick appointment with a certified specialist." },
];

const AVATAR_BG = ["#2a9d5c", "#1a5c8a", "#7c3aed"];

export default function Home() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const toggleSymptom = (label) =>
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );

  return (
    <div style={s.root}>
      {/* ── HERO ── */}
      <section style={s.hero} id="home">
        {/* Animated background orbs */}
        <div className="bc-orb" style={{ width: 420, height: 420, background: "#a7f3c4", top: "-150px", right: "-100px" }} />
        <div className="bc-orb" style={{ width: 320, height: 320, background: "#d1f5e0", bottom: "-100px", left: "10%", animationDelay: "3s" }} />
        <div style={s.heroBg} />

        <div style={s.heroInner}>
          <div style={s.heroContent} className="bc-anim-fadeLeft">
            <span style={s.heroBadge} className="bc-anim-fadeUp">
              <FaLeaf size={11} /> &nbsp;Natural & Safe Baby Care
            </span>
            <h1 style={s.heroTitle} className="bc-anim-fadeUp bc-d1">
              Gentle Treatments for<br />
              <span style={{ color: MINT }}>Your Little One</span>
            </h1>
            <p style={s.heroSub} className="bc-anim-fadeUp bc-d2">
              BabyCare provides trusted homeopathic & organic treatment
              suggestions for common baby illnesses — plus easy doctor
              appointment booking, all in one place.
            </p>
            <div style={s.heroBtns} className="bc-anim-fadeUp bc-d3">
              <button style={s.btnHeroPri} className="bc-btn-glow" onClick={() => navigate("/Symptomchecker")}>
                Check Symptoms <FaArrowRight size={13} />
              </button>
              <button style={s.btnHeroOut} className="bc-btn-outline-glow" onClick={() => navigate("/DoctorBooking")}>
                Book a Doctor
              </button>
            </div>
            <div style={s.stats} className="bc-anim-fadeUp bc-d4">
              {[["5,000+", "Parents Trust Us"], ["50+", "Certified Doctors"], ["100%", "Safe Remedies"]].map(([v, l]) => (
                <div key={l}>
                  <span style={s.statVal}>{v}</span>
                  <span style={s.statLbl}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.heroCards} className="bc-anim-fadeRight bc-d2">
            <div style={s.hcard} className="bc-glow-on-hover bc-float">
              <div style={s.hcardIcon}><GiBabyFace size={24} color={MINT} /></div>
              <div>
                <div style={s.hcardTitle}>Baby Health Advisory</div>
                <div style={s.hcardSub}>Homeopathic + Organic Dual Treatments</div>
              </div>
            </div>
            <div
              style={{ ...s.hcard, marginLeft: 24, background: "rgba(240,250,244,0.8)" }}
              className="bc-glow-on-hover bc-float"
            >
              <div style={s.hcardIcon}><FaCheckCircle size={22} color={MINT} /></div>
              <div>
                <div style={s.hcardTitle}>Treatment Found!</div>
                <div style={s.hcardSub}>Chamomilla 30C · Ginger Honey Syrup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={s.section}>
        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">Simple Process</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">How BabyCare Works</h2>
          <div style={s.stepsGrid}>
            {STEPS.map((st, i) => (
              <div
                key={st.num}
                style={s.stepCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 2}`}
              >
                <div style={s.stepNum}>{st.num}</div>
                <div style={s.stepIconBox}><st.Icon size={22} color={MINT} /></div>
                <h3 style={s.stepTitle}>{st.title}</h3>
                <p style={s.stepDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYMPTOM CHECKER PREVIEW ── */}
      <section style={{ ...s.section, background: "linear-gradient(135deg, #f0faf4 0%, #e8f8ef 100%)", position: "relative", overflow: "hidden" }} id="symptoms">
        <div className="bc-orb" style={{ width: 280, height: 280, background: "#a7f3c4", top: "-80px", right: "5%", animationDelay: "1.5s" }} />
        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">Try It Now</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">Select Your Baby's Symptoms</h2>
          <p style={{ color: "#5a7a6a", fontSize: 15, marginBottom: 28 }} className="bc-anim-fadeUp bc-d2">
            Tap any symptoms below — then get treatment suggestions
          </p>
          <div style={s.symGrid}>
            {SYMPTOMS.map(({ Icon, label }, i) => {
              const active = selectedSymptoms.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleSymptom(label)}
                  className={`bc-glow-on-hover bc-anim-popIn bc-d${i + 1}`}
                  style={{ ...s.symBtn, ...(active ? s.symBtnActive : {}) }}
                >
                  <Icon size={24} color={active ? MINT_DARK : MINT} />
                  <span style={{ ...s.symLabel, color: active ? MINT_DARK : "#1a2e24" }}>{label}</span>
                </button>
              );
            })}
          </div>
          {selectedSymptoms.length > 0 && (
            <div style={s.symResult} className="bc-anim-fadeUp">
              <span style={{ fontSize: 14, color: "#3d5a48", fontWeight: 700 }}>
                Selected: {selectedSymptoms.join(", ")}
              </span>
              <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/symptom-checker")}>
                Get Full Results <FaArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={s.section} id="features">
        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">What We Offer</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">Everything Your Baby Needs</h2>
          <div style={s.featGrid}>
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                style={s.featCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}
              >
                <div style={s.featIconBox}><Icon size={22} color={MINT} /></div>
                <h3 style={s.featTitle}>{title}</h3>
                <p style={s.featDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section style={{ ...s.section, background: "linear-gradient(135deg, #f0faf4 0%, #e8f8ef 100%)", position: "relative", overflow: "hidden" }} id="doctors">
        <div className="bc-orb" style={{ width: 300, height: 300, background: "#d1f5e0", bottom: "-80px", left: "-50px", animationDelay: "2s" }} />
        <div style={s.secInner}>
          <p style={s.secTag} className="bc-anim-fadeUp">Our Specialists</p>
          <h2 style={s.secTitle} className="bc-anim-fadeUp bc-d1">Meet Our Doctors</h2>
          <div style={s.docGrid}>
            {DOCTORS.map((doc, i) => (
              <div
                key={doc.name}
                style={s.docCard}
                className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 2}`}
              >
                <div style={{ ...s.docAvatar, background: AVATAR_BG[i] }}>{doc.avatar}</div>
                <h3 style={s.docName}>{doc.name}</h3>
                <p style={s.docSpec}>{doc.spec}</p>
                <div style={s.docRating}>
                  <FaStar size={12} color="#e8a045" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e24" }}>{doc.rating}</span>
                  <span style={{ fontSize: 12, color: "#9ab5a5" }}>· {doc.exp}</span>
                </div>
                <span style={s.availBadge}>
                  <FaCheckCircle size={10} color={MINT} /> {doc.avail}
                </span>
                <button
                  style={{ ...s.btnPrimary, width: "100%", marginTop: 14 }}
                  className="bc-btn-glow"
                  onClick={() => navigate("/doctor-booking")}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <div style={s.trustBand} className="bc-anim-fadeUp">
        {[
          [FaShieldAlt, "Safe & Reliable Information"],
          [FaUserMd, "Verified by Pediatric Doctors"],
          [FaLeaf, "100% Natural Remedies"],
          [FaCheckCircle, "Trusted by 5,000+ Parents"],
        ].map(([Icon, label], i) => (
          <div key={label} style={s.trustItem} className={`bc-anim-fadeUp bc-d${i + 1}`}>
            <Icon size={16} color={MINT} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div className="bc-orb" style={{ width: 360, height: 360, background: "#5fcf8f", top: "-100px", right: "-80px" }} />
        <div className="bc-orb" style={{ width: 280, height: 280, background: "#7ce0a4", bottom: "-80px", left: "-40px", animationDelay: "2.5s" }} />
        <h2 style={s.ctaTitle} className="bc-anim-fadeUp">Start Caring for Your Baby Today</h2>
        <p style={s.ctaSub} className="bc-anim-fadeUp bc-d1">
          Join thousands of Pakistani parents who trust BabyCare for safe, natural guidance.
        </p>
        <button
          style={s.btnHeroPri}
          className="bc-btn-glow bc-anim-fadeUp bc-d2"
          onClick={() => navigate("/login")}
        >
          Create Free Account <FaArrowRight size={13} />
        </button>
      </section>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", fontFamily: "'Nunito','Segoe UI',sans-serif", color: "#1a2e24", background: "#fff" },
  hero: { position: "relative", background: "linear-gradient(135deg, #fff 0%, #fafffe 100%)", overflow: "hidden" },
  heroBg: { position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: "radial-gradient(ellipse at 70% 50%, #e8f8ef 0%, transparent 70%)", pointerEvents: "none" },
  heroInner: { maxWidth: 1100, margin: "0 auto", padding: "68px 24px 76px", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", position: "relative", zIndex: 2 },
  heroContent: { flex: "1 1 380px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(232,248,239,0.85)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: MINT_DARK, borderRadius: 20, padding: "6px 16px",
    fontSize: 12.5, fontWeight: 800, marginBottom: 18,
    border: "1px solid rgba(42,157,92,0.18)",
  },
  heroTitle: { fontSize: "clamp(30px,4.5vw,50px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 18px", color: "#0f2018", letterSpacing: "-1px" },
  heroSub: { fontSize: 16, color: "#4a6858", lineHeight: 1.75, margin: "0 0 30px", maxWidth: 480 },
  heroBtns: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 },
  btnHeroPri: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 11,
    padding: "13px 28px", fontWeight: 800, fontSize: 15,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    boxShadow: "0 4px 18px rgba(42,157,92,0.35)", fontFamily: "inherit",
  },
  btnHeroOut: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: MINT, border: `2px solid ${MINT}`, borderRadius: 11,
    padding: "13px 28px", fontWeight: 800, fontSize: 15,
    cursor: "pointer", fontFamily: "inherit",
  },
  stats: { display: "flex", gap: 36, flexWrap: "wrap" },
  statVal: { display: "block", fontSize: 24, fontWeight: 900, color: MINT },
  statLbl: { display: "block", fontSize: 12, color: "#6a8878", fontWeight: 600 },
  heroCards: { flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 14 },
  hcard: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1.5px solid rgba(200,232,216,0.6)",
    borderRadius: 14, padding: "16px 18px",
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "0 6px 22px rgba(42,157,92,0.12)",
  },
  hcardIcon: { width: 42, height: 42, background: MINT_LIGHT, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  hcardTitle: { fontSize: 14, fontWeight: 800, color: "#1a2e24", marginBottom: 3 },
  hcardSub: { fontSize: 12, color: "#5a7a6a" },
  section: { padding: "68px 24px" },
  secInner: { maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 },
  secTag: { color: MINT, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 },
  secTitle: { fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px", margin: "0 0 36px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 },
  stepCard: {
    background: "rgba(248,253,251,0.7)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(212,237,223,0.8)",
    borderRadius: 14, padding: "28px 24px",
  },
  stepNum: { fontSize: 32, fontWeight: 900, color: MINT_LIGHT, WebkitTextStroke: `2px ${MINT}`, marginBottom: 12 },
  stepIconBox: { width: 44, height: 44, background: MINT_LIGHT, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  stepTitle: { fontSize: 17, fontWeight: 800, color: "#0f2018", margin: "0 0 8px" },
  stepDesc: { fontSize: 14, color: "#5a7a6a", lineHeight: 1.65, margin: 0 },
  symGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12, marginBottom: 24 },
  symBtn: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "2px solid rgba(224,237,230,0.7)",
    borderRadius: 13, padding: "18px 10px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    cursor: "pointer", position: "relative", fontFamily: "inherit",
  },
  symBtnActive: {
    background: "rgba(232,248,239,0.9)",
    border: `2px solid ${MINT}`,
    boxShadow: `0 0 0 4px rgba(42,157,92,0.14), 0 8px 22px rgba(42,157,92,0.18)`,
  },
  symLabel: { fontSize: 13, fontWeight: 800 },
  symResult: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: `2px solid ${MINT}`,
    borderRadius: 12, padding: "16px 22px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 12,
    boxShadow: "0 8px 24px rgba(42,157,92,0.18)",
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 22px", fontWeight: 800, fontSize: 14,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.3)",
  },
  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 },
  featCard: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(224,237,230,0.7)",
    borderRadius: 14, padding: "26px 22px",
  },
  featIconBox: { width: 46, height: 46, background: MINT_LIGHT, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  featTitle: { fontSize: 16, fontWeight: 800, color: "#0f2018", margin: "0 0 8px" },
  featDesc: { fontSize: 13.5, color: "#5a7a6a", lineHeight: 1.65, margin: 0 },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 },
  docCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(12px) saturate(140%)",
    WebkitBackdropFilter: "blur(12px) saturate(140%)",
    border: "1.5px solid rgba(212,237,223,0.7)",
    borderRadius: 16, padding: "26px 22px",
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    boxShadow: "0 6px 20px rgba(42,157,92,0.10)",
  },
  docAvatar: {
    width: 64, height: 64, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
  docName: { fontSize: 16, fontWeight: 800, color: "#0f2018", margin: "0 0 4px" },
  docSpec: { fontSize: 12.5, color: MINT, fontWeight: 700, margin: "0 0 8px" },
  docRating: { display: "flex", alignItems: "center", gap: 5, marginBottom: 10 },
  availBadge: { display: "inline-flex", alignItems: "center", gap: 5, background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 },
  trustBand: {
    background: "linear-gradient(90deg, #e8f8ef 0%, #d1f5e0 50%, #e8f8ef 100%)",
    borderTop: `1px solid #c8e8d8`, borderBottom: `1px solid #c8e8d8`,
    padding: "22px 32px", display: "flex", justifyContent: "space-around",
    flexWrap: "wrap", gap: 20,
  },
  trustItem: { display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 700, color: MINT_DARK },
  cta: {
    background: `linear-gradient(135deg, ${MINT_DARK}, ${MINT})`,
    padding: "72px 24px", textAlign: "center",
    position: "relative", overflow: "hidden",
  },
  ctaTitle: { fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px", position: "relative", zIndex: 2 },
  ctaSub: { color: "rgba(255,255,255,0.88)", fontSize: 16, margin: "0 0 30px", lineHeight: 1.7, position: "relative", zIndex: 2 },
};
