<script setup lang="ts">
import type { FormError } from "#ui/types";

definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();

const error = ref("");
const success = ref("");
const loading = ref(false);

const fields = [
  {
    name: "email",
    type: "text",
    label: "Email",
    placeholder: "Enter your email",
  },
];

const validate = (state: any) => {
  const errors: FormError[] = [];
  if (!state.email)
    errors.push({ path: "email", message: "Email is required" });
  return errors;
};

const onSubmit = async function (data: any) {
  error.value = "";
  success.value = "";
  loading.value = true;

  const { error: err, data: resp } = await supabase.auth.resetPasswordForEmail(
    data.email,
    {
      redirectTo: "https://smx-manager.vercel.app/auth/reset_password",
    }
  );

  if (err) {
    error.value = err?.message ?? "";
  } else {
    success.value = "Please check your email";
  }
  loading.value = false;
};
</script>

<template>
  <UCard class="max-w-sm w-full">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      title="Forgot Password"
      align="top"
      icon="i-heroicons-key"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      @submit="onSubmit"
      :loading="loading"
    >
      <template #description>
        Remember it?
        <NuxtLink to="/auth/login" class="text-primary font-medium"
          >Back to login</NuxtLink
        >.
      </template>

      <template #validation v-if="error !== ''">
        <UAlert
          color="red"
          icon="i-heroicons-information-circle-20-solid"
          :title="error"
        />
      </template>

      <template #validation v-if="success !== ''">
        <UAlert
          color="green"
          icon="i-heroicons-information-circle-20-solid"
          :title="success"
        />
      </template>
    </UAuthForm>
  </UCard>
</template>
