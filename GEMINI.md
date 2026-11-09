# Knowledge Base & Struktur Proyek

Dokumen ini adalah basis data pengetahuan permanen untuk asisten AI (Antigravity). File ini dibaca secara otomatis pada setiap sesi sehingga asisten memahami peta file proyek secara langsung tanpa perlu melakukan pencarian/scanning berulang.

---

## 1. Ringkasan Proyek & Tech Stack
- **Nama Proyek**: testing
- **Framework**: Next.js 16.4.3 (App Router)
- **Library Inti**: React 19.3.0, React DOM 19.3.0
- **Autentikasi**: NextAuth v4 (`next-auth@^4.24.15`), `bcryptjs`, JWT strategy dengan idle timer watcher (3 menit inaktivitas).
- **Database**: **Supabase (PostgreSQL)** menggunakan `@supabase/supabase-js` (Client SDK di `lib/supabase.js`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Remix Icon (`remixicon`), Lucide Icons (`lucide-react`), Anime.js (`animejs` v4).
- **Fitur Khusus Next.js 16**:
  - Webpack digunakan untuk build Next.js (`next.config.mjs` dan npm scripts)
  - React Compiler aktif (`babel-plugin-react-compiler@1.0.0`)
  - Cache Components & Partial Prefetching (PPR) aktif
  - Middleware conventions: file bernama `proxy.js` (pengganti `middleware.js` lama)
  - Path alias: `@/*` memetakan langsung ke `./*` (`jsconfig.json`)
- **Tujuan Aplikasi**: Web portal panduan troubleshooting & tutorial penanganan gangguan komputer dan jaringan, dilengkapi panel admin untuk CRUD tutorial interaktif beserta upload screenshot, sistem feedback like/unlike, dan preview terminal Command Prompt (CMD).

---

## 2. Skema & Struktur Database (MySQL)

Koneksi database dikelola melalui `lib/db.js` menggunakan variabel lingkungan `.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).

### Tabel: `tutorial_list`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `BIGINT` / `INT` (Primary Key, Auto Increment) | ID unik tutorial |
| `title` | `VARCHAR` | Judul permasalahan troubleshooting |
| `kategori` | `VARCHAR` | Kategori kendala komputer ('Sistem Operasi', 'Hardware & Software', 'Jaringan', 'Storage & Driver') |
| `level` | `VARCHAR` | Tingkat kesulitan solusi ('Pemula', 'Menengah', 'Mahir') |
| `langkah` | `TEXT` | Disimpan sebagai string JSON terstruktur: `{"deskripsi": "...", "command": "...", "imageUrl": "..."}` |
| `suka` | `INT DEFAULT 0` | Jumlah feedback suka |
| `tidak_suka` | `INT DEFAULT 0` | Jumlah feedback tidak suka |

### Tabel: `users`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `BIGINT` / `INT` (Primary Key, Auto Increment) | ID user/admin |
| `username`| `VARCHAR(255)` | Username unik untuk nama sapaan di dashboard |
| `email` | `VARCHAR(255)` | Email autentikasi login |
| `password`| `VARCHAR(255)` | Password yang di-hash dengan `bcryptjs` |

---

## 3. Peta Lengkap Struktur Direktori & File

```text
testing/
├── .env                       # Variabel lingkungan (DB_*, NEXTAUTH_SECRET, NEXTAUTH_URL)
├── .env.local                 # Variabel lingkungan lokal (Supabase NEXT_PUBLIC_SUPABASE_*)
├── AGENTS.md                  # Aturan & instruksi agen sistem
├── GEMINI.md                  # Knowledge base permanen arsitektur dan peta proyek ini
├── eslint.config.mjs          # Konfigurasi linter ESLint v9
├── jsconfig.json              # Konfigurasi alias path (@/* -> ./*)
├── proxy.js                   # Proxy/Middleware Next.js 16 (proteksi rute /dashboard, /tutorialDashboard)
├── next.config.mjs            # Konfigurasi Next.js (turbopack, cacheComponents, partialPrefetching)
├── package.json               # Daftar dependensi & npm scripts
├── package-lock.json          # Dependency lockfile
├── wrangler.jsonc             # Konfigurasi Cloudflare Workers / Wrangler
├── README.md                  # Dokumentasi umum repositori
│
├── data/                      # Direktori data statis/mock JSON
│   └── tutorial.json          # Basis data konten cadangan/mock tutorial
│
├── lib/                       # Utilitas backend & koneksi server-only
│   ├── db.js                  # MySQL Connection Pool (mysql2/promise, Singleton)
│   └── supabase.js            # Supabase Client SDK (@supabase/supabase-js)
│
├── public/                    # Aset statis publik (dapat diakses via URL /...)
│   ├── _headers               # Cache-Control untuk asset statis Next.js
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
│   ├── img/
│   │   └── Illustration.svg   # Ilustrasi vektor perangkat laptop untuk HeroSection
│   └── uploads/               # Aset screenshot lama (upload baru memakai Supabase Storage)
├── open-next.config.ts        # Konfigurasi OpenNext Cloudflare
├── wrangler.jsonc             # Konfigurasi deployment Cloudflare Worker
├── worker-configuration.d.ts  # Tipe binding Worker yang dibuat oleh Wrangler
├── .wrangler/                 # Cache lokal Wrangler (diabaikan Git)
├── .wrangler/                 # Cache lokal Wrangler (diabaikan Git)
│
└── app/                       # Direktori utama Next.js App Router
    ├── favicon.ico            # Favicon situs
    ├── globals.css            # Style Tailwind v4, animasi modal, dan font Barlow
    ├── layout.js              # Root Layout (scroll-smooth, font Barlow, membungkus <AuthProvider>)
    ├── page.js                # Server Component halaman Beranda utama (streaming via Suspense)
    │
    ├── (admin)/               # Route Group Panel Admin (terproteksi proxy.js)
    │   ├── layout.jsx         # Layout admin panel (Sidebar kiri + Konten utama kanan)
    │   ├── dashboard/         # Halaman Dashboard Ringkasan
    │   │   ├── page.jsx       # Server Component dashboard overview (Suspense streaming)
    │   │   ├── Statistik.jsx  # Server Component query COUNT tutorial langsung ke MySQL
    │   │   └── UserGreeting.jsx# Client Component sapaan nama user dari useSession()
    │   └── tutorialDashboard/ # Halaman Manajemen Tutorial Troubleshooting
    │       └── page.jsx       # Client Component CRUD lengkap (fetch API, tabel, modal tambah, edit & preview)
    │
    ├── (auth)/                # Route Group Autentikasi
    │   └── login/             # Halaman Login Admin
    │       ├── page.jsx       # Server Component wrapper halaman login
    │       └── LoginForm.jsx  # Client Component form login berbasis NextAuth credentials
    │
    ├── api/                   # Route Handlers yang dijalankan pada Cloudflare Workers
    │   ├── auth/
    │   │   └── [...nextauth]/
    │   │       └── route.js   # Konfigurasi NextAuth v4 handler (Credentials, MySQL query, JWT session)
    │   └── tutorials/
    │       ├── route.js       # API tutorial; operasi dibatasi sesi admin
    │       └── [id]/
    │           └── route.js   # GET detail, PUT update tutorial (screenshot & JSON), DELETE tutorial by ID
    │
    ├── components/            # Komponen UI global & reusable
    │   ├── AuthProvider.jsx   # Client wrapper SessionProvider + IdleTimerWatcher (auto logout 3 menit)
    │   ├── Header.jsx         # Navbar atas (sticky, logo Dekoruma, search input interaktif)
    │   ├── Footer.jsx         # Footer bawah (copyright dengan getYear cached via 'use cache')
    │   ├── Modal.jsx          # Modal popup solusi (Terminal CMD background hitam & screenshot view)
    │   ├── Search.js          # Server Action pencarian tutorial dengan operator LIKE MySQL
    │   └── Sidebar.jsx        # Sidebar navigasi admin panel (collapsible, route highlighting, logout)
    │
    └── home/                  # Komponen seksi khusus halaman Beranda (app/page.js)
        ├── HeroSection.jsx    # Hero banner utama dengan animasi teks anime.js (SplitText & Timeline)
        ├── CategorySection.jsx# Katalog kartu 4 kategori troubleshooting komputer
        ├── Loading.jsx        # Fallback loading skeleton untuk Suspense
        └── TutorialList.jsx   # Client component daftar kartu tutorial & trigger pop-up Modal solusi
```

---

## 4. Rincian Arsitektur & Tanggung Jawab Komponen

### A. Batasan Server vs Client Component (Aturan Kritis)
1. **Node.js Modules (`mysql2`, `fs`, `path`, `net`)**:
   - `lib/db.js` dan pustaka Node.js lainnya **TIDAK BOLEH** diimpor ke dalam Client Component (`'use client'`).
   - Melanggar aturan ini akan memicu error bundling Turbopack: `Module not found: Can't resolve 'net'`.
   - Client Component yang membutuhkan data database wajib memanggilnya melalui Route Handlers (`/api/...`) atau Server Actions (`'use server'`).
2. **Prerendering & Dynamic Data (`cacheComponents` / PPR)**:
   - Di Next.js 16 dengan `cacheComponents: true`, pemanggilan data dinamis di Server Component (seperti query database `Statistik.jsx` dan `TutorialDB.jsx`) harus dibungkus dengan `<Suspense fallback={...}>` agar tidak menghalangi prerender static shell (*Blocking Route*).
   - Informasi sesi user client-side diisolasi ke dalam sub-komponen Client (`UserGreeting.jsx` menggunakan `useSession()`), sehingga parent page (`dashboard/page.jsx`) tetap beroperasi sebagai Server Component murni.
3. **Inkompatibilitas `export const dynamic`**:
   - Di Next.js 16 dengan `cacheComponents: true`, sintaks `export const dynamic = "force-dynamic"` **tidak boleh digunakan** pada file rute atau API Route Handlers karena bertentangan dengan arsitektur Cache Components. Route Handlers yang menerima argumen request/params sudah otomatis dievaluasi secara dinamis.

### B. Alur Alih Data & Fitur Kunci
1. **Autentikasi & Proteksi**:
   - `proxy.js` menyaring setiap request ke `/admin/:path*`, `/dashboard/:path*`, dan `/tutorialDashboard/:path*`. Pengguna tanpa token sesi akan dialihkan ke `/login`.
   - `AuthProvider.jsx` memantau interaksi pengguna (`mousemove`, `keydown`, `click`). Jika idle selama 3 menit tanpa aktivitas, fungsi `signOut()` akan dipanggil secara otomatis.
2. **Format Data `langkah` pada Tutorial**:
   - Kolom `langkah` pada MySQL menyimpan payload JSON:
     ```json
     {
       "steps": [
         {
           "title": "Langkah 1 — Contoh",
           "description": "Instruksi langkah ini, satu instruksi per baris.",
           "command": "ipconfig /flushdns"
         }
       ],
       "deskripsi": "Langkah pemecahan masalah...",
       "command": "sfc /scannow\ndism /online ...",
       "imageUrl": "/uploads/1700000000-abc.png"
     }
     ```
   - Field `steps` diedit satu per satu di panel admin dan dinavigasi bertahap pada modal. Field lama `deskripsi`, `command`, dan `imageUrl` tetap didukung; deskripsi HTML legacy dengan heading `<h3>` akan diubah menjadi langkah saat dibaca.
   - `lib/tutorial-content.js` membaca struktur `steps` baru serta mengonversi data deskripsi legacy, termasuk heading HTML, tanpa merender HTML mentah. Komponen `Modal.jsx` menampilkan langkah yang dipilih dengan navigasi; perintah tiap langkah ditampilkan oleh `TerminalCommandBox` menyerupai Command Prompt Windows (background `#000000`, prompt `C:\Windows\System32>`, tombol salin).
   - Jika terdapat `imageUrl`, gambar screenshot akan ditampilkan secara proporsional dengan opsi "Buka Gambar Penuh".
   - Terdapat interaksi feedback "Membantu 😁" dan "Tidak Membantu 😔" yang menyimpan hitungan ke tabel `tutorial_list` (`suka` dan `tidak_suka`).

---

## 5. Konvensi & Aturan Pengembangan Masa Depan
1. **Pembaruan Dokumen GEMINI.md**:
   - Setiap kali membuat file baru, memindahkan, atau menghapus berkas, AI **wajib langsung memperbarui** `GEMINI.md` ini agar peta basis data pengetahuan selalu akurat.
2. **Penyimpanan Berkas Upload**:
   - Screenshot baru diunggah ke bucket publik Supabase Storage (default `tutorial-images`); atur bucket yang sama pada `SUPABASE_STORAGE_BUCKET` bila namanya berbeda.
   - Gambar lama yang sudah berada di `public/uploads/` tetap menjadi aset statis legacy.
3. **Bahasa Komunikasi**:
   - Seluruh penjelasan, respons, dan komunikasi kepada pengguna **wajib selalu menggunakan Bahasa Indonesia**.
