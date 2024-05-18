<template>
  <tr class="bg-white dark:bg-gray-800">
    <th
      scope="row"
      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
    >
      {{ user.email }}
    </th>
    <td class="px-6 py-4">{{ user.created_at }}</td>
    <td class="px-6 py-4">{{ user.app_metadata?.user_role }}</td>
    <td class="px-6 py-4 flex gap-2">
      <Button :destructive="true" @click="openDeleteModal">Delete</Button
      ><Button @click="openChangeRoleModal">Change Role</Button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useModal } from "vue-final-modal";
import ChangeRoleModal from "./modals/ChangeRoleModal.vue";
import ConfirmationModal from "./modals/ConfirmationModal.vue";
import type { User } from "@supabase/supabase-js";

const props = defineProps<{
  user: User;
}>();

const openDeleteModal = () => {
  const { $toast } = useNuxtApp();

  const { open, close } = useModal({
    component: ConfirmationModal,
    attrs: {
      onClose() {
        close();
      },
      onConfirm: async () => {
        await fetch(`/api/users/${props.user.id}`, {
          method: "delete",
        });
        $toast.success("User successfully deleted.");
        close();
        reloadNuxtApp();
      },
    },
    slots: {
      default: "Are you sure you want to delete this user?",
    },
  });

  open();
};
const openChangeRoleModal = () => {
  const { open, close } = useModal({
    component: ChangeRoleModal,
    attrs: {
      user_uuid: props.user.id,
      onClose() {
        close();
      },
    },
  });
  open();
};
</script>
