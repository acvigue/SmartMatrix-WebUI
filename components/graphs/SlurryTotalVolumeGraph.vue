<script setup lang="ts">
//fucjkkling charts.
import { ranger, queryApi, durMaker } from '@/plugins/influx'
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
const sessionStore = useSessionsStore()

watchEffect(async () => {
  if (useVFDStore().vfds.length == 0) {
    return
  }
  const data: [number | null, number | null][] = []
  const startTime =
    sessionStore.session.state.session_times[0].start_time === 0
      ? props.timecfg.start_epoch
      : sessionStore.session.state.session_times[0].start_time
  const viewRange = ranger(startTime, props.timecfg.stop_epoch)

  const dur = durMaker(startTime, props.timecfg.stop_epoch ?? Date.now())

  const fluxQuery = `from(bucket: "levitree")
  |> ${viewRange}
  |> filter(fn: (r) => r["_measurement"] == "vfd_state")
  |> filter(fn: (r) => r["_field"] == "volumetric_flow_rate")
  |> filter(fn: (r) => r["vfd_function"] == "3")
  |> map(fn: (r) => ({r with _value: r._value / ${dur.divisor}.0}))
  |> aggregateWindow(every: ${dur.dur}, fn: mean)  
  |> cumulativeSum()`

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)
    if (parseISO(o._time).getTime() >= props.timecfg.start_epoch) {
      data.push([parseISO(o._time).getTime(), o._value])
    }
  }

  const ds_out = [
    {
      name: 'Total Volume',
      data: data,
      type: 'line',
      legendSymbol: 'rectangle',
      color: '#544fc5'
    }
  ]

  series.value = ds_out
})

const chartOptions = computed(() => {
  return {
    title: {
      text: '',
      align: 'center'
    },

    yAxis: {
      title: {
        text: 'Volume'
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + ' m3'
        }
      },
      min: 0
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: 'm3'
    },

    xAxis: {
      type: 'datetime',
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
