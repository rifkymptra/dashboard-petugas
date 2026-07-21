// app/components/TabelProgresClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TabelProgres, { DataTabel } from './TabelProgres';

interface TabelProgresClientProps {
  kec: string;
  desa: string;
  pml: string;
  ppl: string;
}

export default function TabelProgresClient({ kec, desa, pml, ppl }: TabelProgresClientProps) {
  const [dataPPLRaw, setDataPPLRaw] = useState<any[]>([]);
  const [targetHariIni, setTargetHariIni] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>("Sedang memuat...");
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil data dari API Client-Side
  useEffect(() => {
    fetch('/api/get-pendataan')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setDataPPLRaw(json.data);
          setTargetHariIni(json.targetHariIni);
          setLastUpdate(json.lastUpdate);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data pendataan", err);
        setLoading(false);
      });
  }, []);

  // Filter dan olah data berdasarkan pilihan dropdown pengguna
  const { filteredPPL, dataPML } = useMemo(() => {
    // 1. Filter PPL
    const filtered = dataPPLRaw.filter(item => {
      if (kec && item._kec.toLowerCase() !== kec.toLowerCase()) return false;
      if (desa && item._desa.toLowerCase() !== desa.toLowerCase()) return false;
      if (pml && item.nama_pml.toLowerCase() !== pml.toLowerCase()) return false;
      if (ppl && item.kdkab.toLowerCase() !== ppl.toLowerCase()) return false;
      return true;
    });

    // 2. Agregasi Data PML
    const pmlMap = new Map<string, DataTabel>();
    filtered.forEach(item => {
      const key = item.nama_pml || "TIDAK DIKETAHUI";
      if (!pmlMap.has(key)) {
        pmlMap.set(key, {
          nama_petugas: key, 
          kdkab: item.email_pml && item.email_pml !== "-" ? item.email_pml : "Pengawas (PML)",
          target: 0, h4: 0, h3: 0, h2: 0, h1: 0, h0: 0, totalPendataan: 0, 
          pct4: 0, pct3: 0, pct2: 0, pct1: 0, pct0: 0, pctTotal: 0, reject: 0
        });
      }
      const pmlObj = pmlMap.get(key)!;
      pmlObj.target += item.target; pmlObj.h4 += item.h4; pmlObj.h3 += item.h3; pmlObj.h2 += item.h2;
      pmlObj.h1 += item.h1; pmlObj.h0 += item.h0; pmlObj.totalPendataan += item.totalPendataan; pmlObj.reject += item.reject; 
    });

    // Hitung persentase PML
    const aggregatedPML = Array.from(pmlMap.values()).map(pmlObj => {
      pmlObj.pct4 = pmlObj.target > 0 ? (pmlObj.h4 / pmlObj.target) * 100 : 0;
      pmlObj.pct3 = pmlObj.target > 0 ? (pmlObj.h3 / pmlObj.target) * 100 : 0;
      pmlObj.pct2 = pmlObj.target > 0 ? (pmlObj.h2 / pmlObj.target) * 100 : 0;
      pmlObj.pct1 = pmlObj.target > 0 ? (pmlObj.h1 / pmlObj.target) * 100 : 0;
      pmlObj.pct0 = pmlObj.target > 0 ? (pmlObj.h0 / pmlObj.target) * 100 : 0;
      pmlObj.pctTotal = pmlObj.target > 0 ? (pmlObj.totalPendataan / pmlObj.target) * 100 : 0;
      return pmlObj;
    });

    return { filteredPPL: filtered, dataPML: aggregatedPML };
  }, [dataPPLRaw, kec, desa, pml, ppl]);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border mt-6 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Mengambil riwayat data dari server...</p>
      </div>
    );
  }

  // Gunakan komponen UI asli yang sudah Anda buat
  return (
    <TabelProgres 
      dataPPL={filteredPPL} 
      dataPML={dataPML} 
      targetHariIni={targetHariIni} 
      lastUpdate={lastUpdate} 
    />
  );
}