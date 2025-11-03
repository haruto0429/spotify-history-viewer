<template>
  <section
    class="rounded-2xl border border-spotify-border/70 bg-spotify-dark-secondary/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-spotify-text-muted">
          Phase 1 · Daily Trends
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white md:text-3xl">日別再生傾向</h2>
        <p class="mt-2 text-sm text-spotify-text-secondary">
          日別の再生回数と再生時間を切り替えて、毎日のリスニング傾向を確認できます。
        </p>
      </div>

      <div class="flex items-center gap-2 self-start rounded-full border border-spotify-border/60 bg-spotify-dark p-1 text-xs font-semibold text-spotify-text-secondary">
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
import type { DailyData } from '@/types'

type MetricType = 'plays' | 'time'

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const selectedMetric = ref<MetricType>('plays')

const dailyData = computed<DailyData[]>(() => processedData.value?.dailyData ?? [])

const labels = computed(() =>
  dailyData.value.map((entry) =>
    new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
    }).format(entry.date)
  )
)

const chartData = computed<ChartData<'line'>>(() => {
  const metric = selectedMetric.value
  const datasetLabel = metric === 'plays' ? '再生回数' : '総再生時間 (時間)'

  const dataPoints = dailyData.value.map((entry) =>
    metric === 'plays'
      ? entry.playCount
      : Number((entry.totalTimeMs / (1000 * 60 * 60)).toFixed(2))
  )

  return {
    labels: labels.value,
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
          maxTicksLimit: 10,
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

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { ChartData, ChartOptions } from 'chart.js'
import LineChart from '@/components/charts/LineChart.vue'
import { useDataStore } from '@/stores/dataStore'
import type { DailyData } from '@/types'

type MetricType = 'plays' | 'time'

const dataStore = useDataStore()
const { processedData } = storeToRefs(dataStore)

const selectedMetric = ref<MetricType>('plays')

const dailyData = computed<DailyData[]>(() => processedData.value?.dailyData ?? [])

const labels = computed(() =>
  dailyData.value.map((entry) =>
    new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
    }).format(entry.date)
  )
)

const chartData = computed<ChartData<'line'>>(() => {
  const metric = selectedMetric.value
  const datasetLabel = metric === 'plays' ? '再生回数' : '総再生時間 (時間)'

  const dataPoints = dailyData.value.map((entry) =>
    metric === 'plays'
      ? entry.playCount
      : Number((entry.totalTimeMs / (1000 * 60 * 60)).toFixed(2))
  )

  return {
    labels: labels.value,
    datasets: [
      {
        label: datasetLabel,
        data: dataPoints,
        tension: 0.35,
        fill: true,
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        pointBackgroundColor: '#1DB954',
        pointBorderColor: '#121212',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  const metric = selectedMetric.value
  const unitLabel = metric === 'plays' ? '回' : '時間'

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
          maxTicksLimit: 10,
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


