import * as React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneCall, MapPin, Clock, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

export default function HelpEmergencyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1">
        <div className="space-y-4 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/80 px-3.5 py-1 text-xs font-semibold text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="h-4 w-4" />
            <span>Crisis & Emergency Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            ช่องทางติดต่อและขอความช่วยเหลือฉุกเฉิน
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            หากคุณหรือคนใกล้ชิดกำลังเผชิญกับความทุกข์ใจอย่างหนัก มีความคิดทำร้ายตัวเอง หรือตกอยู่ในภาวะวิกฤต โปรดติดต่อขอความช่วยเหลือทันที
          </p>
        </div>

        {/* Emergency Hotlines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hotline 1: 1323 */}
          <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  สายด่วนสุขภาพจิต กรมสุขภาพจิต
                </span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-rose-700 dark:text-rose-300">
                1323
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                โทรฟรีตลอด 24 ชั่วโมง มีผู้เชี่ยวชาญให้คำปรึกษาปัญหาความเครียด ซึมเศร้า วิตกกังวล และปัญหาครอบครัว
              </p>
              <a href="tel:1323" className="block">
                <Button variant="danger" className="w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2">
                  <PhoneCall className="h-5 w-5" />
                  <span>โทรออก 1323 ทันที</span>
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Hotline 2: Pluak Daeng Hospital Clinic */}
          <Card className="border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  คลินิกจิตเวช รพ.ปลวกแดง
                </span>
                <span className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-bold">
                  วัน-เวลาราชการ
                </span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-teal-800 dark:text-teal-300">
                033 650413 ต่อ 115
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                คลินิกจิตเวช โรงพยาบาลปลวกแดง อ.ปลวกแดง จ.ระยอง หรือโทรสายด่วนหน่วยกู้ชีพฉุกเฉิน <strong>1669</strong>
              </p>
              <a href="tel:033650413,115" className="block">
                <Button variant="teal" className="w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2">
                  <PhoneCall className="h-5 w-5" />
                  <span>โทร คลินิกจิตเวช รพ.ปลวกแดง (033 650413 ต่อ 115)</span>
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Mental Health Clinic Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Heart className="h-5 w-5 text-teal-600" />
              <span>คลินิกสุขภาพจิตและยาเสพติด โรงพยาบาลปลวกแดง</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">วันและเวลาเปิดให้บริการ:</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    วันจันทร์ - วันศุกร์ เวลา 08.30 - 16.30 น. (เว้นวันหยุดราชการ)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">สถานที่ตั้ง:</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    อาคารผู้ป่วยนอก โรงพยาบาลปลวกแดง ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
