// ═══════════════════════════════════════════════════════════
// Complaints API Calls
// ═══════════════════════════════════════════════════════════

import api from "./axios";

// ─── PUBLIC: Get categories and priorities (for dropdowns) ───
export const getComplaintCategories = async () => {
  const response = await api.get("/complaints/categories/");
  return response.data;
};

// ─── USER/DOCTOR: Submit complaint (with optional file) ───
export const submitComplaint = async (formData) => {
  // formData can be FormData object (for files) or plain object
  const isFormData = formData instanceof FormData;
  const config = isFormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  const response = await api.post("/complaints/submit/", formData, config);
  return response.data;
};

// ─── USER/DOCTOR: My complaints ───
export const getMyComplaints = async () => {
  const response = await api.get("/complaints/my/");
  return response.data;
};

// ─── USER/DOCTOR: My complaint detail (with admin response) ───
export const getMyComplaintDetail = async (id) => {
  const response = await api.get(`/complaints/my/${id}/`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════
// ADMIN APIs
// ═══════════════════════════════════════════════════════════

// ─── List all complaints (with filters) ───
export const adminGetComplaints = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.category) params.append("category", filters.category);

  const query = params.toString();
  const url = query ? `/complaints/admin/?${query}` : "/complaints/admin/";
  const response = await api.get(url);
  return response.data;
};

// ─── Complaint detail ───
export const adminGetComplaintDetail = async (id) => {
  const response = await api.get(`/complaints/admin/${id}/`);
  return response.data;
};

// ─── Respond / update status ───
export const adminRespondComplaint = async (id, response, newStatus = null) => {
  const body = { admin_response: response };
  if (newStatus) body.status = newStatus;
  const res = await api.post(`/complaints/admin/${id}/respond/`, body);
  return res.data;
};

// ─── Stats ───
export const adminGetComplaintStats = async () => {
  const response = await api.get("/complaints/admin/stats/");
  return response.data;
};
