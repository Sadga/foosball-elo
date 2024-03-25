import type { AuthConfig } from '@auth/core/types';
import { prisma, getUserByName } from '../../../db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { NuxtAuthHandler } from '#auth';
import Google from '@auth/core/providers/google';
import CredentialsProvider from '@auth/core/providers/credentials';
import { encode, decode } from '@auth/core/jwt';

// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.

const runtimeConfig = useRuntimeConfig();

// Refer to Auth.js docs for more details
export const authOptions: AuthConfig = {
  secret: runtimeConfig.authJs.secret,
  providers: [
    Google({
      clientId: runtimeConfig.google.clientId,
      clientSecret: runtimeConfig.google.clientSecret
    }),
    CredentialsProvider({
      credentials: {
        name: { label: 'Name' }
      },
      async authorize (credentials) {
        return getUserByName(credentials.name);
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
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

export default NuxtAuthHandler(authOptions, runtimeConfig);
// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
