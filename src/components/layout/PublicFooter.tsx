import * as React from 'react';
import Link from 'next/link';
import { HeartPulse, Phone, MapPin, ShieldAlert, Clock } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200/70 dark:border-slate-700 shadow-sm overflow-hidden">
                <img src="/pdhpsyco.png" alt="PDHPSYCO Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                PDHPSYCO | โรงพยาบาลปลวกแดง
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              ระบบคัดกรองและเฝ้าระวังสุขภาพจิต โรงพยาบาลปลวกแดง จังหวัดระยอง
              เพื่อส่งเสริมการเข้าถึงการประเมินภาวะสุขภาพจิตเบื้องต้นอย่างปลอดภัย มั่นใจในความเป็นส่วนตัว
              และได้รับการช่วยเหลืออย่างทันท่วงที
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldAlert className="h-4 w-4 text-teal-600" />
              <span>คุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติ PDPA พ.ศ. 2562</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              เมนูลัด
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/screening?form=2Q" className="hover:text-teal-600 transition-colors">
                  แบบคัดกรองซึมเศร้า (2Q/9Q)
                </Link>
              </li>
              <li>
                <Link href="/screening?form=PHQ-A" className="hover:text-teal-600 transition-colors">
                  แบบประเมินซึมเศร้าในวัยรุ่น (PHQ-A)
                </Link>
              </li>
              <li>
                <Link href="/screening?form=AUDIT" className="hover:text-teal-600 transition-colors">
                  แบบประเมินการดื่มสุรา (AUDIT)
                </Link>
              </li>
              <li>
                <Link href="/screening?form=FTND" className="hover:text-teal-600 transition-colors">
                  แบบประเมินการติดบุหรี่ (FTND)
                </Link>
              </li>
              <li>
                <Link href="/screening?form=ST-5" className="hover:text-teal-600 transition-colors">
                  แบบประเมินความเครียด (ST-5)
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-teal-600 transition-colors text-rose-500 font-medium">
                  ขอความช่วยเหลือฉุกเฉิน (1323)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              สายด่วนสุขภาพใจ
            </h4>
            <div className="rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 p-3.5 border border-rose-100 dark:border-rose-900/50 space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-rose-700 dark:text-rose-300 text-lg">1323</span>
                <span className="text-xs text-rose-600 dark:text-rose-400 pt-1">
                  สายด่วนสุขภาพจิต (โทรฟรี 24 ชม.)
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-rose-200/60 dark:border-rose-900/60">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  คลินิกจิตเวช รพ.ปลวกแดง:
                </p>
                <p className="text-teal-700 dark:text-teal-400 font-semibold">033 650413 ต่อ 115 (หรือ 1669)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} โรงพยาบาลปลวกแดง (Pluak Daeng Hospital). สงวนลิขสิทธิ์ทุกประการ.</p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <p className="font-medium text-slate-600 dark:text-slate-300">
              พัฒนาโดย <span className="text-teal-600 dark:text-teal-400 font-semibold">ภก.จัตุพล กันทะมูล</span> <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 dark:border-slate-700 ml-1">v1.0.0</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              PDPA Policy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:underline">
              Emergency Help
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:underline">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
