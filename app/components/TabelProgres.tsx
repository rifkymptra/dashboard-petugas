// app/components/TabelProgres.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';

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
  reject:number;
}

interface Props {
  dataPPL: DataTabel[];
  dataPML: DataTabel[];
  targetHariIni: number;
  lastUpdate: string;
}

type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'PPL' | 'PML';

// Opsi jumlah baris per halaman. 'all' artinya tampilkan semua data.
const PAGE_SIZE_OPTIONS: Array<number | 'all'> = [25, 50, 100, 200, 'all'];

export default function TabelProgres({ dataPPL, dataPML, targetHariIni, lastUpdate }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('PPL');

  const [sortConfig, setSortConfig] = useState<{ key: keyof DataTabel | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [filterTarget, setFilterTarget] = useState({ green: true, yellow: true, red: true });
  const [filterVol, setFilterVol] = useState({ blue: true, yellow: true, red: true });

  // === STATE PAGINATION ===
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const [currentPage, setCurrentPage] = useState(1);

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
    let result = activeData;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.nama_petugas.toLowerCase().includes(lowerQuery) ||
        item.kdkab.toLowerCase().includes(lowerQuery)
      );
    }

    result = result.filter(item => {
      let passTarget = false;
      if (targetHariIni > 0) {
        const rasio = item.pctTotal / targetHariIni;
        if (rasio >= 1 && filterTarget.green) passTarget = true;
        else if (rasio >= 0.8 && rasio < 1 && filterTarget.yellow) passTarget = true;
        else if (rasio < 0.8 && filterTarget.red) passTarget = true;
      } else {
        passTarget = true;
      }

      let passVol = false;
      const h0 = item.h0 || 0;
      if (h0 >= 10 && filterVol.blue) passVol = true;
      else if (h0 >= 7 && h0 <= 9 && filterVol.yellow) passVol = true;
      else if (h0 < 7 && filterVol.red) passVol = true;

      return passTarget && passVol;
    });

    if (sortConfig.direction && sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof DataTabel] ?? '';
        const bValue = b[sortConfig.key as keyof DataTabel] ?? '';
        if ((aValue as any) < (bValue as any)) return sortConfig.direction === 'asc' ? -1 : 1;
        if ((aValue as any) > (bValue as any)) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [activeData, searchQuery, sortConfig, filterTarget, filterVol, targetHariIni]);

  // Reset ke halaman 1 setiap kali filter/pencarian/mode/urutan/ukuran halaman berubah,
  // supaya tidak "nyangkut" di halaman kosong.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTarget, filterVol, viewMode, sortConfig, pageSize]);

  const totalItems = processedData.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  // Pastikan currentPage tidak melebihi totalPages (mis. saat data berkurang karena filter)
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return processedData;
    const start = (safeCurrentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, pageSize, safeCurrentPage]);

  const startIndexDisplay = totalItems === 0 ? 0 : (pageSize === 'all' ? 1 : (safeCurrentPage - 1) * pageSize + 1);
  const endIndexDisplay = pageSize === 'all' ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

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

  // Export tetap mengekspor SELURUH data hasil filter (processedData), bukan hanya halaman yang tampil,
  // supaya file export tetap lengkap walau tabel dipaginasi.
  const exportToExcel = () => {
    const headers = [
      viewMode === 'PPL' ? "Nama PPL" : "Nama PML",
      "Email/Info", "Target",
      "Pendataan H-4", "Pendataan H-3", "Pendataan H-2", "Pendataan H-1", "Pendataan Hari Ini", "Total Pendataan",
      "% H-4", "% H-3", "% H-2", "% H-1", "% Hari Ini", "Total Capaian (%)", "Reject"
    ];

    const csvRows = processedData.map(item => [
      `"${item.nama_petugas}"`,
      item.kdkab,
      item.target,
      item.h4, item.h3, item.h2, item.h1, item.h0, item.totalPendataan,
      item.pct4.toFixed(2), item.pct3.toFixed(2), item.pct2.toFixed(2), item.pct1.toFixed(2), item.pct0.toFixed(2), item.pctTotal.toFixed(2), item.reject
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

      {/* Baris Kontrol: Kiri (Filter) & Kanan (Last Update + Search/Switch) */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">

        {/* === SISI KIRI: FILTER KOTAK SAJA === */}
        <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm w-full lg:w-fit">
          {/* Filter Target */}
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2.5">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider w-36">Filter Target:</span>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterTarget.green} onChange={() => setFilterTarget(p => ({...p, green: !p.green}))} className="accent-emerald-500 w-3.5 h-3.5" />
              <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300"></div>
              <span className="font-bold text-emerald-700">≥ Target</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterTarget.yellow} onChange={() => setFilterTarget(p => ({...p, yellow: !p.yellow}))} className="accent-amber-500 w-3.5 h-3.5" />
              <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300"></div>
              <span className="font-bold text-amber-600">80-99%</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterTarget.red} onChange={() => setFilterTarget(p => ({...p, red: !p.red}))} className="accent-rose-500 w-3.5 h-3.5" />
              <div className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-300"></div>
              <span className="font-bold text-rose-600">&lt; 80%</span>
            </label>
          </div>

          {/* Filter Volume */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider w-36">Filter Pendataan Hari Ini:</span>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterVol.blue} onChange={() => setFilterVol(p => ({...p, blue: !p.blue}))} className="accent-blue-600 w-3.5 h-3.5" />
              <span className="text-blue-700 font-extrabold w-12 text-center">≥ 10</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterVol.yellow} onChange={() => setFilterVol(p => ({...p, yellow: !p.yellow}))} className="accent-amber-500 w-3.5 h-3.5" />
              <span className="text-amber-600 font-extrabold w-12 text-center">7 - 9</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium hover:bg-slate-50 py-1 px-2 rounded transition-colors select-none text-slate-700">
              <input type="checkbox" checked={filterVol.red} onChange={() => setFilterVol(p => ({...p, red: !p.red}))} className="accent-red-500 w-3.5 h-3.5" />
              <span className="text-red-600 font-extrabold w-12 text-center">&lt; 7</span>
            </label>
          </div>
        </div>

        {/* === SISI KANAN: TERAKHIR DIPERBARUI (ATAS) & KONTROL (BAWAH) === */}
        <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">

          {/* Terakhir Diperbarui dipindah ke sini */}
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100/70 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Terakhir Diperbarui: <strong className="text-slate-700">{lastUpdate}</strong></span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Sakelar PPL / PML */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('PPL')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'PPL' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PPL
              </button>
              <button
                onClick={() => setViewMode('PML')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'PML' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PML
              </button>
            </div>

            {/* Pencarian */}
            <input
              type="text"
              placeholder="Cari nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:flex-1 lg:w-56 p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />

            {/* Export */}
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

      </div>

      {/* === BARIS KONTROL PAGINATION (ATAS TABEL) === */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <span>
            Menampilkan <strong className="text-slate-800">{startIndexDisplay}-{endIndexDisplay}</strong> dari <strong className="text-slate-800">{totalItems}</strong> data
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
            Tampilkan per halaman:
          </label>
          <select
            id="pageSize"
            value={pageSize === 'all' ? 'all' : String(pageSize)}
            onChange={(e) => {
              const v = e.target.value;
              setPageSize(v === 'all' ? 'all' : Number(v));
            }}
            className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'Semua' : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none">
              <tr>
                <th rowSpan={2} onClick={() => handleSort('nama_petugas')} className="py-4 px-4 text-left hover:bg-slate-100 transition-colors align-middle min-w-[220px] sticky left-0 z-10 bg-slate-50 border-r border-slate-200">
                  {viewMode === 'PPL' ? 'Petugas (PPL) & Email' : 'Pengawas (PML)'}
                  {renderSortIndicator('nama_petugas')}
                </th>
                <th rowSpan={2} onClick={() => handleSort('target')} className="py-4 px-2 hover:bg-slate-100 transition-colors align-middle border-r border-slate-200">
                  Target{renderSortIndicator('target')}
                </th>
                <th colSpan={5} className="py-2 border-r border-slate-200 bg-blue-50/50 text-blue-800">Pendataan Harian</th>
                <th rowSpan={2} onClick={() => handleSort('totalPendataan')} className="py-3 px-2 bg-blue-100/50 hover:bg-blue-200/50 transition-colors text-blue-900 border-r border-slate-200">Total{renderSortIndicator('totalPendataan')}</th>
                <th colSpan={5} className="py-2 bg-emerald-50/50 text-emerald-800">Persentase Harian (%)</th>
                <th rowSpan={2} onClick={() => handleSort('pctTotal')} className="py-3 px-2 bg-emerald-100/50 hover:bg-emerald-200/50 transition-colors text-emerald-900">Total %{renderSortIndicator('pctTotal')}</th>
                <th rowSpan={2} onClick={() => handleSort('reject')} className="py-3 px-2 bg-rose-100/50 hover:bg-rose-200/50 transition-colors text-rose-900 border-l border-slate-200">Reject{renderSortIndicator('reject')}</th>
              </tr>
              <tr className="border-t border-slate-200">
                <th onClick={() => handleSort('h4')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-4{renderSortIndicator('h4')}</th>
                <th onClick={() => handleSort('h3')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-3{renderSortIndicator('h3')}</th>
                <th onClick={() => handleSort('h2')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-2{renderSortIndicator('h2')}</th>
                <th onClick={() => handleSort('h1')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">H-1{renderSortIndicator('h1')}</th>
                <th onClick={() => handleSort('h0')} className="py-3 px-2 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-blue-900">Hari Ini{renderSortIndicator('h0')}</th>

                <th onClick={() => handleSort('pct4')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-4{renderSortIndicator('pct4')}</th>
                <th onClick={() => handleSort('pct3')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-3{renderSortIndicator('pct3')}</th>
                <th onClick={() => handleSort('pct2')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-2{renderSortIndicator('pct2')}</th>
                <th onClick={() => handleSort('pct1')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors">H-1{renderSortIndicator('pct1')}</th>
                <th onClick={() => handleSort('pct0')} className="py-3 px-2 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-emerald-900">Hari Ini{renderSortIndicator('pct0')}</th>
              </tr>
              
            </thead>

            <tbody className="text-slate-700 text-[13px]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500 bg-white">Tidak ada data yang sesuai dengan filter.</td>
                </tr>
              ) : (
                paginatedData.map((petugas) => {
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
                      <td className="py-3 px-2 font-extrabold text-slate-900 border-r border-slate-200/50 bg-black/5">{petugas.totalPendataan}</td>

                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct4 > 0 ? `${petugas.pct4.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct3 > 0 ? `${petugas.pct3.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct2 > 0 ? `${petugas.pct2.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-medium text-slate-600">{petugas.pct1 > 0 ? `${petugas.pct1.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-bold text-slate-900">{petugas.pct0 > 0 ? `${petugas.pct0.toFixed(2)}%` : '-'}</td>
                      <td className="py-3 px-2 font-extrabold text-slate-950 bg-black/5">{petugas.pctTotal.toFixed(2)}%</td>
                      <td className="py-3 px-2 font-extrabold text-rose-700">{petugas.reject}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* === KONTROL NAVIGASI HALAMAN (BAWAH TABEL) === */}
        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-xs sm:text-sm text-slate-500">
              Halaman <strong className="text-slate-700">{safeCurrentPage}</strong> dari <strong className="text-slate-700">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(1)}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                « Awal
              </button>
              <button
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Sebelumnya
              </button>

              {/* Nomor halaman ringkas: tampilkan beberapa nomor di sekitar halaman aktif */}
              {(() => {
                const pages: number[] = [];
                const range = 1;
                let start = Math.max(1, safeCurrentPage - range);
                let end = Math.min(totalPages, safeCurrentPage + range);
                if (safeCurrentPage - range < 1) end = Math.min(totalPages, end + (range - (safeCurrentPage - 1)));
                if (safeCurrentPage + range > totalPages) start = Math.max(1, start - (safeCurrentPage + range - totalPages));
                for (let p = start; p <= end; p++) pages.push(p);

                return pages.map(p => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                      p === safeCurrentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}

              <button
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya ›
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Akhir »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
