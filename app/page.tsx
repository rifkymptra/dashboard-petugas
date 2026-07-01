// src/app/page.tsx
import React from 'react';

// 1. Definisikan tipe data objek di dalam array "data"
interface PetugasData {
  draft: number;
  kdkab: string;
  nama_petugas: string;
  no_telp: string;
  open_val: number;
  pendataan: number;
  percentage: number;
  percentage_pendataan: number;
  submit: number;
  target: number;
}

// Tipe data untuk struktur root API Anda
interface ApiResponse {
  current_level: string;
  data: PetugasData[];
}

// 2. Fungsi Fetch API
async function getApiData(): Promise<PetugasData[]> {
  try {
    // Ganti URL ini dengan URL API asli Anda nanti
    const res = await fetch('https://simpul-jabar.32net.id/api/um-rekap?kdkab=3205%20-%20KAB.%20GARUT&kdkec=&kdkel=&level_view=PETUGAS', {
      cache: 'no-store',
      // Jika butuh token, buka baris di bawah ini:
      // headers: {
      //   'Authorization': 'Bearer ISI_TOKEN_ANDA_DI_SINI',
      //   'Content-Type': 'application/json'
      // }
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil data! Status: ${res.status}`);
    }

    const result: ApiResponse = await res.json();
    
    // Karena data asli berada di dalam properti "data", kita return result.data
    return result.data || []; 

  } catch (error) {
    console.error("Error Fetch API:", error);
    return []; // Kembalikan array kosong jika gagal agar tidak crash
  }
}

// 3. Komponen Utama
export default async function DashboardPage() {
  const rawData = await getApiData();

  // Sesuai rencana, sekarang kita langsung pakai data mentah dulu agar tampil.
  // Modifikasi tampilan atau kalkulasi tabel bisa kita lakukan setelah ini.
  const processedData = rawData;

  return (
    <main className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Data Progres Petugas</h1>
      
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b text-left">Nama Petugas</th>
              <th className="py-3 px-4 border-b text-left">Email / Kdkab</th>
              <th className="py-3 px-4 border-b text-left">No. Telp</th>
              <th className="py-3 px-4 border-b text-center">Target</th>
              <th className="py-3 px-4 border-b text-center">Pendataan</th>
              <th className="py-3 px-4 border-b text-center">Submit</th>
              <th className="py-3 px-4 border-b text-center">Draft</th>
              <th className="py-3 px-4 border-b text-center">Open Val</th>
              <th className="py-3 px-4 border-b text-center">Persentase</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  Tidak ada data atau gagal terhubung ke API.
                </td>
              </tr>
            ) : (
              processedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{row.nama_petugas}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{row.kdkab}</td>
                  <td className="py-3 px-4 text-xs">{row.no_telp}</td>
                  <td className="py-3 px-4 text-center">{row.target}</td>
                  <td className="py-3 px-4 text-center">{row.pendataan}</td>
                  <td className="py-3 px-4 text-center">{row.submit}</td>
                  <td className="py-3 px-4 text-center">{row.draft}</td>
                  <td className="py-3 px-4 text-center">{row.open_val}</td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-600">
                    {row.percentage}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}