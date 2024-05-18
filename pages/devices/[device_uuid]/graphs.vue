<template>
  <div class="flex items-center justify-between w-full">
    <PageTitle>Graphs</PageTitle>
    <div class="flex items-center gap-2">
      <Button @click="openDisplayConfig">Display Configuration</Button>
    </div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 m-4 gap-4">
    <ClientOnly>
      <div>
        <div class="w-full text-center text-xl mb-4">Carbon Sequestration</div>
        <GraphsCarbonSequestrationGraph
          :device_id="fmt_uuid"
          :timecfg="timedisplay"
        />
      </div>
      <div>
        <div class="w-full text-center text-xl mb-4">Elevation</div>
        <GraphsEllipsoidalElevationGraph
          :device_id="fmt_uuid"
          :timecfg="timedisplay"
        />
      </div>
      <div>
        <div class="w-full text-center text-xl mb-4">
          Proportional Deposition
        </div>
        <SlurryProportionalVolumeGraph
          :device_id="fmt_uuid"
          :timecfg="timedisplay"
        />
      </div>
      <div>
        <div class="w-full text-center text-xl mb-4">Carbon Sequestration</div>
        <GraphsCarbonSequestrationGraph
          :device_id="fmt_uuid"
          :timecfg="timedisplay"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useModal } from "vue-final-modal";
import SlurryProportionalVolumeGraph from "~/components/graphs/SlurryProportionalVolumeGraph.vue";
import TimeDisplaySettingsModal from "~/components/modals/TimeDisplaySettingsModal.vue";
import type { TimeDisplayConfig } from "~/influx";

const timedisplay = ref<TimeDisplayConfig>({
  session: false,
  session_times: [],
  start_epoch: Date.now() - 60 * 60 * 1000,
  stop_epoch: Date.now(),
  update_interval: 5,
  auto_duration: 30 * 60 * 1000,
  auto_update: true,
});

const openDisplayConfig = async () => {
  // Open the display configuration modal
  const { open, close } = useModal({
    component: TimeDisplaySettingsModal,
    attrs: {
      onClose() {
        close();
      },
      onUpdate: async (new_timecfg: TimeDisplayConfig) => {
        close();
        timedisplay.value = new_timecfg;
      },
      timecfg: timedisplay.value,
    },
  });
  await open();
};

const device_uuid = useRoute().params?.device_uuid as string;
const fmt_uuid = computed(() => device_uuid.slice(0, 7));
</script>
