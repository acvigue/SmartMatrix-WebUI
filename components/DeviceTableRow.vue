<template>
  <tr class="bg-white dark:bg-gray-800">
    <th
      scope="row"
      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
    >
      {{ device.device_name }}
    </th>
    <td class="px-6 py-4" v-if="isAdmin">
      {{ /* @ts-ignore */ null }}
      {{ device.owner }}
    </td>
    <td class="px-6 py-4">
      {{ device.is_connected_to_vpn ? "Connected" : "Disconnected" }}
    </td>
    <td class="px-6 py-4">{{ device.location }}</td>
    <td class="px-6 py-4">{{ device.os_version }}</td>
    <td class="px-6 py-4 flex gap-2">
      <Button
        :destructive="true"
        @click="openUnpairModal"
        v-if="user?.app_metadata.user_role === 'contractor'"
        >Unpair</Button
      ><Button @click="manageDevice">Manage</Button
      ><Button @click="openAboutModal">About</Button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Device } from "balena-sdk";
import { useModal } from "vue-final-modal";
import ConfirmationModal from "./modals/ConfirmationModal.vue";
import AboutDeviceModal from "./modals/AboutDeviceModal.vue";
import type { Database } from "~/supabase";

const user = useSupabaseUser();
const connected_user = ref("");
const supabase = useSupabaseClient<Database>();
const isAdmin = computed(
  () => user?.value?.app_metadata.user_role === "superadmin"
);

const props = defineProps<{
  device: Device;
}>();

const manageDevice = () => {
  navigateTo(`/devices/${props.device.uuid}`);
};

const openAboutModal = async () => {
  const { open, close } = useModal({
    component: AboutDeviceModal,
    attrs: {
      device: props.device,
      onClose() {
        close();
      },
    },
  });
  await open();
};

const openUnpairModal = async () => {
  const { $toast } = useNuxtApp();
  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        close();
        const data = await $fetch("/api/devices/unlink", {
          method: "post",
          body: {
            device_id: props.device.uuid,
          },
        });
        $toast.success("Device unpaired successfully");
        reloadNuxtApp();
      },
    },
    slots: {
      default: "Are you sure you want to unpair this device?",
    },
  });
  await open();
};
</script>
