"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { initializeDatabase } = require("./database");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.resolve(__dirname, "public");
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validRoles = new Set(["admin", "principal", "curriculum", "coach"]);
const validMenus = new Set(["dashboard", "players", "attendance", "schedule", "training", "matches", "recommendations", "reports", "settings"]);
const minimumPasswordLength = 6;
const sessionDurationMs = 8 * 60 * 60 * 1000;
const cookieName = "volleydesk.sid";
const maximumStateBytes = 10 * 1024 * 1024;
const maximumTelegramDocumentBytes = 40 * 1024 * 1024;
const timezone = process.env.BACKUP_TIMEZONE || "Asia/Jakarta";
let database;

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
app.use(express.json({ limit: "12mb" }));

function apiError(response, status, message) {
  response.status(status).json({ error: message });
}

function requireSameOrigin(request, response, next) {
  const origin = request.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.get("host")) {
        apiError(response, 403, "Permintaan ditolak.");
        return;
      }
    } catch {
      apiError(response, 403, "Permintaan ditolak.");
      return;
    }
  }
  if (request.get("sec-fetch-site") === "cross-site") {
    apiError(response, 403, "Permintaan ditolak.");
    return;
  }
  next();
}

function parseCookie(request, name) {
  const prefix = `${name}=`;
  const item = (request.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith(prefix));
  return item ? item.slice(prefix.length) : "";
}

function requestUser(request, response, next) {
  const token = parseCookie(request, cookieName);
  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = database.get(
      `SELECT app_users.id, app_users.name, app_users.email, app_users.role
       FROM auth_sessions JOIN app_users ON app_users.id = auth_sessions.user_id
       WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ?`,
      [tokenHash, Date.now()]
    );
    request.user = session || null;
  }
  next();
}

app.use("/api", (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
}, requestUser);

function requireUser(request, response, next) {
  if (!request.user) {
    apiError(response, 401, "Silakan masuk terlebih dahulu.");
    return;
  }
  next();
}

function requireAdmin(request, response, next) {
  if (!request.user || request.user.role !== "admin") {
    apiError(response, 403, "Akses khusus administrator.");
    return;
  }
  next();
}

function requireOperator(request, response, next) {
  if (!request.user || !["admin", "coach"].includes(request.user.role)) {
    apiError(response, 403, "Akses tidak diizinkan.");
    return;
  }
  next();
}

function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDurationMs / 1000}${secure}`);
}

function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function readAppState() {
  const row = database.get("SELECT state_json, is_initial FROM app_state WHERE id = 1");
  return row ? { data: JSON.parse(row.state_json), isInitial: Boolean(row.is_initial) } : { data: null, isInitial: true };
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeAppState(input, previous, role) {
  if (!isRecord(input) ||
      !Array.isArray(input.players) ||
      !Array.isArray(input.sessions) ||
      !Array.isArray(input.events) ||
      !Array.isArray(input.matches) ||
      [input.players, input.sessions, input.events, input.matches].some(items =>
        items.length > 5000 || items.some(item => !isRecord(item)))) {
    throw new Error("Format data aplikasi tidak valid.");
  }

  const sourceMenus = role === "admin" ? input.menuVisibility : previous && previous.menuVisibility;
  const sourceHighlights = role === "admin" ? input.highlights : previous && previous.highlights;
  const menuVisibility = {};
  const highlights = {};
  for (const roleName of validRoles) {
    const configured = sourceMenus && Array.isArray(sourceMenus[roleName]) ? sourceMenus[roleName] : [];
    menuVisibility[roleName] = Array.from(new Set(configured.filter(menu => validMenus.has(menu))));
    const highlight = sourceHighlights && sourceHighlights[roleName];
    highlights[roleName] = validMenus.has(highlight) ? highlight : (menuVisibility[roleName][0] || "dashboard");
  }
  const clean = {
    theme: input.theme === "dark" ? "dark" : "light",
    menuVisibility,
    highlights,
    players: input.players,
    sessions: input.sessions,
    events: input.events,
    matches: input.matches
  };
  if (Buffer.byteLength(JSON.stringify(clean), "utf8") > maximumStateBytes) {
    throw new Error("Ukuran data terlalu besar.");
  }
  return clean;
}

function writeAppState(input, role, initialOnly) {
  const current = readAppState();
  if (initialOnly && !current.isInitial) {
    const error = new Error("Data server sudah tersedia; import awal tidak dapat menimpanya.");
    error.status = 409;
    throw error;
  }
  const state = sanitizeAppState(input, current.data, role);
  database.transaction(() => {
    database.run(
      `INSERT INTO app_state (id, state_json, is_initial, updated_at) VALUES (1, ?, 0, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, is_initial = 0, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(state)]
    );
  });
  return state;
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

