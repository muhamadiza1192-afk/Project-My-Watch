import type { Series } from "../types/watchlist";

// Kita buat aturan: Komponen ini butuh dikirimkan data "series" dan fungsi "onClick"
interface ShowCardProps {
  series: Series;
  onClick: () => void;
}

export function ShowCard({ series, onClick }: ShowCardProps) {
  return (
    <div 
      className="bg-zinc-50 border border-zinc-200 rounded overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer flex flex-col"
      onClick={onClick}
    >
      {/* Kotak Gambar */}
      <div className="relative bg-zinc-200 aspect-[2/3] flex items-center justify-center overflow-hidden">
        {series.poster ? (
          <img src={series.poster} alt={series.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-zinc-400 font-medium">No Poster</span>
        )}
        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-emerald-500 shadow-sm">
          {series.status}
        </div>
      </div>
      
      {/* Judul Bawah Poster */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-[#2e51a2] leading-tight line-clamp-2 mb-1 group-hover:underline">
          {series.title}
        </h3>
        <span className="text-[10px] text-zinc-500 font-medium">{series.type}</span>
      </div>
    </div>
  );
}