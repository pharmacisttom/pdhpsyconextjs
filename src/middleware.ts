import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role Guard: Only SUPER_ADMIN and ADMIN can access user management
    if (path.startsWith('/dashboard/users')) {
      if (token?.role !== 'SUPER_ADMIN' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Role Guard: Only SUPER_ADMIN can access settings and audit logs
    if (path.startsWith('/dashboard/settings') || path.startsWith('/dashboard/audit-logs')) {
      if (token?.role !== 'SUPER_ADMIN' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // VIEWER can only view dashboard, screenings, reports (read-only)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
