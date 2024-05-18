<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();

const submitHandler = async (
  data: { email: string; password: string },
  node: FormKitNode
) => {
  const { $toast } = useNuxtApp();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (error) {
    if (error.message.includes("DOMAIN")) {
      node.setErrors(["Domain is not whitelisted. Please contact support."]);
    } else {
      node.setErrors([error?.message ?? ""]);
    }
    return;
  }
  node.setErrors([]);
  $toast.success("Check your email for a confirmation link.");
};
</script>

<template>
  <h2
    class="text-lg w-full font-bold text-center text-black dark:text-gray-300"
  >
    Registration
  </h2>

  <FormKit type="form" submit-label="Submit" @submit="submitHandler">
    <FormKit
      type="email"
      name="email"
      label="Email"
      validation="required|email"
    />
    <FormKit
      type="password"
      name="password"
      label="Password"
      validation="required|length:10|contains_symbol|contains_number|contains_uppercase|contains_lowercase"
    />
    <FormKit
      type="password"
      name="password_confirm"
      label="Confirm Password"
      validation="required|confirm"
    />
  </FormKit>
</template>
