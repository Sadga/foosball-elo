import type { AuthConfig } from '@auth/core/types';
import { getDB, getUserByName } from '../../../db';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { NuxtAuthHandler } from '#auth';
import Google from '@auth/core/providers/google';
import CredentialsProvider from '@auth/core/providers/credentials';
import { encode, decode } from '@auth/core/jwt';

export function getAuthOptions (event): AuthConfig {
  const env = event?.context?.cloudflare?.env;
  if (!env) { throw new Error('Missing environment variables'); }

  return {
    secret: env.NUXT_NEXTAUTH_SECRET,
    providers: [
      Google({
        clientId: env.NUXT_GOOGLE_CLIENT_ID,
        clientSecret: env.NUXT_GOOGLE_CLIENT_SECRET
      }),
      // CredentialsProvider({
      //   credentials: {
      //     name: { label: 'Name' }
      //   },
      //   async authorize (credentials) {
      //     return getUserByName(event, credentials.name);
      //   }
      // })
    ],
    adapter: DrizzleAdapter(getDB(event)),
    callbacks: {
      session: async ({ session, token, user }) => {
        if (session?.user && (user?.id || token?.sub)) {
          session.user.id = user?.id || token?.sub;
        }
        return session;
      }
      // jwt: async ({ user, token }) => {
      //   if (user) {
      //     token.uid = user.id;
      //   }
      //   return token;
      // }
    },
    session: { strategy: 'jwt' },
    jwt: { encode, decode }
  };
}

export default defineEventHandler((event) => {
  return NuxtAuthHandler(getAuthOptions(event), {
    public: {
      authJs: {
        baseUrl: event?.context?.cloudflare?.env?.NUXT_NEXTAUTH_URL
      }
    }
  })(event).catch(() => { throw Error(event?.web?.url + ' -> ' + event?.context?.cloudflare?.env?.NUXT_NEXTAUTH_URL); });
});
