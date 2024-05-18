<template>
  <div class="flex flex-col w-full gap-3 px-2">
    <NavLink to="/">Home</NavLink>
    <NavLink to="/devices"
      >{{ permissionLevel === "superadmin" ? "All" : "My" }} Devices</NavLink
    >
    <NavLink to="/user_management" v-if="permissionLevel === 'superadmin'"
      >Access Management</NavLink
    >
    <NavLink to="/issues">Issue Tickets</NavLink>

    <NavLink to="/user_settings" class="mt-4">User Settings</NavLink>
    <NavLink @click="logout">Logout</NavLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mobile?: boolean;
}>();

const supabase = useSupabaseClient();

const user = useSupabaseUser();
const permissionLevel = computed<string>(
  () => user.value?.app_metadata?.user_role
);

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  const { $toast } = useNuxtApp();
  if (error) {
    return $toast.error(error.message);
  }
  $toast.success("Logged out!");
  navigateTo("/auth/login");
};
</script>
