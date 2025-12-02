import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { type NextRequest, NextResponse } from "next/server"

export async function requireAuth(req: NextRequest, requiredRole?: "admin" | "checker" | "user") {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (requiredRole && session.user.role !== "admin" && session.user.role !== requiredRole) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return { session, user: session.user }
}

export function withAuth(handler: Function, requiredRole?: "admin" | "checker" | "user") {
  return async (req: NextRequest, context?: any) => {
    const authResult = await requireAuth(req, requiredRole)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    return handler(req, context, authResult)
  }
}
