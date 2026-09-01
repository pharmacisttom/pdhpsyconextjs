'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  score: number;
  order: number;
}

interface Question {
  id: string;
  questionOrder: number;
  questionText: string;
  questionType: string;
  required: boolean;
  options: QuestionOption[];
}

interface FormMetadata {
  id: string;
  code: string;
  title: string;
  description: string | null;
  version: number;
  questions: Question[];
}

export default function ScreeningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFormCode = searchParams.get('form') || '2Q';

  // Wizard state
  const [selectedFormCode, setSelectedFormCode] = React.useState<string>(requestedFormCode);
  const [step, setStep] = React.useState<'consent' | 'questions' | 'submitting'>('consent');
  const [formData, setFormData] = React.useState<FormMetadata | null>(null);
  const [publicToken, setPublicToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Participant Demographic state (Individual Assessment)
  const [consent, setConsent] = React.useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = React.useState<boolean>(false);
  const [citizenId, setCitizenId] = React.useState<string>('');
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [birthDate, setBirthDate] = React.useState<string>('');
  const [age, setAge] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('');
  const [educationLevel, setEducationLevel] = React.useState<string>('ประชาชนทั่วไป');
  const [educationRoom, setEducationRoom] = React.useState<string>('');
  const [gender, setGender] = React.useState<string>('unspecified');
  const [district, setDistrict] = React.useState<string>('ปลวกแดง');

  // Question Stepper state
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<number>(0);
  const [answers, setAnswers] = React.useState<Record<string, { optionId?: string; score: number; answerValue?: string }>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [is2QTransitionModalOpen, setIs2QTransitionModalOpen] = React.useState<boolean>(false);
  const [completed2QToken, setCompleted2QToken] = React.useState<string | null>(null);
  const [completed2QScore, setCompleted2QScore] = React.useState<number>(0);

  // Pluak Daeng Sub-districts
  const districts = ['ปลวกแดง', 'ตาสิทธิ์', 'ละหาร', 'แม่น้ำคู้', 'มาบยางพร', 'หนองไร่', 'นอกพื้นที่'];

  // Education Level Options
  const educationLevels = [
    'ประถมศึกษา',
    'มัธยมศึกษาปีที่ 1 (ม.1)',
    'มัธยมศึกษาปีที่ 2 (ม.2)',
    'มัธยมศึกษาปีที่ 3 (ม.3)',
    'มัธยมศึกษาปีที่ 4 (ม.4)',
    'มัธยมศึกษาปีที่ 5 (ม.5)',
    'มัธยมศึกษาปีที่ 6 (ม.6)',
    'ประกาศนียบัตรวิชาชีพ (ปวช.)',
    'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',
    'ปริญญาตรี / อุดมศึกษา',
    'ประชาชนทั่วไป',
    'อื่นๆ',
  ];

  // Auto calculate age from birthDate
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const birth = new Date(val);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 130) {
          setAge(calculatedAge.toString());
        }
      }
    }
  };

  // Start screening session
  const handleStartScreening = async (overrideFormCode?: string | React.MouseEvent) => {
    if (!consent) {
      toast.error('กรุณายินยอมตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อทำแบบประเมิน');
      return;
    }

    setIsLoading(true);
    try {
      const targetFormCode = typeof overrideFormCode === 'string' ? overrideFormCode : selectedFormCode;
      const payload: any = {
        formCode: targetFormCode,
        participant: {
          consent: true,
          gender,
          district,
          age: age ? parseInt(age, 10) : null,
          ...(!isAnonymous
            ? {
                citizenId: citizenId.trim() || undefined,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                phone: phone.trim() || undefined,
                birthDate: birthDate.trim() || undefined,
                address: address.trim() || undefined,
                educationLevel: educationLevel || undefined,
                educationRoom: educationRoom.trim() || undefined,
              }
            : {}),
        },
      };

      const res = await fetch('/api/screenings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'ไม่สามารถเริ่มทำแบบประเมินได้');
      }

      setFormData(data.data.form);
      setPublicToken(data.data.publicToken);
      setSelectedFormCode(targetFormCode);
      setStep('questions');
      setCurrentQuestionIndex(0);
      setAnswers({});
      toast.success(`เริ่มทำแบบประเมิน ${data.data.form.title} เรียบร้อยแล้ว`);
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการโหลดแบบประเมิน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: QuestionOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        optionId: option.id,
        score: option.score,
        answerValue: option.value,
      },
    }));
  };

  const handleNext = () => {
    if (!formData) return;
    const currentQ = formData.questions[currentQuestionIndex];
    if (currentQ.required && !answers[currentQ.id]) {
      toast.error('กรุณาเลือกคำตอบก่อนไปยังข้อถัดไป');
      return;
    }

    if (currentQuestionIndex < formData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStart9QDirectly = async () => {
    setIs2QTransitionModalOpen(false);
    await handleStartScreening('9Q');
  };

  const handleSubmitAnswers = async () => {
    if (!publicToken || !formData) return;
    setIsLoading(true);
    setIsConfirmModalOpen(false);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        optionId: val.optionId,
        answerValue: val.answerValue,
        score: val.score,
      }));

      const totalScore = formattedAnswers.reduce((sum, item) => sum + (item.score || 0), 0);

      const res = await fetch(`/api/screenings/${publicToken}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการบันทึกคำตอบ');
      }

      // Smart transition: If 2Q assessment score is >= 1 (or 2), prompt smart auto-transition to 9Q
      if (formData.code === '2Q' && totalScore >= 1) {
        setCompleted2QToken(publicToken);
        setCompleted2QScore(totalScore);
        setIs2QTransitionModalOpen(true);
        setIsLoading(false);
        return;
      }

      toast.success('ประเมินผลสำเร็จ กำลังนำไปยังหน้าผลลัพธ์...');
      router.push(`/screening/result/${publicToken}`);
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถส่งผลการประเมินได้');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* STEP 1: Consent & Demographics */}
        {step === 'consent' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
                <HeartPulse className="h-3.5 w-3.5" />
                <span>ระบบคัดกรองสุขภาพจิต โรงพยาบาลปลวกแดง</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                แบบประเมินสุขภาพใจออนไลน์
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                โปรดเลือกแบบประเมินที่ต้องการและกรอกข้อมูลเบื้องต้นเพื่อเริ่มทำแบบประเมิน
              </p>
            </div>

            {/* Form Selection Tabs */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">1. เลือกประเภทแบบประเมิน</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    code: '2Q',
                    title: 'แบบคัดกรองโรคซึมเศร้า (2Q)',
                    desc: '2 คำถาม คัดกรองเบื้องต้น ใช้เวลา 1 นาที',
                    badge: 'แนะนำเริ่มต้น',
                    variant: 'low',
                  },
                  {
                    code: '9Q',
                    title: 'แบบประเมินโรคซึมเศร้า (9Q)',
                    desc: '9 คำถาม ประเมินภาวะซึมเศร้าละเอียด',
                    badge: 'ละเอียด',
                    variant: 'moderate',
                  },
                  {
                    code: 'PHQ-A',
                    title: 'แบบประเมินซึมเศร้าในวัยรุ่น (PHQ-A)',
                    desc: '9 คำถาม สำหรับวัยรุ่นและนักเรียน',
                    badge: 'วัยรุ่น/นักเรียน',
                    variant: 'moderate',
                  },
                  {
                    code: 'AUDIT',
                    title: 'แบบประเมินการดื่มสุรา (AUDIT)',
                    desc: '10 คำถาม 3 มิติ (ปริมาณ, ติดสุรา, ผลกระทบ)',
                    badge: 'สุรา/แอลกอฮอล์',
                    variant: 'moderate',
                  },
                  {
                    code: 'FTND',
                    title: 'แบบประเมินการติดบุหรี่ (FTND)',
                    desc: '6 คำถาม ประเมินระดับติดนิโคติน',
                    badge: 'บุหรี่/นิโคติน',
                    variant: 'low',
                  },
                  {
                    code: 'ST-5',
                    title: 'แบบประเมินความเครียด (ST-5)',
                    desc: '5 คำถาม วัดระดับความเครียดสะสม',
                    badge: 'ผ่อนคลาย',
                    variant: 'low',
                  },
                  {
                    code: '8Q',
                    title: 'แบบประเมินการฆ่าตัวตาย (8Q)',
                    desc: '8 คำถาม ประเมินความเสี่ยงทำร้ายตนเอง',
                    badge: 'ความช่วยเหลือด่วน',
                    variant: 'urgent',
                  },
                ].map((f) => {
                  const isSelected = selectedFormCode === f.code;
                  return (
                    <button
                      key={f.code}
                      type="button"
                      onClick={() => setSelectedFormCode(f.code)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</span>
                        <Badge variant={f.variant as any}>{f.badge}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Demographics & Individual Assessment */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">2. ข้อมูลผู้รับการประเมินรายบุคคล</CardTitle>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {isAnonymous ? '+ กรอกข้อมูลรายบุคคลเพื่อติดตามผล' : '✓ ประเมินแบบนิรนาม (ไม่ระบุตัวตน)'}
                  </button>
                </div>
                <CardDescription className="text-xs">
                  {isAnonymous
                    ? 'โหมดนิรนาม: ข้อมูลของท่านจะไม่ถูกผูกกับชื่อหรือเลขบัตรประชาชน'
                    : 'ข้อมูลรายบุคคลจะถูกเข้ารหัสความปลอดภัย AES-256-GCM ตามมาตรฐาน PDPA เพื่อการดูแลรักษาที่ต่อเนื่อง'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* General Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      เพศ
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                    >
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                      <option value="other">อื่นๆ</option>
                      <option value="unspecified">ไม่ประสงค์ระบุ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ตำบล (อ.ปลวกแดง)
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Individual PII Details */}
                {!isAnonymous && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs text-teal-800 dark:text-teal-300 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>ข้อมูลส่วนบุคคลได้รับการเข้ารหัสความปลอดภัย AES-256-GCM ตามมาตรฐาน PDPA</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. ชื่อ-นามสกุล */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          1. ชื่อ
                        </label>
                        <input
                          type="text"
                          placeholder="ชื่อจริง"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          นามสกุล
                        </label>
                        <input
                          type="text"
                          placeholder="นามสกุล"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* 2. วันเดือนปีเกิด & 3. อายุ */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          2. วันเดือนปีเกิด (ค.ศ. หรือ พ.ศ.)
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          3. อายุ (ปี)
                        </label>
                        <input
                          type="number"
                          placeholder="เช่น 16 (คำนวณอัตโนมัติจากวันเกิด)"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* 4. เลขบัตรประชาชน & 6. เบอร์โทรศัพท์ */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          4. เลขบัตรประชาชน (13 หลัก)
                        </label>
                        <input
                          type="text"
                          maxLength={13}
                          placeholder="3560xxxxxxxxx"
                          value={citizenId}
                          onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          6. เบอร์โทรศัพท์
                        </label>
                        <input
                          type="tel"
                          placeholder="08x-xxx-xxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* 5. ที่อยู่ปัจจุบัน */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          5. ที่อยู่ปัจจุบัน
                        </label>
                        <input
                          type="text"
                          placeholder="บ้านเลขที่ หมู่ ซอย ถนน (เช่น 123/4 หมู่ 2 ต.ปลวกแดง)"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* 7. ชั้นปีที่ศึกษา & 8. ห้อง */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          7. ชั้นปีที่ศึกษา
                        </label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        >
                          {educationLevels.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          8. ห้อง / กลุ่มเรียน
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ห้อง 1, ห้อง 2/3"
                          value={educationRoom}
                          onChange={(e) => setEducationRoom(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      ข้าพเจ้ายินยอมให้ประมวลผลข้อมูลสุขภาพและข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                      เพื่อประโยชน์ในการประเมินและดูแลสุขภาพจิตโดยบุคลากรทางการแพทย์ รพ.ปลวกแดง
                    </span>
                  </label>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="teal"
                  size="lg"
                  isLoading={isLoading}
                  onClick={handleStartScreening}
                  className="w-full py-6 rounded-2xl text-base font-bold shadow-md shadow-teal-500/25"
                >
                  <span>เริ่มทำแบบประเมิน</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* STEP 2: Mobile-First Dynamic Question Stepper */}
        {step === 'questions' && formData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Progress Bar & Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="text-teal-700 dark:text-teal-400 font-bold">
                  {formData.title}
                </span>
                <span>
                  ข้อ {currentQuestionIndex + 1} จากทั้งหมด {formData.questions.length} ข้อ
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentQuestionIndex + 1) / formData.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Question Card */}
            {(() => {
              const currentQ = formData.questions[currentQuestionIndex];
              const selectedOption = answers[currentQ.id];

              return (
                <Card className="shadow-lg border-teal-100 dark:border-teal-900/60 overflow-hidden">
                  <CardHeader className="bg-slate-50/60 dark:bg-slate-900/60 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                        {currentQuestionIndex + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-500">คำถามที่ {currentQuestionIndex + 1}</span>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentQ.questionText}
                    </CardTitle>
                    {formData.description && (
                      <CardDescription className="text-xs mt-1">
                        {formData.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 space-y-3">
                    {currentQ.options.map((opt) => {
                      const isOptionSelected = selectedOption?.optionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between min-h-[56px] select-none ${
                            isOptionSelected
                              ? 'border-teal-600 bg-teal-50/90 dark:bg-teal-950/60 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500 shadow-sm scale-[1.01]'
                              : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="text-sm sm:text-base font-semibold">{opt.label}</span>
                          <div
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isOptionSelected
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isOptionSelected && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>

                  <CardFooter className="bg-slate-50/60 dark:bg-slate-900/60 p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      disabled={currentQuestionIndex === 0}
                      onClick={handlePrev}
                      className="rounded-xl flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>ข้อก่อนหน้า</span>
                    </Button>

                    <Button
                      variant="teal"
                      onClick={handleNext}
                      className="rounded-xl flex items-center gap-1 text-xs sm:text-sm font-semibold px-6"
                    >
                      <span>
                        {currentQuestionIndex === formData.questions.length - 1 ? 'ประเมินผล' : 'ข้อถัดไป'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })()}
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="ยืนยันการส่งแบบประเมิน"
          description="ท่านตอบคำถามครบทุกข้อแล้ว ต้องการส่งผลการประเมินเพื่อคำนวณระดับความเสี่ยงใช่หรือไม่"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>ผลลัพธ์จะแสดงระดับความเสี่ยง คำแนะนำ และช่องทางการช่วยเหลือทันที</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                กลับไปตรวจทาน
              </Button>
              <Button variant="teal" isLoading={isLoading} onClick={handleSubmitAnswers}>
                ยืนยันและดูผลการประเมิน
              </Button>
            </div>
          </div>
        </Modal>

        {/* Smart 2Q -> 9Q Transition Modal */}
        <Modal
          isOpen={is2QTransitionModalOpen}
          onClose={() => {
            setIs2QTransitionModalOpen(false);
            if (completed2QToken) router.push(`/screening/result/${completed2QToken}`);
          }}
          title="🧠 ระบบอัจฉริยะแนะนำทำแบบประเมิน 9Q ต่อเนื่อง"
          description="ผลคัดกรอง 2Q ของท่านพบสัญญาณเสี่ยง (คะแนน 2Q ได้คะแนน)"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                  {completed2QScore}/2
                </span>
                <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  ผลคัดกรอง 2Q ได้ {completed2QScore} คะแนน (ผลบวก / มีแนวโน้มเสี่ยง)
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                ตามเกณฑ์มาตรฐานทางการแพทย์ของกรมสุขภาพจิตและโรงพยาบาลปลวกแดง แนะนำให้ทำ <strong>แบบประเมินโรคซึมเศร้า 9 คำถาม (9Q) ต่อทันที</strong> เพื่อประเมินระดับความรุนแรงและแนวทางการดูแลที่แม่นยำ
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
              <span>ระบบจะใช้ข้อมูลเดิมที่ท่านกรอกไว้โดยอัตโนมัติ ไม่ต้องกรอกข้อมูลส่วนตัวซ้ำ</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs"
                onClick={() => {
                  setIs2QTransitionModalOpen(false);
                  if (completed2QToken) router.push(`/screening/result/${completed2QToken}`);
                }}
              >
                ดูผลคะแนน 2Q ก่อน
              </Button>
              <Button
                variant="teal"
                isLoading={isLoading}
                onClick={handleStart9QDirectly}
                className="w-full sm:w-auto font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
              >
                <span>ทำแบบประเมิน 9Q ต่อทันที</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <PublicFooter />
    </div>
  );
}
