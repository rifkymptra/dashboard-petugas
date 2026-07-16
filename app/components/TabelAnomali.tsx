// app/components/TabelAnomali.tsx
import React from 'react';
import Link from 'next/link';

interface TabelAnomaliProps {
  data: any[];
  currentPage: number;
  totalPages: number;
  totalData: number;
  baseUrl: string;
}

export default function TabelAnomali({ data, currentPage, totalPages, totalData, baseUrl }: TabelAnomaliProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border text-center mt-6">
        <p className="text-gray-500 font-medium">✨ Bagus! Tidak ada anomali yang ditemukan pada wilayah ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Daftar Anomali Usaha & Keluarga</h3>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
          Total: {totalData.toLocaleString('id-ID')} Anomali
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b">
            <tr>
              <th className="px-4 py-3">Wilayah / SLS</th>
              <th className="px-4 py-3">Nama Usaha / KRT</th>
              <th className="px-4 py-3">Petugas & PML</th>
              <th className="px-4 py-3 text-center">Daftar Anomali</th>
              <th className="px-4 py-3 text-right">Update Terakhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 w-1/4 leading-relaxed">
                  {row.wilayah}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800">{row.nama_entitas}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{row.nama_petugas}</div>
                  <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">
                    PML: {row.nama_pml}
                  </div>
                </td>
                
                {/* === RENDER BOLA ANOMALI === */}
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {row.daftar_anomali.map((anomali: any, i: number) => (
                      <span
                        key={i}
                        title={`Nilai asli dari API: ${anomali.nilai}`}
                        className={`px-2 py-1 text-[11px] font-bold text-white rounded shadow-sm cursor-help
                          ${anomali.tipe === 'K' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'}
                        `}
                      >
                        {anomali.kode}
                      </span>
                    ))}
                  </div>
                </td>
                
                <td className="px-4 py-3 text-xs text-gray-400 text-right">{row.tanggal_update}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === KONTROL PAGINATION === */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <p className="text-sm text-gray-500">
            Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
          </p>
          <div className="flex space-x-2">
            {currentPage > 1 ? (
              <Link
                href={`${baseUrl}&page=${currentPage - 1}`}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors text-slate-700"
              >
                ← Sebelumnya
              </Link>
            ) : (
              <button disabled className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed">
                ← Sebelumnya
              </button>
            )}

            {currentPage < totalPages ? (
              <Link
                href={`${baseUrl}&page=${currentPage + 1}`}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors text-slate-700"
              >
                Selanjutnya →
              </Link>
            ) : (
              <button disabled className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed">
                Selanjutnya →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}