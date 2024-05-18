<script setup lang="ts">
import type { Database } from "~/supabase";

const loading = ref(true);
const currentPage = ref(1);
const maxPage = ref(1);
const users = ref<any[]>([]);

onNuxtReady(() => {
  fetchUsers(1);
});

const supabase = useSupabaseClient<Database>();
const fetchUsers = async (page: number) => {
  const { $toast } = useNuxtApp();
  const { data, error } = await useFetch("/api/users", {
    query: { page },
  });

  if (error.value) {
    return $toast.error(error.value?.message);
  }
  loading.value = false;

  //@ts-ignore
  users.value = data.value.users;
};
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <PageTitle>Access Management</PageTitle>
    <div v-if="!loading" class="gap-4 w-full">
      <UserTable :users="users" />
      <Pagination v-model="currentPage" :maxPage="maxPage" />
    </div>
    <div v-else class="w-full flex justify-center mt-8">
      <LoadingSpinner />
    </div>
  </div>
</template>
