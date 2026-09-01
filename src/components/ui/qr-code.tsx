'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { Modal } from './modal';
import { Button } from './button';
import { Badge } from './badge';
import { QrCode, Download, Copy, Check, Printer, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormCode?: string;
}

export const FORM_QR_ITEMS = [
  {
    code: 'ALL',
    title: 'แบบประเมินทั้งหมด (หน้าหลัก)',
    path: '/screening',
    desc: 'รวมแบบประเมินทุกชุดสำหรับประชาชนทั่วไป',
    badge: 'รวมทุกฟอร์ม',
    color: 'teal',
  },
  {
    code: '2Q',
    title: 'แบบคัดกรองโรคซึมเศร้า (2Q)',
    path: '/screening?form=2Q',
    desc: 'คัดกรองความเสี่ยงภาวะซึมเศร้าเบื้องต้น 2 คำถาม',
    badge: 'แนะนำเริ่มต้น',
    color: 'teal',
  },
  {
    code: '9Q',
    title: 'แบบประเมินโรคซึมเศร้า (9Q)',
    path: '/screening?form=9Q',
    desc: 'ประเมินระดับความรุนแรงของโรคซึมเศร้า 9 คำถาม',
    badge: 'ละเอียด',
    color: 'teal',
  },
  {
    code: 'PHQ-A',
    title: 'แบบประเมินซึมเศร้าในวัยรุ่น (PHQ-A)',
    path: '/screening?form=PHQ-A',
    desc: 'สำหรับนักเรียน นักศึกษา และกลุ่มวัยรุ่น 9 คำถาม',
    badge: 'วัยรุ่น/นักเรียน',
    color: 'blue',
  },
  {
    code: 'AUDIT',
    title: 'แบบประเมินการดื่มสุรา (AUDIT)',
    path: '/screening?form=AUDIT',
    desc: 'สำรวจพฤติกรรมและความเสี่ยงจากการดื่มแอลกอฮอล์ 10 ข้อ',
    badge: 'สุรา/แอลกอฮอล์',
    color: 'amber',
  },
  {
    code: 'FTND',
    title: 'แบบประเมินการติดบุหรี่ (FTND)',
    path: '/screening?form=FTND',
    desc: 'วัดระดับการติดสารนิโคตินเพื่อวางแผนการเลิกบุหรี่ 6 ข้อ',
    badge: 'บุหรี่/นิโคติน',
    color: 'violet',
  },
  {
    code: 'ST-5',
    title: 'แบบประเมินความเครียด (ST-5)',
    path: '/screening?form=ST-5',
    desc: 'วัดระดับความเครียดสะสมจากการทำงานและชีวิตประจำวัน',
    badge: 'ความเครียด',
    color: 'cyan',
  },
  {
    code: '8Q',
    title: 'แบบประเมินการฆ่าตัวตาย (8Q)',
    path: '/screening?form=8Q',
    desc: 'ประเมินความเสี่ยงต่อการทำร้ายตนเองและฆ่าตัวตาย',
    badge: 'ช่วยเหลือด่วน',
    color: 'rose',
  },
];

