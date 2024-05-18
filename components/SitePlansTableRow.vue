<template>
  <tr class="bg-white dark:bg-gray-800">
    <th
      scope="row"
      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
    >
      {{ planData.name }}
    </th>
    <th
      scope="row"
      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
    >
      {{ planType }}
    </th>
    <td class="px-6 py-4" v-if="isAdmin">
      {{ gridSize }}
    </td>
    <td class="px-6 py-4 flex justify-start gap-4">
      <Button :destructive="true" @click="deletePlan" :disabled="!isAdmin"
        >Delete</Button
      >
      <Button @click="openEditPlanModal" :disabled="!isAdmin">Edit</Button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useModal } from "vue-final-modal";
import type { Database } from "~/supabase";
import AddEditSitePlanModal from "~/components/modals/AddEditSitePlanModal.vue";

const user = useSupabaseUser();

const supabase = useSupabaseClient<Database>();
const isAdmin = computed(
  () => user?.value?.app_metadata.user_role === "superadmin"
);

const props = defineProps<{
  plan: Database["public"]["Tables"]["site_plans"]["Row"];
}>();

const planData = ref<any>({});

const planType = computed(() => {
  switch (planData.value.land_purpose) {
    case 0:
      return "Sequestration";
    case 1:
      return "Elevation";
    default:
      return "Unknown";
  }
});

const gridSize = computed(() => {
  if (planData.value.land_purpose === 0) {
    return "N/A";
  }
  return `${planData.value.survey_points?.length ?? 0}`;
});

const openEditPlanModal = async () => {
  const { open, close } = useModal({
    component: AddEditSitePlanModal,
    attrs: {
      onClose: async () => {
        await close();
      },
      onCreated: async () => {
        await close();
      },
      device_uuid: props.plan.device_uuid!,
      plan: props.plan,
    },
  });
  await open();
};

const deletePlan = async () => {
  const { error } = await supabase
    .from("site_plans")
    .delete()
    .eq("id", props.plan.id);
  if (error) {
    console.error(error);
  } else {
    const { $toast } = useNuxtApp();
    $toast.success("Site plan deleted successfully");
    reloadNuxtApp();
  }
};

onNuxtReady(async () => {
  planData.value = props.plan.site_plan_data;
});
</script>
