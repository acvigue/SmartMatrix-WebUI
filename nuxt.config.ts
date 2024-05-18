// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["@nuxt/ui-pro"],
  modules: ["@nuxtjs/supabase", "@nuxt/ui", "@nuxt/image"],
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
  css: ["assets/main.scss"],
});