<template>
  <div class="flex flex-col w-full gap-4">
    <div class="flex w-full justify-between items-center">
      <Button :destructive="false" @click="openRebootModal">Reboot</Button>
      <Button :destructive="true" @click="openShutdownModal">Shutdown</Button>
      <Button :destructive="true" @click="openPurgeDataModal" v-if="isAdmin"
        >Purge Data</Button
      >
      <Button :destructive="true" @click="openDeprovisionModal" v-if="isAdmin"
        >Deprovision</Button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Device } from "balena-sdk";
import { useModal } from "vue-final-modal";
import ConfirmationModal from "./modals/ConfirmationModal.vue";
import type { Database } from "~/supabase";
import { search } from "@formkit/icons";

const user = useSupabaseUser();

const props = defineProps<{
  device: Device;
}>();

const isAdmin = computed(
  () => user.value?.app_metadata.user_role === "superadmin"
);

const openDeprovisionModal = async () => {
  const { $toast } = useNuxtApp();
  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        close();
        const data = await $fetch(`/api/devices/${props.device.uuid}/action`, {
          method: "post",
          body: {
            action: "deprovision",
          },
        });
        $toast.warning("Device deprovisioned successfully");
        navigateTo("/devices");
      },
    },
    slots: {
      default:
        "<b>WARNING:</b> This action will deprovision the device from the fleet. Are you sure? The device will need to be reimaged to regain functionality.",
    },
  });
  await open();
};

const openRebootModal = async () => {
  const { $toast } = useNuxtApp();
  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        close();
        const data = await $fetch(`/api/devices/${props.device.uuid}/action`, {
          method: "post",
          body: {
            action: "reboot",
          },
        });
        $toast.success("Device rebooted successfully");
      },
    },
    slots: {
      default: "Are you sure you want to reboot the device?",
    },
  });
  await open();
};

const openShutdownModal = async () => {
  const { $toast } = useNuxtApp();
  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        close();
        const data = await $fetch(`/api/devices/${props.device.uuid}/action`, {
          method: "post",
          body: {
            action: "shutdown",
          },
        });
        $toast.warning("Device shutdown queued");
      },
    },
    slots: {
      default:
        "<b>WARNING:</b> This action will render the device inoperable until it is power cycled.",
    },
  });
  await open();
};

const openPurgeDataModal = async () => {
  const { $toast } = useNuxtApp();
  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        close();
        const data = await $fetch(`/api/devices/${props.device.uuid}/action`, {
          method: "post",
          body: {
            action: "purge_data",
          },
        });
        $toast.warning("Device purged successfully");
      },
    },
    slots: {
      default:
        "<b>WARNING:</b> This action will remove ALL persistent data from the device. Are you sure? This is equivalent to a factory reset (while keeping the applications installed)",
    },
  });
  await open();
};
</script>
