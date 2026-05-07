import axiosInstance from "./axiosInstance";

// ── Mother: Create appointment ────────────────────────────────────────────────
export const createAppointment = ({ pregnancyId, preferredDateTime }) =>
  axiosInstance.post("/appointments", { pregnancyId, preferredDateTime });

// ── Both: List all appointments for the authenticated user ────────────────────
export const listAppointments = () => axiosInstance.get("/appointments");

// ── Both: Get single appointment by ID ───────────────────────────────────────
export const getAppointment = (id) => axiosInstance.get(`/appointments/${id}`);

// ── Both: Get appointments by pregnancy ──────────────────────────────────────
export const getAppointmentsByPregnancy = (pregnancyId) =>
  axiosInstance.get(`/appointments/pregnancy/${pregnancyId}`);

// ── Midwife: Approve or reject a request ─────────────────────────────────────
export const respondToAppointment = (id, { status, confirmedDateTime, rejectionReason }) =>
  axiosInstance.patch(`/appointments/${id}/respond`, {
    status,
    confirmedDateTime,
    rejectionReason,
  });

// ── Mother: Confirm or request reschedule ────────────────────────────────────
export const motherResponse = (id, { status, preferredDateTime, rescheduleReason }) =>
  axiosInstance.patch(`/appointments/${id}/mother-response`, {
    status,
    preferredDateTime,
    rescheduleReason,
  });

// ── Midwife: Fill visit info after appointment ───────────────────────────────
export const fillAppointmentInfo = (
  id,
  { pulseRate, temperature, bloodPressure, specialMedicalConditions, appointmentNotes }
) =>
  axiosInstance.patch(`/appointments/${id}/fill-info`, {
    pulseRate,
    temperature,
    bloodPressure,
    specialMedicalConditions,
    appointmentNotes,
  });

// ── Both: Cancel appointment ─────────────────────────────────────────────────
export const cancelAppointment = (id, cancelReason) =>
  axiosInstance.patch(`/appointments/${id}/cancel`, { cancelReason });

// ── Mother: Delete an appointment ────────────────────────────────────────────
export const deleteAppointment = (id) => axiosInstance.delete(`/appointments/${id}`);

// ── Midwife: Upcoming appointments ───────────────────────────────────────────
export const getUpcomingAppointments = () =>
  axiosInstance.get("/appointments/upcoming/mine");

// ── Midwife: Completed appointments ──────────────────────────────────────────
export const getCompletedAppointments = () =>
  axiosInstance.get("/appointments/completed/mine");

// ── Both: Gemini AI quick-check for a completed appointment ──────────────────
export const getAiCheck = (id) => axiosInstance.post(`/appointments/${id}/ai-check`);
