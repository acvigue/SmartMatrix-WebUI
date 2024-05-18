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
          <th scope="col" class="px-6 py-3">Plan Type</th>
          <th scope="col" class="px-6 py-3">Grid Size</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <SitePlansTableRow v-for="plan in plans" :key="plan.id" :plan="plan" />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Device } from "balena-sdk";
import type { Database } from "~/supabase";

const user = useSupabaseUser();

const props = defineProps<{
  uuid: string;
}>();

const plans = ref<Database["public"]["Tables"]["site_plans"]["Row"][]>([]);
const supabase = useSupabaseClient<Database>();

onNuxtReady(async () => {
  const { data, error } = await supabase
    .from("site_plans")
    .select("*")
    .eq("device_uuid", props.uuid);
  if (error) {
    console.error(error);
  } else {
    plans.value = data;
  }
});
</script>
