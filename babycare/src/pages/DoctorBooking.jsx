import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar, FaUserMd, FaHospital, FaMoneyBillWave,
  FaCheckCircle, FaArrowRight, FaClock,
  FaMapMarkerAlt, FaFilter, FaCalendarAlt,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { getPublicDoctors, bookAppointment, getAvailableSlots } from "../api/appointments";
import DoctorAvatar from "../components/DoctorAvatar";

const MINT       = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK  = "#1a6e3f";

export default function DoctorBooking() {
  const navigate = useNavigate();

  const [step, setStep]       = useState("list");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [selDoc, setSelDoc]   = useState(null);
  const [selSlot, setSelSlot] = useState("");
  const [filter, setFilter]   = useState("All");

  // ⬇️ NEW: Date selection + dynamic slots
  const today = new Date().toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [allSlots, setAllSlots]         = useState([]);
  const [bookedSlots, setBookedSlots]   = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking form
  const [babyName, setBabyName] = useState("");
  const [babyAge, setBabyAge]   = useState("");
  const [symptom, setSymptom]   = useState("");
  const [notes, setNotes]       = useState("");
  const [phone, setPhone]       = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // ─── Load doctors ───
  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const data = await getPublicDoctors();
        setDoctors(data);
      } catch (err) {
        setError("Doctors load nahi ho sake. Dobara try karein.");
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  // ─── Load available slots when date OR doctor changes ───
  useEffect(() => {
    if (!selDoc || !selectedDate) return;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSelSlot(""); // Reset selected slot when date changes
      try {
        const data = await getAvailableSlots(selDoc.id, selectedDate);
        setAllSlots(data.all_slots);
        setBookedSlots(data.booked_slots);
      } catch (err) {
        console.error("Slots load error:", err);
        setError("Time slots load nahi ho sake");
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selDoc, selectedDate]);

  // ─── Filter doctors ───
  const specialties = ["All", ...new Set(doctors.map((d) => d.specialty))];
  const filteredDoctors = filter === "All"
    ? doctors
    : doctors.filter((d) => d.specialty === filter);

  // ─── Submit booking ───
  const handleBook = async () => {
    setBookingLoading(true);
    setError("");

    try {
      await bookAppointment({
        doctor: selDoc.id,
        baby_name: babyName,
        baby_age: babyAge,
        symptom: symptom,
        notes: notes,
        appointment_date: selectedDate,
        time_slot: selSlot,
        contact_phone: phone,
      });

      setStep("success");
    } catch (err) {
      console.error("Booking error:", err.response?.data);
      setError(err.response?.data?.detail || "Booking fail ho gayi. Dobara try karein.");
    } finally {
      setBookingLoading(false);
    }
  };

  const canBook = babyName && babyAge && symptom && phone && selSlot && selectedDate;

  // Helper: format date nicely
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />
      <div className="bc-orb" style={{ width: 260, height: 260, background: "#d1f5e0", bottom: "10%", left: "-60px", animationDelay: "3s" }} />

      <div style={s.container}>

        {/* ═══════════════ SUCCESS SCREEN ═══════════════ */}
        {step === "success" && (
          <div style={s.successWrap} className="bc-anim-popIn">
            <div className="bc-check-pop"><FaCheckCircle size={64} color={MINT} /></div>
            <h2 style={s.successTitle}>Appointment Booked! 🎉</h2>
            <div style={s.successCard} className="bc-anim-fadeUp bc-d1">
              {[
                ["Doctor",     selDoc?.full_name],
                ["Specialty",  selDoc?.specialty],
                ["Date",       formatDate(selectedDate)],
                ["Time Slot",  selSlot],
                ["Baby",       babyName],
                ["Symptom",    symptom],
                ["Fee",        `Rs. ${selDoc?.consultation_fee}`],
              ].map(([k, v]) => (
                <div key={k} style={s.sRow}>
                  <span style={s.sKey}>{k}</span>
                  <span style={s.sVal}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "#5a7a6a", fontSize: 14, marginBottom: 24 }} className="bc-anim-fadeUp bc-d2">
              Doctor ko notification mil gayi hai. Confirmation ka intezaar karein.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} className="bc-anim-fadeUp bc-d3">
              <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/dashboard")}>
                View My Appointments
              </button>
              <button style={s.btnOutline} className="bc-btn-outline-glow" onClick={() => {
                setStep("list"); setSelDoc(null); setSelSlot(""); setSelectedDate(today);
                setBabyName(""); setBabyAge(""); setSymptom(""); setNotes(""); setPhone("");
              }}>
                Book Another
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ CONFIRM SCREEN ═══════════════ */}
        {step === "confirm" && selDoc && (
          <div style={s.confirmWrap} className="bc-anim-fadeUp">
            <button style={{ ...s.btnOutline, marginBottom: 22 }} className="bc-btn-outline-glow" onClick={() => setStep("list")}>
              ← Back to Doctors
            </button>
            <h2 style={s.pageTitle}>Confirm Your Appointment</h2>

            {/* Doctor summary */}
            <div style={s.docSummary} className="bc-anim-scaleIn bc-d1">
              <DoctorAvatar
                photoUrl={selDoc.profile_photo_url}
                name={selDoc.full_name}
                size={60}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={s.docName}>{selDoc.full_name}</span>
                  <MdVerified size={16} color={MINT} />
                </div>
                <div style={s.docSpec}>{selDoc.specialty}</div>
                <div style={s.docMeta}>
                  <FaStar size={11} color="#e8a045" /> {selDoc.rating || "New"} · {selDoc.experience_years} yrs exp
                </div>
              </div>
              <div style={s.feeBadge}>Rs. {selDoc.consultation_fee}</div>
            </div>

            {/* ⬇️ NEW: DATE PICKER */}
            <label style={s.label}><FaCalendarAlt size={12} color={MINT} /> Select Appointment Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              max={maxDate}
              style={s.dateInput}
              className="bc-input-glow"
            />
            <div style={s.dateHint}>
              📅 Aaj se 30 din tak ki date select kar sakte hain · Selected: <strong>{formatDate(selectedDate)}</strong>
            </div>

            {/* TIME SLOTS — with availability */}
            <label style={s.label}><FaClock size={12} color={MINT} /> Choose Time Slot</label>

            {slotsLoading ? (
              <div style={s.slotsLoading}>
                <span className="bc-spinner" /> Slots check ho rahe hain...
              </div>
            ) : (
              <>
                <div style={s.slotsGrid}>
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => !isBooked && setSelSlot(slot)}
                        disabled={isBooked}
                        style={{
                          ...s.slotBtn,
                          ...(isSelected ? s.slotActive : {}),
                          ...(isBooked ? s.slotBooked : {}),
                        }}
                        title={isBooked ? "Yeh slot already booked hai" : "Click karke select karein"}
                      >
                        {isSelected && <FaCheckCircle size={11} color={MINT} className="bc-check-pop" />}
                        <span style={{ textDecoration: isBooked ? "line-through" : "none" }}>{slot}</span>
                        {isBooked && <span style={s.bookedLabel}>Booked</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Slot availability summary */}
                <div style={s.slotSummary}>
                  <span style={{ color: MINT, fontWeight: 700 }}>
                    ✅ {allSlots.length - bookedSlots.length} available
                  </span>
                  {bookedSlots.length > 0 && (
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>
                      ❌ {bookedSlots.length} booked
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Form */}
            <label style={s.label}>Baby's Name *</label>
            <input value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="e.g. Baby Ahmed" style={s.input} className="bc-input-glow" />

            <label style={s.label}>Baby's Age *</label>
            <input value={babyAge} onChange={(e) => setBabyAge(e.target.value)} placeholder="e.g. 8 months" style={s.input} className="bc-input-glow" />

            <label style={s.label}>Your Contact Number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" style={s.input} className="bc-input-glow" />

            <label style={s.label}>Symptom / Reason *</label>
            <input value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="e.g. Fever, Cough" style={s.input} className="bc-input-glow" />

            <label style={s.label}>Additional Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Koi aur details..." style={s.textarea} className="bc-input-glow" rows={3} />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <div style={s.feeRow}>
              <span style={{ fontSize: 14, color: "#5a7a6a", fontWeight: 600 }}>Consultation Fee</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: MINT_DARK }}>Rs. {selDoc.consultation_fee}</span>
            </div>

            <button
              style={{ ...s.btnPrimary, width: "100%", opacity: canBook && !bookingLoading ? 1 : 0.5 }}
              className={canBook && !bookingLoading ? "bc-btn-glow" : ""}
              disabled={!canBook || bookingLoading}
              onClick={handleBook}
            >
              {bookingLoading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="bc-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.35)" }} />
                  Booking...
                </span>
              ) : <>Confirm Appointment <FaCheckCircle size={14} /></>}
            </button>
          </div>
        )}

        {/* ═══════════════ DOCTORS LIST ═══════════════ */}
        {step === "list" && (
          <>
            <div style={s.pageHeader} className="bc-anim-fadeUp">
              <span style={s.badge}><FaUserMd size={11} /> Doctor Booking</span>
              <h1 style={s.pageTitle}>Find a Certified Doctor</h1>
              <p style={s.pageSub}>Book with our verified pediatric & homeopathic specialists</p>
            </div>

            {loading ? (
              <div style={s.loadingBox}>
                <span className="bc-spinner" style={{ width: 40, height: 40 }} />
                <p>Loading doctors...</p>
              </div>
            ) : error ? (
              <div style={s.errorBox}>⚠️ {error}</div>
            ) : doctors.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: 56, marginBottom: 12 }} className="bc-float">👨‍⚕️</div>
                <p style={{ fontSize: 15, color: "#5a7a6a", fontWeight: 700 }}>Abhi koi doctor available nahi hai</p>
                <p style={{ fontSize: 13, color: "#9ab5a5" }}>Jald hi naye doctors add honge!</p>
              </div>
            ) : (
              <>
                <div style={s.filterRow} className="bc-anim-fadeUp bc-d1">
                  <FaFilter size={13} color="#9ab5a5" style={{ marginTop: 2 }} />
                  {specialties.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{ ...s.filterPill, ...(filter === f ? s.filterActive : {}) }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div style={s.docGrid}>
                  {filteredDoctors.map((doc, i) => (
                    <div
                      key={doc.id}
                      style={s.docCard}
                      className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}
                    >
                      <div style={s.docCardTop}>
                        <DoctorAvatar
                          photoUrl={doc.profile_photo_url}
                          name={doc.full_name}
                          size={52}
                        />
                        <div>
                          <div style={s.docName}>{doc.full_name}</div>
                          <div style={s.docSpec}>{doc.specialty}</div>
                          <div style={s.docMeta}>
                            <FaStar size={11} color="#e8a045" /> {doc.rating > 0 ? doc.rating : "New"}
                            {doc.total_reviews > 0 && ` · ${doc.total_reviews} reviews`}
                          </div>
                        </div>
                      </div>

                      {doc.clinic_address && (
                        <div style={s.locationRow}>
                          <FaMapMarkerAlt size={12} color={MINT} />
                          <span style={s.locationText}>{doc.clinic_address}</span>
                        </div>
                      )}

                      <div style={s.docDetails}>
                        <div style={s.detailItem}><FaHospital size={12} color={MINT} /> {doc.experience_years} yrs</div>
                        <div style={s.detailItem}><FaMoneyBillWave size={12} color={MINT} /> Rs. {doc.consultation_fee}</div>
                        <div style={{ ...s.detailItem, color: MINT, fontWeight: 700 }}>
                          <FaCheckCircle size={12} color={MINT} /> Available
                        </div>
                      </div>

                      <button
                        style={s.btnPrimary}
                        className="bc-btn-glow"
                        onClick={() => { setSelDoc(doc); setStep("confirm"); setSelSlot(""); setSelectedDate(today); }}
                      >
                        Book Appointment <FaArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)", fontFamily: "'Nunito','Segoe UI',sans-serif", position: "relative", overflow: "hidden" },
  container: { maxWidth: 1050, margin: "0 auto", padding: "44px 24px 72px", position: "relative", zIndex: 2 },

  pageHeader: { textAlign: "center", marginBottom: 28 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,248,239,0.85)", backdropFilter: "blur(8px)", color: "#1a6e3f", borderRadius: 20, padding: "6px 16px", fontSize: 12.5, fontWeight: 800, marginBottom: 12, border: "1px solid rgba(42,157,92,0.18)" },
  pageTitle: { fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.8px", margin: "0 0 8px" },
  pageSub: { fontSize: 15, color: "#5a7a6a" },

  loadingBox: { textAlign: "center", padding: "60px 20px", color: "#5a7a6a", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "1px solid #fca5a5", marginBottom: 16 },

  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" },
  filterPill: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 20, padding: "7px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", transition: "all 0.22s ease" },
  filterActive: { background: "#e8f8ef", border: "2px solid #2a9d5c", color: "#1a6e3f", boxShadow: "0 0 0 3px rgba(42,157,92,0.1)" },

  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 },
  docCard: { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(12px) saturate(140%)", WebkitBackdropFilter: "blur(12px) saturate(140%)", border: "1.5px solid rgba(224,237,230,0.7)", borderRadius: 16, padding: "20px 18px", boxShadow: "0 4px 16px rgba(42,157,92,0.08)", display: "flex", flexDirection: "column", gap: 12 },
  docCardTop: { display: "flex", gap: 11, alignItems: "center" },
  docName: { fontSize: 14.5, fontWeight: 900, color: "#0f2018", marginBottom: 2 },
  docSpec: { fontSize: 12, color: "#2a9d5c", fontWeight: 700, marginBottom: 2 },
  docMeta: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
  locationRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  locationText: { fontSize: 12, color: "#5a7a6a", fontWeight: 600 },
  docDetails: { display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid #f0f5f2" },
  detailItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#3d5a48", fontWeight: 600 },

  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 9, padding: "11px 20px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.3)" },
  btnOutline: { background: "rgba(255,255,255,0.6)", color: "#2a9d5c", border: "2px solid #2a9d5c", borderRadius: 9, padding: "9px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  confirmWrap: { maxWidth: 540, margin: "0 auto" },
  docSummary: { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(14px)", border: "1.5px solid rgba(224,237,230,0.7)", borderRadius: 13, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap", boxShadow: "0 6px 22px rgba(42,157,92,0.1)" },
  feeBadge: { marginLeft: "auto", background: "#e8f8ef", color: "#1a6e3f", fontWeight: 900, fontSize: 14, borderRadius: 9, padding: "7px 14px" },
  label: { fontSize: 13, fontWeight: 800, color: "#3d5a48", display: "flex", alignItems: "center", gap: 6, margin: "18px 0 9px" },

  // ⬇️ NEW: Date picker styles
  dateInput: {
    width: "100%",
    border: "2px solid #d4eddf",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: "inherit",
    color: "#1a2e24",
    outline: "none",
    background: "rgba(250,255,254,0.7)",
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  dateHint: { fontSize: 11.5, color: "#5a7a6a", marginTop: 6, padding: "6px 10px", background: "rgba(232,248,239,0.5)", borderRadius: 7 },

  slotsGrid: { display: "flex", gap: 9, flexWrap: "wrap" },
  slotBtn: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", display: "flex", alignItems: "center", gap: 5, transition: "all 0.22s ease", position: "relative" },
  slotActive: { background: "#e8f8ef", border: "2px solid #2a9d5c", color: "#1a6e3f", boxShadow: "0 0 0 3px rgba(42,157,92,0.12)" },
  slotBooked: { background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", cursor: "not-allowed", opacity: 0.7 },
  bookedLabel: { fontSize: 9.5, background: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: 4, marginLeft: 4, fontWeight: 800 },
  slotsLoading: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(232,248,239,0.5)", borderRadius: 9, fontSize: 13, color: "#5a7a6a", fontWeight: 700 },
  slotSummary: { display: "flex", gap: 14, marginTop: 10, fontSize: 12, padding: "8px 12px", background: "rgba(250,255,254,0.7)", borderRadius: 7 },

  input: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "rgba(250,255,254,0.7)", display: "block", boxSizing: "border-box" },
  textarea: { width: "100%", border: "1.5px solid #d4eddf", borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", outline: "none", background: "rgba(250,255,254,0.7)", resize: "vertical", boxSizing: "border-box" },
  feeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#e8f8ef", borderRadius: 10, padding: "13px 16px", margin: "16px 0 14px" },

  successWrap: { textAlign: "center", maxWidth: 460, margin: "60px auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  successTitle: { fontSize: 26, fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px" },
  successCard: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", border: "1.5px solid rgba(224,237,230,0.7)", borderRadius: 14, padding: "22px 26px", width: "100%", textAlign: "left", boxShadow: "0 8px 28px rgba(42,157,92,0.12)" },
  sRow: { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f5f2" },
  sKey: { fontSize: 13, color: "#9ab5a5", fontWeight: 700 },
  sVal: { fontSize: 13.5, color: "#0f2018", fontWeight: 800 },
};