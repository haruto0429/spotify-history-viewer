/**
 * Spotify履歴データの型定義
 * 実際のSpotify履歴JSONファイルの構造に基づく
 */

/**
 * Spotify履歴データの1レコード
 */
export interface SpotifyHistoryItem {
  /** ISO 8601形式のタイムスタンプ（例: "2024-08-25T15:06:49Z"） */
  ts: string;
  /** プラットフォーム（例: "not_applicable"） */
  platform: string;
  /** 再生時間（ミリ秒） */
  ms_played: number;
  /** 接続国コード（例: "JP"） */
  conn_country: string;
  /** IPアドレス（マスクされた可能性あり） */
  ip_addr: string;
  /** 楽曲名 */
  master_metadata_track_name: string | null;
  /** アーティスト名 */
  master_metadata_album_artist_name: string | null;
  /** アルバム名 */
  master_metadata_album_album_name: string | null;
  /** SpotifyトラックURI */
  spotify_track_uri: string | null;
  /** エピソード名（ポッドキャストの場合） */
  episode_name: string | null;
  /** エピソード番組名（ポッドキャストの場合） */
  episode_show_name: string | null;
  /** SpotifyエピソードURI */
  spotify_episode_uri: string | null;
  /** オーディオブックタイトル */
  audiobook_title: string | null;
  /** オーディオブックURI */
  audiobook_uri: string | null;
  /** オーディオブックチャプターURI */
  audiobook_chapter_uri: string | null;
  /** オーディオブックチャプタータイトル */
  audiobook_chapter_title: string | null;
  /** 再生開始理由 */
  reason_start: string;
  /** 再生終了理由 */
  reason_end: string;
}

/**
 * 複数の履歴ファイルを統合したデータ
 */
export interface SpotifyHistoryData {
  items: SpotifyHistoryItem[];
  source: string; // ファイル名またはAPIソース
  loadedAt: Date;
}

/**
 * アーティスト統計情報
 */
export interface ArtistStats {
  name: string;
  playCount: number;
  totalTimeMs: number;
  trackCount: number;
  tracks: string[]; // 楽曲名のリスト
}

/**
 * 楽曲統計情報
 */
export interface TrackStats {
  name: string;
  artist: string;
  playCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  album: string | null;
  spotifyUri: string | null;
}

/**
 * 日別データ
 */
export interface DailyData {
  date: Date;
  playCount: number;
  totalTimeMs: number;
  topArtist: string | null;
  topTrack: string | null;
  uniqueArtists: number;
  uniqueTracks: number;
}

/**
 * 月別データ
 */
export interface MonthlyData {
  year: number;
  month: number; // 1-12
  playCount: number;
  totalTimeMs: number;
  averageDailyTimeMs: number;
  uniqueArtists: number;
  uniqueTracks: number;
}

/**
 * 年別データ
 */
export interface YearlyData {
  year: number;
  playCount: number;
  totalTimeMs: number;
  averageDailyTimeMs: number;
  averageMonthlyTimeMs: number;
  uniqueArtists: number;
  uniqueTracks: number;
}

/**
 * ジャンル統計情報
 */
export interface GenreStats {
  name: string;
  playCount: number;
  totalTimeMs: number;
  artistCount: number;
  artists: string[];
}

/**
 * 処理済みデータの統合構造
 */
export interface ProcessedData {
  totalPlays: number;
  totalTimeMs: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  artists: ArtistStats[];
  tracks: TrackStats[];
  dailyData: DailyData[];
  monthlyData: MonthlyData[];
  yearlyData: YearlyData[];
  genres: GenreStats[];
}

/**
 * 日付範囲フィルター
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * フィルター設定
 */
export interface FilterSettings {
  dateRange: DateRange;
  artist?: string;
  track?: string;
  minPlayTime?: number; // ミリ秒
}
