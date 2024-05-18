<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit"): void;
}>();

const handleSubmit = async (data: { pairing_code: string }, node: any) => {
  const { $toast } = useNuxtApp();
  try {
    const resp = await $fetch("/api/devices/link", {
      method: "POST",
      body: {
        pairing_code: data.pairing_code,
      },
    });
    $toast.success("Device added successfully");
    emit("submit");
  } catch (e: any) {
    $toast.error(e.response._data);
  }
};
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Add Device" @close="emit('close')" />
    <div class="flex flex-col w-full gap-4">
      <FormKit type="form" @submit="handleSubmit" submit-label="Add">
        <FormKit
          type="mask"
          mask="hhhhhh-hhhhhh"
          name="pairing_code"
          label="Device ID"
          help="Found in the About menu on the RWIS HMI panel"
          validation="required|length:13,13"
        />
      </FormKit>
    </div>
  </ModalTemplate>
</template>
