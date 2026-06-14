import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaUser, FaEnvelope, FaPhone, FaIdCard,
  FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave,
  FaCloudUploadAlt, FaFileAlt, FaImage, FaCheckCircle,
  FaArrowRight, FaArrowLeft, FaTimes,
  FaCity, FaInfoCircle, FaShieldAlt, FaAward,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { submitDoctorApplication } from "../api/doctors";
import LocationPicker from "../components/LocationPicker";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const SPECIALTIES = [
  { value: "pediatric_homeopath",    label: "Pediatric Homeopath" },
  { value: "child_specialist",       label: "Child Specialist" },
  { value: "organic_medicine",       label: "Organic Medicine" },
  { value: "homeopathic_consultant", label: "Homeopathic Consultant" },
];

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Hyderabad", "Gujranwala",
  "Sialkot", "Bahawalpur", "Sargodha", "Sukkur", "Other",
];

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .dr-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dr-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .dr-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .dr-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dr-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .dr-input, .dr-select, .dr-textarea {
    transition: all 0.2s ease;
  }
  .dr-input:focus, .dr-select:focus, .dr-textarea:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    outline: none;
  }

  .dr-input-wrap {
    transition: all 0.2s ease;
  }
  .dr-input-wrap:focus-within {
    transform: translateY(-1px);
  }

  .dr-upload-box {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .dr-upload-box:hover:not(.uploaded) {
    border-color: #2a9d5c !important;
    background: #fafffe !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(42,157,92,0.1);
  }
  .dr-upload-box:hover:not(.uploaded) .dr-upload-icon {
    background: #2a9d5c !important;
    transform: scale(1.1);
  }
  .dr-upload-box:hover:not(.uploaded) .dr-upload-icon svg {
    color: #fff !important;
  }
  .dr-upload-icon, .dr-upload-icon svg {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dr-remove-btn {
    transition: all 0.2s ease;
  }
  .dr-remove-btn:hover {
    background: #dc2626 !important;
    color: #fff !important;
    transform: scale(1.1);
  }

  .dr-trust-badge {
    transition: all 0.25s ease;
  }
  .dr-trust-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(42,157,92,0.18) !important;
  }

  .dr-step-active .dr-step-num {
    box-shadow: 0 4px 12px rgba(26,110,63,0.3);
  }

  @keyframes check-pop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .dr-check-pop {
    animation: check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @media (max-width: 768px) {
    .dr-form-grid {
      grid-template-columns: 1fr !important;
    }
    .dr-upload-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    pmdc_number: "", specialty: "", experience_years: "",
    clinic_address: "", consultation_fee: 1000,
    city: "Karachi",
  });

  // ⬇️ Location state managed via LocationPicker
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
    city: "",
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
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must not exceed 5MB!");
        return;
      }
      setDocs({ ...docs, [e.target.name]: file });
    }
  };

  const removeFile = (key) => setDocs({ ...docs, [key]: null });

  // ⬇️ Called by LocationPicker on every map move / GPS / change
  const handleLocationChange = (loc) => {
    setLocation(loc);

    // Auto-fill clinic_address only if user hasn't typed anything yet
    if (loc.address && !form.clinic_address) {
      setForm((prev) => ({ ...prev, clinic_address: loc.address }));
    }

    // Auto-detect city from reverse geocoding if it matches our list
    if (loc.city) {
      const matchedCity = CITIES.find(
        (c) => c.toLowerCase() === loc.city.toLowerCase()
      );
      if (matchedCity) {
        setForm((prev) => ({ ...prev, city: matchedCity }));
      }
    }
  };

  // Validation
  const canProceedInfo = form.full_name && form.email && form.phone && form.pmdc_number && form.specialty && form.experience_years;
  const allDocsUploaded = docs.pmdc_license && docs.cnic_front && docs.cnic_back && docs.degree;

  const submit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      Object.keys(docs).forEach((key) => {
        if (docs[key]) formData.append(key, docs[key]);
      });

      // Add map location if pinned
