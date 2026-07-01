// app/api/update-h1/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  // Keamanan sederhana agar tidak sembarang orang bisa menyimpan data
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'rahasiaku123') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const res = await fetch('https://api.perusahaan-anda.com/endpoint-datanya', { 
        cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('Gagal mengambil data dari API utama');
    
    const jsonData = await res.json();
    const liveData = jsonData.data; 

    // --- LOGIKA BARU: Simpan dengan key tanggal hari ini ---
    const today = new Date().toISOString().split('T')[0]; // Menghasilkan "2026-07-01"
    const key = `data_${today}`;
    
    await kv.set(key, JSON.stringify(liveData));

    return NextResponse.json({ 
        success: true, 
        message: `Data berhasil disimpan dengan key: ${key}`,
        jumlahDataDisimpan: liveData?.length || 0
    });

  } catch (error) {
    console.error("Gagal simpan:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}