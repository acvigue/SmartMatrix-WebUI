<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface ModalHeaderProps {
  title: string
}

defineProps<ModalHeaderProps>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="flex justify-between w-full items-center pb-4">
    <div class="flex-1 flex justfiy-start items-center">
      <button @click="emit('close')" class="hover:scale-125 transform-gpu duration-300">
        <XMarkIcon class="w-7" />
      </button>
    </div>
    <span class="text-xl font-medium"> {{ title }}</span>
    <div class="flex-1"></div>
  </div>
</template>
