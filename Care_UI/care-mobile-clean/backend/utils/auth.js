const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "careportal_secret";

const generateToken = (user) => {
  const payload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    practitionerId: user.practitionerId,
    patientId: user.patientId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
