<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <PageTitle
      >Welcome to Homebase
      {{ user?.app_metadata.user_role as string }} view!</PageTitle
    >
    <IndexAdminView v-if="user?.app_metadata.user_role === 'superadmin'" />
    <IndexContractorView v-if="user?.app_metadata.user_role === 'contractor'" />
  </div>
</template>
