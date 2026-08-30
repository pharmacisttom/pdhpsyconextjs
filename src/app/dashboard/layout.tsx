'use client';

import * as React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 flex">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onOpenMobileMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <footer className="py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40">
          <p>© {new Date().getFullYear()} โรงพยาบาลปลวกแดง • พัฒนาโดย <span className="font-medium text-slate-700 dark:text-slate-300">ภก.จัตุพล กันทะมูล</span> • <span className="text-teal-600 dark:text-teal-400 font-medium">PDHPSYCO v1.0.0</span></p>
        </footer>
      </div>
    </div>
  );
}
