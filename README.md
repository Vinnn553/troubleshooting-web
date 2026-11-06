# Troubleshooting Web

Portal tutorial troubleshooting berbasis Next.js App Router, Supabase, dan OpenNext untuk Cloudflare Workers.

## Pengembangan lokal

1. Pasang dependensi:

   ```bash
   npm ci
   ```

2. Buat `.env.local` untuk variabel Next.js yang umum. Untuk development dengan `npm run dev`, `.env.development.local` mengatur `NEXTAUTH_URL` ke `http://localhost:3000` agar sesi dan redirect tetap berada di host lokal.
3. Jalankan server:

   ```bash
   npm run dev
   ```

Server lokal tersedia di `http://localhost:3000`.

## Deploy ke Cloudflare Workers

Aplikasi memakai rendering server, Route Handlers, autentikasi, dan upload, sehingga harus dideploy sebagai **Cloudflare Worker**, bukan Cloudflare Pages static export.

### Pengaturan CI/CD Cloudflare

Jika repository terhubung ke Cloudflare Workers Builds, gunakan:

- **Build command:** `npm run build:worker`
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** direktori proyek yang berisi `package.json` dan `wrangler.jsonc`

Jangan gunakan `npm run build` sebagai build command CI: perintah itu hanya menjalankan `next build` dan tidak membuat output adapter `.open-next/` yang diperlukan oleh deploy. `npm run build:worker` menjalankan build Next.js sekaligus menghasilkan bundle Worker OpenNext.

1. Buat bucket R2 bernama `web-troubleshoot-nextjs-open-next-cache` (atau ubah `bucket_name` di `wrangler.jsonc`).
2. Siapkan Worker dengan nama `troubleshooting-web`, sesuai nilai `name` dan self-reference service di `wrangler.jsonc`.
3. Untuk `npm run preview:worker`, buat `.dev.vars` di root proyek dan atur `NEXTAUTH_URL` ke `http://localhost:8787` (atau origin/port yang ditampilkan Wrangler). `.dev.vars` dipakai Worker lokal, sedangkan `.env.local` dipakai Next.js saat build. Keduanya tidak boleh di-commit.
4. Tambahkan variabel dan secrets di Cloudflare Worker Settings → Variables and Secrets. Variabel `NEXT_PUBLIC_*` harus tersedia di environment build Cloudflare karena nilainya dimasukkan ke bundle browser.
5. Pastikan project Supabase memiliki bucket Storage `tutorial-images` yang dapat dibaca publik, dan kebijakan RLS tabel `tutorial_list` mengizinkan pembacaan tutorial publik.
6. Uji sebelum deploy:

   ```bash
   npm run build:worker
   npm run preview:worker
   ```

7. Deploy setelah seluruh konfigurasi sudah siap:

   ```bash
   npm run deploy
   ```

Jangan gunakan konfigurasi build Cloudflare Pages seperti `npx next build` dan direktori output statis `out`; OpenNext menghasilkan Worker dan asset di `.open-next/`.

### Variabel dan secrets

Simpan variabel umum untuk Next.js di `.env.local`, lalu atur URL sesuai runtime: development Next.js menggunakan `.env.development.local` dengan `http://localhost:3000`; preview Worker lokal menggunakan `.dev.vars` dengan origin/port Wrangler; production menggunakan Cloudflare Worker Settings → Variables and Secrets dengan URL Worker publik. Jangan gunakan URL Worker production untuk `npm run dev`, atau URL localhost untuk production.

| Nama | Jenis | Kegunaan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` atau `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Variable | Key publik Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Operasi API admin dan Storage; jangan expose ke browser |
| `SUPABASE_STORAGE_BUCKET` | Variable (opsional) | Nama bucket gambar; default `tutorial-images` |
| `NEXTAUTH_SECRET` | **Secret** | Penandatanganan sesi NextAuth |
| `NEXTAUTH_URL` | Variable | Origin aplikasi untuk runtime terkait: `http://localhost:3000` (Next.js dev), origin Wrangler (preview Worker), atau URL Worker publik (production) |

Upload screenshot dibatasi hingga 5 MB dan menerima JPEG, PNG, WebP, atau GIF. Berkas baru disimpan di Supabase Storage, bukan filesystem Worker.
