<script setup lang="ts">
import { ranger, decimator, queryApi, getColor } from '@/plugins/influx'
import type { TimeDisplayConfig } from '@/plugins/types/sessions'
import { useSensorStore } from '@/stores/SensorStore'
import { useSessionsStore } from '@/stores/SessionsStore'
import { parseISO } from 'date-fns'
import { Chart as MyChart } from 'highcharts-vue'

import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{
  timecfg: TimeDisplayConfig
}>()

const series = ref<any>([])
const sessionBands = ref<any>([])
const sessionStore = useSessionsStore()

watchEffect(async () => {
  const datasets: { [key: string]: { data: [number | null, number | null][] } } = {}
  const viewRange = ranger(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  const aggregateWindow = decimator(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  //TODO: This is a bit of a hack, but it works for now.
  //Also, fuck fluxql
  const fluxQuery = `from(bucket:"levitree") |> ${viewRange} |> filter(fn: (r) => r._measurement == "sensor_state" and r._field == "pressure") |> ${aggregateWindow}`

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)

    if (!datasets[o.sensor_id]) {
      datasets[o.sensor_id] = {
        data: []
      }
    }

    datasets[o.sensor_id].data.push([parseISO(o._time).getTime(), o._value])
  }

  const ds_out = []

  let i = 0
  for (const sensor_id in datasets) {
    const sensor_name = useSensorStore().sensors.find((vfd) => vfd.id == sensor_id)?.display_name
    if (sensor_name) {
      ds_out.push({
        name: sensor_name,
        data: datasets[sensor_id].data,
        type: 'line',
        legendSymbol: 'rectangle',
        color: getColor(i)
      })
      i++
    }
  }

  series.value = ds_out
  sessionBands.value = sessionStore.sessionBands()
})

const chartOptions = computed(() => {
  return {
    title: {
      text: '',
      align: 'center'
    },

    yAxis: {
      title: {
        text: 'Pressure'
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + ' psi'
        }
      },
      min: 0
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: ' psi'
    },

    xAxis: {
      type: 'datetime',
      plotBands: sessionBands.value,
      minPadding: 0,
      maxPadding: 0
    },

    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        connectNulls: false
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },

    chart: {
      zoomType: 'x'
    },

    time: {
      useUTC: false
    },

    series: series.value
  }
})
</script>

<template>
  <my-chart :options="chartOptions" class="w-full" />
</template>
