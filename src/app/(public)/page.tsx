import * as React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HeartHandshake,
  ShieldCheck,
  Brain,
  Activity,
  SmilePlus,
  PhoneCall,
  Sparkles,
  ArrowRight,
  UserCheck,
  Lock,
  Clock,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-400/20 to-cyan-300/20 dark:from-teal-600/10 dark:to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white dark:bg-slate-900/90 pl-2 pr-4 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 shadow-sm">
              <div className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-teal-50">
                <img src="/pdhpsyco.png" alt="PDHPSYCO Logo" className="h-full w-full object-contain" />
              </div>
              <span>บริการคัดกรองสุขภาพจิตออนไลน์ โรงพยาบาลปลวกแดง</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              สำรวจสุขภาพใจของคุณ <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ปลอดภัย สะดวก เป็นความลับ
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              ระบบคัดกรองภาวะซึมเศร้า ความเครียด และความเสี่ยงต่อสุขภาพจิตเบื้องต้น
              ประเมินตนเองได้ฟรี ไม่จำเป็นต้องระบุตัวตน พร้อมคำแนะนำและระบบส่งต่อเพื่อรับการดูแลจากแพทย์
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/screening" className="w-full sm:w-auto">
                <Button
                  variant="teal"
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:scale-[1.02] transition-transform"
                >
                  <Activity className="h-5 w-5" />
                  <span>เริ่มทำแบบประเมินสุขภาพจิต</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/help" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto py-6 rounded-2xl flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <PhoneCall className="h-4 w-4 text-rose-500" />
                  <span>ขอความช่วยเหลือด่วน (1323)</span>
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-600" />
                <span>เข้ารหัสข้อมูลปลอดภัยสูงสุด</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-teal-600" />
                <span>ทำแบบนิรนามได้</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Forms Grid */}
      <section className="py-16 bg-white/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              แบบประเมินสุขภาพจิตมาตรฐาน
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              แบบคัดกรองมาตรฐานทางการแพทย์ของกรมสุขภาพจิต กระทรวงสาธารณสุข
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: 2Q & 9Q */}
            <Card className="hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-800 transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-xl bg-teal-100 dark:bg-teal-950 p-2.5 text-teal-700 dark:text-teal-300">
                    <Brain className="h-6 w-6" />
                  </span>
                  <Badge variant="low">ใช้เวลา 2-3 นาที</Badge>
                </div>
                <CardTitle className="text-xl font-bold">แบบคัดกรองโรคซึมเศร้า (2Q / 9Q)</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  ประเมินอารมณ์เศร้า ท้อแท้ ความรู้สึกหมดพลัง หรือความเบื่อหน่าย เพื่อตรวจหาความเสี่ยงภาวะซึมเศร้าในระยะเริ่มต้น
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/screening?form=2Q">
                  <Button variant="teal" className="w-full rounded-xl flex items-center justify-center gap-1.5">
                    <span>ทำแบบคัดกรอง 2Q</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: ST-5 */}
            <Card className="hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-800 transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-xl bg-cyan-100 dark:bg-cyan-950 p-2.5 text-cyan-700 dark:text-cyan-300">
                    <SmilePlus className="h-6 w-6" />
                  </span>
                  <Badge variant="moderate">ใช้เวลา 1-2 นาที</Badge>
                </div>
                <CardTitle className="text-xl font-bold">แบบประเมินความเครียด (ST-5)</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  วัดระดับความเครียดสะสมจากการทำงานและชีวิตประจำวัน พร้อมคำแนะนำเทคนิคผ่อนคลายความเครียดที่เหมาะสม
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/screening?form=ST-5">
                  <Button variant="outline" className="w-full rounded-xl hover:border-teal-500 hover:text-teal-600 flex items-center justify-center gap-1.5">
                    <span>ทำแบบประเมิน ST-5</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 3: 8Q Suicidal Risk */}
            <Card className="hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-300 flex flex-col justify-between border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-xl bg-rose-100 dark:bg-rose-950 p-2.5 text-rose-700 dark:text-rose-300">
                    <HeartHandshake className="h-6 w-6" />
                  </span>
                  <Badge variant="urgent">การดูแลพิเศษ</Badge>
                </div>
                <CardTitle className="text-xl font-bold text-rose-900 dark:text-rose-200">แบบประเมินการฆ่าตัวตาย (8Q)</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  สำหรับผู้ที่มีความคิดทำร้ายตนเองหรือมีความทุกข์ใจอย่างหนัก เพื่อให้ทีมแพทย์ รพ.ปลวกแดง สามารถเข้าช่วยเหลือได้อย่างทันท่วงที
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/screening?form=8Q">
                  <Button variant="danger" className="w-full rounded-xl flex items-center justify-center gap-1.5">
                    <span>ทำแบบประเมิน 8Q</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Crisis Help Banner */}
      <section className="py-12 bg-gradient-to-r from-teal-700 via-cyan-800 to-blue-900 text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <PhoneCall className="h-6 w-6 text-rose-300 animate-pulse" />
                <h3 className="text-2xl font-bold">ต้องการความช่วยเหลือด่วน หรือมีเรื่องทุกข์ใจ?</h3>
              </div>
              <p className="text-slate-200 text-sm sm:text-base max-w-xl">
                สายด่วนสุขภาพจิต กรมสุขภาพจิต พร้อมรับฟังและให้คำปรึกษาตลอด 24 ชั่วโมง โดยไม่มีค่าใช้จ่าย
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:1323"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-teal-900 px-6 py-4 font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg"
              >
                <PhoneCall className="h-5 w-5 text-rose-600" />
                <span>โทร 1323 (ฟรี 24 ชม.)</span>
              </a>
              <Link href="/help">
                <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 rounded-2xl py-4">
                  ดูช่องทางติดต่อทั้งหมด
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
