<template>
  <div
    @click="disabled ? null : emit('click')"
    :class="`
      ${
        destructive
          ? 'bg-red-600 hover:bg-red-500'
          : 'bg-blue-600 hover:bg-blue-500'
      }
       ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`"
    class="p-4 py-2 whitespace-nowrap md:whitespace-normal text-white duration-300 transform-gpu rounded-md cursor-pointer"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["click"]);

defineProps<{
  destructive?: boolean;
  disabled?: boolean;
}>();
</script>
