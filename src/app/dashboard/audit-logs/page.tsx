import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Key, Clock, UserCheck, Lock } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
    redirect('/dashboard');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { fullName: true, username: true, role: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          บันทึกการตรวจสอบความปลอดภัย (Audit Logs)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          บันทึกประวัติการเข้าใช้งาน การเปิดดูข้อมูลส่วนบุคคล และการแก้ไขข้อมูลสำคัญในระบบ (100 รายการล่าสุด)
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-4">วัน / เวลา</th>
                <th className="p-4">ผู้ดำเนินการ</th>
                <th className="p-4">ประเภทกิจกรรม (Action)</th>
                <th className="p-4">Entity</th>
                <th className="p-4">IP Hash</th>
                <th className="p-4">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    ยังไม่มีบันทึก Audit Log ในระบบ
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionVariant = log.action.includes('PII')
                    ? 'urgent'
                    : log.action.includes('LOGIN')
                    ? 'low'
                    : log.action.includes('UPDATE')
                    ? 'high'
                    : 'default';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('th-TH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.user?.fullName || 'System / Anonymous'}
                        </span>
                        {log.user && (
                          <p className="text-[10px] text-teal-600 font-semibold">{log.user.role}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={actionVariant as any}>{log.action}</Badge>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {log.entity} {log.entityId ? `(#${log.entityId.substring(0, 8)})` : ''}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        {log.ipHash ? `${log.ipHash.substring(0, 12)}...` : '-'}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
