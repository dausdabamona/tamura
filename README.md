# TamuRA - Manajemen Homestay Raja Ampat

Aplikasi PWA offline-first untuk manajemen homestay di pulau-pulau terpencil Raja Ampat, Papua. Dirancang khusus untuk pemilik homestay dengan koneksi internet tidak stabil, HP Android murah (RAM 2-3GB), dan digital literacy rendah.

Semua data tersimpan di device pengguna (IndexedDB). Tidak butuh internet untuk dipakai sehari-hari.

<!-- TODO: Tambahkan screenshot app di sini -->
<!-- ![Screenshot TamuRA](screenshots/screenshot.png) -->

## Fitur Utama

- **Booking** - Kalender visual bulanan, titik warna per kamar, validasi double-booking otomatis, hitung total biaya otomatis
- **Keuangan** - Catat pemasukan dan pengeluaran, summary bulanan (masuk/keluar/profit), filter berdasarkan bulan
- **Tamu** - Database tamu dengan riwayat kunjungan, pencarian nama/negara/HP, total pembayaran per tamu
- **Pengaturan** - Edit info penginapan, kelola kamar/bungalow (tambah, edit, hapus), panduan FAQ built-in
- **Onboarding** - Wizard setup 4 langkah untuk pengguna baru, selesai dalam 2 menit
- **Offline-First** - 100% berfungsi tanpa internet, semua data di IndexedDB

## Cara Install untuk Pengguna

### Cara 1: Install PWA dari Browser (Paling Mudah)

1. Buka link web app di **Chrome** di HP Android
2. Chrome otomatis muncul banner **"Add to Home Screen"**
3. Tap **Install** / **Tambahkan ke Layar Utama**
4. App muncul di home screen seperti app biasa
5. Bisa dipakai kapan saja, bahkan tanpa internet

### Cara 2: Install lewat Menu Chrome

1. Buka link web app di **Chrome** di HP Android
2. Tap tombol **titik tiga** (⋮) di kanan atas Chrome
3. Tap **"Install App"** atau **"Tambahkan ke layar utama"**
4. Tap **Install**
5. App langsung muncul di home screen

### Cara 3: Install APK lewat WhatsApp (Tanpa Internet)

Untuk daerah dengan internet sangat terbatas:

1. File APK dikirim via **WhatsApp** ke pemilik homestay
2. Pemilik homestay tap file APK yang diterima
3. Jika muncul peringatan, tap **"Izinkan install dari sumber ini"**
4. App langsung terinstall dan siap pakai
5. Tidak perlu internet sama sekali setelah install

> Lihat file [pwa-to-apk.md](pwa-to-apk.md) untuk panduan membuat file APK.

## Tech Stack

| Teknologi | Fungsi |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool, dev server |
| **Dexie.js** | IndexedDB wrapper (offline database) |
| **dexie-react-hooks** | Reactive queries dari IndexedDB |
| **vite-plugin-pwa** | Service worker & PWA manifest |
| **date-fns** | Manipulasi tanggal |
| **lucide-react** | Icon library |

## Development

### Prasyarat

- Node.js 18+
- npm 9+

### Menjalankan Lokal

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

App berjalan di `http://localhost:5173`

### Build Production

```bash
npm run build
```

Hasil build ada di folder `dist/`. File-file penting:
- `index.html` - Entry point
- `assets/` - JS dan CSS yang sudah di-bundle
- `sw.js` - Service worker untuk offline
- `manifest.webmanifest` - PWA manifest
- `registerSW.js` - Auto-register service worker

### Preview Build

```bash
npm run preview
```

## Deploy

### Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Vercel otomatis detect Vite, klik **Deploy**
4. Selesai, app live di URL `*.vercel.app`

Konfigurasi sudah disiapkan di `vercel.json`.

### Netlify

1. Push repo ke GitHub
2. Import project di [netlify.com](https://app.netlify.com)
3. Netlify otomatis baca `netlify.toml`, klik **Deploy**
4. Selesai, app live di URL `*.netlify.app`

Konfigurasi sudah disiapkan di `netlify.toml`.

## Struktur Project

```
src/
├── db/database.js           # Dexie schema (config, rooms, bookings, guests, transactions, syncQueue)
├── pages/
│   ├── Onboarding.jsx       # Wizard 4 screen
│   ├── Calendar.jsx         # Kalender booking
│   ├── Finance.jsx          # Keuangan masuk/keluar
│   ├── Guests.jsx           # Daftar tamu + riwayat
│   └── Settings.jsx         # Pengaturan + FAQ
├── components/
│   ├── BottomNav.jsx        # Tab navigasi bawah
│   ├── Header.jsx           # Header + status online/offline
│   ├── Modal.jsx            # Bottom sheet modal
│   ├── BookingForm.jsx      # Form booking baru
│   └── TransactionForm.jsx  # Form catat transaksi
├── hooks/
│   ├── useOnlineStatus.js   # Deteksi online/offline
│   └── useConfig.js         # Query config dari Dexie
├── utils/format.js          # formatRp(), formatDate()
├── styles/global.css        # Nunito font, CSS variables
├── App.jsx                  # Router + cek onboarding
└── main.jsx                 # Entry point
```

## Lisensi

MIT License

Copyright (c) 2026 TamuRA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
