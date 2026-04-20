const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.get("/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const db = await readDB();

  const diagnostics = db.diagnostics.filter((item) => item.patientId === patientId);
  return res.json(diagnostics);
});

router.post("/", async (req, res) => {
  const { patientId, summary, type, date } = req.body;
  if (!patientId || !summary) {
    return res.status(400).json({ message: "patientId and summary are required." });
  }

  const db = await readDB();
  const diagnostic = {
    id: uuidv4(),
    patientId,
    summary,
    type: type || "General",
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.diagnostics.push(diagnostic);
  await writeDB(db);
  return res.status(201).json(diagnostic);
});

router.put("/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const { id, summary, type, date } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Diagnostic id is required." });
  }

  const db = await readDB();
  const diagnostic = db.diagnostics.find((item) => item.id === id && item.patientId === patientId);
  if (!diagnostic) {
    return res.status(404).json({ message: "Diagnostic record not found." });
  }

  diagnostic.summary = summary || diagnostic.summary;
  diagnostic.type = type || diagnostic.type;
  diagnostic.date = date || diagnostic.date;
  diagnostic.updatedAt = new Date().toISOString();

  await writeDB(db);
  return res.json(diagnostic);
});

module.exports = router;
