<script setup lang="ts">
import { ranger, decimator, queryApi } from '@/plugins/influx'
import type { TimeDisplayConfig } from '@/plugins/types/sessions'
import { useSessionsStore } from '@/stores/SessionsStore'
import { useVFDStore } from '@/stores/VFDStore'
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
  if (useVFDStore().vfds.length == 0) {
    return
  }
  const datasets: { [key: string]: { data: [number | null, number | null][] } } = {}
  const viewRange = ranger(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  const aggregateWindow = decimator(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  //TODO: This is a bit of a hack, but it works for now.
  //Also, fuck fluxql
  const fluxQuery = `from(bucket:"levitree") |> ${viewRange} |> filter(fn: (r) => r._measurement == "vfd_state" and r._field == "cur_frequency") |> ${aggregateWindow}`

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)

    if (!datasets[o.vfd_id]) {
      datasets[o.vfd_id] = {
        data: []
      }
    }

    datasets[o.vfd_id].data.push([parseISO(o._time).getTime(), o._value])
  }

  const ds_out = []

  for (const vfd_id in datasets) {
    const vfd_name = useVFDStore().vfds.find((vfd) => vfd.id == vfd_id)?.display_name
    if (vfd_name) {
      ds_out.push({
        name: vfd_name,
        data: datasets[vfd_id].data,
        type: 'line',
        legendSymbol: 'rectangle'
      })
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
        text: 'Speed'
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + ' Hz'
        }
      },
      min: 0,
      max: 120
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: 'Hz'
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
