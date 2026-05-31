import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitDoctorApplication } from "../api/doctors";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const SPECIALTIES = [
  { value: "pediatric_homeopath",    label: "Pediatric Homeopath" },
  { value: "child_specialist",       label: "Child Specialist" },
  { value: "organic_medicine",       label: "Organic Medicine" },
  { value: "homeopathic_consultant", label: "Homeopathic Consultant" },
];

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);   // 1 = info, 2 = documents, 3 = success
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    pmdc_number: "", specialty: "", experience_years: "",
    clinic_address: "", consultation_fee: 1000,
  });

  const [docs, setDocs] = useState({
    pmdc_license: null,
    cnic_front: null,
    cnic_back: null,
    degree: null,
    profile_photo: null,
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size 5MB se zyada nahi honi chahiye!");
        return;
      }
      setDocs({ ...docs, [e.target.name]: file });
    }
  };

  const removeFile = (key) => setDocs({ ...docs, [key]: null });

  // Validation
  const canProceedInfo = form.full_name && form.email && form.phone && form.pmdc_number && form.specialty && form.experience_years;
  const allDocsUploaded = docs.pmdc_license && docs.cnic_front && docs.cnic_back && docs.degree;

  const submit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // FormData object banao file upload ke liye
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      Object.keys(docs).forEach((key) => {
        if (docs[key]) formData.append(key, docs[key]);
      });

      await submitDoctorApplication(formData);
      setStep(3);  // Success screen
    } catch (err) {
      console.error("Application error:", err.response?.data);
      const errorData = err.response?.data || {};
      setErrors(errorData);

      // Agar email/pmdc error hai to step 1 par wapas le jao
      if (errorData.email || errorData.pmdc_number) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />
      <div className="bc-orb" style={{ width: 280, height: 280, background: "#d1f5e0", bottom: "5%", left: "-60px", animationDelay: "3s" }} />

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header} className="bc-anim-fadeUp">
          <div style={s.logo}>
            <span style={s.logoEmoji} className="bc-float">👨‍⚕️</span>
            <span style={s.logoText}>Baby<span style={{ color: MINT }}>Care</span> Doctor Portal</span>
          </div>
          <p style={s.tagline}>Apply to join Pakistan's top baby healthcare platform</p>
        </div>

        {/* PROGRESS */}
        <div style={s.progress} className="bc-anim-fadeUp bc-d1">
          {["Personal Info", "Documents", "Submitted"].map((label, i) => {
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

        {/* ═══════════════ STEP 1: PERSONAL & PROFESSIONAL INFO ═══════════════ */}
        {step === 1 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <h2 style={s.cardTitle}>Personal & Professional Information 📋</h2>
            <p style={s.cardSub}>Apne baray mein humein bataein</p>

            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Full Name *</label>
                <input
                  name="full_name" value={form.full_name} onChange={handle}
                  placeholder="Dr. Ayesha Malik"
                  style={s.input} className="bc-input-glow"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Email Address *</label>
                <input
                  name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  style={s.input} className="bc-input-glow"
                />
                {errors.email && <span style={s.errorText}>⚠️ {Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Phone Number *</label>
                <input
                  name="phone" value={form.phone} onChange={handle}
                  placeholder="0321-1234567"
                  style={s.input} className="bc-input-glow"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>PMDC Registration # *</label>
                <input
                  name="pmdc_number" value={form.pmdc_number} onChange={handle}
                  placeholder="e.g. 12345-K"
                  style={s.input} className="bc-input-glow"
                />
                {errors.pmdc_number && <span style={s.errorText}>⚠️ {Array.isArray(errors.pmdc_number) ? errors.pmdc_number[0] : errors.pmdc_number}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Specialty *</label>
                <select
                  name="specialty" value={form.specialty} onChange={handle}
                  style={s.input} className="bc-input-glow"
                >
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map((sp) => (
                    <option key={sp.value} value={sp.value}>{sp.label}</option>
                  ))}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Experience (Years) *</label>
                <input
                  name="experience_years" type="number" min="0" value={form.experience_years} onChange={handle}
                  placeholder="e.g. 8"
                  style={s.input} className="bc-input-glow"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Consultation Fee (Rs.)</label>
                <input
                  name="consultation_fee" type="number" min="500" value={form.consultation_fee} onChange={handle}
                  style={s.input} className="bc-input-glow"
                />
              </div>

              <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                <label style={s.label}>Clinic / Hospital Address</label>
                <input
                  name="clinic_address" value={form.clinic_address} onChange={handle}
                  placeholder="e.g. Gulshan-e-Iqbal, Karachi"
                  style={s.input} className="bc-input-glow"
                />
              </div>
            </div>

            <div style={s.actionRow}>
              <button
                style={{ ...s.btnPrimary, opacity: canProceedInfo ? 1 : 0.5 }}
                className={canProceedInfo ? "bc-btn-glow" : ""}
                disabled={!canProceedInfo}
                onClick={() => setStep(2)}
              >
                Continue to Documents →
              </button>
            </div>

            <p style={s.loginPrompt}>
              Already have an account?{" "}
              <button style={s.linkBtn} onClick={() => navigate("/login")}>Login here</button>
            </p>
          </div>
        )}

        {/* ═══════════════ STEP 2: DOCUMENTS ═══════════════ */}
        {step === 2 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <button style={s.backBtn} onClick={() => setStep(1)}>← Back to Info</button>

            <h2 style={s.cardTitle}>Upload Verification Documents 📄</h2>
            <p style={s.cardSub}>
              Admin team aap ke documents <strong>24-48 hours</strong> mein review karegi
            </p>

            <div style={s.docsList}>
              <DocUpload label="PMDC License" name="pmdc_license" required file={docs.pmdc_license} onChange={handleFile} onRemove={removeFile} delay={1} />
              <DocUpload label="CNIC (Front)"  name="cnic_front"   required file={docs.cnic_front} onChange={handleFile} onRemove={removeFile} delay={2} />
              <DocUpload label="CNIC (Back)"   name="cnic_back"    required file={docs.cnic_back} onChange={handleFile} onRemove={removeFile} delay={3} />
              <DocUpload label="Medical Degree" name="degree"      required file={docs.degree} onChange={handleFile} onRemove={removeFile} delay={4} />
              <DocUpload label="Profile Photo (Optional)" name="profile_photo" file={docs.profile_photo} onChange={handleFile} onRemove={removeFile} delay={5} />
            </div>

            <div style={s.infoBox} className="bc-anim-fadeUp bc-d6">
              <span style={{ fontSize: 18 }}>ℹ️</span>
              <div>
                <strong>What happens next?</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#5a7a6a", lineHeight: 1.6 }}>
                  Admin aap ke documents review karega. Approve hone par <strong>email + password</strong> mil jayega.
                  Phir aap login karke Doctor Dashboard access kar sakte hain.
                </p>
              </div>
            </div>

            {/* General error display */}
            {errors.detail && (
              <div style={s.errorBox}>⚠️ {errors.detail}</div>
            )}

            <div style={s.actionRow}>
              <button
                style={{ ...s.btnPrimary, opacity: allDocsUploaded && !loading ? 1 : 0.5 }}
                className={allDocsUploaded && !loading ? "bc-btn-glow" : ""}
                disabled={!allDocsUploaded || loading}
                onClick={submit}
              >
                {loading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                    Submitting...
                  </span>
                ) : "Submit Application →"}
              </button>
              {!allDocsUploaded && (
                <p style={s.hint}>Please upload all required documents (*)</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 3: SUCCESS ═══════════════ */}
        {step === 3 && (
          <div style={s.card} className="bc-anim-scaleIn">
            <div style={s.successWrap}>
              <div className="bc-check-pop" style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
              <h2 style={s.successTitle}>Application Submitted! 🎉</h2>
              <p style={s.successText}>
                Thank you, <strong>{form.full_name}</strong>! Aap ki application hamare admin team ke paas pohanch gayi hai.
              </p>

              <div style={s.timeline}>
                <TimelineItem icon="✓" label="Documents Submitted" desc="Just now" color={MINT} active />
                <div style={s.timelineLine} />
                <TimelineItem icon="⏳" label="Admin Review" desc="24-48 hours" color="#fbbf24" pulsing />
                <div style={s.timelineLine} />
                <TimelineItem icon="📧" label="Credentials Email" desc="After approval" color="#e0ede6" />
                <div style={s.timelineLine} />
                <TimelineItem icon="🩺" label="Login to Dashboard" desc="Start work" color="#e0ede6" />
              </div>

              <div style={s.emailBox}>
                <span style={{ fontSize: 22 }}>📧</span>
                <div>
                  <div style={{ fontSize: 12, color: "#5a7a6a", fontWeight: 700, marginBottom: 2 }}>Credentials will be sent to:</div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: MINT_DARK, wordBreak: "break-all" }}>{form.email}</div>
                </div>
              </div>

              <div style={s.btnRow}>
                <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/")}>Back to Home</button>
                <button style={s.btnOutline} className="bc-btn-outline-glow" onClick={() => navigate("/check-doctor-status")}>Check Status</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ Document Upload Component ═══════════════════ */
function DocUpload({ label, name, required, file, onChange, onRemove, delay }) {
  return (
    <div style={s.docItem} className={`bc-anim-fadeUp bc-d${delay}`}>
      <div style={s.docLabel}>
        <span>📎 {label}</span>
        {required && <span style={s.requiredBadge}>Required</span>}
      </div>

      {!file ? (
        <label style={s.uploadBox} className="bc-btn-outline-glow">
          <input type="file" name={name} onChange={onChange} accept="image/*,.pdf" style={{ display: "none" }} />
          <span style={{ fontSize: 22 }}>⬆️</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: MINT_DARK }}>Click to Upload</span>
          <span style={{ fontSize: 11, color: "#9ab5a5" }}>JPG, PNG, or PDF (max 5MB)</span>
        </label>
      ) : (
        <div style={s.uploadedBox} className="bc-anim-popIn">
          <span style={{ fontSize: 22 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: MINT_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
            <div style={{ fontSize: 11, color: "#9ab5a5" }}>{(file.size / 1024).toFixed(1)} KB · ✓</div>
          </div>
          <button onClick={() => onRemove(name)} style={s.removeBtn}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ Timeline Component ═══════════════════ */
function TimelineItem({ icon, label, desc, color, active, pulsing }) {
  return (
    <div style={s.timelineItem}>
      <div className={pulsing ? "bc-glow-pulse" : ""} style={{ ...s.timelineDot, background: color, color: active || pulsing ? "#fff" : "#9ab5a5" }}>
        {icon}
      </div>
      <div>
        <div style={{ ...s.timelineLabel, color: active || pulsing ? "#0f2018" : "#9ab5a5" }}>{label}</div>
        <div style={s.timelineDesc}>{desc}</div>
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
    padding: "40px 20px",
  },
  container: { maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 2 },

  header: { textAlign: "center", marginBottom: 28 },
  logo: { display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 },
  logoEmoji: { fontSize: 32 },
  logoText: { fontSize: 24, fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px" },
  tagline: { fontSize: 14, color: "#5a7a6a", margin: 0 },

  progress: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  progStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  progDot: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 },
  progLabel: { fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  progLine: { width: 70, height: 2, margin: "0 8px", marginBottom: 22 },

  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    border: "1.5px solid rgba(255,255,255,0.7)",
    borderRadius: 20, padding: "36px 32px",
    boxShadow: "0 12px 40px rgba(42,157,92,0.12)",
  },
  backBtn: { background: "none", border: "none", color: MINT, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, padding: 0 },
  cardTitle: { fontSize: 22, fontWeight: 900, color: "#0f2018", margin: "0 0 6px", letterSpacing: "-0.3px" },
  cardSub: { fontSize: 14, color: "#5a7a6a", margin: "0 0 24px", lineHeight: 1.6 },

  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12.5, fontWeight: 800, color: "#3d5a48", marginBottom: 6 },
  input: { padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d4eddf", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1a2e24", background: "rgba(250,255,254,0.7)" },
  errorText: { fontSize: 11.5, color: "#dc2626", marginTop: 4, fontWeight: 600 },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 16, border: "1px solid #fca5a5" },

  docsList: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 },
  docItem: { display: "flex", flexDirection: "column", gap: 8 },
  docLabel: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, fontWeight: 800, color: "#3d5a48" },
  requiredBadge: { fontSize: 10.5, fontWeight: 800, background: "#fee2e2", color: "#991b1b", borderRadius: 4, padding: "2px 8px" },
  uploadBox: { border: "2px dashed #d4eddf", borderRadius: 12, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", background: "rgba(240,250,244,0.5)" },
  uploadedBox: { background: "rgba(232,248,239,0.8)", border: `1.5px solid ${MINT}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(42,157,92,0.12)" },
  removeBtn: { background: "none", border: "none", color: "#dc2626", fontWeight: 900, fontSize: 14, cursor: "pointer", padding: "4px 8px" },

  infoBox: { background: "rgba(253,246,219,0.7)", border: "1.5px solid #fde68a", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 },

  actionRow: { display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10 },
  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 11, padding: "13px 26px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(42,157,92,0.35)" },
  btnOutline: { background: "#fff", color: MINT, border: `2px solid ${MINT}`, borderRadius: 11, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  hint: { fontSize: 12.5, color: "#9ab5a5", margin: 0, textAlign: "center" },

  loginPrompt: { textAlign: "center", margin: "20px 0 0", fontSize: 13.5, color: "#5a7a6a" },
  linkBtn: { background: "none", border: "none", color: MINT, fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  // Success screen
  successWrap: { textAlign: "center" },
  successTitle: { fontSize: 26, fontWeight: 900, color: "#0f2018", marginBottom: 10, letterSpacing: "-0.5px" },
  successText: { fontSize: 14.5, color: "#5a7a6a", lineHeight: 1.7, marginBottom: 28 },
  timeline: { display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: 360, margin: "0 auto 24px", background: "rgba(250,255,254,0.6)", border: "1.5px solid rgba(212,237,223,0.6)", borderRadius: 14, padding: "20px 22px" },
  timelineItem: { display: "flex", alignItems: "center", gap: 12 },
  timelineDot: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 },
  timelineLabel: { fontSize: 13.5, fontWeight: 800, textAlign: "left" },
  timelineDesc: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600, textAlign: "left" },
  timelineLine: { width: 2, height: 18, background: "#d4eddf", marginLeft: 17, marginTop: 4, marginBottom: 4 },
  emailBox: { background: "rgba(232,248,239,0.7)", border: "1.5px solid #b2e0cc", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", maxWidth: 400, margin: "0 auto 22px" },
  btnRow: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
};