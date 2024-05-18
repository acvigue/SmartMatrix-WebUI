<template>
  <div class="relative">
    <div
      class="absolute inset-0 w-screen h-screen z-0 bg-gray-300 dark:bg-gray-800"
    />
    <img
      src="/login_bg.png"
      class="absolute inset-0 w-screen h-screen object-cover z-10 opacity-40"
    />
    <div
      class="absolute w-screen h-screen flex justify-center items-center flex-col gap-4 z-20"
    >
      <h1
        class="text-2xl w-full font-bold text-center mb-2 text-black dark:text-gray-300"
      >
        SmartMatrix Manager
      </h1>
      <div
        class="px-16 p-8 rounded-md bg-gray-100 dark:bg-gray-700 drop-shadow-lg flex flex-col gap-1 items-center max-w-xl w-[85%]"
      >
        <slot />
      </div>
      <div class="flex w-full justify-center items-center gap-4">
        <NuxtLink
          to="/auth/register"
          class="dark:text-gray-300 text-sm hover:opacity-80 duration-300 transform-gpu"
          active-class="hidden"
        >
          Register
        </NuxtLink>
        <NuxtLink
          to="/auth/login"
          class="dark:text-gray-300 text-sm hover:opacity-80 duration-300 transform-gpu"
          active-class="hidden"
        >
          Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
