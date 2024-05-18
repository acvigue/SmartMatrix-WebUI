<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();

const submitHandler = async (data: { code: string }, node: FormKitNode) => {
  const factors = await supabase.auth.mfa.listFactors();
  if (factors.error) {
    return node.setErrors([factors.error.message]);
  }

  const totpFactor = factors.data.totp[0];

  if (!totpFactor) {
    return node.setErrors(["No TOTP factor found!"]);
  }

  const factorId = totpFactor.id;

  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) {
    return node.setErrors([challenge.error.message]);
  }

  const challengeId = challenge.data.id;

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code: data.code,
  });
  if (verify.error) {
    return node.setErrors([verify.error.message]);
  }
  await navigateTo("/auth/confirm");
};
</script>

<template>
  <h2
    class="text-lg w-full font-bold text-center text-black dark:text-gray-300"
  >
    Two-Factor Authentication
  </h2>

  <FormKit
    type="form"
    submit-label="Submit"
    class="w-full"
    @submit="submitHandler"
  >
    <FormKit
      type="number"
      name="code"
      label="Verification Code"
      validation="required|length:6,6"
      help="Enter the number generated from your Authenticator App"
    />
  </FormKit>
</template>
