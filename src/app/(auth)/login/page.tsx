'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { HeartPulse, Lock, User, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        username: username.trim(),
        password,
      });

      if (res?.error) {
        toast.error(res.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      } else {
        toast.success('เข้าสู่ระบบสำเร็จ กำลังเข้าสู่แดชบอร์ด...');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/80 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/15 to-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับสู่หน้าหลักประชาชน</span>
        </Link>

        <Card className="shadow-2xl border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/25 mb-3">
              <HeartPulse className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              เข้าสู่ระบบเจ้าหน้าที่
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PDHPSYCO | ระบบคัดกรองสุขภาพจิต โรงพยาบาลปลวกแดง
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ชื่อผู้ใช้หรืออีเมล (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    required
                    placeholder="เช่น admin หรือ user@pdhpsyco.cloud"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    รหัสผ่าน (Password)
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="teal"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full py-6 rounded-2xl font-bold shadow-md shadow-teal-500/25"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  <span>เข้าสู่ระบบ</span>
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="pt-0 flex flex-col space-y-3 text-center border-t border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldAlert className="h-3.5 w-3.5 text-teal-600" />
              <span>ระบบมีการบันทึก Audit Log และการเข้าใช้งานทั้งหมด</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
