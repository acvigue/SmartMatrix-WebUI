<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", value: { x: number; y: number; z: number }[]): void;
}>();

const props = defineProps<{
  points: { x: number; y: number; z: number }[];
}>();
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Edit Mesh" @close="emit('close')" />
    <ThreeMeshEditor
      :points="points"
      @saved="(points) => emit('saved', points)"
      class="aspect-square w-full"
    />
  </ModalTemplate>
</template>
