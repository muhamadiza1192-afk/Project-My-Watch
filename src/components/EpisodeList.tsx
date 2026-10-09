import { useState, useEffect } from "react";
import type { Episode } from "../types/watchlist";

interface EpisodeListProps {
  episodes: Episode[];
  seriesId: string;
  onToggleWatched: (episodeId: string) => void;
  onDeleteEpisode: (episodeId: string) => void;
  onEditEpisode: (episodeId: string) => void; // <-- TAMBAHAN BARU
}

export function EpisodeList({ episodes, seriesId, onToggleWatched, onDeleteEpisode, onEditEpisode }: EpisodeListProps) {
  const seriesEpisodes = episodes.filter((ep) => ep.seriesId === seriesId);
  const uniqueSeasons = Array.from(new Set(seriesEpisodes.map((ep) => ep.season))).sort((a, b) => a - b);

  const [activeSeason, setActiveSeason] = useState(uniqueSeasons[0] || 1);
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    if (uniqueSeasons.length > 0 && !uniqueSeasons.includes(activeSeason)) {
      setActiveSeason(uniqueSeasons[0]);
    }
  }, [uniqueSeasons, activeSeason]);

  if (seriesEpisodes.length === 0) {
    return (
      <div className="border border-zinc-200 rounded p-4 text-center text-sm text-zinc-500 bg-zinc-50">
        Belum ada episode ditambahkan.
      </div>
    );
  }

  return (
    <div>
      {uniqueSeasons.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm font-bold text-zinc-700">Filter Season:</label>
          <select
            value={activeSeason}
            onChange={(e) => setActiveSeason(Number(e.target.value))}
            className="border border-zinc-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:border-[#2e51a2] cursor-pointer shadow-sm hover:bg-zinc-50"
          >
            {uniqueSeasons.map((season) => (
              <option key={season} value={season}>Season {season}</option>
            ))}
          </select>
        </div>
      )}

      <div className="border border-zinc-200 rounded overflow-hidden shadow-sm">
        <div className="bg-[#2e51a2] text-white px-4 py-2 font-bold text-sm">
          Season {activeSeason}
        </div>
        
        {seriesEpisodes
          .filter((ep) => ep.season === activeSeason)
          .sort((a, b) => a.episodeNumber - b.episodeNumber)
          .map((ep) => (
            <div key={ep.id} className="border-b border-zinc-200 last:border-b-0">
              
              <div 
                className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition cursor-pointer"
                onClick={() => setExpandedEpisodeId(expandedEpisodeId === ep.id ? null : ep.id)}
              >
                <input 
                  type="checkbox" 
                  checked={ep.watched}
                  className="w-4 h-4 cursor-pointer"
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleWatched(ep.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-500 shrink-0">Ep {ep.episodeNumber}</span>
                    <span className={ep.watched ? "line-through text-zinc-400 truncate" : "text-zinc-800 font-medium truncate"}>
                      {ep.title}
                    </span>
                    {ep.platform && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200">
                        {ep.platform}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ep.link && ep.link.trim() !== "") {
                        const targetUrl = ep.link.startsWith("http://") || ep.link.startsWith("https://") ? ep.link : `https://${ep.link}`;
                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                      } else {
                        alert("Link streaming belum diatur.");
                      }
                      if (!ep.watched) onToggleWatched(ep.id);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition shrink-0 ${
                      ep.watched ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border border-zinc-200" : "bg-blue-50 text-[#2e51a2] hover:bg-[#2e51a2] hover:text-white border border-blue-200"
                    }`}
                  >
                    {ep.watched ? "✓ Selesai" : "▶ Putar"}
                  </button>

                  {/* --- TOMBOL EDIT BARU --- */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEpisode(ep.id);
                    }}
                    className="text-xs text-blue-500 hover:underline shrink-0 ml-1"
                  >
                    Edit
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEpisode(ep.id);
                    }}
                    className="text-xs text-red-500 hover:underline shrink-0 ml-1"
                  >
                    Hapus
                  </button>
                  
                  <span className="text-zinc-400 text-xs ml-1">
                    {expandedEpisodeId === ep.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedEpisodeId === ep.id && (
                <div className="px-10 pb-3 pt-1 text-xs text-zinc-600 bg-zinc-50/50 border-t border-zinc-100">
                  <p className="whitespace-pre-line leading-relaxed">
                    <span className="font-semibold text-zinc-700">Catatan/Deskripsi:</span>{" "}
                    {ep.notes && ep.notes.trim() !== "" ? ep.notes : "Tidak ada catatan tambahan untuk episode ini."}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}