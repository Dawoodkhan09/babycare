// ═══════════════════════════════════════════════════════════
// Appointments API Calls
// ═══════════════════════════════════════════════════════════

import api from "./axios";

// ─── PUBLIC: Get all approved doctors (booking page) ───
export const getPublicDoctors = async () => {
  const response = await api.get("/appointments/doctors/");
  return response.data;
};

// ─── USER: Book an appointment ───
export const bookAppointment = async (appointmentData) => {
  // appointmentData = { doctor, baby_name, baby_age, symptom, notes, appointment_date, time_slot, contact_phone }
  const response = await api.post("/appointments/book/", appointmentData);
  return response.data;
};

// ─── USER: My appointments (as patient) ───
export const getMyAppointments = async () => {
  const response = await api.get("/appointments/my/");
  return response.data;
};

// ─── DOCTOR: My appointments (as doctor) ───
export const getDoctorAppointments = async () => {
  const response = await api.get("/appointments/doctor/");
  return response.data;
};

// ─── Update appointment status (accept/reject/complete/cancel) ───
export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/status/`, { status });
  return response.data;
};


// ─── Get available time slots for doctor + date ───
export const getAvailableSlots = async (doctorId, date) => {
  const response = await api.get(
    `/appointments/available-slots/?doctor=${doctorId}&date=${date}`
  );
  return response.data;
};