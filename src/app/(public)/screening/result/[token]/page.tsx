import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeDisplay } from '@/components/ui/qr-code';
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
  QrCode,
  Brain,
  SmilePlus,
  Wine,
  User,
  School,
  Flame,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ResultPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ bundle?: string }>;
}

export default async function ScreeningResultPage({ params, searchParams }: ResultPageProps) {
  const { token } = await params;
  const { bundle } = await searchParams;

  const bundleTokens = bundle ? bundle.split(',').filter(Boolean) : [];
  const isBundle = bundleTokens.length > 1;

  let bundleData: any = null;
  let singleData: any = null;

  if (isBundle) {
    try {
      bundleData = await ScreeningService.getBundleResults(bundleTokens);
    } catch (e) {
      // Fallback to single token if bundle fetch fails
      try {
        singleData = await ScreeningService.getResultByToken(token);
      } catch (err) {
        notFound();
      }
    }
  } else {
    try {
      singleData = await ScreeningService.getResultByToken(token);
    } catch (err) {
      notFound();
    }
  }

  const effectiveRiskLevel = isBundle && bundleData ? bundleData.overallRiskLevel : singleData?.riskLevel || 'LOW';
  const effectiveUrgentHelp = isBundle && bundleData ? bundleData.needsUrgentHelp : singleData?.needsUrgentHelp || false;
  const effectiveUrgentGuidance = isBundle && bundleData ? bundleData.urgentGuidance : singleData?.urgentGuidance || [];

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
  }[effectiveRiskLevel as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'] || {
    label: 'ระดับความเสี่ยง: ปกติ',
    badgeVariant: 'low' as const,
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  };

  const RiskIcon = riskBadgeConfig.icon;

  const currentUrl = `https://pdhpsyco.pluakdaenghospital.cloud/screening/result/${token}${
    bundle ? `?bundle=${encodeURIComponent(bundle)}` : ''
  }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      {/* Top Emergency Hotline Banner (ข้อ ③) */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white py-2.5 px-4 text-xs">
        <div className="container max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ช่องทางติดต่อช่วยเหลือฉุกเฉิน โรงพยาบาลปลวกแดง:</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap font-semibold">
            <a href="tel:1323" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
              <span>สายด่วน 1323 (ฟรี 24 ชม.)</span>
            </a>
            <a href="tel:1669" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
              <span>ฉุกเฉิน 1669</span>
            </a>
            <a href="tel:033650413,115" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
              <span>รพ.ปลวกแดง 033 650413 ต่อ 115</span>
            </a>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <HeartPulse className="h-3.5 w-3.5" />
            <span>
              {isBundle ? 'รายงานสรุปผลการคัดกรองสุขภาพจิตแบบองค์รวม' : 'ผลการประเมินสุขภาพจิต โรงพยาบาลปลวกแดง'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isBundle ? 'ผลการประเมินสุขภาพจิตและพฤติกรรมเสี่ยง' : singleData?.formTitle}
          </h1>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              ประเมินเมื่อ{' '}
              {new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
            </span>
          </p>
        </div>

        {/* Overall Score / Risk Banner */}
        <Card className={`overflow-hidden border-2 ${riskBadgeConfig.bgColor} shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md mb-2">
              <RiskIcon className={`h-8 w-8 ${riskBadgeConfig.textColor}`} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={riskBadgeConfig.badgeVariant} className="text-sm px-4 py-1 font-bold">
                {riskBadgeConfig.label}
              </Badge>
            </div>
            {!isBundle && singleData && (
              <div className="mt-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">คะแนนรวมที่ได้</span>
                <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                  {singleData.totalScore} <span className="text-sm font-normal text-slate-500">คะแนน</span>
                </p>
              </div>
            )}
            {isBundle && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                ประเมินครบทุกมิติตามเกณฑ์: คัดกรองโรคซึมเศร้า, ภาวะความเครียด (ST-5) และพฤติกรรมเสี่ยงสุรา/บุหรี่
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Participant Profile Badge (if available in bundle) */}
            {isBundle && bundleData?.participant && (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4 text-teal-600" />
                  <span>
                    อายุ: <strong>{bundleData.participant.age ? `${bundleData.participant.age} ปี` : 'ไม่ระบุ'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    เพศ: <strong>{bundleData.participant.gender === 'male' ? 'ชาย' : bundleData.participant.gender === 'female' ? 'หญิง' : 'อื่นๆ'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    ตำบล: <strong>{bundleData.participant.district || 'ปลวกแดง'}</strong>
                  </span>
                </div>
                {bundleData.participant.educationLevel && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <School className="h-4 w-4 text-blue-500" />
                    <span>
                      {bundleData.participant.educationLevel}{' '}
                      {bundleData.participant.educationRoom ? `(${bundleData.participant.educationRoom})` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* If Single: Display single recommendation */}
            {!isBundle && singleData && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span>คำแนะนำทางการแพทย์สำหรับท่าน:</span>
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {singleData.recommendation}
                </p>
              </div>
            )}

            {/* Action Items List */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                แนวทางปฏิบัติและการดูแลตนเอง:
              </h4>
              <ul className="space-y-2">
                {effectiveUrgentGuidance.map((guide: string, idx: number) => (
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

        {/* If Bundle: Multi-Card Breakdown of Each Component */}
        {isBundle && bundleData && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              <span>สรุปผลการประเมินแยกรายหมวดหมู่:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundleData.results.map((r: any) => {
                const isCritical = r.riskLevel === 'CRITICAL';
                const isHigh = r.riskLevel === 'HIGH';
                const isModerate = r.riskLevel === 'MODERATE';

                const badgeVariant = isCritical
                  ? 'critical'
                  : isHigh
                  ? 'high'
                  : isModerate
                  ? 'moderate'
                  : 'low';

                const cardBorder = isCritical
                  ? 'border-rose-300 dark:border-rose-900'
                  : isHigh
                  ? 'border-orange-300 dark:border-orange-900'
                  : isModerate
                  ? 'border-amber-300 dark:border-amber-900'
                  : 'border-slate-200 dark:border-slate-800';

                // Choose icon based on formCode
                let IconComp = Brain;
                if (r.formCode === 'ST-5') IconComp = SmilePlus;
                if (r.formCode === 'AUDIT') IconComp = Wine;
                if (r.formCode === 'FTND') IconComp = Flame;
                if (r.formCode === '8Q') IconComp = AlertTriangle;

                return (
                  <Card key={r.publicToken} className={`border ${cardBorder} shadow-sm bg-white dark:bg-slate-900`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            <IconComp className="h-4 w-4" />
                          </span>
                          <div>
                            <CardTitle className="text-sm font-bold">{r.formTitle}</CardTitle>
                            <span className="text-[11px] text-slate-400 font-mono">รหัส: {r.formCode}</span>
                          </div>
                        </div>
                        <Badge variant={badgeVariant as any} className="text-xs">
                          {r.totalScore} คะแนน
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-1">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {r.recommendation}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* High / Critical Risk Urgent Assistance Box */}
        {effectiveUrgentHelp && (
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
                <a href="tel:033650413,115" className="block">
                  <Button variant="teal" className="w-full py-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    <span>คลินิกจิตเวช รพ.ปลวกแดง (033 650413 ต่อ 115)</span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code for Showing Result to Healthcare Providers */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                <QrCode className="h-3.5 w-3.5" />
                <span>รหัสบันทึกผลการประเมิน</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                QR Code สำหรับแสดงผลต่อเจ้าหน้าที่ / พยาบาล / แพทย์
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ท่านสามารถบันทึกภาพหน้าจอนี้ หรือแสดง QR Code ต่อเจ้าหน้าที่พยาบาลและแพทย์ คลินิกจิตเวช รพ.ปลวกแดง เพื่อดึงข้อมูลผลการประเมินได้อย่างรวดเร็วและเป็นความลับ
              </p>
              <div className="pt-1">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  Token: {token}
                </span>
              </div>
            </div>
            <div className="shrink-0 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <QRCodeDisplay
                url={currentUrl}
                size={140}
                label="สแกนเพื่อเปิดผลตรวจ"
                subLabel="รพ.ปลวกแดง"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link href="/screening" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl flex items-center gap-2 text-xs">
              <RotateCcw className="h-4 w-4" />
              <span>ทำแบบประเมินใหม่อีกครั้ง</span>
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
