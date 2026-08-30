'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  HeartPulse,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  FilePlus2,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'STAFF';

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMIN' || isSuperAdmin;
  const isStaff = userRole === 'STAFF' || isAdmin;

  const navigation = [
    {
      name: 'แดชบอร์ดภาพรวม',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'รายการผลคัดกรอง',
      href: '/dashboard/screenings',
      icon: ClipboardList,
      show: true,
    },
    {
      name: 'ระบบติดตามเคส (Kanban)',
      href: '/dashboard/follow-up',
      icon: UserCheck,
      show: isStaff,
    },
    {
      name: 'จัดการแบบประเมิน',
      href: '/dashboard/forms',
      icon: FilePlus2,
      show: isAdmin,
    },
    {
      name: 'รายงานและสถิติ',
      href: '/dashboard/reports',
      icon: FileSpreadsheet,
      show: true,
    },
    {
      name: 'จัดการผู้ใช้งาน',
      href: '/dashboard/users',
      icon: Users,
      show: isAdmin,
    },
    {
      name: 'บันทึก Audit Logs',
      href: '/dashboard/audit-logs',
      icon: ShieldCheck,
      show: isAdmin,
    },
    {
      name: 'ตั้งค่าระบบ',
      href: '/dashboard/settings',
      icon: Settings,
      show: isAdmin,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex h-18 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  PDH<span className="text-teal-600 dark:text-teal-400">PSYCO</span>
                </span>
                <span className="rounded bg-teal-50 text-[10px] font-bold text-teal-700 px-1 py-0.2 border border-teal-200">
                  Staff
                </span>
              </div>
              <p className="text-[11px] text-slate-500">รพ.ปลวกแดง จ.ระยอง</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navigation
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-80" />}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {session?.user?.name || 'ผู้ใช้งาน'}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">
                {userRole}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ออกจากระบบ</span>
          </button>
          <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 text-center">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              PDHPSYCO <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">v1.0.0</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              พัฒนาโดย ภก.จัตุพล กันทะมูล
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