export function QRCodeModal({ isOpen, onClose, initialFormCode = 'ALL' }: QRCodeModalProps) {
  const [selectedCode, setSelectedCode] = React.useState<string>(initialFormCode);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const selectedItem = FORM_QR_ITEMS.find((f) => f.code === selectedCode) || FORM_QR_ITEMS[0];

  const fullUrl = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${selectedItem.path}`;
    }
    return `https://pdhpsyco.pluakdaenghospital.cloud${selectedItem.path}`;
  }, [selectedItem]);

  React.useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Generation error:', err));
    }
  }, [fullUrl, isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      toast.success('คัดลอกลิงก์เรียบร้อยแล้ว');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `PDHPSYCO-QR-${selectedItem.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`ดาวน์โหลด QR Code สำหรับ ${selectedItem.title} เรียบร้อยแล้ว`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${selectedItem.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700&display=swap');
            body {
              font-family: 'Prompt', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
              text-align: center;
              background: #fff;
              color: #1e293b;
            }
            .poster-card {
              border: 3px solid #0d9488;
              border-radius: 24px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            .header-logo {
              font-size: 24px;
              font-weight: 700;
              color: #0f766e;
              margin-bottom: 4px;
            }
            .hospital-name {
              font-size: 16px;
              color: #64748b;
              margin-bottom: 24px;
            }
            .qr-wrapper {
              background: #f8fafc;
              border: 2px dashed #cbd5e1;
              border-radius: 20px;
              padding: 20px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
            }
            .form-title {
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 8px;
            }
            .form-desc {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 24px;
              line-height: 1.5;
            }
            .footer-info {
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
            }
            @media print {
              body { padding: 0; }
              .poster-card { border: 2px solid #0d9488; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            <div class="header-logo">PDHPSYCO | โรงพยาบาลปลวกแดง</div>
            <div class="hospital-name">ระบบคัดกรองและประเมินสุขภาพจิตออนไลน์</div>
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="form-title">${selectedItem.title}</div>
            <div class="form-desc">${selectedItem.desc}<br/>สแกนด้วยสมาร์ตโฟนเพื่อเริ่มทำแบบประเมินได้ทันที</div>
            <div class="footer-info">
              สายด่วนสุขภาพจิต 1323 | คลินิกจิตเวช รพ.ปลวกแดง โทร 033 650413 ต่อ 115
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code ทำแบบประเมินสุขภาพจิต"
      description="สแกนผ่านสมาร์ตโฟน หรือดาวน์โหลด/พิมพ์เพื่อเผยแพร่ตามจุดบริการ"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Form Selector Carousel / Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            เลือกแบบประเมินที่ต้องการสร้าง QR Code:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FORM_QR_ITEMS.map((item) => {
              const isSelected = selectedCode === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedCode(item.code)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 font-bold text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate font-semibold">{item.code}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
          <div className="flex flex-col items-center shrink-0">
            <div className="relative p-3.5 bg-white rounded-2xl shadow-md border border-slate-200/80">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${selectedItem.title}`}
                  className="h-44 w-44 rounded-lg object-contain"
                />
              ) : (
                <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  กำลังสร้าง QR Code...
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-600" />
              <span>สแกนด้วยกล้องมือถือหรือ LINE</span>
            </span>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-[10px] font-bold text-teal-800 dark:text-teal-300 mb-1">
                <span>{selectedItem.badge}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {selectedItem.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedItem.desc}
              </p>
            </div>

            {/* URL Input with Copy */}
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="bg-transparent flex-1 px-2 text-slate-600 dark:text-slate-300 outline-none text-[11px] truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950 transition-colors flex items-center gap-1 font-semibold text-[10px]"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="teal"
                size="sm"
                onClick={handleDownloadQR}
                className="rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>ดาวน์โหลดรูปภาพ</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>พิมพ์ป้ายโปสเตอร์</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Inline standalone QR code generator component for Result Page or Cards
 */
export function QRCodeDisplay({
  url,
  size = 160,
  label,
  subLabel,
}: {
  url: string;
  size?: number;
  label?: string;
  subLabel?: string;
}) {
  const [dataUrl, setDataUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        width: size * 2,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((res) => setDataUrl(res))
        .catch((err) => console.error(err));
    }
  }, [url, size]);

  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div
        className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center overflow-hidden"
        style={{ width: size + 20, height: size + 20 }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" style={{ width: size, height: size }} className="object-contain" />
        ) : (
          <div className="text-xs text-slate-400 animate-pulse">สร้าง QR Code...</div>
        )}
      </div>
      {label && <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>}
      {subLabel && <span className="text-[11px] text-slate-500">{subLabel}</span>}
    </div>
  );
}
