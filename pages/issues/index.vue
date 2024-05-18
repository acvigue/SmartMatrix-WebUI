<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <PageTitle>Issue Tickets</PageTitle>
    <IssueTableView :is-admin="user?.app_metadata.user_role !== 'contractor'" />
  </div>
</template>
