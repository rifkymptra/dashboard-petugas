// app/components/FilterKabupaten.tsx
'use client'; // Ini memberitahu Next.js bahwa komponen ini berjalan di Browser (klien)

import { useRouter } from 'next/navigation';

export default function FilterKabupaten({ listKab, selectedKab }: { listKab: string[], selectedKab: string }) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kabupaten:</label>
      <select 
        value={selectedKab}
        onChange={(e) => {
          const kab = e.target.value;
          // Mengubah URL secara dinamis saat dipilih
          if (kab) {
            router.push(`/?kab=${kab}`);
          } else {
            router.push(`/`);
          }
        }}
        className="block w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Semua Kabupaten</option>
        {listKab.map((kab) => (
          <option key={kab} value={kab}>{kab}</option>
        ))}
      </select>
    </div>
  );
}