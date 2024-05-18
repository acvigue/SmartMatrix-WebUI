<script setup lang="ts">
import { ranger, decimator, queryApi } from '@/plugins/influx'
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
const sensorStore = useSensorStore()

const distanceSensor = computed(() => {
  return sensorStore.sensors.find((sensor) => sensor.sensor.type === 'ultrasonic')
})

watchEffect(async () => {
  const data: [number | null, number | null][] = []
  const viewRange = ranger(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  const aggregateWindow = decimator(props.timecfg.start_epoch, props.timecfg.stop_epoch)

  //TODO: This is a bit of a hack, but it works for now.
  //Also, fuck fluxql
  const fluxQuery = `from(bucket:"levitree") |> ${viewRange} |> filter(fn: (r) => r._measurement == "sensor_state" and r._field == "distance" and r.sensor_id == "${distanceSensor.value!.id}") |> ${aggregateWindow}`

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)

    data.push([parseISO(o._time).getTime(), o._value])
  }

  const ds_out = [
    {
      name: distanceSensor.value?.display_name,
      data: data,
      type: 'line',
      legendSymbol: 'rectangle',
      color: '#544fc5'
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
        text: 'Distance'
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + ' cm'
        }
      },
      min: 0
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: ' cm'
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
