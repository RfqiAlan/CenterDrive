**centerDrive**

Product Requirements Document

Google Drive Multi-Account Dashboard

| **Versi** | **Status** | **Tanggal** | **Penulis** |
| --------- | ---------- | ----------- | ----------- |
| 1.0.0     | Draft      | Juni 2025   | Tim Product |

# **1\. Ringkasan Eksekutif**

centerDrive adalah aplikasi web dashboard terpusat yang memungkinkan pengguna mengelola dan mengakses beberapa folder Google Drive dari berbagai akun dalam satu antarmuka tunggal. Alih-alih berpindah antar akun Google, pengguna cukup menempelkan link Google Drive dan langsung mendapatkan preview folder serta akses navigasi ke file di dalamnya.

**Masalah utama yang diselesaikan:**

- Pengguna dengan banyak akun Google harus login-logout berulang kali untuk mengakses drive berbeda
- Tidak ada satu tempat untuk melihat semua folder Drive dari berbagai akun/entitas sekaligus
- Manajemen akses dan konteks sulit dilakukan saat ada banyak stakeholder (aktor A, aktor B, dll.)

**Solusi centerDrive:**

- Sidebar dinamis dengan section per Google Drive yang ditambahkan pengguna
- Input cukup paste link folder Google Drive, sistem langsung membaca dan menampilkan preview
- Embed viewer untuk melihat isi folder tanpa harus pindah ke tab baru

# **2\. Tujuan Produk**

## **2.1 Tujuan Bisnis**

- Mengurangi waktu yang dihabiskan berpindah antar akun Google Drive hingga 70%.
- Meningkatkan produktivitas tim yang bekerja dengan banyak akun/entitas Drive.
- Menyediakan satu sumber kebenaran (single pane of glass) untuk semua aset Drive.

## **2.2 Tujuan Pengguna**

- Pengguna dapat menambahkan folder Google Drive hanya dengan paste link URL.
- Pengguna dapat melihat isi folder Drive (preview) langsung di dalam dashboard.
- Pengguna dapat mengorganisir section berdasarkan konteks (aktor, akun, proyek).
- Pengguna dapat mengganti nama, menghapus, dan mengatur ulang urutan section.

## **2.3 KPI Keberhasilan**

| **Metrik**             | **Target (3 bulan)** | **Cara Ukur**   |
| ---------------------- | -------------------- | --------------- |
| Waktu onboarding       | < 2 menit            | Analytics event |
| Rata-rata section/user | \> 3 section         | DB aggregate    |
| Retention D7           | \> 40%               | Cohort analysis |
| Error rate API         | < 1%                 | Server logs     |

# **3\. Pengguna & Persona**

## **3.1 Persona Utama: Koordinator Multi-Akun**

Seorang koordinator produksi, manajer proyek, atau admin yang mengelola beberapa entitas/aktor dan masing-masing memiliki akun Google Drive terpisah. Mereka sering kehilangan waktu karena harus berpindah tab atau akun Google untuk mencari file.

## **3.2 Persona Sekunder: Tim Kolaboratif**

Tim yang bekerja bersama di mana setiap anggota tim memiliki folder Drive masing-masing namun perlu satu orang yang melihat semua folder secara bersamaan untuk keperluan review atau pengumpulan aset.

## **3.3 User Journey Utama**

- Pengguna membuka centerDrive dan login.
- Pengguna menekan tombol '+ Tambah Drive' di sidebar.
- Pengguna memasukkan nama section (misal: 'Aktor A - Akun 1') dan paste link Google Drive.
- Section baru muncul di sidebar. Pengguna mengklik section tersebut.
- Panel utama menampilkan preview embed Google Drive folder tersebut.
- Pengguna dapat berpindah antar section tanpa perlu reload halaman.

# **4\. Fitur & Spesifikasi Fungsional**

## **4.1 Sidebar - Manajemen Section**

### **4.1.1 Menambah Section Baru**

- Tombol '+ Tambah Drive' selalu visible di bagian atas atau bawah sidebar.
- Modal/panel slide-in muncul dengan dua field: Nama Section dan URL Google Drive.
- Validasi URL: harus dimulai dengan <https://drive.google.com/drive/folders/> atau <https://drive.google.com/drive/u/{n}/folders/>.
- Setelah submit, section langsung muncul di sidebar tanpa reload.

### **4.1.2 Struktur Section di Sidebar**

