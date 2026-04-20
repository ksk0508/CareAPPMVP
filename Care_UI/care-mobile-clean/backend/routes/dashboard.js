const express = require("express");
const { readDB } = require("../utils/db");

const router = express.Router();

const calculateAdherence = (executions) => {
  if (!executions.length) {
    return 0;
  }
  const completed = executions.filter((entry) => entry.status === "Completed");
  return Math.round((completed.length / executions.length) * 100);
};

router.get("/:practitionerId/metrics", async (req, res) => {
  const { practitionerId } = req.params;
  const db = await readDB();

  const patientIds = Array.from(
    new Set(
      db.careplans
        .filter((plan) => plan.practitionerId === practitionerId)
        .map((plan) => plan.patientId)
    )
  );

  const activePlans = db.careplans.filter((plan) => plan.practitionerId === practitionerId);

  const executions = db.taskExecutions.filter((entry) =>
    patientIds.includes(entry.patientId)
  );

  const averageAdherence = calculateAdherence(executions);

  return res.json({
    totalPatients: patientIds.length,
    activePlans: activePlans.length,
    averageAdherence,
    completedTasks: executions.filter((entry) => entry.status === "Completed").length,
  });
});

router.get("/:practitionerId/high-risk", async (req, res) => {
  const { practitionerId } = req.params;
  const db = await readDB();

  const patientIds = Array.from(
    new Set(
      db.careplans
        .filter((plan) => plan.practitionerId === practitionerId)
        .map((plan) => plan.patientId)
    )
  );

  const patients = patientIds.map((patientId) => {
    const patient = db.patients.find((item) => item.id === patientId);
    const executions = db.taskExecutions.filter((entry) => entry.patientId === patientId);
    return {
      patientId,
      name: patient?.name || "Unknown",
      adherence: calculateAdherence(executions),
    };
  });

  return res.json(patients.filter((patient) => patient.adherence < 60));
});

router.get("/:patientId/adherence", async (req, res) => {
  const { patientId } = req.params;
  const db = await readDB();

  const executions = db.taskExecutions.filter((entry) => entry.patientId === patientId);
  const adherence = calculateAdherence(executions);

  return res.json({ patientId, adherence, totalTasks: executions.length });
});

router.get("/:patientId/details", async (req, res) => {
  const { patientId } = req.params;
  const db = await readDB();

  const patient = db.patients.find((item) => item.id === patientId);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found." });
  }

  const carePlans = db.careplans.filter((plan) => plan.patientId === patientId);
  const executions = db.taskExecutions.filter((entry) => entry.patientId === patientId);
  const adherence = calculateAdherence(executions);

  return res.json({
    patient,
    carePlans,
    adherence,
    taskExecutions: executions,
  });
});

router.get("/:practitionerId", async (req, res) => {
  const { practitionerId } = req.params;
  const db = await readDB();

  const patientIds = Array.from(
    new Set(
      db.careplans
        .filter((plan) => plan.practitionerId === practitionerId)
        .map((plan) => plan.patientId)
    )
  );

  const patients = patientIds.map((patientId) => {
    const patient = db.patients.find((item) => item.id === patientId);
    const executions = db.taskExecutions.filter((entry) => entry.patientId === patientId);
    return {
      patientId,
      name: patient?.name || "Unknown",
      adherence: calculateAdherence(executions),
      activeCarePlans: db.careplans.filter(
        (plan) => plan.patientId === patientId && plan.practitionerId === practitionerId
      ).length,
    };
  });

  return res.json(patients);
});

module.exports = router;
