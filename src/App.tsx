import { useState, useEffect } from "react";
import type { Series, AppView, MediaType, WatchStatus, Episode } from "./types/watchlist";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { ShowCard } from "./components/ShowCard";
import { ProgressBar } from "./components/ProgressBar";
import { EpisodeList } from "./components/EpisodeList";

export default function App() {
  // === 1. LACI DATA UTAMA (Tersimpan di localStorage) ===
  const [seriesList, setSeriesList] = useState<Series[]>(() => {
    const savedData = localStorage.getItem("myWatchlistData");
    if (savedData) return JSON.parse(savedData);
    return [];
  });

  const [episodeList, setEpisodeList] = useState<Episode[]>(() => {
    const saved = localStorage.getItem("myWatchlistEpisodes");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Halaman aktif & Series yang sedang dilihat (Diingat saat refresh)
  const [currentView, setCurrentView] = useState<AppView | "add-episode" | "edit-show" | "edit-episode">(() => {
    const saved = localStorage.getItem("myWatchlistView");
    return (saved as any) || "watchlist";
  });

  const [selectedSeries, setSelectedSeries] = useState<Series | null>(() => {
    const savedId = localStorage.getItem("myWatchlistSelectedId");
    const savedData = localStorage.getItem("myWatchlistData");
    if (savedId && savedData) {
      const list: Series[] = JSON.parse(savedData);
      return list.find((item) => item.id === savedId) || null;
    }
    return null;
  });
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  

  const [searchQuery, setSearchQuery] = useState("");

  // Form Series
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<MediaType>("Series");
  const [formStatus, setFormStatus] = useState<WatchStatus>("Plan to Watch");
  const [formPoster, setFormPoster] = useState<string | undefined>(undefined);
  const [formGenre, setFormGenre] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLink, setFormLink] = useState("");

  // Episode Sementara saat Tambah Judul Baru
  const [tempEpisodes, setTempEpisodes] = useState<{
    season: number;
    episodeNumber: number;
    title: string;
  }[]>([]);
  const [tempEpSeason, setTempEpSeason] = useState("1");
  const [tempEpNumber, setTempEpNumber] = useState("1");
  const [tempEpTitle, setTempEpTitle] = useState("");

  // Form Tambah Episode Terpisah (Lembar Baru)
  const [epSeason, setEpSeason] = useState("1");
  const [epNumber, setEpNumber] = useState("1");
  const [epTitle, setEpTitle] = useState("");
  const [epPlatform, setEpPlatform] = useState("");
  const [epLink, setEpLink] = useState("");
  const [epNotes, setEpNotes] = useState("");

  // === 2. CCTV PENYIMPAN OTOMATIS (useEffect ditempatkan setelah useState) ===
  useEffect(() => {
    localStorage.setItem("myWatchlistData", JSON.stringify(seriesList));
  }, [seriesList]);

  useEffect(() => {
    localStorage.setItem("myWatchlistEpisodes", JSON.stringify(episodeList));
  }, [episodeList]);

  useEffect(() => {
    localStorage.setItem("myWatchlistView", currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedSeries) {
      localStorage.setItem("myWatchlistSelectedId", selectedSeries.id);
    } else {
      localStorage.removeItem("myWatchlistSelectedId");
    }
  }, [selectedSeries]);

  // === 3. MESIN PENGUBAH GAMBAR ===
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPoster(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // === 4. MESIN PENYIMPAN JUDUL & EPISODE AWAL ===
  const handleAddSeries = () => {
    if (formTitle.trim() === "") {
      alert("Judul tidak boleh kosong!");
      return;
    }

    const newSeriesId = "anime-" + Date.now();

    const newSeries: Series = {
      id: newSeriesId,
      title: formTitle,
      type: formType,
      status: formStatus,
      poster: formPoster,
      year: new Date().getFullYear(),
      genre: formGenre,
      description: formDescription,
      link: formLink,
    };

    setSeriesList([...seriesList, newSeries]);

    // Kumpulkan episode sementara jika ada
    const allNewEpisodes = [...tempEpisodes];
    if (tempEpTitle.trim() !== "") {
      allNewEpisodes.push({
        season: parseInt(tempEpSeason) || 1,
        episodeNumber: parseInt(tempEpNumber) || 1,
        title: tempEpTitle.trim(),
      });
    }

    if (allNewEpisodes.length > 0) {
      const formattedEpisodes: Episode[] = allNewEpisodes.map((ep, idx) => ({
        id: "ep-" + Date.now() + "-" + idx,
        seriesId: newSeriesId,
        season: ep.season,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        watched: false,
      }));
      setEpisodeList([...episodeList, ...formattedEpisodes]);
    }

    // Bersihkan formulir
    setFormTitle("");
    setFormType("Series");
    setFormStatus("Plan to Watch");
    setFormPoster(undefined);
    setFormGenre("");
    setFormDescription("");
    setTempEpisodes([]);
    setTempEpSeason("1");
    setTempEpNumber("1");
    setTempEpTitle("");

    setSelectedSeries(newSeries);
    setCurrentView("detail");
  };

  // === 5. MESIN EDIT JUDUL ===
  const handleEditSeries = () => {
    if (!selectedSeries) return;
    if (formTitle.trim() === "") {
      alert("Judul tidak boleh kosong!");
      return;
    }

    const updatedList = seriesList.map((item) => {
      if (item.id === selectedSeries.id) {
        return {
          ...item,
          title: formTitle,
          type: formType,
          status: formStatus,
          poster: formPoster !== undefined ? formPoster : item.poster,
          genre: formGenre,
          description: formDescription,
          link: formLink,
        };
      }
      return item;
    });

    setSeriesList(updatedList);
    setSelectedSeries(updatedList.find((item) => item.id === selectedSeries.id) || null);

    setFormTitle("");
    setFormType("Series");
    setFormStatus("Plan to Watch");
    setFormPoster(undefined);
    setFormGenre("");
    setFormDescription("");
    setCurrentView("detail");
  };

  // === 6. MESIN TAMBAH EPISODE TERPISAH ===
  const handleAddEpisode = () => {
    if (!selectedSeries) return;
    if (epTitle.trim() === "") {
      alert("Judul episode tidak boleh kosong!");
      return;
    }

    const newEpisode: Episode = {
      id: "ep-" + Date.now(),
      seriesId: selectedSeries.id,
      season: parseInt(epSeason) || 1,
      episodeNumber: parseInt(epNumber) || 1,
      title: epTitle.trim(),
      watched: false,
      platform: epPlatform,
      link: epLink,
      notes: epNotes,
    };

    setEpisodeList([...episodeList, newEpisode]);
    setEpSeason("1");
    setEpNumber("1");
    setEpTitle("");
    setEpPlatform("");
    setEpLink("");
    setEpNotes("");
    setCurrentView("detail");
  };

  const handleEditEpisode = () => {
    if (!selectedEpisode) return;
    if (epTitle.trim() === "") {
      alert("Judul episode tidak boleh kosong!");
      return;
    }

    const updatedList = episodeList.map((ep) => {
      if (ep.id === selectedEpisode.id) {
        return {
          ...ep,
          season: parseInt(epSeason) || 1,
          episodeNumber: parseInt(epNumber) || 1,
          title: epTitle,
          platform: epPlatform,
          link: epLink,
          notes: epNotes,
        };
      }
      return ep;
    });

    setEpisodeList(updatedList);
    setSelectedEpisode(null); // Tutup memori
    
    // Bersihkan formulir
    setEpSeason("1");
    setEpNumber("1");
    setEpTitle("");
    setEpPlatform("");
    setEpLink("");
    setEpNotes("");
    setCurrentView("detail"); // Kembali ke halaman detail
  };

  // === 7. MESIN HAPUS JUDUL ===
  const handleDeleteSeries = () => {
    if (!selectedSeries) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus "${selectedSeries.title}" beserta seluruh episodenya?`
    );
    if (!confirmDelete) return;

    setSeriesList(seriesList.filter((item) => item.id !== selectedSeries.id));
    setEpisodeList(episodeList.filter((ep) => ep.seriesId !== selectedSeries.id));
    setSelectedSeries(null);
    setCurrentView("watchlist");
  };

  return (
    <div className="bg-[#f6f6f6] min-h-screen font-sans text-zinc-800 flex flex-col">
      {/* HEADER PITA BIRU */}
      <header className="bg-[#2e51a2] text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-extrabold tracking-wider cursor-pointer"
            onClick={() => setCurrentView("watchlist")}
          >
            MY<span className="text-blue-300">WATCH</span>
          </h1>
          {currentView === "watchlist" && (
            <button
              className="bg-white text-[#2e51a2] px-4 py-2 rounded font-bold text-sm hover:bg-blue-50 transition"
              onClick={() => setCurrentView("add-show")}
            >
              + Tambah Judul
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6">
        {/* ============================================== */}
        {/* SALURAN 1: DAFTAR POSTER                       */}
        {/* ============================================== */}
        {currentView === "watchlist" && (
          <div className="bg-white border border-zinc-200 p-4 min-h-[400px] shadow-sm rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
              <h2 className="text-lg font-bold text-zinc-800">Watchlist Saya</h2>
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Cari judul anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesList
                .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <ShowCard
                    key={item.id}
                    series={item}
                    onClick={() => {
                      setSelectedSeries(item);
                      setCurrentView("detail");
                    }}
                  />
                ))}

              {seriesList.length === 0 && (
                <div className="col-span-full py-10 text-center text-zinc-500">
                  Belum ada judul. Klik "+ Tambah Judul" untuk mulai menambahkan.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SALURAN 2: TAMBAH JUDUL BARU                   */}
        {/* ============================================== */}
        {currentView === "add-show" && (
          <div className="bg-white border border-zinc-200 p-6 min-h-[400px] max-w-2xl mx-auto shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-[#2e51a2] mb-6 border-b pb-2">
              Tambah Judul Baru
            </h2>

            <div className="flex flex-col gap-6">
              {/* Upload Gambar */}
              <div className="flex gap-4 items-center border border-zinc-200 p-4 rounded-lg bg-zinc-50">
                <div className="w-20 h-28 bg-zinc-200 border border-zinc-300 rounded flex items-center justify-center overflow-hidden shrink-0">
                  {formPoster ? (
                    <img src={formPoster} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-400">No Image</span>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Poster Anime</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Format: JPG, PNG (Max 2MB)</p>
                </div>
              </div>

              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="title">Judul (Wajib)</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Attack on Titan"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input
                  placeholder="Contoh: Action, Fantasy"
                  value={formGenre}
                  onChange={(e) => setFormGenre(e.target.value)}
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label>Deskripsi / Sinopsis</Label>
                <textarea
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2e51a2] min-h-[100px]"
                  placeholder="Ketik sinopsis di sini..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  
                />
              </div>
              <div className="space-y-2">
                <Label>Link Streaming / Nonton (URL)</Label>
                <Input 
                  placeholder="#" 
                  value={formLink} 
                  onChange={(e) => setFormLink(e.target.value)} 
                />
              </div>

              {/* Tipe & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={formType} onValueChange={(value) => setFormType(value as MediaType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Series">Series</SelectItem>
                      <SelectItem value="Movie">Movie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={(value) => setFormStatus(value as WatchStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Watching">Watching</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Plan to Watch">Plan to Watch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Input Episode Awal Sekaligus (Khusus Series) */}
              {formType === "Series" && (
                <div className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-sm text-[#2e51a2]">Episode Awal (Opsional)</h3>
                    <span className="text-xs text-zinc-500">Bisa ditambahkan sekarang atau nanti</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs">Season</Label>
                      <Input
                        type="number"
                        value={tempEpSeason}
                        onChange={(e) => setTempEpSeason(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs">Nomor Ep</Label>
                      <Input
                        type="number"
                        value={tempEpNumber}
                        onChange={(e) => setTempEpNumber(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-xs">Judul Episode</Label>
                      <Input
                        value={tempEpTitle}
                        onChange={(e) => setTempEpTitle(e.target.value)}
                        placeholder="Contoh: Pertemuan Pertama"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => {
                          if (tempEpTitle.trim() === "") {
                            alert("Masukkan judul episode terlebih dahulu!");
                            return;
                          }
                          setTempEpisodes([
                            ...tempEpisodes,
                            {
                              season: parseInt(tempEpSeason) || 1,
                              episodeNumber: parseInt(tempEpNumber) || 1,
                              title: tempEpTitle.trim(),
                            },
                          ]);
                          setTempEpNumber(String((parseInt(tempEpNumber) || 0) + 1));
                          setTempEpTitle("");
                        }}
                      >
                        + Tambah
                      </Button>
                    </div>
                  </div>

                  {tempEpisodes.length > 0 && (
                    <div className="mt-3 space-y-1 bg-white border border-zinc-200 rounded p-2 max-h-36 overflow-y-auto">
                      <p className="text-[11px] font-bold text-zinc-400 mb-1">
                        Daftar episode yang akan ikut disimpan:
                      </p>
                      {tempEpisodes.map((ep, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 border-b last:border-b-0">
                          <span>
                            <strong className="text-[#2e51a2]">S{ep.season} E{ep.episodeNumber}</strong>: {ep.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTempEpisodes(tempEpisodes.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:underline text-[11px]"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="border-t pt-4 mt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setCurrentView("watchlist")}>
                  Batal
                </Button>
                <Button className="bg-[#2e51a2] hover:bg-blue-800" onClick={handleAddSeries}>
                  Simpan ke Watchlist
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SALURAN 3: HALAMAN DETAIL & EPISODE            */}
        {/* ============================================== */}
        {currentView === "detail" && selectedSeries && (
          <div className="bg-white border border-zinc-200 p-6 min-h-[400px] shadow-sm rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentView("watchlist")}
                className="text-sm font-bold text-zinc-500 hover:text-[#2e51a2] transition"
              >
                ← Kembali ke Daftar
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormTitle(selectedSeries.title);
                    setFormType(selectedSeries.type);
                    setFormStatus(selectedSeries.status);
                    setFormPoster(selectedSeries.poster);
                    setFormGenre(selectedSeries.genre || "");
                    setFormDescription(selectedSeries.description || "");
                    setCurrentView("edit-show");
                    setFormLink(selectedSeries.link || "");
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded border border-blue-100 transition"
                >
                  Edit
                </button>

                <button
                  onClick={handleDeleteSeries}
                  className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded border border-red-100 transition"
                >
                  Hapus
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Poster Kiri */}
              <div className="w-full md:w-48 aspect-[2/3] bg-zinc-200 border border-zinc-300 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedSeries.poster ? (
                  <img src={selectedSeries.poster} alt={selectedSeries.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-400 font-medium">No Poster</span>
                )}
              </div>

              {/* Info Kanan */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[#2e51a2] mb-2">{selectedSeries.title}</h2>

                <div className="flex gap-2 mb-6 flex-wrap items-center">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
                    {selectedSeries.status}
                  </span>
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded">
                    {selectedSeries.type}
                  </span>
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded">
                    Tahun: {selectedSeries.year}
                  </span>
                  {selectedSeries.genre && (
                    <span className="px-2 py-1 bg-blue-50 text-[#2e51a2] text-xs font-bold rounded border border-blue-200">
                      Genre: {selectedSeries.genre}
                    </span>
                  )}
                </div>

                {selectedSeries.type === "Series" && (
                  <ProgressBar episodes={episodeList} seriesId={selectedSeries.id} />
                )}

                {/* 2. JIKA TIPE MOVIE: TAMPILKAN TOMBOL PUTAR / TONTON */}
                {selectedSeries.type === "Movie" && (
                  <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">Aksi Nonton</h4>
                      <p className="text-xs text-zinc-500">
                        {selectedSeries.status === "Completed"
                          ? "Film ini telah selesai Anda tonton."
                          : "Siap untuk ditonton."}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        const nextStatus: WatchStatus =
                          selectedSeries.status === "Completed" ? "Plan to Watch" : "Completed";
                        const updatedList = seriesList.map((item) =>
                          item.id === selectedSeries.id ? { ...item, status: nextStatus } : item
                        );
                        setSeriesList(updatedList);
                        setSelectedSeries({ ...selectedSeries, status: nextStatus });
                      }}
                      className={
                        selectedSeries.status === "Completed"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          : "bg-[#2e51a2] hover:bg-blue-800 text-white font-bold"
                      }
                    >
                      {selectedSeries.status === "Completed" ? "✓ Sudah Ditonton" : "▶ Putar Film"}
                    </Button>
                  </div>
                )}

                <hr className="my-4 border-zinc-200" />
                <h3 className="font-bold text-zinc-800 mb-2">Sinopsis</h3>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {selectedSeries.description || "Belum ada sinopsis untuk judul ini."}
                </p>

                {/* 3. DAFTAR EPISODE HANYA MUNCUL JIKA TIPE SERIES */}
                {selectedSeries.type === "Series" && (
                  <>
                    <hr className="my-6 border-zinc-200" />

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-zinc-800">Daftar Episode</h3>
                      <Button className="bg-[#2e51a2]" onClick={() => setCurrentView("add-episode")}>
                        + Tambah Episode Baru
                      </Button>
                    </div>

                    <EpisodeList
                  episodes={episodeList}
                  seriesId={selectedSeries.id}
                  onToggleWatched={(episodeId) => {
                    setEpisodeList(episodeList.map((item) => item.id === episodeId ? { ...item, watched: !item.watched } : item));
                  }}
                  onDeleteEpisode={(episodeId) => {
                    setEpisodeList(episodeList.filter((item) => item.id !== episodeId));
                  }}
                  // --- TAMBAHKAN BLOK INI ---
                  onEditEpisode={(episodeId) => {
                    const epToEdit = episodeList.find((ep) => ep.id === episodeId);
                    if (epToEdit) {
                      setSelectedEpisode(epToEdit);
                      setEpSeason(String(epToEdit.season));
                      setEpNumber(String(epToEdit.episodeNumber));
                      setEpTitle(epToEdit.title);
                      setEpPlatform(epToEdit.platform || "");
                      setEpLink(epToEdit.link || "");
                      setEpNotes(epToEdit.notes || "");
                      setCurrentView("edit-episode");
                    }
                  }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SALURAN 4: HALAMAN LEMBAR BARU TAMBAH EPISODE  */}
        {/* ============================================== */}
        {currentView === "add-episode" && selectedSeries && (
          <div className="bg-white border border-zinc-200 p-6 min-h-[400px] max-w-2xl mx-auto shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-[#2e51a2] mb-6 border-b pb-2">
              Tambah Episode untuk: {selectedSeries.title}
            </h2>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Input type="number" value={epSeason} onChange={(e) => setEpSeason(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Episode</Label>
                  <Input type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Judul Episode (Wajib)</Label>
                <Input placeholder="Judul..." value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform (Misal: Netflix, Bstation)</Label>
                  <Input placeholder="Platform..." value={epPlatform} onChange={(e) => setEpPlatform(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Link Streaming</Label>
                  <Input placeholder="https://..." value={epLink} onChange={(e) => setEpLink(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan Tambahan</Label>
                <Input placeholder="Catatan..." value={epNotes} onChange={(e) => setEpNotes(e.target.value)} />
              </div>

              <div className="border-t pt-4 mt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setCurrentView("detail")}>
                  Batal
                </Button>
                <Button className="bg-[#2e51a2] hover:bg-blue-800" onClick={handleAddEpisode}>
                  Simpan Episode
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SALURAN 5: HALAMAN EDIT JUDUL ANIME            */}
        {/* ============================================== */}
        {currentView === "edit-show" && selectedSeries && (
          <div className="bg-white border border-zinc-200 p-6 min-h-[400px] max-w-2xl mx-auto shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-[#2e51a2] mb-6 border-b pb-2">
              Edit: {selectedSeries.title}
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-center border border-zinc-200 p-4 rounded-lg bg-zinc-50">
                <div className="w-20 h-28 bg-zinc-200 border border-zinc-300 rounded flex items-center justify-center overflow-hidden shrink-0">
                  {formPoster ? (
                    <img src={formPoster} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-400">No Image</span>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Ganti Poster (Opsional)</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title">Judul (Wajib)</Label>
                <Input id="edit-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={formType} onValueChange={(value) => setFormType(value as MediaType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Series">Series</SelectItem>
                      <SelectItem value="Movie">Movie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={(value) => setFormStatus(value as WatchStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Watching">Watching</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Plan to Watch">Plan to Watch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Genre</Label>
                <Input value={formGenre} onChange={(e) => setFormGenre(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi / Sinopsis</Label>
                <textarea
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2e51a2] min-h-[100px]"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Link Streaming / Nonton (URL)</Label>
                <Input 
                  placeholder="#" 
                  value={formLink} 
                  onChange={(e) => setFormLink(e.target.value)} 
                />
              </div>

              <div className="border-t pt-4 mt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setCurrentView("detail")}>
                  Batal
                </Button>
                <Button className="bg-[#2e51a2] hover:bg-blue-800" onClick={handleEditSeries}>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SALURAN 6: HALAMAN EDIT EPISODE                */}
        {/* ============================================== */}
        {currentView === "edit-episode" && selectedSeries && selectedEpisode && (
          <div className="bg-white border border-zinc-200 p-6 min-h-[400px] max-w-2xl mx-auto shadow-sm rounded-lg">
            <h2 className="text-xl font-bold text-[#2e51a2] mb-6 border-b pb-2">
              Edit Episode: {selectedSeries.title}
            </h2>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Input type="number" value={epSeason} onChange={(e) => setEpSeason(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Episode</Label>
                  <Input type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Judul Episode (Wajib)</Label>
                <Input placeholder="Judul..." value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform (Misal: Netflix, Bstation)</Label>
                  <Input placeholder="Platform..." value={epPlatform} onChange={(e) => setEpPlatform(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Link Streaming</Label>
                  <Input placeholder="https://..." value={epLink} onChange={(e) => setEpLink(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan / Deskripsi Tambahan</Label>
                <textarea 
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2e51a2] min-h-[80px]"
                  placeholder="Tuliskan ringkasan cerita atau catatan..." 
                  value={epNotes} 
                  onChange={(e) => setEpNotes(e.target.value)} 
                />
              </div>

              <div className="border-t pt-4 mt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => {
                  setSelectedEpisode(null);
                  setCurrentView("detail");
                }}>
                  Batal
                </Button>
                <Button className="bg-[#2e51a2] hover:bg-blue-800" onClick={handleEditEpisode}>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-[#2e51a2] text-blue-100 py-6 mt-12 text-center text-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto px-4">
          <p className="font-extrabold text-white text-base tracking-wider">
            MY<span className="text-blue-300">WATCH</span>
          </p>
          <p className="mt-1 text-xs opacity-80">
            © {new Date().getFullYear()} Project 2 DumbWays. Muhamad Iza Mahendra.
          </p>
        </div>
      </footer>
      {/* ------------------------------------- */}

    </div>
  );
}