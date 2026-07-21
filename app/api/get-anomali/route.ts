// app/api/get-anomali/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import masterDataRaw from '../../data/Master SLS.json'; // Sesuaikan path ini jika error

export const revalidate = 21600;

export async function GET() {
  try {
    const meta = await kv.get('anomali_meta') as any;
    if (!meta || !meta.totalChunks) return NextResponse.json({ success: true, data: [] });

    // 1. Tarik Data Paralel
    const chunkKeys = [];
    for (let i = 0; i < meta.totalChunks; i++) chunkKeys.push(`anomali_data_${i}`);
    const chunks = await Promise.all(chunkKeys.map(key => kv.get(key)));
    
    let rawAnomali: any[] = [];
    chunks.forEach(chunk => { if (Array.isArray(chunk)) rawAnomali.push(...chunk); });

    // 2. Hash Map Master Data (Super Cepat)
    const masterLookup = new Map();
    (masterDataRaw as any[]).forEach(m => {
      if (m["Email PPL"]) masterLookup.set(String(m["Email PPL"]).trim().toLowerCase(), m);
    });

    // 3. Perkaya Data
    const enrichedAnomali = rawAnomali.map(item => {
      const email = item.email_petugas ? String(item.email_petugas).trim().toLowerCase() : "";
      const masterInfo = masterLookup.get(email);
      return {
        ...item,
        nama_pml: masterInfo?.["Nama PML"] ? String(masterInfo["Nama PML"]).trim().toUpperCase() : "TIDAK DIKETAHUI",
        _kec: masterInfo?.nmkec ? String(masterInfo.nmkec).trim().toUpperCase() : "",
        _desa: masterInfo?.nmdesa ? String(masterInfo.nmdesa).trim().toUpperCase() : "",
      };
    });

    // Berikan Cache 30 Menit ke Browser agar Tab Switch super instan!
    return NextResponse.json(
      { success: true, data: enrichedAnomali },
      { headers: { 
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=59' 
        } }
    );
  } catch (error) {
    console.error("Gagal API:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}