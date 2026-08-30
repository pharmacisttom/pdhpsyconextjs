import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Building, Send, Globe, Shield, Phone, BellRing } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SystemSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
    redirect('/dashboard');
  }

  const settingsList = await prisma.systemSetting.findMany();
  const settingsMap = settingsList.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          ตั้งค่าระบบและช่องทางเชื่อมต่อ (System Settings)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          กำหนดข้อมูลหน่วยบริการ เบอร์ติดต่อฉุกเฉิน และการแจ้งเตือนเคสความเสี่ยงสูง
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hospital Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-4 w-4 text-teal-600" />
              <span>ข้อมูลโรงพยาบาลและหน่วยบริการ</span>
            </CardTitle>
            <CardDescription className="text-xs">
              ข้อมูลที่แสดงบนหน้าหลักและผลการประเมินประชาชน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">ชื่อโรงพยาบาล:</label>
              <input
                type="text"
                defaultValue={settingsMap['hospital_name'] || 'โรงพยาบาลปลวกแดง'}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">คำอธิบายสังกัด:</label>
              <input
                type="text"
                defaultValue={settingsMap['hospital_sub_title'] || 'Pluak Daeng Hospital - จังหวัดระยอง'}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">เบอร์คลินิกจิตเวช (Hospital Mental Health Clinic):</label>
              <input
                type="text"
                defaultValue={settingsMap['hospital_er_phone'] || '033 650413 ต่อ 115'}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification & Webhook Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-teal-600" />
              <span>การเชื่อมต่อแจ้งเตือน (Notifications & Webhooks)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              ระบบส่งแจ้งเตือนอัตโนมัติเมื่อพบเคสระดับ HIGH หรือ CRITICAL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Telegram Bot Alert</span>
                <Badge variant={process.env.TELEGRAM_BOT_TOKEN ? 'low' : 'secondary'}>
                  {process.env.TELEGRAM_BOT_TOKEN ? 'Active (Configured)' : 'Not Configured in .env'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                แจ้งเตือนกลุ่มเจ้าหน้าที่ผ่าน Telegram ทันทีที่มีการคัดกรองความเสี่ยงสูง
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">n8n Automation Webhook</span>
                <Badge variant={process.env.N8N_WEBHOOK_URL ? 'low' : 'secondary'}>
                  {process.env.N8N_WEBHOOK_URL ? 'Active (Configured)' : 'Not Configured in .env'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                ส่ง Payload เข้า Workflow อัตโนมัติ (เช่น แจ้ง LINE Notify หรือสร้าง Ticket)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Email (SMTP) Alert</span>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                ส่งอีเมลสรุปกรณีเคสวิกฤต (ตั้งค่าใน .env)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
