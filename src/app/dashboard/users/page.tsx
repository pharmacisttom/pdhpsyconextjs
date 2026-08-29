import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Shield, CheckCircle, XCircle, Key, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      active: true,
      lastLogin: true,
      createdAt: true,
      _count: { select: { assignedCases: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            จัดการผู้ใช้งานและสิทธิ์ (User & RBAC Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            กำหนดบทบาทหน้าที่และสิทธิ์การเข้าถึงระบบ PDHPSYCO ({users.length} ผู้ใช้งาน)
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-4">ผู้ใช้งาน</th>
                <th className="p-4">ชื่อผู้ใช้ / อีเมล</th>
                <th className="p-4">บทบาท (Role)</th>
                <th className="p-4">สถานะบัญชี</th>
                <th className="p-4">เข้าสู่ระบบล่าสุด</th>
                <th className="p-4">เคสที่รับผิดชอบ</th>
                <th className="p-4">วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const roleVariant = {
                  SUPER_ADMIN: 'urgent',
                  ADMIN: 'high',
                  STAFF: 'default',
                  VIEWER: 'secondary',
                }[u.role] || 'default';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 font-bold text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      <div>{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={roleVariant as any}>{u.role}</Badge>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{u.active ? 'เปิดใช้งาน' : 'ระงับ'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'ยังไม่เคยเข้าสู่ระบบ'}
                    </td>
                    <td className="p-4 font-bold text-teal-700 dark:text-teal-400">
                      {u._count.assignedCases} เคส
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
