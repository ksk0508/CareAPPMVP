const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.get("/preferences", async (req, res) => {
  const userId = req.user.id;
  const db = await readDB();
  const preference = db.notificationPreferences.find((item) => item.userId === userId);

  return res.json(
    preference || {
      userId,
      enabled: true,
      channels: ["push", "email"],
    }
  );
});

router.post("/preferences", async (req, res) => {
  const userId = req.user.id;
  const { enabled, channels } = req.body;
  const db = await readDB();

  let preference = db.notificationPreferences.find((item) => item.userId === userId);
  if (!preference) {
    preference = {
      id: uuidv4(),
      userId,
      enabled: enabled !== false,
      channels: Array.isArray(channels) ? channels : ["push", "email"],
      updatedAt: new Date().toISOString(),
    };
    db.notificationPreferences.push(preference);
  } else {
    preference.enabled = enabled !== false;
    preference.channels = Array.isArray(channels) ? channels : preference.channels;
    preference.updatedAt = new Date().toISOString();
  }

  await writeDB(db);
  return res.json(preference);
});

router.post("/enable-disable", async (req, res) => {
  const userId = req.user.id;
  const { enabled } = req.body;
  const db = await readDB();

  let preference = db.notificationPreferences.find((item) => item.userId === userId);
  if (!preference) {
    preference = {
      id: uuidv4(),
      userId,
      enabled: enabled !== false,
      channels: ["push", "email"],
      updatedAt: new Date().toISOString(),
    };
    db.notificationPreferences.push(preference);
  } else {
    preference.enabled = enabled !== false;
    preference.updatedAt = new Date().toISOString();
  }

  await writeDB(db);
  return res.json(preference);
});

router.get("/history", async (req, res) => {
  const userId = req.user.id;
  const db = await readDB();

  const history = db.notifications
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json(history.slice(0, 20));
});

module.exports = router;
