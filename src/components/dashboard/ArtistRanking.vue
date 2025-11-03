<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Artist Ranking
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">アーティストランキング</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          再生回数と総再生時間に基づいたTOPアーティストを表示します。
        </p>
      </div>

      <span
        v-if="artists.length"
        class="inline-flex items-center rounded-full border border-spotify-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted"
      >
        Top {{ artists.length }}
      </span>
    </header>

    <div v-if="artists.length" class="mt-6 space-y-4">
      <button
        v-for="artist in artists"
        :key="artist.name"
        type="button"
        class="group w-full rounded-xl border border-spotify-border/60 bg-spotify-dark p-4 text-left transition hover:border-spotify-green/70 focus:border-spotify-green/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green/60"
      >
        <div class="flex items-start gap-4">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/15 text-sm font-bold text-spotify-green group-hover:bg-spotify-green/25"
          >
            {{ artist.rank }}
          </span>

          <div class="flex-1">
            <div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <p class="text-lg font-semibold text-white">{{ artist.name }}</p>
              <p class="text-sm text-spotify-text-secondary">
                {{ artist.playCount.toLocaleString() }} 回再生 · {{ artist.totalTimeLabel }} · {{
                  artist.trackCount.toLocaleString()
                }} 曲
              </p>
            </div>

            <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-spotify-border/40">
              <span
                class="block h-full origin-left rounded-full bg-spotify-green transition-transform duration-300 group-hover:scale-x-[1.02]"
                :style="{ width: `${artist.progress}%` }"
              />
            </div>
          </div>
        </div>
      </button>
    </div>
    <p v-else class="mt-6 rounded-xl border border-spotify-border/60 bg-spotify-dark p-6 text-sm text-spotify-text-secondary">
      集計可能なアーティストデータがまだありません。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import { formatHoursAndMinutes } from '@/utils/formatters'

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const topArtists = computed(() => {
  const artists = processedData.value?.artists ?? []
  return artists.slice(0, 10)
})

const maxPlayCount = computed(() => {
  return topArtists.value.reduce((max, artist) => Math.max(max, artist.playCount), 0)
})

const artists = computed(() => {
  const base = topArtists.value
  if (!base.length) {
    return [] as Array<{
      rank: number
      name: string
      playCount: number
      totalTimeLabel: string
      trackCount: number
      progress: number
    }>
  }

  const max = Math.max(1, maxPlayCount.value)

  return base.map((artist, index) => ({
    rank: index + 1,
    name: artist.name,
    playCount: artist.playCount,
    totalTimeLabel: formatHoursAndMinutes(artist.totalTimeMs),
    trackCount: artist.trackCount,
    progress: Math.min(100, Math.max(12, Math.round((artist.playCount / max) * 100))),
  }))
})
</script>

