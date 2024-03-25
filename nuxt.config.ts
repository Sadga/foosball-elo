import { resolve } from 'node:path';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  devServer: { host: '0.0.0.0' },
  modules: ['@hebilicious/authjs-nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },
  runtimeConfig: {
    authJs: {
      secret: process.env.NUXT_NEXTAUTH_SECRET // You can generate one with `openssl rand -base64 32`
    },
    google: {
      clientId: process.env.NUXT_NEXTAUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NUXT_NEXTAUTH_GOOGLE_CLIENT_SECRET
    },
    public: {
      authJs: {
        baseUrl: process.env.NUXT_NEXTAUTH_URL, // The URL of your deployed app (used for origin Check in production)
        verifyClientOnEveryRequest: true // whether to hit the /auth/session endpoint on every client request
      }
    }
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie')
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
    }
  }
});
