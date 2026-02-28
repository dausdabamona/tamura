# Panduan Convert PWA TamuRA ke APK Android

Dokumen ini menjelaskan 3 metode untuk mengubah PWA TamuRA menjadi file APK
yang bisa diinstall langsung di HP Android tanpa Play Store.

---

## Prasyarat

Sebelum convert ke APK, PWA **harus sudah di-deploy** ke URL publik terlebih dahulu
(misalnya di Vercel atau Netlify). Lihat README.md untuk panduan deploy.

URL contoh: `https://tamura.vercel.app`

---

## Metode 1 - PWABuilder (Paling Mudah, Tanpa Coding)

Cocok untuk: siapa saja, tidak perlu install software apapun.

### Langkah-langkah:

1. **Deploy PWA** ke URL publik (Vercel / Netlify)
   ```
   Contoh: https://tamura.vercel.app
   ```

2. **Buka PWABuilder**
   - Buka https://www.pwabuilder.com di browser

3. **Masukkan URL PWA**
   - Paste URL PWA di kolom input
   - Klik **Start**

4. **PWABuilder menganalisis**
   - PWABuilder otomatis cek manifest.webmanifest
   - PWABuilder otomatis cek service worker (sw.js)
   - Pastikan semua centang hijau (manifest valid, SW terdaftar)

5. **Generate APK**
   - Klik **Package for stores**
   - Pilih **Android**
   - Pilih opsi **Google Play** (menggunakan Trusted Web Activity)
   - Klik **Generate**

6. **Download APK**
   - Tunggu proses selesai (biasanya 1-2 menit)
   - Download file ZIP yang berisi:
     - File `.apk` - bisa langsung install di HP
     - File `.aab` - untuk upload ke Google Play Store
     - File signing key - simpan baik-baik jika mau upload ke Play Store

7. **Install di HP Android**
   - Kirim file `.apk` ke HP via WhatsApp / kabel USB / Bluetooth
   - Tap file APK di HP
   - Jika diminta, izinkan "Install dari sumber tidak dikenal"
   - App terinstall dan siap pakai

8. **(Opsional) Upload ke Google Play Store**
   - Buat akun Google Play Developer ($25 sekali bayar)
   - Upload file `.aab` ke Google Play Console
   - Isi detail app (deskripsi, screenshot, dll)
   - Submit untuk review

---

## Metode 2 - Bubblewrap (Lebih Kontrol, Butuh Setup)

Cocok untuk: developer yang ingin kustomisasi lebih lanjut.

### Prasyarat:
- Node.js 18+
- Java JDK 8+
- Android SDK (atau Android Studio)

### Langkah-langkah:

1. **Install Bubblewrap**
   ```bash
   npm install -g @nickvdp/nickvdp bubblewrap
   ```

2. **Inisialisasi project Android**
   ```bash
   mkdir tamura-apk && cd tamura-apk
   bubblewrap init --manifest=https://tamura.vercel.app/manifest.webmanifest
   ```

   Bubblewrap akan menanyakan beberapa hal:
   - **Package name**: `id.tamura.app`
   - **App name**: `TamuRA`
   - **Launcher name**: `TamuRA`
   - **Theme color**: `#0f766e`
   - **Background color**: `#f8faf9`
   - **Start URL**: `/`
   - **Icon URL**: otomatis dari manifest
   - **Signing key**: buat baru atau pakai yang ada

3. **Build APK**
   ```bash
   bubblewrap build
   ```

   Hasil:
   - `app-release-signed.apk` - APK siap install
   - `app-release-bundle.aab` - untuk Play Store

4. **Test di HP**
   ```bash
   # Jika HP terhubung via USB dengan ADB
   adb install app-release-signed.apk
   ```

   Atau kirim file APK via WhatsApp / transfer file.

5. **Sign APK (jika belum)**
   ```bash
   # Buat keystore (sekali saja, simpan baik-baik)
   keytool -genkey -v -keystore tamura.keystore -alias tamura -keyalg RSA -keysize 2048 -validity 10000

   # Sign APK
   jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore tamura.keystore app-release-unsigned.apk tamura
   ```

