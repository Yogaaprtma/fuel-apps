# 🛢️ Fuel Delivery System (FDS) - Yoga Adi Pratama
 
> Sistem pelacakan distribusi bahan bakar berbasis web — real-time GPS tracking, anti-fraud geofencing, dan bukti pengiriman digital.
 
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
 
---

## 📋 Daftar Isi
 
- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Akun Demo](#-akun-demo)
- [API Endpoints](#-api-endpoints)
- [Alur Status Pengiriman](#-alur-status-pengiriman)
- [Role & Hak Akses](#-role--hak-akses)
- [Skema Database](#-skema-database)
- [Testing](#-testing)
- [Screenshot](#-screenshot)
 
---

## 🚀 Tentang Proyek
 
**Fuel Delivery System (FDS)** adalah aplikasi web full-stack untuk memantau distribusi bahan bakar secara transparan dan real-time. Sistem ini dirancang untuk mengelola seluruh siklus pengiriman — dari pembuatan order hingga konfirmasi penerimaan — dengan validasi anti-fraud berbasis GPS.
 
### Masalah yang Diselesaikan
- Ketidaktransparanan status pengiriman bahan bakar
- Tidak ada validasi lokasi saat konfirmasi pengiriman
- Tidak ada bukti digital yang bisa diverifikasi
- Sulit memantau posisi driver secara real-time
 
---

## ✨ Fitur Utama
 
### 🔐 Autentikasi & Otorisasi
- Login/logout dengan Laravel Sanctum (Bearer Token)
- Role-based access control via Spatie Permission
- 4 peran: Super Admin, Admin Operasional, Driver, Customer
 
### 📦 Manajemen Pengiriman
- CRUD delivery dengan kode unik otomatis (`FDS-YYYYMMDD-NNN`)
- Assign driver ke delivery
- Filter & pencarian delivery
- Statistik dashboard real-time
 
### 🔄 Alur Status (Anti-Skip)
- 6 tahap status yang ketat: `CREATED → PACKED → IN_TRANSIT → NEAR_DESTINATION → DELIVERED → COMPLETED`
- Status tidak bisa dilewati (anti-skip validation)
- Auto-transisi ke `NEAR_DESTINATION` saat driver dalam radius 500m
 
### 📍 GPS Tracking
- Tracking posisi driver secara real-time via `navigator.geolocation`
- Riwayat perjalanan tersimpan sebagai polyline di peta
- Peta interaktif dengan Leaflet.js + OpenStreetMap
 
### 🔒 Anti-Fraud Geofencing
- Validasi radius geofence saat konfirmasi `DELIVERED`
- Status `DELIVERED` hanya bisa diset jika driver dalam radius yang ditentukan
- Jarak dan validasi geofence tersimpan di bukti pengiriman
 
### 📸 Bukti Pengiriman
- Upload foto dengan GPS tagging otomatis
- Tanda tangan digital (base64)
- Proof of Delivery dengan validasi geofence
 
### 🌐 Public Tracking
- Halaman tracking publik tanpa perlu login
- Customer bisa cek status via kode pengiriman
- Stepper progress visual
 
---

## 🛠 Tech Stack
 
### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| PHP | 8.2+ | Runtime |
| Laravel | 12.x | Framework |
| Laravel Sanctum | 4.x | API Authentication |
| Spatie Permission | 6.x | Role & Permission |
| MySQL | 8.x | Database |
 
### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| React | 19.x | UI Library |
| Vite | 8.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Zustand | 5.x | State Management |
| Axios | 1.x | HTTP Client |
| React Router DOM | 7.x | Routing |
| Leaflet.js | 1.9.x | Peta Interaktif |
| Lucide React | 1.x | Icon Library |
| React Hot Toast | 2.x | Notifikasi |
 
---

## 📁 Struktur Proyek
 
```
fuel-apps/
├── fuel-backend/                   # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── AuthController.php
│   │   │       ├── DeliveryController.php
│   │   │       ├── DeliveryStatusController.php
│   │   │       ├── TrackingController.php
│   │   │       ├── PhotoController.php
│   │   │       ├── ProofOfDeliveryController.php
│   │   │       └── UserController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Delivery.php
│   │       ├── DeliveryLocation.php
│   │       ├── DeliveryPhoto.php
│   │       ├── DeliveryStatusLog.php
│   │       └── ProofOfDelivery.php
│   ├── database/
│   │   ├── migrations/             # 6 migration files
│   │   └── seeders/
│   │       └── DatabaseSeeder.php
│   ├── routes/
│   │   └── api.php
│   ├── config/
│   │   └── cors.php
│   └── bootstrap/
│       └── app.php
│
└── fuel-frontend/                  # React + Vite
    ├── src/
    │   ├── services/
    │   │   └── api.js              # Axios instance + semua API calls
    │   ├── store/
    │   │   ├── authStore.js        # Zustand auth state
    │   │   └── deliveryStore.js    # Zustand delivery state
    │   ├── components/
    │   │   ├── AppLayout.jsx       # Layout + sidebar + bottom nav
    │   │   ├── StatusBadge.jsx
    │   │   ├── StatusTimeline.jsx
    │   │   ├── DeliveryMap.jsx     # Leaflet map component
    │   │   ├── PhotoUpload.jsx
    │   │   └── StatusUpdatePanel.jsx
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── DeliveriesPage.jsx
    │       ├── DeliveryCreate.jsx
    │       ├── DeliveryDetail.jsx
    │       ├── TrackingPage.jsx
    │       ├── DriverPage.jsx
    │       ├── CustomerTrackPage.jsx
    │       ├── ProfilePage.jsx
    │       └── UsersPage.jsx
    ├── tailwind.config.js
    ├── .env
    └── package.json
```
 
---

## 💻 Persyaratan Sistem
 
Pastikan sudah terinstall:
 
- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.x
- **Git**
 
---

## 📦 Instalasi
 
### 1. Clone Repository
 
```bash
git clone https://github.com/username/fuel-delivery-system.git
cd fuel-delivery-system
```
 
### 2. Setup Backend (Laravel)
 
```bash
# Masuk ke folder backend
cd fuel-backend
 
# Install PHP dependencies
composer install
 
# Copy file environment
cp .env.example .env
 
# Generate application key
php artisan key:generate
 
# Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
 
# Publish Spatie Permission config
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```
 
### 3. Setup Frontend (React)
 
```bash
# Masuk ke folder frontend
cd fuel-frontend
 
# Install Node dependencies
npm install
 
# Install Tailwind CSS v3
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
 
# Copy file environment
cp .env.example .env
```
 
---

## ⚙️ Konfigurasi
 
### Backend — `fuel-backend/.env`
 
```env
APP_NAME="Fuel Delivery System"
APP_ENV=local
APP_KEY=           # auto-generated via php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
 
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fuel_tracking_db   # buat database ini terlebih dahulu
DB_USERNAME=root
DB_PASSWORD=                    # sesuaikan dengan password MySQL Anda
 
SESSION_DRIVER=array
FILESYSTEM_DISK=public
CACHE_STORE=file
```
 
### Frontend — `fuel-frontend/.env`
 
```env
VITE_API_URL=http://localhost:8000/api
```
 
### Backend — `config/cors.php`
 
```php
return [
    'paths'                => ['api/*'],
    'allowed_methods'      => ['*'],
    'allowed_origins'      => ['http://localhost:5173'],
    'allowed_headers'      => ['*'],
    'supports_credentials' => false,
];
```
 
### Backend — `bootstrap/app.php`
 
> **Penting:** Jangan tambahkan `EnsureFrontendRequestsAreStateful` di middleware API. Sistem ini menggunakan Bearer Token, bukan cookie/session.
 
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    ]);
})
```
 
---

## ▶️ Menjalankan Aplikasi
 
### Langkah 1 — Buat Database
 
```sql
CREATE DATABASE fuel_tracking_db;
```
 
### Langkah 2 — Migrasi & Seeder
 
```bash
cd fuel-backend
 
# Jalankan migrasi + seeder
php artisan migrate --seed
 
# Buat symlink storage
php artisan storage:link
 
# Bersihkan cache
php artisan config:clear
php artisan cache:clear
```
 
### Langkah 3 — Jalankan Backend
 
```bash
cd fuel-backend
php artisan serve
# Berjalan di: http://localhost:8000
```
 
### Langkah 4 — Jalankan Frontend
 
```bash
cd fuel-frontend
npm run dev
# Berjalan di: http://localhost:5173
```
 
### Akses Aplikasi
 
| URL | Keterangan |
|-----|------------|
| `http://localhost:5173` | Aplikasi utama |
| `http://localhost:5173/login` | Halaman login |
| `http://localhost:5173/track` | Public tracking (tanpa login) |
| `http://localhost:8000/api` | Base URL API |
 
---

## 👤 Akun Demo
 
Semua akun menggunakan password: **`password`**
 
| Role | Email | Akses |
|------|-------|-------|
| Super Admin | `superadmin@fds.com` | Full akses semua fitur |
| Admin Operasional | `admin@fds.com` | CRUD delivery, kelola user |
| Driver 1 | `driver1@fds.com` | Update status, GPS, foto |
| Driver 2 | `driver2@fds.com` | Update status, GPS, foto |
| Driver 3 | `driver3@fds.com` | Update status, GPS, foto |
| Customer | `customer@fds.com` | Lihat delivery milik sendiri |
 
---

## 🔌 API Endpoints
 
Base URL: `http://localhost:8000/api`
 
### Authentication
 
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/auth/login` | ❌ | Login, mendapat Bearer token |
| `GET` | `/auth/me` | ✅ | Data user yang sedang login |
| `POST` | `/auth/logout` | ✅ | Logout, hapus token |
| `POST` | `/auth/profile` | ✅ | Update profil & password |
| `GET` | `/track?code=FDS-xxx` | ❌ | Public tracking by kode |
 
### Deliveries
 
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/deliveries` | ✅ | List delivery (filter: status, search) |
| `POST` | `/deliveries` | ✅ | Buat delivery baru |
| `GET` | `/deliveries/{id}` | ✅ | Detail delivery + relasi |
| `PUT` | `/deliveries/{id}` | ✅ | Update delivery |
| `DELETE` | `/deliveries/{id}` | ✅ | Hapus delivery |
| `PATCH` | `/deliveries/{id}/status` | ✅ | Update status pengiriman |
| `GET` | `/statistics` | ✅ | Statistik dashboard |
 
### GPS Tracking
 
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/deliveries/{id}/track` | ✅ | Kirim posisi GPS driver |
| `GET` | `/deliveries/{id}/track` | ✅ | Riwayat tracking |
 
### Photos & Proof
 
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/deliveries/{id}/photos` | ✅ | Upload foto (multipart) |
| `DELETE` | `/deliveries/{id}/photos/{photoId}` | ✅ | Hapus foto |
| `POST` | `/deliveries/{id}/proof` | ✅ | Submit bukti pengiriman |
| `GET` | `/deliveries/{id}/proof` | ✅ | Get bukti pengiriman |
 
### Users
 
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| `GET` | `/users` | ✅ | Admin only |
| `POST` | `/users` | ✅ | Admin only |
| `PUT` | `/users/{id}` | ✅ | Admin only |
| `DELETE` | `/users/{id}` | ✅ | Admin only |
| `GET` | `/drivers` | ✅ | Semua role |
 
### Contoh Request — Login
 
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"superadmin@fds.com","password":"password"}'
```
 
### Contoh Request — Buat Delivery
 
```bash
curl -X POST http://localhost:8000/api/deliveries \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": 3,
    "customer_name": "Budi Santoso",
    "customer_phone": "081234567890",
    "destination_address": "Jl. Merdeka No. 45, Jakarta",
    "destination_lat": -6.2088,
    "destination_lng": 106.8456,
    "geofence_radius": 200,
    "fuel_type": "PERTAMAX",
    "volume_liters": 50,
    "price_per_liter": 13500
  }'
```
 
---

## 🔄 Alur Status Pengiriman
 
```
CREATED ──► PACKED ──► IN_TRANSIT ──► NEAR_DESTINATION ──► DELIVERED ──► COMPLETED
```
 
| Status | Deskripsi | Trigger |
|--------|-----------|---------|
| `CREATED` | Delivery baru dibuat | Admin membuat order |
| `PACKED` | BBM sudah dikemas | Admin/Driver konfirmasi |
| `IN_TRANSIT` | Driver sedang dalam perjalanan | Driver mulai perjalanan |
| `NEAR_DESTINATION` | Driver dekat tujuan | Auto (dalam 500m) atau manual |
| `DELIVERED` | BBM sudah diterima | Driver konfirmasi + validasi geofence |
| `COMPLETED` | Pengiriman selesai | Admin konfirmasi |
 
### Aturan Anti-Fraud
 
- **Anti-skip**: Status hanya bisa maju satu langkah, tidak bisa melompat
- **Geofence DELIVERED**: Status `DELIVERED` hanya bisa diset jika driver dalam radius geofence (default 200m) dari tujuan
- **Auto-transisi**: Sistem otomatis pindah ke `NEAR_DESTINATION` saat driver mengirim GPS dalam radius 500m
 
---

## 👥 Role & Hak Akses
 
| Fitur | Super Admin | Admin Ops | Driver | Customer |
|-------|:-----------:|:---------:|:------:|:--------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Lihat semua delivery | ✅ | ✅ | ✅ (milik sendiri) | ✅ (milik sendiri) |
| Buat delivery | ✅ | ✅ | ❌ | ❌ |
| Update delivery | ✅ | ✅ | ❌ | ❌ |
| Hapus delivery | ✅ | ✅ | ❌ | ❌ |
| Update status | ✅ | ✅ | ✅ | ❌ |
| GPS Tracking | ✅ | ✅ (lihat) | ✅ (kirim) | ❌ |
| Upload foto | ✅ | ✅ | ✅ | ❌ |
| Submit proof | ✅ | ✅ | ✅ | ❌ |
| Kelola user | ✅ | ✅ | ❌ | ❌ |
| Menu Driver Panel | ❌ | ❌ | ✅ | ❌ |
| Public tracking | ✅ | ✅ | ✅ | ✅ |
 
---

## 🗄️ Skema Database
 
### Tabel Utama
 
```
users
├── id, name, email, phone, password
├── avatar, is_active
└── timestamps, soft_deletes
 
deliveries
├── id, delivery_code (unique)
├── admin_id → users, driver_id → users, customer_id → users
├── customer_name, customer_phone, destination_address
├── destination_lat, destination_lng, geofence_radius
├── fuel_type (enum), volume_liters, price_per_liter, total_price
├── status (enum: 6 nilai)
└── notes, scheduled_at, timestamps, soft_deletes
 
delivery_locations
├── id, delivery_id → deliveries, driver_id → users
├── latitude, longitude, accuracy, speed, heading
├── status_at_time, recorded_at
└── timestamps
 
delivery_photos
├── id, delivery_id → deliveries, uploaded_by → users
├── photo_path, photo_type (enum)
├── latitude, longitude, caption, taken_at
└── timestamps
 
proof_of_deliveries
├── id, delivery_id → deliveries (unique)
├── recipient_name, signature_path, photo_path
├── latitude, longitude, distance_from_destination
├── geofence_valid (boolean), signed_at
└── timestamps
 
delivery_status_logs
├── id, delivery_id → deliveries, changed_by → users
├── from_status, to_status, notes
├── latitude, longitude
└── timestamps
```
 
---

## 🧪 Testing
 
### Postman
 
Import file `FDS_Postman_Collection.json` ke Postman. Collection berisi:
 
- 🔐 Authentication (Login, Me, Logout)
- 📦 Deliveries (CRUD + filter + statistik)
- 🔄 Status Flow (6 step + 2 anti-fraud test)
- 📍 GPS Tracking (kirim + auto-transisi + history)
- 📸 Photo Upload (upload + hapus)
- ✅ Proof of Delivery (submit + get)
- 🌐 Public Tracking
- 👥 User Management (CRUD + role guard)
 
### Urutan Testing Postman
 
```
1. Login Super Admin          → token tersimpan otomatis
2. Get Drivers List           → driverId tersimpan otomatis
3. Create Delivery            → deliveryId tersimpan otomatis
4. Update Status: PACKED
5. Update Status: IN_TRANSIT
6. Update Status: NEAR_DESTINATION
7. Test geofence (luar area)  → harus 422
8. Update Status: DELIVERED   → koordinat tujuan
9. Update Status: COMPLETED
10. Submit Proof of Delivery
```
 
### Reset Database untuk Testing Ulang
 
```bash
php artisan migrate:fresh --seed
```
 
---

## 🐛 Troubleshooting
 
| Error | Penyebab | Solusi |
|-------|----------|--------|
| `419 CSRF` | `EnsureFrontendRequestsAreStateful` aktif | Hapus dari `bootstrap/app.php` |
| `401 Unauthenticated` | Token tidak valid/expired | Login ulang |
| `403 Forbidden` | Role tidak memiliki akses | Gunakan akun dengan role yang sesuai |
| `422 Geofence error` | Koordinat di luar radius | Gunakan koordinat tujuan yang sama |
| `500 Server Error` | Error PHP | `tail -f storage/logs/laravel.log` |
| Driver tidak muncul | Typo `auth::sanctum` | Pastikan `auth:sanctum` (satu titik dua) |
| Map tidak muncul | CDN Leaflet tidak load | Cek koneksi internet, reload halaman |
| Upload foto gagal | `storage:link` belum dibuat | `php artisan storage:link` |
 
---

## 📄 License
 
Proyek ini menggunakan lisensi [MIT](LICENSE).
 
---
 
<div align="center">
  <p>Dibuat dengan ❤️ menggunakan Laravel + React</p>
  <p><strong>Fuel Delivery System © 2025</strong></p>
</div>