# VolleyDesk

VolleyDesk mengelola biodata dan antropometri pemain, kehadiran, kalender, kegiatan latihan, statistik live pertandingan, target performa, rekomendasi, laporan, backup, serta akses admin, sekolah, pelatih, dan pemain.

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

Data aplikasi, akun, dan sesi login disimpan server-side di SQLite. Cookie sesi HttpOnly berlaku 30 hari dan sesi tetap aktif saat server restart atau deploy selama memakai database yang sama. Untuk Railway, pasang persistent volume pada `/data` dan atur `SQLITE_PATH=/data/volleydesk.sqlite`; tanpa volume, filesystem container dapat hilang saat deploy atau restart sehingga akun, data, dan sesi ikut hilang. Sesi juga berakhir setelah logout atau perubahan kata sandi.

Data lama di browser dapat diimpor sekali saat administrator pertama kali masuk ke database baru. Setelah itu database server menjadi sumber data bersama. Admin/pelatih dapat mengimpor daftar pemain dari Excel `.xlsx` atau CSV di menu Data pemain; template `.xlsx` dapat diunduh di halaman tersebut. Kolom jenis kelamin dan tanggal lahir (format `YYYY-MM-DD`) bersifat opsional, sehingga template lama tetap kompatibel.

Admin dapat membuat akun pemain dari Pengaturan akses atau dari tombol **Buat login** pada menu Data pemain. Username dapat berupa username sederhana atau email; kata sandi minimal 6 karakter dan disimpan dalam bentuk hash. Akun pemain hanya menerima profil, kehadiran, statistik, agenda, dan target milik pemain tersebut. Pemain tidak dapat mengubah data bersama.

Di menu Data pemain, pilih satu atau beberapa baris atau gunakan pilih semua untuk menghapus pemain beserta catatan terkait. Akun pemain yang masih terhubung harus dihapus dahulu dari daftar akun.

## Backup, restore, dan Telegram

- Halaman **Pengaturan akses** menyediakan unduhan backup JSON dan pemulihan dari backup JSON.
- Backup berisi data operasional, akun pengguna, hash kata sandi, dan jadwal backup. Sesi login dan token Telegram tidak disertakan. Simpan berkas backup dan chat Telegram secara privat.
- Pada Pengaturan akses, isi **Telegram Bot Token** dan **Telegram Chat ID**, lalu simpan. Token tidak ditampilkan kembali dan tidak dimasukkan ke file backup. Alternatifnya, atur `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sebagai Railway Variables/Secrets; variabel lingkungan memiliki prioritas.
- Setelah kredensial tersedia, admin dapat mengaktifkan backup harian dan memilih waktu. Zona waktu default adalah `Asia/Jakarta`.
- **Kirim backup sekarang** mengirim berkas melalui bot Telegram. Bot perlu dapat mengirim pesan ke chat tujuan.

Menu Kalender menampilkan grid bulanan dan catatan latihan pribadi/tim, les, dan pertandingan dengan tanggal, waktu, catatan, serta tempat opsional. Menu Latihan mengelola kegiatan tersebut sekaligus catatan sesi, materi, kehadiran, dan evaluasi individu. Menu Tim memungkinkan admin dan pelatih membuat beberapa tim, mengunggah logo PNG/JPG/WebP hingga 200 KB, dan menempatkan pemain pada lebih dari satu tim. Menu Statistik merangkum kegiatan dan sesi latihan serta rekap laga, dan menyediakan roster serta tombol sukses/gagal live untuk blok, serangan, servis, dan receive. Target performa dapat diatur per pemain untuk minggu atau bulan berjalan.

Admin juga dapat memilih maksimal lima item navigasi bawah serta highlight-nya untuk setiap role.

Jangan menyimpan token bot atau kata sandi produksi di Git atau mengirimkannya melalui chat. Simpan salinan backup di lokasi aman lain; Telegram bukan satu-satunya salinan yang disarankan.

## Railway

Service menggunakan `npm start` dan port dinamis `PORT`. GitHub auto-deploy tetap diarahkan ke branch `main`. Atur variabel berikut pada Railway:

- `SQLITE_PATH=/data/volleydesk.sqlite`
- `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (untuk backup Telegram)
- `BACKUP_TIMEZONE=Asia/Jakarta` (opsional)

Persistent volume dan pemakaian service dapat menimbulkan biaya. Periksa paket dan pemakaian Railway; biaya nol tidak dijamin.
