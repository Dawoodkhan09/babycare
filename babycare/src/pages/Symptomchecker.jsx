import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaTemperatureHalf, FaWind, FaTooth, FaBed,
  FaEye, FaEarDeaf, FaBabyCarriage, FaCheck, FaArrowRight
} from "react-icons/fa6";
import { MdOutlineSick, MdSentimentVeryDissatisfied } from "react-icons/md";
import { GiBabyFace } from "react-icons/gi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const SYMPTOMS = [
  { id: "fever",        Icon: FaTemperatureHalf, label: "Fever",           desc: "High body temperature" },
  { id: "cough",        Icon: FaWind,            label: "Cold & Cough",    desc: "Runny nose, sneezing" },
  { id: "teething",     Icon: FaTooth,           label: "Teething Pain",   desc: "Gum irritation, drooling" },
  { id: "diarrhea",     Icon: MdOutlineSick,     label: "Diarrhea",        desc: "Loose or watery stools" },
  { id: "sleep",        Icon: FaBed,             label: "Sleep Issues",    desc: "Restlessness at night" },
  { id: "feeding",      Icon: FaBabyCarriage,    label: "Feeding Problems",desc: "Refuses milk or food" },
  { id: "rash",         Icon: MdSentimentVeryDissatisfied, label: "Skin Rash", desc: "Redness or itchy skin" },
  { id: "vomit",        Icon: MdOutlineSick,     label: "Vomiting",        desc: "Nausea or throwing up" },
  { id: "colic",        Icon: GiBabyFace,        label: "Colic / Crying",  desc: "Excessive unexplained crying" },
  { id: "constipation", Icon: MdOutlineSick,     label: "Constipation",    desc: "Hard or infrequent stools" },
  { id: "earache",      Icon: FaEarDeaf,         label: "Ear Pain",        desc: "Pulling at ears, fussiness" },
  { id: "eye",          Icon: FaEye,             label: "Eye Discharge",   desc: "Sticky or watery eyes" },
];

