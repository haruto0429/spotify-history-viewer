import { computed, type Ref } from 'vue'
import type {
  ArtistStats,
  DailyData,
  MonthlyData,
  ProcessedData,
  SpotifyHistoryItem,
  TrackStats,
  YearlyData,
} from '@/types'

interface NormalizedHistoryItem {
  source: SpotifyHistoryItem
  playedMs: number
  date: Date
  dayKey: string
  monthKey: string
  year: number
}

interface RankedEntity {
  key: string
  label: string
  count: number
  totalTimeMs: number
}

const DEFAULT_DATE = new Date(0)

const pad = (value: number): string => value.toString().padStart(2, '0')

const getDayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const getMonthKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const toStartOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const normalizeItems = (items: SpotifyHistoryItem[]): NormalizedHistoryItem[] => {
  return items
    .map((item) => {
      const date = new Date(item.ts)
      if (Number.isNaN(date.getTime())) {
        return null
      }

      const playedMs = Math.max(0, item.ms_played ?? 0)

      return {
        source: item,
        playedMs,
        date,
        dayKey: getDayKey(date),
        monthKey: getMonthKey(date),
        year: date.getFullYear(),
      }
    })
    .filter((entry): entry is NormalizedHistoryItem => entry !== null)
}

const getDisplayArtist = (item: SpotifyHistoryItem): string | null => {
  return (
    item.master_metadata_album_artist_name ??
    item.episode_show_name ??
    item.audiobook_title ??
    null
  )
}

const getDisplayTrack = (item: SpotifyHistoryItem): string | null => {
  return (
    item.master_metadata_track_name ??
    item.episode_name ??
    item.audiobook_chapter_title ??
    item.audiobook_title ??
    null
  )
}

const compareByCountThenTime = (a: RankedEntity, b: RankedEntity): number => {
  if (a.count === b.count) {
    return b.totalTimeMs - a.totalTimeMs
  }
  return b.count - a.count
}

const resolveTopLabel = (entities: Map<string, RankedEntity>): string | null => {
  if (entities.size === 0) {
    return null
  }

  const sorted = Array.from(entities.values()).sort(compareByCountThenTime)
  return sorted[0]?.label ?? null
}

export const createEmptyProcessedData = (): ProcessedData => ({
  totalPlays: 0,
  totalTimeMs: 0,
  dateRange: {
    start: DEFAULT_DATE,
    end: DEFAULT_DATE,
  },
  artists: [],
  tracks: [],
  dailyData: [],
  monthlyData: [],
  yearlyData: [],
  genres: [],
})

