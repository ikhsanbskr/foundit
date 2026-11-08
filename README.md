# FoundIt

Sistem manajemen barang hilang dan temuan (*lost and found*) lingkup kampus yang mengotomatiskan pencocokan laporan menggunakan pembobotan atribut teks dan perbandingan visual, disertai verifikasi fisik terpusat pada petugas keamanan kampus.

Proyek ini dikembangkan oleh tim **The Phantom Thieves Of Code** untuk studi kasus lingkungan Universitas Pamulang (UNPAM).

---

## Latar Belakang Masalah

Penanganan barang tertinggal atau hilang di lingkungan kampus umumnya masih mengandalkan penyebaran pesan berantai atau pencarian manual pada papan informasi. Pendekatan tersebut memiliki tiga kendala utama:

1. Pemilik barang harus memeriksa ratusan pengumuman secara manual.
2. Tidak ada kepastian apakah barang temuan masih dipegang oleh penemu atau sudah diamankan di pos petugas.
3. Klaim kepemilikan rawan salah sasaran apabila tidak melalui proses verifikasi fisik yang terstandar.

FoundIt menyelesaikan masalah tersebut dengan memindahkan proses pencarian menjadi pencocokan otomatis dua arah (*bidirectional matching*) dan memusatkan serah terima fisik di pusat pengembalian barang (*drop point* petugas).

---

## Arsitektur Sistem

Repositori ini memuat tiga komponen layanan utama:

| Direktori | Peran Layanan | Teknologi Utama |
|---|---|---|
| `foundit/` | Aplikasi antarmuka pengguna (*frontend*) | React 19, Vite, Tailwind CSS, React Router |
| `foundit-api/` | REST API utama, manajemen laporan, dan mesin pencocokan | CodeIgniter 4 (PHP 8.2+), MySQL |
| `waservice/` | Layanan pengiriman notifikasi pesan otomatis | Node.js, Express, `whatsapp-web.js` |

---

## Mekanisme Pencocokan (*Matching Engine*)

Pencocokan laporan dilakukan melalui tiga tahap berurutan untuk menjaga efisiensi komputasi dan akurasi hasil:

### 1. Penyaringan Basis Data (Lapis 1)
Sistem menyaring kandidat laporan aktif (`REPORTED` atau `SECURED`) pada tabel `g_item_discoveries` yang memiliki kategori utama (`category_id`) yang sama dengan laporan sumber, sekaligus memuat foto utama (`is_primary = 1`).

### 2. Pembobotan Atribut Teks di Memori (Lapis 2 — Maksimal 50 Poin)
Setiap kandidat yang lolos penyaringan awal dihitung skor kemiripan teksnya menggunakan parameter berikut:
- **Kecocokan Lokasi (Maksimal 20 Poin)**: Memberikan 20 poin apabila lokasi penemuan dan kehilangan sama persis, atau 10 poin apabila mengandung nama area/gedung yang beririsan.
- **Kemiripan Nama Barang (Maksimal 15 Poin)**: Teks dipecah menjadi token kata kunci setelah pembersihan *stopwords* bahasa Indonesia. Setiap kata kunci yang cocok bernilai 5 poin.
- **Kemiripan Deskripsi (Maksimal 15 Poin)**: Setiap kata kunci deskripsi yang beririsan bernilai 3 poin.

Kandidat diurutkan berdasarkan skor teks tertinggi. Apabila terdapat nilai yang sama, prioritas diberikan pada waktu kejadian (`event_time`) yang paling berdekatan.

### 3. Verifikasi Visual (Lapis 3 — Maksimal 50 Poin)
Kandidat dengan skor teks tertinggi dibandingkan secara visual satu-lawan-satu (*1-vs-1 image comparison*) terhadap foto utama laporan menggunakan Gemini API (`gemini-2.5-flash`). Analisis visual memeriksa kesamaan merek, tipe, warna, serta ciri spesifik seperti stiker, goresan, atau aksesori tambahan.

Apabila nilai gabungan (`db_score` + `visual_score`) mencapai minimal **50 dari 100**:
1. Sistem menyimpan relasi kecocokan beserta alasan analisis ke tabel `g_matches`.
2. Status laporan diperbarui menjadi `SECURED`.
3. Sistem mengirim pemberitahuan otomatis ke nomor WhatsApp pemilik barang melalui `waservice`.

---

## Alur Operasional

Sistem mendukung tiga peran pengguna: **Penemu Barang**, **Pemilik Barang**, dan **Petugas Pusat Pengembalian (*Officer*)**. Pencocokan bekerja pada dua skenario pelaporan:

