import withAuth from "next-auth/middleware";

const authMiddleware = withAuth({
  secret: process.env.NEXTAUTH_SECRET,
});

export default authMiddleware;
export const proxy = authMiddleware;

// Tentukan rute mana saja yang ingin diproteksi
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/tutorialDashboard/:path*"],
};
