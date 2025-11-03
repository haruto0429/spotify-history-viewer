<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Track Ranking
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">楽曲ランキング</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          再生回数を基準にしたTOP楽曲と再生時間の傾向を表示します。
        </p>
      </div>

      <span
        v-if="tracks.length"
        class="inline-flex items-center rounded-full border border-spotify-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted"
      >
        Top {{ tracks.length }}
      </span>
    </header>

    <div v-if="tracks.length" class="mt-6 space-y-4">
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

    <p v-else class="mt-6 rounded-xl border border-spotify-border/60 bg-spotify-dark p-6 text-sm text-spotify-text-secondary">
      集計可能な楽曲データがまだありません。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import { formatHoursAndMinutes, formatMinutesAndSeconds } from '@/utils/formatters'

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const topTracks = computed(() => {
  const tracks = processedData.value?.tracks ?? []
  return tracks.slice(0, 10)
})

const maxPlayCount = computed(() =>
  topTracks.value.reduce((max, track) => Math.max(max, track.playCount), 0)
)

const tracks = computed(() => {
  if (!topTracks.value.length) {
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

  return topTracks.value.map((track, index) => ({
    key: `${track.name ?? 'Unknown Track'}__${track.artist}`,
    rank: index + 1,
    name: track.name ?? 'Unknown Track',
    artist: track.artist,
    playCount: track.playCount,
    totalTimeLabel: formatHoursAndMinutes(track.totalTimeMs),
    averageTimeLabel: formatMinutesAndSeconds(track.averageTimeMs),
    progress: Math.min(100, Math.max(12, Math.round((track.playCount / max) * 100))),
  }))
})
</script>


