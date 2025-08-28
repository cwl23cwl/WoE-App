// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TEMP: accept any email (replace with real check later)
        if (credentials?.email) {
          return {
            id: "user-1",
            name: "Demo User",
            email: credentials.email,
          };
        }
        return null;
      },
    }),
  ],
  debug: true,
});

export { handler as GET, handler as POST };
