import nextAuthMiddleware from "next-auth/middleware";

const withAuth =
  typeof nextAuthMiddleware === "function"
    ? nextAuthMiddleware
    : nextAuthMiddleware.default;
const authMiddleware = withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL,
});

export default authMiddleware;
export const proxy = authMiddleware;

// Tentukan rute mana saja yang ingin diproteksi
export const config = {
  matcher: ["/dashboard/:path*", "/tutorialDashboard/:path*"],
};
