

---

````markdown
# 📚 Sistem Informasi Perpustakaan Digital

Proyek ini adalah **Sistem Informasi Perpustakaan** berbasis web yang dibangun dengan **Laravel (Backend API)** dan **React.js (Frontend)**.  
Tujuannya untuk mempermudah proses **peminjaman buku, manajemen anggota, dan pengelolaan data pustaka** secara digital dan efisien.

---

## 🚀 Fitur Utama

### 👤 Pengguna (Mahasiswa / Dosen)
- Registrasi & Login dengan autentikasi token (**Laravel Sanctum**)
- Pencarian buku berdasarkan judul, pengarang, atau kategori
- Peminjaman & pengembalian buku dengan notifikasi status
- Melihat riwayat peminjaman

### 🧑‍💼 Admin / Petugas Perpustakaan
- CRUD data buku, kategori, dan penulis
- Manajemen data anggota
- Konfirmasi dan pencatatan peminjaman
- Laporan peminjaman dan stok buku

---

## 🧱 Struktur Proyek

### Backend – Laravel
Folder: `/bukuh`

| Komponen | Deskripsi |
|-----------|------------|
| `routes/api.php` | Endpoint REST API untuk frontend |
| `app/Models/` | Model database (Book, Loan, User, dll) |
| `app/Http/Controllers/` | Logika API seperti `BookController`, `LoanController` |
| `database/migrations/` | Struktur tabel database |
| `database/seeders/` | Data awal (roles, admin default, kategori, dll) |

### Frontend – React
Folder: `/bukuh-web`

| Komponen | Deskripsi |
|-----------|------------|
| `src/pages/` | Halaman utama seperti `Login.jsx`, `Home.jsx`, `Dashboard.jsx` |
| `src/components/` | Komponen UI seperti `Topbar`, `Sidebar`, `BookCard` |
| `src/api/` | File API client (`axios` + token dari Laravel Sanctum) |
| `src/App.jsx` | Routing utama aplikasi |

---

## ⚙️ Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/iceguya/Perpustakaan-.git
cd Perpustakaan-
````

### 2. Setup Backend (Laravel)

```bash
cd bukuh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

> Pastikan database PostgreSQL/MySQL sudah dikonfigurasi di file `.env`.

### 3. Setup Frontend (React)

```bash
cd ../bukuh-web
npm install
npm run dev
```

Akses frontend di `http://localhost:5173`
Backend API berjalan di `http://localhost:8000`

---

## 🧩 Dependencies Penting

### Laravel

* `laravel/framework` – Kerangka utama backend
* `laravel/sanctum` – Autentikasi berbasis token
* `doctrine/dbal` – Manipulasi skema database
* `spatie/laravel-query-builder` – Query dinamis & filter fleksibel

### React

* `axios` – HTTP client untuk komunikasi API
* `react-router-dom` – Routing antar halaman
* `vite` – Bundler & dev server

---

## 🧪 Testing & Reset Database

```bash
php artisan migrate:fresh --seed
```

---

## 🧠 Alur Bisnis Singkat

1. User login → token dikirim ke React
2. React menyimpan token di `localStorage`
3. Setiap permintaan API dikirim dengan header `Authorization: Bearer {token}`
4. Admin memverifikasi peminjaman dan mengubah status buku

---

## 🧑‍💻 Kontributor

* **Muhammad Faisal** ([iceguya](https://github.com/iceguya)) – Developer utama & integrator backend–frontend

---

## 🪪 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🌐 Preview

Akan ditambahkan setelah deployment ke hosting / Vercel / Render.

---

> 📘 “Sistem perpustakaan yang baik bukan hanya menyimpan buku, tapi juga menyimpan semangat belajar.”

```

---
