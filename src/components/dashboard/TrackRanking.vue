<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Track Ranking
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">楽曲ランキング</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          再生回数を基準にしたTOP楽曲と再生時間の傾向を表示します。
        </p>
      </div>

      <div
        class="flex flex-col items-start gap-3 text-xs font-semibold text-spotify-text-muted md:ml-auto md:flex-row md:flex-wrap md:items-center md:justify-end"
      >
        <span
          v-if="tracks.length"
          class="inline-flex items-center rounded-full border border-spotify-border/60 px-3 py-1 uppercase tracking-[0.3em]"
        >
          Top {{ tracks.length }}
        </span>

        <div
          class="flex w-full flex-col gap-2 text-spotify-text-secondary sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3"
        >
          <div
            class="flex flex-wrap items-center gap-2 rounded-full border border-spotify-border/60 bg-spotify-dark p-1"
          >
            <button
              type="button"
              class="rounded-full px-3 py-1 transition"
              :class="selectedTimeframe === 'overall' ? 'bg-spotify-green text-black' : 'hover:text-white'"
              @click="selectTimeframe('overall')"
            >
              総合
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1 transition"
              :class="selectedTimeframe === 'yearly' ? 'bg-spotify-green text-black' : 'hover:text-white'"
              @click="selectTimeframe('yearly')"
              :disabled="!availableYears.length"
            >
              年別
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1 transition"
              :class="selectedTimeframe === 'monthly' ? 'bg-spotify-green text-black' : 'hover:text-white'"
              @click="selectTimeframe('monthly')"
              :disabled="!availableMonths.length"
            >
              月別
            </button>
          </div>

          <div v-if="showYearSelector" class="flex items-center gap-2">
            <label class="text-[10px] uppercase tracking-[0.2em] text-spotify-text-muted">Year</label>
            <select
              v-model="selectedYear"
              class="min-w-[120px] rounded-full border border-spotify-border/60 bg-spotify-dark px-3 py-1 text-xs text-white focus:border-spotify-green/70 focus:outline-none"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
            </select>
          </div>

          <div v-if="showMonthSelector" class="flex items-center gap-2">
            <label class="text-[10px] uppercase tracking-[0.2em] text-spotify-text-muted">Month</label>
            <select
              v-model="selectedMonthKey"
              class="min-w-[140px] rounded-full border border-spotify-border/60 bg-spotify-dark px-3 py-1 text-xs text-white focus:border-spotify-green/70 focus:outline-none"
            >
              <option
                v-for="month in availableMonths"
                :key="month.value"
                :value="month.value"
              >
                {{ month.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <template v-if="tracks.length">
      <div class="mt-6 space-y-4">
        <button
          v-for="track in tracks"
          :key="track.key"
          type="button"
          class="group w-full rounded-xl border border-spotify-border/60 bg-spotify-dark p-4 text-left transition hover:border-spotify-green/70 focus:border-spotify-green/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green/60"
        >
          <div class="flex items-start gap-4">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/15 text-sm font-bold text-spotify-green group-hover:bg-spotify-green/25"
            >
              {{ track.rank }}
            </span>

            <div class="flex-1">
              <div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <p class="text-lg font-semibold text-white">{{ track.name }}</p>
                  <p class="text-xs text-spotify-text-muted">{{ track.artist }}</p>
                </div>
                <p class="text-sm text-spotify-text-secondary">
                  {{ track.playCount.toLocaleString() }} 回 · {{ track.totalTimeLabel }} · 平均 {{ track.averageTimeLabel }}
                </p>
              </div>

              <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-spotify-border/40">
                <span
                  class="block h-full origin-left rounded-full bg-spotify-green transition-transform duration-300 group-hover:scale-x-[1.02]"
                  :style="{ width: `${track.progress}%` }"
                />
              </div>
            </div>
          </div>
        </button>
      </div>

      <div v-if="hasMore" class="mt-6 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-spotify-border/60 bg-spotify-dark px-5 py-2 text-sm font-semibold text-spotify-text-secondary transition hover:border-spotify-green/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green/60"
          @click="showMore"
        >
          もっと見る
          <span class="text-xs text-spotify-text-muted">
            +{{ nextBatchCount.toLocaleString() }}件
          </span>
        </button>
      </div>
    </template>

    <p v-else class="mt-6 rounded-xl border border-spotify-border/60 bg-spotify-dark p-6 text-sm text-spotify-text-secondary">
      集計可能な楽曲データがまだありません。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import { formatHoursAndMinutes, formatMinutesAndSeconds } from '@/utils/formatters'
import type { SpotifyHistoryItem } from '@/types'

type Timeframe = 'overall' | 'yearly' | 'monthly'

const dataStore = useDataStore()
const { processedData, rawData } = storeToRefs(dataStore)

const VISIBLE_STEP = 10
const MAX_ITEMS = 50

const selectedTimeframe = ref<Timeframe>('overall')
const selectedYear = ref<number | null>(null)
const selectedMonthKey = ref<string | null>(null)

const availableYears = computed<number[]>(() => {
  const years = new Set<number>()
  rawData.value.forEach((item) => {
    const date = new Date(item.ts)
    if (!Number.isNaN(date.getTime())) {
      years.add(date.getFullYear())
    }
  })
  return Array.from(years).sort((a, b) => b - a)
})

const availableMonths = computed(() => {
  const months = new Map<string, { value: string; label: string }>()
  rawData.value.forEach((item) => {
    const date = new Date(item.ts)
    if (Number.isNaN(date.getTime())) {
      return
    }
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month.toString().padStart(2, '0')}`
    if (!months.has(key)) {
      months.set(key, {
        value: key,
        label: `${year}年${month.toString().padStart(2, '0')}月`,
      })
    }
  })

  return Array.from(months.values()).sort((a, b) => (a.value > b.value ? -1 : a.value < b.value ? 1 : 0))
})

watch(availableYears, (years) => {
  if (!years.length) {
    selectedYear.value = null
    return
  }
  if (!selectedYear.value || !years.includes(selectedYear.value)) {
    selectedYear.value = years[0]
  }
})

watch(availableMonths, (months) => {
  if (!months.length) {
    selectedMonthKey.value = null
    return
  }
  if (!selectedMonthKey.value || !months.some((month) => month.value === selectedMonthKey.value)) {
    selectedMonthKey.value = months[0].value
  }
})

const selectTimeframe = (next: Timeframe) => {
  selectedTimeframe.value = next
}

const filteredItems = computed<SpotifyHistoryItem[]>(() => {
  const items = rawData.value
  if (!items.length) {
    return []
  }

  if (selectedTimeframe.value === 'yearly') {
    if (!selectedYear.value) {
      return []
    }
    return items.filter((item) => {
      const date = new Date(item.ts)
      return !Number.isNaN(date.getTime()) && date.getFullYear() === selectedYear.value
    })
  }

  if (selectedTimeframe.value === 'monthly') {
    if (!selectedMonthKey.value) {
      return []
    }
    return items.filter((item) => {
      const date = new Date(item.ts)
      if (Number.isNaN(date.getTime())) {
        return false
      }
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      return key === selectedMonthKey.value
    })
  }

  return items
})

const aggregateTracks = (items: SpotifyHistoryItem[]) => {
  const map = new Map<
    string,
    {
      key: string
      name: string
      artist: string
      playCount: number
      totalTimeMs: number
    }
  >()

  items.forEach((item) => {
    if (!item) {
      return
    }

    const artistName =
      item.master_metadata_album_artist_name ??
      item.episode_show_name ??
      item.audiobook_title ??
      'Unknown Artist'
    const trackName =
      item.master_metadata_track_name ??
      item.episode_name ??
      item.audiobook_chapter_title ??
      item.audiobook_title ??
      'Unknown Track'
    const key = `${trackName}__${artistName}`
    const playedMs = Math.max(0, item.ms_played ?? 0)

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: trackName,
        artist: artistName,
        playCount: 0,
        totalTimeMs: 0,
      })
    }

    const entry = map.get(key)!
    entry.playCount += 1
    entry.totalTimeMs += playedMs
  })

  return Array.from(map.values()).sort((a, b) => {
    if (a.playCount === b.playCount) {
      return b.totalTimeMs - a.totalTimeMs
    }
    return b.playCount - a.playCount
  })
}

const aggregatedTracks = computed(() => {
  if (selectedTimeframe.value === 'overall') {
    const tracks = processedData.value?.tracks ?? []
    return tracks.map((track) => ({
      key: `${track.name ?? 'Unknown Track'}__${track.artist}`,
      name: track.name ?? 'Unknown Track',
      artist: track.artist,
      playCount: track.playCount,
      totalTimeMs: track.totalTimeMs,
      averageTimeMs: track.averageTimeMs,
    }))
  }

  return aggregateTracks(filteredItems.value).map((track) => ({
    ...track,
    averageTimeMs: track.playCount > 0 ? Math.round(track.totalTimeMs / track.playCount) : 0,
  }))
})

const topTracks = computed(() => aggregatedTracks.value.slice(0, MAX_ITEMS))

const visibleCount = ref(0)

const resetVisibleCount = () => {
  visibleCount.value =
    topTracks.value.length === 0 ? 0 : Math.min(VISIBLE_STEP, topTracks.value.length)
}

watch(
  () => topTracks.value.length,
  (length) => {
    visibleCount.value = length === 0 ? 0 : Math.min(VISIBLE_STEP, length)
  },
  { immediate: true }
)

watch(selectedTimeframe, resetVisibleCount)
watch(selectedYear, resetVisibleCount)
watch(selectedMonthKey, resetVisibleCount)

const displayedTracksPool = computed(() => topTracks.value.slice(0, visibleCount.value))

const maxPlayCount = computed(() =>
  topTracks.value.reduce((max, track) => Math.max(max, track.playCount), 0)
)

const tracks = computed(() => {
  const base = displayedTracksPool.value
  if (!base.length) {
    return [] as Array<{
      key: string
      rank: number
      name: string
      artist: string
      playCount: number
      totalTimeLabel: string
      averageTimeLabel: string
      progress: number
    }>
  }

  const max = Math.max(1, maxPlayCount.value)

  return base.map((track, index) => ({
    key: track.key,
    rank: index + 1,
    name: track.name,
    artist: track.artist,
    playCount: track.playCount,
    totalTimeLabel: formatHoursAndMinutes(track.totalTimeMs),
    averageTimeLabel: formatMinutesAndSeconds(
      track.averageTimeMs ?? (track.playCount > 0 ? Math.round(track.totalTimeMs / track.playCount) : 0)
    ),
    progress: Math.min(100, Math.max(12, Math.round((track.playCount / max) * 100))),
  }))
})

const hasMore = computed(() => topTracks.value.length > displayedTracksPool.value.length)

const remainingCount = computed(() =>
  Math.max(0, Math.min(topTracks.value.length, MAX_ITEMS) - displayedTracksPool.value.length)
)

const nextBatchCount = computed(() => Math.min(VISIBLE_STEP, remainingCount.value))

const showMore = () => {
  if (!hasMore.value) {
    return
  }
  visibleCount.value = Math.min(
    visibleCount.value + VISIBLE_STEP,
    Math.min(topTracks.value.length, MAX_ITEMS)
  )
}

const showYearSelector = computed(
  () => selectedTimeframe.value === 'yearly' && availableYears.value.length > 0
)

const showMonthSelector = computed(
  () => selectedTimeframe.value === 'monthly' && availableMonths.value.length > 0
)
</script>


