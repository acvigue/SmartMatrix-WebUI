<script setup lang="ts">
import type { FormError } from "#ui/types";

definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const error = ref("");
const success = ref("");
const loading = ref(false);

watch(user, async () => {
  if (user.value) {
    await navigateTo("/auth/confirm");
  }
});

const fields = [
  {
    name: "first_name",
    type: "text",
    label: "First Name",
    placeholder: "Enter your first name",
  },
  {
    name: "email",
    type: "text",
    label: "Email",
    placeholder: "Enter your email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
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
  if (!state.email)
    errors.push({ path: "email", message: "Email is required" });
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

const providers = [
  {
    label: "Continue with GitHub",
    icon: "i-simple-icons-github",
    color: "white" as const,
    click: () => {
      console.log("Redirect to GitHub");
    },
  },
];

const onSubmit = async function (data: any) {
  error.value = "";
  success.value = "";
  loading.value = true;

  const { error: err, data: resp } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.first_name,
      },
    },
  });
  if (err) {
    error.value = err?.message ?? "";
  } else {
    success.value = "Account created successfully! Please check your email.";
  }
  loading.value = false;
};
</script>

<template>
  <UCard class="max-w-sm w-full">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      :providers="providers"
      title="Create Account"
      align="top"
      icon="i-heroicons-lock-closed"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      @submit="onSubmit"
      :loading="loading"
    >
      <template #description>
        Already have an account?
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

      <template #footer>
        By signing up, you agree to our
        <NuxtLink to="/terms" class="text-primary font-medium"
          >Terms of Service</NuxtLink
        >.
      </template>
    </UAuthForm>
  </UCard>
</template>
