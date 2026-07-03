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
    const res = await fetch('https://simpul-jabar.32net.id/api/um-rekap?kdkab=3205%20-%20KAB.%20GARUT&kdkec=&kdkel=&level_view=PETUGAS', { 
        cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('Gagal mengambil data dari API utama');
    
    const jsonData = await res.json();
    const liveData = jsonData.data; 
    
    // 👇 TAMBAHAN: Ekstrak last_update dari API
    const lastUpdate = jsonData.last_update;

    // --- LOGIKA: Simpan dengan key tanggal hari ini ---
    const today = new Date().toISOString().split('T')[0];
    const key = `data_${today}`;
    
    await kv.set(key, JSON.stringify(liveData));

    // 👇 TAMBAHAN: Simpan waktu update ke Redis
    if (lastUpdate) {
      await kv.set('last_update_time', lastUpdate);
    }

    return NextResponse.json({ 
        success: true, 
        message: `Data berhasil disimpan dengan key: ${key}`,
        jumlahDataDisimpan: liveData?.length || 0,
        waktuUpdate: lastUpdate || "Waktu tidak ditemukan di API"
    });

  } catch (error) {
    console.error("Gagal simpan:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}