(function () {
      "use strict";
      const STORAGE_KEY = "volleyDeskDataV1";
      const roles = {
        admin: "Admin / Operator",
        principal: "Kepala Sekolah",
        curriculum: "Wakasek Kurikulum",
        coach: "Pelatih"
      };
      const pages = [
        { id: "dashboard", label: "Ringkasan", icon: "▦", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "players", label: "Data pemain", icon: "♟", roles: ["admin", "coach"] },
        { id: "attendance", label: "Kehadiran", icon: "✓", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "schedule", label: "Jadwal kegiatan", icon: "▣", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "training", label: "Log latihan", icon: "↗", roles: ["admin", "coach"] },
        { id: "matches", label: "Statistik pertandingan", icon: "◎", roles: ["admin", "coach"] },
        { id: "recommendations", label: "Rekomendasi", icon: "✦", roles: ["admin", "coach"] },
        { id: "reports", label: "Laporan", icon: "▤", roles: ["admin", "principal", "curriculum", "coach"] },
        { id: "settings", label: "Pengaturan akses", icon: "⚙", roles: ["admin"] }
      ];
      const defaultData = {
        theme: "light",
        role: "coach",
        menuVisibility: {
          admin: pages.map(p => p.id),
          principal: ["dashboard", "attendance", "schedule", "reports"],
          curriculum: ["dashboard", "attendance", "schedule", "reports"],
          coach: ["dashboard", "players", "attendance", "schedule", "training", "matches", "recommendations", "reports"]
        },
        highlights: { admin: "dashboard", principal: "dashboard", curriculum: "schedule", coach: "attendance" },
        users: [
          { name: "Administrator", role: "admin", email: "admin@sekolah.sch.id" },
          { name: "Kepala Sekolah", role: "principal", email: "kepsek@sekolah.sch.id" },
          { name: "Wakasek Kurikulum", role: "curriculum", email: "kurikulum@sekolah.sch.id" },
          { name: "Pelatih Voli", role: "coach", email: "pelatih@sekolah.sch.id" }
        ],
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
        ]
      };
      function liberoNumber() { return 3; }
      let signedInUser = null;
      let serverUsers = [];
      let data;
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        data = saved && saved.players && saved.sessions ? Object.assign(defaultData, saved) : defaultData;
      } catch (error) {
        console.error("Tidak dapat membaca data lokal VolleyDesk.", error);
        data = defaultData;
      }
      let currentPage = "dashboard";
      let settingsRoleKey = data.role || "coach";
      let selectedSessionId = data.sessions[0] ? data.sessions[0].id : null;
      let selectedMatchId = data.matches[0] ? data.matches[0].id : null;
      let searchTerm = "";
      let pendingAttendance = {};

      const $ = (selector, root) => (root || document).querySelector(selector);
      async function apiRequest(url, options) {
        const requestOptions = Object.assign({ credentials: "same-origin" }, options || {});
        requestOptions.headers = Object.assign({ "Content-Type": "application/json" }, requestOptions.headers || {});
        const response = await fetch(url, requestOptions);
        let result = null;
        if (response.status !== 204 && (response.headers.get("content-type") || "").includes("application/json")) {
          try {
            result = await response.json();
          } catch {
            throw new Error("Respons server tidak valid.");
          }
        }
        if (!response.ok) {
          const error = new Error(result && result.error ? result.error : `Layanan login tidak tersedia (HTTP ${response.status}).`);
          error.status = response.status;
          throw error;
        }
        return result;
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
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
        catch (error) { console.error("Penyimpanan data VolleyDesk gagal.", error); toast("Penyimpanan gagal. Periksa ruang browser."); }
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
        const nav = $("#nav"), allowed = visiblePages();
        if (!allowed.some(p => p.id === currentPage)) currentPage = allowed.length ? allowed[0].id : "dashboard";
        const highlight = data.highlights[activeRole()];
        nav.innerHTML = allowed.length ? allowed.map(p => `<button class="nav-btn ${currentPage === p.id ? "active" : ""}" data-page="${p.id}"><span class="nav-icon">${p.icon}</span><span>${esc(p.label)}</span>${highlight === p.id ? '<span class="nav-pin">★</span>' : ""}</button>`).join("") : '<div class="empty">Belum ada menu yang diizinkan.</div>';
        nav.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { currentPage = button.dataset.page; $("#sidebar").classList.remove("open"); render(); }));
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
        return `<div class="event-row"><div class="date-tile"><strong>${d.getDate()}</strong><span>${shortMonth(event.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(event.title)}</div><div class="event-meta">${esc(event.time)} · ${esc(event.location)}</div></div><span class="tag ${eventTypeClass(event.type)}">${esc(event.type)}</span></div>`;
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
      function playerRows(players) {
        return players.map(p => `<tr><td><div class="player-name"><span class="player-avatar">${initials(p.name)}</span><span>${esc(p.name)}<span class="position">#${esc(p.number)}</span></span></div></td><td>${esc(p.position)}</td><td>${esc(p.className)}</td><td>${esc(p.height)} cm</td><td>${esc(p.weight)} kg</td><td>${esc(p.spikeReach)} / ${esc(p.blockReach)} cm</td><td>${attendanceRate(p.id)}%</td><td><button class="button secondary small" data-profile="${p.id}">Profil</button></td></tr>`).join("");
      }
      function playersPage() {
        const filtered = data.players.filter(p => (p.name + " " + p.position + " " + p.className).toLowerCase().includes(searchTerm.toLowerCase()));
        return `${heading("Biodata pemain", "Kelola profil, posisi, dan perkembangan antropometri setiap atlet.", '<button class="button" data-action="add-player">＋ Tambah pemain</button>')}
          <section class="card"><div class="toolbar"><div><strong style="font-size:13px">Daftar skuad</strong><span class="card-sub" style="margin-left:8px">${data.players.length} pemain</span></div><input class="search" id="player-search" placeholder="Cari nama, posisi, kelas..." value="${esc(searchTerm)}"></div>
          <div class="table-wrap"><table><thead><tr><th>Pemain</th><th>Posisi</th><th>Kelas</th><th>Tinggi</th><th>Berat</th><th>Spike / block</th><th>Kehadiran</th><th>Profil</th></tr></thead><tbody>${filtered.length ? playerRows(filtered) : '<tr><td colspan="8" class="empty">Pemain tidak ditemukan.</td></tr>'}</tbody></table></div></section>
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
        return `${heading("Jadwal kegiatan", "Atur latihan, sparring partner, turnamen, dan waktu pemulihan tim.", '<button class="button" data-action="add-event">＋ Tambah agenda</button>')}
          <section class="card"><div class="toolbar"><div><strong style="font-size:13px">Kalender kegiatan</strong><span class="card-sub" style="margin-left:8px">${events.length} agenda</span></div><span class="tag blue">Pengingat aktif</span></div>
          <div class="event-list">${events.length ? events.map(e => `<div class="event-row"><div class="date-tile"><strong>${dateObj(e.date).getDate()}</strong><span>${shortMonth(e.date)}</span></div><div style="min-width:0;flex:1"><div class="event-name">${esc(e.title)}</div><div class="event-meta">${formatDate(e.date)} · ${esc(e.time)} · ${esc(e.location)}</div></div><span class="tag ${eventTypeClass(e.type)}">${esc(e.type)}</span><span class="tag ${e.reminder ? "" : "blue"}">${e.reminder ? "● Pengingat" : "Tanpa pengingat"}</span><button class="close-x" title="Hapus agenda" data-delete-event="${e.id}">×</button></div>`).join("") : '<div class="empty">Belum ada agenda.</div>'}</div></section>
          <p class="privacy-note">Pengingat tampil dalam aplikasi. Notifikasi push atau SMS memerlukan backend dan izin perangkat.</p>`;
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
        return `${heading("Pengaturan akses", "Atur menu yang terlihat dan menu sorotan untuk setiap role.", '<button class="button secondary" data-action="add-user">＋ Tambah akun</button>')}
          <div class="grid dashboard-grid"><section class="card"><div class="card-head"><div><h2 class="card-title">Konfigurasi menu dinamis</h2><p class="card-sub">Centang menu yang dapat dibuka oleh setiap role.</p></div><select class="select-mini" id="settings-role">${Object.entries(roles).map(([id, label]) => `<option value="${id}" ${role === id ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></div>
          <div style="padding:0 19px 18px">${pages.map(p => `<div class="switch-row"><div><div class="note-title">${esc(p.label)}</div><div class="note-copy">Atur visibilitas menu untuk ${esc(roles[role])}</div></div><input class="switch menu-switch" type="checkbox" data-menu="${p.id}" ${allowed.includes(p.id) ? "checked" : ""} ${p.roles.includes(role) ? "" : "disabled"} aria-label="Izinkan menu ${esc(p.label)}"></div>`).join("")}
          <div class="field" style="margin-top:15px"><label for="highlight-select">Menu sorotan / pin role ini</label><select id="highlight-select">${pages.filter(p => allowed.includes(p.id) && p.roles.includes(role)).map(p => `<option value="${p.id}" ${data.highlights[role] === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></div></div></section>
          <section class="card side-note"><h2 class="card-title">Akun pengguna</h2><p class="card-sub">Akun tersimpan di basis data sekolah</p>${serverUsers.map(u => `<div class="note-item"><div class="note-title">${esc(u.name)}</div><div class="note-copy">${esc(u.email)}</div><span class="tag blue" style="margin-top:6px">${esc(roles[u.role] || u.role)}</span></div>`).join("")}
          <div class="privacy-note">Pengelolaan akun dilakukan oleh server; kata sandi disimpan dalam bentuk hash.</div></section></div>`;
      }
      function pageContent() {
        switch (currentPage) {
          case "dashboard": return dashboardPage();
          case "players": return playersPage();
          case "attendance": return attendancePage();
          case "schedule": return schedulePage();
          case "training": return trainingPage();
          case "matches": return matchesPage();
          case "recommendations": return recommendationsPage();
          case "reports": return reportsPage();
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
            if (result !== false) { root.innerHTML = ""; persist(); render(); }
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
        showModal("Tambah agenda kegiatan", `<form><div class="form-grid"><div class="field full"><label>Nama kegiatan</label><input name="title" required maxlength="100" placeholder="Nama agenda"></div><div class="field"><label>Jenis</label><select name="type">${["Latihan", "Sparring", "Turnamen", "Istirahat"].map(x => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>Tanggal</label><input name="date" type="date" required></div><div class="field"><label>Waktu</label><input name="time" type="time" value="15:30" required></div><div class="field"><label>Lokasi</label><input name="location" required placeholder="GOR Sekolah"></div><div class="field full"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="reminder" checked> Aktifkan pengingat dalam aplikasi</label></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan agenda</button></div></form>`, fd => {
          data.events.push({ id: Date.now(), title: String(fd.get("title")).trim(), type: fd.get("type"), date: fd.get("date"), time: fd.get("time"), location: String(fd.get("location")).trim(), reminder: fd.get("reminder") === "on" });
          toast("Agenda berhasil ditambahkan.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addMatchModal() {
        showModal("Tambah pertandingan", `<form><div class="form-grid"><div class="field full"><label>Nama pertandingan</label><input name="name" required placeholder="Uji Coba vs ..."></div><div class="field"><label>Lawan / turnamen</label><input name="opponent" required placeholder="Nama sekolah/tim"></div><div class="field"><label>Tanggal</label><input name="date" type="date" value="${todayISO()}" required></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan pertandingan</button></div></form>`, fd => {
          const m = { id: Date.now(), name: String(fd.get("name")).trim(), opponent: String(fd.get("opponent")).trim(), date: fd.get("date"), stats: [] };
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
        showModal("Ubah kata sandi", `<form><div class="form-grid"><div class="field full"><label>Kata sandi saat ini</label><input name="currentPassword" type="password" required autocomplete="current-password"></div><div class="field full"><label>Kata sandi baru (minimal 12 karakter)</label><input name="newPassword" type="password" required minlength="12" autocomplete="new-password"></div><div class="field full"><label>Ulangi kata sandi baru</label><input name="confirmPassword" type="password" required minlength="12" autocomplete="new-password"></div></div><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Simpan sandi</button></div></form>`, async fd => {
          const newPassword = String(fd.get("newPassword"));
          if (newPassword !== String(fd.get("confirmPassword"))) {
            toast("Konfirmasi kata sandi baru tidak sama.");
            return false;
          }
          await apiRequest("/api/password", {
            method: "POST",
            body: JSON.stringify({ currentPassword: fd.get("currentPassword"), newPassword })
          });
          toast("Kata sandi berhasil diubah.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function addUserModal() {
        showModal("Tambah akun pengguna", `<form><div class="form-grid"><div class="field full"><label>Nama lengkap</label><input name="name" required maxlength="80" autocomplete="name"></div><div class="field full"><label>Email</label><input name="email" type="email" required autocomplete="email"></div><div class="field full"><label>Role</label><select name="role">${Object.entries(roles).map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join("")}</select></div><div class="field full"><label>Kata sandi sementara (minimal 12 karakter)</label><input name="password" type="password" required minlength="12" autocomplete="new-password"></div></div><p class="privacy-note">Bagikan kata sandi sementara melalui kanal aman dan minta pengguna menggantinya sebelum dipakai bersama.</p><div class="modal-actions"><button type="button" class="button secondary" data-close-modal>Batal</button><button class="button">Buat akun</button></div></form>`, async fd => {
          const result = await apiRequest("/api/admin/users", {
            method: "POST",
            body: JSON.stringify({
              name: String(fd.get("name")).trim(),
              email: String(fd.get("email")).trim(),
              role: fd.get("role"),
              password: fd.get("password")
            })
          });
          serverUsers.push(result.user);
          toast("Akun berhasil dibuat.");
        });
        $("#modal-root [data-close-modal]").addEventListener("click", () => $("#modal-root").innerHTML = "");
      }
      function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(value => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      function bindContentEvents() {
        $("#content").querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => { currentPage = el.dataset.page; render(); }));
        $("#content").querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => {
          switch (el.dataset.action) {
            case "add-player": addPlayerModal(); break;
            case "new-session": newSessionModal(); break;
            case "add-event": addEventModal(); break;
            case "add-match": addMatchModal(); break;
            case "add-stat": addStatModal(); break;
            case "add-user": addUserModal(); break;
            case "save-attendance": {
              const s = data.sessions.find(x => Number(x.id) === Number(selectedSessionId));
              if (s) { s.attendance = Object.assign({}, pendingAttendance[s.id] || {}); toast("Absensi tersimpan."); persist(); render(); }
              break;
            }
            case "export-report": exportReport(false); break;
            case "export-attendance": exportReport(true); break;
            case "export-grades": exportReport("grades"); break;
            case "refresh-recommendations": toast("Analisis rekomendasi diperbarui."); render(); break;
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
          persist(); render();
        }));
        const highlight = $("#highlight-select");
        if (highlight) highlight.addEventListener("change", () => { data.highlights[settingsRoleKey] = highlight.value; persist(); render(); toast("Menu sorotan diperbarui."); });
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
          await apiRequest("/api/login", {
            method: "POST",
            body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") })
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
          await apiRequest("/api/logout", { method: "POST" });
          window.location.reload();
        } catch (error) {
          toast(error.message || "Tidak dapat keluar. Silakan coba lagi.");
        }
      });
      $("#password-button").addEventListener("click", changePasswordModal);
      async function initializeApp() {
        try {
          const result = await apiRequest("/api/session", { method: "GET" });
          signedInUser = result.user;
          data.role = result.user.role;
          settingsRoleKey = result.user.role;
          if (result.user.role === "admin") {
            const accounts = await apiRequest("/api/admin/users", { method: "GET" });
            serverUsers = accounts.users;
          }
          $("#login-screen").hidden = true;
          $("#app").hidden = false;
          render();
        } catch (error) {
          $("#app").hidden = true;
          $("#login-screen").hidden = false;
          if (error.status !== 401) {
            const message = $("#login-error");
            message.textContent = error.message || "Layanan login tidak tersedia.";
            message.hidden = false;
          }
        }
      }
      initializeApp();
    })();
