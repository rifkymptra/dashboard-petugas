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
    const liveData = jsonData.data || []; 
    const lastUpdate = jsonData.last_update;

    // --- PENYESUAIAN WAKTU (SHIFT 6 JAM) ---
    // Agar sinkron dengan logika dasbor (pindah hari pada jam 06:00 WIB)
    const d = new Date();
    d.setHours(d.getHours() - 6);
    const today = d.toISOString().split('T')[0];
    const key = `data_${today}`;

    // === LOGIKA MERGE & MAX (PELINDUNG DATA) ===
    
    // 1. Ambil data yang sudah tersimpan di Redis hari ini
    let existingData: any[] = await kv.get(key) || [];
    // Vercel KV terkadang mengembalikan string, kita pastikan menjadi array
    if (typeof existingData === 'string') {
        try { existingData = JSON.parse(existingData); } catch (e) { existingData = []; }
    }

    // 2. Buat 'keranjang' Map untuk menggabungkan data
    const mergedMap = new Map();

    // 3. Masukkan data lama sebagai pondasi dasar
    if (Array.isArray(existingData)) {
      existingData.forEach(item => {
        if (item.kdkab) mergedMap.set(item.kdkab, item);
      });
    }

    // 4. Timpa dengan data baru dari API
    if (Array.isArray(liveData)) {
      liveData.forEach(item => {
        if (item.kdkab) {
          const existingItem = mergedMap.get(item.kdkab);
          
          if (existingItem) {
            // MAX LOGIC: Cegah nilai turun!
            // Jika nilai dari API lebih kecil dari yang ada di Redis (anomali API), pertahankan yang lama.
            const oldVal = existingItem.pendataan || 0;
            const newVal = item.pendataan || 0;
            if (newVal >= oldVal) {
              mergedMap.set(item.kdkab, item);
            }
          } else {
            // Jika ini petugas baru yang belum ada di Redis, langsung masukkan
            mergedMap.set(item.kdkab, item);
          }
        }
      });
    }

    // 5. Ubah kembali 'keranjang' Map menjadi Array
    const finalDataToSave = Array.from(mergedMap.values());
    
    // --- AKHIR LOGIKA MERGE & MAX ---

    // Simpan data gabungan yang sudah utuh ke Redis
    await kv.set(key, JSON.stringify(finalDataToSave));

    // Simpan waktu update ke Redis
    if (lastUpdate) {
      await kv.set('last_update_time', lastUpdate);
    }

    // Kembalikan response informatif untuk log
    return NextResponse.json({ 
        success: true, 
        message: `Data berhasil di-merge dan disimpan dengan key: ${key}`,
        jumlahDataDariAPI: liveData.length,
        jumlahDataAkhirDisimpan: finalDataToSave.length,
        waktuUpdate: lastUpdate || "Waktu tidak ditemukan di API"
    });

  } catch (error) {
    console.error("Gagal simpan:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}