'use client';

import * as React from 'react';
import Link from 'next/link';
import { HeartPulse, ShieldCheck, PhoneCall, LogIn, Menu, X, Activity, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from '@/components/ui/qr-code';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-md shadow-teal-500/10 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/pdhpsyco.png" alt="PDHPSYCO Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  PDH<span className="text-teal-600 dark:text-teal-400">PSYCO</span>
                </span>
                <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                  รพ.ปลวกแดง
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                ระบบคัดกรองและดูแลสุขภาพจิต
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/screening"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              ทำแบบคัดกรอง
            </Link>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="text-sm font-medium text-teal-700 dark:text-teal-300 hover:text-teal-800 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800"
            >
              <QrCode className="h-4 w-4 text-teal-600" />
              <span>QR Code</span>
            </button>
            <Link
              href="/privacy"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              ความเป็นส่วนตัว
            </Link>
            <Link
              href="/help"
              className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5"
            >
              <PhoneCall className="h-4 w-4 animate-bounce" />
              ขอความช่วยเหลือฉุกเฉิน
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/screening">
              <Button variant="teal" size="sm" className="rounded-xl flex items-center gap-1.5 font-medium shadow-sm">
                <Activity className="h-4 w-4" />
                <span>เริ่มประเมินสุขภาพใจ</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-1.5 text-xs">
                <LogIn className="h-4 w-4" />
                <span>เจ้าหน้าที่</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="rounded-xl p-2 text-teal-700 bg-teal-50 dark:bg-teal-950 border border-teal-200"
              aria-label="QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="เปิดเมนู"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 pt-3 pb-6 space-y-3 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/screening"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ทำแบบคัดกรอง
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsQRModalOpen(true);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-base font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 flex items-center gap-2"
            >
              <QrCode className="h-5 w-5" />
              <span>สแกน QR Code แบบประเมิน</span>
            </button>
            <Link
              href="/privacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              นโยบายความเป็นส่วนตัว (PDPA)
            </Link>
            <Link
              href="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
            >
              สายด่วนช่วยเหลือฉุกเฉิน (1323)
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/screening" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="teal" className="w-full justify-center">
                  เริ่มประเมินสุขภาพใจ
                </Button>
              </Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  เข้าสู่ระบบเจ้าหน้าที่
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </>
  );
}
