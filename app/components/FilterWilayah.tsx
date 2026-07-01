// app/components/FilterWilayah.tsx
'use client';

import { useRouter } from 'next/navigation';
import masterDataRaw from '../data/Master SLS.json';

interface FilterProps {
  kec: string;
  desa: string;
  pml: string;
}

export default function FilterWilayah({ kec, desa, pml }: FilterProps) {
  const router = useRouter();
  const masterData = masterDataRaw as any[];

  // Fungsi utilitas untuk membersihkan data
  const clean = (val: string) => (val ? val.toString().trim() : "");

  // Mengambil daftar unik dengan sanitasi .trim()
  const getUniqueOptions = (data: any[], valueKey: string, labelFn: (item: any) => string) => {
    const map = new Map();
    data.forEach(item => {
      const val = clean(item[valueKey]);
      if (val && !map.has(val)) {
        map.set(val, { value: val, label: labelFn(item).trim() });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  };

  // Logika filter yang lebih fleksibel
  const filteredByKec = kec ? masterData.filter(m => clean(m.nmkec) === clean(kec)) : masterData;
  const filteredByDesa = desa ? filteredByKec.filter(m => clean(m.nmdesa) === clean(desa)) : filteredByKec;

  const listKec = getUniqueOptions(masterData, 'nmkec', m => `[${m.kdkec}] ${m.nmkec}`);
  const listDesa = kec ? getUniqueOptions(filteredByKec, 'nmdesa', m => `[${m.kddesa}] ${m.nmdesa}`) : [];
  const listPml = getUniqueOptions(filteredByDesa, 'Nama PML', m => m['Nama PML']);

  const updateFilter = (newKec: string, newDesa: string, newPml: string) => {
    const params = new URLSearchParams();
    if (newKec) params.set('kec', newKec);
    if (newDesa) params.set('desa', newDesa);
    if (newPml) params.set('pml', newPml);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kecamatan</label>
        <select value={kec} onChange={(e) => updateFilter(e.target.value, '', '')} className="w-full p-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua Kecamatan</option>
          {listKec.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Desa</label>
        <select value={desa} onChange={(e) => updateFilter(kec, e.target.value, '')} className="w-full p-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua Desa</option>
          {listDesa.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pengawas (PML)</label>
        <select value={pml} onChange={(e) => updateFilter(kec, desa, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
          <option value="">Semua PML</option>
          {listPml.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
    </div>
  );
}