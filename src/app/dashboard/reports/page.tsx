'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  FileText,
  Printer,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsManagementPage() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [dateRange, setDateRange] = React.useState('month');

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch latest completed screening records
      const res = await fetch('/api/admin/screenings?limit=500');
      const data = await res.json();
      if (!data.success) throw new Error('ไม่สามารถดึงข้อมูลรายงานได้');

      const headers = ['Date', 'Token', 'Form', 'Score', 'RiskLevel', 'Age', 'Gender', 'District', 'Status'];
      const rows = data.data.items.map((item: any) => [
        new Date(item.createdAt).toISOString().split('T')[0],
        item.publicToken,
        item.formCode,
        item.totalScore,
        item.riskLevel,
        item.participant?.age || '',
        item.participant?.gender || '',
        item.participant?.district || '',
        item.status,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `PDHPSYCO_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('ดาวน์โหลดรายงาน CSV สำเร็จ');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการส่งออกรายงาน');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            รายงานและสถิติภาพรวม (Reports & Export)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สรุปข้อมูลสถิติการคัดกรองสุขภาพจิตและส่งออกรายงานสำหรับโรงพยาบาลปลวกแดง
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintReport}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>พิมพ์รายงาน / PDF</span>
          </Button>

          <Button
            variant="teal"
            size="sm"
            isLoading={isExporting}
            onClick={handleExportCSV}
            className="rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ส่งออกเป็น CSV / Excel</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-teal-100 dark:border-teal-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <Badge variant="low">พร้อมส่งออก</Badge>
            </div>
            <CardTitle className="text-lg mt-2">รายงานการคัดกรองรายวัน/รายเดือน</CardTitle>
            <CardDescription className="text-xs">
              สรุปจำนวนคัดกรอง จำแนกตามแบบประเมิน (2Q, 9Q, ST-5, 8Q) และระดับความเสี่ยง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full text-xs">
              ดาวน์โหลดรายงาน (.CSV)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 dark:border-cyan-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <TableIcon className="h-5 w-5" />
              </span>
              <Badge variant="moderate">สถิติพื้นที่</Badge>
            </div>
            <CardTitle className="text-lg mt-2">รายงานจำแนกตามตำบล</CardTitle>
            <CardDescription className="text-xs">
              สถิติกลุ่มเสี่ยงสุขภาพจิตแยกตาม 6 ตำบลใน อ.ปลวกแดง จ.ระยอง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full text-xs">
              ดาวน์โหลดรายงานพื้นที่ (.CSV)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-rose-100 dark:border-rose-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <FileText className="h-5 w-5" />
              </span>
              <Badge variant="urgent">เคสติดตาม</Badge>
            </div>
            <CardTitle className="text-lg mt-2">รายงานการติดตามและส่งต่อแพทย์</CardTitle>
            <CardDescription className="text-xs">
              รายงานผลการประสานงาน ติดตาม และส่งต่อเคสความเสี่ยงสูงสู่คลินิกจิตเวช
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full text-xs">
              ดาวน์โหลดรายงานส่งต่อ (.CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
