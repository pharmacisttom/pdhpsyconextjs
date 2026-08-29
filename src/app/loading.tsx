import * as React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute animate-ping h-full w-full rounded-full bg-teal-400 opacity-20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            กำลังโหลดข้อมูล PDHPSYCO...
          </h3>
          <p className="text-xs text-slate-500">โรงพยาบาลปลวกแดง</p>
        </div>
      </div>
    </div>
  );
}
