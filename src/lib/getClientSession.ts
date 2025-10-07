import { authClient } from "~/lib/auth-client"

export function getClientSession() {
  const session = authClient.useSession()
  return { session: session.data, isPending: session.isPending, error: session.error, refetch: session.refetch }
}