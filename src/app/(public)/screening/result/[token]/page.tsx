import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreeningService } from '@/services/screening.service';
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Activity,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ResultPageProps {
  params: Promise<{ token: string }>;
}

export default async function ScreeningResultPage({ params }: ResultPageProps) {
  const { token } = await params;

  let resultData;
  try {
    resultData = await ScreeningService.getResultByToken(token);
  } catch (error) {
    notFound();
  }

  const {
    formTitle,
    formCode,
    totalScore,
    riskLevel,
    recommendation,
    completedAt,
    needsUrgentHelp,
    urgentGuidance,
  } = resultData;

  const riskBadgeConfig = {
    LOW: {
      label: 'ระดับความเสี่ยง: ต่ำ / ปกติ',
      badgeVariant: 'low' as const,
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    MODERATE: {
      label: 'ระดับความเสี่ยง: ปานกลาง',
      badgeVariant: 'moderate' as const,
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'ระดับความเสี่ยง: สูง',
      badgeVariant: 'high' as const,
      textColor: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'ระดับความเสี่ยง: วิกฤต / เร่งด่วน',
      badgeVariant: 'critical' as const,
      textColor: 'text-rose-700 dark:text-rose-300',
      bgColor: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      icon: AlertTriangle,
    },
  }[riskLevel] || {
    label: 'ระดับความเสี่ยง: ปกติ',
    badgeVariant: 'low' as const,
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  };

  const RiskIcon = riskBadgeConfig.icon;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <HeartPulse className="h-3.5 w-3.5" />
            <span>ผลการประเมินสุขภาพจิต โรงพยาบาลปลวกแดง</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formTitle}
          </h1>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              ประเมินเมื่อ {new Date(completedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
            </span>
          </p>
        </div>

        {/* Score & Risk Card */}
        <Card className={`overflow-hidden border-2 ${riskBadgeConfig.bgColor} shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md mb-2">
              <RiskIcon className={`h-8 w-8 ${riskBadgeConfig.textColor}`} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={riskBadgeConfig.badgeVariant} className="text-sm px-4 py-1">
                {riskBadgeConfig.label}
              </Badge>
            </div>
            <div className="mt-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">คะแนนรวมที่ได้</span>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {totalScore} <span className="text-sm font-normal text-slate-500">คะแนน</span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Clinical Recommendation */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>คำแนะนำทางการแพทย์สำหรับท่าน:</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {recommendation}
              </p>
            </div>

            {/* Action Items List */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                แนวทางปฏิบัติและการดูแลตนเอง:
              </h4>
              <ul className="space-y-2">
                {urgentGuidance.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* High / Critical Risk Urgent Assistance Box */}
        {needsUrgentHelp && (
          <Card className="border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-rose-800 dark:text-rose-300 text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600 animate-bounce" />
                <span>ต้องการความช่วยเหลือทันที หรือมีเรื่องทุกข์ใจอย่างหนัก</span>
              </CardTitle>
              <CardDescription className="text-rose-700/80 dark:text-rose-400 text-xs">
                ท่านสามารถติดต่อทีมแพทย์หรือหน่วยงานช่วยเหลือได้ตลอด 24 ชั่วโมง
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="tel:1323" className="block">
                  <Button variant="danger" className="w-full py-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    <span>โทรสายด่วน 1323 (ฟรี 24 ชม.)</span>
                  </Button>
                </a>
                <a href="tel:038659070" className="block">
                  <Button variant="teal" className="w-full py-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    <span>ห้องฉุกเฉิน รพ.ปลวกแดง</span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggested Next Steps / Next Assessments */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link href="/screening" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl flex items-center gap-2 text-xs">
              <RotateCcw className="h-4 w-4" />
              <span>ทำแบบประเมินอื่นเพิ่มเติม</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="teal" className="w-full sm:w-auto rounded-xl flex items-center gap-2 text-xs font-semibold">
              <span>กลับสู่หน้าหลัก รพ.ปลวกแดง</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
