// app/page.tsx
import React from 'react';
import { kv } from '@vercel/kv';
import masterDataRaw from './data/Master SLS.json'; 
import FilterWilayah from './components/FilterWilayah';
import TabelProgres, { DataTabel } from './components/TabelProgres';
import Header from './components/Header';

interface PetugasData {
  nama_petugas: string;
  kdkab: string;
  target: number;
  pendataan: number;
  submit: number;
  percentage: number; 
  percentage_pendataan: number;
  draft: number;
}

interface MasterSLS {
  nmkec: string;
  nmdesa: string;
  "Nama PML": string;
  "Email PML"?: string; // Asumsi ada email PML, jika tidak ada aman
  "Email PPL": string;
  [key: string]: any; 
}

const masterData = masterDataRaw as MasterSLS[];

function getLatestKeys() {
  const keys = [];
  for (let i = 0; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(`data_${d.toISOString().split('T')[0]}`);
  }
  return keys;
}

function getTargetHariIni() {
  const hariIni = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const startDate = new Date('2026-06-14T00:00:00').getTime();
  const diffTime = new Date(hariIni).getTime() - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * 1.70);
}

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ kec?: string, desa?: string, pml?: string }> 
}) {
  const keys = getLatestKeys();
  const historyData = await kv.mget(...keys);
  
  const lastUpdateRaw = await kv.get('last_update_time') as string;
  const lastUpdate = lastUpdateRaw ? lastUpdateRaw : "Belum tersedia";

  const d0 = (historyData[0] as PetugasData[]) || [];
  const d1 = (historyData[1] as PetugasData[]) || [];
  const d2 = (historyData[2] as PetugasData[]) || [];
  const d3 = (historyData[3] as PetugasData[]) || [];
  const d4 = (historyData[4] as PetugasData[]) || [];
  const d5 = (historyData[5] as PetugasData[]) || [];

  const params = await searchParams;
  const selectedKec = params.kec || '';
  const selectedDesa = params.desa || '';
  const selectedPml = params.pml || '';

  const filteredData = d0.filter((petugas) => {
    if (!selectedKec && !selectedDesa && !selectedPml) return true;
    return masterData.some((m) => {
      if (m["Email PPL"] !== petugas.kdkab) return false;
      const cleanKec = m.nmkec ? String(m.nmkec).trim().toUpperCase() : '';
      const cleanDesa = m.nmdesa ? String(m.nmdesa).trim().toUpperCase() : '';
      const cleanPml = m["Nama PML"] ? String(m["Nama PML"]).trim().toUpperCase() : '';

      if (selectedKec && cleanKec !== selectedKec) return false;
      if (selectedDesa && cleanDesa !== selectedDesa) return false;
      if (selectedPml && cleanPml !== selectedPml) return false;
      return true;
    });
  });

  // 1. DATA UNTUK LEVEL PPL
  const mergedDataPPL: DataTabel[] = filteredData.map((petugas) => {
    const p1 = d1.find(p => p.kdkab === petugas.kdkab);
    const p2 = d2.find(p => p.kdkab === petugas.kdkab);
    const p3 = d3.find(p => p.kdkab === petugas.kdkab);
    const p4 = d4.find(p => p.kdkab === petugas.kdkab);
    const p5 = d5.find(p => p.kdkab === petugas.kdkab);

    const c0 = petugas.pendataan || 0;
    const c1 = p1?.pendataan || 0;
    const c2 = p2?.pendataan || 0;
    const c3 = p3?.pendataan || 0;
    const c4 = p4?.pendataan || 0;
    const c5 = p5?.pendataan || 0;

    const h0 = Math.max(0, c0 - c1);
    const h1 = Math.max(0, c1 - c2);
    const h2 = Math.max(0, c2 - c3);
    const h3 = Math.max(0, c3 - c4);
    const h4 = Math.max(0, c4 - c5);

    const totalSubmit = petugas.submit || 0;
    const totalDraft = petugas.draft || 0;

    const target = petugas.target || 0;
    const reject = Math.max(0, c0 - totalSubmit - totalDraft);

    // Cari info PML dari master data
    const masterInfo = masterData.find(m => m["Email PPL"] === petugas.kdkab);
    const nama_pml = masterInfo?.["Nama PML"] ? String(masterInfo["Nama PML"]).trim().toUpperCase() : "TIDAK DIKETAHUI";
    const email_pml = masterInfo?.["Email PML"] ? String(masterInfo["Email PML"]).trim() : "-";

    return {
      nama_petugas: petugas.nama_petugas,
      kdkab: petugas.kdkab, 
      target,
      h4, h3, h2, h1, h0,
      totalPendataan: c0,
      pct4: target > 0 ? (h4 / target) * 100 : 0,
      pct3: target > 0 ? (h3 / target) * 100 : 0,
      pct2: target > 0 ? (h2 / target) * 100 : 0,
      pct1: target > 0 ? (h1 / target) * 100 : 0,
      pct0: target > 0 ? (h0 / target) * 100 : 0,
      pctTotal: petugas.percentage_pendataan || 0,
      nama_pml,
      email_pml,
      reject
    };
  });

  // 2. DATA UNTUK LEVEL PML (Menggabungkan/Akumulasi data PPL di atas)
  const pmlMap = new Map<string, DataTabel>();
  mergedDataPPL.forEach(ppl => {
    const key = ppl.nama_pml || "TIDAK DIKETAHUI";
    if (!pmlMap.has(key)) {
      pmlMap.set(key, {
        nama_petugas: key, // Di tabel PML, kolom nama akan berisi Nama PML
        kdkab: ppl.email_pml && ppl.email_pml !== "-" ? ppl.email_pml : "Pengawas (PML)",
        target: 0, h4: 0, h3: 0, h2: 0, h1: 0, h0: 0, totalPendataan: 0,
        pct4: 0, pct3: 0, pct2: 0, pct1: 0, pct0: 0, pctTotal: 0, reject:0
      });
    }
    const pml = pmlMap.get(key)!;
    pml.target += ppl.target;
    pml.h4 += ppl.h4;
    pml.h3 += ppl.h3;
    pml.h2 += ppl.h2;
    pml.h1 += ppl.h1;
    pml.h0 += ppl.h0;
    pml.totalPendataan += ppl.totalPendataan;
  });

  // Hitung ulang persentase untuk PML dari total kumulatifnya
  const mergedDataPML: DataTabel[] = Array.from(pmlMap.values()).map(pml => {
    pml.pct4 = pml.target > 0 ? (pml.h4 / pml.target) * 100 : 0;
    pml.pct3 = pml.target > 0 ? (pml.h3 / pml.target) * 100 : 0;
    pml.pct2 = pml.target > 0 ? (pml.h2 / pml.target) * 100 : 0;
    pml.pct1 = pml.target > 0 ? (pml.h1 / pml.target) * 100 : 0;
    pml.pct0 = pml.target > 0 ? (pml.h0 / pml.target) * 100 : 0;
    pml.pctTotal = pml.target > 0 ? (pml.totalPendataan / pml.target) * 100 : 0;
    return pml;
  });

  const targetHariIni = getTargetHariIni();

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Progress Pengumpulan Data</h2>
            <p className="text-sm text-slate-500 mt-1">Pantau kinerja harian petugas lapangan dalam 5 hari terakhir.</p>
          </div>
        </div>
        <FilterWilayah kec={selectedKec} desa={selectedDesa} pml={selectedPml} />
        
        {/* Mengirimkan kedua data ke dalam komponen Tabel */}
        <TabelProgres 
          dataPPL={mergedDataPPL} 
          dataPML={mergedDataPML} 
          targetHariIni={targetHariIni} 
          lastUpdate={lastUpdate} 
        />
      </main>
    </div>
  );
}