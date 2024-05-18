<template>
  <div class="overflow-x-scroll w-full">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Name</th>
          <th scope="col" class="px-6 py-3" v-if="isAdmin">Assigned to</th>
          <th scope="col" class="px-6 py-3">Connectivity</th>
          <th scope="col" class="px-6 py-3">Location</th>
          <th scope="col" class="px-6 py-3">Version</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <DeviceTableRow
          v-for="device in devices"
          :key="device.id"
          :device="device"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Device } from "balena-sdk";

const user = useSupabaseUser();

const isAdmin = computed(
  () => user?.value?.app_metadata.user_role === "superadmin"
);

const props = defineProps<{
  devices: Device[];
}>();
</script>
