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
}

type SortDirection = 'asc' | 'desc' | null;

export default function TabelProgres({ data, targetHariIni }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataTabel | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  const handleSort = (key: keyof DataTabel) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DataTabel];
      const bValue = b[sortConfig.key as keyof DataTabel];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // --- PERHITUNGAN BARU SESUAI REQUEST ---
  // Menghitung Total Submit dan Total Target dari data yang sedang tampil di tabel
  const totalSubmit = data.reduce((sum, item) => sum + (item.submitHariIni || 0), 0);
  const totalTarget = data.reduce((sum, item) => sum + (item.target || 0), 0);
  
  // Rata-rata = (Total Submit / Total Target) * 100
  const capaianWilayah = totalTarget > 0 ? (totalSubmit / totalTarget) * 100 : 0;

  const renderSortIndicator = (key: keyof DataTabel) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') return ' 🔼';
    if (sortConfig.direction === 'desc') return ' 🔽';
    return null;
  };

  const renderBadge = (diff: number) => {
    if (diff === 0) return <span className="text-gray-400 font-normal">-</span>;
    if (diff < 0) return <span className="text-red-500 font-bold">▼{Math.abs(diff)}</span>;
    
    let colorClass = 'text-red-500'; // <= 5
    if (diff >= 10) colorClass = 'text-blue-600'; // >= 10
    else if (diff >= 6) colorClass = 'text-amber-500'; // 6-9
    
    return <span className={`font-bold ${colorClass}`}>▲{diff}</span>;
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* CARD 1: Rata-rata Pendataan (Dihitung dari Total Submit / Total Target) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
            Rata-rata Pendataan Hari Ini
          </p>
          <p className="text-3xl font-bold text-gray-800">{capaianWilayah.toFixed(2)}%</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            Total Submit: <span className="text-gray-600">{totalSubmit}</span> / Target: <span className="text-gray-600">{totalTarget}</span>
          </p>
        </div>

        {/* CARD 2: Target Nasional */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Target Nasional Hari Ini</p>
          <p className="text-3xl font-bold text-gray-800">{targetHariIni.toFixed(2)}%</p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-gray-100 text-gray-700 text-[11px] uppercase cursor-pointer select-none leading-tight">
            <tr>
              <th rowSpan={2} onClick={() => handleSort('nama_petugas')} className="py-3 px-4 border text-left hover:bg-gray-200 transition-colors align-middle min-w-[250px]">
                Nama Petugas & Email{renderSortIndicator('nama_petugas')}
              </th>
              <th rowSpan={2} onClick={() => handleSort('target')} className="py-3 px-2 border hover:bg-gray-200 transition-colors align-middle">
                Target{renderSortIndicator('target')}
              </th>
              <th colSpan={6} className="py-2 border bg-blue-50">Pendataan</th>
              <th colSpan={6} className="py-2 border bg-green-50">Submit</th>
            </tr>
            <tr>
              {/* Header Pendataan */}
              <th onClick={() => handleSort('pendataanLusa')} className="py-2 px-2 border bg-blue-50 hover:bg-blue-100">H-2{renderSortIndicator('pendataanLusa')}</th>
              <th onClick={() => handleSort('pendataanKemarin')} className="py-2 px-2 border bg-blue-50 hover:bg-blue-100">H-1{renderSortIndicator('pendataanKemarin')}</th>
              <th onClick={() => handleSort('naikPendataanKemarin')} className="py-2 px-2 border bg-blue-50 hover:bg-blue-100">+/- H-1{renderSortIndicator('naikPendataanKemarin')}</th>
              <th onClick={() => handleSort('pendataanHariIni')} className="py-2 px-2 border bg-blue-50 hover:bg-blue-100">H.Ini{renderSortIndicator('pendataanHariIni')}</th>
              <th onClick={() => handleSort('naikPendataanHariIni')} className="py-2 px-2 border bg-blue-50 hover:bg-blue-100">+/- H.Ini{renderSortIndicator('naikPendataanHariIni')}</th>
              <th onClick={() => handleSort('persentasePendataan')} className="py-2 px-2 border bg-blue-100 font-bold hover:bg-blue-200">% Data{renderSortIndicator('persentasePendataan')}</th>
              
              {/* Header Submit */}
              <th onClick={() => handleSort('submitLusa')} className="py-2 px-2 border bg-green-50 hover:bg-green-100">H-2{renderSortIndicator('submitLusa')}</th>
              <th onClick={() => handleSort('submitKemarin')} className="py-2 px-2 border bg-green-50 hover:bg-green-100">H-1{renderSortIndicator('submitKemarin')}</th>
              <th onClick={() => handleSort('naikSubmitKemarin')} className="py-2 px-2 border bg-green-50 hover:bg-green-100">+/- H-1{renderSortIndicator('naikSubmitKemarin')}</th>
              <th onClick={() => handleSort('submitHariIni')} className="py-2 px-2 border bg-green-50 hover:bg-green-100">H.Ini{renderSortIndicator('submitHariIni')}</th>
              <th onClick={() => handleSort('naikSubmitHariIni')} className="py-2 px-2 border bg-green-50 hover:bg-green-100">+/- H.Ini{renderSortIndicator('naikSubmitHariIni')}</th>
              <th onClick={() => handleSort('persentaseSubmit')} className="py-2 px-2 border bg-green-100 font-bold hover:bg-green-200">% Submit{renderSortIndicator('persentaseSubmit')}</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-[13px]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-gray-500 bg-white">Tidak ada petugas di wilayah ini.</td>
              </tr>
            ) : (
              sortedData.map((petugas) => {
                let rowColorClass = 'bg-white hover:bg-gray-50';
                
                if (petugas.persentasePendataan > 0 && targetHariIni > 0) {
                  const rasio = petugas.persentasePendataan / targetHariIni;
                  if (rasio >= 1) rowColorClass = 'bg-emerald-200 hover:bg-emerald-300';
                  else if (rasio >= 0.8) rowColorClass = 'bg-yellow-200 hover:bg-yellow-300';
                  else rowColorClass = 'bg-red-200 hover:bg-red-300';
                }

                return (
                  <tr key={petugas.kdkab} className={`border-b transition-colors ${rowColorClass}`}>
                    <td className="py-3 px-4 border text-left leading-tight">
                      <span className="font-semibold block">{petugas.nama_petugas}</span>
                      <span className="text-[11px] text-gray-600">({petugas.kdkab})</span>
                    </td>
                    
                    <td className="py-3 px-2 border font-medium text-gray-700">{petugas.target}</td>

                    <td className="py-3 px-2 border">{petugas.pendataanLusa}</td>
                    <td className="py-3 px-2 border">{petugas.pendataanKemarin}</td>
                    <td className="py-3 px-1 border bg-white/30">{renderBadge(petugas.naikPendataanKemarin)}</td>
                    <td className="py-3 px-2 border font-bold text-blue-900">{petugas.pendataanHariIni}</td>
                    <td className="py-3 px-1 border bg-white/30">{renderBadge(petugas.naikPendataanHariIni)}</td>
                    <td className="py-3 px-2 border font-bold">{petugas.persentasePendataan.toFixed(2)}%</td>
                    
                    <td className="py-3 px-2 border">{petugas.submitLusa}</td>
                    <td className="py-3 px-2 border">{petugas.submitKemarin}</td>
                    <td className="py-3 px-1 border bg-white/30">{renderBadge(petugas.naikSubmitKemarin)}</td>
                    <td className="py-3 px-2 border font-bold text-green-900">{petugas.submitHariIni}</td>
                    <td className="py-3 px-1 border bg-white/30">{renderBadge(petugas.naikSubmitHariIni)}</td>
                    <td className="py-3 px-2 border font-bold">{petugas.persentaseSubmit.toFixed(2)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}