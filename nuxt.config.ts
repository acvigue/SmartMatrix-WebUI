// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@formkit/nuxt",
    "nuxt3-leaflet",
  ],
  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true,
  },
  supabase: {
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      exclude: ["/auth/*", "/api/*"],
      cookieRedirect: true,
    },
    cookieName: "smx.manager",
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: "strict",
      secure: true,
    },
  },
  css: [
    "vue-toast-notification/dist/theme-default.css",
    "assets/main.scss",
    "vue-final-modal/style.css",
    "leaflet/dist/leaflet.css",
  ],
});
