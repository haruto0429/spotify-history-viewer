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
  items.filter((item) =>
    Boolean(
      item &&
        typeof item === 'object' &&
        typeof item.ts === 'string' &&
        !Number.isNaN(Date.parse(item.ts)) &&
        item.ms_played > 0
    )
  )

const sortByTimestamp = (items: SpotifyHistoryItem[]): SpotifyHistoryItem[] =>
  [...items].sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
  )

export function useSpotifyData() {
  const dataStore = useDataStore()

  const loadHistoryData = async () => {
    dataStore.isLoading = true
    dataStore.error = null

    try {
      const loadedModules = await Promise.all(
        Object.entries(historyFileImporters).map(async ([filePath, importer]) => {
          const module = await importer()
          const items = Array.isArray(module?.default)
            ? module.default
            : []

          const normalized = normalizeItems(items)

          const historyData: SpotifyHistoryData = {
            items: normalized,
            source: toFileName(filePath),
            loadedAt: new Date(),
          }

          return historyData
        })
      )

      if (loadedModules.length === 0) {
        throw new Error('Spotify履歴データが見つかりません。')
      }
      

      const mergedItems = sortByTimestamp(
        loadedModules.flatMap((module) => module.items)
      )

      dataStore.rawData = mergedItems
      dataStore.processedData = null
      dataStore.dataSources = loadedModules
      dataStore.error = null

      return {
        items: mergedItems,
        sources: loadedModules,
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Spotify履歴データの読み込みに失敗しました。'

      dataStore.rawData = []
      dataStore.processedData = null
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
