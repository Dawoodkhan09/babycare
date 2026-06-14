import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle, FaPaperPlane, FaArrowLeft, FaArrowRight,
  FaCheckCircle, FaInfoCircle, FaPaperclip, FaTimes,
  FaShieldAlt, FaUserMd, FaListAlt, FaCloudUploadAlt,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { submitComplaint, getComplaintCategories } from "../api/complaints";
import { getPublicDoctors } from "../api/appointments";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const PRIORITY_COLORS = {
  low:    { bg: "#f0f9ff", color: "#075985", border: "#bae6fd" },
  medium: { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  high:   { bg: "#ffedd5", color: "#9a3412", border: "#fdba74" },
  urgent: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

const hoverStyles = `
  .cf-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .cf-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .cf-btn-outline { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .cf-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .cf-input, .cf-select, .cf-textarea { transition: all 0.2s ease; }
  .cf-input:focus, .cf-select:focus, .cf-textarea:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    outline: none;
  }

  .cf-priority { transition: all 0.2s ease; }
  .cf-priority:hover:not(.active) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15,32,24,0.08);
  }

  .cf-upload-box { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
  .cf-upload-box:hover:not(.has-file) {
    border-color: #2a9d5c !important;
    background: #fafffe !important;
    transform: translateY(-2px);
  }

  .cf-remove-btn { transition: all 0.2s ease; }
  .cf-remove-btn:hover {
    background: #dc2626 !important;
    color: #fff !important;
    transform: scale(1.1);
  }

  @keyframes pop-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .cf-pop { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
`;

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
        alert("File size must not exceed 5MB!");
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
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });
      if (attachment) formData.append("attachment", attachment);

      await submitComplaint(formData);
      setSuccess(true);
    } catch (err) {
      console.error("Complaint error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.category && form.subject && form.description;

  // ─── SUCCESS SCREEN ───
  if (success) {
    return (
      <div style={s.root}>
        <style>{hoverStyles}</style>
        <div style={s.container}>
          <div style={s.successCard}>
            <div style={s.successIconBox} className="cf-pop">
              <FaCheckCircle size={56} color={MINT_DARK} />
            </div>
            <h2 style={s.successTitle}>Complaint Submitted Successfully</h2>
            <p style={s.successSub}>
              Aap ki complaint admin team ko forward kar di gayi hai.
              Response 24-48 hours ke andar milega.
            </p>

            <div style={s.nextStepsCard}>
              <h3 style={s.nextStepsTitle}>
                <FaInfoCircle size={13} color={MINT_DARK} />
                What happens next?
              </h3>
              <div style={s.nextStepsList}>
                {[
                  "Our admin team will review your complaint",
                  "Action will be taken based on priority level",
                  "You'll receive an email notification with the response",
                  "You can track the status from your dashboard",
                ].map((step, i) => (
                  <div key={i} style={s.nextStep}>
                    <div style={s.nextStepNum}>{i + 1}</div>
                    <span style={s.nextStepText}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
              <button style={s.btnPrimary} className="cf-btn-primary" onClick={() => navigate("/my-complaints")}>
                View My Complaints
                <FaArrowRight size={11} />
              </button>
              <button style={s.btnOutline} className="cf-btn-outline" onClick={() => {
                setSuccess(false);
                setForm({ category: "", subject: "", description: "", priority: "medium", against_doctor: "" });
                setAttachment(null);
              }}>
                File Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container}>
        {/* HEADER */}
        <button style={s.backBtn} className="cf-btn-outline" onClick={() => navigate(-1)}>
          <FaArrowLeft size={11} />
          Back
        </button>

        <div style={s.header}>
          <div style={s.badge}>
            <FaExclamationTriangle size={11} color="#7a5a10" />
            <span>Submit a Complaint</span>
          </div>
          <h1 style={s.pageTitle}>File a Complaint</h1>
          <p style={s.pageSub}>
            Aap ki feedback humein behtar service provide karne mein madad karti hai
          </p>
        </div>

        {/* CARD */}
        <div style={s.formCard}>

          {/* Category */}
          <h2 style={s.sectionTitle}>
            <FaListAlt size={13} color={MINT_DARK} />
            Complaint Details
          </h2>

          <label style={s.label}>
            Category <span style={s.required}>*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handle}
            style={s.select}
            className="cf-select"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Against Doctor (if applicable) */}
          {(form.category === "doctor_behavior" || form.category === "doctor_service") && (
            <>
              <label style={s.label}>
                Against Doctor <span style={s.optional}>(Optional)</span>
              </label>
              <select
                name="against_doctor"
                value={form.against_doctor}
                onChange={handle}
                style={s.select}
                className="cf-select"
              >
                <option value="">Select doctor (if applicable)</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.full_name} — {doc.specialty}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Subject */}
          <label style={s.label}>
            Subject <span style={s.required}>*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handle}
            placeholder="Brief subject of your complaint"
            style={s.input}
            className="cf-input"
          />

          {/* Description */}
          <label style={s.label}>
            Description <span style={s.required}>*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handle}
            placeholder="Detailed description of your complaint. Mention dates, names, or any other relevant information..."
            style={s.textarea}
            className="cf-textarea"
            rows={6}
          />
          <div style={s.charCount}>
            {form.description.length} characters · Be detailed for faster resolution
          </div>

          {/* Priority */}
          <label style={{ ...s.label, marginTop: 20 }}>
            Priority Level <span style={s.required}>*</span>
          </label>

          <div style={s.priorityGrid}>
            {priorities.map((p) => {
              const isActive = form.priority === p.value;
              const colors = PRIORITY_COLORS[p.value] || PRIORITY_COLORS.medium;
              return (
                <button
                  key={p.value}
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`cf-priority ${isActive ? "active" : ""}`}
                  style={{
                    ...s.priorityBtn,
                    ...(isActive ? {
                      background: colors.bg,
                      border: `2px solid ${colors.color}`,
                      color: colors.color,
                    } : {}),
                  }}
                >
                  {isActive && <FaCheckCircle size={10} />}
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Attachment */}
          <label style={{ ...s.label, marginTop: 20 }}>
            Attachment <span style={s.optional}>(Optional)</span>
          </label>

          <label
            htmlFor="attachment-upload"
            style={{ ...s.uploadBox, ...(attachment ? s.uploadBoxDone : {}) }}
            className={`cf-upload-box ${attachment ? "has-file" : ""}`}
          >
            {attachment ? (
              <div style={s.uploadFileInfo}>
                <div style={s.uploadIcon}>
                  <FaCheckCircle size={18} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.uploadFileName}>{attachment.name}</div>
                  <div style={s.uploadFileSize}>
                    {(attachment.size / 1024).toFixed(1)} KB · Uploaded
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setAttachment(null); }}
                  style={s.removeBtn}
                  className="cf-remove-btn"
                >
                  <FaTimes size={11} />
                </button>
              </div>
            ) : (
              <div style={s.uploadPrompt}>
                <div style={s.uploadIconEmpty}>
                  <FaPaperclip size={16} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.uploadHint}>
                    <FaCloudUploadAlt size={11} /> Click to attach file
                  </div>
                  <div style={s.uploadFormat}>Images, PDFs · Max 5MB</div>
                </div>
              </div>
            )}
            <input
              type="file"
              id="attachment-upload"
              onChange={handleFile}
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />
          </label>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <FaInfoCircle size={13} color="#dc2626" />
              {error}
            </div>
          )}

          {/* Privacy Note */}
          <div style={s.privacyBox}>
            <HiOutlineShieldCheck size={14} color={MINT_DARK} />
            <span>
              <strong>Privacy:</strong> Aap ki complaint sirf admin team dekhegi.
              All data SSL encrypted aur confidential rakhi jati hai.
            </span>
          </div>

          {/* Submit Buttons */}
          <div style={s.btnRow}>
            <button style={s.btnOutline} className="cf-btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !canSubmit}
              style={{ ...s.btnPrimary, opacity: loading || !canSubmit ? 0.5 : 1, flex: 1 }}
              className="cf-btn-primary"
            >
              {loading ? "Submitting..." : (
                <>
                  Submit Complaint
                  <FaPaperPlane size={11} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trust Footer */}
        <div style={s.trustFooter}>
          <FaShieldAlt size={11} color={TEXT_MUTED} />
          <span>SSL Encrypted · Reviewed within 24-48 hours</span>
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
    padding: "32px 20px",
  },
  container: { maxWidth: 720, margin: "0 auto" },

  backBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    marginBottom: 20,
  },

  // HEADER
  header: { textAlign: "center", marginBottom: 28 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fff8e6",
    color: "#7a5a10",
    border: "1.5px solid #fde68a",
    padding: "6px 13px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: "clamp(24px, 3.5vw, 32px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.8px",
    margin: "0 0 10px",
  },
  pageSub: { fontSize: 15, color: TEXT_BODY, lineHeight: 1.6, maxWidth: 540, margin: "0 auto" },

  // FORM CARD
  formCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "28px 30px",
    boxShadow: "0 8px 28px rgba(15,32,24,0.05)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 0 18px",
    paddingBottom: 12,
    borderBottom: `1px solid ${BORDER}`,
  },

  // INPUTS
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_BODY,
    display: "block",
    marginBottom: 7,
    marginTop: 14,
  },
  required: { color: "#dc2626", fontWeight: 800 },
  optional: { color: TEXT_MUTED, fontWeight: 600, fontSize: 12 },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1.5px solid ${BORDER}`,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: TEXT_DARK,
    background: "#fafffe",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1.5px solid ${BORDER}`,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: TEXT_DARK,
    background: "#fafffe",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%235a7a6a'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    backgroundSize: "16px",
    paddingRight: 38,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${BORDER}`,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: TEXT_DARK,
    background: "#fafffe",
    resize: "vertical",
    boxSizing: "border-box",
    lineHeight: 1.6,
    minHeight: 110,
  },
  charCount: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    marginTop: 6,
    textAlign: "right",
  },

  // PRIORITY
  priorityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 8,
  },
  priorityBtn: {
    background: "#fafffe",
    border: `1.5px solid ${BORDER}`,
    color: TEXT_BODY,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  // UPLOAD
  uploadBox: {
    background: "#fafffe",
    border: `1.5px dashed ${BORDER}`,
    borderRadius: 11,
    padding: "14px 16px",
    display: "block",
    boxSizing: "border-box",
  },
  uploadBoxDone: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
  },
  uploadPrompt: { display: "flex", alignItems: "center", gap: 12 },
  uploadIconEmpty: {
    width: 40, height: 40,
    background: MINT_LIGHT, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  uploadIcon: {
    width: 40, height: 40,
    background: MINT_DARK, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  uploadHint: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  uploadFormat: { fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600 },
  uploadFileInfo: { display: "flex", alignItems: "center", gap: 12 },
  uploadFileName: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  uploadFileSize: { fontSize: 11.5, color: MINT_DARK, fontWeight: 700 },
  removeBtn: {
    width: 28, height: 28,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 7,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: TEXT_MUTED,
    fontFamily: "inherit",
    flexShrink: 0,
  },

  // ERROR + PRIVACY
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    color: "#991b1b",
    padding: "11px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginTop: 18,
    border: "1px solid #fecaca",
  },
  privacyBox: {
    background: MINT_LIGHT,
    border: `1px solid ${MINT}30`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 500,
    lineHeight: 1.6,
    marginTop: 18,
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
  },

  // BUTTONS
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 24,
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "13px 22px",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
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
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  // SUCCESS
  successCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "40px 32px",
    boxShadow: "0 8px 28px rgba(15,32,24,0.05)",
    textAlign: "center",
  },
  successIconBox: {
    width: 96, height: 96,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 22px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontSize: 24, fontWeight: 800, color: TEXT_DARK,
    margin: "0 0 12px", letterSpacing: "-0.3px",
  },
  successSub: {
    fontSize: 15, color: TEXT_BODY,
    marginBottom: 28, lineHeight: 1.6,
  },
  nextStepsCard: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "20px 22px",
    textAlign: "left",
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 7,
    margin: "0 0 14px",
  },
  nextStepsList: { display: "flex", flexDirection: "column", gap: 10 },
  nextStep: { display: "flex", alignItems: "center", gap: 11 },
  nextStepNum: {
    width: 24, height: 24, borderRadius: "50%",
    background: MINT_LIGHT, color: MINT_DARK,
    fontSize: 11.5, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  nextStepText: { fontSize: 13, color: TEXT_BODY, fontWeight: 600, lineHeight: 1.5 },

  // TRUST FOOTER
  trustFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 18,
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
};