# VolleyDesk

VolleyDesk mengelola pemain, antropometri, kehadiran, jadwal, log latihan, statistik pertandingan, rekomendasi, laporan, dan hak akses ekstrakurikuler bola voli.

## Menjalankan lokal

1. Gunakan Node.js 18 atau lebih baru.
2. Salin `.env.example` menjadi `.env`, lalu ganti `BOOTSTRAP_ADMIN_PASSWORD`.
3. Jalankan:

   ```sh
   npm install
   npm start
   ```

4. Buka `http://localhost:3000`. Akun administrator dibuat dari `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, dan `BOOTSTRAP_ADMIN_PASSWORD`. Tanpa `.env`, mode lokal memakai akun awal `admin@volleydesk.demo` / `VoliDesk!2026`.

SQLite disimpan pada `SQLITE_PATH` (default `./data/volleydesk.sqlite`). Direktori database lokal diabaikan Git.

## Database dan sesi

Data aplikasi dan akun disimpan server-side di SQLite. Kata sandi di-hash, sesi login memakai cookie HttpOnly, dan endpoint penulisan menerapkan pembatasan role. Untuk Railway, pasang persistent volume pada `/data` dan atur `SQLITE_PATH=/data/volleydesk.sqlite`; tanpa volume, filesystem container dapat hilang saat deploy atau restart.

Data lama di browser dapat diimpor sekali saat administrator pertama kali masuk ke database baru. Setelah itu database server menjadi sumber data bersama.

## Backup, restore, dan Telegram

- Halaman **Pengaturan akses** menyediakan unduhan backup JSON dan pemulihan dari backup JSON.
- Backup berisi data operasional, akun pengguna, hash kata sandi, dan jadwal backup. Sesi login dan token Telegram tidak disertakan. Simpan berkas backup dan chat Telegram secara privat.
- Untuk backup otomatis Telegram, atur `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sebagai Railway Variables/Secrets.
- Administrator kemudian dapat mengaktifkan backup harian dan memilih waktu pada halaman Pengaturan. Zona waktu default adalah `Asia/Jakarta`.
- **Kirim backup sekarang** mengirim berkas melalui bot Telegram. Bot perlu dapat mengirim pesan ke chat tujuan.

Jangan menyimpan token bot atau kata sandi produksi di Git atau mengirimkannya melalui chat. Simpan salinan backup di lokasi aman lain; Telegram bukan satu-satunya salinan yang disarankan.

## Railway

Service menggunakan `npm start` dan port dinamis `PORT`. GitHub auto-deploy tetap diarahkan ke branch `main`. Atur variabel berikut pada Railway:

- `SQLITE_PATH=/data/volleydesk.sqlite`
- `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (untuk backup Telegram)
- `BACKUP_TIMEZONE=Asia/Jakarta` (opsional)

Persistent volume dan pemakaian service dapat menimbulkan biaya. Periksa paket dan pemakaian Railway; biaya nol tidak dijamin.
