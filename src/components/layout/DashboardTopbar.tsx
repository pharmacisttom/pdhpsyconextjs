'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, Bell, Shield, User, ExternalLink, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function DashboardTopbar({ onOpenMobileMenu }: TopbarProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'STAFF';

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            ระบบบริการสุขภาพจิต รพ.ปลวกแดง
          </span>
          <span>/</span>
          <span className="text-teal-600 font-medium">ศูนย์ควบคุมและบริหารจัดการ</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <span>เปิดหน้าประชาชน</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Role Badge */}
        <Badge variant={userRole === 'SUPER_ADMIN' ? 'urgent' : userRole === 'ADMIN' ? 'high' : 'default'}>
          <Shield className="h-3 w-3 mr-1 inline" />
          <span>{userRole}</span>
        </Badge>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs">
            {session?.user?.name ? session.user.name.charAt(0) : <User className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}
