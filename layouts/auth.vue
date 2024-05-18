<template>
  <div class="-z-10 absolute w-full h-full left-0 top-0 opacity-40">
    <img src="/backdrop.jpg" class="object-cover w-full h-full" />
  </div>
  <UContainer class="flex items-center justify-center min-h-screen z-10">
    <slot />
  </UContainer>
</template>
