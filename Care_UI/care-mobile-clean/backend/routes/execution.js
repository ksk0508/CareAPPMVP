const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

const updateExecution = async (user, taskId, scheduledTime, status) => {
  const db = await readDB();
  const patientId = user.patientId || user.id;
  if (!patientId) {
    throw new Error("Patient identity not found.");
  }

  let execution = db.taskExecutions.find(
    (entry) =>
      entry.patientId === patientId &&
      entry.taskId === taskId &&
      entry.scheduledTime === scheduledTime
  );

  if (!execution) {
    execution = {
      id: uuidv4(),
      patientId,
      taskId,
      scheduledTime,
      status,
      updatedAt: new Date().toISOString(),
    };
    db.taskExecutions.push(execution);
  } else {
    execution.status = status;
    execution.updatedAt = new Date().toISOString();
  }

  await writeDB(db);
  return execution;
};

router.post("/complete", async (req, res) => {
  const user = req.user;
  const { taskId, scheduledTime } = req.body;

  if (!taskId || !scheduledTime) {
    return res.status(400).json({ message: "taskId and scheduledTime are required." });
  }

  try {
    const execution = await updateExecution(user, taskId, scheduledTime, "Completed");
    return res.json(execution);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/skip", async (req, res) => {
  const user = req.user;
  const { taskId, scheduledTime } = req.body;

  if (!taskId || !scheduledTime) {
    return res.status(400).json({ message: "taskId and scheduledTime are required." });
  }

  try {
    const execution = await updateExecution(user, taskId, scheduledTime, "Skipped");
    return res.json(execution);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
