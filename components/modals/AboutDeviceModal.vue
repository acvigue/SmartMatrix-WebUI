<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";
import type { Device } from "balena-sdk";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  device: Device;
}>();
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader :title="device.device_name" @close="emit('close')" />
    <div class="flex flex-col w-full gap-2">
      <div class="flex justify-between w-full">
        <p>Pairing Code</p>
        <span
          >{{ device.uuid.substring(0, 6) }}-{{ device.uuid.slice(-6) }}</span
        >
      </div>
      <div class="flex justify-between w-full">
        <p>CPU Load</p>
        <span>{{ device.cpu_usage }}%</span>
      </div>
      <div class="flex justify-between w-full">
        <p>Disk Usage</p>
        <span
          >{{
            (
              ((device.storage_usage ?? 0) / (device.storage_total ?? 9)) *
              100
            ).toFixed(0)
          }}%</span
        >
      </div>
      <div class="flex justify-between w-full">
        <p>Public IP</p>
        <span>{{ device.public_address }}</span>
      </div>
    </div>
  </ModalTemplate>
</template>
