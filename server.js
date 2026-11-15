"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const connectPgSimple = require("connect-pg-simple");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const session = require("express-session");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.resolve(__dirname, "public");
const roles = new Set(["admin", "principal", "curriculum", "coach"]);
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const databaseUrl = process.env.DATABASE_URL;
const sessionSecret = process.env.SESSION_SECRET;
let dummyPasswordHash;

if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}

const pool = new Pool({ connectionString: databaseUrl });
const PgSessionStore = connectPgSimple(session);
const sessionStore = new PgSessionStore({
  pool,
  tableName: "user_sessions",
  createTableIfMissing: true
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
  );
  next();
});
app.use(express.json({ limit: "10kb" }));
app.use(session({
  name: "volleydesk.sid",
  secret: sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000
  }
}));
app.use("/api", (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

function requireSameOrigin(request, response, next) {
  const origin = request.get("origin");
  let originHost;
  if (origin) {
    try {
      originHost = new URL(origin).host;
    } catch {
      response.status(403).json({ error: "Permintaan ditolak." });
      return;
    }
  }
  if ((originHost && originHost !== request.get("host")) ||
      request.get("sec-fetch-site") === "cross-site") {
    response.status(403).json({ error: "Permintaan ditolak." });
    return;
  }
  next();
}

async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM app_users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

function requireUser(request, response, next) {
  if (!request.session.userId) {
    response.status(401).json({ error: "Silakan masuk terlebih dahulu." });
    return;
  }
  next();
}

function requireAdmin(request, response, next) {
  if (!request.session.userId || request.session.role !== "admin") {
    response.status(403).json({ error: "Akses khusus administrator." });
    return;
  }
  next();
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan masuk. Coba lagi beberapa saat." }
});
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan ubah kata sandi. Coba lagi beberapa saat." }
});

app.post("/api/login", requireSameOrigin, loginLimiter, async (request, response, next) => {
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || email.length > 254 || password.length > 1024) {
      response.status(400).json({ error: "Email dan kata sandi wajib diisi." });
      return;
    }

    const result = await pool.query(
      "SELECT id, name, email, role, password_hash FROM app_users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : dummyPasswordHash);
    if (!user || !passwordMatches) {
      response.status(401).json({ error: "Email atau kata sandi tidak sesuai." });
      return;
    }

    await new Promise((resolve, reject) => {
      request.session.regenerate(error => error ? reject(error) : resolve());
    });
    request.session.userId = user.id;
    request.session.role = user.role;
    await new Promise((resolve, reject) => {
      request.session.save(error => error ? reject(error) : resolve());
    });
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/session", async (request, response, next) => {
  try {
    if (!request.session.userId) {
      response.status(401).json({ error: "Belum masuk." });
      return;
    }

    const user = await findUserById(request.session.userId);
    if (!user) {
      request.session.destroy(error => {
        if (error) next(error);
        else response.status(401).json({ error: "Sesi tidak lagi berlaku." });
      });
      return;
    }

    request.session.role = user.role;
    response.json({ user });
  } catch (error) {
    next(error);
  }
});

app.post("/api/logout", requireSameOrigin, (request, response, next) => {
  request.session.destroy(error => {
    if (error) {
      next(error);
      return;
    }
    response.clearCookie("volleydesk.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    response.status(204).end();
  });
});

app.post("/api/password", requireSameOrigin, requireUser, passwordLimiter, async (request, response, next) => {
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < 12 || newPassword.length > 1024) {
      response.status(400).json({ error: "Kata sandi baru harus memiliki minimal 12 karakter." });
      return;
    }

    const result = await pool.query(
      "SELECT password_hash FROM app_users WHERE id = $1",
      [request.session.userId]
    );
    if (!result.rows[0] || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
      response.status(401).json({ error: "Kata sandi saat ini tidak sesuai." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE app_users SET password_hash = $1 WHERE id = $2", [passwordHash, request.session.userId]);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/users", requireUser, requireAdmin, async (request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM app_users ORDER BY name, email"
    );
    response.json({ users: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    if (!name || name.length > 80 || !validEmail.test(email) || email.length > 254 ||
        password.length < 12 || password.length > 1024 || !roles.has(role)) {
      response.status(400).json({
        error: "Periksa data akun. Kata sandi harus memiliki minimal 12 karakter."
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO app_users (name, email, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, role, passwordHash]
    );
    response.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      response.status(409).json({ error: "Email tersebut sudah terdaftar." });
      return;
    }
    next(error);
  }
});

app.use(express.static(publicDirectory, {
  dotfiles: "deny",
  index: "index.html",
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.use((request, response) => {
  response.status(404).json({ error: "Halaman tidak ditemukan." });
});

app.use((error, request, response, next) => {
  console.error("Request failed:", error);
  if (response.headersSent) {
    next(error);
    return;
  }
  response.status(500).json({ error: "Terjadi kesalahan pada server." });
});

async function initializeDatabase() {
  dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(254) NOT NULL UNIQUE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'principal', 'curriculum', 'coach')),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const adminCount = await pool.query("SELECT COUNT(*)::int AS count FROM app_users WHERE role = 'admin'");
  if (adminCount.rows[0].count === 0) {
    const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim().toLowerCase();
    const name = (process.env.BOOTSTRAP_ADMIN_NAME || "").trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email || !name || name.length > 80 || !password || password.length < 12 ||
        password.length > 1024 || !validEmail.test(email)) {
      throw new Error(
        "No admin account exists. Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and a 12+ character BOOTSTRAP_ADMIN_PASSWORD."
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO app_users (name, email, role, password_hash)
       VALUES ($1, $2, 'admin', $3)
       ON CONFLICT (email) DO NOTHING`,
      [name, email, passwordHash]
    );
    const createdAdmin = await pool.query("SELECT 1 FROM app_users WHERE role = 'admin' LIMIT 1");
    if (!createdAdmin.rowCount) throw new Error("Bootstrap administrator could not be created.");
    console.log("Bootstrap administrator account created.");
  }
}

let server;
initializeDatabase()
  .then(() => {
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`VolleyDesk listening on port ${port}`);
    });
  })
  .catch(error => {
    console.error("VolleyDesk startup failed:", error);
    process.exitCode = 1;
    pool.end().catch(poolError => console.error("Database shutdown failed:", poolError));
  });

function shutdown() {
  if (server) {
    server.close(() => {
      pool.end().catch(error => console.error("Database shutdown failed:", error));
    });
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
