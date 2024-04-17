export default defineEventHandler(async (event) => {
  return { ...event?.context?.cloudflare?.env, DATABASE: undefined, NUXT_GOOGLE_CLIENT_ID: 'TEST', NUXT_GOOGLE_CLIENT_SECRET: 'TEST', NUXT_NEXTAUTH_SECRET: 'TEST' };
});
