'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="max-w-md w-full shadow-xl border-rose-200 dark:border-rose-900">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 mb-2">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            เกิดข้อผิดพลาดในการประมวลผล
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-0">
          <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/60 p-3 rounded-xl font-mono">
            {error?.message || 'Internal Server Error (500)'}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => reset()} className="rounded-xl flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>ลองใหม่อีกครั้ง</span>
          </Button>
          <Link href="/">
            <Button variant="teal" className="rounded-xl flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>หน้าหลัก</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