export const calculateProcessedData = (items: SpotifyHistoryItem[]): ProcessedData => {
  const normalized = normalizeItems(items)

  if (normalized.length === 0) {
    return createEmptyProcessedData()
  }

  const sortedByDate = [...normalized].sort((a, b) => a.date.getTime() - b.date.getTime())

  const totalTimeMs = normalized.reduce((acc, entry) => acc + entry.playedMs, 0)
  const totalPlays = normalized.length

  const artistMap = new Map<string, { stats: ArtistStats; tracks: Set<string> }>()
  const trackMap = new Map<string, TrackStats>()

  const dailyMap = new Map<
    string,
    {
      date: Date
      playCount: number
      totalTimeMs: number
      artistEntities: Map<string, RankedEntity>
      trackEntities: Map<string, RankedEntity>
      uniqueArtists: Set<string>
      uniqueTracks: Set<string>
    }
  >()

  const monthlyMap = new Map<
    string,
    {
      year: number
      month: number
      playCount: number
      totalTimeMs: number
      uniqueArtists: Set<string>
      uniqueTracks: Set<string>
      uniqueDays: Set<string>
    }
  >()

  const yearlyMap = new Map<
    number,
    {
      year: number
      playCount: number
      totalTimeMs: number
      uniqueArtists: Set<string>
      uniqueTracks: Set<string>
      uniqueDays: Set<string>
      uniqueMonths: Set<string>
    }
  >()

  normalized.forEach((entry) => {
    const { source, playedMs, dayKey, monthKey, year, date } = entry
    const artistName = getDisplayArtist(source) ?? 'Unknown Artist'
    const trackName = getDisplayTrack(source) ?? 'Unknown Track'
    const trackKey = `${trackName}__${artistName}`

    // Artist stats
    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, {
        stats: {
          name: artistName,
          playCount: 0,
          totalTimeMs: 0,
          trackCount: 0,
          tracks: [],
        },
        tracks: new Set<string>(),
      })
    }
    const artistEntry = artistMap.get(artistName)!
    artistEntry.stats.playCount += 1
    artistEntry.stats.totalTimeMs += playedMs
    artistEntry.tracks.add(trackName)

    // Track stats
    if (!trackMap.has(trackKey)) {
      trackMap.set(trackKey, {
        name: trackName,
        artist: artistName,
        playCount: 0,
        totalTimeMs: 0,
        averageTimeMs: 0,
        album: source.master_metadata_album_album_name,
        spotifyUri: source.spotify_track_uri,
      })
    }
    const trackEntry = trackMap.get(trackKey)!
    trackEntry.playCount += 1
    trackEntry.totalTimeMs += playedMs

    // Daily stats
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        date: toStartOfDay(date),
        playCount: 0,
        totalTimeMs: 0,
        artistEntities: new Map<string, RankedEntity>(),
        trackEntities: new Map<string, RankedEntity>(),
        uniqueArtists: new Set<string>(),
        uniqueTracks: new Set<string>(),
      })
    }
    const dailyEntry = dailyMap.get(dayKey)!
    dailyEntry.playCount += 1
    dailyEntry.totalTimeMs += playedMs
    dailyEntry.uniqueArtists.add(artistName)
    dailyEntry.uniqueTracks.add(trackKey)

    const dailyArtistEntities = dailyEntry.artistEntities
    if (!dailyArtistEntities.has(artistName)) {
      dailyArtistEntities.set(artistName, {
        key: artistName,
        label: artistName,
        count: 0,
        totalTimeMs: 0,
      })
    }
    const dailyArtist = dailyArtistEntities.get(artistName)!
    dailyArtist.count += 1
    dailyArtist.totalTimeMs += playedMs

    const dailyTrackEntities = dailyEntry.trackEntities
    if (!dailyTrackEntities.has(trackKey)) {
      dailyTrackEntities.set(trackKey, {
        key: trackKey,
        label: trackName,
        count: 0,
        totalTimeMs: 0,
      })
    }
    const dailyTrack = dailyTrackEntities.get(trackKey)!
    dailyTrack.count += 1
    dailyTrack.totalTimeMs += playedMs

    // Monthly stats
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        year,
        month: parseInt(monthKey.split('-')[1] ?? '1', 10),
        playCount: 0,
        totalTimeMs: 0,
        uniqueArtists: new Set<string>(),
        uniqueTracks: new Set<string>(),
        uniqueDays: new Set<string>(),
      })
    }
    const monthlyEntry = monthlyMap.get(monthKey)!
    monthlyEntry.playCount += 1
    monthlyEntry.totalTimeMs += playedMs
    monthlyEntry.uniqueArtists.add(artistName)
    monthlyEntry.uniqueTracks.add(trackKey)
    monthlyEntry.uniqueDays.add(dayKey)

    // Yearly stats
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, {
        year,
        playCount: 0,
        totalTimeMs: 0,
        uniqueArtists: new Set<string>(),
        uniqueTracks: new Set<string>(),
        uniqueDays: new Set<string>(),
        uniqueMonths: new Set<string>(),
      })
    }
    const yearlyEntry = yearlyMap.get(year)!
    yearlyEntry.playCount += 1
    yearlyEntry.totalTimeMs += playedMs
    yearlyEntry.uniqueArtists.add(artistName)
    yearlyEntry.uniqueTracks.add(trackKey)
    yearlyEntry.uniqueDays.add(dayKey)
    yearlyEntry.uniqueMonths.add(monthKey)
  })

  const artists: ArtistStats[] = Array.from(artistMap.values())
    .map(({ stats, tracks }) => ({
      ...stats,
      trackCount: tracks.size,
      tracks: Array.from(tracks).sort(),
    }))
    .sort((a, b) => {
      if (a.playCount === b.playCount) {
        return b.totalTimeMs - a.totalTimeMs
      }
      return b.playCount - a.playCount
    })

  const tracks: TrackStats[] = Array.from(trackMap.values())
    .map((track) => ({
      ...track,
      averageTimeMs: track.playCount > 0 ? Math.round(track.totalTimeMs / track.playCount) : 0,
    }))
    .sort((a, b) => {
      if (a.playCount === b.playCount) {
        return b.totalTimeMs - a.totalTimeMs
      }
      return b.playCount - a.playCount
    })

  const dailyData: DailyData[] = Array.from(dailyMap.values())
    .map((entry) => ({
      date: entry.date,
      playCount: entry.playCount,
      totalTimeMs: entry.totalTimeMs,
      topArtist: resolveTopLabel(entry.artistEntities),
      topTrack: resolveTopLabel(entry.trackEntities),
      uniqueArtists: entry.uniqueArtists.size,
      uniqueTracks: entry.uniqueTracks.size,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.values())
    .map((entry) => ({
      year: entry.year,
      month: entry.month,
      playCount: entry.playCount,
      totalTimeMs: entry.totalTimeMs,
      averageDailyTimeMs:
        entry.uniqueDays.size > 0 ? Math.round(entry.totalTimeMs / entry.uniqueDays.size) : 0,
      uniqueArtists: entry.uniqueArtists.size,
      uniqueTracks: entry.uniqueTracks.size,
    }))
    .sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })

  const yearlyData: YearlyData[] = Array.from(yearlyMap.values())
    .map((entry) => ({
      year: entry.year,
      playCount: entry.playCount,
      totalTimeMs: entry.totalTimeMs,
      averageDailyTimeMs:
        entry.uniqueDays.size > 0 ? Math.round(entry.totalTimeMs / entry.uniqueDays.size) : 0,
      averageMonthlyTimeMs:
        entry.uniqueMonths.size > 0 ? Math.round(entry.totalTimeMs / entry.uniqueMonths.size) : 0,
      uniqueArtists: entry.uniqueArtists.size,
      uniqueTracks: entry.uniqueTracks.size,
    }))
    .sort((a, b) => a.year - b.year)

  const processed: ProcessedData = {
    totalPlays,
    totalTimeMs,
    dateRange: {
      start: sortedByDate[0]?.date ?? DEFAULT_DATE,
      end: sortedByDate[sortedByDate.length - 1]?.date ?? DEFAULT_DATE,
    },
    artists,
    tracks,
    dailyData,
    monthlyData,
    yearlyData,
    genres: [],
  }

  return processed
}

export const useStatistics = (items: Ref<SpotifyHistoryItem[]>) => {
  const statistics = computed<ProcessedData | null>(() => {
    if (!items.value.length) {
      return null
    }
    return calculateProcessedData(items.value)
  })

  return {
    statistics,
  }
}


