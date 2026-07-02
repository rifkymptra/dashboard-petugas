// app/components/TabelProgres.tsx
'use client';

import React, { useState, useMemo } from 'react';

export interface DataTabel {
  nama_petugas: string;
  kdkab: string;
  target: number;
  h4: number;
  h3: number;
  h2: number;
  h1: number;
  h0: number;
  totalPendataan: number;
  pct4: number;
  pct3: number;
  pct2: number;
  pct1: number;
  pct0: number;
  pctTotal: number;
  nama_pml?: string;
  email_pml?: string;
}

interface Props {
  dataPPL: DataTabel[]; // Menerima data PPL
  dataPML: DataTabel[]; // Menerima data PML
  targetHariIni: number;
  lastUpdate: string;
}

type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'PPL' | 'PML'; // Tipe untuk sakelar

export default function TabelProgres({ dataPPL, dataPML, targetHariIni, lastUpdate }: Props) {
  // State baru untuk mengatur tampilan tabel aktif
  const [viewMode, setViewMode] = useState<ViewMode>('PPL');
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataTabel | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  // Menentukan sumber data yang aktif
  const activeData = viewMode === 'PPL' ? dataPPL : dataPML;

  const handleSort = (key: keyof DataTabel) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const processedData = useMemo(() => {
    let result = activeData; // Gunakan activeData (PPL atau PML)
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.nama_petugas.toLowerCase().includes(lowerQuery) || 
        item.kdkab.toLowerCase().includes(lowerQuery)
      );
    }

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
  }, [activeData, searchQuery, sortConfig]);

  // Capaian wilayah tetap dihitung dari PPL agar selaras (meskipun dari PML hasilnya sama)
  const totalCapaian = dataPPL.reduce((sum, item) => sum + (item.totalPendataan || 0), 0);
  const totalTarget = dataPPL.reduce((sum, item) => sum + (item.target || 0), 0);
  const capaianWilayah = totalTarget > 0 ? (totalCapaian / totalTarget) * 100 : 0;

  const renderSortIndicator = (key: keyof DataTabel) => {
    if (sortConfig.key !== key) return null;
    return (
      <span className="inline-block ml-1 text-blue-600">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const renderVolCell = (val: number) => {
    if (val === undefined || val === null || val === 0) {
      return <td className="py-3 px-2 text-slate-400/70">-</td>;
    }
    
    let fontColorClass = "";
    if (val >= 10) fontColorClass = "text-blue-700 font-bold text-sm"; 
    else if (val >= 7 && val <= 9) fontColorClass = "text-amber-600 font-bold text-sm"; 
    else fontColorClass = "text-red-600 font-bold text-sm"; 

    return (
      <td className={`py-3 px-2 ${fontColorClass}`}>
        {val}
      </td>
    );
  };

  const exportToExcel = () => {
    const headers = [
      viewMode === 'PPL' ? "Nama PPL" : "Nama PML", 
      "Email/Info", "Target", 
      "Vol H-4", "Vol H-3", "Vol H-2", "Vol H-1", "Vol Hari Ini", "Total Volume",
      "% H-4", "% H-3", "% H-2", "% H-1", "% Hari Ini", "Total Capaian (%)"
    ];

    const csvRows = processedData.map(item => [
      `"${item.nama_petugas}"`,
      item.kdkab,
      item.target,
      item.h4, item.h3, item.h2, item.h1, item.h0, item.totalPendataan,
      item.pct4.toFixed(2), item.pct3.toFixed(2), item.pct2.toFixed(2), item.pct1.toFixed(2), item.pct0.toFixed(2), item.pctTotal.toFixed(2)
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Progres_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium text-sm tracking-wide mb-1">Capaian Wilayah Keseluruhan</p>
            <p className="text-4xl font-extrabold tracking-tight">{capaianWilayah.toFixed(2)}%</p>
            <div className="mt-4 flex items-center gap-3 text-xs font-medium text-blue-100 bg-white/10 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span>Total Data: <strong className="text-white text-sm">{totalCapaian}</strong></span>
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

      {/* Baris Kontrol */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100/70 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Terakhir Diperbarui: <strong className="text-slate-700">{lastUpdate}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
            <div className="flex items-center gap-4 border-r border-slate-200 pr-4">
              <span className="font-bold text-slate-700">Warna Baris (Target):</span>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></div><span>≥ Target</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 border border-amber-200"></div><span>80-99%</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-200"></div><span>&lt; 80%</span></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Warna Volume:</span>
              <span className="text-blue-700 font-extrabold">≥ 10</span>
              <span className="text-amber-600 font-extrabold">7-9</span>
              <span className="text-red-600 font-extrabold">&lt; 7</span>
            </div>
          </div>
        </div>

        {/* Grup Kanan: SAKELAR (TOGGLE), Pencarian, Export */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          
          {/* SWITCH BUTTONS BARU */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('PPL')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'PPL' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Level PPL
            </button>
            <button
              onClick={() => setViewMode('PML')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'PML' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Level PML
            </button>
          </div>

          <input 
            type="text" 
            placeholder="Cari nama..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 lg:w-56 p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <button 
            onClick={exportToExcel}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none">
              <tr>
                <th rowSpan={2} onClick={() => handleSort('nama_petugas')} className="py-4 px-4 text-left hover:bg-slate-100 transition-colors align-middle min-w-[220px] sticky left-0 z-10 bg-slate-50 border-r border-slate-200">
                  {/* HEADER NAMA DINAMIS: Berubah sesuai mode yang dipilih */}
                  {viewMode === 'PPL' ? 'Petugas (PPL) & Email' : 'Pengawas (PML)'}
                  {renderSortIndicator('nama_petugas')}
                </th>
                <th rowSpan={2} onClick={() => handleSort('target')} className="py-4 px-2 hover:bg-slate-100 transition-colors align-middle border-r border-slate-200">
                  Target{renderSortIndicator('target')}
                </th>
                <th colSpan={6} className="py-2 border-r border-slate-200 bg-blue-50/50 text-blue-800">Pendataan Harian</th>
                <th colSpan={6} className="py-2 bg-emerald-50/50 text-emerald-800">Persentase Harian (%)</th>
              </tr>
              <tr className="border-t border-slate-200">
                <th onClick={() => handleSort('h4')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-4{renderSortIndicator('h4')}</th>
                <th onClick={() => handleSort('h3')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-3{renderSortIndicator('h3')}</th>
                <th onClick={() => handleSort('h2')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-2{renderSortIndicator('h2')}</th>
                <th onClick={() => handleSort('h1')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-1{renderSortIndicator('h1')}</th>
                <th onClick={() => handleSort('h0')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-blue-900">Hari Ini{renderSortIndicator('h0')}</th>
                <th onClick={() => handleSort('totalPendataan')} className="py-3 px-2 bg-blue-100/50 hover:bg-blue-200/50 transition-colors text-blue-900 border-r border-slate-200">Total{renderSortIndicator('totalPendataan')}</th>
                
                <th onClick={() => handleSort('pct4')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-4{renderSortIndicator('pct4')}</th>
                <th onClick={() => handleSort('pct3')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-3{renderSortIndicator('pct3')}</th>
                <th onClick={() => handleSort('pct2')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-2{renderSortIndicator('pct2')}</th>
                <th onClick={() => handleSort('pct1')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-1{renderSortIndicator('pct1')}</th>
                <th onClick={() => handleSort('pct0')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-emerald-900">Hari Ini{renderSortIndicator('pct0')}</th>
                <th onClick={() => handleSort('pctTotal')} className="py-3 px-2 bg-emerald-100/50 hover:bg-emerald-200/50 transition-colors text-emerald-900">Total %{renderSortIndicator('pctTotal')}</th>
              </tr>
            </thead>
            
            <tbody className="text-slate-700 text-[13px]">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500 bg-white">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                processedData.map((petugas) => {
                  let rowColorClass = 'bg-white hover:bg-slate-50';
                  if (targetHariIni > 0) {
                    const rasio = petugas.pctTotal / targetHariIni;
                    if (rasio >= 1) rowColorClass = 'bg-emerald-50 hover:bg-emerald-100/50';
                    else if (rasio >= 0.8) rowColorClass = 'bg-amber-50 hover:bg-amber-100/50';
                    else rowColorClass = 'bg-rose-50 hover:bg-rose-100/50';
                  }

                  return (
                    <tr key={petugas.nama_petugas + petugas.kdkab} className={`border-b border-slate-200/40 transition-colors ${rowColorClass}`}>
                      <td className="py-3 px-4 text-left leading-tight sticky left-0 z-10 border-r border-slate-200/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-inherit">
                        <span className="font-bold text-slate-800 block mb-0.5">{petugas.nama_petugas}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{petugas.kdkab}</span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-700 border-r border-slate-200/50 bg-inherit">{petugas.target}</td>
                      
                      {renderVolCell(petugas.h4)}
                      {renderVolCell(petugas.h3)}
                      {renderVolCell(petugas.h2)}
                      {renderVolCell(petugas.h1)}
                      {renderVolCell(petugas.h0)}
                      <td className="py-3 px-2 font-extrabold text-slate-900 border-r border-slate-200/50">{petugas.totalPendataan}</td>
                      
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct4 > 0 ? `${petugas.pct4.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct3 > 0 ? `${petugas.pct3.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct2 > 0 ? `${petugas.pct2.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct1 > 0 ? `${petugas.pct1.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-bold text-slate-900">{petugas.pct0 > 0 ? `${petugas.pct0.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-extrabold text-slate-950 bg-black/5">{petugas.pctTotal.toFixed(2)}%</td>
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