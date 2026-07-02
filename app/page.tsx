// app/page.tsx
import React from 'react';
import { kv } from '@vercel/kv';
import masterDataRaw from './data/Master SLS.json'; 
import FilterWilayah from './components/FilterWilayah';
import TabelProgres, { DataTabel } from './components/TabelProgres';
import Header from './components/Header'; // Impor Header Baru

interface PetugasData {
  nama_petugas: string;
  kdkab: string;
  target: number;
  pendataan: number;
  submit: number;
  percentage: number; 
  percentage_pendataan: number;
}

interface MasterSLS {
  nmkec: string;
  nmdesa: string;
  "Nama PML": string;
  "Email PPL": string;
  [key: string]: any; 
}

const masterData = masterDataRaw as MasterSLS[];

function getLatestKeys() {
  const keys = [];
  for (let i = 0; i < 3; i++) {
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

  const dataHariIni = (historyData[0] as PetugasData[]) || [];
  const dataKemarin = (historyData[1] as PetugasData[]) || [];
  const dataLusa = (historyData[2] as PetugasData[]) || [];

  const params = await searchParams;
  const selectedKec = params.kec || '';
  const selectedDesa = params.desa || '';
  const selectedPml = params.pml || '';

  const filteredData = dataHariIni.filter((petugas) => {
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

  const mergedData: DataTabel[] = filteredData.map((petugas) => {
    const pKemarin = dataKemarin?.find(p => p.kdkab === petugas.kdkab);
    const pLusa = dataLusa?.find(p => p.kdkab === petugas.kdkab);

    const pendataanLusa = pLusa?.pendataan || 0;
    const pendataanKemarin = pKemarin?.pendataan || 0;
    const pendataanHariIni = petugas.pendataan || 0;

    const submitLusa = pLusa?.submit || 0;
    const submitKemarin = pKemarin?.submit || 0;
    const submitHariIni = petugas.submit || 0;

    return {
      nama_petugas: petugas.nama_petugas,
      kdkab: petugas.kdkab, 
      target: petugas.target || 0,
      pendataanLusa,
      pendataanKemarin,
      naikPendataanKemarin: pendataanKemarin - pendataanLusa,
      pendataanHariIni,
      naikPendataanHariIni: pendataanHariIni - pendataanKemarin,
      persentasePendataan: petugas.percentage_pendataan || 0,
      submitLusa,
      submitKemarin,
      naikSubmitKemarin: submitKemarin - submitLusa,
      submitHariIni,
      naikSubmitHariIni: submitHariIni - submitKemarin,
      persentaseSubmit: petugas.percentage || 0,
    };
  });

  const targetHariIni = getTargetHariIni();

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>
      <Header />
    {/* Wrapper tengah dengan lebar maksimum */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Progres Pengumpulan Data</h2>
            <p className="text-sm text-slate-500 mt-1">Pantau kinerja petugas lapangan selama 3 hari terakhir.</p>
          </div>
        </div>
        
        <FilterWilayah kec={selectedKec} desa={selectedDesa} pml={selectedPml} />
        <TabelProgres data={mergedData} targetHariIni={targetHariIni} lastUpdate={lastUpdate} />
        
      </main>
    </div>
  );
}