- Setiap section ditampilkan sebagai item list dengan ikon Drive, nama section, dan tombol aksi (edit, hapus).
- Section yang sedang aktif diberi highlight visual.
- Sidebar dapat di-scroll jika section lebih dari kapasitas layar.
- Sidebar dapat di-collapse/expand untuk memberi ruang lebih pada panel preview.

### **4.1.3 Edit & Hapus Section**

- Klik ikon edit: nama section dapat diubah inline atau via modal.
- Klik ikon hapus: muncul konfirmasi sebelum section dihapus.
- Perubahan tersimpan ke backend dan persist saat refresh.

### **4.1.4 Drag-and-Drop Urutan Section (nice-to-have v1.1)**

- Pengguna dapat mengubah urutan section di sidebar dengan drag-and-drop.
- Urutan tersimpan di backend.

## **4.2 Panel Utama - Preview Google Drive**

### **4.2.1 Mode Embed (Google Drive iFrame Viewer)**

Google Drive folder dengan visibilitas publik atau 'anyone with the link can view' dapat di-embed menggunakan URL format:

<https://drive.google.com/embeddedfolderview?id={FOLDER_ID}&usp=sharing>

- Backend mengekstrak FOLDER_ID dari URL yang diinput pengguna.
- Frontend merender iframe dengan src URL embed tersebut.
- Dimensi iframe: full width panel utama, height minimal 600px, auto-resize.

### **4.2.2 Mode Fallback (Folder Info Card)**

Jika folder bersifat private (embed ditolak oleh Google / X-Frame-Options), sistem menampilkan Folder Info Card yang berisi:

- Nama folder (dari URL atau label yang diinput pengguna).
- Tombol 'Buka di Google Drive' (opens in new tab).
- Pesan informatif: 'Folder ini bersifat private. Buka langsung di Google Drive.'
- Deteksi mode dilakukan di frontend: jika iframe gagal load (error event), tampilkan fallback card.

### **4.2.3 State Kosong (Empty State)**

- Saat belum ada section: tampilkan ilustrasi dan pesan onboarding dengan tombol 'Tambah Drive Pertamamu'.
- Saat section dipilih tapi URL belum dikonfigurasi: tampilkan panduan.

## **4.3 Autentikasi Pengguna**

- Login menggunakan Google OAuth 2.0.
- Sesi tersimpan menggunakan JWT (JSON Web Token) di httpOnly cookie.
- Refresh token untuk menjaga sesi tetap aktif.
- Logout menghapus token dan redirect ke halaman login.
- Data section per pengguna terisolasi (tidak ada akses silang antar user).

## **4.4 Persistensi Data**

- Semua section (nama, URL, urutan) tersimpan di database server, bukan localStorage.
- Data diambil saat halaman pertama kali dimuat (GET /api/sections).
- Setiap perubahan (tambah, edit, hapus, urut) langsung di-sync ke server.

# **5\. Arsitektur Teknis**

## **5.1 Stack Teknologi**

| **Layer**        | **Teknologi**                | **Keterangan**             |
| ---------------- | ---------------------------- | -------------------------- |
| Frontend         | React 18 + Vite + TypeScript | SPA, fast HMR development  |
| State Management | Zustand atau React Query     | Global state + server sync |
| Styling          | Tailwind CSS                 | Utility-first, konsisten   |
| Backend          | Node.js + Express.js         | REST API server            |
| Database         | PostgreSQL                   | Relasional, ACID compliant |
| ORM              | Prisma                       | Type-safe DB queries       |
| Auth             | Passport.js + Google OAuth   | OAuth 2.0 flow             |
| Deployment FE    | Vercel / Netlify             | Static hosting + CDN       |
| Deployment BE    | Railway / Render / VPS       | Node.js runtime hosting    |

## **5.2 Struktur Folder Project**

### **Frontend (React)**

centerdrive-frontend/

src/

components/ # Komponen reusable (Sidebar, DriveSection, Modal, etc.)

pages/ # Halaman utama (Dashboard, Login)

hooks/ # Custom hooks (useSections, useAuth)

services/ # API client (axios/fetch wrappers)

store/ # Zustand store

utils/ # Helper (URL parser, validator)

types/ # TypeScript interfaces

### **Backend (Express)**

centerdrive-backend/

src/

routes/ # Express routers (auth, sections, health)

controllers/ # Request handlers

