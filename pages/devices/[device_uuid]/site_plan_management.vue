<template>
  <div class="w-full flex flex-col gap-4">
    <div class="w-full flex justify-between items-center">
      <PageTitle>Site Plan Management</PageTitle>
      <Button @click="openCreateSitePlanModal" class="flex items-center gap-2">
        New
      </Button>
    </div>

    <SitePlansTable :uuid="device_uuid" />
  </div>
</template>

<script setup lang="ts">
import { useModal } from "vue-final-modal";
import AddEditSitePlanModal from "~/components/modals/AddEditSitePlanModal.vue";
import { type Database } from "~/supabase";

const supabase = useSupabaseClient<Database>();

const site_plans = ref<any[]>([]);

onNuxtReady(async () => {
  const { data, error } = await supabase
    .from("site_plans")
    .select("*")
    .eq("device_uuid", device_uuid);
  if (error) {
    console.error(error);
  } else {
    site_plans.value = data;
  }
});

const device_uuid = useRoute().params?.device_uuid as string;
const openCreateSitePlanModal = async () => {
  const { open, close } = useModal({
    component: AddEditSitePlanModal,
    attrs: {
      onClose: async () => {
        await close();
      },
      onCreated: async () => {
        await close();
      },
      device_uuid: device_uuid as string,
    },
  });
  await open();
};
</script>
