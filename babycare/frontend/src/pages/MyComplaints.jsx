import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaTimes, FaCalendarAlt, FaTag, FaUserMd, FaArrowRight,
  FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaSearch,
  FaPaperclip, FaCommentDots, FaShieldAlt, FaListAlt, FaHourglassHalf,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { getMyComplaints, getMyComplaintDetail } from "../api/complaints";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const STATUS_COLORS = {
  open:        { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  in_progress: { bg: "#fff8e6", color: "#7a5a10", border: "#fde68a" },
  resolved:    { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  closed:      { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
};

const PRIORITY_COLORS = {
  low:    { bg: "#f0f9ff", color: "#075985" },
  medium: { bg: "#fff8e6", color: "#7a5a10" },
  high:   { bg: "#ffedd5", color: "#9a3412" },
  urgent: { bg: "#fee2e2", color: "#991b1b" },
};

const hoverStyles = `
  .mc-btn-primary { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .mc-btn-primary:hover {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }

  .mc-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .mc-card:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 28px rgba(42,157,92,0.12);
  }

  .mc-view-btn { transition: all 0.2s ease; }
  .mc-view-btn:hover {
    background: #2a9d5c !important;
    color: #fff !important;
    transform: translateX(2px);
  }

  .mc-filter { transition: all 0.2s ease; }
  .mc-filter:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
  }

  .mc-close { transition: all 0.2s ease; }
  .mc-close:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
  }

  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .mc-modal { animation: modal-in 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
`;

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (id) => {
    try {
      const detail = await getMyComplaintDetail(id);
      setSelectedComplaint(detail);
    } catch (err) {
      console.error("Detail load error:", err);
    }
  };

  const filtered = statusFilter === "all"
    ? complaints
    : complaints.filter((c) => c.status === statusFilter);

  const counts = {
    all: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    closed: complaints.filter((c) => c.status === "closed").length,
  };

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header}>
          <div>
            <div style={s.badge}>
              <FaListAlt size={11} color={MINT_DARK} />
              <span>Complaint Management</span>
            </div>
            <h1 style={s.pageTitle}>My Complaints</h1>
            <p style={s.pageSub}>Apni submitted complaints aur unke responses dekhe</p>
          </div>

          <button style={s.btnPrimary} className="mc-btn-primary" onClick={() => navigate("/file-complaint")}>
            <FaPlus size={11} />
            File New Complaint
          </button>
        </div>

        {/* STATS */}
        {!loading && complaints.length > 0 && (
          <div style={s.statsRow}>
            {[
              { label: "Total", value: counts.all, color: TEXT_DARK, bg: "#fff" },
              { label: "Open", value: counts.open, color: "#991b1b", bg: "#fee2e2" },
              { label: "In Progress", value: counts.in_progress, color: "#7a5a10", bg: "#fff8e6" },
              { label: "Resolved", value: counts.resolved, color: "#166534", bg: "#dcfce7" },
            ].map((stat) => (
              <div key={stat.label} style={{ ...s.statCard, background: stat.bg }}>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* FILTER */}
        <div style={s.filterRow}>
          {[
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "in_progress", label: "In Progress" },
            { key: "resolved", label: "Resolved" },
            { key: "closed", label: "Closed" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`mc-filter ${statusFilter === f.key ? "active" : ""}`}
              style={{ ...s.filterPill, ...(statusFilter === f.key ? s.filterActive : {}) }}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span style={{ ...s.filterCount, ...(statusFilter === f.key ? s.filterCountActive : {}) }}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <div style={s.loadingBox}>
            <FaHourglassHalf size={28} color={MINT_DARK} />
            <p>Loading complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIconBox}>
              <FaCommentDots size={40} color={MINT_DARK} />
            </div>
            <h3 style={s.emptyTitle}>
              {statusFilter === "all" ? "No complaints filed yet" : `No ${statusFilter.replace("_", " ")} complaints`}
            </h3>
            <p style={s.emptyDesc}>
              {statusFilter === "all"
                ? "You haven't filed any complaints yet. Have an issue? Let us know."
                : "Try selecting a different filter to see other complaints."}
            </p>
            {statusFilter === "all" && (
              <button style={s.btnPrimary} className="mc-btn-primary" onClick={() => navigate("/file-complaint")}>
                <FaPlus size={11} />
                File a Complaint
              </button>
            )}
          </div>
        ) : (
          <div style={s.cardsGrid}>
            {filtered.map((c) => (
              <div key={c.id} style={s.complaintCard} className="mc-card">
                <div style={s.cardTop}>
                  <div style={s.complaintId}>#{c.id}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ ...s.badge2, ...PRIORITY_COLORS[c.priority] }}>{c.priority_display}</span>
                    <span style={{
                      ...s.badge2,
                      ...STATUS_COLORS[c.status],
                      border: `1px solid ${STATUS_COLORS[c.status]?.border}`,
                    }}>
                      {c.status_display}
                    </span>
                  </div>
                </div>

                <h3 style={s.cardTitle}>{c.subject}</h3>

                <div style={s.cardMeta}>
                  <div style={s.metaItem}>
                    <FaTag size={10} color={TEXT_MUTED} />
                    <span>{c.category_display}</span>
                  </div>
                  {c.against_doctor_name && (
                    <div style={s.metaItem}>
                      <FaUserMd size={10} color={TEXT_MUTED} />
                      <span>Dr. {c.against_doctor_name}</span>
                    </div>
                  )}
                </div>

                <div style={s.cardFooter}>
                  <div style={s.cardDate}>
                    <FaCalendarAlt size={10} color={TEXT_MUTED} />
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <button style={s.viewBtn} className="mc-view-btn" onClick={() => viewDetail(c.id)}>
                    View Details
                    <FaArrowRight size={9} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedComplaint(null); }}>
          <div style={s.modal} className="mc-modal">
            <div style={s.modalHeader}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.modalIdBadge}>Complaint #{selectedComplaint.id}</div>
                <h2 style={s.modalTitle}>{selectedComplaint.subject}</h2>
              </div>
              <button style={s.closeBtn} className="mc-close" onClick={() => setSelectedComplaint(null)}>
                <FaTimes size={14} />
              </button>
            </div>

            <div style={s.modalBody}>
              {/* Metadata Grid */}
              <div style={s.metaGrid}>
                <DetailItem label="Category" value={selectedComplaint.category_display} />
                <DetailItem
                  label="Priority"
                  value={selectedComplaint.priority_display}
                  badge={PRIORITY_COLORS[selectedComplaint.priority]}
                />
                <DetailItem
                  label="Status"
                  value={selectedComplaint.status_display}
                  badge={STATUS_COLORS[selectedComplaint.status]}
                />
                <DetailItem label="Submitted" value={new Date(selectedComplaint.created_at).toLocaleString()} />
                {selectedComplaint.against_doctor_name && (
                  <DetailItem label="Against Doctor" value={`Dr. ${selectedComplaint.against_doctor_name}`} />
                )}
                {selectedComplaint.resolved_at && (
                  <DetailItem label="Resolved" value={new Date(selectedComplaint.resolved_at).toLocaleString()} />
                )}
              </div>

              {/* Description */}
              <h3 style={s.modalSection}>
                <FaListAlt size={11} color={MINT_DARK} />
                Description
              </h3>
              <div style={s.descBox}>{selectedComplaint.description}</div>

              {/* Attachment */}
              {selectedComplaint.attachment_url && (
                <>
                  <h3 style={s.modalSection}>
                    <FaPaperclip size={11} color={MINT_DARK} />
                    Attachment
                  </h3>
                  <a href={selectedComplaint.attachment_url} target="_blank" rel="noreferrer" style={s.attachmentLink}>
                    <FaPaperclip size={11} />
                    View Attachment
                    <FaArrowRight size={9} />
                  </a>
                </>
              )}

              {/* Admin Response */}
              {selectedComplaint.admin_response ? (
                <>
                  <h3 style={s.modalSection}>
                    <FaCommentDots size={11} color={MINT_DARK} />
                    Admin Response
                  </h3>
                  <div style={s.responseBox}>
                    <div style={s.responseHeader}>
                      <div style={s.responseAvatar}>
                        <HiOutlineShieldCheck size={16} color="#fff" />
                      </div>
                      <div>
                        <strong style={{ color: MINT_DARK, fontSize: 13.5 }}>Admin Team</strong>
                        {selectedComplaint.resolved_by_name && (
                          <div style={{ fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600 }}>
                            by {selectedComplaint.resolved_by_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <p style={s.responseText}>{selectedComplaint.admin_response}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={s.modalSection}>
                    <FaCommentDots size={11} color={MINT_DARK} />
                    Admin Response
                  </h3>
                  <div style={s.pendingBox}>
                    <FaHourglassHalf size={20} color="#7a5a10" />
                    <div>
                      <strong style={{ color: "#7a5a10", fontSize: 13.5 }}>Pending Review</strong>
                      <p style={s.pendingText}>
                        Admin team aap ki complaint review kar rahi hai.
                        Response 24-48 hours mein milega.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={s.modalFooter}>
              <FaShieldAlt size={11} color={TEXT_MUTED} />
              <span>SSL Encrypted · Confidential</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, badge }) {
  return (
    <div style={s.detailItem}>
      <div style={s.detailKey}>{label}</div>
      {badge ? (
        <span style={{ ...s.badge2, ...badge, display: "inline-block" }}>{value}</span>
      ) : (
        <div style={s.detailValue}>{value || "—"}</div>
      )}
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
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" },

  // HEADER
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 20,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    padding: "5px 12px",
    borderRadius: 30,
    fontSize: 11.5,
    fontWeight: 700,
    marginBottom: 10,
    boxShadow: "0 2px 8px rgba(42,157,92,0.08)",
  },
  pageTitle: {
    fontSize: "clamp(22px, 3vw, 30px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.6px",
    margin: "0 0 6px",
  },
  pageSub: { fontSize: 14.5, color: TEXT_BODY, margin: 0 },

  // STATS
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "14px 16px",
  },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.3px",
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 700,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // FILTER
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 },
  filterPill: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    color: TEXT_BODY,
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  filterActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },
  filterCount: {
    background: "#f4f9f6",
    color: TEXT_BODY,
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 800,
  },
  filterCountActive: {
    background: MINT_DARK,
    color: "#fff",
  },

  // CARDS
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
  },
  complaintCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  complaintId: {
    background: "#fafffe",
    color: MINT_DARK,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 11.5,
    fontWeight: 800,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    lineHeight: 1.4,
    letterSpacing: "-0.2px",
  },
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 12,
    borderBottom: `1px solid ${BORDER}`,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: 600,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
  viewBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 8,
    padding: "7px 12px",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  // BADGES
  badge2: {
    borderRadius: 5,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  // LOADING
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
    border: `1px solid ${BORDER}`,
  },

  // EMPTY
  emptyState: {
    textAlign: "center",
    padding: "60px 32px",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
  },
  emptyIconBox: {
    width: 80, height: 80,
    background: MINT_LIGHT, borderRadius: "50%",
    margin: "0 auto 18px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  emptyDesc: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 1.6,
    marginBottom: 22,
    maxWidth: 360,
    margin: "0 auto 22px",
  },

  // BUTTONS
  btnPrimary: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 12px rgba(26,110,63,0.25)",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,32,24,0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    maxWidth: 680,
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
    border: `1px solid ${BORDER}`,
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: `1px solid ${BORDER}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  modalIdBadge: {
    display: "inline-block",
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.3px",
    lineHeight: 1.3,
  },
  closeBtn: {
    width: 34, height: 34,
    background: "#f4f9f6",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    color: TEXT_MUTED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalBody: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  },
  modalSection: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_DARK,
    display: "flex",
    alignItems: "center",
    gap: 7,
    margin: "20px 0 12px",
  },
  modalFooter: {
    padding: "12px 24px",
    borderTop: `1px solid ${BORDER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontSize: 11.5,
    color: TEXT_MUTED,
    fontWeight: 600,
    background: "#fafffe",
    borderRadius: "0 0 16px 16px",
  },

  // DETAILS
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
  },
  detailItem: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 9,
    padding: "10px 12px",
  },
  detailKey: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: 700,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: 700,
  },

  descBox: {
    background: "#fafffe",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 14,
    color: TEXT_BODY,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  attachmentLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: MINT_LIGHT,
    color: MINT_DARK,
    padding: "10px 16px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "none",
    border: `1.5px solid ${MINT}`,
  },

  responseBox: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT}`,
    borderLeft: `3px solid ${MINT_DARK}`,
    borderRadius: 11,
    padding: "16px 18px",
  },
  responseHeader: { display: "flex", alignItems: "center", gap: 12 },
  responseAvatar: {
    width: 36, height: 36,
    background: MINT_DARK, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  responseText: {
    margin: "12px 0 0",
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 1.7,
  },

  pendingBox: {
    background: "#fff8e6",
    border: "1.5px solid #fde68a",
    borderLeft: "3px solid #ca8a04",
    borderRadius: 11,
    padding: "14px 18px",
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  pendingText: {
    margin: "5px 0 0",
    fontSize: 13,
    color: "#7a5a10",
    lineHeight: 1.6,
  },
};