import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { hashIp } from '@/lib/security/ip-hash';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours session timeout
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'pdhpsyco_auth_secret_fallback',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        }

        const identifier = credentials.username.trim();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: identifier },
              { email: identifier.toLowerCase() },
            ],
          },
        });

        if (!user) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }

        if (!user.active) {
          throw new Error('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }

        // Update last login timestamp & log audit event
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN',
              entity: 'User',
              entityId: user.id,
              metadata: JSON.stringify({ username: user.username, role: user.role }),
              ipHash: hashIp('auth-login'),
            },
          });
        } catch (e) {
          // Ignore audit logging error on login
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).name = token.name as string;
      }
      return session;
    },
  },
};
