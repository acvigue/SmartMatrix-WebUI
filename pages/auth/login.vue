<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

watch(user, async () => {
  if (user.value) {
    await navigateTo("/auth/confirm");
  }
});

const submitHandler = async (
  data: { email: string; password: string },
  node: FormKitNode
) => {
  const { $toast } = useNuxtApp();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    $toast.error(error?.message ?? "");
    return;
  }
  $toast.success("Logged in!");
  node.setErrors([]);
};
</script>

<template>
  <h2
    class="text-lg w-full font-bold text-center text-black dark:text-gray-300"
  >
    Login to continue
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
    />
    <FormKit
      type="password"
      name="password"
      label="Password"
      validation="required"
    />
    <div class="flex w-full justify-end">
      <NuxtLink
        to="/auth/forgot_password"
        class="dark:text-gray-300 text-sm hover:opacity-80 duration-300 transform-gpu"
      >
        Forgot Password
      </NuxtLink>
    </div>
  </FormKit>
</template>
