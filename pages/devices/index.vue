<script setup lang="ts">
import type { Device } from "balena-sdk";
import { useModal } from "vue-final-modal";
import "@/components/modals/AddDeviceModal.vue";
import AddDeviceModal from "@/components/modals/AddDeviceModal.vue";

const { pending, data: devices } = await useLazyFetch<Device[]>("/api/devices");

const user = useSupabaseUser();

const openAddDeviceModal = async () => {
  const { open, close } = useModal({
    component: AddDeviceModal,
    attrs: {
      onClose() {
        close();
      },
      onSubmit() {
        close();
        reloadNuxtApp();
      },
    },
  });
  await open();
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex w-full justify-between">
      <PageTitle>Devices</PageTitle>
      <Button
        @click="openAddDeviceModal"
        v-if="user?.app_metadata.user_role === 'contractor'"
        >Add Device</Button
      >
    </div>
    <div v-if="!pending && devices" class="gap-4 w-full">
      <DeviceTable :devices="devices" />
    </div>
    <div v-else class="w-full flex justify-center mt-8">
      <LoadingSpinner />
    </div>
  </div>
</template>
