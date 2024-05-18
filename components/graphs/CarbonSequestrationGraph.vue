<script setup lang="ts">
//fucjkkling charts.
import {
  ranger,
  queryApi,
  durMaker,
  type TimeDisplayConfig,
  bucket,
} from "@/influx";
import { parseISO } from "date-fns";
import { Chart as MyChart } from "highcharts-vue";

import { computed, ref, watchEffect } from "vue";

const props = defineProps<{
  timecfg: TimeDisplayConfig;
  device_id: string;
}>();

const series = ref<any>([]);

watchEffect(async () => {
  const data: [number | null, number | null][] = [];
  const viewRange = ranger(props.timecfg.start_epoch, props.timecfg.stop_epoch);

  const dur = durMaker(
    props.timecfg.start_epoch,
    props.timecfg.stop_epoch ?? Date.now()
  );

  const fluxQuery = `from(bucket: "levitree")
  |> ${viewRange}
  |> filter(fn: (r) => r["device_id"] == "${props.device_id}")
  |> filter(fn: (r) => r["_measurement"] == "vfd_state")
  |> filter(fn: (r) => r["_field"] == "volumetric_flow_rate")
  |> filter(fn: (r) => r["vfd_function"] == "1")
  |> map(fn: (r) => ({r with _value: r._value / ${dur.divisor}.0}))
  |> aggregateWindow(every: ${dur.dur}, fn: mean)  
  |> map(fn: (r) => ({r with _value: r._value * 0.428 * (1.33) }))
  |> cumulativeSum()`;

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);

    data.push([parseISO(o._time).getTime(), o._value]);
  }

  const ds_out = [
    {
      name: "Sequestered Carbon",
      data: data,
      type: "line",
      legendSymbol: "rectangle",
    },
  ];

  series.value = ds_out;
});

const chartOptions = computed(() => {
  return {
    title: {
      text: "",
      align: "center",
    },

    yAxis: {
      title: {
        text: "Carbon Sequestered (Tons)",
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value.toFixed(3) + " T";
        },
      },
      min: 0,
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: " T",
    },

    xAxis: {
      type: "datetime",
      minPadding: 0,
      maxPadding: 0,
    },

    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        connectNulls: false,
      },
      line: {
        marker: {
          enabled: false,
        },
      },
    },

    chart: {
      zoomType: "x",
    },

    time: {
      useUTC: false,
    },

    series: series.value,
  };
});
</script>

<template>
  <my-chart :options="chartOptions" class="w-full" />
</template>
