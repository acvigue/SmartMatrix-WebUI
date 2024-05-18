<script setup lang="ts">
//fucjkkling charts.
import { ranger, queryApi } from '@/plugins/influx'
import type { TimeDisplayConfig } from '@/plugins/types/sessions'
import { useSessionsStore } from '@/stores/SessionsStore'
import { useVFDStore } from '@/stores/VFDStore'
import { parseISO } from 'date-fns'
import { Chart as MyChart } from 'highcharts-vue'
import xrange from 'highcharts/modules/xrange.js'
import Highcharts from 'highcharts'

xrange(Highcharts)

import { computed, ref, watchEffect } from 'vue'
import { colorToDriveMode, driveModeToColor, driveModeToString } from '@/plugins/types/vfd'

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
  const points = []
  const viewRange = ranger(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  const fluxQuery = `from(bucket:"levitree") |> ${viewRange} |> filter(fn: (r) => r._measurement == "vfd_state" and r._field == "cur_drive_mode")`

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)

    if (!datasets[o.vfd_id]) {
      datasets[o.vfd_id] = {
        data: []
      }
    }

    datasets[o.vfd_id].data.push([parseISO(o._time).getTime(), o._value])
  }

  //For every point, only keep values where the second element changes
  for (const vfd_id in datasets) {
    const vfd_index = useVFDStore().vfds.findIndex((vfd) => vfd.id == vfd_id)
    if (vfd_index !== -1) {
      const out: any[][] = []
      let last = null
      for (const point of datasets[vfd_id].data) {
        if (point[1] != last) {
          out.push(point)
          last = point[1]
        }
      }

      out.unshift([props.timecfg.start_epoch, out[0][1]])

      const last_pt = out[out.length - 1]
      out.push([props.timecfg.stop_epoch ?? new Date().getTime(), last_pt[1]])

      const points_p = out.flatMap((point, i) => {
        const is_last = i == out.length - 1
        if (is_last) {
          return []
        }
        return {
          x: point[0],
          x2: out[i + 1][0] - 1,
          y: vfd_index,
          color: driveModeToColor(point[1])
        }
      })

      //@ts-ignore
      points.push(...points_p)
    }
  }

  const ds_out = [
    {
      showInLegend: false,
      pointWidth: 50,
      data: points,
      borderWidth: 0,
      borderRadius: 0,
      centerInCategory: true,
      dataLabels: {
        enabled: true
      }
    },
    {
      type: 'line',
      data: [],
      name: 'Forward',
      visible: true,
      legendSymbol: 'rectangle',
      color: '#00e272'
    },
    {
      type: 'line',
      data: [],
      name: 'Reverse',
      visible: true,
      legendSymbol: 'rectangle',
      color: '#544fc5'
    },
    {
      type: 'line',
      data: [],
      name: 'Stopped',
      visible: true,
      legendSymbol: 'rectangle',
      color: '#adbac0'
    },
    {
      type: 'line',
      data: [],
      name: 'Offline',
      visible: true,
      legendSymbol: 'rectangle',
      color: '#fe6a35'
    }
  ]

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
        text: ''
      },
      categories: useVFDStore().vfds.map((vfd) => vfd.display_name)
    },

    tooltip: {
      //@ts-ignore
      formatter: function () {
        //@ts-ignore
        const vfd_name = useVFDStore().vfds[this.y].display_name
        //@ts-ignore
        return `${vfd_name}: <b>${driveModeToString(colorToDriveMode(this.color as string))}</b>`
      }
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
      zoomType: 'x',
      type: 'xrange'
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
