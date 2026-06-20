import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTemperatureHigh, FaTooth, FaBed, FaEye, FaArrowRight, FaCheck,
  FaArrowLeft, FaStethoscope, FaShieldAlt, FaInfoCircle,
} from "react-icons/fa";
import { MdOutlineSick, MdSentimentVeryDissatisfied, MdHearing, MdAir } from "react-icons/md";
import { GiBabyFace, GiBabyBottle, GiMedicines } from "react-icons/gi";
import { HiOutlineShieldCheck } from "react-icons/hi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const SYMPTOMS = [
  { id: "fever",        Icon: FaTemperatureHigh,          label: "Fever",            desc: "High body temperature",       color: "#dc2626" },
  { id: "cough",        Icon: MdAir,                      label: "Cold & Cough",     desc: "Runny nose, sneezing",        color: "#0891b2" },
  { id: "teething",     Icon: FaTooth,                    label: "Teething Pain",    desc: "Gum irritation, drooling",    color: "#7c3aed" },
  { id: "diarrhea",     Icon: MdOutlineSick,              label: "Diarrhea",         desc: "Loose or watery stools",      color: "#ea580c" },
  { id: "sleep",        Icon: FaBed,                      label: "Sleep Issues",     desc: "Restlessness at night",       color: "#4338ca" },
  { id: "feeding",      Icon: GiBabyBottle,               label: "Feeding Problems", desc: "Refuses milk or food",        color: "#0891b2" },
  { id: "rash",         Icon: MdSentimentVeryDissatisfied,label: "Skin Rash",        desc: "Redness or itchy skin",       color: "#db2777" },
  { id: "vomit",        Icon: GiMedicines,                label: "Vomiting",         desc: "Nausea or throwing up",       color: "#ea580c" },
  { id: "colic",        Icon: GiBabyFace,                 label: "Colic / Crying",   desc: "Excessive crying",            color: "#7c3aed" },
  { id: "constipation", Icon: MdOutlineSick,              label: "Constipation",     desc: "Hard or infrequent stools",   color: "#ca8a04" },
  { id: "earache",      Icon: MdHearing,                  label: "Ear Pain",         desc: "Pulling at ears, fussiness",  color: "#dc2626" },
  { id: "eye",          Icon: FaEye,                      label: "Eye Discharge",    desc: "Sticky or watery eyes",       color: "#0891b2" },
];

