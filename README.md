# Troubleshooting Web

Portal tutorial troubleshooting berbasis Next.js App Router, Supabase, dan OpenNext untuk Cloudflare Workers.

## Pengembangan lokal

1. Pasang dependensi:

   ```bash
   npm ci
   ```

2. Buat `.env.local` untuk Next.js dan isi variabel yang tercantum di bagian konfigurasi.
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
3. Untuk `npm run preview:worker`, buat `.dev.vars` di root proyek dengan variabel yang sama. `.dev.vars` dipakai Wrangler saat Worker lokal berjalan; `.env.local` dipakai Next.js saat development dan build. Keduanya tidak boleh di-commit.
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

Untuk Next.js dev/build lokal, simpan nilai di `.env.local`. Untuk preview Worker lokal, isi `.dev.vars` dengan nama dan nilai yang sama. Untuk production, atur di Cloudflare Worker Settings → Variables and Secrets.

| Nama | Jenis | Kegunaan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` atau `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Variable | Key publik Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Operasi API admin dan Storage; jangan expose ke browser |
| `SUPABASE_STORAGE_BUCKET` | Variable (opsional) | Nama bucket gambar; default `tutorial-images` |
| `NEXTAUTH_SECRET` | **Secret** | Penandatanganan sesi NextAuth |
| `NEXTAUTH_URL` | Variable | URL Worker publik, misalnya `https://troubleshooting-web.<akun>.workers.dev` |

Upload screenshot dibatasi hingga 5 MB dan menerima JPEG, PNG, WebP, atau GIF. Berkas baru disimpan di Supabase Storage, bukan filesystem Worker.
