// app/api/anomali/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Fungsi pintar untuk mencicil tarikan data agar server BPS tidak pingsan
async function fetchAllData(baseUrlString: string) {
  let allData: any[] = [];
  let start = 0;
  const length = 5000; // Cicil 5000 data per request
  let hasMore = true;

  const url = new URL(baseUrlString);

  while (hasMore) {
    // Update parameter start dan length di URL
    url.searchParams.set('start', start.toString());
    url.searchParams.set('length', length.toString());

    console.log(`Menarik data dari index ${start}...`);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Gagal di index ${start}`);
      throw new Error('API BPS merespon error');
    }

    const json = await res.json();
    const data = json.data || [];

    allData = allData.concat(data);

    // Jika data yang didapat kurang dari 5000, berarti kita sudah di halaman terakhir
    if (data.length < length) {
      hasMore = false; 
    } else {
      start += length; // Lanjut ke halaman berikutnya
    }
  }

  return allData;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'rahasiaku123') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    // Gunakan URL asli dari Anda, fungsi fetchAllData yang akan mengatur start & length-nya
    const urlKeluarga = 'https://simpul-jabar.32net.id/api/anomali-keluarga-list?draw=1&columns%5B0%5D%5Bdata%5D=&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=usaha_keluarga&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=link_fasih&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_1&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_2&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_3&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_4&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_5&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_6&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=T_MIKRO_ANOMALI_KELUARGA_7&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=false&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=tanggal_update&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&kdkab=3205%20-%20KAB.%20GARUT';
    const urlUsaha = 'https://simpul-jabar.32net.id/api/anomali-list?draw=2&columns%5B0%5D%5Bdata%5D=&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=usaha_keluarga&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=link_fasih&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_1&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_2&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_3&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_4&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_5&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_6&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_7&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=false&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=T_MIKRO_ANOMALI_USAHA_8&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=tanggal_update&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&kdkab=3205%20-%20KAB.%20GARUT';

    // Eksekusi penarikan secara berurutan agar lebih aman
    const dataKeluarga = await fetchAllData(urlKeluarga);
    const dataUsaha = await fetchAllData(urlUsaha);

    const extractAnomalies = (item: any, type: 'K' | 'U', keyPrefix: string, maxRule: number) => {
      const anomalies = [];
      for (let i = 1; i <= maxRule; i++) {
        const key = `${keyPrefix}${i}`;
        const val = item[key];
        
        if (val !== undefined && val !== null && String(val).trim() !== '-' && String(val).trim() !== '') {
          anomalies.push({ kode: `${type}${i}`, tipe: type, nilai: String(val).trim() });
        }
      }
      return anomalies;
    };

    const normalizedKeluarga = dataKeluarga.map((item: any) => ({
      assignment_id: item.assignment_id,
      wilayah: `${item.kdkab} | ${item.kdkec} | ${item.kddesa} | ${item.kdsls}`,
      nama_entitas: item.usaha_keluarga || '-',
      nama_petugas: item.nama_lengkap || '-',
      email_petugas: item.email || '-',
      hp_petugas: item.no_telp || '-',
      tanggal_update: item.tanggal_update || '-',
      link_fasih: item.link_fasih || '#',
      daftar_anomali: extractAnomalies(item, 'K', 'T_MIKRO_ANOMALI_KELUARGA_', 7)
    }));

    const normalizedUsaha = dataUsaha.map((item: any) => ({
      assignment_id: item.assignment_id,
      wilayah: `${item.kdkab} | ${item.kdkec} | ${item.kddesa} | ${item.kdsls}`,
      nama_entitas: item.usaha_keluarga || '-',
      nama_petugas: item.nama_lengkap || '-',
      email_petugas: item.email || '-',
      hp_petugas: item.no_telp || '-',
      tanggal_update: item.tanggal_update || '-',
      link_fasih: item.link_fasih || '#',
      daftar_anomali: extractAnomalies(item, 'U', 'T_MIKRO_ANOMALI_USAHA_', 8)
    }));

    const combinedData = [...normalizedKeluarga, ...normalizedUsaha];
    const finalData = combinedData.filter(item => item.daftar_anomali.length > 0);

    // === SOLUSI: MENCACAH DATA (CHUNKING) ===
    const CHUNK_SIZE = 1500; // Simpan maksimal 1500 baris per kardus agar tidak kena limit 1MB
    const totalChunks = Math.ceil(finalData.length / CHUNK_SIZE);

    // 1. Simpan info jumlah kardusnya ke Redis (metadata)
    await kv.set('anomali_meta', JSON.stringify({ 
        totalChunks: totalChunks, 
        totalData: finalData.length 
    }));

    // 2. Simpan potongannya ke dalam kardus masing-masing
    for (let i = 0; i < totalChunks; i++) {
      const chunk = finalData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      // Nama key-nya menjadi anomali_data_0, anomali_data_1, dst.
      await kv.set(`anomali_data_${i}`, JSON.stringify(chunk));
    }
    // ========================================
    
    const waktuUpdate = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    await kv.set('last_update_anomali', waktuUpdate);

    return NextResponse.json({
      success: true,
      message: 'Data berhasil disaring dan dicacah ke Redis',
      statistik: {
        total_keluarga_api: dataKeluarga.length,
        total_usaha_api: dataUsaha.length,
        total_anomali_tersimpan: finalData.length,
        jumlah_potongan: totalChunks
      }
    });

  } catch (error) {
    console.error("Cron anomali error:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data anomali' }, { status: 500 });
  }
}