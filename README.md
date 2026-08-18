This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Local Development

First, copy `.env.local` to `.env` or configure it directly, then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

### Docker Compose (Quick Start)

Untuk memasang dan menjalankan aplikasi beserta database PostgreSQL lokal secara cepat menggunakan Docker Compose, Anda hanya perlu menjalankan satu perintah.

#### Prasyarat
Pastikan Anda sudah menginstal:
- [Docker](https://www.docker.com/products/docker-desktop/)
- Docker Compose

#### Langkah Menjalankan
1. Di direktori root proyek, jalankan perintah berikut:
   ```bash
   docker-compose up --build -d
   ```
2. Docker akan secara otomatis:
   - Membuat container database PostgreSQL (`daily_report_db`).
   - Melakukan healthcheck untuk memastikan database sudah siap menerima koneksi.
   - Membangun image Next.js (`daily_report_web`).
   - Menjalankan migrasi Prisma database secara otomatis (`npx prisma migrate deploy`).
   - Memasukkan data awal uji coba (seeding) otomatis (`npx prisma db seed`).
   - Menjalankan aplikasi pada port `3000`.

3. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

#### Data Login Uji Coba (Seed)
Aplikasi sudah terisi data akun awal yang siap pakai setelah proses *seeding* selesai:
- **Manager/Admin**:
  - Email: `admin@demo.com`
  - Password: `password123`
- **Karyawan 1**:
  - Email: `user@demo.com`
  - Password: `password123`
- **Karyawan 2**:
  - Email: `user2@demo.com`
  - Password: `password123`

#### Mematikan Layanan
Untuk menghentikan dan menghapus container yang sedang berjalan:
```bash
docker-compose down
```
Untuk menghentikan dan menghapus data database yang tersimpan di volume:
```bash
docker-compose down -v
```

