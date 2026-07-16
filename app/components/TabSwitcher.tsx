// app/components/TabSwitcher.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';

interface TabSwitcherProps {
  activeTab: string;
  queryStr: string;
}

export default function TabSwitcher({ activeTab, queryStr }: TabSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [targetTab, setTargetTab] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    if (activeTab === tab) return; // Abaikan jika mengklik tab yang sama
    setTargetTab(tab); // Simpan tab mana yang sedang diload
    
    // startTransition memberi tahu React bahwa ini adalah navigasi background
    startTransition(() => {
      router.push(`/?tab=${tab}${queryStr}`);
    });
  };

  return (
    <div className="mb-6 flex space-x-2 bg-slate-200/50 p-1.5 rounded-lg w-fit">
      
      {/* Tombol Tab Pendataan */}
      <button
        onClick={() => handleTabChange('pendataan')}
        disabled={isPending}
        className={`flex items-center px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
          activeTab === 'pendataan' 
            ? 'bg-white shadow-sm text-blue-700' 
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
        } ${isPending && targetTab === 'pendataan' ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isPending && targetTab === 'pendataan' ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className="mr-2">📊</span>
        )}
        Progres Pendataan
      </button>

      {/* Tombol Tab Anomali */}
      <button
        onClick={() => handleTabChange('anomali')}
        disabled={isPending}
        className={`flex items-center px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
          activeTab === 'anomali' 
            ? 'bg-white shadow-sm text-amber-700' 
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
        } ${isPending && targetTab === 'anomali' ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isPending && targetTab === 'anomali' ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className="mr-2">🚨</span>
        )}
        Deteksi Anomali
      </button>
    </div>
  );
}