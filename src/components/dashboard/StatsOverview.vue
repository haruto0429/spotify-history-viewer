<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Stats Overview
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">再生スタッツ</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          Spotify履歴データから算出した集計情報です。
        </p>
      </div>

      <div class="flex items-center gap-3 text-xs text-spotify-text-muted">
        <span class="rounded-full border border-spotify-border/60 px-3 py-1">
          データ期間
        </span>
        <span class="text-sm font-medium text-spotify-text-secondary">{{ dateRangeLabel }}</span>
      </div>
    </header>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="group relative overflow-hidden rounded-xl border border-spotify-border/60 bg-spotify-dark p-5 transition hover:border-spotify-green/70"
      >
        <dt class="text-xs font-semibold uppercase tracking-[0.25em] text-spotify-text-muted">
          {{ metric.label }}
        </dt>
        <dd class="mt-3 text-3xl font-semibold text-white">
          <span>{{ metric.value }}</span>
          <span v-if="metric.suffix" class="ml-1 text-base font-medium text-spotify-text-secondary">
            {{ metric.suffix }}
          </span>
        </dd>
        <p class="mt-2 text-xs text-spotify-text-muted">{{ metric.caption }}</p>

        <span class="pointer-events-none absolute -bottom-6 right-4 h-20 w-20 rounded-full bg-spotify-green/10 blur-2xl transition group-hover:bg-spotify-green/20" />
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import {
  formatDateRange,
  formatHoursAndMinutes,
  formatMinutesAndSeconds,
} from '@/utils/formatters'

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const totalPlays = computed(() => processedData.value?.totalPlays ?? 0)
const totalTimeMs = computed(() => processedData.value?.totalTimeMs ?? 0)

const hasData = computed(() => totalPlays.value > 0)

const averageTimeMs = computed(() => {
  if (!hasData.value) {
    return 0
  }
  return Math.round(totalTimeMs.value / totalPlays.value)
})

const totalPlayTimeLabel = computed(() => formatHoursAndMinutes(totalTimeMs.value))
const averagePlayTimeLabel = computed(() =>
  hasData.value ? formatMinutesAndSeconds(averageTimeMs.value) : 'データなし'
)

const dateRangeLabel = computed(() => {
  const range = processedData.value?.dateRange
  if (!range) {
    return 'データなし'
  }
  return formatDateRange(range.start, range.end)
})

const metrics = computed(() => [
  {
    label: '総再生時間',
    value: totalPlayTimeLabel.value,
    suffix: null,
    caption: '全期間の再生時間（時間・分）',
  },
  {
    label: '総再生回数',
    value: hasData.value ? totalPlays.value.toLocaleString() : '0',
    suffix: '回',
    caption: '履歴に含まれる再生数',
  },
  {
    label: '平均再生時間',
    value: averagePlayTimeLabel.value,
    suffix: null,
    caption: '1再生あたりの平均時間',
  },
  {
    label: 'データ期間',
    value: dateRangeLabel.value,
    suffix: null,
    caption: '最初の再生日〜最新の再生日',
  },
])
</script>


