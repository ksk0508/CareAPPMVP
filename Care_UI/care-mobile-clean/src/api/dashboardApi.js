import client from "./client";

export const getDashboard = (practitionerId) =>
  client.get(`/dashboard/${practitionerId}`);

export const getPatientAdherence = (patientId) =>
  client.get(`/dashboard/${patientId}/adherence`);

export const getHighRiskPatients = (practitionerId) =>
  client.get(`/dashboard/${practitionerId}/high-risk`);

export const getMetrics = (practitionerId) =>
  client.get(`/dashboard/${practitionerId}/metrics`);

export const getPatientDetail = (patientId) =>
  client.get(`/dashboard/${patientId}/details`);
