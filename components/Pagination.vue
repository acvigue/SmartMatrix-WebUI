<template>{{ modelValue }} {{ maxPage }}</template>

<script setup lang="ts">
const modelValue = defineModel();

const props = defineProps<{
  maxPage: number;
}>();
</script>