const AGE_GROUPS = ["0–3 months", "3–6 months", "6–12 months", "1–2 years", "2–5 years"];
const DURATIONS  = ["Less than 1 day", "1–2 days", "3–5 days", "More than 5 days"];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState("");
  const [step, setStep] = useState(1);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const canNext = selected.length > 0;
  const canSubmit = age !== "" && duration !== "";

  return (
    <div style={s.root}>
      {/* Decorative orbs */}
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", left: "-100px" }} />
      <div className="bc-orb" style={{ width: 280, height: 280, background: "#d1f5e0", top: "30%", right: "-80px", animationDelay: "3s" }} />

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header} className="bc-anim-fadeUp">
          <span style={s.badge}>Symptom Checker</span>
          <h1 style={s.title}>What's bothering your baby?</h1>
          <p style={s.sub}>Select all symptoms your baby is experiencing right now</p>
        </div>

        {/* PROGRESS */}
        <div style={s.progress} className="bc-anim-fadeUp bc-d1">
          {["Select Symptoms", "Baby Details", "Get Results"].map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={s.progStep}>
                  <div
                    className={active ? "bc-glow-pulse" : ""}
                    style={{
                      ...s.progDot,
                      background: done || active ? MINT : "#e0ede6",
                      color: done || active ? "#fff" : "#9ab5a5",
                    }}
                  >
                    {done ? <FaCheck size={11} className="bc-check-pop" /> : num}
                  </div>
                  <span style={{ ...s.progLabel, color: active ? MINT_DARK : done ? MINT : "#9ab5a5" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ ...s.progLine, background: step > num ? MINT : "#e0ede6" }} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div key="step1">
            <div style={s.symGrid}>
              {SYMPTOMS.map(({ id, Icon, label, desc }, i) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}
                    style={{ ...s.symCard, ...(active ? s.symActive : {}) }}
                  >
                    {active && (
                      <div style={s.checkMark} className="bc-check-pop">
                        <FaCheck size={9} color="#fff" />
                      </div>
                    )}
                    <div style={{ ...s.symIconBox, background: active ? MINT : MINT_LIGHT }}>
                      <Icon size={20} color={active ? "#fff" : MINT} />
                    </div>
                    <span style={{ ...s.symLabel, color: active ? MINT_DARK : "#1a2e24" }}>{label}</span>
                    <span style={s.symDesc}>{desc}</span>
                  </button>
                );
              })}
            </div>

            {selected.length > 0 && (
              <div style={s.selectedBar} className="bc-anim-fadeUp">
                <span style={s.selLabel}>Selected ({selected.length}):</span>
                <div style={s.pills}>
                  {selected.map((id) => {
                    const sym = SYMPTOMS.find((s) => s.id === id);
                    return (
                      <span key={id} style={s.pill} className="bc-anim-popIn">
                        {sym.label}
                        <button onClick={() => toggle(id)} style={s.pillX}>✕</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={s.actionRow}>
              <button
                style={{ ...s.btnPrimary, opacity: canNext ? 1 : 0.45 }}
                className={canNext ? "bc-btn-glow" : ""}
                onClick={() => canNext && setStep(2)}
                disabled={!canNext}
              >
                Continue to Baby Details <FaArrowRight size={13} />
              </button>
              {!canNext && <p style={s.hint}>Please select at least one symptom</p>}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={s.detailCard} className="bc-anim-scaleIn">
            <h2 style={s.detailTitle}>Tell us about your baby</h2>
            <p style={s.detailSub}>This helps us give more accurate treatment suggestions</p>

            <label style={s.label}>Baby's Age Group</label>
            <div style={s.pillRow}>
              {AGE_GROUPS.map((a, i) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`bc-anim-fadeUp bc-d${i + 1}`}
                  style={{ ...s.selPill, ...(age === a ? s.selPillActive : {}) }}
                >{a}</button>
              ))}
            </div>

            <label style={s.label}>How long has this been going on?</label>
            <div style={s.pillRow}>
              {DURATIONS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`bc-anim-fadeUp bc-d${i + 1}`}
                  style={{ ...s.selPill, ...(duration === d ? s.selPillActive : {}) }}
                >{d}</button>
              ))}
            </div>

            <label style={s.label}>Additional Notes (Optional)</label>
            <textarea
              placeholder="Any other details about your baby's condition..."
              style={s.textarea}
              className="bc-input-glow"
              rows={3}
            />

            <div style={s.actionRow}>
              <button style={s.btnOutline} className="bc-btn-outline-glow" onClick={() => setStep(1)}>← Back</button>
              <button
                style={{ ...s.btnPrimary, opacity: canSubmit ? 1 : 0.45 }}
                className={canSubmit ? "bc-btn-glow" : ""}
                onClick={() => canSubmit && navigate("/treatment-results")}
                disabled={!canSubmit}
              >
                Get Treatment Suggestions <FaArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)",
    fontFamily: "'Nunito','Segoe UI',sans-serif",
    position: "relative", overflow: "hidden",
  },
  container: { maxWidth: 900, margin: "0 auto", padding: "48px 24px 72px", position: "relative", zIndex: 2 },
  header: { textAlign: "center", marginBottom: 36 },
  badge: {
    display: "inline-block",
    background: "rgba(232,248,239,0.85)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: MINT_DARK, borderRadius: 20, padding: "6px 16px",
    fontSize: 12.5, fontWeight: 800, marginBottom: 14,
    border: "1px solid rgba(42,157,92,0.18)",
  },
  title: { fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.8px", margin: "0 0 10px" },
  sub: { fontSize: 15, color: "#5a7a6a" },
  progress: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 44 },
  progStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  progDot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 900, transition: "all 0.3s",
  },
  progLabel: { fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  progLine: { width: 64, height: 2, margin: "0 8px", marginBottom: 22, transition: "background 0.3s" },
  symGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 24 },
  symCard: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "2px solid rgba(224,237,230,0.8)",
    borderRadius: 14, padding: "18px 10px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    cursor: "pointer", position: "relative", fontFamily: "inherit",
  },
  symActive: {
    background: "rgba(232,248,239,0.9)",
    border: `2px solid ${MINT}`,
    boxShadow: `0 0 0 4px rgba(42,157,92,0.12), 0 8px 24px rgba(42,157,92,0.18)`,
  },
  checkMark: {
    position: "absolute", top: 8, right: 8,
    width: 18, height: 18, background: MINT, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(42,157,92,0.4)",
  },
  symIconBox: {
    width: 46, height: 46, borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.25s",
  },
  symLabel: { fontSize: 12.5, fontWeight: 800, textAlign: "center" },
  symDesc: { fontSize: 11, color: "#9ab5a5", textAlign: "center", lineHeight: 1.4 },
  selectedBar: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    border: "1.5px solid rgba(212,237,223,0.9)",
    borderRadius: 12, padding: "14px 18px", marginBottom: 22,
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    boxShadow: "0 4px 16px rgba(42,157,92,0.08)",
  },
  selLabel: { fontSize: 13, fontWeight: 800, color: MINT_DARK, whiteSpace: "nowrap" },
  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: {
    background: MINT_LIGHT, border: `1.5px solid ${MINT}`, color: MINT_DARK,
    borderRadius: 20, padding: "4px 12px", fontSize: 12.5, fontWeight: 700,
    display: "flex", alignItems: "center", gap: 6,
  },
  pillX: { background: "none", border: "none", cursor: "pointer", color: MINT_DARK, fontSize: 11, fontWeight: 900, padding: 0, lineHeight: 1 },
  actionRow: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 },
  btnPrimary: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 10,
    padding: "12px 26px", fontWeight: 800, fontSize: 14.5,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    fontFamily: "inherit", boxShadow: "0 4px 16px rgba(42,157,92,0.32)",
  },
  btnOutline: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    color: MINT, border: `2px solid ${MINT}`, borderRadius: 10,
    padding: "12px 22px", fontWeight: 700, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  },
  hint: { fontSize: 13, color: "#9ab5a5", margin: 0 },
  detailCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    border: "1.5px solid rgba(255,255,255,0.7)",
    borderRadius: 20, padding: "36px 32px",
    maxWidth: 600, margin: "0 auto",
    boxShadow: "0 12px 40px rgba(42,157,92,0.12)",
  },
  detailTitle: { fontSize: 22, fontWeight: 900, color: "#0f2018", marginBottom: 6 },
  detailSub: { fontSize: 14, color: "#5a7a6a", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: 800, color: "#3d5a48", display: "block", margin: "20px 0 10px" },
  pillRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  selPill: {
    background: "rgba(240,250,244,0.7)",
    border: "1.5px solid #d4eddf",
    borderRadius: 10, padding: "9px 16px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", color: "#3d5a48",
    transition: "all 0.22s ease",
  },
  selPillActive: {
    background: MINT_LIGHT,
    border: `2px solid ${MINT}`,
    color: MINT_DARK,
    boxShadow: "0 0 0 3px rgba(42,157,92,0.12)",
  },
  textarea: {
    width: "100%",
    border: "1.5px solid #d4eddf", borderRadius: 10,
    padding: "12px 14px", fontSize: 14,
    fontFamily: "inherit", color: "#1a2e24",
    resize: "vertical", outline: "none",
    background: "rgba(250,255,254,0.7)", marginTop: 4,
  },
};