middlewares/ # Auth guard, error handler, rate limiter

services/ # Business logic (drive URL parser)

prisma/ # Schema & migrations

utils/ # JWT, validators

## **5.3 Schema Database (Prisma)**

**Model User:**

id String @id @default(uuid())

googleId String @unique

email String @unique

name String

avatar String?

createdAt DateTime @default(now())

sections Section\[\]

**Model Section:**

id String @id @default(uuid())

userId String

label String # Nama section, misal 'Aktor A - Akun 1'

driveUrl String # Full URL Google Drive folder

folderId String # Extracted folder ID dari URL

order Int @default(0) # Urutan di sidebar

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

user User @relation(...)

# **6\. Spesifikasi API**

## **6.1 Authentication Endpoints**

| **Method** | **Endpoint**          | **Auth?** | **Deskripsi**                         |
| ---------- | --------------------- | --------- | ------------------------------------- |
| GET        | /auth/google          | Tidak     | Redirect ke halaman OAuth Google      |
| GET        | /auth/google/callback | Tidak     | Callback Google OAuth, set JWT cookie |
| POST       | /auth/logout          | Ya        | Hapus session & cookie                |
| GET        | /auth/me              | Ya        | Ambil data user yang sedang login     |

## **6.2 Sections CRUD Endpoints**

| **Method** | **Endpoint**          | **Body / Params**     | **Response**                |
| ---------- | --------------------- | --------------------- | --------------------------- |
| GET        | /api/sections         | \-                    | Array semua section user    |
| POST       | /api/sections         | { label, driveUrl }   | Section baru yang dibuat    |
| PUT        | /api/sections/:id     | { label?, driveUrl? } | Section yang telah diupdate |
| DELETE     | /api/sections/:id     | \-                    | { success: true }           |
| PUT        | /api/sections/reorder | { ids: string\[\] }   | Array section urutan baru   |

## **6.3 Utility Endpoints**

| **Method** | **Endpoint**     | **Body**        | **Response**                    |
| ---------- | ---------------- | --------------- | ------------------------------- |
| POST       | /api/drive/parse | { url: string } | { folderId, embedUrl, isValid } |
| GET        | /health          | \-              | { status: 'ok', uptime }        |

## **6.4 Logika Parse URL Google Drive**

Backend mendukung format URL berikut dan mengekstrak folder ID:

- <https://drive.google.com/drive/folders/{FOLDER_ID}>
- <https://drive.google.com/drive/folders/{FOLDER_ID}?usp=sharing>
- <https://drive.google.com/drive/u/0/folders/{FOLDER_ID}>
- <https://drive.google.com/drive/u/1/folders/{FOLDER_ID}>

Setelah folder ID diekstrak, embed URL yang dihasilkan:

<https://drive.google.com/embeddedfolderview?id={FOLDER_ID}&usp=sharing>

# **7\. Desain UI/UX**

## **7.1 Layout Utama**

Aplikasi menggunakan layout dua kolom:

- Sidebar (kiri, lebar 280px, dapat di-collapse): daftar section Drive, tombol tambah, info user, tombol logout.
- Panel Utama (kanan, sisa lebar): header breadcrumb section aktif + embed viewer / fallback card.

## **7.2 Wireframe Deskriptif**

### **Sidebar**

\[logo centerDrive\] \[hamburger\]

\[+ Tambah Drive\]

\[drive icon\] Aktor A - Akun 1 \[edit\]\[del\]

\[drive icon\] Aktor A - Akun 2 \[edit\]\[del\]

\[drive icon\] Aktor B - Akun 1 \[edit\]\[del\]

\--- (scrollable) ---

\[avatar\] Nama User \[logout\]

### **Panel Utama**

Aktor A - Akun 1 / \[buka di Drive ↗\]

\----------------------------------------------

| |

| \[Google Drive Embed iFrame\] |

| Menampilkan isi folder secara langsung |

| |

\----------------------------------------------

## **7.3 Modal Tambah Drive**

Form input dengan field:

- Nama Section (text input, required, max 60 karakter)
- URL Google Drive (text/URL input, required, dengan validasi real-time)
- Indikator validasi: ikon centang hijau jika URL valid, ikon silang merah jika tidak valid
- Tombol 'Simpan' (disabled jika form tidak valid) dan 'Batal'

## **7.4 Penanganan Error UI**

