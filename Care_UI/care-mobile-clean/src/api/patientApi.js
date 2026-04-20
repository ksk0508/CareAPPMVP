import client from "./client";

export const createPatient = (dto) => client.post("/patients", dto);

export const getDoctorPatients = (doctorId) =>
  client.get(`/patients/doctor/${doctorId}`);

export const getPatientById = (patientId) =>
  client.get(`/patients/${patientId}`);
