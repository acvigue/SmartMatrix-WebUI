<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const submitHandler = async (data: { password: string }, node: FormKitNode) => {
  const { $toast } = useNuxtApp();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });
  if (error) {
    node.setErrors([error?.message ?? ""]);
    return;
  }
  node.setErrors([]);
  $toast.success("Password changed.");
  navigateTo("/auth/confirm");
};
</script>

<template>
  <h2
    class="text-lg w-full font-bold text-center mb-4 text-black dark:text-gray-300"
  >
    Reset Password
  </h2>

  <FormKit
    type="form"
    submit-label="Submit"
    class="w-full"
    @submit="submitHandler"
  >
    <FormKit
      type="password"
      name="password"
      label="New Password"
      validation="required|length:10|contains_symbol|contains_number|contains_uppercase|contains_lowercase"
    />
    <FormKit
      type="password"
      name="password_confirm"
      label="Confirm Password"
      validation="required|confirm"
    />
  </FormKit>

  <div class="w-[100%] h-1 rounded-full dark:bg-gray-600"></div>
  <div class="w-full mt-2">
    <NuxtLink
      to="/auth/confirm"
      class="text-left dark:text-gray-300 text-sm hover:opacity-80 duration-300 transform-gpu"
    >
      Cancel
    </NuxtLink>
  </div>
</template>
