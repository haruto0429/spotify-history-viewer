<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Timeline Trends
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">再生傾向</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          日・月・年単位で再生回数と再生時間を切り替え、リスニングの推移を俯瞰できます。
        </p>
      </div>

      <div class="flex flex-col gap-2 self-start text-xs font-semibold text-spotify-text-secondary md:flex-row md:items-center md:gap-3">
        <div class="flex items-center gap-2 rounded-full border border-spotify-border/60 bg-spotify-dark p-1">
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="selectedMetric === 'plays' ? 'bg-spotify-green text-black' : 'hover:text-white'"
            @click="selectedMetric = 'plays'"
          >
            再生回数
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="selectedMetric === 'time' ? 'bg-spotify-green text-black' : 'hover:text-white'"
            @click="selectedMetric = 'time'"
          >
            再生時間
          </button>
        </div>

        <div class="flex items-center gap-2 rounded-full border border-spotify-border/60 bg-spotify-dark p-1">
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="selectedGranularity === 'daily' ? 'bg-spotify-green text-black' : 'hover:text-white'"
            @click="selectedGranularity = 'daily'"
          >
            日別
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="selectedGranularity === 'monthly' ? 'bg-spotify-green text-black' : 'hover:text-white'"
            @click="selectedGranularity = 'monthly'"
          >
            月別
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="selectedGranularity === 'yearly' ? 'bg-spotify-green text-black' : 'hover:text-white'"
            @click="selectedGranularity = 'yearly'"
          >
            年別
          </button>
        </div>
      </div>
    </header>

    <div class="mt-6 h-80 w-full">
      <LineChart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { ChartData, ChartOptions } from 'chart.js'
import LineChart from '@/components/charts/LineChart.vue'
import { useDataStore } from '@/stores/dataStore'
import type { DailyData, MonthlyData, YearlyData } from '@/types'

type MetricType = 'plays' | 'time'
type GranularityType = 'daily' | 'monthly' | 'yearly'

interface SeriesPoint {
  label: string
  playCount: number
  totalTimeMs: number
}

const granularityLabelMap: Record<GranularityType, string> = {
  daily: '日別',
  monthly: '月別',
  yearly: '年別',
}

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const selectedMetric = ref<MetricType>('plays')
const selectedGranularity = ref<GranularityType>('daily')

const dailyData = computed<DailyData[]>(() => processedData.value?.dailyData ?? [])
const monthlyData = computed<MonthlyData[]>(() => processedData.value?.monthlyData ?? [])
const yearlyData = computed<YearlyData[]>(() => processedData.value?.yearlyData ?? [])

const dailyLabelFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'short',
  day: 'numeric',
})

const monthlyLabelFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'short',
})

const yearlyLabelFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
})

const activeSeries = computed<SeriesPoint[]>(() => {
  switch (selectedGranularity.value) {
    case 'monthly':
      return monthlyData.value.map((entry) => {
        const date = new Date(entry.year, entry.month - 1, 1)
        return {
          label: monthlyLabelFormatter.format(date),
          playCount: entry.playCount,
          totalTimeMs: entry.totalTimeMs,
        }
      })
    case 'yearly':
      return yearlyData.value.map((entry) => ({
        label: yearlyLabelFormatter.format(new Date(entry.year, 0, 1)),
        playCount: entry.playCount,
        totalTimeMs: entry.totalTimeMs,
      }))
    case 'daily':
    default:
      return dailyData.value.map((entry) => ({
        label: dailyLabelFormatter.format(entry.date),
        playCount: entry.playCount,
        totalTimeMs: entry.totalTimeMs,
      }))
  }
})

const chartData = computed<ChartData<'line'>>(() => {
  const metric = selectedMetric.value
  const granularityLabel = granularityLabelMap[selectedGranularity.value]
  const datasetLabel =
    metric === 'plays'
      ? `${granularityLabel} 再生回数`
      : `${granularityLabel} 総再生時間 (時間)`

  const dataPoints = activeSeries.value.map((entry) =>
    metric === 'plays'
      ? entry.playCount
      : Number((entry.totalTimeMs / (1000 * 60 * 60)).toFixed(2))
  )

  return {
    labels: activeSeries.value.map((entry) => entry.label),
    datasets: [
      {
        label: datasetLabel,
        data: dataPoints,
        borderWidth: 2,
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        pointBackgroundColor: '#1DB954',
        pointBorderColor: '#121212',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.35,
        type: 'line',
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  const metric = selectedMetric.value
  const unitLabel = metric === 'plays' ? '回' : '時間'
  const tickLimit =
    selectedGranularity.value === 'daily'
      ? 10
      : selectedGranularity.value === 'monthly'
        ? 12
        : 8

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#B3B3B3',
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed.y ?? 0
            return `${context.dataset.label}: ${value.toLocaleString()} ${unitLabel}`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#B3B3B3',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: tickLimit,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: '#B3B3B3',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }
})
</script>


