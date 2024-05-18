<script setup lang="ts">
//fucjkkling charts.
import { ranger, queryApi, durMaker, type TimeDisplayConfig } from "@/influx";
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

  //TODO: Come up with real formula instead of drunksolving it :p
  //V = ABC * 4/3 * pi (B==C, A=1/2B)
  //A = 2 * cbrt(3/2pi) * cbrt(V)

  const fluxQuery = `import "math"
  from(bucket: "levitree")
  |> ${viewRange}
  |> filter(fn: (r) => r["device_id"] == "${props.device_id}")
  |> filter(fn: (r) => r["_measurement"] == "vfd_state")
  |> filter(fn: (r) => r["_field"] == "volumetric_flow_rate")
  |> filter(fn: (r) => r["vfd_function"] == "3")
  |> map(fn: (r) => ({r with _value: r._value / ${dur.divisor}.0}))
  |> aggregateWindow(every: ${dur.dur}, fn: mean)  
  |> cumulativeSum()
  |> map(fn: (r) => ({r with _value: 
    2.0 * math.cbrt(x: (3.0 / (2.0 * math.pi))) * math.cbrt(x: r._value)
  }))`;

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);

    data.push([parseISO(o._time).getTime(), o._value]);
  }

  const ds_out = [
    {
      name: "Elevation",
      data: data,
      type: "line",
      legendSymbol: "rectangle",
      color: "#fa4b42",
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
        text: "meters",
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + " m";
        },
      },
      min: 0,
    },

    tooltip: {
      valueDecimals: 2,
      valueSuffix: "m",
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
