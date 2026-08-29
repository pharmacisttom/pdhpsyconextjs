import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="max-w-md w-full shadow-xl text-center border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-300 mb-3">
            <FileQuestion className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            404 - ไม่พบหน้าที่ต้องการ
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-2">
            หน้าที่ท่านกำลังค้นหาอาจถูกย้าย ลบ หรือไม่มีอยู่ในระบบ PDHPSYCO
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button variant="teal" className="rounded-xl flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>กลับสู่หน้าหลัก รพ.ปลวกแดง</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
