# 📊 Dashboard Monitoring Petugas SE2026 — BPS Kabupaten Garut

**Dashboard Petugas SE2026** adalah aplikasi web berbasis **Next.js** yang dirancang khusus untuk **Badan Pusat Statistik (BPS) Kabupaten Garut** guna memantau kinerja pendataan harian petugas lapangan serta mendeteksi dan mengawal penyelesaian anomali data secara *real-time* pada pelaksanaan **Sensus Ekonomi 2026 (SE2026)**.

Aplikasi ini mengintegrasikan data langsung dari server pusat/provinsi (`simpul-jabar`), memperkaya data tersebut dengan **Master Wilayah & Petugas (SLS)** lokal, serta menyimpannya ke dalam penyimpanan berkecepatan tinggi (**Vercel KV / Upstash Redis**) agar proses pemantauan oleh tim manajemen, Pengawas (PML), maupun Pencacah (PPL) berjalan instan, responsif, dan bebas beban terhadap server utama.

## 🌐 Akses Aplikasi (*Live Deployment*)

Aplikasi ini sudah di-*hosting* dan dapat diakses langsung melalui tautan berikut:

* 🔗 **Halaman Utama (Monitoring Progres Pendataan)**: [https://dashboard-petugas.vercel.app](https://dashboard-petugas.vercel.app)
* 🚨 **Menu Deteksi Anomali Data**: Dapat diakses dengan mengklik tab **"Deteksi Anomali"** pada halaman utama atau langsung melalui tautan [https://dashboard-petugas.vercel.app/?tab=anomali](https://dashboard-petugas.vercel.app/?tab=anomali)

---

## 🌟 Fitur Utama

Aplikasi ini memiliki **2 fitur utama** yang dapat diakses melalui navigasi tab interaktif dan terhubung langsung dengan **Filter Wilayah & Petugas Berjenjang** (Kecamatan $\rightarrow$ Desa $\rightarrow$ PML $\rightarrow$ PPL):

### 1. 📈 Monitoring Progres Pendataan Petugas (`Progres Pendataan`)
> **Tautan Akses**: [https://dashboard-petugas.vercel.app](https://dashboard-petugas.vercel.app) *(atau `/?tab=pendataan`)*

Fitur ini berfungsi untuk memantau produktivitas dan capaian kuantitas pendataan petugas dari hari ke hari dibandingkan dengan target berjalan.

* **Kartu Ringkasan Eksekutif (*Summary Cards*)**:
  * **Capaian Wilayah Keseluruhan**: Menampilkan persentase capaian agregat wilayah yang sedang difilter beserta rincian total data masuk dibandingkan total target.
  * **Target Berjalan Harian**: Menghitung target ideal secara dinamis berdasarkan hari berjalan (bertambah secara proporsional sebesar `1,70%` per hari sejak tanggal mulai pendataan).
* **Mode Tampilan Ganda (PPL & PML)**:
  * **Mode PPL (Petugas Pendataan Lapangan)**: Menampilkan progres individu setiap petugas pencacah beserta informasi email/identitasnya.
  * **Mode PML (Petugas Pemeriksa Lapangan / Pengawas)**: Mengagregasi secara otomatis seluruh target, capaian harian, total pendataan, dan jumlah *reject* dari seluruh PPL yang berada di bawah pengawasan masing-masing PML.
* **Pelacakan Historis 5 Hari Terakhir (`H-4` s.d. `Hari Ini`)**:
  * Menyajikan riwayat penambahan data harian (`H-4`, `H-3`, `H-2`, `H-1`, dan `Hari Ini`) baik dalam bentuk **angka absolut (volume harian)** maupun **persentase harian (%)** terhadap target petugas.
  * Menghitung secara otomatis jumlah data **Reject** dengan formula: $\text{Total Pendataan} - \text{Submit} - \text{Draft}$.
* **Indikator Visual Berbasis Warna (*Color-Coding*) & Filter Cepat**:
  * **Status Capaian Target (Warna Baris)**:
    * 🟢 **Hijau ($\ge$ Target)**: Capaian total petugas sudah memenuhi atau melampaui target berjalan ($\text{Rasio} \ge 100\%$).
    * 🟡 **Kuning ($80\% - 99\%$ Target)**: Capaian mendekati target berjalan namun perlu sedikit percepatan.
    * 🔴 **Merah ($< 80\%$ Target)**: Capaian tertinggal jauh dari target berjalan dan memerlukan perhatian khusus.
  * **Status Volume Pendataan Hari Ini (Warna Angka Harian)**:
    * 🔵 **Biru ($\ge 10$ data)**: Produktivitas harian tinggi.
    * 🟡 **Kuning ($7 - 9$ data)**: Produktivitas harian sedang.
    * 🔴 **Merah ($< 7$ data)**: Produktivitas harian rendah.
* **Pencarian, Pengurutan (*Sorting*), Paginasi, & Ekspor CSV**:
  * Seluruh kolom tabel dapat diurutkan (*ascending* / *descending*).
  * Dilengkapi pencarian nama/email secara langsung, pengaturan jumlah baris per halaman (`25`, `50`, `100`, `200`, atau `Semua`), serta tombol **Export CSV** untuk mengunduh seluruh data terfilter.

---

### 2. 🚨 Deteksi & Pengawalan Anomali Data (`Deteksi Anomali`)
> **Tautan Akses**: Klik tab **Deteksi Anomali** di dasbor atau buka langsung [https://dashboard-petugas.vercel.app/?tab=anomali](https://dashboard-petugas.vercel.app/?tab=anomali)

Fitur ini digunakan untuk mengidentifikasi ketidakwajaran isian kuesioner di lapangan (baik kategori **Usaha** maupun **Keluarga**) serta memantau status tindak lanjut perbaikannya di aplikasi **FASIH**.

* **Penggabungan Entitas Cerdas (*Smart Assignment Merging*)**:
  * Sistem secara otomatis menggabungkan daftar anomali **Keluarga (`K`)** dan **Usaha (`U`)** yang memiliki `assignment_id` yang sama ke dalam satu baris entitas sehingga petugas tidak perlu memeriksa di dua tabel terpisah.
* **Kamus & Petunjuk Rule Anomali Terintegrasi**:
  * Dilengkapi panel *Accordion* interaktif yang memuat penjelasan lengkap setiap kode anomali:
    * **Anomali Usaha (`U1` – `U8`)**:
      * `U1`: Biaya Produksi Dominan ($>50\%$ padahal tidak memproduksi barang sendiri)
      * `U2`: Keuntungan Usaha (Selisih pendapatan dan pengeluaran negatif)
      * `U3`: Bukan badan usaha tetapi ada penyertaan modal korporasi publik
      * `U4`: Data Keuangan MBG (*Makan Bergizi Gratis*) dengan rasio pendapatan/pengeluaran tidak wajar
      * `U5`: Konsistensi antara aset, pekerja, dan produksi usaha
      * `U6`: Usaha Menengah dan Besar tetapi tanpa menggunakan internet untuk usaha
      * `U7`: Usaha Menengah dan Besar tidak memiliki laporan/catatan keuangan
      * `U8`: Perbedaan KBLI 2 Digit hasil pendataan dengan SBR (*Statistical Business Register*)
    * **Anomali Keluarga (`K1` – `K7`)**:
      * `K1`: Status Cerai / Belum Kawin pada Kepala Keluarga dan pasangannya
      * `K2`: Umur Kepala Keluarga $< 10$ tahun dan tinggal di rumah milik sendiri
      * `K3`: Semua anggota keluarga menyandang disabilitas (kecuali keluarga tunggal)
      * `K4`: Luas lantai per kapita ekstrem ($< 3\text{ m}^2$ atau $> 200\text{ m}^2$)
      * `K5`: Selisih pendapatan dan pengeluaran keluarga negatif
      * `K6`: Pengeluaran listrik rendah ($< \text{Rp100rb}$ atau $< 900\text{ watt}$) tetapi memiliki AC/barang mewah
      * `K7`: Jumlah anggota keluarga ekstrem ($> 10$ orang)
* **Bola Status Anomali Interaktif**:
  * Setiap rule anomali ditampilkan sebagai *badge* interaktif dengan warna yang merepresentasikan kategori dan status penyelesaiannya:
    * 🔵 **Biru (`K1`–`K7`)**: Anomali Keluarga yang **belum selesai** (nilai `0`).
    * 🟠 **Kuning/Amber (`U1`–`U8`)**: Anomali Usaha yang **belum selesai** (nilai `0`).
    * 🟢 **Hijau dengan Centang `✓`**: Anomali yang **sudah diperbaiki/diselesaikan** oleh petugas (nilai `1`).
  * Mengarahkan kursor (*hover* di PC) atau menyentuh *badge* (di HP) akan menampilkan penjelasan detail indikator anomali beserta status penyelesaiannya.
* **Filter Status Penyelesaian & Kategori**:
  * **Filter Status**: *Masih Ada Anomali* (default, memfokuskan petugas pada pekerjaan yang belum tuntas), *Selesai 100%* (seluruh anomali pada baris tersebut telah bernilai `1`), atau *Semua Data*.
  * **Filter Kategori**: *Semua (K & U)*, *Keluarga Saja*, atau *Usaha Saja*.
* **Tautan Langsung FASIH & Ekspor Excel (`.xlsx`)**:
  * Tombol **`Buka Fasih ↗`** pada setiap baris membuka langsung halaman *assignment* terkait di sistem FASIH BPS untuk segera diperbaiki.
  * Tombol **`Ekspor Excel`** mengunduh data anomali sesuai filter aktif ke dalam format `.xlsx` lengkap dengan pemisahan kolom wilayah (Kabupaten, Kecamatan, Desa, SLS), status centang `(✓)` / silang `(✗)` tiap anomali, dan tautan FASIH.

---

## 🛠️ Arsitektur & Keunggulan Teknis

1. **Filter Wilayah Berjenjang (*Cascading Filter*) Berbasis URL**:
   * Filter **Kecamatan $\rightarrow$ Desa $\rightarrow$ PML $\rightarrow$ PPL** dibangun di atas `Master SLS.json` menggunakan `react-select` dan disimpan pada URL *Query Parameters* (`?tab=...&kec=...&desa=...&pml=...&ppl=...`), sehingga filter tetap terjaga saat pengguna berpindah tab antara *Progres Pendataan* dan *Deteksi Anomali* atau saat membagikan tautan.
2. **Proteksi Data *Merge & Max* pada Sinkronisasi Harian**:
   * Saat menarik data dari API pusat, endpoint `/api/update-h1` menerapkan logika **Merge & Max**: apabila API pusat sedang mengalami gangguan atau mengembalikan nilai `pendataan` yang lebih kecil daripada data yang sudah tercatat di Redis pada hari yang sama, sistem akan mempertahankan nilai tertinggi agar progres petugas tidak pernah turun secara tidak valid.
3. **Sistem *Chunking* Otomatis untuk Data Berukuran Besar**:
   * Karena jumlah baris anomali se-Kabupaten Garut dapat mencapai puluhan ribu baris, endpoint `/api/anomali` menarik data secara bertahap (*paginated fetching* per `5.000` baris) lalu memecahnya menjadi potongan-potongan (*chunks*) berukuran `1.500` baris (`anomali_data_0`, `anomali_data_1`, dst.) di Redis untuk menghindari batas ukuran *payload* 1 MB pada penyimpanan *serverless*.

---

## 💻 Teknologi yang Digunakan (*Tech Stack*)

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
* **Library UI**: [React 19](https://react.dev/) & [Tailwind CSS v4](https://tailwindcss.com/)
* **Bahasa Pemrograman**: [TypeScript 5](https://www.typescriptlang.org/)
* **Database / Caching**: [@vercel/kv](https://vercel.com/docs/storage/vercel-kv) & [@upstash/redis](https://upstash.com/)
* **Komponen Pendukung**:
  * `react-select`: Dropdown pencarian wilayah dan petugas yang responsif.
  * `xlsx` (SheetJS): Pembuatan dan pengunduhan laporan anomali dalam format Microsoft Excel (`.xlsx`).

---

## 📂 Struktur Direktori Proyek

```text
dashboard-petugas/
├── app/
│   ├── api/
│   │   ├── anomali/route.ts        # Endpoint sinkronisasi & chunking data anomali dari API pusat ke Redis
│   │   ├── get-anomali/route.ts    # Endpoint pembacaan pecahan data anomali & pengayaan dengan Master SLS
│   │   ├── get-pendataan/route.ts  # Endpoint pembacaan riwayat 6 hari pendataan (H-5 s.d. H-0) dari Redis
│   │   └── update-h1/route.ts      # Endpoint sinkronisasi progres pendataan harian (Merge & Max logic)
│   ├── components/
│   │   ├── FilterKabupaten.tsx     # Komponen filter tingkat kabupaten
│   │   ├── FilterWilayah.tsx       # Komponen filter berjenjang (Kecamatan, Desa, PML, PPL)
│   │   ├── Header.tsx              # Header aplikasi (Identitas BPS Kabupaten Garut)
│   │   ├── TabSwitcher.tsx         # Navigasi perpindahan tab Progres Pendataan & Deteksi Anomali
│   │   ├── TabelAnomali.tsx        # Komponen tabel anomali (Server/Base)
│   │   ├── TabelAnomaliClient.tsx  # Komponen utama interaktif Deteksi Anomali, Kamus Rule, & Ekspor XLSX
│   │   ├── TabelProgres.tsx        # Komponen utama interaktif Monitoring Petugas (PPL/PML), Filter & CSV
│   │   ├── TabelProgresClient.tsx  # Wrapper pengambilan data pendataan & agregasi PPL ke PML
│   │   └── TombolUpdate.tsx        # Komponen pemicu pembaruan data
│   ├── data/
│   │   └── Master SLS.json         # Basis data referensi Kecamatan, Desa, SLS, serta pemetaan PML & PPL
│   ├── globals.css                 # Konfigurasi gaya global & Tailwind CSS
│   ├── layout.tsx                  # Root layout dan metadata halaman
│   └── page.tsx                    # Halaman utama dasbor (Pengatur state URL & rendering tab)
├── public/                         # Aset statis (Logo BPS, ikon, dll.)
├── package.json                    # Daftar dependensi dan skrip NPM
└── tsconfig.json                   # Konfigurasi TypeScript
```

---

## 🔌 Daftar Endpoint API Internal

| Endpoint | Metode | Deskripsi |
| :--- | :---: | :--- |
| `/api/get-pendataan` | `GET` | Mengambil data progres pendataan harian (`H-4` s.d. `Hari Ini`), menghitung selisih harian, *reject*, target berjalan, dan memetakan PPL ke PML berdasarkan `Master SLS.json`. |
| `/api/get-anomali` | `GET` | Mengambil seluruh *chunks* data anomali dari Redis secara paralel dan menggabungkannya dengan informasi wilayah & PML dari `Master SLS.json`. |
| `/api/update-h1?secret=...` | `GET` | *(Cron/Admin)* Menarik data rekapitulasi petugas terbaru dari API `simpul-jabar` dan menyimpannya ke key Redis tanggal hari ini (`data_YYYY-MM-DD`). |
| `/api/anomali?secret=...` | `GET` | *(Cron/Admin)* Menarik seluruh data anomali keluarga & usaha dari API `simpul-jabar`, menggabungkan berdasarkan `assignment_id`, dan menyimpannya secara terpisah (*chunking*) ke Redis. |

---

## 🚀 Panduan Instalasi & Menjalankan Secara Lokal

### 1. Prasyarat
Pastikan perangkat Anda telah terinstal:
* **Node.js** versi `20.x` atau lebih baru
* **npm**, **yarn**, **pnpm**, atau **bun**
* Akun / Instance **Vercel KV** atau **Upstash Redis**

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone <url-repositori-anda>
cd dashboard-petugas
npm install
```

### 3. Konfigurasi Variabel Lingkungan (*Environment Variables*)
Buat file `.env.local` pada direktori utama proyek dan tambahkan kredensial koneksi Redis / Vercel KV Anda:

```env
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban (*browser*) Anda untuk melihat tampilan dasbor.

### 5. Membangun untuk Produksi (*Production Build*)
```bash
npm run build
npm run start
```

---

## 🏛️ Kredit & Lisensi
Dikembangkan untuk mendukung kesuksesan **Sensus Ekonomi 2026 (SE2026)** di lingkungan **Badan Pusat Statistik (BPS) Kabupaten Garut**.
