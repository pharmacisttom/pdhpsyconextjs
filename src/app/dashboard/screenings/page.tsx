'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { QRCodeModal } from '@/components/ui/qr-code';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  EyeOff,
  RotateCcw,
  Calendar,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ScreeningsManagementPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 15, totalPages: 1, total: 0 });

  // Filter state
  const [searchToken, setSearchToken] = React.useState('');
  const [selectedForm, setSelectedForm] = React.useState('');
  const [selectedRisk, setSelectedRisk] = React.useState('');
  const [revealPII, setRevealPII] = React.useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);

  // Selected item modal state
  const [selectedScreening, setSelectedScreening] = React.useState<any | null>(null);

  const fetchScreenings = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedForm ? { formCode: selectedForm } : {}),
        ...(selectedRisk ? { riskLevel: selectedRisk } : {}),
        revealPII: revealPII ? 'true' : 'false',
      });

      const res = await fetch(`/api/admin/screenings?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setItems(result.data.items);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error?.message || 'ไม่สามารถโหลดรายการคัดกรองได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchScreenings(1);
  }, [selectedForm, selectedRisk, revealPII]);

  const filteredItems = items.filter((item) =>
    searchToken ? item.publicToken.toLowerCase().includes(searchToken.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            รายการผลการคัดกรองสุขภาพจิต
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            บันทึกการประเมินทั้งหมดในระบบ ({pagination.total} รายการ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsQRModalOpen(true)}
            className="rounded-xl text-xs flex items-center gap-1.5 shadow-sm font-semibold"
          >
            <QrCode className="h-4 w-4" />
            <span>สร้าง / พิมพ์ QR Code</span>
          </Button>

          <Button
            variant={revealPII ? 'danger' : 'outline'}
            size="sm"
            onClick={() => {
              setRevealPII(!revealPII);
              toast.info(revealPII ? 'ปิดการแสดงข้อมูลส่วนบุคคล' : 'เปิดการแสดงข้อมูลส่วนบุคคล (Audit Log ถูกบันทึก)');
            }}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            {revealPII ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{revealPII ? 'ซ่อนข้อมูล PII' : 'เปิดดูข้อมูล PII'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchScreenings(pagination.page)}
            isLoading={isLoading}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>รีเฟรช</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Token */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัส Token..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
              />
            </div>

            {/* Form Filter */}
            <div>
              <select
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- แบบประเมินทั้งหมด --</option>
                <option value="2Q">2Q (คัดกรองซึมเศร้า 2 ข้อ)</option>
                <option value="9Q">9Q (ประเมินซึมเศร้า 9 ข้อ)</option>
                <option value="PHQ-A">PHQ-A (ประเมินซึมเศร้าในวัยรุ่น)</option>
                <option value="AUDIT">AUDIT (ประเมินการดื่มสุรา 10 ข้อ)</option>
                <option value="FTND">FTND (ประเมินการติดบุหรี่ 6 ข้อ)</option>
                <option value="ST-5">ST-5 (ประเมินความเครียด)</option>
                <option value="8Q">8Q (ประเมินการฆ่าตัวตาย)</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
              >
                <option value="">-- ระดับความเสี่ยงทั้งหมด --</option>
                <option value="LOW">ความเสี่ยงต่ำ (LOW)</option>
                <option value="MODERATE">ความเสี่ยงปานกลาง (MODERATE)</option>
                <option value="HIGH">ความเสี่ยงสูง (HIGH)</option>
                <option value="CRITICAL">ความเสี่ยงวิกฤต (CRITICAL)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screenings DataTable */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-4">วันที่ / เวลา</th>
                <th className="p-4">รหัส Token</th>
                <th className="p-4">แบบประเมิน</th>
                <th className="p-4">ข้อมูลผู้รับบริการ</th>
                <th className="p-4">ตำบล</th>
                <th className="p-4">คะแนน</th>
                <th className="p-4">ระดับความเสี่ยง</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    กำลังโหลดข้อมูลการคัดกรอง...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    ไม่พบรายการคัดกรองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const riskVariant = {
                    LOW: 'low',
                    MODERATE: 'moderate',
                    HIGH: 'high',
                    CRITICAL: 'critical',
                  }[item.riskLevel as string] || 'default';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString('th-TH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.publicToken.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">{item.formCode}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.formTitle}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.participant?.name || 'ผู้ประเมินนิรนาม'}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {item.participant?.age ? `อายุ ${item.participant.age} ปี` : ''}{' '}
                          {item.participant?.educationLevel && item.participant.educationLevel !== 'ประชาชนทั่วไป'
                            ? `• ${item.participant.educationLevel}`
                            : ''}
                          {item.participant?.phone ? `• โทร ${item.participant.phone}` : ''}
                        </p>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {item.participant?.district || '-'}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {item.totalScore !== null ? `${item.totalScore} คะแนน` : '-'}
                      </td>
                      <td className="p-4">
                        {item.riskLevel ? (
                          <Badge variant={riskVariant as any}>{item.riskLevel}</Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedScreening(item)}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Eye className="h-4 w-4 text-teal-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดงหน้า {pagination.page} จากทั้งหมด {pagination.totalPages} หน้า
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => fetchScreenings(pagination.page - 1)}
              className="h-8 rounded-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>ก่อนหน้า</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => fetchScreenings(pagination.page + 1)}
              className="h-8 rounded-lg"
            >
              <span>ถัดไป</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Screening Detail Modal */}
      {selectedScreening && (
        <Modal
          isOpen={!!selectedScreening}
          onClose={() => setSelectedScreening(null)}
          title={`รายละเอียดผลการคัดกรอง: ${selectedScreening.formTitle}`}
          description={`Token: ${selectedScreening.publicToken}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-slate-400">ระดับความเสี่ยง:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {selectedScreening.riskLevel || 'ไม่มีข้อมูล'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">คะแนนรวม:</span>
                <p className="font-bold text-sm text-teal-600 dark:text-teal-400 mt-0.5">
                  {selectedScreening.totalScore} คะแนน
                </p>
              </div>
              <div>
                <span className="text-slate-400">วันที่ประเมิน:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {new Date(selectedScreening.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
              <div>
                <span className="text-slate-400">ตำบล:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedScreening.participant?.district || 'ไม่ระบุ'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1.5 border-slate-100 dark:border-slate-800">
                ข้อมูลผู้รับการประเมินรายบุคคล:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <p>1. ชื่อ-นามสกุล: <strong>{selectedScreening.participant?.name}</strong></p>
                <p>4. เลขบัตรประชาชน: <strong>{selectedScreening.participant?.citizenId}</strong></p>
                <p>2. วันเดือนปีเกิด: <strong>{selectedScreening.participant?.birthDate || '-'}</strong></p>
                <p>3. อายุ: <strong>{selectedScreening.participant?.age || '-'} ปี</strong> (เพศ: {selectedScreening.participant?.gender || '-'})</p>
                <p>6. เบอร์โทรศัพท์: <strong>{selectedScreening.participant?.phone}</strong></p>
                <p>7. ชั้นปีที่ศึกษา: <strong>{selectedScreening.participant?.educationLevel || '-'}</strong></p>
                <p>8. ห้อง / กลุ่มเรียน: <strong>{selectedScreening.participant?.educationRoom || '-'}</strong></p>
                <p className="sm:col-span-2">5. ที่อยู่ปัจจุบัน: <strong>{selectedScreening.participant?.address || '-'}</strong></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedScreening(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Generator Modal */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
}
