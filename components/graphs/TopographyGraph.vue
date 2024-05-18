<script setup lang="ts">
//fucjkkling charts.
import {
  ranger,
  queryApi,
  durMaker,
  computeHeightAtPoint,
  computeEllipseDimensions
} from '@/plugins/influx'
import type { TimeDisplayConfig } from '@/plugins/types/sessions'
import { useSessionsStore } from '@/stores/SessionsStore'
import { useVFDStore } from '@/stores/VFDStore'
import { Chart as MyChart } from 'highcharts-vue'
import heatmap from 'highcharts/modules/heatmap'
import Highcharts from 'highcharts'

heatmap(Highcharts)

import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{
  timecfg: TimeDisplayConfig
}>()

enum TypeSelection {
  ELLIPSOID = 0,
  GPS_BASED = 1
}

const typeSelectionOptions = [
  { label: 'Ellipsoid', value: TypeSelection.ELLIPSOID.toString() },
  { label: 'GPS Based', value: TypeSelection.GPS_BASED.toString() }
]

const ellipsoidalSeries = ref<any>([])
const gpsSeries = ref<any>([])
const sessionStore = useSessionsStore()
const typeSelection = ref('0')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const computedTypeSelection = computed(() => parseInt(typeSelection.value) as TypeSelection)

watchEffect(async () => {
  if (useVFDStore().vfds.length == 0) {
    return
  }
  const data: [number | null, number | null, number | null][] = []
  const startTime =
    sessionStore.session.state.session_times[0].start_time === 0
      ? props.timecfg.start_epoch
      : sessionStore.session.state.session_times[0].start_time
  const viewRange = ranger(startTime, props.timecfg.stop_epoch)

  const dur = durMaker(startTime, props.timecfg.stop_epoch ?? Date.now())

  const fluxQuery = `import "math"
  from(bucket: "levitree")
  |> ${viewRange}
  |> filter(fn: (r) => r["_measurement"] == "vfd_state")
  |> filter(fn: (r) => r["_field"] == "volumetric_flow_rate")
  |> filter(fn: (r) => r["vfd_function"] == "3")
  |> map(fn: (r) => ({r with _value: r._value / ${dur.divisor}.0}))
  |> aggregateWindow(every: ${dur.dur}, fn: mean)  
  |> sum()`

  let d = { _value: 0 }
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)

    d = o as any
  }

  console.log(d)
  const volume: number = d._value
  const dimensions = computeEllipseDimensions(volume)
  console.log(`Ellipse dimensions: ${dimensions}`)

  //Iter through to make a 10x10 heatmap.
  const spreadRadius = dimensions.spread / 2
  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      const xMeters = (i / 10) * spreadRadius
      const yMeters = (j / 10) * spreadRadius
      data.push([i, j, computeHeightAtPoint(Math.abs(xMeters), Math.abs(yMeters), dimensions)])
    }
  }

  console.log('Data', data)

  const ds_out = [
    {
      name: 'Elevation',
      data: data,
      type: 'heatmap',
      interpolation: true
    }
  ]

  ellipsoidalSeries.value = ds_out
})

const chartOptions = computed(() => {
  return {
    title: {
      text: '',
      align: 'center'
    },

    yAxis: {
      title: {
        text: 'meters'
      }
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: 'm'
    },

    xAxis: {
      title: {
        text: 'meters'
      }
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
      height: '500px'
    },

    colorAxis: {
      min: 0,
      max: 4,
      minColor: '#FFFFFF',
      maxColor: '#00FF00'
    },

    time: {
      useUTC: false
    },

    series: typeSelection.value === '0' ? ellipsoidalSeries.value : gpsSeries.value
  }
})
</script>

<template>
  <div class="flex flex-col w-full">
    <my-chart :options="chartOptions" class="w-full h-[500px]" />
    <FormKit
      class="w-20"
      type="dropdown"
      label="Data Source"
      v-model="typeSelection"
      :options="typeSelectionOptions"
    />
  </div>
</template>
