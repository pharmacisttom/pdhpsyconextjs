'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  UserCheck,
  Plus,
  MessageSquare,
  Clock,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Send,
  User,
  Kanban,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLUMNS = [
  { id: 'NEW', title: 'เคสใหม่ (New)', color: 'border-t-blue-500', badgeVariant: 'default' },
  { id: 'CONTACTED', title: 'ติดต่อแล้ว (Contacted)', color: 'border-t-purple-500', badgeVariant: 'secondary' },
  { id: 'FOLLOWING', title: 'กำลังติดตาม (Following)', color: 'border-t-amber-500', badgeVariant: 'moderate' },
  { id: 'REFERRED', title: 'ส่งต่อแพทย์ (Referred)', color: 'border-t-rose-500', badgeVariant: 'high' },
  { id: 'CLOSED', title: 'ยุติการติดตาม (Closed)', color: 'border-t-emerald-500', badgeVariant: 'low' },
];

export default function FollowUpManagementPage() {
  const [cases, setCases] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');

  // Selected case modal state
  const [activeCase, setActiveCase] = React.useState<any | null>(null);
  const [newNote, setNewNote] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/follow-up');
      const result = await res.json();
      if (result.success) {
        setCases(result.data);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลเคสติดตามได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการโหลดเคสติดตาม');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCases();
  }, []);

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/follow-up/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`เปลี่ยนสถานะเคสเป็น ${newStatus} สำเร็จ`);
        fetchCases();
        if (activeCase && activeCase.id === caseId) {
          setActiveCase((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(result.error?.message || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  const handleAddNote = async () => {
    if (!activeCase || !newNote.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/follow-up/${activeCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('บันทึกความก้าวหน้าการติดตามเรียบร้อยแล้ว');
        setNewNote('');
        fetchCases();
        // Refresh active case
        setActiveCase((prev: any) => ({
          ...prev,
          notes: [
            {
              id: Date.now().toString(),
              note: newNote.trim(),
              createdAt: new Date().toISOString(),
              user: { fullName: 'เจ้าหน้าที่ปัจจุบัน' },
            },
            ...(prev?.notes || []),
          ],
        }));
      } else {
        toast.error(result.error?.message || 'ไม่สามารถเพิ่มบันทึกได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกโน้ต');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ระบบติดตามผู้รับบริการ (Follow-up Kanban)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เคสคัดกรองความเสี่ยงสูงและวิกฤตที่ต้องได้รับการดูแลต่อเนื่อง ({cases.length} เคส)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-white dark:bg-slate-900">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>ตาราง</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCases}
            isLoading={isLoading}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>รีเฟรช</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const columnCases = cases.filter((c) => c.status === col.id);
            return (
              <div
                key={col.id}
                className={`bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-3 border-t-4 ${col.color} border-slate-200/80 dark:border-slate-800 flex flex-col min-w-[240px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {col.title}
                  </span>
                  <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {columnCases.length}
                  </span>
                </div>

                {/* Case Cards List */}
                <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {columnCases.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      ไม่มีเคสในสถานะนี้
                    </div>
                  ) : (
                    columnCases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setActiveCase(c)}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer space-y-2 select-none"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={c.priority === 'URGENT' ? 'urgent' : c.priority === 'HIGH' ? 'high' : 'default'}>
                            {c.priority}
                          </Badge>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            {c.participantMasked?.name}
                          </p>
                          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                            {c.formCode} • {c.totalScore} คะแนน ({c.riskLevel})
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[120px]">
                            {c.participantMasked?.district || 'ไม่ระบุตำบล'}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MessageSquare className="h-3 w-3" />
                            {c.notesCount}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">วันที่รับเคส</th>
                  <th className="p-4">ผู้รับบริการ</th>
                  <th className="p-4">แบบประเมิน</th>
                  <th className="p-4">ความเสี่ยง / คะแนน</th>
                  <th className="p-4">ความเร่งด่วน</th>
                  <th className="p-4">สถานะปัจจุบัน</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {c.participantMasked?.name}
                    </td>
                    <td className="p-4 font-semibold text-teal-600">{c.formCode}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white">{c.totalScore} คะแนน</span> ({c.riskLevel})
                    </td>
                    <td className="p-4">
                      <Badge variant={c.priority === 'URGENT' ? 'urgent' : c.priority === 'HIGH' ? 'high' : 'default'}>
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setActiveCase(c)} className="h-8 text-xs">
                        ดูเคส
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Case Details & Timeline Modal */}
      {activeCase && (
        <Modal
          isOpen={!!activeCase}
          onClose={() => setActiveCase(null)}
          title={`บันทึกการติดตาม: ${activeCase.participantMasked?.name}`}
          description={`เคสคัดกรอง: ${activeCase.formTitle} (${activeCase.totalScore} คะแนน - ${activeCase.riskLevel})`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Status Selector Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">เปลี่ยนสถานะเคส:</span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleUpdateStatus(activeCase.id, col.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                      activeCase.status === col.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {col.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Demographics Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400">เลขบัตรประชาชน:</span>
                <p className="font-mono font-medium mt-0.5">{activeCase.participantMasked?.citizenId}</p>
              </div>
              <div>
                <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                <p className="font-mono font-medium mt-0.5">{activeCase.participantMasked?.phone}</p>
              </div>
              <div>
                <span className="text-slate-400">ตำบล:</span>
                <p className="font-medium mt-0.5">{activeCase.participantMasked?.district || 'ไม่ระบุ'}</p>
              </div>
            </div>

            {/* Add Follow-up Note Form */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                เพิ่มบันทึกผลการติดตาม / ประสานงานแพทย์:
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="เช่น โทรติดต่อญาติแล้ว ผู้ป่วยนัดพบแพทย์คลินิกจิตเวชวันที่..."
                  className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="teal"
                  size="sm"
                  isLoading={isUpdating}
                  onClick={handleAddNote}
                  className="rounded-xl flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>บันทึกโน้ตติดตาม</span>
                </Button>
              </div>
            </div>

            {/* Notes Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                ประวัติการติดตาม ({activeCase.notes?.length || 0} บันทึก):
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {!activeCase.notes || activeCase.notes.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">ยังไม่มีบันทึกการติดตามสำหรับเคสนี้</p>
                ) : (
                  activeCase.notes.map((n: any) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-teal-700 dark:text-teal-400">
                          {n.user?.fullName || 'เจ้าหน้าที่'}
                        </span>
                        <span>{new Date(n.createdAt).toLocaleString('th-TH')}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{n.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setActiveCase(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
