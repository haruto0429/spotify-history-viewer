<template>
  <Line
    :data="chartData"
    :options="options"
    class="h-full w-full"
  />
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
)

const props = withDefaults(
  defineProps<{
    data: ChartData<'line'>
    options?: ChartOptions<'line'>
  }>(),
  {
    options: undefined,
  }
)

const cloneData = (value: ChartData<'line'>): ChartData<'line'> =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value))

const chartData = ref<ChartData<'line'>>(cloneData(props.data))

watch(
  () => props.data,
  (value) => {
    chartData.value = cloneData(value)
  },
  { deep: true }
)

const options = computed(() => props.options)
</script>


