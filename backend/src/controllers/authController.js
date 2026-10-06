const crypto = require("crypto");
const {
  readDB,
  writeDB
} = require("../utils/db");

const {
  hashPassword,
  comparePassword,
  createToken,
  publicUser
} = require("../utils/auth");

async function register(req, res) {
  const {
    name,
    email,
    password,
    role = "entrepreneur",
    location = "",
    language = "English"
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters."
    });
  }

  if (!["entrepreneur", "mentor", "customer"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role."
    });
  }

  const db = await readDB();

  const normalizedEmail = email.toLowerCase().trim();

  if (
    db.users.some(
      user => user.email === normalizedEmail
    )
  ) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists."
    });
  }

  const passwordHash = await hashPassword(password);

  const user = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    location,
    language,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);

  await writeDB(db);

  const token = createToken(user);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: {
      token,
      user: publicUser(user)
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  const db = await readDB();

  const user = db.users.find(
    u => u.email === email.toLowerCase().trim()
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const valid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!valid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const token = createToken(user);

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: publicUser(user)
    }
  });
}

async function me(req, res) {
  const db = await readDB();

  const user = db.users.find(
    u => u.id === req.user.id
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  res.json({
    success: true,
    message: "Current user retrieved.",
    data: {
      user: publicUser(user)
    }
  });
}

module.exports = {
  register,
  login,
  me
};