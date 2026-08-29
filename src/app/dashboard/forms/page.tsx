import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilePlus2, ListOrdered, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FormsManagementPage() {
  const forms = await prisma.screeningForm.findMany({
    include: {
      questions: {
        include: { options: true },
        orderBy: { questionOrder: 'asc' },
      },
      riskRules: {
        orderBy: { minScore: 'asc' },
      },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            จัดการแบบประเมินสุขภาพจิต (Dynamic Forms)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เครื่องมือสร้าง แก้ไข และกำหนดเกณฑ์ประเมินความเสี่ยงทางการแพทย์ ({forms.length} แบบประเมิน)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="overflow-hidden border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm">
                    {form.code}
                  </span>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      {form.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{form.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={form.status === 'ACTIVE' ? 'low' : 'secondary'}>
                    {form.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    ประเมินแล้ว {form._count.sessions} ครั้ง
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Questions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-teal-600" />
                  <span>รายการคำถามในแบบประเมิน ({form.questions.length} ข้อ)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 font-bold text-[10px]">
                          {q.questionOrder}
                        </span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{q.questionText}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-7">
                        {q.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                          >
                            {opt.label} ({opt.score} คะแนน)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Rules Thresholds */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-teal-600" />
                  <span>เกณฑ์การคำนวณและระดับความเสี่ยง (Risk Rules)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {form.riskRules.map((rule) => {
                    const variant = {
                      LOW: 'low',
                      MODERATE: 'moderate',
                      HIGH: 'high',
                      CRITICAL: 'critical',
                    }[rule.riskLevel] || 'default';

                    return (
                      <div
                        key={rule.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={variant as any}>{rule.riskLevel}</Badge>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {rule.minScore} - {rule.maxScore} คะแนน
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">{rule.recommendation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
