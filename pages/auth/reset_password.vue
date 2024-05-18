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
    name: "password",
    label: "New Password",
    type: "password",
    placeholder: "Enter your new password",
  },
  {
    name: "confirm_password",
    label: "Confirm Password",
    type: "password",
    placeholder: "Again, please",
  },
];

const validate = (state: any) => {
  const errors: FormError[] = [];
  if (!state.password)
    errors.push({ path: "password", message: "Password is required" });
  if (state.password.length < 8)
    errors.push({
      path: "password",
      message: "Password must be at least 8 characters",
    });
  if (state.confirm_password !== state.password)
    errors.push({
      path: "confirm_password",
      message: "Passwords do not match",
    });
  return errors;
};

const onSubmit = async function (data: any) {
  error.value = "";
  success.value = "";
  loading.value = true;

  const { error: err, data: resp } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (err) {
    error.value = err?.message ?? "";
  } else {
    success.value = "Password changed. Redirecting...";
    setTimeout(() => {
      navigateTo("/");
    }, 2000);
  }
  loading.value = false;
};
</script>

<template>
  <UCard class="max-w-sm w-full">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      title="Reset Password"
      align="top"
      icon="i-heroicons-key"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      @submit="onSubmit"
      :loading="loading"
    >
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
