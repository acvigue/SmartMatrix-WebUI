<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex items-center justify-between w-full">
      <PageTitle>Device</PageTitle>
      <div class="flex items-center gap-2">
        <NuxtLink :to="`./${device?.uuid}/graphs`"
          ><Button>Graphs</Button></NuxtLink
        >
        <NuxtLink :to="`./${device?.uuid}/site_plan_management`"
          ><Button>Site Plans</Button></NuxtLink
        >
      </div>
    </div>
    <div v-if="!pending && device" class="gap-4 w-full md:columns-2 columns-1">
      <!-- Device status card with tailwind CSS -->
      <Card> <DeviceStatusCard :device="device" /></Card>
      <Card
        ><SubSectionTitle>Device Actions</SubSectionTitle>
        <DeviceActionsList :device="device" />
      </Card>
      <Card
        ><SubSectionTitle>Logs</SubSectionTitle>
        <DeviceLogs :device="device" />
      </Card>
    </div>
    <div v-else class="w-full flex justify-center mt-8">
      <LoadingSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type { Device } from "balena-sdk";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";

const device_uuid = useRoute().params?.device_uuid;

const {
  pending,
  data: device,
  error,
} = useLazyFetch<Device>(`/api/devices/${device_uuid}`);

watch(error, (err) => {
  if (err) {
    navigateTo("/devices?error=fetching");
  }
});
</script>
