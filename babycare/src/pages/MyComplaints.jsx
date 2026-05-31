import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyComplaints, getMyComplaintDetail } from "../api/complaints";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";

const STATUS_COLORS = {
  open:        { bg: "#fee2e2", color: "#991b1b" },
  in_progress: { bg: "#fff8e6", color: "#7a5a10" },
  resolved:    { bg: "#e8f8ef", color: "#1a6e3f" },
  closed:      { bg: "#f3f4f6", color: "#374151" },
};

const PRIORITY_COLORS = {
  low:    { bg: "#f0f9ff", color: "#075985" },
  medium: { bg: "#fff8e6", color: "#7a5a10" },
  high:   { bg: "#ffedd5", color: "#9a3412" },
  urgent: { bg: "#fee2e2", color: "#991b1b" },
};

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadComplaints();
  }, []);

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

  return (
    <div style={s.root}>
      <div className="bc-orb" style={{ width: 360, height: 360, background: "#a7f3c4", top: "-120px", right: "-80px" }} />

      <div style={s.container}>
        {/* HEADER */}
        <div style={s.header} className="bc-anim-fadeUp">
          <div>
            <span style={s.badge}>📋 Complaints</span>
            <h1 style={s.pageTitle}>My Complaints</h1>
            <p style={s.pageSub}>Apni submitted complaints aur unke responses dekhe</p>
          </div>
          <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/file-complaint")}>
            + File New Complaint
          </button>
        </div>

        {/* FILTER */}
        <div style={s.filterRow} className="bc-anim-fadeUp bc-d1">
          {["all", "open", "in_progress", "resolved", "closed"].map((f) => {
            const count = f === "all" ? complaints.length : complaints.filter((c) => c.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{ ...s.filterPill, ...(statusFilter === f ? s.filterActive : {}) }}
              >
                {f === "all" ? "All" : f.replace("_", " ").charAt(0).toUpperCase() + f.replace("_", " ").slice(1)}
                {count > 0 && <span style={s.filterCount}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* LIST */}
        {loading ? (
          <div style={s.loadingBox}>
            <span className="bc-spinner" />
            <p>Loading complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState} className="bc-anim-fadeUp bc-d2">
            <div style={{ fontSize: 56, marginBottom: 12 }} className="bc-float">📭</div>
            <p style={{ fontSize: 15, color: "#5a7a6a", fontWeight: 700, marginBottom: 6 }}>
              {statusFilter === "all" ? "Aap ne abhi tak koi complaint file nahi ki" : `No ${statusFilter} complaints`}
            </p>
            <p style={{ fontSize: 13, color: "#9ab5a5", marginBottom: 20 }}>
              Koi issue hai? Hamein bataein!
            </p>
            <button style={s.btnPrimary} className="bc-btn-glow" onClick={() => navigate("/file-complaint")}>
              File a Complaint →
            </button>
          </div>
        ) : (
          <div style={s.cardsGrid}>
            {filtered.map((c, i) => (
              <div key={c.id} style={s.complaintCard} className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min(i + 1, 8)}`}>
                <div style={s.cardTop}>
                  <div style={s.complaintId}>#{c.id}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ ...s.statusBadge, ...PRIORITY_COLORS[c.priority] }}>{c.priority_display}</span>
                    <span style={{ ...s.statusBadge, ...STATUS_COLORS[c.status] }}>{c.status_display}</span>
                  </div>
                </div>
                <h3 style={s.cardTitle}>{c.subject}</h3>
                <div style={s.cardMeta}>
                  <span>🏷️ {c.category_display}</span>
                  {c.against_doctor_name && <span>👨‍⚕️ Dr. {c.against_doctor_name}</span>}
                </div>
                <div style={s.cardFooter}>
                  <span style={s.cardDate}>📅 {new Date(c.created_at).toLocaleDateString()}</span>
                  <button style={s.viewBtn} onClick={() => viewDetail(c.id)}>View Details →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedComplaint(null); }}>
          <div style={s.modal} className="bc-anim-scaleIn">
            <div style={s.modalHeader}>
              <div>
                <div style={{ fontSize: 12, color: "#9ab5a5", fontWeight: 700 }}>Complaint #{selectedComplaint.id}</div>
                <h2 style={s.modalTitle}>{selectedComplaint.subject}</h2>
              </div>
              <button style={s.closeBtn} onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>

            <div style={s.modalBody}>
              {/* Metadata */}
              <div style={s.metaGrid}>
                <DetailItem label="Category"  value={selectedComplaint.category_display} />
                <DetailItem label="Priority"  value={selectedComplaint.priority_display} badge={PRIORITY_COLORS[selectedComplaint.priority]} />
                <DetailItem label="Status"    value={selectedComplaint.status_display} badge={STATUS_COLORS[selectedComplaint.status]} />
                <DetailItem label="Submitted" value={new Date(selectedComplaint.created_at).toLocaleString()} />
                {selectedComplaint.against_doctor_name && (
                  <DetailItem label="Against Doctor" value={`Dr. ${selectedComplaint.against_doctor_name}`} />
                )}
                {selectedComplaint.resolved_at && (
                  <DetailItem label="Resolved" value={new Date(selectedComplaint.resolved_at).toLocaleString()} />
                )}
              </div>

              {/* Description */}
              <h3 style={s.modalSection}>📝 Description</h3>
              <div style={s.descBox}>{selectedComplaint.description}</div>

              {/* Attachment */}
              {selectedComplaint.attachment_url && (
                <>
                  <h3 style={s.modalSection}>📎 Attachment</h3>
                  <a href={selectedComplaint.attachment_url} target="_blank" rel="noreferrer" style={s.attachmentLink}>
                    🔗 View Attachment
                  </a>
                </>
              )}

              {/* Admin Response */}
              {selectedComplaint.admin_response ? (
                <>
                  <h3 style={s.modalSection}>💬 Admin Response</h3>
                  <div style={s.responseBox}>
                    <div style={s.responseHeader}>
                      <span style={{ fontSize: 18 }}>👑</span>
                      <div>
                        <strong style={{ color: MINT_DARK }}>Admin Team</strong>
                        {selectedComplaint.resolved_by_name && (
                          <div style={{ fontSize: 11.5, color: "#5a7a6a" }}>by {selectedComplaint.resolved_by_name}</div>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: 14, color: "#0f2018", lineHeight: 1.6 }}>
                      {selectedComplaint.admin_response}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={s.modalSection}>💬 Admin Response</h3>
                  <div style={s.pendingBox}>
                    <span style={{ fontSize: 24 }}>⏳</span>
                    <div>
                      <strong>Pending review</strong>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7a5a10" }}>
                        Admin team aap ki complaint review kar rahi hai. Response 24-48 hours mein milega.
                      </p>
                    </div>
                  </div>
                </>
              )}
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
        <span style={{ ...s.statusBadge, ...badge }}>{value}</span>
      ) : (
        <div style={s.detailValue}>{value || "—"}</div>
      )}
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, #fafffe 0%, #f0faf4 100%)", fontFamily: "'Nunito','Segoe UI',sans-serif", position: "relative", overflow: "hidden" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 72px", position: "relative", zIndex: 2 },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 20, flexWrap: "wrap" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,248,239,0.85)", color: "#1a6e3f", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 800, marginBottom: 10, border: "1px solid rgba(42,157,92,0.18)" },
  pageTitle: { fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, color: "#0f2018", letterSpacing: "-0.5px", margin: "0 0 6px" },
  pageSub: { fontSize: 14, color: "#5a7a6a", margin: 0 },

  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 },
  filterPill: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 20, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", display: "flex", alignItems: "center", gap: 6 },
  filterActive: { background: MINT_LIGHT, border: `2px solid ${MINT}`, color: MINT_DARK },
  filterCount: { background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 900 },

  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  complaintCard: { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(224,237,230,0.7)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 4px 14px rgba(42,157,92,0.07)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  complaintId: { background: "#f0faf4", color: MINT_DARK, borderRadius: 6, padding: "3px 9px", fontSize: 11.5, fontWeight: 800 },
  cardTitle: { fontSize: 15.5, fontWeight: 900, color: "#0f2018", margin: 0, lineHeight: 1.4 },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#5a7a6a", fontWeight: 700, paddingBottom: 10, borderBottom: "1px solid rgba(212,237,223,0.5)" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardDate: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600 },
  viewBtn: { background: MINT_LIGHT, color: MINT_DARK, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" },

  loadingBox: { textAlign: "center", padding: "60px 20px", color: "#5a7a6a", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.6)", borderRadius: 16 },

  btnPrimary: { background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.32)" },

  statusBadge: { borderRadius: 6, padding: "3px 10px", fontSize: 11.5, fontWeight: 800, textTransform: "capitalize", display: "inline-block" },

  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 32, 24, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#fff", borderRadius: 20, maxWidth: 700, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" },
  modalHeader: { padding: "18px 24px", borderBottom: "1px solid #f0f5f2", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontSize: 18, fontWeight: 900, color: "#0f2018", margin: "4px 0 0" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#5a7a6a", padding: "4px 10px", borderRadius: 6 },
  modalBody: { padding: "20px 24px", overflowY: "auto", flex: 1 },
  modalSection: { fontSize: 15, fontWeight: 900, color: "#0f2018", margin: "20px 0 12px" },

  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 },
  detailItem: { background: "#f4f9f6", borderRadius: 9, padding: "10px 12px" },
  detailKey: { fontSize: 11, color: "#9ab5a5", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 13.5, color: "#0f2018", fontWeight: 700 },

  descBox: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#1f2937", lineHeight: 1.7, whiteSpace: "pre-wrap" },
  attachmentLink: { display: "inline-block", background: MINT_LIGHT, color: MINT_DARK, padding: "10px 16px", borderRadius: 9, fontSize: 13, fontWeight: 800, textDecoration: "none" },

  responseBox: { background: "rgba(232,248,239,0.7)", border: `1.5px solid ${MINT}`, borderRadius: 12, padding: "16px 18px" },
  responseHeader: { display: "flex", alignItems: "center", gap: 12 },
  pendingBox: { background: "rgba(255,248,230,0.8)", border: "1.5px solid #fde68a", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, color: "#7a5a10" },
};
