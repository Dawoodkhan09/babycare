// ═══════════════════════════════════════════════════════════
// Doctor & Admin API Calls
// ═══════════════════════════════════════════════════════════

import api from "./axios";

// ─── PUBLIC: Submit Doctor Application ───
export const submitDoctorApplication = async (formData) => {
  const response = await api.post("/doctors/apply/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ─── PUBLIC: Check Application Status by Email ───
export const checkApplicationStatus = async (email) => {
  const response = await api.get(`/doctors/check-status/?email=${encodeURIComponent(email)}`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════
// ADMIN APIs
// ═══════════════════════════════════════════════════════════

export const adminGetApplications = async (statusFilter = null) => {
  const url = statusFilter
    ? `/doctors/admin/applications/?status=${statusFilter}`
    : "/doctors/admin/applications/";
  const response = await api.get(url);
  return response.data;
};

export const adminGetApplicationDetail = async (id) => {
  const response = await api.get(`/doctors/admin/applications/${id}/`);
  return response.data;
};

export const adminApproveApplication = async (id) => {
  const response = await api.post(`/doctors/admin/applications/${id}/approve/`);
  return response.data;
};

export const adminRejectApplication = async (id, reason) => {
  const response = await api.post(`/doctors/admin/applications/${id}/reject/`, {
    rejection_reason: reason,
  });
  return response.data;
};

export const adminGetDoctors = async () => {
  const response = await api.get("/doctors/admin/doctors/");
  return response.data;
};

export const adminGetStats = async () => {
  const response = await api.get("/doctors/admin/stats/");
  return response.data;
};

// ─── NEW: Toggle doctor active/suspend ───
export const adminToggleDoctorActive = async (doctorId) => {
  const response = await api.post(`/doctors/admin/doctors/${doctorId}/toggle-active/`);
  return response.data;
};

// ─── NEW: Delete doctor permanently ───
export const adminDeleteDoctor = async (doctorId) => {
  const response = await api.delete(`/doctors/admin/doctors/${doctorId}/delete/`);
  return response.data;
};


// ─── DOCTOR: Get my own profile (with photo) ───
export const getMyDoctorProfile = async () => {
  const response = await api.get("/doctors/my-profile/");
  return response.data;
};