// app/components/Header.tsx
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Judul */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Memanggil gambar logo dari folder public */}
            <Image 
              src="/logo-bps.webp" 
              alt="Logo BPS Garut" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-slate-800 text-base md:text-lg leading-tight">
              BPS KABUPATEN GARUT
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wider uppercase">
              Dashboard Petugas Sensus Ekonomi 2026
            </p>
          </div>
        </div>

        {/* Menu Navigasi (Bisa ditambah nanti) */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          <div className="h-full flex items-center border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">
            Progres Harian
          </div>
          {/* <div className="h-full flex items-center text-slate-400 font-medium text-sm cursor-not-allowed">
            Riwayat (Segera)
          </div> */}
        </nav>
      </div>
    </header>
  );
}