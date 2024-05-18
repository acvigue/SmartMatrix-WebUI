<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Confirm" @close="emit('close')" />
    <div class="flex flex-col w-full gap-4">
      <p class="text-center text-lg"><slot /></p>
      <div class="flex justify-evenly w-full gap-4">
        <Button @click="emit('close')" class="w-full">Cancel</Button>
        <Button @click="emit('confirm')" :destructive="true" class="w-full"
          >Confirm</Button
        >
      </div>
    </div>
  </ModalTemplate>
</template>
