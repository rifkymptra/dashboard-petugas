// app/api/get-pendataan/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import masterDataRaw from '../../data/Master SLS.json'; // Sesuaikan path jika letaknya berbeda

interface PetugasData {
  nama_petugas: string;
  kdkab: string;
  target: number;
  pendataan: number;
  submit: number;
  draft: number;
}

function getLatestKeys() {
  const keys = [];
  for (let i = 0; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(`data_${d.toISOString().split('T')[0]}`);
  }
  return keys;
}

function getTargetHariIni() {
  const hariIni = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const startDate = new Date('2026-06-14T00:00:00').getTime();
  const diffTime = new Date(hariIni).getTime() - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * 1.70);
}

export async function GET() {
  try {
    const keys = getLatestKeys();
    
    // Tarik 6 hari data secara paralel agar bebas dari limit 10MB Upstash
    const historyData = await Promise.all(keys.map(key => kv.get(key)));
    
    const lastUpdateRaw = (await kv.get('last_update_time')) as string;
    const lastUpdate = lastUpdateRaw || "Belum tersedia";

    const d0 = (historyData[0] as PetugasData[]) || [];
    const d1 = (historyData[1] as PetugasData[]) || [];
    const d2 = (historyData[2] as PetugasData[]) || [];
    const d3 = (historyData[3] as PetugasData[]) || [];
    const d4 = (historyData[4] as PetugasData[]) || [];
    const d5 = (historyData[5] as PetugasData[]) || [];

    const allKdkab = Array.from(new Set([
      ...d0.map(p => p.kdkab), ...d1.map(p => p.kdkab), ...d2.map(p => p.kdkab),
      ...d3.map(p => p.kdkab), ...d4.map(p => p.kdkab), ...d5.map(p => p.kdkab)
    ]));

    // Optimasi Map Master Data
    const masterLookup = new Map<string, any>();
    (masterDataRaw as any[]).forEach(m => {
      if (m["Email PPL"]) {
        masterLookup.set(String(m["Email PPL"]).trim().toLowerCase(), m);
      }
    });

    const enrichedData = allKdkab.map((email) => {
      const p0 = d0.find(p => p.kdkab === email);
      const p1 = d1.find(p => p.kdkab === email);
      const p2 = d2.find(p => p.kdkab === email);
      const p3 = d3.find(p => p.kdkab === email);
      const p4 = d4.find(p => p.kdkab === email);
      const p5 = d5.find(p => p.kdkab === email);

      const baseData = p0 || p1 || p2 || p3 || p4 || p5 || { nama_petugas: "", target: 0, submit: 0, draft: 0, pendataan: 0 };
      
      const c5 = p5?.pendataan || 0;
      const c4 = p4?.pendataan !== undefined ? p4.pendataan : c5; 
      const c3 = p3?.pendataan !== undefined ? p3.pendataan : c4;
      const c2 = p2?.pendataan !== undefined ? p2.pendataan : c3;
      const c1 = p1?.pendataan !== undefined ? p1.pendataan : c2;
      const c0 = p0?.pendataan !== undefined ? p0.pendataan : c1; 

      const h0 = Math.max(0, c0 - c1);
      const h1 = Math.max(0, c1 - c2);
      const h2 = Math.max(0, c2 - c3);
      const h3 = Math.max(0, c3 - c4);
      const h4 = Math.max(0, c4 - c5);

      const totalSubmit = baseData.submit || 0;
      const totalDraft = baseData.draft || 0;
      const target = baseData.target || 0;
      const reject = Math.max(0, c0 - totalSubmit - totalDraft);

      const emailKey = email ? String(email).trim().toLowerCase() : "";
      const masterInfo = masterLookup.get(emailKey);

      const nmkec = masterInfo?.nmkec ? String(masterInfo.nmkec).trim().toUpperCase() : "";
      const nmdesa = masterInfo?.nmdesa ? String(masterInfo.nmdesa).trim().toUpperCase() : "";
      const nama_pml = masterInfo?.["Nama PML"] ? String(masterInfo["Nama PML"]).trim().toUpperCase() : "TIDAK DIKETAHUI";
      const email_pml = masterInfo?.["Email PML"] ? String(masterInfo["Email PML"]).trim() : "-";

      const namaPPLMaster = masterInfo?.["Nama PPL"] ? String(masterInfo["Nama PPL"]).trim() : null;
      const namaAPI = baseData.nama_petugas ? String(baseData.nama_petugas).trim() : null;
      const finalNamaPPL = namaPPLMaster || namaAPI || "TANPA NAMA (CEK MASTER)";

      return {
        nama_petugas: finalNamaPPL, kdkab: email, target, h4, h3, h2, h1, h0, totalPendataan: c0,
        pct4: target > 0 ? (h4 / target) * 100 : 0, pct3: target > 0 ? (h3 / target) * 100 : 0,
        pct2: target > 0 ? (h2 / target) * 100 : 0, pct1: target > 0 ? (h1 / target) * 100 : 0,
        pct0: target > 0 ? (h0 / target) * 100 : 0, pctTotal: target > 0 ? (c0 / target) * 100 : 0, 
        nama_pml, email_pml, reject, _kec: nmkec, _desa: nmdesa
      };
    });

    // PERLINDUNGAN CDN CACHE (6 Jam)
    return NextResponse.json(
      { success: true, data: enrichedData, targetHariIni: getTargetHariIni(), lastUpdate },
      { 
        headers: { 
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=59' 
        } 
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data pendataan' }, { status: 500 });
  }
}