<template>
  <div class="flex flex-col gap-4">
    <div class="overflow-x-scroll">
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Created At</th>
            <th scope="col" class="px-6 py-3">Role</th>
            <th scope="col" class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <UserTableRow v-for="user in users" :key="user.id" :user="user" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  users: any[];
}>();
</script>
