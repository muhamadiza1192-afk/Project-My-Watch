export type MediaType = "Movie" | "Series";
export type WatchStatus = "Watching" | "Completed" | "On Hold" | "Dropped" | "Plan to Watch";
export type AppView = "watchlist" | "add-show" | "detail";

export interface Series {
    id: string;
    title : string;
    type : MediaType;
    status : WatchStatus;
    poster?: string;
    year?: number;
    genre?: string;
    description?: string;
    link?: string;    
}

export interface Episode {
    id: string;
    seriesId: string;
    season: number;
    episodeNumber: number;
    title: string;
    watched: boolean;
    platform?: string;
    link?: string;
    notes?: string;
}

