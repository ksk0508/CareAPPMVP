const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const db = await readDB();
  return res.json(db.tasks || []);
});

router.get("/search", async (req, res) => {
  const query = (req.query.title || "").toLowerCase();
  const db = await readDB();
  const filtered = db.tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });
  return res.json(filtered);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const task = db.tasks.find((item) => item.id === id);
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }
  return res.json(task);
});

router.post("/", async (req, res) => {
  console.log("[BACKEND] POST /api/tasks received body:", req.body);
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can create tasks." });
  }

  const { title, category, description, instructions } = req.body;
  if (!title || !category) {
    return res.status(400).json({ message: "Title and category are required." });
  }

  const db = await readDB();
  const task = {
    id: uuidv4(),
    title,
    category,
    description: description || "",
    instructions: instructions || "",
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };

  db.tasks.push(task);
  await writeDB(db);
  return res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can update tasks." });
  }

  const { id } = req.params;
  const { title, category, description, instructions } = req.body;
  const db = await readDB();
  const task = db.tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  task.title = title || task.title;
  task.category = category || task.category;
  task.description = description || task.description;
  task.instructions = instructions || task.instructions;
  await writeDB(db);

  return res.json(task);
});

router.delete("/:id", async (req, res) => {
  const user = req.user;
  if (user.role !== "Doctor") {
    return res.status(403).json({ message: "Only doctors can delete tasks." });
  }

  const { id } = req.params;
  const db = await readDB();
  const taskIndex = db.tasks.findIndex((item) => item.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found." });
  }

  db.tasks.splice(taskIndex, 1);
  await writeDB(db);
  return res.json({ message: "Task deleted successfully." });
});

module.exports = router;
