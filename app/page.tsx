// app/page.tsx
import React from 'react';
import FilterWilayah from './components/FilterWilayah';
import TabelAnomaliClient from './components/TabelAnomaliClient';
import TabelProgresClient from './components/TabelProgresClient'; // Komponen baru
import Header from './components/Header';
import TabSwitcher from './components/TabSwitcher';

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ kec?: string, desa?: string, pml?: string, ppl?: string, tab?: string, page?: string }> 
}) {
  const params = await searchParams;
  const selectedKec = params.kec || '';
  const selectedDesa = params.desa || '';
  const selectedPml = params.pml || '';
  const selectedPpl = params.ppl || ''; 
  const activeTab = params.tab || 'pendataan';

  // Menyimpan parameter yang aktif agar URL Tab Switcher konsisten
  const urlParamsTab = new URLSearchParams();
  if (selectedKec) urlParamsTab.set('kec', selectedKec);
  if (selectedDesa) urlParamsTab.set('desa', selectedDesa);
  if (selectedPml) urlParamsTab.set('pml', selectedPml);
  if (selectedPpl) urlParamsTab.set('ppl', selectedPpl);
  const queryStr = urlParamsTab.toString() ? `&${urlParamsTab.toString()}` : '';

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dasbor Pemantauan Data</h2>
            <p className="text-sm text-slate-500 mt-1">Pantau kinerja harian dan cek anomali data lapangan secara langsung.</p>
          </div>
        </div>

        <TabSwitcher activeTab={activeTab} queryStr={queryStr} />

        <FilterWilayah kec={selectedKec} desa={selectedDesa} pml={selectedPml} ppl={selectedPpl} />
        
        {/* Render Komponen Sesuai Tab Terpilih */}
        {activeTab === 'pendataan' ? (
          <TabelProgresClient 
            kec={selectedKec} 
            desa={selectedDesa} 
            pml={selectedPml} 
            ppl={selectedPpl}
          />
        ) : (
          <TabelAnomaliClient 
            kec={selectedKec} 
            desa={selectedDesa} 
            pml={selectedPml} 
            ppl={selectedPpl}
          />
        )}
      </main>
    </div>
  );
}