### Jalur A — Barang Temuan Dilaporkan Lebih Dulu
1. Penemu mengunggah laporan barang temuan beserta foto, lokasi, deskripsi, catatan verifikasi rahasia (opsional), dan nomor rekening (opsional, jika terdapat imbalan/*bounty*).
2. Saat diunggah, gambar otomatis dikompresi dan dikonversi ke format WebP pada sisi server.
3. Penemu menyerahkan barang fisik ke pusat pengembalian kampus.
4. Petugas memverifikasi penerimaan fisik barang pada dasbor petugas.
5. Sistem memicu pencocokan terhadap daftar laporan kehilangan yang masih terbuka. Jika cocok, pemilik barang menerima notifikasi WhatsApp untuk melakukan klaim di pos petugas.

### Jalur B — Barang Hilang Dilaporkan Lebih Dulu
1. Pemilik mengirim laporan kehilangan beserta ciri-ciri barang dan nominal imbalan (*bounty*) opsional.
2. Saat laporan dikirim, sistem langsung memindai inventaris barang temuan yang sudah tercatat.
3. Apabila ditemukan kecocokan di atas ambang batas skor, pemilik menerima notifikasi WhatsApp.
4. Pemilik mendatangi pusat pengembalian barang untuk pencocokan fisik oleh petugas.
5. Setelah petugas menekan konfirmasi penyelesaian (`RESOLVED`), sistem mengirim pesan WhatsApp otomatis kepada pemilik dan penemu barang (termasuk informasi nomor rekening penemu apabila laporan kehilangan menyertakan *bounty*).

---

## Prasyarat Sistem

- **PHP** >= 8.2 (dengan ekstensi `intl`, `mbstring`, `gd`, `mysqlnd`, dan `curl`)
- **Composer**
- **MySQL** / **MariaDB**
- **Node.js** >= 18 dan **npm**
- **Google Gemini API Key** (untuk fitur perbandingan visual)

---

## Panduan Instalasi

### 1. Backend API (`foundit-api`)

```bash
cd foundit-api
composer install
cp env .env
```

Sesuaikan konfigurasi basis data dan kunci API pada berkas `.env`:

```ini
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'

database.default.hostname = localhost
database.default.database = foundit_db
database.default.username = root
database.default.password =
database.default.DBDriver = MySQLi

GEMINI_API_KEY = your_gemini_api_key
```

Jalankan migrasi basis data dan nyalakan server pengembangan:

```bash
php spark migrate
php spark serve
```

### 2. Layanan WhatsApp (`waservice`)

```bash
cd waservice
npm install
node index.js
```

Saat pertama kali dijalankan, pindai kode QR yang tampil pada terminal menggunakan aplikasi WhatsApp untuk mengaktifkan sesi pengiriman pesan pada `http://localhost:3000`.

### 3. Antarmuka Pengguna (`foundit`)

```bash
cd foundit
npm install
npm run dev
```

Pastikan variabel lingkungan pada `foundit/.env` mengarah ke alamat REST API (`http://localhost:8080/api`).

---

## Ringkasan Endpoint API Utama

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/login` | Autentikasi pengguna dan pengambilan token sesi |
| `GET` | `/api/master/categories` | Daftar kategori utama barang |
| `GET` | `/api/master/categories/details/{id}` | Daftar subkategori barang |
| `GET` | `/api/master/banks` | Daftar bank untuk keperluan pencatatan rekening *bounty* |
| `POST` | `/api/reports/found` | Pengajuan laporan barang temuan atau kehilangan |
| `GET` | `/api/reports/found` | Daftar laporan barang temuan publik beserta penyaringan |
| `GET` | `/api/reports/my-posts` | Daftar laporan milik pengguna yang sedang masuk |
| `GET` | `/api/reports/matches/{ticket}` | Daftar kandidat kecocokan berdasarkan nomor tiket |
| `GET` | `/api/officer/dashboard` | Statistik laporan aktif, verifikasi tertunda, dan laporan lewat batas waktu (*overdue*) |
| `GET` | `/api/officer/inventory` | Daftar inventaris fisik pada pusat pengembalian barang |
| `GET` | `/api/officer/compare-claim` | Perbandingan berdampingan antara laporan kehilangan dan barang temuan |
| `POST` | `/api/officer/secure-item/{id}` | Konfirmasi penerimaan fisik barang dari penemu oleh petugas |
| `POST` | `/api/officer/resolve-claim` | Penyelesaian serah terima barang ke pemilik dan pengiriman notifikasi akhir |

---

## Rencana Pengembangan (*Roadmap*)

- **Model Klasifikasi dan Ekstraksi Visual Mandiri**: Menggantikan ketergantungan pada API eksternal berbasis token dengan model *computer vision* internal untuk menekan biaya operasional.
- **Pembacaan Otomatis Kartu Tanda Mahasiswa (KTM)**: Menambahkan modul OCR khusus untuk mengekstrak NIM pada temuan KTM agar sistem dapat langsung menghubungi pemilik melalui pangkalan data mahasiswa tanpa menunggu laporan kehilangan.
- **Sistem Poin Apresiasi Terverifikasi**: Memberikan poin kontribusi bagi mahasiswa yang menyerahkan barang temuan secara valid setelah diverifikasi secara fisik oleh petugas.

---

## Tim Pengembang

**The Phantom Thieves Of Code**
- **Ikhsan** — Arsitektur Sistem, Backend (CodeIgniter 4, MySQL), dan Frontend (React.js, Tailwind CSS)
- **Chiko & Kaisar** — Desain Antarmuka dan Pengalaman Pengguna (Figma)