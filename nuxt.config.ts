import { resolve } from 'node:path';

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  devServer: { host: '0.0.0.0' },
  modules: ['@hebilicious/authjs-nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/i18n', 'nitro-cloudflare-dev'],
  nitro: {
    preset: 'cloudflare-pages',
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    prerender: {
      autoSubfolderIndex: false
    }
  },
  runtimeConfig: {},
  authJs: {
    baseUrl: 'https://foosball.ale.blue'
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie')
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
    }
  }
});