const AGE_GROUPS = ["0–3 months", "3–6 months", "6–12 months", "1–2 years", "2–5 years"];
const DURATIONS = ["Less than 1 day", "1–2 days", "3–5 days", "More than 5 days"];

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .sym-card {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .sym-card:hover:not(.active) {
    border-color: #2a9d5c !important;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(42,157,92,0.12);
  }
  .sym-card:hover:not(.active) .sym-icon-box {
    transform: scale(1.1);
  }
  .sym-icon-box {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sym-card.active {
    box-shadow: 0 8px 24px rgba(42,157,92,0.2);
  }

  .sym-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sym-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .sym-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .sym-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sym-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .sym-pill {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sym-pill:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
    transform: translateY(-1px);
  }

  .sym-pill-x {
    transition: all 0.2s ease;
  }
  .sym-pill-x:hover {
    background: #dc2626 !important;
    color: #fff !important;
    transform: scale(1.1);
  }

  .sym-input {
    transition: all 0.2s ease;
  }
  .sym-input:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
  }

  .sym-back-link {
    transition: color 0.2s ease;
  }
  .sym-back-link:hover {
    color: #1a6e3f !important;
  }

  /* ═══════════════ MOBILE RESPONSIVE ═══════════════ */
  @media (max-width: 768px) {
    .sym-container { padding: 28px 14px 90px !important; }

    /* Progress bar compress */
    .sym-prog-line { width: 36px !important; margin: 0 4px !important; }
    .sym-prog-label { font-size: 10px !important; }

    /* Symptom grid: 3 columns on tablet, 2 on phone */
    .sym-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
    .sym-card { padding: 12px 6px 10px !important; }
    .sym-icon-box { width: 38px !important; height: 38px !important; }
    .sym-label { font-size: 11.5px !important; }
    .sym-desc { display: none !important; }

    /* CTA button full width */
    .sym-action-wrap { width: 100%; }
    .sym-btn-primary { width: 100%; justify-content: center; }

    /* Step 2 card */
    .sym-detail-card { padding: 20px 16px 18px !important; }

    /* Step 2 button row stack */
    .sym-btn-row { flex-direction: column !important; }
    .sym-btn-row .sym-btn-outline,
    .sym-btn-row .sym-btn-primary { width: 100% !important; justify-content: center !important; }
  }

  @media (max-width: 480px) {
    .sym-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .sym-prog-line { width: 24px !important; }
  }
`;

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const canNext = selected.length > 0;
  const canSubmit = age !== "" && duration !== "";

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container} className="sym-container">

        {/* ═══ HEADER ═══ */}
        <div style={s.header}>
          <div style={s.badge}>
            <FaStethoscope size={11} color={MINT_DARK} />
            <span>Symptom Assessment Tool</span>
          </div>
          <h1 style={s.title}>
            {step === 1 ? "What's bothering your baby?" : "Tell us more about your baby"}
          </h1>
          <p style={s.sub}>
            {step === 1
              ? "Select all symptoms your child is currently experiencing"
              : "This information helps us provide more accurate treatment recommendations"}
          </p>
        </div>

        {/* ═══ PROGRESS ═══ */}
        <div style={s.progress} className="sym-progress">
          {["Select Symptoms", "Baby Details", "Get Results"].map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={label} style={s.progItem}>
                <div style={s.progStep}>
                  <div
                    style={{
                      ...s.progDot,
                      background: done || active ? MINT_DARK : "#fff",
                      color: done || active ? "#fff" : TEXT_MUTED,
                      borderColor: done || active ? MINT_DARK : BORDER,
                    }}
                  >
                    {done ? <FaCheck size={12} /> : num}
                  </div>
                  <span className="sym-prog-label" style={{
                    ...s.progLabel,
                    color: active ? MINT_DARK : done ? MINT_DARK : TEXT_MUTED,
                    fontWeight: active ? 800 : 700,
                  }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="sym-prog-line" style={{ ...s.progLine, background: step > num ? MINT_DARK : BORDER }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ STEP 1: SYMPTOMS ═══ */}
        {step === 1 && (
          <>
            <div style={s.symGrid} className="sym-grid">
              {SYMPTOMS.map(({ id, Icon, label, desc, color }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`sym-card ${active ? "active" : ""}`}
                    style={{
                      ...s.symCard,
                      ...(active ? { borderColor: MINT_DARK, background: MINT_LIGHT } : {}),
                    }}
                  >
                    {active && (
                      <div style={s.checkMark}>
                        <FaCheck size={10} color="#fff" />
                      </div>
                    )}
                    <div
                      style={{
                        ...s.symIconBox,
                        background: active ? color + "20" : color + "12",
                      }}
                      className="sym-icon-box"
                    >
                      <Icon size={22} color={color} />
                    </div>
                    <div style={s.symLabel}>{label}</div>
                    <div style={s.symDesc}>{desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Bar */}
            {selected.length > 0 && (
              <div style={s.selectedBar}>
                <div style={s.selectedHeader}>
                  <span style={s.selectedCount}>
                    <strong>{selected.length}</strong> {selected.length === 1 ? "symptom" : "symptoms"} selected
                  </span>
                </div>
                <div style={s.pills}>
                  {selected.map((id) => {
                    const sym = SYMPTOMS.find((sm) => sm.id === id);
                    return (
                      <span key={id} style={s.pill}>
                        {sym.label}
                        <button
                          onClick={() => toggle(id)}
                          style={s.pillX}
                          className="sym-pill-x"
                          aria-label="Remove symptom"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action */}
            <div style={s.actionWrap} className="sym-action-wrap">
              {!canNext && (
                <div style={s.helperBox}>
                  <FaInfoCircle size={13} color={TEXT_MUTED} />
                  <span>Please select at least one symptom to continue</span>
                </div>
              )}
              <button
                style={{ ...s.btnPrimary, opacity: canNext ? 1 : 0.5 }}
                className="sym-btn-primary"
                onClick={() => canNext && setStep(2)}
                disabled={!canNext}
              >
                Continue to Baby Details
                <FaArrowRight size={12} />
              </button>
            </div>
          </>
        )}

        {/* ═══ STEP 2: DETAILS ═══ */}
        {step === 2 && (
          <div style={s.detailCard} className="sym-detail-card">
            <div style={s.detailHeader}>
              <button style={s.backLink} className="sym-back-link" onClick={() => setStep(1)}>
                <FaArrowLeft size={11} />
                Back to symptoms
              </button>
              <span style={s.selectedTag}>
                <FaCheck size={10} color={MINT_DARK} />
                {selected.length} symptoms selected
              </span>
            </div>

            <h2 style={s.detailTitle}>Patient Information</h2>
            <p style={s.detailSub}>
              Please provide accurate information for the best treatment recommendations
            </p>

            <label style={s.label}>
              Baby's Age Group <span style={s.required}>*</span>
            </label>
            <div style={s.pillRow}>
              {AGE_GROUPS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`sym-pill ${age === a ? "active" : ""}`}
                  style={{ ...s.selPill, ...(age === a ? s.selPillActive : {}) }}
                >
                  {age === a && <FaCheck size={10} />}
                  {a}
                </button>
              ))}
            </div>

            <label style={s.label}>
              Duration of Symptoms <span style={s.required}>*</span>
            </label>
            <div style={s.pillRow}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`sym-pill ${duration === d ? "active" : ""}`}
                  style={{ ...s.selPill, ...(duration === d ? s.selPillActive : {}) }}
                >
                  {duration === d && <FaCheck size={10} />}
                  {d}
                </button>
              ))}
            </div>

            <label style={s.label}>
              Additional Notes <span style={s.optional}>(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any other symptoms, medications your baby is taking, or relevant medical history..."
              style={s.textarea}
              className="sym-input"
              rows={4}
            />

            {/* Disclaimer */}
            <div style={s.disclaimer}>
              <HiOutlineShieldCheck size={16} color={MINT_DARK} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Important:</strong> This tool provides general guidance only.
                Always consult with a certified pediatric doctor for accurate diagnosis and treatment.
              </div>
            </div>

            {/* Action buttons */}
            <div style={s.btnRow} className="sym-btn-row">
              <button style={s.btnOutline} className="sym-btn-outline" onClick={() => setStep(1)}>
                <FaArrowLeft size={11} />
                Back
              </button>
              <button
                style={{ ...s.btnPrimary, opacity: canSubmit ? 1 : 0.5, flex: 1 }}
                className="sym-btn-primary"
                onClick={() => canSubmit && navigate("/treatment-results")}
                disabled={!canSubmit}
              >
                Get Treatment Recommendations
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Footer Trust Indicators */}
        <div style={s.trustFooter}>
          <div style={s.trustItem}>
            <FaShieldAlt size={11} color={MINT_DARK} />
            <span>SSL Encrypted</span>
          </div>
          <div style={s.trustDivider} />
          <div style={s.trustItem}>
            <HiOutlineShieldCheck size={11} color={MINT_DARK} />
            <span>Medical Data Protected</span>
          </div>
          <div style={s.trustDivider} />
          <div style={s.trustItem}>
            <FaStethoscope size={11} color={MINT_DARK} />
            <span>Reviewed by Doctors</span>
          </div>
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
  },
  container: { maxWidth: 960, margin: "0 auto", padding: "48px 24px 64px" },

  // Header
  header: { textAlign: "center", marginBottom: 36 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    padding: "6px 13px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(42,157,92,0.08)",
  },
  title: {
    fontSize: "clamp(24px, 3.5vw, 36px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.8px",
    margin: "0 0 12px",
    lineHeight: 1.2,
  },
  sub: { fontSize: 15.5, color: TEXT_BODY, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 },

  // Progress
  progress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    flexWrap: "wrap",
  },
  progItem: { display: "flex", alignItems: "center" },
  progStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  progDot: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    transition: "all 0.3s",
  },
  progLabel: { fontSize: 12, whiteSpace: "nowrap" },
  progLine: { width: 72, height: 2, margin: "0 12px", marginBottom: 22, transition: "background 0.3s" },

  // Symptom Grid
  symGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  symCard: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 12,
    padding: "20px 14px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    position: "relative",
    fontFamily: "inherit",
    textAlign: "center",
  },
  checkMark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    background: MINT_DARK,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(26,110,63,0.4)",
  },
  symIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  symLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_DARK,
    lineHeight: 1.3,
  },
  symDesc: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 500,
    lineHeight: 1.4,
    minHeight: 28,
  },

  // Selected Bar
  selectedBar: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
  },
  selectedHeader: { marginBottom: 12 },
  selectedCount: {
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 600,
  },
  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: {
    background: MINT_LIGHT,
    border: `1px solid ${MINT}`,
    color: MINT_DARK,
    borderRadius: 20,
    padding: "5px 5px 5px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  pillX: {
    background: "rgba(26,110,63,0.15)",
    color: MINT_DARK,
    border: "none",
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },

  // Action
  actionWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  helperBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: `1px dashed ${BORDER}`,
    color: TEXT_MUTED,
    padding: "9px 16px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
  },

  // Buttons
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "13px 28px",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },
  btnOutline: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 11,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  // Detail Card (Step 2)
  detailCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "32px 32px 28px",
    maxWidth: 640,
    margin: "0 auto",
    boxShadow: "0 8px 28px rgba(15,32,24,0.06)",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 18,
    borderBottom: `1px solid ${BORDER}`,
    flexWrap: "wrap",
    gap: 12,
  },
  backLink: {
    background: "none",
    border: "none",
    color: MINT_DARK,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  },
  selectedTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "5px 11px",
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 800,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  detailSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_BODY,
    display: "block",
    margin: "20px 0 10px",
  },
  required: { color: "#dc2626", fontWeight: 800 },
  optional: { color: TEXT_MUTED, fontWeight: 600, fontSize: 12 },

  pillRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  selPill: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    color: TEXT_BODY,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  selPillActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },

  textarea: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT_DARK,
    resize: "vertical",
    outline: "none",
    background: "#fafffe",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },

  // Disclaimer
  disclaimer: {
    background: MINT_LIGHT,
    border: `1px solid ${MINT}30`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 500,
    lineHeight: 1.6,
    marginTop: 24,
    marginBottom: 24,
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },

  btnRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  // Trust Footer
  trustFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 36,
    paddingTop: 24,
    borderTop: `1px solid ${BORDER}`,
    flexWrap: "wrap",
  },
  trustItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 700,
  },
  trustDivider: { width: 1, height: 12, background: BORDER },
};