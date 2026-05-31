import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  submitComplaint,
  getComplaintCategories,
} from "../api/complaints";
import { getPublicDoctors } from "../api/appointments";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const PRIORITY_COLORS = {
  low:    { bg: "#f0f9ff", color: "#075985" },
  medium: { bg: "#fff8e6", color: "#7a5a10" },
  high:   { bg: "#ffedd5", color: "#9a3412" },
  urgent: { bg: "#fee2e2", color: "#991b1b" },
};

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium",
    against_doctor: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load categories and doctors
  useEffect(() => {
    (async () => {
      try {
        const data = await getComplaintCategories();
        setCategories(data.categories);
        setPriorities(data.priorities);
      } catch (err) {
        console.error("Categories load error:", err);
      }
    })();

    // Load doctors list (for "against doctor" complaints)
    (async () => {
      try {
        const docs = await getPublicDoctors();
        setDoctors(docs);
      } catch (err) {
        console.error("Doctors load error:", err);
      }
    })();
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size 5MB se zyada nahi honi chahiye!");
        return;
      }
      setAttachment(file);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("subject", form.subject);
      formData.append("description", form.description);
      formData.append("priority", form.priority);
      if (form.category === "against_doctor" && form.against_doctor) {
        formData.append("against_doctor", form.against_doctor);
      }
      if (attachment) formData.append("attachment", attachment);

      await submitComplaint(formData);
      setSuccess(true);
    } catch (err) {
      console.error("Complaint error:", err.response?.data);
      const data = err.response?.data;
      setError(
        data?.detail ||
          (data && Object.values(data)[0]) ||
          "Submit fail ho gaya. Dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.category && form.subject && form.description && form.priority;

  // Determine if this is doctor or user
  const isDoctor = user?.role === "doctor";

  // Filter categories based on role
  const visibleCategories = categories.filter((c) => {
    if (isDoctor) return c.value !== "against_doctor";   // Doctor can't complain against doctor
    return c.value !== "against_user";                    // User can't complain against user
  });

  // ─── SUCCESS SCREEN ───
  if (success) {
    return (
      <div style={s.root}>
        <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />
        <div style={s.container}>
          <div style={s.successWrap} className="bc-anim-popIn">
            <div className="bc-check-pop" style={{ fontSize: 64 }}>✅</div>
            <h2 style={s.successTitle}>Complaint Submitted!</h2>
            <p style={s.successText}>
              Aap ki complaint admin team ke paas pohanch gayi hai. Hum jaldi review karenge aur aap ko response denge.
            </p>
            <div style={s.successCard}>
              <div style={s.sRow}><span style={s.sKey}>Subject</span><span style={s.sVal}>{form.subject}</span></div>
              <div style={s.sRow}><span style={s.sKey}>Category</span><span style={s.sVal}>{categories.find((c) => c.value === form.category)?.label}</span></div>
              <div style={s.sRow}><span style={s.sKey}>Priority</span><span style={{ ...s.statusBadge, ...PRIORITY_COLORS[form.priority] }}>{form.priority}</span></div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/my-complaints")}>
                View My Complaints
              </button>
              <button style={s.btnOutline} onClick={() => {
                setSuccess(false);
                setForm({ category: "", subject: "", description: "", priority: "medium", against_doctor: "" });
                setAttachment(null);
              }}>
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />
      <div className="bc-orb" style={{ width: 260, height: 260, background: "#d1f5e0", bottom: "10%", left: "-60px", animationDelay: "3s" }} />

      <div style={s.container}>
        <div style={s.header} className="bc-anim-fadeUp">
          <span style={s.badge}>📋 File a Complaint</span>
          <h1 style={s.pageTitle}>Tell Us What Went Wrong</h1>
          <p style={s.pageSub}>Aap ki har shikayat hamare liye important hai. Hum 24-48 hours mein response denge.</p>
        </div>

        <div style={s.card} className="bc-anim-scaleIn">
          {/* Category */}
          <label style={s.label}>Category *</label>
          <select name="category" value={form.category} onChange={handle} style={s.input} className="bc-input-glow">
            <option value="">Select category</option>
            {visibleCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Against which doctor (only for user filing against_doctor) */}
          {form.category === "against_doctor" && (
            <>
              <label style={s.label}>Select Doctor *</label>
              <select name="against_doctor" value={form.against_doctor} onChange={handle} style={s.input} className="bc-input-glow">
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.specialty}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Subject */}
          <label style={s.label}>Subject *</label>
          <input
            name="subject" value={form.subject} onChange={handle}
            placeholder="Brief subject (e.g. Doctor was unprofessional)"
            style={s.input} className="bc-input-glow"
            maxLength={200}
          />

          {/* Description */}
          <label style={s.label}>Detailed Description *</label>
          <textarea
            name="description" value={form.description} onChange={handle}
            placeholder="Detail mein bataein ke kya hua, kab hua, aur kya expect karte hain..."
            style={s.textarea} className="bc-input-glow"
            rows={6}
          />

          {/* Priority */}
          <label style={s.label}>Priority Level</label>
          <div style={s.priorityRow}>
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm({ ...form, priority: p.value })}
                style={{
                  ...s.priorityBtn,
                  ...(form.priority === p.value ? s.priorityActive : {}),
                  ...(form.priority === p.value ? PRIORITY_COLORS[p.value] : {}),
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Attachment */}
          <label style={s.label}>Attach File (Optional)</label>
          {!attachment ? (
            <label style={s.uploadBox} className="bc-btn-outline-glow">
              <input type="file" onChange={handleFile} accept="image/*,.pdf" style={{ display: "none" }} />
              <span style={{ fontSize: 22 }}>📎</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: MINT_DARK }}>Click to upload screenshot/document</span>
              <span style={{ fontSize: 11, color: "#9ab5a5" }}>JPG, PNG, or PDF (max 5MB)</span>
            </label>
          ) : (
            <div style={s.uploadedBox} className="bc-anim-popIn">
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: MINT_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {attachment.name}
                </div>
                <div style={{ fontSize: 11, color: "#9ab5a5" }}>{(attachment.size / 1024).toFixed(1)} KB · ✓</div>
              </div>
              <button onClick={() => setAttachment(null)} style={s.removeBtn}>✕</button>
            </div>
          )}

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          <div style={s.btnRow}>
            <button style={s.btnOutline} onClick={() => navigate(-1)}>← Cancel</button>
            <button
              style={{ ...s.btnPrimary, opacity: canSubmit && !loading ? 1 : 0.5, flex: 1 }}
              className={canSubmit && !loading ? "bc-btn-glow" : ""}
              disabled={!canSubmit || loading}
              onClick={submit}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                  Submitting...
                </span>
              ) : "Submit Complaint →"}
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div style={s.infoBox} className="bc-anim-fadeUp bc-d2">
          <span style={{ fontSize: 22 }}>💡</span>
          <div>
            <strong style={{ color: MINT_DARK }}>Important:</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#5a7a6a", lineHeight: 1.6 }}>
              Aap ki complaint confidential rahegi. Admin team ke saath share hogi aur 24-48 hours mein response milega.
              Aap apni complaints "My Complaints" section mein track kar sakte hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)", fontFamily: "'Nunito','Segoe UI',sans-serif", position: "relative", overflow: "hidden" },
  container: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 72px", position: "relative", zIndex: 2 },

  header: { textAlign: "center", marginBottom: 28 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,248,239,0.85)", color: "#1a6e3f", borderRadius: 20, padding: "6px 16px", fontSize: 12.5, fontWeight: 800, marginBottom: 12, border: "1px solid rgba(42,157,92,0.18)" },
  pageTitle: { fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px", margin: "0 0 8px" },
  pageSub: { fontSize: 14, color: "#5a7a6a", margin: 0 },

  card: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(18px) saturate(140%)", WebkitBackdropFilter: "blur(18px) saturate(140%)", border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 20, padding: "32px 30px", boxShadow: "0 12px 40px rgba(42,157,92,0.12)" },

  label: { fontSize: 13, fontWeight: 800, color: "#3d5a48", display: "block", margin: "16px 0 8px" },
  input: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "rgba(250,255,254,0.7)", boxSizing: "border-box" },
  textarea: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "rgba(250,255,254,0.7)", resize: "vertical", boxSizing: "border-box", minHeight: 100 },

  priorityRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  priorityBtn: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", transition: "all 0.22s ease", textTransform: "capitalize" },
  priorityActive: { borderWidth: 2 },

  uploadBox: { border: "2px dashed #d4eddf", borderRadius: 12, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", background: "rgba(240,250,244,0.5)" },
  uploadedBox: { background: "rgba(232,248,239,0.8)", border: `1.5px solid ${MINT}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(42,157,92,0.12)" },
  removeBtn: { background: "none", border: "none", color: "#dc2626", fontWeight: 900, fontSize: 14, cursor: "pointer", padding: "4px 8px" },

  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginTop: 16, border: "1px solid #fca5a5" },

  btnRow: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" },
  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 11, padding: "13px 26px", fontWeight: 800, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(42,157,92,0.35)" },
  btnOutline: { background: "#fff", color: MINT, border: `2px solid ${MINT}`, borderRadius: 11, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },

  infoBox: { background: "rgba(253,246,219,0.7)", border: "1.5px solid #fde68a", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", marginTop: 18 },

  statusBadge: { borderRadius: 6, padding: "3px 10px", fontSize: 11.5, fontWeight: 800, textTransform: "capitalize" },

  successWrap: { textAlign: "center", maxWidth: 460, margin: "60px auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  successTitle: { fontSize: 26, fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px" },
  successText: { fontSize: 14.5, color: "#5a7a6a", lineHeight: 1.7, marginBottom: 16 },
  successCard: { background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(224,237,230,0.7)", borderRadius: 14, padding: "22px 26px", width: "100%", textAlign: "left", boxShadow: "0 8px 28px rgba(42,157,92,0.12)", marginBottom: 16 },
  sRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f0f5f2" },
  sKey: { fontSize: 13, color: "#9ab5a5", fontWeight: 700 },
  sVal: { fontSize: 13.5, color: "#0f2018", fontWeight: 800 },
};
