import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar, FaUserMd, FaMoneyBillWave,
  FaCheckCircle, FaArrowRight, FaClock,
  FaMapMarkerAlt, FaFilter, FaCalendarAlt,
  FaStethoscope, FaAward,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { getPublicDoctors, bookAppointment, getAvailableSlots } from "../api/appointments";
import DoctorAvatar from "../components/DoctorAvatar";
import DoctorsMap from "../components/DoctorsMap";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .db-doc-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .db-doc-card:hover {
    transform: translateY(-3px);
    border-color: #2a9d5c !important;
    box-shadow: 0 10px 24px rgba(42,157,92,0.12);
  }
  .db-doc-card.selected {
    border: 2px solid #f59e0b !important;
    background: #fffbeb !important;
    box-shadow: 0 8px 24px rgba(245,158,11,0.2);
  }

  .db-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .db-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .db-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .db-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
    transform: translateY(-2px);
  }

  .db-pill {
    transition: all 0.2s ease;
  }
  .db-pill:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
  }

  .db-slot-btn {
    transition: all 0.2s ease;
  }
  .db-slot-btn:hover:not(:disabled):not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
    transform: translateY(-1px);
  }

  .db-input, .db-textarea, .db-date {
    transition: all 0.2s ease;
  }
  .db-input:focus, .db-textarea:focus, .db-date:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
    outline: none;
  }

  /* ═══════════════ SPLIT LAYOUT ═══════════════ */
  .db-split-layout {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 20px;
    align-items: flex-start;
  }

  .db-map-column {
    position: sticky;
    top: 20px;
  }

  /* Mobile: stack map on top, list below */
  @media (max-width: 968px) {
    .db-split-layout {
      grid-template-columns: 1fr !important;
    }
    .db-map-column {
      position: static !important;
      order: -1;
    }
  }

  @media (max-width: 768px) {
    .db-doc-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default function DoctorBooking() {
  const navigate = useNavigate();

  const [step, setStep] = useState("list");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selDoc, setSelDoc] = useState(null);
  const [selSlot, setSelSlot] = useState("");
  const [filter, setFilter] = useState("All");

  // ⬇️ NEW: Highlighted doctor (for map<->list sync)
  const [highlightedDoctorId, setHighlightedDoctorId] = useState(null);

  // Date + slots
  const today = new Date().toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [allSlots, setAllSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking form
  const [babyName, setBabyName] = useState("");
  const [babyAge, setBabyAge] = useState("");
  const [symptom, setSymptom] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // ─── Load doctors ───
  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPublicDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Doctors load error:", err);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // ─── Load available slots ───
  useEffect(() => {
    if (!selDoc || !selectedDate) return;
    const loadSlots = async () => {
      setSlotsLoading(true);
      setSelSlot("");
      try {
        const data = await getAvailableSlots(selDoc.id, selectedDate);
        setAllSlots(data.all_slots);
        setBookedSlots(data.booked_slots);
      } catch (err) {
        setError("Failed to load time slots");
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selDoc, selectedDate]);

  // ─── Filter ───
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
      setError(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Marker click → highlight + scroll to card ───
  const handleMarkerClick = (doctorId) => {
    setHighlightedDoctorId(doctorId);
    // Smooth scroll to the doctor card
    const el = document.getElementById(`doc-card-${doctorId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ─── Card hover/click → highlight marker ───
  const handleCardHighlight = (doctorId) => {
    setHighlightedDoctorId(doctorId);
  };

  const canBook = babyName && babyAge && symptom && phone && selSlot && selectedDate;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Count doctors with map coordinates
  const doctorsWithLocation = filteredDoctors.filter((d) => d.latitude && d.longitude);

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container}>

        {/* ═══════════════ SUCCESS SCREEN ═══════════════ */}
        {step === "success" && (
          <div style={s.successWrap}>
            <div style={s.successIconBox}>
              <FaCheckCircle size={56} color={MINT_DARK} />
            </div>
            <h2 style={s.successTitle}>Appointment Booked Successfully</h2>
            <p style={s.successSub}>
              The doctor has been notified. You'll receive a confirmation within 24 hours.
            </p>

            <div style={s.successCard}>
              {[
                ["Doctor", selDoc?.full_name],
                ["Specialty", selDoc?.specialty],
                ["Date", formatDate(selectedDate)],
                ["Time Slot", selSlot],
                ["Baby Name", babyName],
                ["Consultation Fee", `Rs. ${selDoc?.consultation_fee}`],
              ].map(([k, v]) => (
                <div key={k} style={s.sRow}>
                  <span style={s.sKey}>{k}</span>
                  <span style={s.sVal}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              <button style={s.btnPrimary} className="db-btn-primary" onClick={() => navigate("/dashboard")}>
                View My Appointments
                <FaArrowRight size={11} />
              </button>
              <button style={s.btnOutline} className="db-btn-outline" onClick={() => {
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
          <div style={s.confirmWrap}>
            <button style={s.backBtn} className="db-btn-outline" onClick={() => setStep("list")}>
              ← Back to Doctors
            </button>

            <h2 style={s.pageTitle}>Confirm Your Appointment</h2>
            <p style={s.pageSub}>Please review and complete the details below</p>

            {/* Doctor Summary */}
            <div style={s.docSummary}>
              <DoctorAvatar
                photoUrl={selDoc.profile_photo_url}
                name={selDoc.full_name}
                size={60}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={s.docName}>{selDoc.full_name}</span>
                  <HiOutlineShieldCheck size={16} color={MINT_DARK} />
                </div>
                <div style={s.docSpec}>{selDoc.specialty}</div>
                <div style={s.docMeta}>
                  <FaStar size={11} color="#f59e0b" /> {selDoc.rating || "New"} · {selDoc.experience_years} yrs exp
                </div>
              </div>
              <div style={s.feeBadge}>Rs. {selDoc.consultation_fee}</div>
            </div>

            {/* DATE PICKER */}
            <label style={s.label}>
              <FaCalendarAlt size={12} color={MINT_DARK} /> Select Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              max={maxDate}
              style={s.dateInput}
              className="db-date"
            />
            <div style={s.dateHint}>
              📅 Up to 30 days from today — Selected: <strong>{formatDate(selectedDate)}</strong>
            </div>

            {/* TIME SLOTS */}
            <label style={s.label}>
              <FaClock size={12} color={MINT_DARK} /> Choose Time Slot
            </label>

            {slotsLoading ? (
              <div style={s.slotsLoading}>
                <span className="bc-spinner" /> Checking available slots...
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
                        className={`db-slot-btn ${isSelected ? "active" : ""}`}
                        style={{
                          ...s.slotBtn,
                          ...(isSelected ? s.slotActive : {}),
                          ...(isBooked ? s.slotBooked : {}),
                        }}
                      >
                        {isSelected && <FaCheckCircle size={11} color={MINT_DARK} />}
                        <span style={{ textDecoration: isBooked ? "line-through" : "none" }}>{slot}</span>
                        {isBooked && <span style={s.bookedLabel}>Booked</span>}
                      </button>
                    );
                  })}
                </div>

                <div style={s.slotSummary}>
                  <span style={{ color: MINT_DARK, fontWeight: 700 }}>
                    <FaCheckCircle size={10} /> {allSlots.length - bookedSlots.length} available
                  </span>
                  {bookedSlots.length > 0 && (
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>
                      ● {bookedSlots.length} booked
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Form */}
            <label style={s.label}>Baby's Name <span style={{ color: "#dc2626" }}>*</span></label>
            <input value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="e.g. Baby Ahmed" style={s.input} className="db-input" />

            <label style={s.label}>Baby's Age <span style={{ color: "#dc2626" }}>*</span></label>
            <input value={babyAge} onChange={(e) => setBabyAge(e.target.value)} placeholder="e.g. 8 months" style={s.input} className="db-input" />

            <label style={s.label}>Contact Number <span style={{ color: "#dc2626" }}>*</span></label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" style={s.input} className="db-input" />

            <label style={s.label}>Symptom / Reason <span style={{ color: "#dc2626" }}>*</span></label>
            <input value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="e.g. Fever, Cough" style={s.input} className="db-input" />

            <label style={s.label}>Additional Notes <span style={{ color: TEXT_MUTED }}>(Optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other details..." style={s.textarea} className="db-textarea" rows={3} />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <div style={s.feeRow}>
              <span style={{ fontSize: 14, color: TEXT_BODY, fontWeight: 600 }}>Consultation Fee</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: MINT_DARK }}>Rs. {selDoc.consultation_fee}</span>
            </div>

            <button
              style={{ ...s.btnPrimary, width: "100%", opacity: canBook && !bookingLoading ? 1 : 0.5, marginTop: 10 }}
              className="db-btn-primary"
              disabled={!canBook || bookingLoading}
              onClick={handleBook}
            >
              {bookingLoading ? "Booking..." : (
                <>
                  Confirm Appointment
                  <FaCheckCircle size={13} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ═══════════════ DOCTORS LIST ═══════════════ */}
        {step === "list" && (
          <>
            {/* Header */}
            <div style={s.header}>
              <div style={s.badge}>
                <FaStethoscope size={11} color={MINT_DARK} />
                <span>PMDC Verified Specialists</span>
              </div>
              <h1 style={s.pageTitle}>Find a Certified Doctor</h1>
              <p style={s.pageSub}>
                Browse our verified pediatric & homeopathic specialists, or pin doctors on the
                interactive map to find the most convenient location for you.
              </p>
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div style={s.loadingBox}>
                <span className="bc-spinner" style={{ width: 40, height: 40 }} />
                <p>Loading doctors...</p>
              </div>
            ) : error ? (
              <div style={s.errorBox}>⚠️ {error}</div>
            ) : doctors.length === 0 ? (
              <div style={s.emptyState}>
                <FaUserMd size={56} color={BORDER} style={{ marginBottom: 14 }} />
                <p style={{ fontSize: 16, color: TEXT_BODY, fontWeight: 700 }}>No doctors available</p>
                <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 6 }}>New doctors will be added soon!</p>
              </div>
            ) : (
              <>
                {/* Specialty Filter */}
                <div style={s.filterRow}>
                  <FaFilter size={12} color={TEXT_MUTED} />
                  {specialties.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`db-pill ${filter === f ? "active" : ""}`}
                      style={{ ...s.filterPill, ...(filter === f ? s.filterActive : {}) }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Doctors Count + Map Hint */}
                <div style={s.countBar}>
                  <span style={s.countText}>
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? "doctor" : "doctors"} found
                    {doctorsWithLocation.length > 0 && (
                      <span style={{ marginLeft: 8, color: MINT_DARK }}>
                        · {doctorsWithLocation.length} on map
                      </span>
                    )}
                  </span>
                </div>

                {/* ═══════════════ SPLIT LAYOUT: LIST | MAP ═══════════════ */}
                <div className="db-split-layout">

                  {/* ─── LEFT: Doctors List ─── */}
                  <div style={s.docGrid} className="db-doc-grid">
                    {filteredDoctors.map((doc) => {
                      const isHighlighted = highlightedDoctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          id={`doc-card-${doc.id}`}
                          style={s.docCard}
                          className={`db-doc-card ${isHighlighted ? "selected" : ""}`}
                          onMouseEnter={() => handleCardHighlight(doc.id)}
                          onMouseLeave={() => setHighlightedDoctorId(null)}
                        >
                          <div style={s.docCardTop}>
                            <DoctorAvatar
                              photoUrl={doc.profile_photo_url}
                              name={doc.full_name}
                              size={56}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={s.docName}>{doc.full_name}</div>
                              <div style={s.docSpec}>{doc.specialty}</div>
                              <div style={s.docMeta}>
                                <FaStar size={10} color="#f59e0b" />
                                <span style={{ fontWeight: 700, color: TEXT_DARK }}>{doc.rating > 0 ? doc.rating : "New"}</span>
                                {doc.total_reviews > 0 && <span style={{ color: TEXT_MUTED }}>({doc.total_reviews})</span>}
                              </div>
                            </div>
                          </div>

                          {/* Clinic Address */}
                          {doc.clinic_address && (
                            <div style={s.locationRow}>
                              <FaMapMarkerAlt size={11} color={MINT_DARK} />
                              <span style={s.locationText}>
                                {doc.clinic_address}
                                {doc.city && !doc.clinic_address.includes(doc.city) && `, ${doc.city}`}
                              </span>
                            </div>
                          )}

                          {/* Verified + Details */}
                          <div style={s.docDetails}>
                            <div style={s.detailItem}>
                              <FaAward size={11} color={MINT_DARK} />
                              {doc.experience_years} yrs
                            </div>
                            <div style={s.detailItem}>
                              <FaMoneyBillWave size={11} color={MINT_DARK} />
                              Rs. {doc.consultation_fee}
                            </div>
                            <div style={{ ...s.detailItem, color: MINT_DARK, fontWeight: 700 }}>
                              <HiOutlineShieldCheck size={12} color={MINT_DARK} />
                              Verified
                            </div>
                          </div>

                          <button
                            style={s.btnPrimary}
                            className="db-btn-primary"
                            onClick={() => { setSelDoc(doc); setStep("confirm"); setSelSlot(""); setSelectedDate(today); }}
                          >
                            Book Consultation
                            <FaArrowRight size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* ─── RIGHT: Map ─── */}
                  <div className="db-map-column">
                    <div style={s.mapHeader}>
                      <div style={s.mapTitleBox}>
                        <FaMapMarkerAlt size={13} color={MINT_DARK} />
                        <span style={s.mapTitle}>Doctor Locations</span>
                      </div>
                      <div style={s.mapHint}>
                        Click a marker to view details
                      </div>
                    </div>

                    <DoctorsMap
                      doctors={filteredDoctors}
                      selectedDoctorId={highlightedDoctorId}
                      onDoctorClick={handleMarkerClick}
                      height={560}
                    />
                  </div>

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
  root: {
    minHeight: "100vh",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },
  container: { maxWidth: 1280, margin: "0 auto", padding: "44px 24px 72px" },

  // HEADER
  header: { textAlign: "center", marginBottom: 28 },
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
  pageTitle: {
    fontSize: "clamp(24px, 3.5vw, 36px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.8px",
    margin: "0 0 10px",
  },
  pageSub: { fontSize: 15.5, color: TEXT_BODY, lineHeight: 1.6, maxWidth: 640, margin: "0 auto" },

  // Filter
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" },
  filterPill: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    color: TEXT_BODY,
    borderRadius: 10,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },

  countBar: { marginBottom: 16 },
  countText: { fontSize: 13, color: TEXT_MUTED, fontWeight: 600 },

  // Loading / Error / Empty
  loadingBox: {
    textAlign: "center",
    padding: "80px 20px",
    color: TEXT_MUTED,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    background: "#fff",
    borderRadius: 14,
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
  },
  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    border: "1px solid #fecaca",
    marginBottom: 16,
  },

  // Map header
  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  mapTitleBox: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.2px",
  },
  mapHint: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },

  // Doctor cards (compact for side-by-side)
  docGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },
  docCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  docCardTop: { display: "flex", gap: 12, alignItems: "center" },
  docName: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 3,
    letterSpacing: "-0.2px",
  },
  docSpec: { fontSize: 12.5, color: MINT_DARK, fontWeight: 700, marginBottom: 4 },
  docMeta: {
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  locationText: { fontSize: 12.5, color: TEXT_BODY, fontWeight: 600, lineHeight: 1.4 },
  docDetails: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    paddingTop: 10,
    borderTop: `1px solid ${BORDER}`,
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 600,
  },

  // Buttons
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },
  btnOutline: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 10,
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Confirm Screen
  confirmWrap: { maxWidth: 580, margin: "0 auto" },
  backBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 22,
  },
  docSummary: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
    boxShadow: "0 2px 12px rgba(15,32,24,0.04)",
  },
  feeBadge: {
    marginLeft: "auto",
    background: MINT_LIGHT,
    color: MINT_DARK,
    fontWeight: 800,
    fontSize: 14,
    borderRadius: 8,
    padding: "7px 14px",
  },
  label: {
    fontSize: 13,
    fontWeight: 800,
    color: TEXT_BODY,
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: "18px 0 9px",
  },
  dateInput: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14.5,
    fontFamily: "inherit",
    color: TEXT_DARK,
    background: "#fafffe",
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  dateHint: {
    fontSize: 12,
    color: TEXT_BODY,
    marginTop: 6,
    padding: "6px 10px",
    background: MINT_LIGHT,
    borderRadius: 7,
    fontWeight: 600,
  },

  slotsLoading: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    background: MINT_LIGHT,
    borderRadius: 9,
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: 700,
  },
  slotsGrid: { display: "flex", gap: 9, flexWrap: "wrap" },
  slotBtn: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 9,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    color: TEXT_BODY,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  slotActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },
  slotBooked: {
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    color: "#991b1b",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  bookedLabel: {
    fontSize: 10,
    background: "#dc2626",
    color: "#fff",
    padding: "1px 6px",
    borderRadius: 4,
    marginLeft: 4,
    fontWeight: 800,
  },
  slotSummary: {
    display: "flex",
    gap: 14,
    marginTop: 10,
    fontSize: 12,
    padding: "8px 12px",
    background: "#fafffe",
    borderRadius: 7,
  },

  input: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT_DARK,
    background: "#fafffe",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT_DARK,
    background: "#fafffe",
    resize: "vertical",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },
  feeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: MINT_LIGHT,
    borderRadius: 10,
    padding: "14px 18px",
    margin: "20px 0 6px",
  },

  // Success
  successWrap: {
    maxWidth: 520,
    margin: "60px auto",
    textAlign: "center",
  },
  successIconBox: {
    width: 88,
    height: 88,
    background: MINT_LIGHT,
    borderRadius: "50%",
    margin: "0 auto 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  successSub: { fontSize: 14.5, color: TEXT_BODY, marginBottom: 28, lineHeight: 1.6 },
  successCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "20px 24px",
    textAlign: "left",
    boxShadow: "0 8px 28px rgba(15,32,24,0.05)",
  },
  sRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${BORDER}`,
  },
  sKey: { fontSize: 12.5, color: TEXT_MUTED, fontWeight: 700 },
  sVal: { fontSize: 13.5, color: TEXT_DARK, fontWeight: 800 },
};
