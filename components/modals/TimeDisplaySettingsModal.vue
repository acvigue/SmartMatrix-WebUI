<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";
import { FormKit } from "@formkit/vue";
import { ref } from "vue";
import type { TimeDisplayConfig } from "@/influx";
import {
  viewRefreshIntervalOptionsArray,
  viewDurationOptionsArray,
} from "@/influx";

const props = defineProps<{
  timecfg: TimeDisplayConfig;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", new_timecfg: TimeDisplayConfig): void;
}>();

const auto_update = ref(props.timecfg.auto_update);

const formSubmit = async (data: any) => {
  const x = {
    auto_update: data.auto_update as boolean,
    start_epoch: Date.parse(data.start_epoch),
    stop_epoch: Date.parse(data.stop_epoch),
    update_interval: parseInt(data.update_interval),
    auto_duration: parseInt(data.auto_duration),
  };
  emit("update", x as TimeDisplayConfig);
};
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Display Settings" @close="emit('close')" />

    <FormKit
      type="form"
      id="registration-example"
      submit-label="Add"
      v-on:submit="formSubmit"
      :actions="false"
    >
      <FormKit
        type="toggle"
        label="Auto update"
        name="auto_update"
        v-model="auto_update"
      />
      <FormKit
        :disabled="auto_update"
        type="datepicker"
        name="start_epoch"
        label="View start"
        placeholder=""
        help="Start time of the graph"
        overlay
        value-locale="en"
        format="MMM D \at hh:mm A"
        :sequence="['day', 'time']"
        picker-only
        :value="new Date(timecfg.start_epoch)"
      />
      <FormKit
        :disabled="auto_update"
        type="datepicker"
        name="stop_epoch"
        label="View end"
        placeholder=""
        help="End time of the graph"
        overlay
        value-locale="en"
        format="MMM D \at hh:mm A"
        :sequence="['day', 'time']"
        picker-only
        :value="new Date(timecfg.stop_epoch ?? Date.now())"
      />
      <FormKit
        :disabled="!auto_update"
        type="dropdown"
        name="update_interval"
        label="Refresh interval"
        help="How often to update the graph in seconds"
        :options="viewRefreshIntervalOptionsArray"
        :value="timecfg.update_interval.toString()"
      />
      <FormKit
        :disabled="!auto_update"
        type="dropdown"
        name="auto_duration"
        label="View duration"
        help="Length of time to display in the graph"
        :options="viewDurationOptionsArray"
        :value="timecfg.auto_duration.toString()"
      />
      <FormKit type="submit" title="Save" />
    </FormKit>
  </ModalTemplate>
</template>
