<script setup lang="ts">
//fucjkkling charts.
import {
  ranger,
  queryApi,
  durMaker,
  getColor,
  type TimeDisplayConfig,
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
  const datasets: {
    [key: string]: { data: [number | null, number | null][] };
  } = {};

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
  |> filter(fn: (r) => r["vfd_function"] != "3")
  |> map(fn: (r) => ({r with _value: r._value / ${dur.divisor}.0}))
  |> aggregateWindow(every: ${dur.dur}, fn: mean)
  |> cumulativeSum()`;

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);

    if (!datasets[o.vfd_function]) {
      datasets[o.vfd_function] = {
        data: [],
      };
    }

    if (parseISO(o._time).getTime() >= props.timecfg.start_epoch) {
      datasets[o.vfd_function].data.push([
        parseISO(o._time).getTime(),
        o._value,
      ]);
    }
  }

  const ds_out = [];
  let i = 4;
  for (const vfd_func in datasets) {
    const functionToName: { [key: string]: string } = {
      "1": "Additive Water",
      "2": "Additive Wood Chips",
      "4": "Additive Viscosifier",
      "5": "Outlet",
    };
    ds_out.push({
      color: getColor(i),
      name: functionToName[vfd_func],
      data: datasets[vfd_func].data,
      type: "area",
      legendSymbol: "rectangle",
    });
    i++;
  }

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
        text: "Volume",
      },
      labels: {
        formatter: function (): string {
          // @ts-ignore
          return this.value + " m3";
        },
      },
      min: 0,
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

    tooltip: {
      valueDecimals: 2,
      valueSuffix: "m3",
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
      area: {
        marker: {
          enabled: false,
        },
        stacking: "normal",
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
