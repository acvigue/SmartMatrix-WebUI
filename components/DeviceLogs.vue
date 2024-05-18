<template>
  <div
    class="flex flex-col w-full gap-1 bg-black overflow-scroll h-96"
    v-if="logs.length > 0"
  >
    <LogMessage
      v-for="log in logs"
      :key="log.SYSLOG_IDENTIFIER"
      :message="log"
    />
  </div>
  <div v-else class="w-full flex justify-center"><LoadingSpinner /></div>
</template>

<script setup lang="ts">
import type { Device } from "balena-sdk";
const zoom = ref(13);

const props = defineProps<{
  device: Device;
}>();

const since = ref("-30m");
const until = ref("now");

const { data: logs } = await useLazyFetch<any>(
  `https://${props.device.uuid}.balena-devices.com/rwis/supervisor/logs`,
  {
    method: "POST",
    body: {
      since: since.value,
      until: until.value,
    },
  }
);
</script>
