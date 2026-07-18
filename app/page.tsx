// app/page.tsx
import React from 'react';
import Link from 'next/link';
import { kv } from '@vercel/kv';
import masterDataRaw from './data/Master SLS.json'; 
import FilterWilayah from './components/FilterWilayah';
import TabelProgres, { DataTabel } from './components/TabelProgres';
import TabelAnomali from './components/TabelAnomali';
import Header from './components/Header';
import TabelAnomaliClient from './components/TabelAnomaliClient';
import TabSwitcher from './components/TabSwitcher';

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

interface MasterSLS {
  nmkec: string;
  nmdesa: string;
  "Nama PML": string;
  "Email PML"?: string; 
  "Nama PPL"?: string; 
  "Email PPL": string;
  [key: string]: any; 
}

export default async function DashboardPage({ 
  searchParams 
}: { 
  // Tambahkan ppl pada searchParams agar TypeScript tidak protes
  searchParams: Promise<{ kec?: string, desa?: string, pml?: string, ppl?: string, tab?: string, page?: string }> 
}) {
  const params = await searchParams;
  const selectedKec = params.kec || '';
  const selectedDesa = params.desa || '';
  const selectedPml = params.pml || '';
  const selectedPpl = params.ppl || ''; // Menangkap parameter PPL
  const activeTab = params.tab || 'pendataan';
  const currentPage = parseInt(params.page || '1', 10);

  const lastUpdateRaw = await kv.get('last_update_time') as string;
  const lastUpdate = lastUpdateRaw ? lastUpdateRaw : "Belum tersedia";

  // === OPTIMASI SUPER CEPAT (HASH MAP) ===
  const masterLookup = new Map<string, MasterSLS>();
  masterData.forEach(m => {
    if (m["Email PPL"]) {
      masterLookup.set(String(m["Email PPL"]).trim().toLowerCase(), m);
    }
  });

  let mergedDataPPL: any[] = [];
  let mergedDataPML: DataTabel[] = [];
  let targetHariIni = getTargetHariIni();
  
  let paginatedAnomali: any[] = [];
  let totalAnomali = 0;
  let totalPages = 0;
  let basePaginationUrl = '';

  // ==============================================
  // BLOK 1: TABEL PENDATAAN
  // ==============================================
  if (activeTab === 'pendataan') {
    const keys = getLatestKeys();
    const historyData = await Promise.all(keys.map(key => kv.get(key)));

    const d0 = (historyData[0] as PetugasData[]) || [];
    const d1 = (historyData[1] as PetugasData[]) || [];
    const d2 = (historyData[2] as PetugasData[]) || [];
    const d3 = (historyData[3] as PetugasData[]) || [];
    const d4 = (historyData[4] as PetugasData[]) || [];
    const d5 = (historyData[5] as PetugasData[]) || [];

    const allKdkab = Array.from(new Set([
      ...d0.map(p => p.kdkab), ...d1.map(p => p.kdkab), ...d2.map(p => p.kdkab),
      ...d3.map(p => p.kdkab), ...d4.map(p => p.kdkab), ...d5.map(p => p.kdkab)
    ]));

    const enrichedData = allKdkab.map((email) => {
      const p0 = d0.find(p => p.kdkab === email);
      const p1 = d1.find(p => p.kdkab === email);
      const p2 = d2.find(p => p.kdkab === email);
      const p3 = d3.find(p => p.kdkab === email);
      const p4 = d4.find(p => p.kdkab === email);
      const p5 = d5.find(p => p.kdkab === email);

      const baseData = p0 || p1 || p2 || p3 || p4 || p5 || { nama_petugas: "", target: 0, submit: 0, draft: 0, pendataan: 0 };
      
      const c5 = p5?.pendataan || 0;
      const c4 = p4?.pendataan !== undefined ? p4.pendataan : c5; 
      const c3 = p3?.pendataan !== undefined ? p3.pendataan : c4;
      const c2 = p2?.pendataan !== undefined ? p2.pendataan : c3;
      const c1 = p1?.pendataan !== undefined ? p1.pendataan : c2;
      const c0 = p0?.pendataan !== undefined ? p0.pendataan : c1; 

      const h0 = Math.max(0, c0 - c1);
      const h1 = Math.max(0, c1 - c2);
      const h2 = Math.max(0, c2 - c3);
      const h3 = Math.max(0, c3 - c4);
      const h4 = Math.max(0, c4 - c5);

      const totalSubmit = baseData.submit || 0;
      const totalDraft = baseData.draft || 0;
      const target = baseData.target || 0;
      const reject = Math.max(0, c0 - totalSubmit - totalDraft);

      const emailKey = email ? String(email).trim().toLowerCase() : "";
      const masterInfo = masterLookup.get(emailKey);

      const nmkec = masterInfo?.nmkec ? String(masterInfo.nmkec).trim().toUpperCase() : "";
      const nmdesa = masterInfo?.nmdesa ? String(masterInfo.nmdesa).trim().toUpperCase() : "";
      const nama_pml = masterInfo?.["Nama PML"] ? String(masterInfo["Nama PML"]).trim().toUpperCase() : "TIDAK DIKETAHUI";
      const email_pml = masterInfo?.["Email PML"] ? String(masterInfo["Email PML"]).trim() : "-";

      const namaPPLMaster = masterInfo?.["Nama PPL"] ? String(masterInfo["Nama PPL"]).trim() : null;
      const namaAPI = baseData.nama_petugas ? String(baseData.nama_petugas).trim() : null;
      const finalNamaPPL = namaPPLMaster || namaAPI || "TANPA NAMA (CEK MASTER)";

      return {
        nama_petugas: finalNamaPPL, kdkab: email, target, h4, h3, h2, h1, h0, totalPendataan: c0,
        pct4: target > 0 ? (h4 / target) * 100 : 0, pct3: target > 0 ? (h3 / target) * 100 : 0,
        pct2: target > 0 ? (h2 / target) * 100 : 0, pct1: target > 0 ? (h1 / target) * 100 : 0,
        pct0: target > 0 ? (h0 / target) * 100 : 0, pctTotal: target > 0 ? (c0 / target) * 100 : 0, 
        nama_pml, email_pml, reject, _kec: nmkec, _desa: nmdesa
      };
    });

    mergedDataPPL = enrichedData.filter(item => {
      if (selectedKec && item._kec.toLowerCase() !== selectedKec.toLowerCase()) return false;
      if (selectedDesa && item._desa.toLowerCase() !== selectedDesa.toLowerCase()) return false;
      if (selectedPml && item.nama_pml.toLowerCase() !== selectedPml.toLowerCase()) return false;
      // Filter untuk PPL di Tabel Pendataan (kdkab di sini menyimpan email PPL)
      if (selectedPpl && item.kdkab.toLowerCase() !== selectedPpl.toLowerCase()) return false;
      return true;
    });

    const pmlMap = new Map<string, DataTabel>();
    mergedDataPPL.forEach(ppl => {
      const key = ppl.nama_pml || "TIDAK DIKETAHUI";
      if (!pmlMap.has(key)) {
        pmlMap.set(key, {
          nama_petugas: key, kdkab: ppl.email_pml && ppl.email_pml !== "-" ? ppl.email_pml : "Pengawas (PML)",
          target: 0, h4: 0, h3: 0, h2: 0, h1: 0, h0: 0, totalPendataan: 0, pct4: 0, pct3: 0, pct2: 0, pct1: 0, pct0: 0, pctTotal: 0, reject:0
        });
      }
      const pml = pmlMap.get(key)!;
      pml.target += ppl.target; pml.h4 += ppl.h4; pml.h3 += ppl.h3; pml.h2 += ppl.h2;
      pml.h1 += ppl.h1; pml.h0 += ppl.h0; pml.totalPendataan += ppl.totalPendataan; pml.reject += ppl.reject; 
    });

    mergedDataPML = Array.from(pmlMap.values()).map(pml => {
      pml.pct4 = pml.target > 0 ? (pml.h4 / pml.target) * 100 : 0;
      pml.pct3 = pml.target > 0 ? (pml.h3 / pml.target) * 100 : 0;
      pml.pct2 = pml.target > 0 ? (pml.h2 / pml.target) * 100 : 0;
      pml.pct1 = pml.target > 0 ? (pml.h1 / pml.target) * 100 : 0;
      pml.pct0 = pml.target > 0 ? (pml.h0 / pml.target) * 100 : 0;
      pml.pctTotal = pml.target > 0 ? (pml.totalPendataan / pml.target) * 100 : 0;
      return pml;
    });
  } 
  
  // Parameter string untuk Tab Switcher (Menyertakan PPL agar tidak hilang saat pindah tab)
  const urlParamsTab = new URLSearchParams();
  if (selectedKec) urlParamsTab.set('kec', selectedKec);
  if (selectedDesa) urlParamsTab.set('desa', selectedDesa);
  if (selectedPml) urlParamsTab.set('pml', selectedPml);
  if (selectedPpl) urlParamsTab.set('ppl', selectedPpl);
  const queryStr = urlParamsTab.toString() ? `&${urlParamsTab.toString()}` : '';

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dasbor Pemantauan Data</h2>
            <p className="text-sm text-slate-500 mt-1">Pantau kinerja harian dan cek anomali data lapangan secara langsung.</p>
          </div>
        </div>

        <TabSwitcher activeTab={activeTab} queryStr={queryStr} />

        {/* Meneruskan ppl ke komponen FilterWilayah */}
        <FilterWilayah kec={selectedKec} desa={selectedDesa} pml={selectedPml} ppl={selectedPpl} />
        
        {/* Render Komponen Sesuai Tab Terpilih */}
        {activeTab === 'pendataan' ? (
          <TabelProgres 
            dataPPL={mergedDataPPL} 
            dataPML={mergedDataPML} 
            targetHariIni={targetHariIni} 
            lastUpdate={lastUpdate} 
          />
        ) : (
          /* Meneruskan ppl ke komponen TabelAnomaliClient */
          <TabelAnomaliClient 
            kec={selectedKec} 
            desa={selectedDesa} 
            pml={selectedPml} 
            ppl={selectedPpl}
          />
        )}
      </main>
    </div>
  );
}