app.get("/health", (request, response) => {
  try {
    database.get("SELECT 1 AS ok");
    response.status(200).json({ status: "ok" });
  } catch {
    response.status(503).json({ status: "unavailable" });
  }
});

app.post("/api/login", requireSameOrigin, loginLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    if (!validEmail.test(email) || email.length > 254 || !password || password.length > 1024) {
      apiError(response, 400, "Email dan kata sandi wajib diisi.");
      return;
    }
    const user = database.get(
      "SELECT id, name, email, role, password_hash FROM app_users WHERE email = ? COLLATE NOCASE",
      [email]
    );
    const passwordHash = user ? user.password_hash : await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
    if (!user || !(await bcrypt.compare(password, passwordHash))) {
      apiError(response, 401, "Email atau kata sandi tidak sesuai.");
      return;
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = Date.now() + sessionDurationMs;
    database.transaction(() => {
      database.run("DELETE FROM auth_sessions WHERE expires_at <= ?", [Date.now()]);
      database.run("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [tokenHash, user.id, expiresAt]);
    });
    setSessionCookie(response, token);
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/session", (request, response) => {
  response.json({ user: request.user || null });
});

app.post("/api/logout", requireSameOrigin, (request, response, next) => {
  try {
    const token = parseCookie(request, cookieName);
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      database.transaction(() => database.run("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash]));
    }
    clearSessionCookie(response);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/password", requireSameOrigin, requireUser, passwordLimiter, async (request, response, next) => {
  try {
    const currentPassword = typeof request.body.currentPassword === "string" ? request.body.currentPassword : "";
    const newPassword = typeof request.body.newPassword === "string" ? request.body.newPassword : "";
    if (newPassword.length < minimumPasswordLength || newPassword.length > 1024) {
      apiError(response, 400, `Kata sandi baru harus memiliki minimal ${minimumPasswordLength} karakter.`);
      return;
    }
    const user = database.get("SELECT password_hash FROM app_users WHERE id = ?", [request.user.id]);
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      apiError(response, 401, "Kata sandi saat ini tidak sesuai.");
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const token = parseCookie(request, cookieName);
    const currentTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    database.transaction(() => {
      database.run("UPDATE app_users SET password_hash = ? WHERE id = ?", [passwordHash, request.user.id]);
      database.run("DELETE FROM auth_sessions WHERE user_id = ? AND token_hash != ?", [request.user.id, currentTokenHash]);
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/users", requireUser, requireAdmin, (request, response) => {
  const users = database.all("SELECT id, name, email, role FROM app_users ORDER BY name, email");
  response.json({ users });
});

app.post("/api/admin/users", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    const role = request.body.role;
    if (!name || name.length > 80 || !validEmail.test(email) || email.length > 254 ||
        password.length < minimumPasswordLength || password.length > 1024 || !validRoles.has(role)) {
      apiError(response, 400, `Periksa data akun. Kata sandi harus memiliki minimal ${minimumPasswordLength} karakter.`);
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    database.transaction(() => {
      database.run("INSERT INTO app_users (name, email, role, password_hash) VALUES (?, ?, ?, ?)", [name, email, role, passwordHash]);
      user = database.get("SELECT id, name, email, role FROM app_users WHERE email = ? COLLATE NOCASE", [email]);
    });
    response.status(201).json({ user });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: app_users.email")) {
      apiError(response, 409, "Email tersebut sudah terdaftar.");
      return;
    }
    next(error);
  }
});

app.get("/api/state", requireUser, (request, response) => {
  const result = readAppState();
  response.json({ ...result, role: request.user.role });
});

app.put("/api/state", requireSameOrigin, requireUser, requireOperator, (request, response, next) => {
  try {
    const state = writeAppState(request.body.data, request.user.role, false);
    response.json({ ok: true, updatedAt: new Date().toISOString(), data: state });
  } catch (error) {
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

app.post("/api/state/initialize", requireSameOrigin, requireUser, requireAdmin, (request, response, next) => {
  try {
    const state = writeAppState(request.body.data, request.user.role, true);
    response.json({ ok: true, data: state });
  } catch (error) {
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

function getBackupSettings() {
  const settings = database.get(
    "SELECT enabled, time_local, last_result, last_message, last_run_at FROM backup_settings WHERE id = 1"
  );
  return {
    enabled: Boolean(settings.enabled),
    time: settings.time_local,
    timezone,
    telegramConfigured: telegramConfigured(),
    lastResult: settings.last_result,
    lastMessage: settings.last_message,
    lastRunAt: settings.last_run_at
  };
}

function createBackup() {
  const state = readAppState().data;
  if (!state) throw new Error("Data aplikasi belum pernah tersimpan.");
  const users = database.all(
    "SELECT id, name, email, role, password_hash, created_at FROM app_users ORDER BY id"
  );
  const settings = database.get("SELECT enabled, time_local FROM backup_settings WHERE id = 1");
  return {
    format: "volleydesk-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    data: state,
    users,
    backupSettings: { enabled: Boolean(settings.enabled), time: settings.time_local }
  };
}

async function sendTelegramBackup() {
  if (!telegramConfigured()) {
    const error = new Error("Telegram belum dikonfigurasi di Railway.");
    error.status = 503;
    throw error;
  }
  const backup = createBackup();
  const contents = JSON.stringify(backup, null, 2);
  const bytes = Buffer.byteLength(contents, "utf8");
  if (bytes > maximumTelegramDocumentBytes) {
    throw new Error("Berkas backup melewati batas 40 MB untuk pengiriman bot.");
  }
  const form = new FormData();
  form.set("chat_id", process.env.TELEGRAM_CHAT_ID);
  form.set("caption", `VolleyDesk backup ${new Date().toLocaleString("id-ID", { timeZone: timezone })}`);
  form.set("document", new Blob([contents], { type: "application/json" }), `volleydesk-backup-${new Date().toISOString().slice(0, 10)}.json`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const result = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: "POST",
      body: form,
      signal: controller.signal
    });
    const payload = await result.json().catch(() => null);
    if (!result.ok || !payload || payload.ok !== true) {
      throw new Error("Telegram gagal menerima berkas backup.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function saveBackupResult(result, message, scheduled) {
  database.transaction(() => database.run(
    scheduled
      ? "UPDATE backup_settings SET last_attempt_at = ?, last_result = ?, last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1"
      : "UPDATE backup_settings SET last_result = ?, last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1",
    scheduled ? [Date.now(), result, message] : [result, message]
  ));
}

app.get("/api/admin/backup-settings", requireUser, requireAdmin, (request, response) => {
  response.json(getBackupSettings());
});

app.put("/api/admin/backup-settings", requireSameOrigin, requireUser, requireAdmin, (request, response) => {
  const enabled = request.body.enabled === true;
  const time = typeof request.body.time === "string" ? request.body.time : "";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    apiError(response, 400, "Format waktu backup tidak valid.");
    return;
  }
  if (enabled && !telegramConfigured()) {
    apiError(response, 503, "Atur TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID di Railway sebelum mengaktifkan backup.");
    return;
  }
  database.transaction(() => database.run("UPDATE backup_settings SET enabled = ?, time_local = ? WHERE id = 1", [enabled ? 1 : 0, time]));
  response.json(getBackupSettings());
});

app.get("/api/admin/backup/download", requireUser, requireAdmin, (request, response, next) => {
  try {
    const contents = JSON.stringify(createBackup(), null, 2);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="volleydesk-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    response.send(contents);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/backup/telegram", requireSameOrigin, requireUser, requireAdmin, async (request, response, next) => {
  try {
    await sendTelegramBackup();
    saveBackupResult("success", "Backup manual berhasil dikirim ke Telegram.");
    response.json(getBackupSettings());
  } catch (error) {
    saveBackupResult("failed", error.message || "Backup gagal.");
    if (error.status) {
      apiError(response, error.status, error.message);
      return;
    }
    next(error);
  }
});

app.post("/api/admin/restore", requireSameOrigin, requireUser, requireAdmin, (request, response, next) => {
  try {
    const backup = request.body.backup;
    if (!isRecord(backup) || backup.format !== "volleydesk-backup" || backup.version !== 1 ||
        !Array.isArray(backup.users) || backup.users.length < 1 || backup.users.length > 500 ||
        !backup.users.some(user => isRecord(user) && user.role === "admin") ||
        !isRecord(backup.backupSettings) ||
        typeof backup.backupSettings.enabled !== "boolean" ||
        typeof backup.backupSettings.time !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(backup.backupSettings.time)) {
      apiError(response, 400, "Format berkas backup tidak dikenal.");
      return;
    }
    const state = sanitizeAppState(backup.data, readAppState().data, "admin");
    const userIds = new Set();
    const userEmails = new Set();
    const users = backup.users.map(user => {
      if (!isRecord(user) || !Number.isSafeInteger(Number(user.id)) || Number(user.id) < 1 ||
          typeof user.name !== "string" || !user.name.trim() || user.name.length > 80 ||
          typeof user.email !== "string" || !validEmail.test(user.email) || user.email.length > 254 ||
          !validRoles.has(user.role) ||
          typeof user.password_hash !== "string" || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password_hash)) {
        throw new Error("Berkas backup berisi data akun yang tidak valid.");
      }
      const email = user.email.trim().toLowerCase();
      if (userIds.has(Number(user.id)) || userEmails.has(email)) throw new Error("Berkas backup berisi akun duplikat.");
      userIds.add(Number(user.id));
      userEmails.add(email);
      return {
        id: Number(user.id),
        name: user.name.trim(),
        email,
        role: user.role,
        passwordHash: user.password_hash,
        createdAt: typeof user.created_at === "string" && user.created_at.length <= 40
          ? user.created_at
          : new Date().toISOString()
      };
    });
    database.transaction(() => {
      database.run("DELETE FROM auth_sessions");
      database.run("DELETE FROM app_users");
      for (const user of users) {
        database.run(
          "INSERT INTO app_users (id, name, email, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          [user.id, user.name, user.email, user.role, user.passwordHash, user.createdAt || new Date().toISOString()]
        );
      }
      database.run(
        `INSERT INTO app_state (id, state_json, is_initial, updated_at) VALUES (1, ?, 0, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, is_initial = 0, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(state)]
      );
      database.run(
        "UPDATE backup_settings SET enabled = ?, time_local = ? WHERE id = 1",
        [backup.backupSettings.enabled ? 1 : 0, backup.backupSettings.time]
      );
    });
    clearSessionCookie(response);
    response.json({ ok: true });
  } catch (error) {
    if (error.message === "Format data aplikasi tidak valid." || error.message === "Ukuran data terlalu besar.") {
      apiError(response, 400, error.message);
      return;
    }
    if (error.message === "Berkas backup berisi data akun yang tidak valid." ||
        error.message === "Berkas backup berisi akun duplikat.") {
      apiError(response, 400, error.message);
      return;
    }
    next(error);
  }
});

function jakartaDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

async function runScheduledBackup() {
  const now = jakartaDateTime();
  const settings = database.get("SELECT enabled, time_local, last_scheduled_date, last_attempt_at FROM backup_settings WHERE id = 1");
  if (!settings.enabled || settings.last_scheduled_date === now.date || now.time < settings.time_local || !telegramConfigured()) return;
  if (settings.last_attempt_at && Date.now() - Number(settings.last_attempt_at) < 30 * 60 * 1000) return;
  database.transaction(() => database.run(
    "UPDATE backup_settings SET last_attempt_at = ?, last_result = 'running', last_message = ?, last_run_at = CURRENT_TIMESTAMP WHERE id = 1",
    [Date.now(), "Backup terjadwal sedang dikirim."]
  ));
  try {
    await sendTelegramBackup();
    database.transaction(() => database.run("UPDATE backup_settings SET last_scheduled_date = ? WHERE id = 1", [now.date]));
    saveBackupResult("success", "Backup harian berhasil dikirim ke Telegram.", true);
  } catch (error) {
    console.error("Scheduled Telegram backup failed:", error.message);
    saveBackupResult("failed", error.message || "Backup harian gagal.", true);
  }
}

let server;
let scheduler;

async function start() {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("BACKUP_TIMEZONE is not a valid IANA timezone.");
  }
  database = await initializeDatabase();
  const adminCount = database.get("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin'");
  if (Number(adminCount.count) === 0) {
    const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || (process.env.NODE_ENV === "production" ? "" : "admin@volleydesk.demo")).trim().toLowerCase();
    const name = (process.env.BOOTSTRAP_ADMIN_NAME || (process.env.NODE_ENV === "production" ? "" : "Administrator")).trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "VoliDesk!2026");
    if (!validEmail.test(email) || !name || name.length > 80 || password.length < minimumPasswordLength) {
      throw new Error("Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and BOOTSTRAP_ADMIN_PASSWORD (minimum 6 characters) before starting.");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    database.transaction(() => database.run(
      "INSERT INTO app_users (name, email, role, password_hash) VALUES (?, ?, 'admin', ?)",
      [name, email, passwordHash]
    ));
    console.log("Bootstrap administrator account created.");
  }

  app.use(express.static(publicDirectory, {
    dotfiles: "deny",
    index: "index.html",
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
    setHeaders(response, filePath) {
      if (path.extname(filePath) === ".html") response.setHeader("Cache-Control", "no-cache");
    }
  }));
  app.use((request, response) => {
    response.status(404).type("text/plain").send("Not Found");
  });
  app.use((error, request, response, next) => {
    console.error("Request failed:", error);
    if (response.headersSent) {
      next(error);
      return;
    }
    response.status(500).json({ error: "Terjadi kesalahan pada server." });
  });

  server = app.listen(port, "0.0.0.0", () => {
    console.log(`VolleyDesk listening on port ${port}; SQLite at ${process.env.SQLITE_PATH || "data/volleydesk.sqlite"}`);
  });
  scheduler = setInterval(() => { runScheduledBackup().catch(error => console.error("Backup scheduler failed:", error)); }, 30000);
}

start().catch(error => {
  console.error("VolleyDesk startup failed:", error);
  process.exitCode = 1;
});

function shutdown() {
  if (scheduler) clearInterval(scheduler);
  if (server) {
    server.close(() => {
      try { database.close(); } catch (error) { console.error("Database shutdown failed:", error); }
    });
  } else if (database) {
    try { database.close(); } catch (error) { console.error("Database shutdown failed:", error); }
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
