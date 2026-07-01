// app/components/TombolUpdate.tsx
'use client'; // Menandakan ini adalah komponen interaktif di browser

import { useState } from 'react';


export default function TombolUpdate() {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    // Konfirmasi sebelum mengeksekusi agar tidak sengaja terpencet
    if (!confirm('Yakin ingin memperbarui data H-1 dengan data saat ini?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/update-h1?secret=rahasiaku123');
      const data = await res.json();
      
      if (data.success) {
        alert('Berhasil! ' + data.message);
        // Refresh halaman agar tabel memperbarui angkanya
        window.location.reload(); 
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={loading}
      className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors 
        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {loading ? 'Memproses...' : 'Sinkronkan Data H-1'}
    </button>
  );
}