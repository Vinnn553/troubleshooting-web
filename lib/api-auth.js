import { getToken } from "next-auth/jwt";

export async function isAuthenticatedRequest(request) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET wajib dikonfigurasi.");
  }

  const token = await getToken({ req: request, secret });
  return Boolean(token?.id);
}
