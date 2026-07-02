// app/components/TabelProgres.tsx
'use client';

import React, { useState, useMemo } from 'react';

export interface DataTabel {
  nama_petugas: string;
  kdkab: string;
  target: number;
  pendataanLusa: number;
  pendataanKemarin: number;
  naikPendataanKemarin: number;
  pendataanHariIni: number;
  naikPendataanHariIni: number;
  persentasePendataan: number;
  submitLusa: number;
  submitKemarin: number;
  naikSubmitKemarin: number;
  submitHariIni: number;
  naikSubmitHariIni: number;
  persentaseSubmit: number;
}

interface Props {
  data: DataTabel[];
  targetHariIni: number;
  lastUpdate: string;
}

type SortDirection = 'asc' | 'desc' | null;

export default function TabelProgres({ data, targetHariIni, lastUpdate }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataTabel | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });
  
  // State untuk fitur pencarian
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: keyof DataTabel) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  // Memo untuk filter pencarian DAN sorting
  const processedData = useMemo(() => {
    let result = data;
    
    // 1. Filter Pencarian (Cari berdasarkan Nama atau Email)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.nama_petugas.toLowerCase().includes(lowerQuery) || 
        item.kdkab.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Sorting
    if (sortConfig.direction && sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof DataTabel];
        const bValue = b[sortConfig.key as keyof DataTabel];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, sortConfig]);

  const totalSubmit = data.reduce((sum, item) => sum + (item.submitHariIni || 0), 0);
  const totalTarget = data.reduce((sum, item) => sum + (item.target || 0), 0);
  const capaianWilayah = totalTarget > 0 ? (totalSubmit / totalTarget) * 100 : 0;

  const renderSortIndicator = (key: keyof DataTabel) => {
    if (sortConfig.key !== key) return null;
    return (
      <span className="inline-block ml-1 text-blue-600">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const renderBadge = (diff: number) => {
    if (diff === 0) return <span className="text-slate-400 font-medium">-</span>;
    if (diff < 0) return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">↓ {Math.abs(diff)}</span>
    );
    let colorClass = 'bg-red-100 text-red-700'; 
    if (diff >= 10) colorClass = 'bg-blue-100 text-blue-700'; 
    else if (diff >= 6) colorClass = 'bg-amber-100 text-amber-700'; 
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>↑ {diff}</span>
    );
  };

  // FUNGSI EXPORT KE EXCEL (CSV)
  const exportToExcel = () => {
    // Header Kolom
    const headers = [
      "Nama Petugas", "Email", "Target", 
      "Pendataan H-2", "Pendataan H-1", "Pendataan Hari Ini", "% Pendataan",
      "Submit H-2", "Submit H-1", "Submit Hari Ini", "% Submit"
    ];

    // Mapping Data
    const csvRows = processedData.map(item => [
      `"${item.nama_petugas}"`, // Tanda kutip agar nama tidak terpotong jika ada koma
      item.kdkab,
      item.target,
      item.pendataanLusa,
      item.pendataanKemarin,
      item.pendataanHariIni,
      item.persentasePendataan.toFixed(2),
      item.submitLusa,
      item.submitKemarin,
      item.submitHariIni,
      item.persentaseSubmit.toFixed(2)
    ]);

    // Gabungkan header dan isi
    const csvContent = [
      headers.join(","),
      ...csvRows.map(e => e.join(","))
    ].join("\n");

    // Menambahkan BOM (\uFEFF) agar Excel membaca karakter UTF-8 dengan benar
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Progres_Sensus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium text-sm tracking-wide mb-1">Capaian Wilayah Hari Ini</p>
            <p className="text-4xl font-extrabold tracking-tight">{capaianWilayah.toFixed(2)}%</p>
            <div className="mt-4 flex items-center gap-3 text-xs font-medium text-blue-100 bg-white/10 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span>Total Submit: <strong className="text-white text-sm">{totalSubmit}</strong></span>
              <span className="w-px h-3 bg-blue-300/50"></span>
              <span>Target: <strong className="text-white text-sm">{totalTarget}</strong></span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-md text-white">
          <div className="relative z-10">
            <p className="text-slate-300 font-medium text-sm tracking-wide mb-1">Target Berjalan (H+17)</p>
            <p className="text-4xl font-extrabold tracking-tight text-white">{targetHariIni.toFixed(2)}%</p>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* BARIS KONTROL: Legenda, Pencarian, & Export */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        {/* Keterangan Warna */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100/70 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Terakhir Diperbarui: <strong className="text-slate-700">{lastUpdate}</strong></span>
          </div>
          <span className="font-semibold text-slate-700 mr-1">Keterangan:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></div>
            <span>≥ 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
            <span>80-99%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-100 border border-rose-300"></div>
            <span>&lt; 80%</span>
          </div>
        </div>

        {/* Pencarian dan Export */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <input 
            type="text" 
            placeholder="Cari nama / email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 lg:w-64 p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <button 
            onClick={exportToExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
        </div>

      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center border-collapse">
            {/* Header Tabel (Tetap Sama) */}
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none">
              <tr>
                <th rowSpan={2} onClick={() => handleSort('nama_petugas')} className="py-4 px-4 text-left hover:bg-slate-100 transition-colors align-middle min-w-[220px] sticky left-0 z-10 bg-slate-50 border-r border-slate-200">
                  Petugas & Email{renderSortIndicator('nama_petugas')}
                </th>
                <th rowSpan={2} onClick={() => handleSort('target')} className="py-4 px-2 hover:bg-slate-100 transition-colors align-middle border-r border-slate-200">
                  Target{renderSortIndicator('target')}
                </th>
                <th colSpan={6} className="py-2 border-r border-slate-200 bg-blue-50/50 text-blue-800">Pendataan</th>
                <th colSpan={6} className="py-2 bg-emerald-50/50 text-emerald-800">Submit</th>
              </tr>
              <tr className="border-t border-slate-200">
                <th onClick={() => handleSort('pendataanLusa')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-2{renderSortIndicator('pendataanLusa')}</th>
                <th onClick={() => handleSort('pendataanKemarin')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-1{renderSortIndicator('pendataanKemarin')}</th>
                <th onClick={() => handleSort('naikPendataanKemarin')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">+/-{renderSortIndicator('naikPendataanKemarin')}</th>
                <th onClick={() => handleSort('pendataanHariIni')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-blue-900">Hari Ini{renderSortIndicator('pendataanHariIni')}</th>
                <th onClick={() => handleSort('naikPendataanHariIni')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">+/-{renderSortIndicator('naikPendataanHariIni')}</th>
                <th onClick={() => handleSort('persentasePendataan')} className="py-3 px-2 bg-blue-100/50 hover:bg-blue-200/50 transition-colors text-blue-900 border-r border-slate-200">% Data{renderSortIndicator('persentasePendataan')}</th>
                
                <th onClick={() => handleSort('submitLusa')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-2{renderSortIndicator('submitLusa')}</th>
                <th onClick={() => handleSort('submitKemarin')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-1{renderSortIndicator('submitKemarin')}</th>
                <th onClick={() => handleSort('naikSubmitKemarin')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">+/-{renderSortIndicator('naikSubmitKemarin')}</th>
                <th onClick={() => handleSort('submitHariIni')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-emerald-900">Hari Ini{renderSortIndicator('submitHariIni')}</th>
                <th onClick={() => handleSort('naikSubmitHariIni')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">+/-{renderSortIndicator('naikSubmitHariIni')}</th>
                <th onClick={() => handleSort('persentaseSubmit')} className="py-3 px-2 bg-emerald-100/50 hover:bg-emerald-200/50 transition-colors text-emerald-900">% Submit{renderSortIndicator('persentaseSubmit')}</th>
              </tr>
            </thead>
            
            <tbody className="text-slate-700 text-[13px]">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500 bg-white">Tidak ada data petugas ditemukan.</td>
                </tr>
              ) : (
                processedData.map((petugas) => {
                  let rowColorClass = 'bg-white hover:bg-slate-50';
                  if (targetHariIni > 0) {
                    const rasio = petugas.persentasePendataan / targetHariIni;
                    if (rasio >= 1) rowColorClass = 'bg-emerald-100 hover:bg-emerald-200/80';
                    else if (rasio >= 0.8) rowColorClass = 'bg-amber-100 hover:bg-amber-200/80';
                    else rowColorClass = 'bg-rose-100 hover:bg-rose-200/80';
                  }

                  return (
                    <tr key={petugas.kdkab} className={`border-b border-slate-200/50 transition-colors ${rowColorClass}`}>
                      <td className="py-3 px-4 text-left leading-tight sticky left-0 z-10 border-r border-slate-200/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-inherit">
                        <span className="font-bold text-slate-800 block mb-0.5">{petugas.nama_petugas}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{petugas.kdkab}</span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-700 border-r border-slate-200/50 bg-inherit">{petugas.target}</td>
                      <td className="py-3 px-2">{petugas.pendataanLusa}</td>
                      <td className="py-3 px-2">{petugas.pendataanKemarin}</td>
                      <td className="py-3 px-1.5">{renderBadge(petugas.naikPendataanKemarin)}</td>
                      <td className="py-3 px-2 font-bold text-blue-700">{petugas.pendataanHariIni}</td>
                      <td className="py-3 px-1.5">{renderBadge(petugas.naikPendataanHariIni)}</td>
                      <td className="py-3 px-2 font-extrabold text-slate-800 border-r border-slate-200/50">{petugas.persentasePendataan.toFixed(1)}%</td>
                      <td className="py-3 px-2">{petugas.submitLusa}</td>
                      <td className="py-3 px-2">{petugas.submitKemarin}</td>
                      <td className="py-3 px-1.5">{renderBadge(petugas.naikSubmitKemarin)}</td>
                      <td className="py-3 px-2 font-bold text-emerald-700">{petugas.submitHariIni}</td>
                      <td className="py-3 px-1.5">{renderBadge(petugas.naikSubmitHariIni)}</td>
                      <td className="py-3 px-2 font-extrabold text-slate-800">{petugas.persentaseSubmit.toFixed(1)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}