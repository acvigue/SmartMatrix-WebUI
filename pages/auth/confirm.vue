<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

// Get redirect path from cookies
const cookieName = useRuntimeConfig().public.supabase.cookieName;
const redirectPath = useCookie(`${cookieName}-redirect-path`).value;

watch(
  user,
  async () => {
    if (user.value) {
      //Handle AAL1 -> AAL2 assurance level upgrade if user has 2FA enabled
      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) {
        return navigateTo({
          path: "/auth/login",
          query: { error: error.message },
        });
      }

      if (data.currentLevel === data.nextLevel) {
        // Clear cookie
        useCookie(`${cookieName}-redirect-path`).value = null;
        // Redirect to path
        return navigateTo(redirectPath || "/");
      }

      if (data.currentLevel === "aal1" && data.nextLevel === "aal2") {
        return navigateTo("/auth/assurance_check");
      }

      if (data.currentLevel === "aal2" && data.nextLevel === "aal1") {
        await supabase.auth.signOut();
        return navigateTo("/auth/login");
      }
    }
  },
  { immediate: true }
);
</script>
<template>
  <LoadingSpinner />
</template>
