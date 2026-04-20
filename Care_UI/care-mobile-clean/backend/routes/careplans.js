const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.post("/", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can create care plans." });
  }

  const { title, description, patientId, startDate, endDate, taskIds } = req.body;
  if (!title || !patientId || !startDate || !endDate) {
    return res.status(400).json({ message: "Title, patient, start date and end date are required." });
  }

  const db = await readDB();
  const patient = db.patients.find((item) => item.id === patientId);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found." });
  }

  const carePlan = {
    id: uuidv4(),
    title,
    description: description || "",
    patientId,
    practitionerId: user.id,
    startDate,
    endDate,
    taskIds: taskIds || [],
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  db.careplans.push(carePlan);
  await writeDB(db);
  return res.status(201).json(carePlan);
});

router.get("/doctor/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const db = await readDB();
  const plans = db.careplans.filter((plan) => plan.practitionerId === doctorId);

  const payload = plans.map((plan) => {
    const patient = db.patients.find((item) => item.id === plan.patientId);
    return {
      ...plan,
      patientName: patient ? patient.name : "Unknown Patient",
    };
  });

  return res.json(payload);
});

router.get("/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const db = await readDB();
  const plans = db.careplans.filter((plan) => plan.patientId === patientId);
  return res.json(plans);
});

router.put("/:id", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can update care plans." });
  }

  const { id } = req.params;
  const { title, description, startDate, endDate, status } = req.body;
  const db = await readDB();
  const carePlan = db.careplans.find((item) => item.id === id);

  if (!carePlan) {
    return res.status(404).json({ message: "Care plan not found." });
  }
  if (carePlan.practitionerId !== user.id) {
    return res.status(403).json({ message: "Cannot modify another doctor's care plan." });
  }

  carePlan.title = title || carePlan.title;
  carePlan.description = description || carePlan.description;
  carePlan.startDate = startDate || carePlan.startDate;
  carePlan.endDate = endDate || carePlan.endDate;
  carePlan.status = status || carePlan.status;
  await writeDB(db);

  return res.json(carePlan);
});

router.delete("/:id", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can delete care plans." });
  }

  const { id } = req.params;
  const db = await readDB();
  const index = db.careplans.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Care plan not found." });
  }
  if (db.careplans[index].practitionerId !== user.id) {
    return res.status(403).json({ message: "Cannot delete another doctor's care plan." });
  }

  db.careplans.splice(index, 1);
  await writeDB(db);
  return res.json({ message: "Care plan deleted successfully." });
});

router.post("/:carePlanId/assign-tasks", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can assign tasks." });
  }

  const { carePlanId } = req.params;
  const { taskIds } = req.body;
  if (!Array.isArray(taskIds)) {
    return res.status(400).json({ message: "taskIds must be an array." });
  }

  const db = await readDB();
  const carePlan = db.careplans.find((item) => item.id === carePlanId);
  if (!carePlan) {
    return res.status(404).json({ message: "Care plan not found." });
  }
  if (carePlan.practitionerId !== user.id) {
    return res.status(403).json({ message: "Cannot modify another doctor's care plan." });
  }

  carePlan.taskIds = [...new Set([...(carePlan.taskIds || []), ...taskIds])];
  await writeDB(db);
  return res.json(carePlan);
});

module.exports = router;
