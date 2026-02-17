import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith('/student') ||
        nextUrl.pathname.startsWith('/warden') ||
        nextUrl.pathname.startsWith('/admin');

      const role = auth?.user?.role as string | undefined;

      if (isOnDashboard) {
        if (isLoggedIn) {
          // Role-based protection
          if (nextUrl.pathname.startsWith('/admin') && role !== 'admin')
            return false;
          if (nextUrl.pathname.startsWith('/warden') && role !== 'warden')
            return false;
          if (nextUrl.pathname.startsWith('/student') && role !== 'student')
            return false;
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // If logged in and on login/home page, redirect to Dashboard
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/') {
          if (role === 'admin')
            return Response.redirect(new URL('/admin', nextUrl));
          if (role === 'warden')
            return Response.redirect(new URL('/warden', nextUrl));
          if (role === 'student')
            return Response.redirect(new URL('/student', nextUrl));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
