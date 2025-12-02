declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "admin" | "checker" | "user"
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "admin" | "checker" | "user"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "admin" | "checker" | "user"
  }
}