- URL tidak valid: pesan error inline di bawah field URL.
- Folder private (embed gagal): tampilkan fallback card dengan tombol buka di Drive.
- Koneksi gagal ke backend: toast notification error.
- Loading state: skeleton placeholder saat section sedang dimuat.

# **8\. Keamanan & Privasi**

## **8.1 Keamanan Autentikasi**

- JWT disimpan di httpOnly cookie, bukan localStorage (mencegah XSS).
- CSRF protection menggunakan csurf middleware di Express.
- Sesi expire dalam 7 hari, refresh token dalam 30 hari.
- HTTPS wajib di production (enforce via redirect + HSTS header).

## **8.2 Keamanan Data**

- Setiap query database otomatis terfilter berdasarkan userId (Prisma middleware).
- Input validation menggunakan Zod di backend sebelum menyentuh database.
- Rate limiting: 100 request/menit per IP menggunakan express-rate-limit.
- Helmet.js untuk mengatur security headers (CSP, X-Frame-Options, etc.).

## **8.3 Privasi Pengguna**

- URL Google Drive yang disimpan hanya digunakan untuk generate embed URL.
- Tidak ada konten file yang disimpan di server centerDrive.
- Preview file ditampilkan langsung dari Google Drive via embed, tidak diproxy.
- Pengguna dapat menghapus semua datanya dengan menghapus akun.

# **9\. Roadmap & Milestones**

| **Milestone** | **Durasi** | **Deliverable Utama**                                            | **PIC**        |
| ------------- | ---------- | ---------------------------------------------------------------- | -------------- |
| M1 - Setup    | 1 minggu   | Boilerplate React + Express, DB schema, CI/CD                    | Full-stack Dev |
| M2 - Auth     | 1 minggu   | Google OAuth, JWT, halaman login                                 | Backend Dev    |
| M3 - Core     | 2 minggu   | CRUD section, sidebar, URL parser, embed viewer                  | Full-stack Dev |
| M4 - Polish   | 1 minggu   | Empty state, error handling, loading skeleton, mobile responsive | Frontend Dev   |
| M5 - QA       | 1 minggu   | Testing, bug fix, security review, staging deploy                | QA + Dev       |
| M6 - Launch   | 1 minggu   | Production deploy, monitoring setup, onboarding docs             | All            |

**Total estimasi: 7 minggu dari kickoff hingga production launch.**

# **10\. Batasan & Out of Scope (v1.0)**

## **Yang TIDAK termasuk dalam v1.0:**

- Upload file ke Google Drive langsung dari centerDrive.
- Integrasi dengan layanan cloud storage lain (Dropbox, OneDrive, Box).
- Berbagi session/dashboard antar pengguna (multi-user workspace).
- Notifikasi perubahan file di Drive (webhook-based).
- Pencarian file lintas Drive dari dalam centerDrive.
- Akses offline / PWA.
- Drag-and-drop reorder section (dijadwalkan v1.1).

# **11\. Asumsi & Risiko**

## **11.1 Asumsi**

- Pengguna memiliki folder Google Drive yang sudah diset ke 'Anyone with the link can view' untuk fitur embed berfungsi optimal.
- Google tidak mengubah struktur URL folder Drive secara signifikan.
- Google Drive embed viewer tetap tersedia dan tidak di-deprecate.

## **11.2 Risiko & Mitigasi**

| **Risiko**                                 | **Kemungkinan** | **Mitigasi**                                |
| ------------------------------------------ | --------------- | ------------------------------------------- |
| Google memblokir embed (X-Frame-Options)   | Sedang          | Fallback card + link langsung ke Drive      |
| Perubahan format URL Google Drive          | Rendah          | URL parser modular, mudah diupdate          |
| Overload server akibat banyak iframe load  | Rendah          | iframe dimuat lazy (IntersectionObserver)   |
| Kebocoran data user jika JWT dikompromikan | Rendah          | httpOnly cookie, token rotation, rate limit |

# **12\. Approval & Revision History**

| **Versi** | **Tanggal** | **Perubahan** | **Disetujui oleh** |
| --------- | ----------- | ------------- | ------------------ |
| 1.0.0     | Juni 2025   | Initial draft | -                  |

Dokumen ini merupakan dokumen hidup (living document) dan akan diperbarui seiring perkembangan produk. Setiap perubahan signifikan memerlukan persetujuan Product Owner dan Tech Lead.