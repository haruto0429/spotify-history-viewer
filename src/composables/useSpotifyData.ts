import { useDataStore } from '@/stores/dataStore'
import type { SpotifyHistoryItem, SpotifyHistoryData } from '@/types'

type HistoryFileModule = { default: SpotifyHistoryItem[] }

const rootHistoryImporters = import.meta.glob<HistoryFileModule>(
  '../../spotifyHistoryData/*.json'
)

const publicHistoryImporters = import.meta.glob<HistoryFileModule>(
  '../../public/data/spotifyHistoryData/*.json'
)

const historyFileImporters: Record<string, () => Promise<HistoryFileModule>> = {
  ...rootHistoryImporters,
  ...publicHistoryImporters,
}

const toFileName = (filePath: string): string => {
  const segments = filePath.split('/')
  return segments[segments.length - 1] ?? filePath
}

const normalizeItems = (items: SpotifyHistoryItem[]): SpotifyHistoryItem[] =>
  items
    .filter((item) =>
      Boolean(
        item &&
          typeof item === 'object' &&
          typeof item.ts === 'string' &&
          !Number.isNaN(Date.parse(item.ts)) &&
          typeof item.ms_played === 'number' &&
          item.ms_played > 0
      )
    )
    .map((item) => ({
      ...item,
      ms_played: Math.floor(item.ms_played),
    }))

const dedupeItems = (items: SpotifyHistoryItem[]): SpotifyHistoryItem[] => {
  const seen = new Set<string>()
  const deduped: SpotifyHistoryItem[] = []

  items.forEach((item) => {
    const key = [
      item.ts,
      item.master_metadata_track_name ?? '',
      item.master_metadata_album_artist_name ?? '',
      item.ms_played,
    ].join('::')

    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(item)
    }
  })

  return deduped
}

const sortByTimestamp = (items: SpotifyHistoryItem[]): SpotifyHistoryItem[] =>
  [...items].sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts))

interface LoadedHistoryData {
  sourcePath: string
  data: SpotifyHistoryData
}

export function useSpotifyData() {
  const dataStore = useDataStore()

  const loadHistoryData = async () => {
    dataStore.isLoading = true
    dataStore.error = null

    try {
      const importerEntries = Object.entries(historyFileImporters)

      if (importerEntries.length === 0) {
        throw new Error('Spotify履歴データの読み込み対象が見つかりません。')
      }

      const results = await Promise.all(
        importerEntries.map(async ([filePath, importer]) => {
          try {
            const module = await importer()
            const items = Array.isArray(module?.default) ? module.default : []

            const normalized = normalizeItems(items)

            const historyData: SpotifyHistoryData = {
              items: normalized,
              source: toFileName(filePath),
              loadedAt: new Date(),
            }

            return {
              status: 'fulfilled' as const,
              sourcePath: filePath,
              data: historyData,
            }
          } catch (error) {
            return {
              status: 'rejected' as const,
              sourcePath: filePath,
              reason: error,
            }
          }
        })
      )

      const fulfilled = results.filter(
        (result): result is LoadedHistoryData & { status: 'fulfilled' } =>
          result.status === 'fulfilled'
      )
      const rejected = results.filter(
        (result): result is { status: 'rejected'; sourcePath: string; reason: unknown } =>
          result.status === 'rejected'
      )

      if (!fulfilled.length) {
        const firstReason = rejected[0]?.reason
        if (firstReason instanceof Error) {
          throw firstReason
        }
        throw new Error('Spotify履歴データの読み込みに失敗しました。')
      }

      const mergedItems = sortByTimestamp(
        dedupeItems(fulfilled.flatMap((entry) => entry.data.items))
      )

      dataStore.rawData = mergedItems
      dataStore.dataSources = fulfilled.map((entry) => entry.data)

      if (rejected.length) {
        const messages = rejected.map(({ sourcePath, reason }) => {
          const fileName = toFileName(sourcePath)
          if (reason instanceof Error) {
            return `${fileName}: ${reason.message}`
          }
          return `${fileName}: 読み込み時に不明なエラーが発生しました。`
        })
        dataStore.error = `一部の履歴データの読み込みに失敗しました。\n${messages.join('\n')}`
      } else {
        dataStore.error = null
      }

      return {
        items: mergedItems,
        sources: fulfilled.map((entry) => entry.data),
        failedSources: rejected.map((entry) => toFileName(entry.sourcePath)),
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Spotify履歴データの読み込みに失敗しました。'

      dataStore.rawData = []
      dataStore.dataSources = []
      dataStore.error = message

      throw error
    } finally {
      dataStore.isLoading = false
    }
  }

  return {
    loadHistoryData,
  }
}
