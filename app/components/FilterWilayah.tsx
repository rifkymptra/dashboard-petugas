// app/components/FilterWilayah.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react'; // Impor useTransition
import masterDataRaw from '../data/Master SLS.json';

interface FilterProps {
  kec: string;
  desa: string;
  pml: string;
}

export default function FilterWilayah({ kec, desa, pml }: FilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // State untuk loading
  const rawData = masterDataRaw as any[];

  const masterData = rawData.map(m => ({
    ...m,
    nmkec: m.nmkec ? String(m.nmkec).trim().toUpperCase() : '',
    nmdesa: m.nmdesa ? String(m.nmdesa).trim().toUpperCase() : '',
    "Nama PML": m["Nama PML"] ? String(m["Nama PML"]).trim().toUpperCase() : ''
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

  const listKec = getUniqueOptions(masterData, 'nmkec', m => `[${m.kdkec}] ${m.nmkec}`);
  const listDesa = kec ? getUniqueOptions(masterData.filter(m => m.nmkec === kec), 'nmdesa', m => `[${m.kddesa}] ${m.nmdesa}`) : [];
    
  let filteredForPml = masterData;
  if (kec) filteredForPml = filteredForPml.filter(m => m.nmkec === kec);
  if (desa) filteredForPml = filteredForPml.filter(m => m.nmdesa === desa);
  
  const listPml = getUniqueOptions(filteredForPml, 'Nama PML', m => m['Nama PML']);

  const updateFilter = (newKec: string, newDesa: string, newPml: string) => {
    const params = new URLSearchParams();
    if (newKec) params.set('kec', newKec);
    if (newDesa) params.set('desa', newDesa);
    if (newPml) params.set('pml', newPml);
    
    // Bungkus router.push dengan startTransition agar isPending menyala selama loading
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="mb-8 relative bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Indikator Loading di Pojok Kanan Atas */}
      <div className="absolute top-4 right-5 flex items-center h-5">
        {isPending && (
          <div className="flex items-center text-blue-600 text-xs font-semibold animate-pulse">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memperbarui data...
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mt-2 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kecamatan</label>
          <select 
            value={kec}
            onChange={(e) => updateFilter(e.target.value, '', '')}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">Semua Kecamatan</option>
            {listKec.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Desa</label>
          <select 
            value={desa}
            onChange={(e) => updateFilter(kec, e.target.value, '')}
            disabled={!kec}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="">Semua Desa</option>
            {listDesa.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pengawas (PML)</label>
          <select 
            value={pml}
            onChange={(e) => updateFilter(kec, desa, e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">Semua PML</option>
            {listPml.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}