// app/components/TabelAnomaliClient.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';

// --- DATA KAMUS ANOMALI ---
const KAMUS_USAHA = [
  { kode: 'U1', nama: 'Biaya Produksi Dominan', desc: 'Kegiatan tidak memproduksi barang sendiri, namun komposisi pengeluaran pada biaya produksi dominan (>50%)' },
  { kode: 'U2', nama: 'Keuntungan Usaha', desc: 'Selisih pendapatan dan pengeluaran negatif' },
  { kode: 'U3', nama: 'Bukan badan usaha tetapi ada penyertaan modal korporasi', desc: "Anomali Status Badan Usaha 'Bukan Badan Usaha' dengan permodalan korporasi publik" },
  { kode: 'U4', nama: 'Data Keuangan MBG', desc: "Anomali 'Makan Bergizi Gratis (MBG)' dengan rasio nilai pendapatan dibagi pengeluaran" },
  { kode: 'U5', nama: 'Konsistensi antara aset, pekerja, dan produksi usaha', desc: 'Anomali aset, Total nilai produksi/penjualan/pendapatan, dan Total pekerja' },
  { kode: 'U6', nama: 'Usaha Menengah dan Besar tetapi tanpa menggunakan internet untuk usaha', desc: 'Pendapatan usaha menunjukkan skala unit usaha berkategori menengah dan besar, namun tidak menggunakan internet' },
  { kode: 'U7', nama: 'Usaha Menengah dan Besar tidak memiliki laporan keuangan', desc: 'Pendapatan usaha menunjukkan skala unit usaha berkategori menengah dan besar, namun tidak memiliki laporan/catatan keuangan' },
  { kode: 'U8', nama: 'Perbedaan KBLI 2 Digit Pendataan dan SBR', desc: 'KBLI 2 digit hasil pendataan berbeda dengan KBLI 2 digit pada SBR, sehingga perlu dilakukan verifikasi kesesuaian klasifikasi usaha dan mapping kode KBLI apabila diperlukan' },
];

const KAMUS_KELUARGA = [
  { kode: 'K1', nama: 'Status Cerai / Belum Kawin', desc: 'Kepala Keluarga dan pasangannya berstatus cerai atau belum kawin' },
  { kode: 'K2', nama: 'Kepala Keluarga < 10 Th', desc: 'Umur Kepala Keluarga < 10 tahun dan tinggal di rumah milik sendiri' },
  { kode: 'K3', nama: 'Semua Disabilitas', desc: 'Semua anggota keluarga menyandang disabilitas (kecuali keluarga tunggal)' },
  { kode: 'K4', nama: 'Luas Lantai Ekstrem', desc: 'Luas lantai per kapita < 3 m2 atau > 200 m2' },
  { kode: 'K5', nama: 'Selisih Pendapatan Negatif', desc: 'Selisih pendapatan dan pengeluaran negatif' },
  { kode: 'K6', nama: 'Listrik Rendah & Mewah', desc: 'Pengeluaran listrik < Rp100rb atau < 900 watt tetapi punya AC, dll' },
  { kode: 'K7', nama: 'Anggota Keluarga Ekstrem', desc: 'Jumlah Anggota Keluarga > 10 orang' },
];

