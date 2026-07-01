// app/page.tsx
import React from 'react';
import { kv } from '@vercel/kv';
import masterDataRaw from './data/Master SLS.json'; 
import FilterWilayah from './components/FilterWilayah';
import TabelProgres, { DataTabel } from './components/TabelProgres';

interface PetugasData {
  nama_petugas: string;
  kdkab: string;
  target: number; // Mengambil target dari API
  pendataan: number;
  submit: number;
  percentage: number; 
  percentage_pendataan: number;
}

interface MasterSLS {
  nmkec: string;
  nmdesa: string;
  nmsls: string;
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
  searchParams: Promise<{ kec?: string, desa?: string, sls?: string }> 
}) {
  const keys = getLatestKeys();
  const historyData = await kv.mget(...keys);

  const dataHariIni = (historyData[0] as PetugasData[]) || [];
  const dataKemarin = (historyData[1] as PetugasData[]) || [];
  const dataLusa = (historyData[2] as PetugasData[]) || [];

  const params = await searchParams;
  const selectedKec = params.kec || '';
  const selectedDesa = params.desa || '';
  const selectedSls = params.sls || '';

  const filteredData = dataHariIni.filter((petugas) => {
    if (!selectedKec && !selectedDesa && !selectedSls) return true;
    return masterData.some((m) => {
      if (m["Email PPL"] !== petugas.kdkab) return false;
      if (selectedKec && m.nmkec !== selectedKec) return false;
      if (selectedDesa && m.nmdesa !== selectedDesa) return false;
      if (selectedSls && m.nmsls !== selectedSls) return false;
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
      target: petugas.target || 0, // Target individu dari API

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
    <main className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Progres 3 Hari Terakhir</h1>
      <FilterWilayah kec={selectedKec} desa={selectedDesa} sls={selectedSls} />
      <TabelProgres data={mergedData} targetHariIni={targetHariIni} />
    </main>
  );
}