<script setup lang="ts">
const menuOpen = ref(false);
const popMenuOpen = ref(false);
</script>

<template>
  <div
    class="relative flex flex-col dark:bg-gray-800 min-h-screen dark:text-white text-gray-900"
  >
    <!-- Navbar -->
    <div
      class="flex w-full md:justify-start justify-end items-center p-4 dark:bg-gray-700 bg-gray-100 mb-4"
    >
      <button
        class="hover:text-gray-700 dark:text-white dark:hover:text-gray-500 duration-300 transform-gpu hidden md:block mr-4"
        @click="menuOpen = !menuOpen"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      <!-- Top Nav Content -->
      <h1 class="text-xl font-bold">Homebase</h1>
      <div class="flex-1"></div>

      <button
        class="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-500 duration-300 transform-gpu md:hidden"
        @click="popMenuOpen = !popMenuOpen"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
    </div>

    <div class="flex flex-row">
      <!-- Sidebar -->
      <Transition name="slide">
        <div
          v-if="menuOpen"
          class="w-1/4 max-w-[16rem] hidden md:block mx-4 mr-0"
        >
          <!-- Navbar content goes here -->
          <div class="rounded-md bg-gray-100 drop-shadow dark:bg-gray-700 p-2">
            <NavBar />
          </div>
        </div>
      </Transition>

      <!-- Main content -->
      <div
        class="flex-1 mx-4 ml-4 overflow-hidden"
        @click="popMenuOpen = false"
      >
        <slot />
      </div>
    </div>

    <!-- Hamburger menu -->

    <!-- Mobile menu -->
    <Transition
      ><div
        v-if="popMenuOpen"
        class="absolute md:hidden w-64 right-4 rounded-xl p-4 mt-[4.5rem] bg-gray-200 dark:bg-gray-700 shadow-md dark:shadow-2xl z-2"
      >
        <NavBar :mobile="true" /></div
    ></Transition>
  </div>
</template>
