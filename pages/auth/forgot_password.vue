<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();

const submitHandler = async (data: { email: string }, node: FormKitNode) => {
  const { $toast } = useNuxtApp();
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: "https://smx-manager.vercel.app/auth/reset_password",
  });
  if (error) {
    node.setErrors([error?.message ?? ""]);
    return;
  }
  node.setErrors([]);
  $toast.success("If the email exists, a reset link has been sent.");
};
</script>

<template>
  <h2
    class="text-lg w-full font-bold text-center mb-4 text-black dark:text-gray-300"
  >
    Forgot Password
  </h2>

  <FormKit
    type="form"
    submit-label="Submit"
    class="w-full"
    @submit="submitHandler"
  >
    <FormKit
      type="email"
      name="email"
      label="Email"
      validation="required|email"
      help="Enter your email to get back into your account."
    />
  </FormKit>
</template>