---

## Metode 3 - Capacitor (Jika Butuh Fitur Native)

Cocok untuk: jika kedepan butuh akses kamera, GPS, notifikasi push, dll.

### Langkah-langkah:

1. **Install Capacitor**
   ```bash
   # Di folder project TamuRA
   npm install @capacitor/core @capacitor/cli
   ```

2. **Inisialisasi Capacitor**
   ```bash
   npx cap init TamuRA id.tamura.app
   ```

   Ini membuat file `capacitor.config.ts` di root project.

3. **Build PWA**
   ```bash
   npm run build
   ```

4. **Tambah platform Android**
   ```bash
   npx cap add android
   ```

   Ini membuat folder `android/` berisi project Android Studio.

5. **Copy build ke Android**
   ```bash
   npx cap copy android
   ```

6. **Buka di Android Studio**
   ```bash
   npx cap open android
   ```

   Android Studio akan terbuka dengan project TamuRA.

7. **Build APK dari Android Studio**
   - Di Android Studio, pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Tunggu proses build selesai
   - APK ada di `android/app/build/outputs/apk/debug/app-debug.apk`

8. **Build Release APK (untuk distribusi)**
   - Di Android Studio, pilih **Build > Generate Signed Bundle / APK**
   - Pilih **APK**
   - Buat atau pilih keystore
   - Pilih **release**
   - APK signed siap distribusi

### Tambah Plugin Native (opsional):

```bash
# Contoh: akses kamera
npm install @capacitor/camera
npx cap sync android

# Contoh: geolocation
npm install @capacitor/geolocation
npx cap sync android

# Contoh: local notifications
npm install @capacitor/local-notifications
npx cap sync android
```

---

## Perbandingan 3 Metode

| Aspek | PWABuilder | Bubblewrap | Capacitor |
|---|---|---|---|
| **Kesulitan** | Sangat mudah | Sedang | Sulit |
| **Butuh coding** | Tidak | Sedikit | Ya |
| **Butuh Android Studio** | Tidak | Tidak | Ya |
| **Ukuran APK** | Kecil (~2-5 MB) | Kecil (~2-5 MB) | Besar (~10-20 MB) |
| **Fitur native** | Tidak | Tidak | Ya |
| **Update app** | Otomatis via URL | Otomatis via URL | Harus rebuild APK |
| **Offline** | Ya (via SW) | Ya (via SW) | Ya (via SW + native) |
| **Play Store** | Ya | Ya | Ya |

---

## Rekomendasi untuk TamuRA

**Gunakan Metode 1 (PWABuilder)** karena:
- Target user adalah pemilik homestay non-teknis
- Tidak butuh fitur native (kamera, GPS, dll)
- PWABuilder paling mudah dan cepat
- APK otomatis update saat PWA di-deploy ulang (Trusted Web Activity)
- Ukuran APK kecil, hemat storage di HP murah

---

## Distribusi ke Pemilik Homestay Raja Ampat

Karena internet di Raja Ampat sangat terbatas, berikut cara distribusi yang direkomendasikan:

### Via WhatsApp (Paling Praktis)

1. Generate APK menggunakan salah satu metode di atas
2. Kirim file APK via **WhatsApp** ke nomor pemilik homestay
3. Instruksikan mereka untuk:
   - Tap file APK yang diterima
   - Tap **Install** jika diminta
   - Jika ada peringatan keamanan, tap **Pengaturan** > nyalakan **Izinkan dari sumber ini** > kembali > tap **Install**
4. App langsung siap pakai tanpa internet

### Via Bluetooth / Transfer File

1. Simpan file APK di HP
2. Saat bertemu langsung dengan pemilik homestay:
   - Kirim file APK via **Bluetooth** atau **Nearby Share**
   - Bantu mereka install di HP
   - Bantu mereka setup (onboarding wizard)

### Via Link PWA (Jika Ada Internet)

1. Kirim link web app via WhatsApp: `https://tamura.vercel.app`
2. Instruksikan: "Buka link ini di Chrome, terus tap Install"
3. PWA ukurannya sangat kecil, bisa download walau sinyal lemah
