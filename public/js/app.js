(function () {
      "use strict";
      const STORAGE_KEY = "volleyDeskDataV1";
      const LEGACY_IMPORTED_KEY = "volleyDeskLegacyImportedV1";
      const MIN_PASSWORD_LENGTH = 6;
      const roles = {
        admin: "Admin / Operator",
        principal: "Kepala Sekolah",
        curriculum: "Wakasek Kurikulum",
        coach: "Pelatih",
        player: "Pemain"
      };
      const pages = [
        { id: "dashboard", label: "Ringkasan", icon: "▦", roles: ["admin", "principal", "curriculum", "coach", "player"] },
        { id: "players", label: "Data pemain", icon: "♟", roles: ["admin", "coach"] },
        { id: "attendance", label: "Kehadiran", icon: "✓", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "schedule", label: "Kalender", icon: "▣", roles: ["admin", "principal", "curriculum", "coach", "player"] },
        { id: "training", label: "Log latihan", icon: "↗", roles: ["admin", "coach"] },
        { id: "matches", label: "Statistik pertandingan", icon: "◎", roles: ["admin", "coach"] },
        { id: "recommendations", label: "Rekomendasi", icon: "✦", roles: ["admin", "coach"] },
        { id: "reports", label: "Laporan", icon: "▤", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "targets", label: "Target performa", icon: "◉", roles: ["admin", "coach", "player"] },
        { id: "settings", label: "Pengaturan akses", icon: "⚙", roles: ["admin"] }
      ];
      const defaultData = {
        theme: "light",
        role: "coach",
        menuVisibility: {
          admin: pages.filter(p => p.roles.includes("admin")).map(p => p.id),
          principal: ["dashboard", "attendance", "schedule", "reports"],
          curriculum: ["dashboard", "attendance", "schedule", "reports"],
          coach: ["dashboard", "players", "attendance", "schedule", "training", "matches", "recommendations", "reports", "targets"],
          player: ["dashboard", "schedule", "targets"]
        },
        highlights: { admin: "dashboard", principal: "dashboard", curriculum: "schedule", coach: "attendance", player: "dashboard" },
        bottomNav: {
          admin: ["dashboard", "players", "attendance", "schedule", "settings"],
          principal: ["dashboard", "attendance", "schedule", "reports"],
          curriculum: ["dashboard", "schedule", "attendance", "reports"],
          coach: ["dashboard", "players", "attendance", "matches", "schedule"],
          player: ["dashboard", "schedule", "targets"]
        },
        bottomHighlights: { admin: "dashboard", principal: "dashboard", curriculum: "schedule", coach: "attendance", player: "dashboard" },
        players: [
          { id: 1, name: "Nadia Putri", position: "Setter", number: 7, className: "XI IPA 1", height: 166, weight: 55, spikeReach: 274, blockReach: 262, history: [{ date: "2026-09-10", height: 165, weight: 54, spikeReach: 271, blockReach: 260 }, { date: "2026-11-01", height: 166, weight: 55, spikeReach: 274, blockReach: 262 }] },
          { id: 2, name: "Alya Safitri", position: "Outside Hitter", number: 12, className: "X IPA 2", height: 171, weight: 58, spikeReach: 286, blockReach: 273, history: [{ date: "2026-10-12", height: 170, weight: 58, spikeReach: 282, blockReach: 270 }, { date: "2026-11-02", height: 171, weight: 58, spikeReach: 286, blockReach: 273 }] },
          { id: 3, name: "Dinda Maharani", position: "Libero", number:  liberoNumber(), className: "XI IPS 1", height: 158, weight: 50, spikeReach: 253, blockReach: 244, history: [{ date: "2026-10-08", height: 158, weight: 50, spikeReach: 251, blockReach: 242 }, { date: "2026-11-03", height: 158, weight: 50, spikeReach: 253, blockReach: 244 }] },
          { id: 4, name: "Salsa Amalia", position: "Middle Blocker", number: 9, className: "XII IPA 2", height: 174, weight: 63, spikeReach: 290, blockReach: 279, history: [{ date: "2026-09-14", height: 173, weight: 62, spikeReach: 286, blockReach: 276 }, { date: "2026-11-04", height: 174, weight: 63, spikeReach: 290, blockReach: 279 }] },
          { id: 5, name: "Rani Oktavia", position: "Opposite", number: 4, className: "XI IPA 3", height: 169, weight: 57, spikeReach: 282, blockReach: 269, history: [{ date: "2026-10-15", height: 169, weight: 57, spikeReach: 278, blockReach: 267 }, { date: "2026-11-05", height: 169, weight: 57, spikeReach: 282, blockReach: 269 }] },
          { id: 6, name: "Citra Lestari", position: "Outside Hitter", number: 10, className: "X IPA 1", height: 164, weight: 53, spikeReach: 272, blockReach: 261, history: [{ date: "2026-09-15", height: 163, weight: 52, spikeReach: 269, blockReach: 258 }, { date: "2026-11-06", height: 164, weight: 53, spikeReach: 272, blockReach: 261 }] }
        ],
        sessions: [
          { id: 1, date: "2026-11-12", title: "Latihan teknik dasar", drills: ["Drilling passing bawah", "Serve target"], notes: "Fokus platform receive dan komunikasi bola.", attendance: { 1: "Hadir", 2: "Hadir", 3: "Hadir", 4: "Hadir", 5: "Izin", 6: "Hadir" } },
          { id: 2, date: "2026-11-05", title: "Latihan kombinasi", drills: ["Spike footwork", "Block positioning", "Game simulation"], notes: "Akurasi approach meningkat.", attendance: { 1: "Hadir", 2: "Hadir", 3: "Hadir", 4: "Izin", 5: "Hadir", 6: "Hadir" } },
          { id: 3, date: "2026-10-29", title: "Latihan pertahanan", drills: ["Dig defense", "Serving tactical"], notes: "Evaluasi transisi defense ke offense.", attendance: { 1: "Hadir", 2: "Sakit", 3: "Hadir", 4: "Hadir", 5: "Hadir", 6: "Hadir" } }
        ],
        events: [
          { id: 1, title: "Latihan teknik & taktik", type: "Latihan", date: "2026-11-18", time: "15:30", location: "GOR Sekolah", reminder: true },
          { id: 2, title: "Sparring vs SMA Harapan", type: "Sparring", date: "2026-11-21", time: "08:00", location: "GOR Kota", reminder: true },
          { id: 3, title: "Pemulihan & istirahat tim", type: "Istirahat", date: "2026-11-23", time: "00:00", location: "Rumah", reminder: false },
          { id: 4, title: "Turnamen antar sekolah", type: "Turnamen", date: "2026-11-28", time: "07:30", location: "GOR Kabupaten", reminder: true }
        ],
        matches: [
          { id: 1, name: "Uji Coba vs SMA Harapan", date: "2026-11-08", opponent: "SMA Harapan", stats: [
            { playerId: 2, skill: "Attack", success: 8, errors: 5 }, { playerId: 4, skill: "Block", success: 4, errors: 2 }, { playerId: 1, skill: "Set", success: 15, errors: 3 }, { playerId: 3, skill: "Receive", success: 12, errors: 4 }, { playerId: 5, skill: "Serve", success: 5, errors: 3 }
          ] }
        ],
        targets: {}
      };
      function liberoNumber() { return 3; }
      let signedInUser = null;
      let serverUsers = [];
      let data = JSON.parse(JSON.stringify(defaultData));
      let backupSettings = null;
      let legacyData = null;
      let saveQueue = Promise.resolve();
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        legacyData = saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error("Data lama VolleyDesk di browser tidak dapat dibaca.", error);
      }
      let currentPage = "dashboard";
      let settingsRoleKey = data.role || "coach";
      let selectedSessionId = data.sessions[0] ? data.sessions[0].id : null;
      let selectedMatchId = data.matches[0] ? data.matches[0].id : null;
      let selectedTargetPlayerId = null;
      let selectedTargetPeriod = "week";
      let searchTerm = "";
      let pendingAttendance = {};
      let selectedPlayerIds = new Set();
      let bottomNavRole = "coach";

      const $ = (selector, root) => (root || document).querySelector(selector);
      async function api(url, options) {
        const response = await fetch(url, Object.assign({ credentials: "same-origin" }, options || {}));
        if (response.status === 204) return null;
        let payload = null;
        try { payload = await response.json(); } catch {}
        if (!response.ok) {
          const error = new Error(payload && payload.error ? payload.error : "Permintaan ke server gagal.");
          error.status = response.status;
          throw error;
        }
        return payload;
      }
      const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const todayISO = () => new Date().toISOString().slice(0, 10);
      const dateObj = value => new Date(value + "T12:00:00");
      const formatDate = value => dateObj(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const shortMonth = value => dateObj(value).toLocaleDateString("id-ID", { month: "short" }).replace(".", "");
      const activeRole = () => data.role || "coach";
      const playerById = id => data.players.find(p => Number(p.id) === Number(id));
      const visiblePages = () => pages.filter(p => p.roles.includes(activeRole()) && (data.menuVisibility[activeRole()] || []).includes(p.id));
      function persist() {
        if (activeRole() === "player") return Promise.resolve(true);
        const snapshot = JSON.stringify(data);
        saveQueue = saveQueue.catch(() => {}).then(() => api("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: JSON.parse(snapshot) })
        }));
        return saveQueue.then(() => true).catch(error => {
          console.error("Penyimpanan data VolleyDesk ke server gagal.", error);
          toast(error.message || "Penyimpanan ke server gagal.");
          return false;
        });
      }
      function toast(message) {
        const node = $("#toast"); node.textContent = message; node.classList.add("show");
        window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => node.classList.remove("show"), 2600);
      }
      function initials(name) { return name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase(); }
      function attendanceRate(playerId) {
        const records = data.sessions.filter(s => s.attendance && s.attendance[playerId]);
        if (!records.length) return 0;
        return Math.round(records.filter(s => s.attendance[playerId] === "Hadir").length / records.length * 100);
      }
      function allAttendanceRate() {
        const total = data.players.reduce((sum, p) => sum + data.sessions.filter(s => s.attendance && s.attendance[p.id]).length, 0);
        const present = data.players.reduce((sum, p) => sum + data.sessions.filter(s => s.attendance && s.attendance[p.id] === "Hadir").length, 0);
        return total ? Math.round(present / total * 100) : 0;
      }
      function skillEfficiency(playerId, skill) {
        const stats = data.matches.flatMap(m => m.stats || []).filter(s => Number(s.playerId) === Number(playerId) && (!skill || s.skill === skill));
        const success = stats.reduce((sum, s) => sum + Number(s.success || 0), 0);
        const attempts = stats.reduce((sum, s) => sum + Number(s.success || 0) + Number(s.errors || 0), 0);
        return attempts ? Math.round(success / attempts * 100) : null;
      }
      function dateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
      function targetDateRange(period) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        if (period === "month") {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1, 0);
        } else {
          const day = (start.getDay() + 6) % 7;
          start.setDate(start.getDate() - day);
          end.setDate(start.getDate() + 6);
        }
        return { start: dateKey(start), end: dateKey(end), weeks: Math.max(1, (end - start) / 604800000 + 1) };
      }
      function targetMetrics(playerId, period) {
        const range = targetDateRange(period);
        const stats = data.matches.filter(match => match.date >= range.start && match.date <= range.end)
          .flatMap(match => match.stats || []).filter(stat => Number(stat.playerId) === Number(playerId));
        const sum = skill => stats.filter(stat => stat.skill === skill).reduce((total, stat) => ({
          success: total.success + Number(stat.success || 0),
          errors: total.errors + Number(stat.errors || 0)
        }), { success: 0, errors: 0 });
        const serve = sum("Serve"), receive = sum("Receive"), attack = sum("Attack"), block = sum("Block");
        const sessionsAttended = data.sessions.filter(session => session.date >= range.start && session.date <= range.end &&
          (activeRole() === "player" ? session.attendance && session.attendance[playerId] === "Hadir" : session.attendance && session.attendance[playerId] === "Hadir")).length;
        const percent = result => result.success + result.errors ? Math.round(result.success / (result.success + result.errors) * 100) : 0;
        return {
          serveSuccess: serve.success,
          serveErrors: serve.errors,
          receiveAverage: percent(receive),
          attackEfficiency: percent(attack),
          blockEffective: block.success,
          practicePerWeek: Math.round(sessionsAttended / range.weeks * 10) / 10
        };
      }
      function attendanceReachCorrelation() {
        const paired = data.players.map(p => {
          const history = (p.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
          const hasAttendance = data.sessions.some(s => s.attendance && s.attendance[p.id]);
          if (!hasAttendance || history.length < 2) return null;
          return { attendance: attendanceRate(p.id), reachChange: Number(history[history.length - 1].spikeReach) - Number(history[history.length - 2].spikeReach) };
        }).filter(Boolean);
        if (paired.length < 3) return { count: paired.length, value: null };
        const avgX = paired.reduce((sum, item) => sum + item.attendance, 0) / paired.length;
        const avgY = paired.reduce((sum, item) => sum + item.reachChange, 0) / paired.length;
        const numerator = paired.reduce((sum, item) => sum + (item.attendance - avgX) * (item.reachChange - avgY), 0);
        const denomX = paired.reduce((sum, item) => sum + Math.pow(item.attendance - avgX, 2), 0);
        const denomY = paired.reduce((sum, item) => sum + Math.pow(item.reachChange - avgY, 2), 0);
        return { count: paired.length, value: denomX && denomY ? numerator / Math.sqrt(denomX * denomY) : null };
      }
      function syncRoleOptions() {
        const roleLabel = roles[activeRole()];
        $("#top-role").textContent = roleLabel;
        $("#sidebar-role").textContent = roleLabel;
        $("#sidebar-user").textContent = signedInUser ? signedInUser.name : roleLabel;
      }
      function renderNav() {
        const nav = $("#nav"), bottomNav = $("#bottom-nav"), allowed = visiblePages();
        if (!allowed.some(p => p.id === currentPage)) currentPage = allowed.length ? allowed[0].id : "dashboard";
        const highlight = data.highlights[activeRole()];
        nav.innerHTML = allowed.length ? allowed.map(p => `<button class="nav-btn ${currentPage === p.id ? "active" : ""}" data-page="${p.id}"><span class="nav-icon">${p.icon}</span><span>${esc(p.label)}</span>${highlight === p.id ? '<span class="nav-pin">★</span>' : ""}</button>`).join("") : '<div class="empty">Belum ada menu yang diizinkan.</div>';
        nav.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { currentPage = button.dataset.page; $("#sidebar").classList.remove("open"); render(); }));
        const bottomIds = (data.bottomNav && data.bottomNav[activeRole()] || []).filter(id => allowed.some(page => page.id === id)).slice(0, 5);
        const bottomHighlight = data.bottomHighlights && data.bottomHighlights[activeRole()];
        bottomNav.innerHTML = bottomIds.map(id => {
          const page = allowed.find(item => item.id === id);
          return `<button class="bottom-nav-btn ${currentPage === id ? "active" : ""} ${bottomHighlight === id ? "highlight" : ""}" data-page="${id}" aria-label="${esc(page.label)}"><span class="nav-icon">${page.icon}</span><span>${esc(page.label)}</span></button>`;
        }).join("");
        bottomNav.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { currentPage = button.dataset.page; render(); }));
      }
      function heading(title, subtitle, action) {
        const p = pages.find(x => x.id === currentPage);
        return `<div class="page-head"><div><div class="eyebrow">${esc(p ? p.label : "VolleyDesk")}</div><h1>${title}</h1><p class="subheading">${subtitle}</p></div>${action || ""}</div>`;
      }
      function metric(label, number, note, icon) {
        return `<div class="card metric"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div><div class="metric-number">${number}</div><div class="metric-note">${note}</div></div>`;
      }
      function eventsUpcoming(limit) {
        return data.events.filter(e => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
      }
      function eventTypeClass(type) { return type === "Turnamen" ? "orange" : type === "Sparring" ? "blue" : type === "Istirahat" ? "" : ""; }
      function eventRow(event) {
        const d = dateObj(event.date);
        const details = [event.time, event.location].filter(Boolean).map(esc).join(" · ");
        return `<div class="event-row"><div class="date-tile"><strong>${d.getDate()}</strong><span>${shortMonth(event.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(event.title)}</div><div class="event-meta">${details || formatDate(event.date)}${event.notes ? ` · ${esc(event.notes)}` : ""}</div></div><span class="tag ${eventTypeClass(event.type)}">${esc(event.type)}</span></div>`;
      }
      function chartSvg() {
        const points = data.sessions.slice(0, 6).reverse().map(s => {
          const att = Object.values(s.attendance || {});
          return att.length ? Math.round(att.filter(x => x === "Hadir").length / att.length * 100) : 0;
        });
        while (points.length < 6) points.unshift(0);
        const xs = points.map((_, i) => 38 + i * 77);
        const ys = points.map(v => 154 - v * 1.2);
        const path = xs.map((x, i) => `${i ? "L" : "M"}${x},${ys[i]}`).join(" ");
        const labels = data.sessions.slice(0, 6).reverse().map(s => shortMonth(s.date));
        while (labels.length < 6) labels.unshift("—");
        return `<svg viewBox="0 0 430 185" role="img" aria-label="Grafik tingkat kehadiran per sesi"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--blue)" stop-opacity=".22"/><stop offset="1" stop-color="var(--blue)" stop-opacity="0"/></linearGradient></defs>
          ${[35, 75, 115, 155].map(y => `<line class="chart-grid" x1="28" y1="${y}" x2="420" y2="${y}"/>`).join("")}
          <text class="chart-label" x="0" y="38">100%</text><text class="chart-label" x="8" y="78">67%</text><text class="chart-label" x="8" y="118">33%</text><text class="chart-label" x="17" y="158">0%</text>
          <path class="chart-area" d="${path} L${xs[xs.length - 1]},155 L${xs[0]},155 Z"/><path class="chart-line" d="${path}"/>
          ${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="4" fill="var(--surface)" stroke="var(--blue)" stroke-width="2"/><text class="chart-label" x="${x - 9}" y="177">${esc(labels[i] || "")}</text>`).join("")}
        </svg>`;
      }
      function dashboardPage() {
        if (activeRole() === "player") return playerDashboardPage();
        const rates = data.players.map(p => attendanceRate(p.id));
        const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
        const upcoming = eventsUpcoming(3);
        const nextSession = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
        const topPlayers = data.players.slice().sort((a, b) => attendanceRate(b.id) - attendanceRate(a.id)).slice(0, 4);
        return `${heading("Selamat datang di VolleyDesk", "Pantau perkembangan tim dan siapkan sesi latihan berikutnya.", activeRole() === "coach" ? '<button class="button" data-action="new-session">＋ Catat sesi</button>' : "")}
          <div class="grid metrics">
            ${metric("Pemain aktif", data.players.length, '<span class="positive">●</span> Terdaftar di tim', "♟")}
            ${metric("Kehadiran rata-rata", avg + "%", `<span class="positive">●</span> ${data.sessions.length} sesi tercatat`, "✓")}
            ${metric("Sesi latihan", data.sessions.length, "Pertemuan terdokumentasi", "↗")}
            ${metric("Agenda mendatang", eventsUpcoming(20).length, "Latihan, sparring & turnamen", "▣")}
          </div>
          <div class="grid dashboard-grid">
            <section class="card"><div class="card-head"><div><h2 class="card-title">Kedisiplinan tim</h2><p class="card-sub">Persentase hadir pada setiap sesi latihan</p></div><span class="tag blue">Rata-rata ${avg}%</span></div><div class="chart-wrap">${chartSvg()}</div></section>
            <section class="card"><div class="card-head"><div><h2 class="card-title">Agenda berikutnya</h2><p class="card-sub">Pengingat kegiatan tim</p></div><button class="button secondary small" data-page="schedule">Lihat semua</button></div><div class="event-list">${upcoming.length ? upcoming.map(eventRow).join("") : '<div class="empty">Belum ada agenda mendatang.</div>'}</div></section>
          </div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Ringkasan pemain</h2><p class="card-sub">Kehadiran dan jangkauan spike terakhir</p></div><button class="button secondary small" data-page="players">Data pemain</button></div>
            <div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Kelas</th><th>Posisi</th><th>Kehadiran</th><th>Spike reach</th></tr></thead><tbody>
              ${topPlayers.map(p => `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">#${esc(p.number)}</span></span></div></td><td>${esc(p.className)}</td><td>${esc(p.position)}</td><td><span class="progress"><i style="width:${attendanceRate(p.id)}%"></i></span>${attendanceRate(p.id)}%</td><td>${esc(p.spikeReach)} cm</td></tr>`).join("")}
            </tbody></table></div></section>
          ${nextSession ? `<div class="privacy-note">Sesi terakhir: <strong>${esc(nextSession.title)}</strong> · ${formatDate(nextSession.date)}. Data kehadiran dan progres digunakan sebagai indikator pembinaan, bukan diagnosis medis.</div>` : ""}`;
      }
      function playerDashboardPage() {
        const player = data.players[0];
        if (!player) return `${heading("Progres saya", "Data pemain belum tersedia.", "")}<div class="card empty">Hubungi pelatih untuk menghubungkan akun ini ke biodata pemain.</div>`;
        const sessions = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
        const recentEvaluation = sessions.map(session => session.evaluations && session.evaluations[player.id]).find(Boolean);
        return `${heading("Progres saya", "Pantau perkembangan latihan dan performa pribadi.", "")}
          <div class="grid metrics">${metric("Kehadiran", attendanceRate(player.id) + "%", `${data.sessions.length} sesi tercatat`, "✓")}${metric("Spike reach", `${player.spikeReach} cm`, "Pengukuran terbaru", "↗")}${metric("Efisiensi serangan", skillEfficiency(player.id, "Attack") == null ? "—" : `${skillEfficiency(player.id, "Attack")}%`, "Dari statistik pertandingan", "◎")}${metric("Nomor punggung", `#${esc(player.number)}`, esc(player.position), "♟")}</div>
          <div class="grid dashboard-grid"><section class="card side-note"><h2 class="card-title">Profil atlet</h2><p class="card-sub">${esc(player.name)} · ${esc(player.className)}</p><div class="switch-row"><span>Tinggi / berat</span><strong>${esc(player.height)} cm · ${esc(player.weight)} kg</strong></div><div class="switch-row"><span>Jangkauan spike / block</span><strong>${esc(player.spikeReach)} / ${esc(player.blockReach)} cm</strong></div><div class="note-item"><div class="note-title">Catatan pelatih terbaru</div><div class="note-copy">${esc(recentEvaluation || "Belum ada evaluasi individu.")}</div></div></section>
          <section class="card"><div class="card-head"><div><h2 class="card-title">Agenda tim</h2><p class="card-sub">Kegiatan yang akan datang</p></div><button class="button secondary small" data-page="schedule">Kalender</button></div><div class="event-list">${eventsUpcoming(4).map(eventRow).join("") || '<div class="empty">Belum ada agenda.</div>'}</div></section></div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Riwayat latihan</h2><p class="card-sub">Kehadiran dan catatan dari pelatih</p></div></div><div class="event-list">${sessions.map(session => `<div class="event-row"><div class="date-tile"><strong>${dateObj(session.date).getDate()}</strong><span>${shortMonth(session.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(session.title)}</div><div class="event-meta">${session.attendance && session.attendance[player.id] ? esc(session.attendance[player.id]) : "Belum dicatat"}${session.evaluations && session.evaluations[player.id] ? ` · ${esc(session.evaluations[player.id])}` : ""}</div></div></div>`).join("") || '<div class="empty">Belum ada sesi latihan.</div>'}</div></section>`;
      }
      function playerRows(players) {
        return players.map(p => `<tr><td><input class="player-select" type="checkbox" data-select-player="${p.id}" ${selectedPlayerIds.has(Number(p.id)) ? "checked" : ""} aria-label="Pilih ${esc(p.name)}"></td><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">#${esc(p.number)}</span></span></div></td><td>${esc(p.position)}</td><td>${esc(p.className)}</td><td>${esc(p.height)} cm</td><td>${esc(p.weight)} kg</td><td>${esc(p.spikeReach)} / ${esc(p.blockReach)} cm</td><td>${attendanceRate(p.id)}%</td><td><button class="button secondary small" data-profile="${p.id}">Profil</button></td></tr>`).join("");
      }
      function playersPage() {
        const filtered = data.players.filter(p => (p.name + " " + p.position + " " + p.className).toLowerCase().includes(searchTerm.toLowerCase()));
        return `${heading("Biodata pemain", "Kelola profil, posisi, dan perkembangan antropometri setiap atlet.", '<button class="button" data-action="add-player">＋ Tambah pemain</button>')}
          <section class="card"><div class="toolbar player-toolbar"><div><strong style="font-size:13px">Daftar skuad</strong><span class="card-sub" style="margin-left:8px">${data.players.length} pemain</span></div><input class="search" id="player-search" placeholder="Cari nama, posisi, kelas..." value="${esc(searchTerm)}"><div class="toolbar-actions"><button class="button secondary small" data-action="player-template">Unduh template Excel</button><button class="button secondary small" data-action="player-import">Impor Excel / CSV</button><input id="player-import-file" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" hidden><button class="button orange small" data-action="delete-selected" ${selectedPlayerIds.size ? "" : "disabled"}>Hapus terpilih (${selectedPlayerIds.size})</button></div></div>
          <div class="table-wrap"><table><thead><tr><th><input type="checkbox" id="select-all-players" ${filtered.length && filtered.every(p => selectedPlayerIds.has(Number(p.id))) ? "checked" : ""} aria-label="Pilih semua pemain yang ditampilkan"></th><th>Pemain</th><th>Posisi</th><th>Kelas</th><th>Tinggi</th><th>Berat</th><th>Spike / block</th><th>Kehadiran</th><th>Profil</th></tr></thead><tbody>${filtered.length ? playerRows(filtered) : '<tr><td colspan="9" class="empty">Pemain tidak ditemukan.</td></tr>'}</tbody></table></div></section>
          <p class="privacy-note">Template Excel (.xlsx) dan CSV menggunakan kolom: Nama, Posisi, Nomor Punggung, Kelas, Tinggi, Berat, Spike Reach, Block Reach.</p>
          <p class="privacy-note">Riwayat pengukuran disimpan saat profil diperbarui. Pertimbangkan usia, tahap pertumbuhan, dan teknik pengukuran yang konsisten saat membandingkan antropometri.</p>`;
      }
      function sessionOptions() {
        return data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).map(s => `<option value="${s.id}" ${Number(s.id) === Number(selectedSessionId) ? "selected" : ""}>${esc(s.title)} · ${formatDate(s.date)}</option>`).join("");
      }
      function attendancePage() {
        const session = data.sessions.find(s => Number(s.id) === Number(selectedSessionId));
        if (session && !pendingAttendance[session.id]) pendingAttendance[session.id] = Object.assign({}, session.attendance || {});
        const present = session ? Object.values(pendingAttendance[session.id] || {}).filter(s => s === "Hadir").length : 0;
        return `${heading("Kehadiran latihan", "Catat status setiap pemain dan pantau konsistensi partisipasi.", '<button class="button secondary" data-action="new-session">＋ Sesi baru</button>')}
          <div class="grid section-grid"><section class="card">
            <div class="attendance-head"><div><div class="card-title">Daftar absensi</div><div class="card-sub">${session ? esc(session.title) + " · " + formatDate(session.date) : "Belum ada sesi"}</div></div><div class="inline-form"><select class="select-mini" id="session-select">${sessionOptions()}</select><span class="tag">${present}/${data.players.length} hadir</span></div></div>
            ${session ? data.players.map(p => { const status = (pendingAttendance[session.id] || {})[p.id] || ""; return `<div class="attendance-row"><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">${esc(p.position)} · #${esc(p.number)}</span></span></div><div>${!status ? '<span class="card-sub" style="margin-right:8px">Belum dicatat</span>' : ""}<span class="status-group">${["Hadir", "Izin", "Sakit", "Alpa"].map(s => `<button class="status-btn ${status === s ? "selected" : ""}" data-attendance="${p.id}" data-status="${s}">${s}</button>`).join("")}</span></div></div>`; }).join("") : '<div class="empty">Buat sesi untuk mulai mencatat absensi.</div>'}
            ${session ? '<div style="padding:14px 18px;text-align:right"><button class="button" data-action="save-attendance">Simpan absensi</button></div>' : ""}
          </section>
          <aside class="card side-note"><h2 class="card-title">Ringkasan disiplin</h2><p class="card-sub">Akumulasi dari sesi latihan tersimpan</p><div style="font-size:32px;font-weight:800;margin:18px 0 2px">${allAttendanceRate()}%</div><div class="card-sub">Kehadiran rata-rata tim</div>
            <div class="note-item" style="margin-top:12px"><div class="note-title">Kehadiran ↔ progres spike reach</div><div class="note-copy">${(() => { const correlation = attendanceReachCorrelation(); return correlation.value === null ? `Data belum cukup (perlu 3 pemain; tersedia ${correlation.count}).` : `Korelasi Pearson r = ${correlation.value.toFixed(2)} dari ${correlation.count} pemain.`; })()} Hubungan ini indikatif, bukan bukti sebab-akibat. Bandingkan juga efisiensi teknik pada rekomendasi.</div></div>
            <div class="note-item"><div class="note-title">Riwayat sesi</div><div class="note-copy">${data.sessions.length} sesi telah dicatat untuk ${data.players.length} pemain.</div></div>
          </aside></div>`;
      }
      function schedulePage() {
        const events = data.events.slice().sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        const canEdit = ["admin", "coach"].includes(activeRole());
        return `${heading("Kalender kegiatan", "Catat latihan pribadi, latihan tim, les, dan pertandingan.", canEdit ? '<button class="button" data-action="add-event">＋ Tambah catatan</button>' : "")}
          <section class="card"><div class="toolbar"><div><strong style="font-size:13px">Agenda mendatang</strong><span class="card-sub" style="margin-left:8px">${events.length} catatan</span></div>${canEdit ? '<span class="tag blue">Lokasi opsional</span>' : ""}</div>
          <div class="event-list">${events.length ? events.map(e => `<div class="event-row"><div class="date-tile"><strong>${dateObj(e.date).getDate()}</strong><span>${shortMonth(e.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(e.title)}</div><div class="event-meta">${formatDate(e.date)}${e.time ? ` · ${esc(e.time)}` : ""}${e.location ? ` · ${esc(e.location)}` : ""}${e.notes ? ` · ${esc(e.notes)}` : ""}</div></div><span class="tag ${eventTypeClass(e.type)}">${esc(e.type)}</span>${canEdit ? `<button class="close-x" title="Hapus catatan" data-delete-event="${e.id}">×</button>` : ""}</div>`).join("") : '<div class="empty">Belum ada catatan kalender.</div>'}</div></section>`;
      }
      function trainingPage() {
        const sorted = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
        return `${heading("Log latihan", "Dokumentasikan materi, fokus sesi, dan evaluasi perkembangan atlet.", '<button class="button" data-action="new-session">＋ Catat sesi</button>')}
          <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(265px,1fr));align-items:start">${sorted.length ? sorted.map(s => `<article class="card side-note"><div style="display:flex;justify-content:space-between;align-items:center"><span class="tag blue">${formatDate(s.date)}</span><button class="close-x" data-delete-session="${s.id}" title="Hapus sesi">×</button></div><h2 class="card-title" style="margin-top:13px">${esc(s.title)}</h2><div class="card-sub">${Object.values(s.attendance || {}).filter(x => x === "Hadir").length}/${data.players.length} pemain hadir</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin:13px 0">${(s.drills || []).map(d => `<span class="tag">${esc(d)}</span>`).join("") || '<span class="card-sub">Belum ada materi tercatat</span>'}</div><div class="note-item"><div class="note-title">Evaluasi sesi</div><div class="note-copy">${esc(s.notes || "Belum ada catatan evaluasi.")}</div></div>${Object.entries(s.evaluations || {}).filter(([, text]) => text).map(([id, text]) => { const p = playerById(id); return p ? `<div class="note-item"><div class="note-title">${esc(p.name)}</div><div class="note-copy">${esc(text)}</div></div>` : ""; }).join("")}</article>`).join("") : '<div class="card empty">Belum ada sesi latihan. Catat sesi pertama.</div>'}</div>
          <p class="privacy-note">Evaluasi individu dapat ditambahkan dari profil pemain. Catatan sesi ini tersimpan di perangkat yang sedang digunakan.</p>`;
      }
      function matchesPage() {
        const match = data.matches.find(m => Number(m.id) === Number(selectedMatchId));
        const playerGroups = match ? data.players.map(p => {
          const stats = (match.stats || []).filter(s => Number(s.playerId) === Number(p.id));
          if (!stats.length) return "";
          return stats.map(s => {
            const attempts = Number(s.success) + Number(s.errors);
            return `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span>${esc(p.name)}</div></td><td>${esc(s.skill)}</td><td>${esc(s.success)}</td><td>${esc(s.errors)}</td><td><span class="progress"><i style="width:${attempts ? Math.round(s.success / attempts * 100) : 0}%"></i></span>${attempts ? Math.round(s.success / attempts * 100) : 0}%</td><td><button class="close-x" data-delete-stat="${match.id}:${p.id}:${esc(s.skill)}">×</button></td></tr>`;
          }).join("");
        }).join("") : "";
        return `${heading("Statistik pertandingan", "Rekap aksi sukses dan error untuk evaluasi performa laga.", '<button class="button" data-action="add-match">＋ Pertandingan</button>')}
          <section class="card"><div class="attendance-head"><div><div class="card-title">Papan statistik</div><div class="card-sub">${match ? esc(match.opponent || match.name) + " · " + formatDate(match.date) : "Pilih atau tambahkan pertandingan"}</div></div><div class="inline-form"><select class="select-mini" id="match-select">${data.matches.map(m => `<option value="${m.id}" ${match && Number(match.id) === Number(m.id) ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select><button class="button small" data-action="add-stat" ${match ? "" : "disabled"}>＋ Input aksi</button></div></div>
          ${match ? `<div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Teknik</th><th>Sukses</th><th>Error</th><th>Efisiensi</th><th></th></tr></thead><tbody>${playerGroups || '<tr><td colspan="6" class="empty">Belum ada statistik untuk laga ini.</td></tr>'}</tbody></table></div>` : '<div class="empty">Buat pertandingan untuk mulai mencatat statistik.</div>'}
          </section><div class="privacy-note">Efisiensi dihitung sebagai aksi sukses ÷ (sukses + error). Pencatatan receive, dig, dan set memakai jumlah aksi yang dinilai pelatih.</div>`;
      }
      function liveMatchesPage() {
        const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
        const players = match
          ? data.players.filter(player => !Array.isArray(match.playerIds) || match.playerIds.map(Number).includes(Number(player.id)))
          : [];
        return `${heading("Statistik pertandingan", "Catat aksi sukses dan gagal per pemain secara langsung.", '<button class="button" data-action="add-match">＋ Pertandingan</button>')}
          <section class="card"><div class="attendance-head"><div><div class="card-title">Catat live pertandingan</div><div class="card-sub">${match ? esc(match.opponent || match.name) + " · " + formatDate(match.date) + ` · ${players.length} pemain` : "Pilih atau tambahkan pertandingan"}</div></div><div class="inline-form"><select class="select-mini" id="match-select">${data.matches.map(item => `<option value="${item.id}" ${match && Number(item.id) === Number(match.id) ? "selected" : ""}>${esc(item.name)}</option>`).join("")}</select><button class="button secondary small" data-action="add-stat" ${match ? "" : "disabled"}>＋ Input manual</button></div></div>
          ${match ? `<div class="live-roster">${players.length ? players.map(player => `<article class="card live-player"><div class="player-name"><span class="player-avatar">${initials(player.name)}</span><span>${esc(player.name)}<span class="position">${esc(player.position)} · #${esc(player.number)}</span></span></div><div class="live-skills">${["Block", "Attack", "Serve", "Receive"].map(skill => {
            const stat = (match.stats || []).find(item => Number(item.playerId) === Number(player.id) && item.skill === skill) || { success: 0, errors: 0 };
            const label = skill === "Attack" ? "Serangan" : skill === "Block" ? "Blok" : skill === "Serve" ? "Servis" : "Receive";
            return `<div class="live-skill"><div><strong>${label}</strong><span>${Number(stat.success || 0)} sukses · ${Number(stat.errors || 0)} gagal</span></div><button class="button small live-success" data-live-stat="${player.id}:${skill}:success" aria-label="${skill} sukses ${esc(player.name)}">✓</button><button class="button orange small" data-live-stat="${player.id}:${skill}:errors" aria-label="${skill} gagal ${esc(player.name)}">×</button></div>`;
          }).join("")}</div></article>`).join("") : '<div class="empty">Tambahkan pemain dan pilih roster pertandingan untuk mulai mencatat.</div>'}</div>
          <details class="manual-stats"><summary>Statistik manual yang sudah dicatat</summary>${match.stats && match.stats.length ? `<div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Teknik</th><th>Sukses</th><th>Gagal</th><th></th></tr></thead><tbody>${match.stats.map(stat => { const player = playerById(stat.playerId); return player ? `<tr><td>${esc(player.name)}</td><td>${esc(stat.skill)}</td><td>${Number(stat.success || 0)}</td><td>${Number(stat.errors || 0)}</td><td><button class="close-x" data-delete-stat="${match.id}:${player.id}:${esc(stat.skill)}">×</button></td></tr>` : ""; }).join("")}</tbody></table></div>` : '<div class="empty">Belum ada aksi dicatat.</div>'}</details>` : '<div class="empty">Buat pertandingan untuk mulai mencatat statistik.</div>'}
          </section><p class="privacy-note">Setiap tombol mencatat satu aksi sukses atau gagal. Statistik tersimpan per pemain, pertandingan, dan teknik.</p>`;
      }
      function targetsPage() {
        const player = activeRole() === "player"
          ? data.players[0]
          : playerById(selectedTargetPlayerId) || data.players[0];
        if (!player) return `${heading("Target performa", "Atur sasaran dan pantau hasil latihan.", "")}<div class="card empty">Tambahkan biodata pemain terlebih dahulu.</div>`;
        selectedTargetPlayerId = Number(player.id);
        const period = selectedTargetPeriod;
        const key = `${player.id}:${period}`;
        const saved = data.targets && data.targets[key] || {};
        const current = targetMetrics(player.id, period);
        const metrics = [
          { key: "serveSuccess", label: "Servis sukses", unit: "aksi" },
          { key: "serveErrors", label: "Error servis maksimal", unit: "error" },
          { key: "receiveAverage", label: "Rata-rata receive", unit: "%" },
          { key: "attackEfficiency", label: "Efisiensi serangan", unit: "%" },
          { key: "blockEffective", label: "Blok efektif", unit: "aksi" },
          { key: "practicePerWeek", label: "Latihan per minggu", unit: "sesi/minggu" }
        ];
        const editable = ["admin", "coach"].includes(activeRole());
        const range = targetDateRange(period);
        return `${heading("Target performa", "Bandingkan target dan capaian berdasarkan statistik pertandingan serta kehadiran latihan.", "")}
          <section class="card"><div class="toolbar target-toolbar"><div><strong style="font-size:13px">${activeRole() === "player" ? "Target saya" : "Pemain"}</strong>${activeRole() === "player" ? `<span class="card-sub">${esc(player.name)} · #${esc(player.number)}</span>` : `<select class="select-mini" id="target-player">${data.players.map(item => `<option value="${item.id}" ${Number(item.id) === Number(player.id) ? "selected" : ""}>${esc(item.name)} · #${esc(item.number)}</option>`).join("")}</select>`}</div><select class="select-mini" id="target-period" aria-label="Periode target"><option value="week" ${period === "week" ? "selected" : ""}>Minggu ini</option><option value="month" ${period === "month" ? "selected" : ""}>Bulan ini</option></select></div>
          <div class="target-grid">${metrics.map(item => `<article class="card target-card"><div class="card-sub">${item.label}</div><div class="target-value">${current[item.key]}<span>${item.unit}</span></div><div class="target-input"><label for="target-${item.key}">Target ${item.unit}</label><input id="target-${item.key}" type="number" min="0" step="${item.key === "practicePerWeek" ? "0.1" : "1"}" data-target-value="${item.key}" value="${saved[item.key] == null ? "" : esc(saved[item.key])}" placeholder="Belum diatur" ${editable ? "" : "disabled"}></div></article>`).join("")}</div>
          ${editable ? '<div class="target-actions"><button class="button" data-action="save-target">Simpan target</button></div>' : '<p class="privacy-note">Target ditetapkan oleh pelatih. Perbarui data dengan pelatih jika target perlu disesuaikan.</p>'}
          <p class="privacy-note">Periode data ${formatDate(range.start)}–${formatDate(range.end)}. Receive dan efisiensi serangan dihitung sebagai aksi sukses ÷ total aksi. Latihan per minggu pada tampilan bulanan adalah rata-rata sesi hadir per minggu.</p></section>`;
      }
      function recommendationItems() {
        const items = [];
        data.players.forEach(p => {
          const attendance = attendanceRate(p.id);
          const attack = skillEfficiency(p.id, "Attack");
          const serve = skillEfficiency(p.id, "Serve");
          const receive = skillEfficiency(p.id, "Receive");
          if (data.sessions.length && attendance < 75) items.push({ player: p.name, category: "Konsistensi", title: "Perkuat konsistensi kehadiran", body: `Kehadiran tercatat ${attendance}%. Lakukan check-in dan komunikasi kendala; materi dapat diringkas saat pemain kembali.`, type: "orange" });
          if (attack !== null && attack < 45) items.push({ player: p.name, category: "Teknik", title: "Drilling spike dan footwork", body: `Efisiensi attack ${attack}%. Fokus pada timing approach, kontak bola tinggi, dan target zona secara bertahap.`, type: "blue" });
          if (serve !== null && serve < 60) items.push({ player: p.name, category: "Teknik", title: "Serve target bertekanan rendah", body: `Efisiensi serve ${serve}%. Bangun rutinitas toss dan akurasi zona sebelum menambah tekanan.`, type: "blue" });
          if (receive !== null && receive < 65) items.push({ player: p.name, category: "Teknik", title: "Passing platform & komunikasi", body: `Efisiensi receive ${receive}%. Latih posisi siap, sudut platform, dan prioritas bola bersama.`, type: "blue" });
          const previous = p.history && p.history.length > 1 ? p.history[p.history.length - 2] : null;
          const current = p.history && p.history.length ? p.history[p.history.length - 1] : null;
          if (previous && current && Number(current.spikeReach) <= Number(previous.spikeReach)) items.push({ player: p.name, category: "Fisik", title: "Pantau progres daya ledak", body: "Spike reach belum meningkat pada pengukuran terakhir. Periksa konsistensi protokol pengukuran dan prioritaskan landing mechanics serta latihan kekuatan yang sesuai usia.", type: "orange" });
        });
        return items;
      }
      function recommendationsPage() {
        const items = recommendationItems();
        return `${heading("Rekomendasi latihan", "Saran berbasis kehadiran, efisiensi teknik, dan tren antropometri.", '<button class="button secondary" data-action="refresh-recommendations">↻ Perbarui analisis</button>')}
          <div class="card"><div class="card-head"><div><h2 class="card-title">Fokus pembinaan berikutnya</h2><p class="card-sub">${items.length} saran berdasarkan data yang sudah tercatat</p></div><span class="tag blue">Indikatif</span></div><div class="recommend-list">${items.length ? items.map(item => `<div class="event-row"><div class="metric-icon">${item.category === "Fisik" ? "↗" : item.category === "Konsistensi" ? "✓" : "◎"}</div><div style="min-width:0;flex:1"><div class="event-name">${esc(item.title)} <span class="tag ${item.type}">${esc(item.category)}</span></div><div class="event-meta" style="margin-top:4px"><strong>${esc(item.player)}</strong> · ${esc(item.body)}</div></div></div>`).join("") : '<div class="empty">Belum ada sinyal khusus. Catat data kehadiran dan statistik laga untuk mendapat rekomendasi yang lebih relevan.</div>'}</div></div>
          <div class="privacy-note">Rekomendasi merupakan panduan pembinaan sederhana, bukan diagnosis medis atau penilaian otomatis bakat. Sesuaikan beban latihan dengan usia, pengalaman, kondisi kesehatan, serta pengawasan pelatih.</div>`;
      }
      function reportsPage() {
        const statusCounts = ["Hadir", "Izin", "Sakit", "Alpa"].map(status => ({ status, count: data.sessions.reduce((n, s) => n + Object.values(s.attendance || {}).filter(x => x === status).length, 0) }));
        return `${heading("Laporan & ekspor", "Ringkasan progres siswa dan rekap kedisiplinan untuk evaluasi sekolah.", '<div style="display:flex;gap:7px;flex-wrap:wrap"><button class="button secondary" data-action="export-grades">↓ Nilai rapor</button><button class="button" data-action="export-report">↓ Ekspor progres</button></div>')}
          <div class="grid metrics">${metric("Kehadiran", allAttendanceRate() + "%", "Dari seluruh catatan absensi", "✓")}${metric("Total pemain", data.players.length, "Pemain terdaftar", "♟")}${metric("Sesi latihan", data.sessions.length, "Log pertemuan", "↗")}${metric("Pertandingan", data.matches.length, "Laga dengan statistik", "◎")}</div>
          <div class="grid dashboard-grid"><section class="card"><div class="card-head"><div><h2 class="card-title">Progres pemain</h2><p class="card-sub">Atur predikat ekskul untuk rekap rapor sekolah</p></div></div><div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Kelas / posisi</th><th>Kehadiran</th><th>Spike reach</th><th>Attack eff.</th><th>Predikat rapor</th></tr></thead><tbody>${data.players.map(p => `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span>${esc(p.name)}</div></td><td>${esc(p.className)} · ${esc(p.position)}</td><td>${attendanceRate(p.id)}%</td><td>${p.spikeReach} cm</td><td>${skillEfficiency(p.id, "Attack") === null ? "—" : skillEfficiency(p.id, "Attack") + "%"}</td><td><select class="select-mini" data-grade="${p.id}" ${["admin", "coach"].includes(activeRole()) ? "" : "disabled"}><option value="" ${!p.grade ? "selected" : ""}>Belum dinilai</option>${["A", "B", "C", "Perlu pembinaan"].map(g => `<option value="${g}" ${p.grade === g ? "selected" : ""}>${g}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div></section>
          <section class="card side-note"><h2 class="card-title">Rekap absensi</h2><p class="card-sub">Jumlah status yang tercatat</p>${statusCounts.map(s => `<div class="switch-row"><span class="note-title">${s.status}</span><span class="tag ${s.status === "Hadir" ? "" : s.status === "Alpa" ? "red" : "blue"}">${s.count}</span></div>`).join("")}<button class="button secondary small" style="margin-top:14px" data-action="export-attendance">Ekspor kehadiran</button></section></div>
          <p class="privacy-note">Berkas CSV dapat dibuka di aplikasi spreadsheet. Nama, kelas, dan catatan siswa merupakan data pribadi—bagikan laporan hanya kepada pihak yang berwenang.</p>`;
      }
      function settingsPage() {
        const role = settingsRoleKey;
        const allowed = data.menuVisibility[role] || [];
        const bottomAllowed = (data.bottomNav && data.bottomNav[role] || []).filter(id => allowed.includes(id));
        const backup = backupSettings || { enabled: false, time: "23:00", timezone: "Asia/Jakarta", telegramConfigured: false };
        const backupStatus = backup.lastRunAt
          ? `${esc(backup.lastMessage || "")} · ${esc(new Date(backup.lastRunAt + (backup.lastRunAt.includes("Z") ? "" : "Z")).toLocaleString("id-ID"))}`
          : "Belum ada pengiriman backup.";
        return `${heading("Pengaturan akses", "Atur akses menu, akun pengguna, dan backup data.", '<button class="button secondary" data-action="add-user">＋ Tambah akun</button>')}
          <div class="grid dashboard-grid"><section class="card"><div class="card-head"><div><h2 class="card-title">Konfigurasi menu dinamis</h2><p class="card-sub">Atur menu samping dan maksimal lima menu navigasi bawah per role.</p></div><select class="select-mini" id="settings-role">${Object.entries(roles).map(([id, label]) => `<option value="${id}" ${role === id ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></div>
          <div style="padding:0 19px 18px">${pages.map(p => `<div class="switch-row"><div><div class="note-title">${esc(p.label)}</div><div class="note-copy">Atur visibilitas menu untuk ${esc(roles[role])}</div></div><input class="switch menu-switch" type="checkbox" data-menu="${p.id}" ${allowed.includes(p.id) ? "checked" : ""} ${p.roles.includes(role) ? "" : "disabled"} aria-label="Izinkan menu ${esc(p.label)}"></div>`).join("")}
          <div class="field" style="margin-top:15px"><label for="highlight-select">Menu sorotan / pin role ini</label><select id="highlight-select">${pages.filter(p => allowed.includes(p.id) && p.roles.includes(role)).map(p => `<option value="${p.id}" ${data.highlights[role] === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></div>
          <h3 class="card-title" style="margin:22px 0 4px">Navigasi bawah HP · maksimal 5 menu</h3><p class="card-sub">Pilih menu yang tampil dan atur menu sorotannya.</p>
          ${pages.filter(p => p.roles.includes(role) && allowed.includes(p.id)).map(p => `<label class="switch-row bottom-menu-option"><span>${esc(p.label)}</span><input class="switch bottom-menu-switch" type="checkbox" data-bottom-menu="${p.id}" ${bottomAllowed.includes(p.id) ? "checked" : ""} aria-label="Tampilkan ${esc(p.label)} di navigasi bawah"></label>`).join("")}
          <div class="field" style="margin-top:12px"><label for="bottom-highlight-select">Menu highlight navigasi bawah</label><select id="bottom-highlight-select">${pages.filter(p => bottomAllowed.includes(p.id)).map(p => `<option value="${p.id}" ${data.bottomHighlights && data.bottomHighlights[role] === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></div></div></section>
          <section class="card side-note"><h2 class="card-title">Akun pengguna</h2><p class="card-sub">Akun tersimpan di database VolleyDesk</p>${serverUsers.map(u => `<div class="note-item"><div class="account-row"><div><div class="note-title">${esc(u.name)}</div><div class="note-copy">${esc(u.email)}${u.playerId && playerById(u.playerId) ? ` · ${esc(playerById(u.playerId).name)}` : ""}</div><span class="tag blue" style="margin-top:6px">${esc(roles[u.role] || u.role)}</span></div><button class="close-x" data-delete-user="${u.id}" aria-label="Hapus akun ${esc(u.name)}" ${Number(u.id) === Number(signedInUser.id) ? "disabled" : ""}>×</button></div></div>`).join("")}
          <div class="privacy-note">Akses akun diverifikasi oleh server. Berikan akun hanya kepada pengguna yang berwenang.</div></section></div>
          <section class="card wide-card"><div class="card-head"><div><h2 class="card-title">Backup dan pemulihan data</h2><p class="card-sub">Database SQLite disimpan di volume persisten Railway.</p></div><span class="tag ${backup.telegramConfigured ? "blue" : "orange"}">${backup.telegramConfigured ? "Telegram siap" : "Telegram belum dikonfigurasi"}</span></div>
            <div class="form-grid" style="padding:0 19px 18px">
              <div class="field"><label for="telegram-bot-token">Telegram Bot Token</label><input id="telegram-bot-token" type="password" autocomplete="new-password" placeholder="${backup.botTokenSaved ? "Token tersimpan — isi hanya untuk mengganti" : "123456789:token-bot"}"></div>
              <div class="field"><label for="telegram-chat-id">Telegram Chat ID</label><input id="telegram-chat-id" type="text" inputmode="text" autocomplete="off" placeholder="${backup.chatIdSaved ? "Chat ID tersimpan — isi hanya untuk mengganti" : "Contoh: 123456789 atau -100..."}"></div>
              <div class="field"><label class="switch-row" for="backup-enabled"><span>Backup harian Telegram</span><input id="backup-enabled" class="switch" type="checkbox" ${backup.enabled ? "checked" : ""}></label></div>
              <div class="field"><label for="backup-time">Waktu kirim (${esc(backup.timezone || "Asia/Jakarta")})</label><input id="backup-time" type="time" value="${esc(backup.time || "23:00")}" required></div>
              <div class="field full"><label class="switch-row" for="clear-telegram-credentials"><span>Hapus token/chat ID yang tersimpan di aplikasi</span><input id="clear-telegram-credentials" class="switch" type="checkbox"></label><p class="card-sub">Token tidak akan ditampilkan kembali dan disimpan khusus untuk admin. Isi kedua field untuk memasang atau mengganti kredensial. Jika variabel secret Railway sudah dipasang, nilai tersebut tetap digunakan.</p></div>
              <div class="field full" style="display:flex;gap:8px;flex-wrap:wrap"><button class="button" data-action="save-backup-settings">Simpan jadwal</button><button class="button secondary" data-action="backup-now" ${backup.telegramConfigured ? "" : "disabled"}>Kirim backup sekarang</button><button class="button secondary" data-action="download-backup">Unduh backup JSON</button></div>
              <div class="field"><label for="backup-restore-file">Pulihkan dari backup JSON</label><input id="backup-restore-file" type="file" accept=".json,application/json"></div>
              <div class="field" style="display:flex;align-items:end"><button class="button secondary" data-action="restore-backup">Pulihkan data</button></div>
              <div class="field full"><p class="privacy-note">${backupStatus}</p></div>
            </div>
          </section>`;
      }
      function pageContent() {
        switch (currentPage) {
          case "dashboard": return dashboardPage();
          case "players": return playersPage();
          case "attendance": return attendancePage();
          case "schedule": return schedulePage();
          case "training": return trainingPage();
          case "matches": return liveMatchesPage();
          case "recommendations": return recommendationsPage();
          case "reports": return reportsPage();
          case "targets": return targetsPage();
          case "settings": return settingsPage();
          default: return dashboardPage();
        }
      }
      function render() {
        syncRoleOptions(); renderNav();
        const page = pages.find(p => p.id === currentPage);
        $("#crumb-title").textContent = page ? page.label : "Ringkasan";
        $("#content").innerHTML = pageContent();
        document.documentElement.dataset.theme = data.theme || "light";
        $("#theme-toggle").textContent = data.theme === "dark" ? "☀" : "☾";
        $("#theme-toggle").title = data.theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap";
        bindContentEvents();
      }
      function showModal(title, body, onSubmit) {
        const root = $("#modal-root");
        root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${title}</h2><button class="close-x" data-close-modal aria-label="Tutup">×</button></div><div class="modal-body">${body}</div></section></div>`;
        root.querySelector("[data-close-modal]").addEventListener("click", () => root.innerHTML = "");
        root.querySelector(".modal-backdrop").addEventListener("click", e => { if (e.target.classList.contains("modal-backdrop")) root.innerHTML = ""; });
        const form = root.querySelector("form");
        if (form) form.addEventListener("submit", async e => {
          e.preventDefault();
          const submitButton = form.querySelector('button[type="submit"], button:not([type])');
          if (submitButton) submitButton.disabled = true;
          try {
            const result = await onSubmit(new FormData(form));
            if (result !== false) {
              if (!await persist()) {
                if (submitButton) submitButton.disabled = false;
                return;
              }
              root.innerHTML = "";
              render();
            } else if (submitButton) {
              submitButton.disabled = false;
            }
          } catch (error) {
            toast(error.message || "Permintaan gagal.");
            if (submitButton) submitButton.disabled = false;
          }
        });
      }
      function addPlayerModal() {
        showModal("Tambah pemain", `<form><div class="form-grid">
          <div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" placeholder="Nama pemain"></div>
          <div class="field"><label>Posisi</label><select name="position">${["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"].map(p => `<option>${p}</option>`).join("")}</select></div>
          <div class="field"><label>Nomor punggung</label><input name="number" type="number" min="0" max="99" required></div>
          <div class="field"><label>Kelas</label><input name="className" required placeholder="XI IPA 1"></div>
          <div class="field"><label>Tinggi (cm)</label><input name="height" type="number" min="100" max="230" required></div>
          <div class="field"><label>Berat (kg)</label><input name="weight" type="number" min="20" max="180" required></div>
          <div class="field"><label>Spike reach (cm)</label><input name="spikeReach" type="number" min="100" max="350" required></div>
          <div class="field"><label>Block reach (cm)</label><input name="blockReach" type="number" min="100" max="350" required></div>
          </div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan pemain</button></div></form>`, fd => {
          const name = String(fd.get("name") || "").trim();
          if (!name) return false;
          const id = Date.now();
          const p = { id, name, position: fd.get("position"), number: Number(fd.get("number")), className: String(fd.get("className")).trim(), height: Number(fd.get("height")), weight: Number(fd.get("weight")), spikeReach: Number(fd.get("spikeReach")), blockReach: Number(fd.get("blockReach")), history: [{ date: todayISO(), height: Number(fd.get("height")), weight: Number(fd.get("weight")), spikeReach: Number(fd.get("spikeReach")), blockReach: Number(fd.get("blockReach")) }] };
          data.players.push(p); toast("Pemain berhasil ditambahkan.");
        });
        const cancel = $("#modal-root [data-close-modal]");
        if (cancel) cancel.addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function profileModal(id) {
        const p = playerById(id); if (!p) return;
        const history = (p.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
        showModal(esc(p.name) + " · Profil atlet", `<div class="grid metrics" style="grid-template-columns:repeat(2,1fr);margin:0 0 15px;gap:9px">
          ${metric("Tinggi", p.height + " cm", "Pengukuran terbaru", "↕")}${metric("Berat", p.weight + " kg", "Pengukuran terbaru", "⚖")}${metric("Spike reach", p.spikeReach + " cm", "Jangkauan serang", "↗")}${metric("Block reach", p.blockReach + " cm", "Jangkauan blok", "▤")}
          </div><div class="note-item"><div class="note-title">${esc(p.position)} · #${p.number} · ${esc(p.className)}</div><div class="note-copy">Kehadiran ${attendanceRate(p.id)}% · Efisiensi attack ${skillEfficiency(p.id, "Attack") === null ? "belum ada data" : skillEfficiency(p.id, "Attack") + "%"}</div></div>
          <h3 class="card-title" style="margin:15px 0 4px">Riwayat antropometri</h3>${history.map(h => `<div class="switch-row"><span class="note-copy">${formatDate(h.date)}</span><span class="note-title">${h.height} cm · ${h.weight} kg · SR ${h.spikeReach} · BR ${h.blockReach}</span></div>`).join("")}
          <form id="update-profile-form"><div class="form-grid" style="margin-top:15px"><div class="field"><label>Tinggi (cm)</label><input name="height" type="number" value="${p.height}" min="100" max="230" required></div><div class="field"><label>Berat (kg)</label><input name="weight" type="number" value="${p.weight}" min="20" max="180" required></div><div class="field"><label>Spike reach (cm)</label><input name="spikeReach" type="number" value="${p.spikeReach}" min="100" max="350" required></div><div class="field"><label>Block reach (cm)</label><input name="blockReach" type="number" value="${p.blockReach}" min="100" max="350" required></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Tutup</button><button class="button">Simpan pengukuran</button></div></form>`, fd => {
          const record = { date: todayISO(), height: Number(fd.get("height")), weight: Number(fd.get("weight")), spikeReach: Number(fd.get("spikeReach")), blockReach: Number(fd.get("blockReach")) };
          p.height = record.height; p.weight = record.weight; p.spikeReach = record.spikeReach; p.blockReach = record.blockReach;
          p.history = p.history || [];
          if (!p.history.length || JSON.stringify(p.history[p.history.length - 1]) !== JSON.stringify(record)) p.history.push(record);
          toast("Riwayat antropometri diperbarui.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function newSessionModal() {
        showModal("Catat sesi latihan", `<form><div class="form-grid"><div class="field full"><label>Nama sesi</label><input name="title" required maxlength="100" placeholder="Contoh: Latihan teknik & taktik"></div><div class="field"><label>Tanggal</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Materi latihan (pisahkan koma)</label><input name="drills" placeholder="Drilling passing, spike footwork"></div><div class="field full"><label>Catatan progres / evaluasi sesi</label><textarea name="notes" placeholder="Fokus sesi dan evaluasi umum"></textarea></div>${data.players.map(p => `<div class="field full"><label>Evaluasi individu · ${esc(p.name)}</label><input name="eval_${p.id}" maxlength="240" placeholder="Contoh: platform receive stabil, lanjutkan latihan target"></div>`).join("")}</div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan sesi</button></div></form>`, fd => {
          const evaluations = {};
          data.players.forEach(p => { const value = String(fd.get("eval_" + p.id) || "").trim(); if (value) evaluations[p.id] = value; });
          const session = { id: Date.now(), title: String(fd.get("title")).trim(), date: fd.get("date"), drills: String(fd.get("drills") || "").split(",").map(x => x.trim()).filter(Boolean), notes: String(fd.get("notes") || "").trim(), evaluations, attendance: {} };
          if (!session.title) return false;
          data.sessions.unshift(session); selectedSessionId = session.id; pendingAttendance[session.id] = {};
          toast("Sesi latihan berhasil dicatat.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addEventModal() {
        showModal("Tambah catatan kalender", `<form><div class="form-grid"><div class="field full"><label>Agenda</label><input name="title" required maxlength="100" placeholder="Latihan pribadi, les, atau pertandingan"></div><div class="field"><label>Jenis kegiatan</label><select name="type">${["Latihan pribadi", "Latihan tim", "Les", "Pertandingan", "Sparring", "Turnamen", "Istirahat", "Lainnya"].map(x => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>Tanggal</label><input name="date" type="date" required></div><div class="field"><label>Waktu (opsional)</label><input name="time" type="time"></div><div class="field"><label>Tempat (opsional)</label><input name="location" maxlength="120" placeholder="Contoh: GOR Sekolah"></div><div class="field full"><label>Catatan (opsional)</label><textarea name="notes" maxlength="500" placeholder="Detail agenda"></textarea></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan catatan</button></div></form>`, fd => {
          data.events.push({ id: Date.now(), title: String(fd.get("title")).trim(), type: fd.get("type"), date: fd.get("date"), time: fd.get("time"), location: String(fd.get("location") || "").trim(), notes: String(fd.get("notes") || "").trim() });
          toast("Agenda berhasil ditambahkan.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addMatchModal() {
        showModal("Buat pertandingan dan pilih roster", `<form><div class="form-grid"><div class="field full"><label>Nama pertandingan</label><input name="name" required maxlength="100" placeholder="Uji Coba vs ..."></div><div class="field"><label>Lawan / turnamen</label><input name="opponent" maxlength="100" placeholder="Nama sekolah/tim"></div><div class="field"><label>Tanggal</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field full"><label>Pilih pemain yang bertanding</label><div class="roster-pick">${data.players.map(p => `<label class="roster-option"><input type="checkbox" name="roster" value="${p.id}" checked><span>${esc(p.name)} · #${esc(p.number)} · ${esc(p.position)}</span></label>`).join("")}</div></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Mulai pertandingan</button></div></form>`, fd => {
          const playerIds = fd.getAll("roster").map(Number);
          if (!playerIds.length) { toast("Pilih minimal satu pemain untuk pertandingan."); return false; }
          const m = { id: Date.now(), name: String(fd.get("name")).trim(), opponent: String(fd.get("opponent") || "").trim(), date: fd.get("date"), playerIds, stats: [] };
          data.matches.unshift(m); selectedMatchId = m.id; toast("Pertandingan ditambahkan.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addStatModal() {
        const match = data.matches.find(m => Number(m.id) === Number(selectedMatchId)); if (!match) return;
        showModal("Input statistik aksi", `<form><div class="form-grid"><div class="field full"><label>Pemain</label><select name="playerId">${data.players.map(p => `<option value="${p.id}">${esc(p.name)} · ${esc(p.position)}</option>`).join("")}</select></div><div class="field"><label>Teknik</label><select name="skill">${["Attack", "Block", "Serve", "Receive", "Dig", "Set"].map(s => `<option>${s}</option>`).join("")}</select></div><div class="field"><label>Aksi sukses</label><input name="success" type="number" min="0" max="999" value="0" required></div><div class="field"><label>Error</label><input name="errors" type="number" min="0" max="999" value="0" required></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan statistik</button></div></form>`, fd => {
          match.stats.push({ playerId: Number(fd.get("playerId")), skill: fd.get("skill"), success: Number(fd.get("success")), errors: Number(fd.get("errors")) });
          toast("Statistik aksi tersimpan.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function changePasswordModal() {
        showModal("Ubah kata sandi", `<form><div class="form-grid"><div class="field full"><label>Kata sandi saat ini</label><input name="currentPassword" type="password" required autocomplete="current-password"></div><div class="field full"><label>Kata sandi baru (minimal ${MIN_PASSWORD_LENGTH} karakter)</label><input name="newPassword" type="password" required minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div><div class="field full"><label>Ulangi kata sandi baru</label><input name="confirmPassword" type="password" required minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan sandi</button></div></form>`, async fd => {
          const newPassword = String(fd.get("newPassword"));
          if (newPassword.length < MIN_PASSWORD_LENGTH) {
            toast(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
            return false;
          }
          if (newPassword !== String(fd.get("confirmPassword"))) {
            toast("Konfirmasi kata sandi baru tidak sama.");
            return false;
          }
          await api("/api/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword: String(fd.get("currentPassword")), newPassword })
          });
          toast("Kata sandi berhasil diubah.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addUserModal() {
        showModal("Tambah akun pengguna", `<form><div class="form-grid"><div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" autocomplete="name"></div><div class="field full"><label>Email</label><input name="email" type="email" required autocomplete="email"></div><div class="field full"><label>Role</label><select name="role" id="new-user-role">${Object.entries(roles).map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join("")}</select></div><div class="field full" id="new-user-player-field" hidden><label>Hubungkan ke biodata pemain</label><select name="playerId" id="new-user-player">${data.players.map(p => `<option value="${p.id}">${esc(p.name)} · #${esc(p.number)} · ${esc(p.className)}</option>`).join("")}</select></div><div class="field full"><label>Kata sandi sementara (minimal ${MIN_PASSWORD_LENGTH} karakter)</label><input name="password" type="password" required minlength="${MIN_PASSWORD_LENGTH}" autocomplete="new-password"></div></div><p class="privacy-note">Akun pemain hanya dapat melihat progres biodata yang dihubungkan. Bagikan kata sandi sementara melalui kanal aman.</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Buat akun</button></div></form>`, async fd => {
          const email = String(fd.get("email")).trim().toLowerCase();
          const password = String(fd.get("password"));
          const role = String(fd.get("role"));
          if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
          const result = await api("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: String(fd.get("name")).trim(), email, role, password, playerId: role === "player" ? Number(fd.get("playerId")) : null })
          });
          serverUsers.push(result.user);
          toast("Akun pengguna berhasil dibuat.");
        });
        const roleSelect = $("#new-user-role");
        const playerField = $("#new-user-player-field");
        if (roleSelect && playerField) {
          roleSelect.addEventListener("change", () => { playerField.hidden = roleSelect.value !== "player"; });
          playerField.hidden = roleSelect.value !== "player";
        }
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(value => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      function parseCsv(text) {
        const rows = [];
        let row = [], value = "", quoted = false;
        const source = String(text).replace(/^\uFEFF/, "");
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (char === '"' && quoted && source[index + 1] === '"') { value += '"'; index++; }
          else if (char === '"') quoted = !quoted;
          else if (char === "," && !quoted) { row.push(value); value = ""; }
          else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && source[index + 1] === "\n") index++;
            row.push(value); value = "";
            if (row.some(cell => cell.trim())) rows.push(row);
            row = [];
          } else value += char;
        }
        row.push(value);
        if (row.some(cell => cell.trim())) rows.push(row);
        if (quoted) throw new Error("Berkas CSV memiliki tanda kutip yang tidak berpasangan.");
        return rows;
      }
      async function downloadPlayerTemplate() {
        try {
          const response = await fetch("/api/players/template", { credentials: "same-origin" });
          if (!response.ok) {
            let payload = null;
            try { payload = await response.json(); } catch {}
            throw new Error(payload && payload.error ? payload.error : "Unduh template Excel gagal.");
          }
          const url = URL.createObjectURL(await response.blob());
          const link = document.createElement("a");
          link.href = url;
          link.download = "template-import-pemain-volleydesk.xlsx";
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Template Excel berhasil diunduh.");
        } catch (error) { toast(error.message); }
      }
      async function importPlayers(file) {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) throw new Error("Berkas impor maksimal 2 MB.");
        if (file.name.toLowerCase().endsWith(".xlsx") ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          const result = await api("/api/players/import", {
            method: "POST",
            headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            body: file
          });
          const stored = await api("/api/state");
          applyServerState(stored.data);
          selectedPlayerIds.clear();
          render();
          toast(`${result.added} pemain diimpor${result.skipped ? `, ${result.skipped} baris dilewati` : ""}.`);
          return;
        }
        const rows = parseCsv(await file.text());
        if (rows.length < 2) throw new Error("CSV belum berisi baris data pemain.");
        const normalize = value => String(value).trim().toLowerCase().replace(/\((?:cm|kg)\)/g, "").replace(/[^a-z0-9]/g, "");
        const headers = rows[0].map(normalize);
        const columns = {
          name: headers.indexOf("nama"),
          position: headers.indexOf("posisi"),
          number: headers.indexOf("nomorpunggung"),
          className: headers.indexOf("kelas"),
          height: headers.indexOf("tinggi"),
          weight: headers.indexOf("berat"),
          spikeReach: headers.indexOf("spikereach"),
          blockReach: headers.indexOf("blockreach")
        };
        if (Object.values(columns).some(index => index < 0)) throw new Error("Header tidak sesuai template. Unduh template Excel terlebih dahulu.");
        const positions = ["Setter", "Outside Hitter", "Opposite", "Middle Blocker", "Libero"];
        let added = 0, skipped = 0;
        rows.slice(1).forEach((row, index) => {
          const value = key => String(row[columns[key]] || "").trim();
          const numbers = ["number", "height", "weight", "spikeReach", "blockReach"].map(key => Number(value(key)));
          const [number, height, weight, spikeReach, blockReach] = numbers;
          const position = positions.find(item => item.toLowerCase() === value("position").toLowerCase());
          const name = value("name"), className = value("className");
          if (!name && !className && numbers.every(numberValue => !numberValue)) return;
          const valid = name.length <= 80 && name && className && className.length <= 40 && position &&
            Number.isInteger(number) && number >= 0 && number <= 99 &&
            Number.isFinite(height) && height >= 100 && height <= 230 &&
            Number.isFinite(weight) && weight >= 20 && weight <= 180 &&
            Number.isFinite(spikeReach) && spikeReach >= 100 && spikeReach <= 350 &&
            Number.isFinite(blockReach) && blockReach >= 100 && blockReach <= 350;
          if (!valid || data.players.some(player => player.name.toLowerCase() === name.toLowerCase() && player.className.toLowerCase() === className.toLowerCase())) {
            skipped++;
            return;
          }
          const record = { date: todayISO(), height, weight, spikeReach, blockReach };
          data.players.push({ id: Date.now() + index, name, position, number, className, height, weight, spikeReach, blockReach, history: [record] });
          added++;
        });
        if (!added) throw new Error("Tidak ada baris valid untuk diimpor. Periksa data dan posisi pemain.");
        if (!await persist()) return;
        selectedPlayerIds.clear();
        render();
        toast(`${added} pemain diimpor${skipped ? `, ${skipped} baris dilewati` : ""}.`);
      }
      async function deleteSelectedPlayers() {
        const selected = Array.from(selectedPlayerIds);
        if (!selected.length) return;
        const linked = serverUsers.filter(user => user.role === "player" && selected.includes(Number(user.playerId)));
        if (linked.length) {
          toast(`Pemain terhubung ke akun ${linked.map(user => user.name).join(", ")}. Hapus atau pindahkan akun terlebih dahulu.`);
          return;
        }
        if (!window.confirm(`Hapus ${selected.length} pemain beserta catatan terkait?`)) return;
        const previousData = JSON.stringify(data);
        const removed = new Set(selected);
        data.players = data.players.filter(player => !removed.has(Number(player.id)));
        data.sessions.forEach(session => {
          selected.forEach(id => {
            if (session.attendance) delete session.attendance[id];
            if (session.evaluations) delete session.evaluations[id];
          });
        });
        data.matches.forEach(match => {
          match.stats = (match.stats || []).filter(stat => !removed.has(Number(stat.playerId)));
          if (Array.isArray(match.playerIds)) match.playerIds = match.playerIds.filter(id => !removed.has(Number(id)));
        });
        selected.forEach(id => Object.keys(data.targets || {}).forEach(key => { if (key.startsWith(`${id}:`)) delete data.targets[key]; }));
        selectedPlayerIds.clear();
        if (!await persist()) {
          data = JSON.parse(previousData);
          render();
          return;
        }
        render();
        toast(`${selected.length} pemain dan catatan terkait dihapus.`);
      }
      function exportReport(attendanceOnly) {
        if (attendanceOnly === true) {
          const rows = [["Nama", "Kelas", "Tanggal sesi", "Sesi", "Status"]];
          data.sessions.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(s => data.players.forEach(p => rows.push([p.name, p.className, s.date, s.title, (s.attendance || {})[p.id] || "Belum dicatat"])));
          downloadCsv("rekap-kehadiran-volleydesk.csv", rows);
        } else if (attendanceOnly === "grades") {
          const rows = [["Nama siswa", "Kelas", "Ekstrakurikuler", "Predikat", "Kehadiran", "Catatan pembinaan"]];
          data.players.forEach(p => {
            const latestEvaluation = data.sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).map(s => s.evaluations && s.evaluations[p.id]).find(Boolean) || "";
            rows.push([p.name, p.className, "Bola Voli", p.grade || "Belum dinilai", attendanceRate(p.id) + "%", latestEvaluation]);
          });
          downloadCsv("nilai-ekstrakurikuler-voli.csv", rows);
        } else {
          const rows = [["Nama", "Posisi", "Nomor", "Kelas", "Tinggi cm", "Berat kg", "Spike reach cm", "Block reach cm", "Kehadiran %", "Efisiensi attack %"]];
          data.players.forEach(p => rows.push([p.name, p.position, p.number, p.className, p.height, p.weight, p.spikeReach, p.blockReach, attendanceRate(p.id), skillEfficiency(p.id, "Attack") == null ? "" : skillEfficiency(p.id, "Attack")]));
          downloadCsv("laporan-progres-volleydesk.csv", rows);
        }
        toast("Laporan CSV berhasil diekspor.");
      }
      function applyServerState(state) {
        const hasBottomConfig = Boolean(state && state.bottomNav);
        data = Object.assign(JSON.parse(JSON.stringify(defaultData)), state || {});
        data.menuVisibility = Object.assign({}, defaultData.menuVisibility, data.menuVisibility || {});
        data.highlights = Object.assign({}, defaultData.highlights, data.highlights || {});
        data.bottomNav = Object.assign({}, defaultData.bottomNav, data.bottomNav || {});
        data.bottomHighlights = Object.assign({}, defaultData.bottomHighlights, data.bottomHighlights || {});
        data.targets = data.targets || {};
        if (!hasBottomConfig) {
          ["admin", "coach"].forEach(role => {
            if (!data.menuVisibility[role].includes("targets")) data.menuVisibility[role].push("targets");
          });
        }
        data.role = signedInUser.role;
        settingsRoleKey = signedInUser.role;
        selectedSessionId = data.sessions[0] ? data.sessions[0].id : null;
        selectedMatchId = data.matches[0] ? data.matches[0].id : null;
        selectedTargetPlayerId = signedInUser.role === "player" ? signedInUser.playerId : (data.players[0] ? data.players[0].id : null);
      }
      async function saveBackupSchedule() {
        try {
          backupSettings = await api("/api/admin/backup-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enabled: $("#backup-enabled").checked,
              time: $("#backup-time").value,
              botToken: $("#telegram-bot-token").value.trim(),
              chatId: $("#telegram-chat-id").value.trim(),
              clearCredentials: $("#clear-telegram-credentials").checked
            })
          });
          render();
          toast("Jadwal backup disimpan.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function sendBackupNow() {
        try {
          backupSettings = await api("/api/admin/backup/telegram", { method: "POST" });
          render();
          toast("Backup berhasil dikirim ke Telegram.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function downloadBackup() {
        try {
          const response = await fetch("/api/admin/backup/download", { credentials: "same-origin" });
          if (!response.ok) {
            let payload = null;
            try { payload = await response.json(); } catch {}
            throw new Error(payload && payload.error ? payload.error : "Unduh backup gagal.");
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `volleydesk-backup-${todayISO()}.json`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Backup berhasil diunduh.");
        } catch (error) {
          toast(error.message);
        }
      }
      async function restoreBackup() {
        const fileInput = $("#backup-restore-file");
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          toast("Pilih berkas backup JSON terlebih dahulu.");
          return;
        }
        if (!window.confirm("Pemulihan akan mengganti seluruh data pemain, absensi, jadwal, latihan, dan statistik saat ini. Lanjutkan?")) return;
        try {
          const backup = JSON.parse(await file.text());
          await api("/api/admin/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ backup })
          });
          window.alert("Data dan akun berhasil dipulihkan. Silakan masuk kembali menggunakan akun yang ada di backup.");
          window.location.reload();
        } catch (error) {
          toast(error.message || "Berkas backup tidak valid.");
        }
      }
      function bindContentEvents() {
        $("#content").querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { currentPage = el.dataset.page; render(); }));
        $("#content").querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", async () => {
          switch (el.dataset.action) {
            case "add-player": addPlayerModal(); break;
            case "new-session": newSessionModal(); break;
            case "add-event": addEventModal(); break;
            case "add-match": addMatchModal(); break;
            case "add-stat": addStatModal(); break;
            case "add-user": addUserModal(); break;
            case "player-template": downloadPlayerTemplate(); break;
            case "player-import": $("#player-import-file").click(); break;
            case "delete-selected": await deleteSelectedPlayers(); break;
            case "save-backup-settings": await saveBackupSchedule(); break;
            case "backup-now": await sendBackupNow(); break;
            case "download-backup": await downloadBackup(); break;
            case "restore-backup": await restoreBackup(); break;
            case "save-attendance": {
              const s = data.sessions.find(x => Number(x.id) === Number(selectedSessionId));
              if (s) { s.attendance = Object.assign({}, pendingAttendance[s.id] || {}); toast("Absensi tersimpan."); persist(); render(); }
              break;
            }
            case "export-report": exportReport(false); break;
            case "export-attendance": exportReport(true); break;
            case "export-grades": exportReport("grades"); break;
            case "refresh-recommendations": toast("Analisis rekomendasi diperbarui."); render(); break;
            case "save-target": {
              const player = activeRole() === "player" ? data.players[0] : playerById(selectedTargetPlayerId);
              if (!player) break;
              const values = {};
              let invalid = false;
              $("#content").querySelectorAll("[data-target-value]").forEach(input => {
                if (!input.value.trim()) return;
                const value = Number(input.value);
                if (!Number.isFinite(value) || value < 0) invalid = true;
                else values[input.dataset.targetValue] = value;
              });
              if (invalid) { toast("Nilai target harus berupa angka nol atau lebih."); break; }
              data.targets = data.targets || {};
              data.targets[`${player.id}:${selectedTargetPeriod}`] = values;
              if (await persist()) { render(); toast("Target performa tersimpan."); }
              break;
            }
          }
        }));
        $("#content").querySelectorAll("[data-profile]").forEach(el => el.addEventListener("click", () => profileModal(el.dataset.profile)));
        $("#content").querySelectorAll("[data-attendance]").forEach(el => el.addEventListener("click", () => {
          if (!pendingAttendance[selectedSessionId]) pendingAttendance[selectedSessionId] = {};
          pendingAttendance[selectedSessionId][el.dataset.attendance] = el.dataset.status;
          render();
        }));
        $("#content").querySelectorAll("[data-delete-event]").forEach(el => el.addEventListener("click", () => { data.events = data.events.filter(e => Number(e.id) !== Number(el.dataset.deleteEvent)); persist(); render(); toast("Agenda dihapus."); }));
        $("#content").querySelectorAll("[data-delete-session]").forEach(el => el.addEventListener("click", () => { data.sessions = data.sessions.filter(s => Number(s.id) !== Number(el.dataset.deleteSession)); selectedSessionId = data.sessions[0] ? data.sessions[0].id : null; persist(); render(); toast("Sesi latihan dihapus."); }));
        $("#content").querySelectorAll("[data-delete-stat]").forEach(el => el.addEventListener("click", () => {
          const [mid, pid, skill] = el.dataset.deleteStat.split(":"); const m = data.matches.find(x => Number(x.id) === Number(mid));
          if (m) { m.stats = m.stats.filter(s => !(Number(s.playerId) === Number(pid) && s.skill === skill)); persist(); render(); }
        }));
        $("#content").querySelectorAll("[data-delete-user]").forEach(el => el.addEventListener("click", async () => {
          const user = serverUsers.find(item => Number(item.id) === Number(el.dataset.deleteUser));
          if (!user || !window.confirm(`Hapus akun ${user.name}?`)) return;
          try {
            await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
            serverUsers = serverUsers.filter(item => Number(item.id) !== Number(user.id));
            render();
            toast("Akun pengguna dihapus.");
          } catch (error) { toast(error.message); }
        }));
        $("#content").querySelectorAll("[data-live-stat]").forEach(el => el.addEventListener("click", async () => {
          const [playerId, skill, result] = el.dataset.liveStat.split(":");
          const match = data.matches.find(item => Number(item.id) === Number(selectedMatchId));
          if (!match || !["success", "errors"].includes(result)) return;
          match.stats = match.stats || [];
          let stat = match.stats.find(item => Number(item.playerId) === Number(playerId) && item.skill === skill);
          if (!stat) { stat = { playerId: Number(playerId), skill, success: 0, errors: 0 }; match.stats.push(stat); }
          stat[result] = Number(stat[result] || 0) + 1;
          if (await persist()) render();
        }));
        const sessionSelect = $("#session-select");
        if (sessionSelect) sessionSelect.addEventListener("change", () => { selectedSessionId = Number(sessionSelect.value); render(); });
        const matchSelect = $("#match-select");
        if (matchSelect) matchSelect.addEventListener("change", () => { selectedMatchId = Number(matchSelect.value); render(); });
        const playerSearch = $("#player-search");
        if (playerSearch) playerSearch.addEventListener("input", () => { searchTerm = playerSearch.value; const pos = playerSearch.selectionStart; render(); const field = $("#player-search"); field.focus(); field.setSelectionRange(pos, pos); });
        const settingsRole = $("#settings-role");
        if (settingsRole) settingsRole.addEventListener("change", () => { settingsRoleKey = settingsRole.value; render(); });
        $("#content").querySelectorAll(".menu-switch").forEach(el => el.addEventListener("change", () => {
          const role = settingsRoleKey, list = data.menuVisibility[role] || [];
          data.menuVisibility[role] = el.checked ? Array.from(new Set(list.concat(el.dataset.menu))) : list.filter(id => id !== el.dataset.menu);
          data.bottomNav[role] = (data.bottomNav[role] || []).filter(id => data.menuVisibility[role].includes(id));
          if (!data.bottomNav[role].includes(data.bottomHighlights[role])) data.bottomHighlights[role] = data.bottomNav[role][0] || "";
          persist(); render();
        }));
        const highlight = $("#highlight-select");
        if (highlight) highlight.addEventListener("change", () => { data.highlights[settingsRoleKey] = highlight.value; persist(); render(); toast("Menu sorotan diperbarui."); });
        $("#content").querySelectorAll(".bottom-menu-switch").forEach(el => el.addEventListener("change", () => {
          const role = settingsRoleKey;
          const list = (data.bottomNav[role] || []).filter(id => data.menuVisibility[role].includes(id));
          if (el.checked && list.length >= 5) {
            el.checked = false;
            toast("Navigasi bawah maksimal lima menu.");
            return;
          }
          data.bottomNav[role] = el.checked ? list.concat(el.dataset.bottomMenu) : list.filter(id => id !== el.dataset.bottomMenu);
          if (!data.bottomNav[role].includes(data.bottomHighlights[role])) data.bottomHighlights[role] = data.bottomNav[role][0] || "";
          persist(); render();
        }));
        const bottomHighlight = $("#bottom-highlight-select");
        if (bottomHighlight) bottomHighlight.addEventListener("change", () => {
          data.bottomHighlights[settingsRoleKey] = bottomHighlight.value;
          persist(); render(); toast("Highlight navigasi bawah diperbarui.");
        });
        const targetPlayer = $("#target-player");
        if (targetPlayer) targetPlayer.addEventListener("change", () => { selectedTargetPlayerId = Number(targetPlayer.value); render(); });
        const targetPeriod = $("#target-period");
        if (targetPeriod) targetPeriod.addEventListener("change", () => { selectedTargetPeriod = targetPeriod.value; render(); });
        const selectAll = $("#select-all-players");
        if (selectAll) selectAll.addEventListener("change", () => {
          data.players.filter(player => (player.name + " " + player.position + " " + player.className).toLowerCase().includes(searchTerm.toLowerCase()))
            .forEach(player => selectAll.checked ? selectedPlayerIds.add(Number(player.id)) : selectedPlayerIds.delete(Number(player.id)));
          render();
        });
        $("#content").querySelectorAll("[data-select-player]").forEach(el => el.addEventListener("change", () => {
          if (el.checked) selectedPlayerIds.add(Number(el.dataset.selectPlayer));
          else selectedPlayerIds.delete(Number(el.dataset.selectPlayer));
          render();
        }));
        const importFile = $("#player-import-file");
        if (importFile) importFile.addEventListener("change", async () => {
          try { await importPlayers(importFile.files && importFile.files[0]); }
          catch (error) { toast(error.message || "Impor data pemain gagal."); }
          importFile.value = "";
        });
        $("#content").querySelectorAll("[data-grade]").forEach(el => el.addEventListener("change", () => {
          const player = playerById(el.dataset.grade);
          if (player && ["admin", "coach"].includes(activeRole())) { player.grade = el.value; persist(); toast("Predikat rapor disimpan."); }
        }));
      }
      $("#theme-toggle").addEventListener("click", () => { data.theme = data.theme === "dark" ? "light" : "dark"; persist(); render(); });
      $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
      document.addEventListener("keydown", event => { if (event.key === "Escape") $("#modal-root").innerHTML = ""; });
      $("#login-form").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const submitButton = $("#login-submit");
        const errorMessage = $("#login-error");
        const formData = new FormData(form);
        errorMessage.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = "Memeriksa akun...";
        try {
          await api("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: String(formData.get("email")).trim().toLowerCase(),
              password: String(formData.get("password"))
            })
          });
          window.location.reload();
        } catch (error) {
          errorMessage.textContent = error.message || "Tidak dapat masuk. Silakan coba lagi.";
          errorMessage.hidden = false;
          submitButton.disabled = false;
          submitButton.textContent = "Masuk ke VolleyDesk";
        }
      });
      $("#logout-button").addEventListener("click", async () => {
        try {
          await api("/api/logout", { method: "POST" });
          window.location.reload();
        } catch (error) {
          toast(error.message);
        }
      });
      $("#password-button").addEventListener("click", changePasswordModal);
      async function initializeApp() {
        $("#login-screen").hidden = false;
        try {
          const session = await api("/api/session");
          signedInUser = session.user;
          if (!signedInUser) {
            $("#app").hidden = true;
            return;
          }
          const stored = await api("/api/state");
          if (stored.data) {
            applyServerState(stored.data);
          } else {
            if (signedInUser.role !== "admin") {
              throw new Error("Administrator harus login terlebih dahulu untuk menyiapkan data aplikasi.");
            }
            let initialData = defaultData;
            let importLegacy = false;
            if (stored.isInitial && signedInUser.role === "admin" &&
                legacyData && ["players", "sessions", "events", "matches"].every(key => Array.isArray(legacyData[key]))) {
              try {
                importLegacy = localStorage.getItem(LEGACY_IMPORTED_KEY) !== "1" &&
                  window.confirm("Ditemukan data VolleyDesk lama di browser ini. Impor data tersebut ke database bersama?");
              } catch (error) {
                console.error("Migrasi data lama tidak tersedia.", error);
              }
            }
            if (importLegacy) initialData = legacyData;
            applyServerState(initialData);
            await api("/api/state/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: initialData })
            });
            try { localStorage.setItem(LEGACY_IMPORTED_KEY, "1"); }
            catch (error) { console.error("Penanda migrasi browser tidak dapat disimpan.", error); }
          }
          if (signedInUser.role === "admin") {
            const result = await api("/api/admin/users");
            serverUsers = result.users;
            backupSettings = await api("/api/admin/backup-settings");
          }
          $("#login-screen").hidden = true;
          $("#app").hidden = false;
          render();
        } catch (error) {
          $("#app").hidden = true;
          $("#login-screen").hidden = false;
          if (error.status === 401) return;
          const message = $("#login-error");
          message.textContent = error.message || "Login demo tidak dapat dijalankan pada browser ini.";
          message.hidden = false;
        }
      }
      initializeApp();
    })();
