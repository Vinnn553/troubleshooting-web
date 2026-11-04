import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase, getServiceSupabase } from "@/lib/supabase"; // Gunakan client supabase

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        try {
          // 1. Ambil data user dari tabel 'users' di Supabase berdasarkan email
          // Tips: Gunakan getServiceSupabase() agar tidak terhalang oleh Row Level Security (RLS)
          const db = getServiceSupabase();
          
          const { data: user, error } = await db
            .from("users")
            .select("id, username, email, password")
            .eq("email", credentials.email.trim())
            .maybeSingle();

          if (error) {
            console.error("Gagal query tabel users di Supabase:", error);
            return null;
          }

          // Jika user tidak ditemukan
          if (!user) {
            return null;
          }

          // 2. Verifikasi password hash menggunakan bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // 3. Kembalikan data user untuk sesi JWT
          return {
            id: String(user.id),
            name: user.username,
            username: user.username,
            email: user.email,
          };
        } catch (error) {
          console.error("Kesalahan autentikasi:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };