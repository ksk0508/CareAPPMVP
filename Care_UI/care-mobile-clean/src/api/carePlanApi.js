import client from "./client";

export const createCarePlan = (dto) =>
  client.post("/careplans", dto);

export const getCarePlan = (id) =>
  client.get(`/careplans/${id}`);

export const getDoctorPlans = (doctorId) =>
  client.get(`/careplans/doctor/${doctorId}`);

export const getPatientPlans = (patientId) =>
  client.get(`/careplans/patient/${patientId}`);

export const updateCarePlan = (id, dto) =>
  client.put(`/careplans/${id}`, dto);

export const deleteCarePlan = (id) =>
  client.delete(`/careplans/${id}`);

export const assignTasksToCarePlan = (carePlanId, taskIds) =>
  client.post(`/careplans/${carePlanId}/assign-tasks`, taskIds);
