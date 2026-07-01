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
    // 1. Tarik data dari API Anda
    // UBAH URL INI DENGAN API ASLI PERUSAHAAN ANDA
    const res = await fetch('https://api.perusahaan-anda.com/endpoint-datanya', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('Gagal mengambil data dari API utama');
    
    const jsonData = await res.json();

    // 2. Ambil bagian array "data"-nya saja sesuai struktur API Anda
    const liveData = jsonData.data; 

    // 3. Simpan ke Database Redis dengan nama "data_kemarin"
    await kv.set('data_kemarin', JSON.stringify(liveData));

    return NextResponse.json({ 
      success: true, 
      message: 'Berhasil! Data hari ini sudah disimpan sebagai data H-1 di Redis.',
      jumlahDataDisimpan: liveData?.length || 0
    });

  } catch (error) {
    console.error("Gagal simpan:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}