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

Admin dapat membuat akun pemain dari Pengaturan akses atau dari bagian **Akun login pemain** pada tombol **Edit** di menu Data pemain. Username dapat berupa username sederhana atau email; kata sandi minimal 6 karakter dan disimpan dalam bentuk hash. Akun pemain hanya menerima profil, kehadiran, statistik, agenda, dan target milik pemain tersebut. Pemain tidak dapat mengubah data bersama.

Di menu Data pemain, pilih satu atau beberapa baris atau gunakan pilih semua untuk menghapus pemain beserta catatan terkait. Akun pemain yang masih terhubung harus dihapus dahulu dari daftar akun.

Tombol **Statistik pemain** membuka detail kehadiran dan statistik teknik per pertandingan. **Antropometri** menampilkan riwayat pengukuran dan formulir untuk menambahkan pembaruan manual. Profil pemain dapat diedit dari tombol **Edit profil**; penghapusan dari halaman detail memerlukan konfirmasi dan ikut menghapus catatan pemain yang terkait.

## Backup, restore, dan Telegram

- Halaman **Pengaturan akses** menyediakan unduhan backup JSON dan pemulihan dari backup JSON.
- Backup berisi data operasional, akun pengguna, hash kata sandi, dan jadwal backup. Sesi login dan token Telegram tidak disertakan. Simpan berkas backup dan chat Telegram secara privat.
- Pada Pengaturan akses, isi **Telegram Bot Token** dan **Telegram Chat ID**, lalu simpan. Token tidak ditampilkan kembali dan tidak dimasukkan ke file backup. Alternatifnya, atur `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sebagai Railway Variables/Secrets; variabel lingkungan memiliki prioritas.
- Setelah kredensial tersedia, admin dapat mengaktifkan backup harian dan memilih waktu. Zona waktu default adalah `Asia/Jakarta`.
- **Kirim backup sekarang** mengirim berkas melalui bot Telegram. Bot perlu dapat mengirim pesan ke chat tujuan.

Menu **Latihan** menampilkan daftar sesi beserta status absensi dan aksi **Pratinjau**, **Edit**, serta **Hapus** dengan konfirmasi. **Tambah Sesi** membuka pengisian absensi; evaluasi individu hanya tersedia untuk pemain berstatus Hadir. Kalender menampilkan grid bulanan dan seluruh kegiatan, serta menyediakan **Tambah sesi** dan **Tambah pertandingan** pada tanggal yang dipilih. Kegiatan latihan terjadwal menjadi sesi latihan, sedangkan pertandingan, sparring, dan turnamen terjadwal masuk ke daftar pertandingan. Menu **Tim** digunakan untuk mengelompokkan pemain. Saat membuat atau mengedit pertandingan, pilih tim lalu roster pemain yang hadir dan bertanding. Menu **Pertandingan** menampilkan persentase menang, total ace, poin serangan, receive, dan blok serta daftar laga dengan aksi **Pratinjau**, **Edit**, **Catat live**, dan **Hapus**. Catat live dibuka dari daftar pertandingan untuk mengisi statistik pemain dan skor hingga lima set, lalu menyimpan evaluasi umum dan individu.

**Target performa** mengambil capaian langsung dari statistik pertandingan: blok berhasil, serangan berhasil, servis gagal, dan receive gagal. Target awal mingguan disesuaikan dengan posisi: Libero (0, 0, 1, 2), Setter/Toser (2, 4, 2, 2), Outside Hitter (3, 8, 2, 3), Opposite (3, 8, 2, 2), dan Middle Blocker (5, 5, 2, 2), berurutan untuk keempat metrik tersebut. Target bulanan awal adalah empat kali nilai mingguan; pelatih dapat mengubahnya kapan saja. Target keberhasilan adalah jumlah minimal, sedangkan jumlah kegagalan adalah batas maksimal.

Admin juga dapat memilih maksimal lima item navigasi bawah serta highlight-nya untuk setiap role.

Jangan menyimpan token bot atau kata sandi produksi di Git atau mengirimkannya melalui chat. Simpan salinan backup di lokasi aman lain; Telegram bukan satu-satunya salinan yang disarankan.

## Railway

Service menggunakan `npm start` dan port dinamis `PORT`. GitHub auto-deploy tetap diarahkan ke branch `main`. Atur variabel berikut pada Railway:

- `SQLITE_PATH=/data/volleydesk.sqlite`
- `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (untuk backup Telegram)
- `BACKUP_TIMEZONE=Asia/Jakarta` (opsional)

Persistent volume dan pemakaian service dapat menimbulkan biaya. Periksa paket dan pemakaian Railway; biaya nol tidak dijamin.
