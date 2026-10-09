import type { Episode } from "../types/watchlist";

interface ProgressBarProps {
  episodes: Episode[];
  seriesId: string;
}

export function ProgressBar({ episodes, seriesId }: ProgressBarProps) {
  // 1. Ambil episode milik anime ini
  const currentEpisodes = episodes.filter(ep => ep.seriesId === seriesId);
  // 2. Hitung yang sudah ditonton
  const watchedCount = currentEpisodes.filter(ep => ep.watched).length;
  const totalCount = currentEpisodes.length;
  // 3. Kalkulasi persen
  const percentage = totalCount === 0 ? 0 : Math.round((watchedCount / totalCount) * 100);

  return (
    <div className="mb-4 bg-zinc-50 p-4 border border-zinc-200 rounded-lg">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-zinc-700">Progress Menonton</span>
        <span className="text-[#2e51a2] font-bold">
          {watchedCount} / {totalCount} Ep ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-zinc-300 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-[#2e51a2] h-2 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}