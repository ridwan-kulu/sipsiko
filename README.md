<div align="center">

# 🧠 SIPSIKO

### Sistem Pakar Skrining Awal Kesehatan Mental Berbasis Web

SIPSIKO adalah aplikasi web berbasis **Next.js** dan **Supabase** untuk membantu pengguna mengenali indikasi awal gangguan kesehatan mental melalui basis pengetahuan pakar dan metode **Certainty Factor**.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

[Demo](#-deployment-ke-vercel) · [Instalasi](#-instalasi) · [Konfigurasi](#%EF%B8%8F-konfigurasi-supabase) · [Testing](#-testing)

</div>

---

> [!IMPORTANT]
> SIPSIKO merupakan **alat skrining awal dan pendukung keputusan**, bukan alat diagnosis medis. Hasil aplikasi tidak menggantikan pemeriksaan oleh psikolog, psikiater, dokter, atau tenaga kesehatan lainnya. Basis pengetahuan, pertanyaan, aturan, bobot, rekomendasi, dan alur krisis wajib ditinjau tenaga kesehatan sebelum digunakan oleh publik.

## ✨ Fitur Utama

### Untuk pengguna

- Skrining awal tanpa akun.
- Persetujuan penggunaan sebelum memulai.
- Pertanyaan gejala yang diambil secara dinamis dari Supabase.
- Jawaban bertingkat untuk menggambarkan frekuensi atau keyakinan pengguna.
- Perhitungan tingkat kecocokan menggunakan metode Certainty Factor.
- Hasil yang dapat dijelaskan melalui daftar faktor pendukung.
- Alur keselamatan khusus ketika terdeteksi jawaban berisiko.
- Registrasi, login, logout, dan konfirmasi email.
- Penyimpanan serta riwayat hasil skrining bagi pengguna yang login.
- Tampilan responsif untuk desktop dan perangkat seluler.

### Untuk pakar dan admin

- Dashboard basis pengetahuan.
- CRUD kondisi atau indikasi gangguan.
- CRUD gejala dan pertanyaan skrining.
- Pengaturan gejala keselamatan atau krisis.
- CRUD aturan kondisi–gejala.
- Pengaturan bobot pakar antara `0.01` sampai `1.00`.
- Pengaturan gejala wajib dan durasi minimal.
- Audit log perubahan basis pengetahuan.
- Role-based access control untuk `user`, `expert`, dan `admin`.

## 🧮 Metode Certainty Factor

Setiap hubungan antara kondisi dan gejala memiliki bobot dari pakar. Jawaban pengguna dikalikan dengan bobot tersebut:

```text
CF Gejala = CF Pakar × CF Pengguna
```

Beberapa nilai positif kemudian digabungkan:

```text
CF Gabungan = CF Lama + CF Baru × (1 - CF Lama)
```

Contoh:

```text
Gejala A = 0.80 × 0.75 = 0.60
Gejala B = 0.70 × 1.00 = 0.70

CF Gabungan = 0.60 + 0.70 × (1 - 0.60)
            = 0.88 atau 88%
```

Persentase yang ditampilkan adalah **tingkat kecocokan sistem**, bukan probabilitas klinis atau kepastian diagnosis.

## 🛠️ Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 dengan App Router dan Turbopack |
| UI | React 19, Tailwind CSS, Lucide React |
| Bahasa | TypeScript |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | Supabase Row Level Security dan role pengguna |
| Validasi | Zod |
| Unit & component test | Vitest, Testing Library, jsdom |
| End-to-end test | Playwright |
| Deployment | Vercel |

## 🏗️ Arsitektur Singkat

```text
Browser
  │
  ├── Landing, consent, pertanyaan, hasil
  ├── Login, registrasi, dashboard pengguna
  └── Dashboard admin/pakar
  │
Next.js App Router
  │
  ├── Server Components
  ├── Server Actions
  ├── Route Handlers
  └── Mesin inferensi Certainty Factor
  │
Supabase
  ├── PostgreSQL
  ├── Authentication
  ├── Row Level Security
  └── Audit log
```

## 📁 Struktur Project

```text
sipsiko/
├── app/
│   ├── admin/
│   │   ├── aturan/
│   │   ├── audit/
│   │   ├── gejala/
│   │   └── kondisi/
│   ├── api/
│   │   ├── health/
│   │   └── inference/
│   ├── auth/
│   ├── dashboard/
│   ├── daftar/
│   ├── masuk/
│   └── skrining/
│       ├── hasil/
│       ├── persetujuan/
│       └── pertanyaan/
├── components/
│   └── screening/
├── features/
│   ├── admin/
│   ├── inference/
│   └── screening/
├── lib/
│   ├── auth/
│   └── supabase/
├── supabase/
│   └── migrations/
├── e2e/
├── test/
├── proxy.ts
├── next.config.ts
├── playwright.config.ts
└── vitest.config.ts
```

## ✅ Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js 20 atau lebih baru.
- npm 10 atau lebih baru.
- Akun [Supabase](https://supabase.com/).
- Akun [GitHub](https://github.com/).
- Akun [Vercel](https://vercel.com/) untuk deployment.

Periksa versi:

```bash
node --version
npm --version
```

## 🚀 Instalasi

### 1. Clone repository

```bash
git clone https://github.com/ridwan-kulu/sipsiko.git
cd sipsiko
```

### 2. Instal dependency

```bash
npm install
```

### 3. Buat environment file

```bash
cp .env.example .env.local
```

Jika `.env.example` belum tersedia, buat `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server. Jangan menambahkan prefix `NEXT_PUBLIC_`, jangan commit `.env.local`, dan jangan menampilkan nilainya di browser atau log.

## ⚙️ Konfigurasi Supabase

### 1. Buat project

1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih **New project**.
3. Isi nama project dan password database.
4. Pilih region terdekat.
5. Tunggu proses provisioning selesai.

### 2. Ambil API credentials

Buka:

```text
Project Settings → API
```

Salin Project URL, anon/publishable key, dan service-role key ke `.env.local`.

### 3. Jalankan migration

Jalankan seluruh file SQL dalam folder berikut secara berurutan melalui Supabase SQL Editor:

```text
supabase/migrations/
├── 001_initial_schema.sql
├── 002_seed_knowledge_base.sql
├── 003_staff_access.sql
├── 004_staff_read_access.sql
└── 005_production_security.sql
```

Migration membuat tabel utama:

```text
profiles
conditions
symptoms
rules
consultations
answers
results
audit_logs
```

### 4. Atur Authentication URL

Buka:

```text
Supabase → Authentication → URL Configuration
```

Untuk development:

```text
Site URL     : http://localhost:3000
Redirect URL : http://localhost:3000/auth/callback
```

### 5. Jadikan akun sebagai admin

Daftarkan akun melalui aplikasi, lalu jalankan SQL berikut. Ganti email dengan email admin:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'EMAIL_ADMIN'
);
```

Periksa role:

```sql
select
  auth.users.email,
  profiles.full_name,
  profiles.role
from auth.users
join public.profiles
  on profiles.id = auth.users.id;
```

## ▶️ Menjalankan Aplikasi

Development server biasa:

```bash
npm run dev
```

Jika environment membatasi deteksi network interface:

```bash
npm run dev:e2e
```

Buka:

```text
http://localhost:3000
```

Endpoint pemeriksaan database:

```text
http://localhost:3000/api/health
```

Respons yang diharapkan:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🧪 Testing

### Unit dan component test

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

Laporan HTML tersedia di:

```text
coverage/index.html
```

### End-to-end test

Instal browser Playwright:

```bash
npx playwright install chromium
```

Pada Debian atau Ubuntu:

```bash
npx playwright install --with-deps chromium
```

Jalankan E2E:

```bash
npm run test:e2e
```

Buka laporan:

```bash
npx playwright show-report
```

### Quality gate

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Atau jika script `check` tersedia:

```bash
npm run check
```

## 📦 Production Build

Buat build produksi:

```bash
npm run build
```

Jalankan secara lokal:

```bash
npm run start
```

Buka:

```text
http://localhost:3000
```

## ☁️ Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Prepare production deployment"
git branch -M main
git push -u origin main
```

### 2. Import ke Vercel

1. Buka [Vercel](https://vercel.com/).
2. Pilih **Add New → Project**.
3. Import repository `ridwan-kulu/sipsiko`.
4. Pastikan framework terdeteksi sebagai Next.js.
5. Gunakan `npm run build` sebagai Build Command.
6. Klik **Deploy**.

### 3. Tambahkan environment variables

Buka:

```text
Vercel → Project → Settings → Environment Variables
```

Tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://NAMA-PROJECT.vercel.app
```

Terapkan untuk Production, Preview, dan Development sesuai kebutuhan. Lakukan redeploy setelah mengubah environment variables.

### 4. Perbarui URL Supabase Auth

```text
Site URL:
https://NAMA-PROJECT.vercel.app

Redirect URLs:
https://NAMA-PROJECT.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

Jika menggunakan custom domain, tambahkan:

```text
https://domain-anda.com/auth/callback
```

## 🔐 Keamanan dan Privasi

- Row Level Security harus aktif pada seluruh tabel sensitif.
- Pengguna hanya dapat membaca konsultasi dan hasil milik sendiri.
- Bobot pakar hanya dibaca oleh kode server.
- Service-role key tidak boleh masuk ke browser atau Git.
- Endpoint inferensi menggunakan `Cache-Control: no-store`.
- Jangan mencatat jawaban pengguna ke application log.
- Batasi ukuran request dan validasi seluruh input di server.
- Audit setiap perubahan kondisi, gejala, dan aturan.
- Gunakan HTTPS pada production.
- Terapkan kebijakan retensi dan penghapusan data.
- Tinjau regulasi perlindungan data yang berlaku di wilayah operasional.

## 🧑‍⚕️ Validasi Klinis

Sebelum digunakan publik, lakukan:

1. Review pertanyaan oleh psikolog atau psikiater.
2. Review kondisi, gejala, aturan, dan bobot pakar.
3. Uji kasus bersama tenaga kesehatan.
4. Evaluasi false positive dan false negative.
5. Review bahasa agar tidak menstigma pengguna.
6. Review alur keselamatan dan kontak bantuan darurat.
7. Dokumentasikan versi basis pengetahuan yang digunakan.

## 🗺️ Roadmap

- [x] Landing page dan persetujuan.
- [x] Pertanyaan skrining dinamis.
- [x] Mesin inferensi Certainty Factor.
- [x] Hasil dengan faktor pendukung.
- [x] Supabase Auth dan riwayat pengguna.
- [x] Dashboard admin/pakar.
- [x] CRUD kondisi, gejala, dan aturan.
- [x] Audit log.
- [x] Unit, component, dan E2E test.
- [ ] Validasi klinis formal.
- [ ] Versioning basis pengetahuan.
- [ ] Rate limiting terdistribusi.
- [ ] Ekspor laporan pengguna.
- [ ] Observability dan alerting produksi.
- [ ] Audit keamanan independen.

## 🤝 Kontribusi

1. Fork repository.
2. Buat branch fitur:

   ```bash
   git checkout -b feature/nama-fitur
   ```

3. Commit perubahan:

   ```bash
   git commit -m "Add nama fitur"
   ```

4. Push branch:

   ```bash
   git push origin feature/nama-fitur
   ```

5. Buka Pull Request.

Pastikan lint, test, dan build berhasil sebelum membuat Pull Request.

## ⚠️ Disclaimer

SIPSIKO tidak memberikan diagnosis, resep, atau keputusan medis. Dalam kondisi darurat atau jika terdapat risiko menyakiti diri sendiri maupun orang lain, segera hubungi layanan darurat setempat, tenaga kesehatan, atau orang yang dipercaya.

---

<div align="center">

Dibangun dengan Next.js, TypeScript, Supabase, dan perhatian terhadap keselamatan pengguna.

**SIPSIKO — pahami indikasi, tentukan langkah berikutnya.**

</div>
