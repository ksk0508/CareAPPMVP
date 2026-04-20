const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");
const DEFAULT_DB = {
  users: [],
  patients: [],
  tasks: [],
  careplans: [],
  taskExecutions: [],
  diagnostics: [],
  notifications: [],
  notificationPreferences: [],
};

const ensureDB = async () => {
  try {
    await fs.promises.access(DB_PATH, fs.constants.F_OK);
  } catch (error) {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
};

const readDB = async () => {
  await ensureDB();
  const raw = await fs.promises.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
};

const writeDB = async (data) => {
  await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  ensureDB,
  readDB,
  writeDB,
};
