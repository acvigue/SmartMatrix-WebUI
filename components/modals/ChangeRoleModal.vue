<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";
import type { User } from "@supabase/supabase-js";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  user_uuid: string;
}>();

const roleOptions = [
  {
    label: "Super Admin",
    value: "superadmin",
  },
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "Contractor",
    value: "contractor",
  },
];

const { data, pending } = useLazyFetch<{ user: User }>(
  `/api/users/${props.user_uuid}`
);

const handleSubmit = async (data: { role: string }, node: any) => {
  const { $toast } = useNuxtApp();
  try {
    const resp = await $fetch(`/api/users/${props.user_uuid}`, {
      method: "PATCH",
      body: {
        role: data.role,
      },
    });
    $toast.success("User role successfully updated.");
    emit("close");
    reloadNuxtApp();
  } catch (e: any) {
    $toast.error(e.response._data);
  }
};
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Change Role" @close="emit('close')" />
    <div class="flex flex-col w-full gap-4 items-center">
      <FormKit
        type="form"
        @submit="handleSubmit"
        submit-label="Done"
        v-if="!pending"
      >
        <FormKit
          type="dropdown"
          :options="roleOptions"
          name="role"
          label="New Role"
          validation="required"
          :value="data?.user.app_metadata.user_role ?? 'contractor'"
        />
      </FormKit>
      <LoadingSpinner v-else />
    </div>
  </ModalTemplate>
</template>