export default function TabelAnomaliClient({ kec, desa, pml, ppl }: { kec: string, desa: string, pml: string, ppl: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // State untuk Accordion & Filter Kategori
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [kategoriFilter, setKategoriFilter] = useState<'ALL' | 'K' | 'U'>('ALL');
  
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    fetch('/api/get-anomali')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Filter Wilayah & Petugas
      if (kec && item._kec.toLowerCase() !== kec.toLowerCase()) return false;
      if (desa && item._desa.toLowerCase() !== desa.toLowerCase()) return false;
      if (pml && item.nama_pml.toLowerCase() !== pml.toLowerCase()) return false;
      if (ppl && item.email_petugas.toLowerCase() !== ppl.toLowerCase()) return false;
      
      // 2. Filter Kategori (Keluarga / Usaha)
      if (kategoriFilter === 'K') {
        const hasK = item.daftar_anomali.some((a: any) => a.tipe === 'K');
        if (!hasK) return false;
      } else if (kategoriFilter === 'U') {
        const hasU = item.daftar_anomali.some((a: any) => a.tipe === 'U');
        if (!hasU) return false;
      }

      return true;
    });
  }, [data, kec, desa, pml, ppl, kategoriFilter]);

  // Reset page setiap kali filter berubah
  useEffect(() => { setPage(1); }, [kec, desa, pml, ppl, kategoriFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border mt-6 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Mengunduh data anomali...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      
      {/* === ACCORDION PETUNJUK KODE ANOMALI === */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-slate-800 text-sm">Klik Disini untuk Melihat Petunjuk & Arti Kode Rule Anomali</span>
          </div>
          <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${isLegendOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isLegendOpen && (
          <div className="p-5 border-t bg-white space-y-6">
            {/* Tabel Usaha */}
            <div>
              <h4 className="font-bold text-amber-700 mb-3 text-sm flex items-center">
                <span className="bg-amber-500 w-3 h-3 rounded-full mr-2"></span> Anomali Usaha (U)
              </h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b">
                    <tr>
                      <th className="px-3 py-2 w-24">Kode Rule</th>
                      <th className="px-3 py-2 w-1/3">Nama Singkat</th>
                      <th className="px-3 py-2">Deskripsi Indikator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {KAMUS_USAHA.map((u) => (
                      <tr key={u.kode} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-red-600">{u.kode}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{u.nama}</td>
                        <td className="px-3 py-2 text-slate-600">{u.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabel Keluarga */}
            <div>
              <h4 className="font-bold text-blue-700 mb-3 text-sm flex items-center">
                <span className="bg-blue-500 w-3 h-3 rounded-full mr-2"></span> Anomali Keluarga (K)
              </h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b">
                    <tr>
                      <th className="px-3 py-2 w-24">Kode Rule</th>
                      <th className="px-3 py-2 w-1/3">Nama Singkat</th>
                      <th className="px-3 py-2">Deskripsi Indikator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {KAMUS_KELUARGA.map((k) => (
                      <tr key={k.kode} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-red-600">{k.kode}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{k.nama}</td>
                        <td className="px-3 py-2 text-slate-600">{k.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === TABEL DATA === */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        
        {/* Header Tabel & Kontrol Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-slate-800">Daftar Anomali Data</h3>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              {filteredData.length.toLocaleString('id-ID')} Baris Data
            </span>
          </div>

          {/* Filter Segmented Control */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setKategoriFilter('ALL')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${kategoriFilter === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua Kategori
            </button>
            <button
              onClick={() => setKategoriFilter('K')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${kategoriFilter === 'K' ? 'bg-blue-500 shadow-sm text-white' : 'text-slate-500 hover:text-blue-600'}`}
            >
              Keluarga Saja (K)
            </button>
            <button
              onClick={() => setKategoriFilter('U')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${kategoriFilter === 'U' ? 'bg-amber-500 shadow-sm text-white' : 'text-slate-500 hover:text-amber-600'}`}
            >
              Usaha Saja (U)
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
           <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-4">
             <p className="text-slate-500 font-medium">✨ Bagus! Tidak ada anomali yang ditemukan untuk filter ini.</p>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b">
                  <tr>
                    <th className="px-4 py-3">Wilayah / SLS</th>
                    <th className="px-4 py-3">Nama Usaha / KRT</th>
                    <th className="px-4 py-3">Petugas & PML</th>
                    <th className="px-4 py-3 text-center">Daftar Anomali</th>
                    <th className="px-4 py-3 text-right">Update Terakhir</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 w-1/4 leading-relaxed">{row.wilayah}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.nama_entitas}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{row.nama_petugas}</div>
                        <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">
                          PML: {row.nama_pml}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap gap-1.5 justify-center">
  {row.daftar_anomali.map((anomali: any, i: number) => {
    const colorClass = anomali.tipe === 'K' ? 'bg-blue-500' : 'bg-amber-500';
    const kamus = anomali.tipe === 'K' ? KAMUS_KELUARGA : KAMUS_USAHA;
    const detail = kamus.find(k => k.kode === anomali.kode);
    const penjelasanLengkap = detail ? detail.desc : 'Keterangan tidak tersedia';

    return (
      <span 
        key={i} 
        title={penjelasanLengkap} // Browser mobile akan menampilkan ini saat ditekan lama (long-press)
        className={`px-2 py-1 text-[11px] font-bold text-white rounded shadow-sm cursor-pointer transition-colors ${colorClass}`}
        onClick={() => alert(penjelasanLengkap)} // <--- TAMBAHKAN INI agar pengguna HP bisa melihat info dengan sekali klik
      >
        {anomali.kode}
      </span>
    );
  })}
</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 text-right whitespace-nowrap">{row.tanggal_update}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {row.link_fasih && row.link_fasih !== '#' ? (
                          <a 
                            href={row.link_fasih} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold text-xs rounded-md transition-colors border border-blue-200 shadow-sm"
                          >
                            Buka Fasih ↗
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-gray-500">
                  Halaman <span className="font-semibold">{page}</span> dari <span className="font-semibold">{totalPages}</span>
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${page === 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-slate-700 transition-colors'}`}
                  >
                    ← Sebelumnya
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${page === totalPages ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-slate-700 transition-colors'}`}
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}