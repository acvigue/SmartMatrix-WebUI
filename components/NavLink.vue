<template>
  <NuxtLink
    :to="to ?? '#'"
    class="text-md font-semibold hover:text-gray-500 duration-300 transform-gpu"
    :active-class="to ? '!text-blue-500' : undefined"
    @click="emit('click')"
  >
    <slot
  /></NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to?: string;
}>();
const emit = defineEmits(["click"]);
</script>
