<template>
  <div class="dashboard-view min-h-screen bg-spotify-dark text-spotify-text-primary">
    <div class="mx-auto w-full max-w-6xl px-6 py-10">
      <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-spotify-text-muted">
            Phase 1 · Data Loading
          </p>
          <h1 class="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Spotify履歴ダッシュボード
          </h1>
          <p class="mt-3 max-w-2xl text-sm text-spotify-text-secondary">
            Spotifyの履歴JSONファイルをローカルから読み込み、分析ダッシュボードに必要なデータの土台を準備します。
          </p>
          <p v-if="formattedLatestLoadedAt" class="mt-2 text-xs text-spotify-text-muted">
            最終更新: {{ formattedLatestLoadedAt }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 self-start rounded-full bg-spotify-green px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-spotify-text-muted disabled:text-spotify-dark"
          :disabled="isLoading"
          @click="reload"
        >
          <span
            v-if="isLoading"
            class="h-4 w-4 animate-spin rounded-full border-2 border-black/70 border-t-transparent"
            aria-hidden="true"
          />
          {{ isLoading ? '読み込み中…' : 'データを再読み込み' }}
        </button>
      </header>

      <section class="mt-10 space-y-8">
        <div
          v-if="isLoading && !hasData"
          class="flex h-40 items-center justify-center rounded-xl border border-spotify-border bg-spotify-dark-secondary"
        >
          <div class="flex items-center gap-3 text-spotify-text-secondary">
            <span class="h-6 w-6 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
            <span>{{ loadingLabel }}</span>
          </div>
        </div>

        <div
          v-else-if="error"
          class="space-y-4 rounded-xl border border-red-500/60 bg-red-500/10 p-6 text-sm text-red-200"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="font-semibold text-red-100">データ読み込みで問題が発生しました</p>
            <button
              type="button"
              class="rounded-md border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-100 transition hover:border-red-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isLoading"
              @click="reload"
            >
              再試行
            </button>
          </div>
          <p class="whitespace-pre-line leading-relaxed text-red-100/80">
            {{ error }}
          </p>
        </div>

        <template v-if="hasData">
          <div class="grid gap-6 md:grid-cols-3">
            <div class="rounded-xl border border-spotify-border bg-spotify-dark-secondary p-6 shadow-lg shadow-black/30">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">総再生回数</p>
              <p class="mt-3 text-4xl font-semibold text-white">
                {{ totalPlays.toLocaleString() }}
                <span class="ml-1 text-base font-normal text-spotify-text-secondary">回</span>
              </p>
            </div>

            <div class="rounded-xl border border-spotify-border bg-spotify-dark-secondary p-6 shadow-lg shadow-black/30">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">総再生時間</p>
              <p class="mt-3 text-3xl font-semibold text-white">{{ formattedTotalPlayTime }}</p>
            </div>

            <div class="rounded-xl border border-spotify-border bg-spotify-dark-secondary p-6 shadow-lg shadow-black/30">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">ユニークアーティスト</p>
              <p class="mt-3 text-4xl font-semibold text-white">
                {{ uniqueArtistCount.toLocaleString() }}
                <span class="ml-1 text-base font-normal text-spotify-text-secondary">組</span>
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-spotify-border bg-spotify-dark-secondary p-6 shadow-lg shadow-black/30">
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-white">読み込み済みデータソース</h2>
                <p class="text-sm text-spotify-text-secondary">全{{ dataSourceSummaries.length }}ファイル</p>
              </div>
            </div>
            <ul class="mt-6 space-y-4 text-sm">
              <li
                v-for="summary in dataSourceSummaries"
                :key="summary.source"
                class="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-spotify-border/60 bg-spotify-dark p-4 transition hover:border-spotify-green/60"
              >
                <div>
                  <p class="font-medium text-white">{{ summary.source }}</p>
                  <p class="mt-1 text-xs text-spotify-text-muted">
                    読み込み日時: {{ formatFileLoadedAt(summary.loadedAt) }}
                  </p>
                </div>
                <span class="text-sm font-semibold text-spotify-text-secondary">
                  {{ summary.itemCount.toLocaleString() }} 件
                </span>
              </li>
            </ul>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSpotifyData } from '@/composables/useSpotifyData'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()
const { rawData, dataSources, isLoading, error } = storeToRefs(dataStore)
const { loadHistoryData } = useSpotifyData()

const formatDuration = (ms: number): string => {
  if (!ms || ms <= 0) {
    return '0分'
  }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours === 0) {
    return `${minutes}分`
  }
  return `${hours}時間${minutes.toString().padStart(2, '0')}分`
}

const totalPlays = computed(() => rawData.value.length)
const totalPlayTimeMs = computed(() =>
  rawData.value.reduce((acc, item) => acc + (item?.ms_played ?? 0), 0)
)
const formattedTotalPlayTime = computed(() => formatDuration(totalPlayTimeMs.value))

const uniqueArtistCount = computed(() => {
  const set = new Set<string>()
  rawData.value.forEach((item) => {
    const artist =
      item.master_metadata_album_artist_name ??
      item.episode_show_name ??
      item.audiobook_title ??
      'Unknown Artist'
    set.add(artist)
  })
  return set.size
})

const dataSourceSummaries = computed(() =>
  dataSources.value.map((source) => ({
    source: source.source,
    itemCount: source.items.length,
    loadedAt: source.loadedAt,
  }))
)

const latestLoadedAt = computed(() => {
  if (!dataSources.value.length) {
    return null
  }
  return dataSources.value.reduce<Date | null>((latest, source) => {
    if (!latest) {
      return source.loadedAt
    }
    return latest.getTime() > source.loadedAt.getTime() ? latest : source.loadedAt
  }, null)
})

const formattedLatestLoadedAt = computed(() => {
  if (!latestLoadedAt.value) {
    return null
  }
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(latestLoadedAt.value)
})

const hasData = computed(() => totalPlays.value > 0)
const loadingLabel = computed(() =>
  totalPlays.value ? 'データを再読み込み中…' : 'Spotify履歴データを読み込み中…'
)

const formatFileLoadedAt = (value: Date): string =>
  new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)

const reload = async () => {
  if (isLoading.value) {
    return
  }
  try {
    await loadHistoryData()
  } catch (err) {
    console.error('failed to load spotify history data', err)
  }
}

onMounted(() => {
  if (!rawData.value.length) {
    void reload()
  }
})
</script>

<style scoped>
.dashboard-view {
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.95), rgba(12, 12, 12, 0.98));
}
</style>
