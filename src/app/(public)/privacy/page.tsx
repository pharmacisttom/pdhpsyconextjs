import * as React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1">
        <div className="space-y-4 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/80 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="h-4 w-4" />
            <span>PDPA & Healthcare Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            นโยบายความเป็นส่วนตัวและคุ้มครองข้อมูลสุขภาพ
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            โรงพยาบาลปลวกแดง ให้ความสำคัญสูงสุดกับความปลอดภัยและการรักษาความลับของข้อมูลสุขภาพจิตของท่าน
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="rounded-xl bg-teal-100 dark:bg-teal-950 p-2 text-teal-700 dark:text-teal-300">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">1. การเข้ารหัสข้อมูลความปลอดภัยขั้นสูง (AES-256-GCM)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                ข้อมูลระบุตัวตน (Personally Identifiable Information - PII) เช่น เลขบัตรประชาชน ชื่อ-นามสกุล และเบอร์โทรศัพท์
                จะได้รับการเข้ารหัสด้วยอัลกอริทึมมาตรฐานความปลอดภัยสากล <strong>AES-256-GCM</strong> ทันทีที่บันทึกลงฐานข้อมูล
              </p>
              <p>
                ไม่มีการบันทึกหมายเลข IP Address หรือข้อมูลส่วนบุคคลใดๆ ใน Application Log หรือ Console ของระบบ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="rounded-xl bg-cyan-100 dark:bg-cyan-950 p-2 text-cyan-700 dark:text-cyan-300">
                <EyeOff className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">2. สิทธิในการทำแบบประเมินนิรนาม (Anonymous Screening)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                ประชาชนสามารถเลือกที่จะไม่ระบุตัวตน (ไม่กรอกเลขบัตรประชาชนและชื่อ) เพื่อทำแบบประเมินและดูผลลัพธ์ผ่าน Public Token ชั่วคราวได้
              </p>
              <p>
                ในหน้าผลการประเมินจะแสดงเฉพาะระดับความเสี่ยงและคำแนะนำทางการแพทย์ โดยไม่มีการเปิดเผยข้อมูลส่วนบุคคลต่อสาธารณะ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-950 p-2 text-blue-700 dark:text-blue-300">
                <Server className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">3. วัตถุประสงค์การใช้ข้อมูลและการติดตามผล</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                ข้อมูลผลการประเมินจะถูกนำไปใช้เพื่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>ประเมินและให้คำแนะนำเบื้องต้นแก่ผู้รับบริการ</li>
                <li>ประสานงานช่วยเหลือโดยทีมแพทย์/พยาบาลคลินิกสุขภาพจิต รพ.ปลวกแดง กรณีผลการประเมินมีความเสี่ยงสูงหรือวิกฤต</li>
                <li>วิเคราะห์ข้อมูลสถิติภาพรวมเพื่อพัฒนาระบบบริการสาธารณสุขของอำเภอปลวกแดง</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="rounded-xl bg-purple-100 dark:bg-purple-950 p-2 text-purple-700 dark:text-purple-300">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">4. สิทธิของเจ้าของข้อมูลส่วนบุคคล</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่านได้ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                โดยติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) โรงพยาบาลปลวกแดง
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
