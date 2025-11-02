import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SpotifyHistoryItem,
  ProcessedData,
  FilterSettings,
  SpotifyHistoryData,
} from '@/types'

export const useDataStore = defineStore('data', () => {
  const rawData = ref<SpotifyHistoryItem[]>([])
  const processedData = ref<ProcessedData | null>(null)
  const dataSources = ref<SpotifyHistoryData[]>([])
  const filters = ref<FilterSettings>({
    dateRange: {
      start: null,
      end: null,
    },
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filteredData = computed(() => {
    // フィルター適用後のデータを計算
    // 実装は今後追加
    return processedData.value
  })

  return {
    rawData,
    processedData,
    dataSources,
    filters,
    isLoading,
    error,
    filteredData,
  }
})
