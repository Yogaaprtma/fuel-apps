# 🛢️ Fuel Delivery System (FDS)
 
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