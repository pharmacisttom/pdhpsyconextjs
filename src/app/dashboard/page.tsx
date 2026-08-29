'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  Clock,
  RotateCcw,
  Calendar,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';

export default function DashboardOverviewPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setLastRefreshed(new Date());
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data?.kpis || {
    todayScreenings: 0,
    monthScreenings: 0,
    totalCompleted: 0,
    lowRiskCount: 0,
    moderateRiskCount: 0,
    highRiskCount: 0,
    criticalRiskCount: 0,
    pendingFollowUps: 0,
    overdueCases: 0,
  };

  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      {/* Header & Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            แดชบอร์ดภาพรวมสุขภาพจิต
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            โรงพยาบาลปลวกแดง • อัปเดตล่าสุด {lastRefreshed.toLocaleTimeString('th-TH')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>รีเฟรชข้อมูล</span>
          </Button>
        </div>
      </div>

      {/* 8 Healthcare KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Today */}
        <Card className="border-teal-100 dark:border-teal-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">คัดกรองวันนี้</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {kpis.todayScreenings}
            </p>
            <span className="text-[11px] text-teal-600 font-medium">รายการวันนี้</span>
          </CardContent>
        </Card>

        {/* KPI 2: This Month */}
        <Card className="border-cyan-100 dark:border-cyan-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">คัดกรองเดือนนี้</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {kpis.monthScreenings}
            </p>
            <span className="text-[11px] text-cyan-600 font-medium">สะสมประจำเดือน</span>
          </CardContent>
        </Card>

        {/* KPI 3: Low Risk */}
        <Card className="border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ความเสี่ยงต่ำ</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {kpis.lowRiskCount}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">สุขภาพจิตปกติ</span>
          </CardContent>
        </Card>

        {/* KPI 4: Moderate Risk */}
        <Card className="border-amber-100 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ความเสี่ยงปานกลาง</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
              {kpis.moderateRiskCount}
            </p>
            <span className="text-[11px] text-amber-600 font-medium">ควรติดตามอาการ</span>
          </CardContent>
        </Card>

        {/* KPI 5: High Risk */}
        <Card className="border-orange-100 dark:border-orange-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ความเสี่ยงสูง</span>
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-2">
              {kpis.highRiskCount}
            </p>
            <span className="text-[11px] text-orange-600 font-medium">ต้องการคำปรึกษา</span>
          </CardContent>
        </Card>

        {/* KPI 6: Critical Risk */}
        <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600">วิกฤต (Critical)</span>
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 animate-pulse">
                <HeartPulse className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
              {kpis.criticalRiskCount}
            </p>
            <span className="text-[11px] text-rose-600 font-bold">ส่งต่อแพทย์ด่วน</span>
          </CardContent>
        </Card>

        {/* KPI 7: Pending Follow-up */}
        <Card className="border-blue-100 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">เคสรอติดตาม</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
              {kpis.pendingFollowUps}
            </p>
            <span className="text-[11px] text-blue-600 font-medium">ในระบบ Kanban</span>
          </CardContent>
        </Card>

        {/* KPI 8: Overdue Cases */}
        <Card className="border-rose-100 dark:border-rose-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">เคสเกินกำหนด</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-300 mt-2">
              {kpis.overdueCases}
            </p>
            <span className="text-[11px] text-rose-600 font-medium">เลยวันนัดหมาย</span>
          </CardContent>
        </Card>
      </div>

      {/* 6 Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Screening Trend (14 days) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <span>1. แนวโน้มการคัดกรองรายวัน (14 วันล่าสุด)</span>
            </CardTitle>
            <CardDescription className="text-xs">จำนวนผู้ทำแบบคัดกรองแยกตามวัน</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.screeningTrend || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="จำนวนทั้งหมด"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Risk Distribution (Donut) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-teal-600" />
              <span>2. สัดส่วนระดับความเสี่ยง (Risk Distribution)</span>
            </CardTitle>
            <CardDescription className="text-xs">จำแนกตามระดับความเสี่ยงทางการแพทย์</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts.riskDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Screening by Form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-teal-600" />
              <span>3. สถิติการคัดกรองแยกตามแบบประเมิน</span>
            </CardTitle>
            <CardDescription className="text-xs">จำนวนครั้งที่ทำแบบประเมินแต่ละชนิด (2Q, 9Q, ST-5, 8Q)</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.screeningByForm || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="จำนวนผู้ทำแบบประเมิน" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Screening by Age Group */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>4. การคัดกรองจำแนกตามกลุ่มอายุ</span>
            </CardTitle>
            <CardDescription className="text-xs">สัดส่วนผู้เข้ารับการประเมินตามช่วงอายุ</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.screeningByAgeGroup || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="จำนวนคน" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Follow-up Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              <span>5. สถานะการติดตามเคสความเสี่ยงสูง</span>
            </CardTitle>
            <CardDescription className="text-xs">สถานะปัจจุบันของเคสในระบบติดตาม</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.followUpStatusData || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="จำนวนเคส" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Monthly Screening Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>6. แนวโน้มการประเมินรายเดือน (6 เดือนย้อนหลัง)</span>
            </CardTitle>
            <CardDescription className="text-xs">สถิติสะสมผู้รับบริการสุขภาพจิตรายเดือน</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="ยอดประเมินรวม"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
