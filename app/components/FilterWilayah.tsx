// app/components/FilterWilayah.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import Select from 'react-select';
import masterDataRaw from '../data/Master SLS.json';

interface FilterProps {
  kec: string;
  desa: string;
  pml: string;
  ppl: string;
}

export default function FilterWilayah({ kec, desa, pml, ppl }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); 
  const rawData = masterDataRaw as any[];

  // 1. Persiapan Data Master
  const masterData = rawData.map(m => ({
    ...m,
    nmkec: m.nmkec ? String(m.nmkec).trim().toUpperCase() : '',
    nmdesa: m.nmdesa ? String(m.nmdesa).trim().toUpperCase() : '',
    "Nama PML": m["Nama PML"] ? String(m["Nama PML"]).trim().toUpperCase() : '',
    "Nama PPL": m["Nama PPL"] ? String(m["Nama PPL"]).trim().toUpperCase() : '',
    "Email PPL": m["Email PPL"] ? String(m["Email PPL"]).trim().toLowerCase() : ''
  }));

  const getUniqueOptions = (data: any[], valueKey: string, labelFn: (item: any) => string) => {
    const map = new Map();
    data.forEach(item => {
      if (item[valueKey] && !map.has(item[valueKey])) {
        map.set(item[valueKey], { value: item[valueKey], label: labelFn(item) });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  };

  // 2. Pembuatan Opsi Dropdown
  const listKec = getUniqueOptions(masterData, 'nmkec', m => `[${m.kdkec}] ${m.nmkec}`);
  const listDesa = kec ? getUniqueOptions(masterData.filter(m => m.nmkec === kec), 'nmdesa', m => `[${m.kddesa}] ${m.nmdesa}`) : [];
    
  let filteredForPml = masterData;
  if (kec) filteredForPml = filteredForPml.filter(m => m.nmkec === kec);
  if (desa) filteredForPml = filteredForPml.filter(m => m.nmdesa === desa);
  
  const listPml = getUniqueOptions(filteredForPml, 'Nama PML', m => m['Nama PML']);

  let filteredForPpl = filteredForPml;
  if (pml) filteredForPpl = filteredForPpl.filter(m => m['Nama PML'] === pml);
  const listPpl = getUniqueOptions(filteredForPpl, 'Email PPL', m => m['Nama PPL'] ? m['Nama PPL'] : m['Email PPL']);

  // 3. Fungsi Utama Pembaruan URL
  const updateFilter = (newKec: string, newDesa: string, newPml: string, newPpl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newKec) params.set('kec', newKec); else params.delete('kec');
    if (newDesa) params.set('desa', newDesa); else params.delete('desa');
    if (newPml) params.set('pml', newPml); else params.delete('pml');
    if (newPpl) params.set('ppl', newPpl); else params.delete('ppl');
    
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  // 4. Styling Kustom untuk react-select agar mirip dengan Tailwind
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
      },
      backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc', 
      fontSize: '0.875rem',
      padding: '2px'
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      overflow: 'hidden',
      zIndex: 50,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#334155',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#2563eb' }
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#94a3b8'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#334155',
      fontWeight: '500'
    })
  };

  return (
    // 1. HAPUS 'overflow-hidden' dan TAMBAHKAN 'relative z-20' agar menu tampil di atas tabel
    <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 relative z-20">
      
      {/* HEADER FILTER & TOMBOL RESET */}
      {/* 2. TAMBAHKAN 'rounded-t-2xl' agar sudut abu-abu atas tetap melengkung rapi */}
      <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="font-bold text-slate-700 text-sm">Filter Wilayah & Petugas</h3>
        </div>

        <div className="flex items-center space-x-4">
          {/* Indikator Loading */}
          {isPending && (
            <div className="flex items-center text-blue-600 text-xs font-semibold animate-pulse">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat...
            </div>
          )}

          {/* Tombol Reset (Hanya muncul jika ada filter yang aktif) */}
          {(kec || desa || pml || ppl) && (
            <button
              onClick={() => updateFilter('', '', '', '')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-bold transition-colors border border-red-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* KONTEN DROPDOWN */}
      <div className={`p-5 grid grid-cols-1 md:grid-cols-4 gap-5 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kecamatan</label>
          <Select
            options={listKec}
            value={listKec.find(k => k.value === kec) || null}
            onChange={(sel: any) => updateFilter(sel ? sel.value : '', '', '', '')}
            placeholder="Ketik nama kecamatan..."
            isClearable
            noOptionsMessage={() => "Tidak ditemukan"}
            styles={selectStyles}
            instanceId="select-kec"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Desa</label>
          <Select
            options={listDesa}
            value={listDesa.find(d => d.value === desa) || null}
            onChange={(sel: any) => updateFilter(kec, sel ? sel.value : '', '', '')}
            placeholder={kec ? "Ketik nama desa..." : "Pilih kecamatan dulu"}
            isDisabled={!kec}
            isClearable
            noOptionsMessage={() => "Tidak ditemukan"}
            styles={selectStyles}
            instanceId="select-desa"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pengawas (PML)</label>
          <Select
            options={listPml}
            value={listPml.find(p => p.value === pml) || null}
            onChange={(sel: any) => updateFilter(kec, desa, sel ? sel.value : '', '')}
            placeholder="Ketik nama PML..."
            isClearable
            noOptionsMessage={() => "Tidak ditemukan"}
            styles={selectStyles}
            instanceId="select-pml"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Petugas (PPL)</label>
          <Select
            options={listPpl}
            value={listPpl.find(p => p.value === ppl) || null}
            onChange={(sel: any) => updateFilter(kec, desa, pml, sel ? sel.value : '')}
            placeholder="Ketik nama PPL..."
            isClearable
            noOptionsMessage={() => "Tidak ditemukan"}
            styles={selectStyles}
            instanceId="select-ppl"
          />
        </div>

      </div>
    </div>
  );
}