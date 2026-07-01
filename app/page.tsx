// app/page.tsx
import React from 'react';
import { kv } from '@vercel/kv';
import TombolUpdate from './components/TombolUpdate';

// 1. Definisikan tipe data sesuai struktur API Anda
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

interface ApiResponse {
  current_level: string;
  data: PetugasData[];
  last_update?: string;
}

// 2. Fungsi untuk mengambil data LIVE (Hari Ini)
async function getLiveApiData(): Promise<PetugasData[]> {
  try {
    // PENTING: Ganti URL ini dengan API asli perusahaan Anda
    const res = await fetch('https://simpul-jabar.32net.id/api/um-rekap?kdkab=3205%20-%20KAB.%20GARUT&kdkec=&kdkel=&level_view=PETUGAS', {
      cache: 'no-store',
    });
    
    if (!res.ok) throw new Error('Gagal mengambil API utama');
    
    const result: ApiResponse = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error getLiveApiData:", error);
    return [];
  }
}

// 3. Komponen Utama Halaman
export default async function DashboardPage() {
  // Ambil data Live (H)
  const dataHariIni = await getLiveApiData();
  
  // Ambil data Kemarin (H-1) dari database Redis
  // Karena kita menyimpannya sebagai string, kv.get otomatis mengubahnya kembali jadi Array Object
  const dataKemarin: PetugasData[] | null = await kv.get('data_kemarin');

  // 4. Proses Penggabungan dan Kalkulasi Selisih
  const processedData = dataHariIni.map((rowH) => {
    // Cari petugas yang sama di data kemarin berdasarkan ID unik (kdkab / email)
    const rowH1 = dataKemarin?.find((k) => k.kdkab === rowH.kdkab);

    // Jika ketemu, pakai angka kemarin. Jika petugas baru, anggap kemarin 0.
    const pendataanH1 = rowH1 ? rowH1.pendataan : 0;
    const submitH1 = rowH1 ? rowH1.submit : 0;

    return {
      ...rowH,
      pendataanH1,
      selisihPendataan: rowH.pendataan - pendataanH1,
      submitH1,
      selisihSubmit: rowH.submit - submitH1,
    };
  });

  // 5. Render Tampilan
  return (
    <main className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Progres Petugas</h1>
        <TombolUpdate />
      </div>
      
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
            {/* Baris Header Atas */}
            <tr>
              <th rowSpan={2} className="py-3 px-4 border text-left">Nama Petugas</th>
              <th rowSpan={2} className="py-3 px-4 border text-left">Email / Kdkab</th>
              <th colSpan={3} className="py-2 px-4 border bg-blue-50 text-blue-800">Pendataan</th>
              <th colSpan={3} className="py-2 px-4 border bg-green-50 text-green-800">Submit</th>
              <th rowSpan={2} className="py-3 px-4 border">Persentase</th>
            </tr>
            {/* Baris Header Bawah (Sub-kolom) */}
            <tr>
              <th className="py-2 px-2 border bg-blue-50 text-[11px]">H-1</th>
              <th className="py-2 px-2 border bg-blue-50 text-[11px]">Hari Ini</th>
              <th className="py-2 px-2 border bg-blue-50 text-[11px]">Selisih</th>
              
              <th className="py-2 px-2 border bg-green-50 text-[11px]">H-1</th>
              <th className="py-2 px-2 border bg-green-50 text-[11px]">Hari Ini</th>
              <th className="py-2 px-2 border bg-green-50 text-[11px]">Selisih</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">Sedang memuat atau tidak ada data...</td>
              </tr>
            ) : (
              processedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="py-3 px-4 border text-left font-medium text-gray-900">{row.nama_petugas}</td>
                  <td className="py-3 px-4 border text-left text-xs text-gray-500">{row.kdkab}</td>
                  
                  {/* Kolom Pendataan */}
                  <td className="py-3 px-2 border text-gray-400">{row.pendataanH1}</td>
                  <td className="py-3 px-2 border font-medium text-black">{row.pendataan}</td>
                  <td className={`py-3 px-2 border font-bold ${row.selisihPendataan > 0 ? 'text-green-600' : row.selisihPendataan < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {row.selisihPendataan > 0 ? `+${row.selisihPendataan}` : row.selisihPendataan}
                  </td>

                  {/* Kolom Submit */}
                  <td className="py-3 px-2 border text-gray-400">{row.submitH1}</td>
                  <td className="py-3 px-2 border font-medium text-black">{row.submit}</td>
                  <td className={`py-3 px-2 border font-bold ${row.selisihSubmit > 0 ? 'text-green-600' : row.selisihSubmit < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {row.selisihSubmit > 0 ? `+${row.selisihSubmit}` : row.selisihSubmit}
                  </td>
                  
                  <td className="py-3 px-4 border font-semibold text-blue-600">{row.percentage}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}