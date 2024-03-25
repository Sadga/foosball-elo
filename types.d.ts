declare module '@auth/core/types' {
  interface User {
    id: string
    name: string
    email: string
    image: string
  }

  interface Session {
    user: User
    expires: number
  }
}

export {};