if (location.lat && location.lng) {
  formData.append("latitude", location.lat.toFixed(7));
  formData.append("longitude", location.lng.toFixed(7));
}

      await submitDoctorApplication(formData);
      setStep(3);
    } catch (err) {
      console.error("Application error:", err.response?.data);
      const errorData = err.response?.data || {};
      setErrors(errorData);

      if (errorData.email || errorData.pmdc_number) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container}>

        {/* ═══════════════ HEADER ═══════════════ */}
        <div style={s.header}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <FaStethoscope size={18} color={MINT_DARK} />
            </div>
            <span style={s.logoText}>
              Baby<span style={{ color: MINT_DARK }}>Care</span>
            </span>
          </div>
          <button style={s.backHome} className="dr-btn-outline" onClick={() => navigate("/")}>
            <FaArrowLeft size={11} />
            Back to Home
          </button>
        </div>

        {/* ═══════════════ SUCCESS SCREEN ═══════════════ */}
        {step === 3 && (
          <div style={s.successWrap}>
            <div style={s.successIconBox} className="dr-check-pop">
              <FaCheckCircle size={56} color={MINT_DARK} />
            </div>
            <h2 style={s.successTitle}>Application Submitted Successfully</h2>
            <p style={s.successSub}>
              Your doctor application has been received. Our admin team will review
              it within 24-48 hours and you'll receive a response via email.
            </p>

            <div style={s.nextStepsCard}>
              <h3 style={s.nextStepsTitle}>What happens next?</h3>
              <div style={s.nextStepsList}>
                {[
                  { num: "1", text: "Our team will review your submitted documents" },
                  { num: "2", text: "Your PMDC number will be verified" },
                  { num: "3", text: "Once approved, you'll receive login credentials via email" },
                  { num: "4", text: "Log in to the doctor dashboard to manage patients and appointments" },
                ].map((step) => (
                  <div key={step.num} style={s.nextStep}>
                    <div style={s.nextStepNum}>{step.num}</div>
                    <span style={s.nextStepText}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <button style={s.btnPrimary} className="dr-btn-primary" onClick={() => navigate("/")}>
                Go to Home
                <FaArrowRight size={11} />
              </button>
              <button style={s.btnOutline} className="dr-btn-outline" onClick={() => navigate("/login")}>
                Login Page
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP INDICATOR ═══════════════ */}
        {step < 3 && (
          <>
            <div style={s.headerSection}>
              <div style={s.trustBadge} className="dr-trust-badge">
                <HiOutlineShieldCheck size={14} color={MINT_DARK} />
                <span>PMDC Verified Doctor Registration</span>
              </div>

              <h1 style={s.pageTitle}>Join Our Medical Network</h1>
              <p style={s.pageSub}>
                Connect with thousands of Pakistani parents looking for trusted pediatric care.
                Complete your application in 2 simple steps.
              </p>
            </div>

            {/* Step Indicator */}
            <div style={s.stepIndicator}>
              {[
                { num: 1, label: "Personal & Professional Info" },
                { num: 2, label: "Documents Upload" },
              ].map((stp, i) => {
                const active = step === stp.num;
                const done = step > stp.num;
                return (
                  <div key={stp.num} style={s.stepWrap}>
                    <div style={s.stepItem} className={active ? "dr-step-active" : ""}>
                      <div
                        style={{
                          ...s.stepNum,
                          background: done || active ? MINT_DARK : "#fff",
                          color: done || active ? "#fff" : TEXT_MUTED,
                          borderColor: done || active ? MINT_DARK : BORDER,
                        }}
                        className="dr-step-num"
                      >
                        {done ? <FaCheckCircle size={13} /> : stp.num}
                      </div>
                      <div style={{
                        ...s.stepLabel,
                        color: active ? MINT_DARK : done ? MINT_DARK : TEXT_MUTED,
                        fontWeight: active ? 800 : 700,
                      }}>
                        {stp.label}
                      </div>
                    </div>
                    {i === 0 && (
                      <div style={{
                        ...s.stepLine,
                        background: step > 1 ? MINT_DARK : BORDER,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══════════════ STEP 1: PERSONAL INFO ═══════════════ */}
        {step === 1 && (
          <div style={s.formCard}>

            {/* Personal Info Section */}
            <h2 style={s.sectionTitle}>
              <FaUser size={14} color={MINT_DARK} />
              Personal Information
            </h2>

            <div style={s.formGrid} className="dr-form-grid">
              <FormField
                label="Full Name"
                Icon={FaUser}
                name="full_name"
                value={form.full_name}
                onChange={handle}
                placeholder="Dr. Sara Ahmed"
                required
                error={errors.full_name}
              />
              <FormField
                label="Email Address"
                Icon={FaEnvelope}
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="dr.sara@example.com"
                required
                error={errors.email}
              />
              <FormField
                label="Phone Number"
                Icon={FaPhone}
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="0300-1234567"
                required
                error={errors.phone}
              />
              <FormField
                label="PMDC Number"
                Icon={FaIdCard}
                name="pmdc_number"
                value={form.pmdc_number}
                onChange={handle}
                placeholder="e.g., 12345-S"
                required
                error={errors.pmdc_number}
              />
            </div>

            {/* Professional Info Section */}
            <h2 style={{ ...s.sectionTitle, marginTop: 32 }}>
              <FaBriefcase size={14} color={MINT_DARK} />
              Professional Details
            </h2>

            <div style={s.formGrid} className="dr-form-grid">
              <div>
                <label style={s.label}>
                  Specialty <span style={s.required}>*</span>
                </label>
                <div style={s.inputWrap} className="dr-input-wrap">
                  <FaGraduationCap size={14} color={TEXT_MUTED} style={s.inputIcon} />
                  <select
                    name="specialty"
                    value={form.specialty}
                    onChange={handle}
                    style={s.select}
                    className="dr-select"
                  >
                    <option value="">Select your specialty</option>
                    {SPECIALTIES.map((sp) => (
                      <option key={sp.value} value={sp.value}>{sp.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FormField
                label="Years of Experience"
                Icon={FaAward}
                name="experience_years"
                type="number"
                value={form.experience_years}
                onChange={handle}
                placeholder="e.g., 5"
                required
              />

              <FormField
                label="Consultation Fee (Rs.)"
                Icon={FaMoneyBillWave}
                name="consultation_fee"
                type="number"
                value={form.consultation_fee}
                onChange={handle}
                placeholder="1000"
              />

              <div>
                <label style={s.label}>
                  City <span style={s.required}>*</span>
                </label>
                <div style={s.inputWrap} className="dr-input-wrap">
                  <FaCity size={14} color={TEXT_MUTED} style={s.inputIcon} />
                  <select
                    name="city"
                    value={form.city}
                    onChange={handle}
                    style={s.select}
                    className="dr-select"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ⬇️ NEW: MAP-BASED CLINIC LOCATION */}
            <h2 style={{ ...s.sectionTitle, marginTop: 32 }}>
              <FaMapMarkerAlt size={14} color={MINT_DARK} />
              Pin Your Clinic on the Map
            </h2>

            <p style={s.mapHint}>
              Drag the map to position the pin over your clinic location, or click the
              GPS button to use your current location.
            </p>

            <LocationPicker
              value={location.lat ? location : null}
              onChange={handleLocationChange}
              height={380}
            />

            {/* Clinic Address (editable) */}
            <label style={{ ...s.label, marginTop: 20 }}>
              Clinic Address {location.address && <span style={s.optional}>(auto-filled, you can edit)</span>}
            </label>
            <textarea
              name="clinic_address"
              value={form.clinic_address}
              onChange={handle}
              placeholder="Full clinic address (e.g., Bilal Plaza, Block 5, Gulshan-e-Iqbal, Karachi)"
              style={s.textarea}
              className="dr-textarea"
              rows={2}
            />

            <div style={s.helpBox}>
              <FaInfoCircle size={12} color={MINT_DARK} />
              <span>
                <strong>Why we need this:</strong> Pinning your clinic on the map allows
                patients to see your exact location, get directions, and find you on the
                interactive doctor booking map.
              </span>
            </div>

            {/* Continue Button */}
            <div style={s.btnRow}>
              <div /> {/* Spacer */}
              <button
                style={{ ...s.btnPrimary, opacity: canProceedInfo ? 1 : 0.5 }}
                className="dr-btn-primary"
                onClick={() => canProceedInfo && setStep(2)}
                disabled={!canProceedInfo}
              >
                Continue to Documents
                <FaArrowRight size={12} />
              </button>
            </div>

            {!canProceedInfo && (
              <div style={s.helperBox}>
                <FaInfoCircle size={12} color={TEXT_MUTED} />
                <span>Please fill all required fields to continue</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ STEP 2: DOCUMENTS ═══════════════ */}
        {step === 2 && (
          <div style={s.formCard}>
            <h2 style={s.sectionTitle}>
              <FaFileAlt size={14} color={MINT_DARK} />
              Required Documents
            </h2>
            <p style={s.sectionSub}>
              Upload clear, readable scans/photos of the following documents.
              Max file size: <strong>5MB</strong> per file.
            </p>

            <div style={s.uploadGrid} className="dr-upload-grid">
              <UploadBox
                label="PMDC License"
                name="pmdc_license"
                icon={FaIdCard}
                required
                file={docs.pmdc_license}
                onChange={handleFile}
                onRemove={() => removeFile("pmdc_license")}
              />
              <UploadBox
                label="CNIC Front"
                name="cnic_front"
                icon={FaIdCard}
                required
                file={docs.cnic_front}
                onChange={handleFile}
                onRemove={() => removeFile("cnic_front")}
              />
              <UploadBox
                label="CNIC Back"
                name="cnic_back"
                icon={FaIdCard}
                required
                file={docs.cnic_back}
                onChange={handleFile}
                onRemove={() => removeFile("cnic_back")}
              />
              <UploadBox
                label="Medical Degree"
                name="degree"
                icon={FaGraduationCap}
                required
                file={docs.degree}
                onChange={handleFile}
                onRemove={() => removeFile("degree")}
              />
              <UploadBox
                label="Profile Photo"
                name="profile_photo"
                icon={FaImage}
                hint="(Optional but recommended)"
                file={docs.profile_photo}
                onChange={handleFile}
                onRemove={() => removeFile("profile_photo")}
              />
            </div>

            {/* Trust Notice */}
            <div style={s.trustNotice}>
              <FaShieldAlt size={16} color={MINT_DARK} />
              <div>
                <strong style={{ color: TEXT_DARK }}>Your data is secure.</strong> All documents
                are encrypted and stored securely. They will only be reviewed by our
                medical verification team for PMDC authentication.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={s.btnRow}>
              <button style={s.btnOutline} className="dr-btn-outline" onClick={() => setStep(1)}>
                <FaArrowLeft size={11} />
                Back to Info
              </button>
              <button
                style={{ ...s.btnPrimary, opacity: allDocsUploaded && !loading ? 1 : 0.5 }}
                className="dr-btn-primary"
                onClick={submit}
                disabled={!allDocsUploaded || loading}
              >
                {loading ? "Submitting..." : (
                  <>
                    Submit Application
                    <FaCheckCircle size={13} />
                  </>
                )}
              </button>
            </div>

            {!allDocsUploaded && (
              <div style={s.helperBox}>
                <FaInfoCircle size={12} color={TEXT_MUTED} />
                <span>All required documents (4) must be uploaded to submit</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ FOOTER TRUST STRIP ═══════════════ */}
        {step < 3 && (
          <div style={s.trustStrip}>
            <div style={s.trustItem}>
              <FaShieldAlt size={11} color={MINT_DARK} />
              <span>SSL Encrypted</span>
            </div>
            <div style={s.trustDivider} />
            <div style={s.trustItem}>
              <HiOutlineShieldCheck size={12} color={MINT_DARK} />
              <span>PMDC Verification</span>
            </div>
            <div style={s.trustDivider} />
            <div style={s.trustItem}>
              <FaAward size={11} color={MINT_DARK} />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ FORM FIELD COMPONENT ═══════════════
function FormField({ label, Icon, required, error, ...inputProps }) {
  return (
    <div>
      <label style={s.label}>
        {label} {required && <span style={s.required}>*</span>}
      </label>
      <div style={s.inputWrap} className="dr-input-wrap">
        <Icon size={14} color={TEXT_MUTED} style={s.inputIcon} />
        <input {...inputProps} style={s.input} className="dr-input" />
      </div>
      {error && <div style={s.errorText}>⚠️ {error}</div>}
    </div>
  );
}

// ═══════════════ UPLOAD BOX COMPONENT ═══════════════
function UploadBox({ label, name, icon: Icon, file, required, hint, onChange, onRemove }) {
  const hasFile = !!file;

  return (
    <div style={s.uploadCard}>
      <label style={s.uploadLabel}>
        {label} {required && <span style={s.required}>*</span>}
        {hint && <span style={s.optional}> {hint}</span>}
      </label>

      <label
        htmlFor={name}
        style={{ ...s.uploadBox, ...(hasFile ? s.uploadBoxDone : {}) }}
        className={`dr-upload-box ${hasFile ? "uploaded" : ""}`}
      >
        {hasFile ? (
          <div style={s.fileInfo}>
            <div style={{ ...s.uploadIcon, background: MINT_DARK }} className="dr-check-pop">
              <FaCheckCircle size={20} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={s.fileName}>{file.name}</div>
              <div style={s.fileSize}>
                {(file.size / 1024).toFixed(1)} KB · Uploaded
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onRemove(); }}
              style={s.removeBtn}
              className="dr-remove-btn"
            >
              <FaTimes size={11} />
            </button>
          </div>
        ) : (
          <div style={s.uploadPrompt}>
            <div style={s.uploadIcon} className="dr-upload-icon">
              <Icon size={18} color={MINT_DARK} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={s.uploadHint}>
                <FaCloudUploadAlt size={12} /> Click to upload
              </div>
              <div style={s.uploadFormat}>JPG, PNG, or PDF · Max 5MB</div>
            </div>
          </div>
        )}
        <input
          type="file"
          id={name}
          name={name}
          onChange={onChange}
          accept="image/*,application/pdf"
          style={{ display: "none" }}
        />
      </label>
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
  container: { maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" },

  // HEADER
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
    flexWrap: "wrap",
    gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 11, cursor: "pointer" },
  logoIcon: {
    width: 40,
    height: 40,
    background: MINT_LIGHT,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${BORDER}`,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.5px",
  },
  backHome: {
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
  },

  // PAGE HEADER
  headerSection: { textAlign: "center", marginBottom: 32 },
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
    marginBottom: 18,
    boxShadow: "0 2px 8px rgba(42,157,92,0.1)",
    cursor: "default",
  },
  pageTitle: {
    fontSize: "clamp(26px, 4vw, 36px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-1px",
    margin: "0 0 12px",
    lineHeight: 1.2,
  },
  pageSub: {
    fontSize: 15,
    color: TEXT_BODY,
    lineHeight: 1.6,
    maxWidth: 540,
    margin: "0 auto",
  },

  // STEP INDICATOR
  stepIndicator: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 8,
  },
  stepWrap: { display: "flex", alignItems: "flex-start" },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    maxWidth: 140,
  },
  stepNum: {
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
  stepLabel: { fontSize: 12.5, textAlign: "center", lineHeight: 1.3 },
  stepLine: { width: 80, height: 2, marginTop: 18, marginInline: 12 },

  // FORM CARD
  formCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "32px 32px 28px",
    boxShadow: "0 8px 28px rgba(15,32,24,0.05)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 0 4px",
    letterSpacing: "-0.2px",
    paddingBottom: 10,
    borderBottom: `1px solid ${BORDER}`,
  },
  sectionSub: {
    fontSize: 13.5,
    color: TEXT_MUTED,
    marginBottom: 20,
    marginTop: 8,
    lineHeight: 1.5,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 18,
  },

  // INPUTS
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_BODY,
    display: "block",
    marginBottom: 7,
  },
  required: { color: "#dc2626", fontWeight: 800 },
  optional: { color: TEXT_MUTED, fontWeight: 600, fontSize: 12 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: 14,
    pointerEvents: "none",
    zIndex: 2,
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 40px",
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
    padding: "11px 14px 11px 40px",
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
    padding: "11px 14px",
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
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: 600,
    marginTop: 6,
  },

  // MAP SECTION
  mapHint: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: 500,
    margin: "10px 0 16px",
    lineHeight: 1.5,
  },

  // HELP / INFO BOXES
  helpBox: {
    background: MINT_LIGHT,
    border: `1px solid ${MINT}30`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 500,
    lineHeight: 1.6,
    marginTop: 12,
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
  },
  helperBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: `1px dashed ${BORDER}`,
    color: TEXT_MUTED,
    padding: "8px 14px",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 600,
    marginTop: 12,
  },

  // UPLOAD
  uploadGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginTop: 18,
  },
  uploadCard: {},
  uploadLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_BODY,
    marginBottom: 8,
    display: "block",
  },
  uploadBox: {
    background: "#fafffe",
    border: `1.5px dashed ${BORDER}`,
    borderRadius: 11,
    padding: "16px 14px",
    display: "block",
    minHeight: 78,
    boxSizing: "border-box",
  },
  uploadBoxDone: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
  },
  uploadPrompt: { display: "flex", alignItems: "center", gap: 12 },
  uploadIcon: {
    width: 42,
    height: 42,
    background: MINT_LIGHT,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  uploadHint: {
    fontSize: 13.5,
    fontWeight: 700,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  uploadFormat: { fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600 },
  fileInfo: { display: "flex", alignItems: "center", gap: 12 },
  fileName: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: { fontSize: 11.5, color: MINT_DARK, fontWeight: 700 },
  removeBtn: {
    width: 28,
    height: 28,
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

  // TRUST NOTICE
  trustNotice: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 500,
    lineHeight: 1.65,
    marginTop: 24,
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
  },

  // BUTTONS
  btnRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "12px 24px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },
  btnOutline: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 11,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  // SUCCESS
  successWrap: {
    maxWidth: 580,
    margin: "60px auto",
    textAlign: "center",
  },
  successIconBox: {
    width: 96,
    height: 96,
    background: MINT_LIGHT,
    borderRadius: "50%",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  successSub: {
    fontSize: 15,
    color: TEXT_BODY,
    marginBottom: 32,
    lineHeight: 1.7,
  },
  nextStepsCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "24px 28px",
    textAlign: "left",
    boxShadow: "0 8px 28px rgba(15,32,24,0.05)",
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 16,
    letterSpacing: "-0.2px",
    margin: "0 0 16px",
  },
  nextStepsList: { display: "flex", flexDirection: "column", gap: 12 },
  nextStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  nextStepNum: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: MINT_LIGHT,
    color: MINT_DARK,
    fontSize: 12,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nextStepText: {
    fontSize: 13.5,
    color: TEXT_BODY,
    fontWeight: 600,
    lineHeight: 1.5,
  },

  // TRUST STRIP
  trustStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 28,
    paddingTop: 22,
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