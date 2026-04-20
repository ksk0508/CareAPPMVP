const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.post("/", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can add patients." });
  }

  const { name, email, phone, age, gender, notes } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, email and phone are required." });
  }

  const db = await readDB();
  const existing = db.patients.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ message: "A patient with this email already exists." });
  }

  const id = uuidv4();
  const patient = {
    id,
    name,
    email,
    phone,
    age: age || null,
    gender: gender || null,
    notes: notes || "",
    assignedDoctorId: user.id,
    createdAt: new Date().toISOString(),
  };

  db.patients.push(patient);
  await writeDB(db);
  return res.status(201).json(patient);
});

router.get("/daily-tasks", async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ message: "Date query parameter is required." });
  }

  const patientId = req.user.patientId || req.user.id;
  if (!patientId) {
    return res.status(400).json({ message: "Patient identity not found." });
  }

  const db = await readDB();
  const carePlans = db.careplans.filter(
    (plan) => plan.patientId === patientId && plan.startDate <= date && plan.endDate >= date
  );

  const tasks = [];
  carePlans.forEach((plan) => {
    plan.taskIds?.forEach((taskId, index) => {
      const task = db.tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }

      const scheduledTime = new Date(`${date}T09:00:00.000Z`);
      scheduledTime.setMinutes(scheduledTime.getMinutes() + index * 30);
      const scheduledTimeIso = scheduledTime.toISOString();

      const execution = db.taskExecutions.find(
        (entry) =>
          entry.patientId === patientId &&
          entry.taskId === taskId &&
          entry.scheduledTime === scheduledTimeIso
      );

      tasks.push({
        taskExecutionId: execution?.id || null,
        taskId,
        carePlanId: plan.id,
        title: task.title,
        type: task.category,
        description: task.description,
        scheduledTime: scheduledTimeIso,
        status: execution?.status || "Pending",
        carePlanTitle: plan.title,
      });
    });
  });

  return res.json(tasks);
});

router.get("/doctor/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const db = await readDB();

  const profilePatients = db.patients.filter(
    (patient) => patient.assignedDoctorId === doctorId
  );

  const careplanPatientIds = db.careplans
    .filter((plan) => plan.practitionerId === doctorId)
    .map((plan) => plan.patientId);

  const careplanPatients = careplanPatientIds
    .map((patientId) => db.patients.find((patient) => patient.id === patientId))
    .filter(Boolean);

  const allPatients = [...profilePatients, ...careplanPatients];
  const uniquePatients = [];
  const seen = new Set();
  for (const patient of allPatients) {
    if (!seen.has(patient.id)) {
      uniquePatients.push(patient);
      seen.add(patient.id);
    }
  }

  return res.json(uniquePatients);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const patient = db.patients.find((item) => item.id === id);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found." });
  }

  return res.json(patient);
});

module.exports = router;
