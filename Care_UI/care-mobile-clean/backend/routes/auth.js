const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../utils/db");
const { generateToken, hashPassword, comparePassword } = require("../utils/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const db = await readDB();
  const user = db.users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const accessToken = generateToken(user);
  return res.json({ accessToken });
});

router.post("/register", async (req, res) => {
  const { email, password, name, phone, age, gender } = req.body;

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ message: "Name, email, phone and password are required." });
  }

  const db = await readDB();
  const existing = db.users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  const id = uuidv4();
  const user = {
    id,
    email,
    name,
    phone,
    age: age || null,
    gender: gender || null,
    role: "Patient",
    patientId: id,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.patients.push({
    id,
    name,
    email,
    phone,
    age: age || null,
    gender: gender || null,
    notes: "",
    assignedDoctorId: null,
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  const accessToken = generateToken(user);
  return res.status(201).json({ accessToken });
});

router.post("/register-doctor", async (req, res) => {
  const {
    email,
    password,
    licenseNumber,
    specialization,
    hospital,
    department,
    phoneNumber,
  } = req.body;

  if (!email || !password || !licenseNumber) {
    return res.status(400).json({ message: "Email, password and license number are required." });
  }

  const db = await readDB();
  const existing = db.users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  const id = uuidv4();
  const user = {
    id,
    email,
    name: email,
    phone: phoneNumber || null,
    role: "Doctor",
    practitionerId: id,
    metadata: {
      licenseNumber,
      specialization: specialization || "General Practice",
      hospital: hospital || "",
      department: department || "",
    },
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDB(db);

  const accessToken = generateToken(user);
  return res.status(201).json({ accessToken });
});

router.post("/logout", (req, res) => {
  // For JWT-based auth, logout is client-side only
  // The token is invalidated by the client removing it from storage
  // In a production system, you could maintain a token blacklist here
  return res.json({ message: "Logout successful" });
});

module.exports = router;
