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
  Sparkles,
  Info,
  PhoneCall,
  Brain,
  SmilePlus,
  Wine,
  Flame,
  AlertTriangle,
  School,
  User,
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

// Stages in the Sequential Clinical Workflow
type WorkflowStage =
  | 'DEMOGRAPHICS' // 1. กรอกข้อมูลและยินยอม PDPA
  | '2Q'           // 2. คัดกรองซึมเศร้า 2 ข้อ
  | 'DEPRESSION'   // 3. PHQ-A (อายุ <= 18) หรือ 9Q (อายุ > 18)
  | '8Q'           // 4. แบบประเมินการฆ่าตัวตาย (ถ้าเข้าเกณฑ์เสี่ยง)
  | 'ST5'          // 5. แบบประเมินความเครียด 5 ข้อ
  | 'ALCOHOL'      // 6. แบบประเมินการดื่มสุรา (AUDIT)
  | 'TOBACCO';     // 7. แบบประเมินการติดบุหรี่ (FTND)

function ScreeningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directFormRequested = searchParams.get('form');

  // Overall workflow state
  const [currentStage, setCurrentStage] = React.useState<WorkflowStage>('DEMOGRAPHICS');
  const [completedTokens, setCompletedTokens] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Form metadata & questions state
  const [activeFormData, setActiveFormData] = React.useState<FormMetadata | null>(null);
  const [activePublicToken, setActivePublicToken] = React.useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<number>(0);
  const [answers, setAnswers] = React.useState<Record<string, { optionId?: string; score: number; answerValue?: string }>>({});

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
  const [teacherName, setTeacherName] = React.useState<string>('');
  const [gender, setGender] = React.useState<string>('unspecified');
  const [district, setDistrict] = React.useState<string>('ปลวกแดง');

  // Gate questions for Substance use
  const [drinksAlcohol, setDrinksAlcohol] = React.useState<boolean | null>(null);
  const [smokesTobacco, setSmokesTobacco] = React.useState<boolean | null>(null);

  // Interstitial modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [transitionModal, setTransitionModal] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'ต่อไป',
    onConfirm: () => {},
  });

  const districts = ['ปลวกแดง', 'ตาสิทธิ์', 'ละหาร', 'แม่น้ำคู้', 'มาบยางพร', 'หนองไร่', 'นอกพื้นที่'];

  const educationLevels = [
    'มัธยมศึกษาปีที่ 1 (ม.1)',
    'มัธยมศึกษาปีที่ 2 (ม.2)',
    'มัธยมศึกษาปีที่ 3 (ม.3)',
    'มัธยมศึกษาปีที่ 4 (ม.4)',
    'มัธยมศึกษาปีที่ 5 (ม.5)',
    'มัธยมศึกษาปีที่ 6 (ม.6)',
    'ประกาศนียบัตรวิชาชีพ (ปวช.)',
    'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',
    'ประถมศึกษา',
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

  // Helper to build participant payload
  const buildParticipantPayload = () => {
    return {
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
            teacherName: teacherName.trim() || undefined,
          }
        : {}),
    };
  };

  // Start a specific form session in backend
  const startFormSession = async (formCode: string): Promise<{ token: string; form: FormMetadata }> => {
    const payload = {
      formCode,
      participant: buildParticipantPayload(),
    };

    const res = await fetch('/api/screenings/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || `ไม่สามารถเริ่มทำแบบประเมิน ${formCode} ได้`);
    }

    return {
      token: data.data.publicToken,
      form: data.data.form,
    };
  };

  // Submit answers for an active session
  const submitFormSession = async (token: string, formattedAnswers: any[]) => {
    const res = await fetch(`/api/screenings/${token}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: formattedAnswers }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการบันทึกคำตอบ');
    }

    return result.data;
  };

  // 1. Begin Screening from Step 1
  const handleStartWorkflow = async () => {
    if (!consent) {
      toast.error('กรุณายินยอมตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อทำแบบประเมิน');
      return;
    }

    // If direct isolated form requested via query param (e.g. ?form=8Q), load it directly
    const targetCode = directFormRequested || '2Q';

    setIsLoading(true);
    try {
      const { token, form } = await startFormSession(targetCode);
      setActivePublicToken(token);
      setActiveFormData(form);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setCurrentStage(targetCode === '2Q' ? '2Q' : (targetCode as any));
      toast.success(`เริ่มทำแบบประเมิน: ${form.title}`);
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถโหลดแบบประเมินได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Option select handler
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

  const handleNextQuestion = () => {
    if (!activeFormData) return;
    const currentQ = activeFormData.questions[currentQuestionIndex];
    if (currentQ.required && !answers[currentQ.id]) {
      toast.error('กรุณาเลือกคำตอบก่อนไปยังข้อถัดไป');
      return;
    }

    if (currentQuestionIndex < activeFormData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-redirect to final bundled results
  const finishAndRedirect = (allTokens: string[]) => {
    const primary = allTokens[allTokens.length - 1] || allTokens[0];
    const bundleParam = allTokens.join(',');
    toast.success('ทำแบบประเมินเสร็จสิ้นครบทุกมิติ กำลังประมวลผล...');
    router.push(`/screening/result/${primary}?bundle=${encodeURIComponent(bundleParam)}`);
  };

  // Submit current stage and determine next branch
  const handleSubmitStageAnswers = async () => {
    if (!activePublicToken || !activeFormData) return;
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
      const completionResult = await submitFormSession(activePublicToken, formattedAnswers);

      const newTokens = [...completedTokens, activePublicToken];
      setCompletedTokens(newTokens);

      const parsedAge = age ? parseInt(age, 10) : 25;
      const isYouth = parsedAge <= 18;

      // ========================================================
      // STAGE BRANCH 1: Finished 2Q
      // ========================================================
      if (currentStage === '2Q') {
        if (totalScore >= 1) {
          // 2Q Positive -> Needs PHQ-A (Youth) or 9Q (Adult)
          const nextFormCode = isYouth ? 'PHQ-A' : '9Q';
          const nextFormTitle = isYouth ? 'แบบประเมินโรคซึมเศร้าในวัยรุ่น (PHQ-A)' : 'แบบประเมินโรคซึมเศร้า (9Q)';

          setTransitionModal({
            isOpen: true,
            title: '🧠 ผลคัดกรอง 2Q พบแนวโน้มความเสี่ยง',
            description: `ผลคัดกรอง 2Q ได้ ${totalScore}/2 คะแนน ตามเกณฑ์มาตรฐานทางการแพทย์ แนะนำให้ทำ "${nextFormTitle}" ต่อเนื่องทันที เพื่อประเมินเชิงลึกอย่างแม่นยำ`,
            actionLabel: `เริ่มทำแบบประเมิน ${nextFormCode} ต่อทันที`,
            onConfirm: async () => {
              setTransitionModal((prev) => ({ ...prev, isOpen: false }));
              setIsLoading(true);
              try {
                const { token, form } = await startFormSession(nextFormCode);
                setActivePublicToken(token);
                setActiveFormData(form);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setCurrentStage('DEPRESSION');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (e: any) {
                toast.error(e.message);
              } finally {
                setIsLoading(false);
              }
            },
          });
          return;
        } else {
          // 2Q Negative (0 score) -> Skip depression, go to ST-5 (Stress)
          toast.success('ผลคัดกรอง 2Q ปกติ กำลังนำเข้าสู่แบบประเมินความเครียด (ST-5)...');
          const { token, form } = await startFormSession('ST-5');
          setActivePublicToken(token);
          setActiveFormData(form);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setCurrentStage('ST5');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // ========================================================
      // STAGE BRANCH 2: Finished PHQ-A or 9Q
      // ========================================================
      if (currentStage === 'DEPRESSION') {
        // Criteria for 8Q:
        // 9Q score >= 7 OR PHQ-A score >= 5 OR self-harm question answered > 0
        const selfHarmScore = formattedAnswers[formattedAnswers.length - 1]?.score || 0;
        const needs8Q = totalScore >= 7 || (activeFormData.code === 'PHQ-A' && totalScore >= 5) || selfHarmScore > 0;

        if (needs8Q) {
          setTransitionModal({
            isOpen: true,
            title: '⚠️ ระบบแนะนำทำแบบประเมินความปลอดภัย (8Q)',
            description: `ผลการประเมินพบสัญญาณเสี่ยงที่ควรได้รับการดูแลและเฝ้าระวัง เพื่อความปลอดภัยของท่าน ขอให้ทำ "แบบประเมินการฆ่าตัวตาย (8Q)" ต่อทันที`,
            actionLabel: 'ทำแบบประเมิน 8Q ต่อทันที',
            onConfirm: async () => {
              setTransitionModal((prev) => ({ ...prev, isOpen: false }));
              setIsLoading(true);
              try {
                const { token, form } = await startFormSession('8Q');
                setActivePublicToken(token);
                setActiveFormData(form);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setCurrentStage('8Q');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (e: any) {
                toast.error(e.message);
              } finally {
                setIsLoading(false);
              }
            },
          });
          return;
        } else {
          // No severe risk -> Advance to ST-5
          toast.success('บันทึกผลเรียบร้อย นำเข้าสู่แบบประเมินความเครียด (ST-5)...');
          const { token, form } = await startFormSession('ST-5');
          setActivePublicToken(token);
          setActiveFormData(form);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setCurrentStage('ST5');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // ========================================================
      // STAGE BRANCH 3: Finished 8Q
      // ========================================================
      if (currentStage === '8Q') {
        toast.success('บันทึกผล 8Q แล้ว นำเข้าสู่แบบประเมินความเครียด (ST-5)...');
        const { token, form } = await startFormSession('ST-5');
        setActivePublicToken(token);
        setActiveFormData(form);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setCurrentStage('ST5');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ========================================================
      // STAGE BRANCH 4: Finished ST-5 -> Move to Substance (Alcohol & Tobacco)
      // ========================================================
      if (currentStage === 'ST5') {
        toast.success('ประเมินความเครียดเสร็จสิ้น นำเข้าสู่หมวดสุราและบุหรี่...');
        setCurrentStage('ALCOHOL');
        setDrinksAlcohol(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ========================================================
      // STAGE BRANCH 5: Finished Alcohol (AUDIT) questions -> Move to Tobacco
      // ========================================================
      if (currentStage === 'ALCOHOL') {
        toast.success('บันทึกผลประเมินสุราแล้ว นำเข้าสู่หมวดบุหรี่...');
        setCurrentStage('TOBACCO');
        setSmokesTobacco(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ========================================================
      // STAGE BRANCH 6: Finished Tobacco (FTND) questions -> Complete!
      // ========================================================
      if (currentStage === 'TOBACCO') {
        finishAndRedirect(newTokens);
        return;
      }

      // Fallback for single-form mode
      finishAndRedirect(newTokens);
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถส่งผลการประเมินได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Alcohol Gate Question (Does user drink alcohol?)
  const handleAlcoholGateAnswer = async (drinks: boolean) => {
    setDrinksAlcohol(drinks);
    if (!drinks) {
      // Auto submit 0 score AUDIT
      setIsLoading(true);
      try {
        const { token, form } = await startFormSession('AUDIT');
        const zeroAnswers = form.questions.map((q) => ({
          questionId: q.id,
          optionId: q.options[0]?.id || null,
          answerValue: q.options[0]?.value || '0',
          score: 0,
        }));
        await submitFormSession(token, zeroAnswers);
        setCompletedTokens((prev) => [...prev, token]);
        toast.success('บันทึกข้อมูลไม่ดื่มสุรา (0 คะแนน) เรียบร้อย');
        setCurrentStage('TOBACCO');
        setSmokesTobacco(null);
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสุรา');
      } finally {
        setIsLoading(false);
      }
    } else {
      // User drinks -> load full AUDIT questions
      setIsLoading(true);
      try {
        const { token, form } = await startFormSession('AUDIT');
        setActivePublicToken(token);
        setActiveFormData(form);
        setAnswers({});
        setCurrentQuestionIndex(0);
      } catch (err: any) {
        toast.error(err.message || 'ไม่สามารถโหลดแบบประเมิน AUDIT ได้');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handler for Tobacco Gate Question (Does user smoke?)
  const handleTobaccoGateAnswer = async (smokes: boolean) => {
    setSmokesTobacco(smokes);
    if (!smokes) {
      // Auto submit 0 score FTND and finish
      setIsLoading(true);
      try {
        const { token, form } = await startFormSession('FTND');
        const zeroAnswers = form.questions.map((q) => ({
          questionId: q.id,
          optionId: q.options[q.options.length - 1]?.id || q.options[0]?.id || null,
          answerValue: '0',
          score: 0,
        }));
        await submitFormSession(token, zeroAnswers);
        const finalTokens = [...completedTokens, token];
        setCompletedTokens(finalTokens);
        finishAndRedirect(finalTokens);
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบุหรี่');
      } finally {
        setIsLoading(false);
      }
    } else {
      // User smokes -> load full FTND questions
      setIsLoading(true);
      try {
        const { token, form } = await startFormSession('FTND');
        setActivePublicToken(token);
        setActiveFormData(form);
        setAnswers({});
        setCurrentQuestionIndex(0);
      } catch (err: any) {
        toast.error(err.message || 'ไม่สามารถโหลดแบบประเมิน FTND ได้');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />

      {/* Emergency Hotline Top Bar (ข้อ ③ มีเบอร์โทรสายด่วนกำกับไว้) */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white py-2.5 px-4 text-xs sticky top-0 z-40 shadow-sm">
        <div className="container max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">สายด่วนช่วยเหลือฉุกเฉิน (รพ.ปลวกแดง):</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap font-semibold">
            <a href="tel:1323" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
              <span>สายด่วน 1323 (ฟรี 24 ชม.)</span>
            </a>
            <a href="tel:1669" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
              <span>ฉุกเฉิน 1669</span>
            </a>
            <a href="tel:033650413,115" className="hover:text-teal-200 flex items-center gap-1 transition-colors">
              <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
              <span>คลินิกจิตเวช 033 650413 ต่อ 115</span>
            </a>
          </div>
        </div>
      </div>

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* ========================================================
            STEP 1: ข้อมูลผู้รับการประเมิน & ข้อตกลงยินยอม (Demographics)
            ======================================================== */}
        {currentStage === 'DEMOGRAPHICS' && (
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
                กรอกข้อมูลเบื้องต้นเพื่อเข้าสู่ระบบคัดกรองสุขภาพจิตต่อเนื่อง (2Q, ซึมเศร้า, ความเครียด, สุรา/บุหรี่)
              </p>
            </div>

            {/* Pipeline Overview Badge */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-200">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>ขั้นตอนการประเมินต่อเนื่องอัจฉริยะ (Clinical Flow):</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-semibold border border-teal-100 dark:border-teal-800">1. คัดกรอง 2Q</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-semibold border border-teal-100 dark:border-teal-800">2. ซึมเศร้า (PHQ-A / 9Q)</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-semibold border border-teal-100 dark:border-teal-800">3. ความเครียด ST-5</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-semibold border border-teal-100 dark:border-teal-800">4. สุรา & บุหรี่</span>
              </div>
            </div>

            {/* Demographics Form Card */}
            <Card className="shadow-md border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    <span>① ข้อมูลผู้รับการประเมิน</span>
                  </CardTitle>
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
                      {/* ชื่อ-นามสกุล */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          ชื่อ
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

                      {/* วันเกิด & อายุ */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          วันเดือนปีเกิด (ค.ศ. หรือ พ.ศ.)
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
                          อายุ (ปี) * (อายุไม่เกิน 18 จะประเมินด้วย PHQ-A)
                        </label>
                        <input
                          type="number"
                          placeholder="เช่น 16 (คำนวณอัตโนมัติจากวันเกิด)"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* เลขบัตรประชาชน & เบอร์โทรศัพท์ */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          เลขบัตรประชาชน (13 หลัก)
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
                          เบอร์โทรศัพท์
                        </label>
                        <input
                          type="tel"
                          placeholder="08x-xxx-xxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* ที่อยู่ปัจจุบัน */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          ที่อยู่ปัจจุบัน
                        </label>
                        <input
                          type="text"
                          placeholder="บ้านเลขที่ หมู่ ซอย ถนน (เช่น 123/4 หมู่ 2 ต.ปลวกแดง)"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* ข้อมูลการศึกษา: ชั้น ม. / ห้องเรียน / คุณครู */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                          <School className="h-3.5 w-3.5 text-teal-600" />
                          <span>ชั้นปีที่ศึกษา (เช่น ชั้น ม.)</span>
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
                          ห้องเรียน / กลุ่มเรียน
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ห้อง 1, ห้อง 2/3"
                          value={educationRoom}
                          onChange={(e) => setEducationRoom(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>

                      {/* ครูที่ปรึกษา / คุณครู */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          คุณครู / ครูที่ปรึกษา (ระบุชื่อคุณครู)
                        </label>
                        <input
                          type="text"
                          placeholder="ชื่อ-นามสกุล คุณครูประจำชั้นหรือครูที่ปรึกษา (ถ้ามี)"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Consent Checkbox (ข้อ ④ หมายเหตุ ต้องการยินยอม ให้เก็บข้อมูลร่วมด้วย) */}
                <div className="pt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      <strong>ข้อ ④ ความยินยอม (PDPA Consent):</strong> ข้าพเจ้ายินยอมให้จัดเก็บและประมวลผลข้อมูลสุขภาพและข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อประโยชน์ในการดูแลและคัดกรองสุขภาพจิตโดยบุคลากรทางการแพทย์ รพ.ปลวกแดง
                    </span>
                  </label>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="teal"
                  size="lg"
                  isLoading={isLoading}
                  onClick={handleStartWorkflow}
                  className="w-full py-6 rounded-2xl text-base font-bold shadow-md shadow-teal-500/25 flex items-center justify-center gap-2"
                >
                  <span>เริ่มทำแบบคัดกรองสุขภาพจิต (2Q)</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* ========================================================
            GATE: ALCOHOL (สุรา)
            ======================================================== */}
        {currentStage === 'ALCOHOL' && drinksAlcohol === null && (
          <Card className="shadow-lg border-amber-200 dark:border-amber-900/60 overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="bg-amber-50/70 dark:bg-amber-950/40 pb-6 border-b border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-sm">
                  <Wine className="h-5 w-5" />
                </span>
                <Badge variant="moderate">แบบประเมินพฤติกรรมการดื่มสุรา (AUDIT)</Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                คำถามคัดกรอง: ในรอบ 1 ปีที่ผ่านมา คุณเคยดื่มเครื่องดื่มที่มีแอลกอฮอล์หรือไม่?
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                เช่น เบียร์, เหล้า, ไวน์, หรือเครื่องดื่มผสมแอลกอฮอล์
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAlcoholGateAnswer(false)}
                className="w-full text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    ไม่เคยดื่มเลย (0 คะแนน)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ไม่ดื่มแอลกอฮอล์ ข้ามไปยังแบบประเมินถัดไป
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAlcoholGateAnswer(true)}
                className="w-full text-left p-5 rounded-2xl border border-amber-200 dark:border-amber-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    เคยดื่ม (ประเมินแบบละเอียด AUDIT)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ดื่มเป็นบางครั้ง หรือดื่มเป็นประจำ เพื่อประเมินระดับความเสี่ยง
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* ========================================================
            GATE: TOBACCO (บุหรี่)
            ======================================================== */}
        {currentStage === 'TOBACCO' && smokesTobacco === null && (
          <Card className="shadow-lg border-violet-200 dark:border-violet-900/60 overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="bg-violet-50/70 dark:bg-violet-950/40 pb-6 border-b border-violet-100 dark:border-violet-900/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white font-bold text-sm">
                  <Flame className="h-5 w-5" />
                </span>
                <Badge variant="low">แบบประเมินการติดบุหรี่ (FTND)</Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                คำถามคัดกรอง: ในปัจจุบัน คุณสูบบุหรี่หรือผลิตภัณฑ์นิโคตินหรือไม่?
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                เช่น บุหรี่มวน, บุหรี่ไฟฟ้า, ยาเส้น
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleTobaccoGateAnswer(false)}
                className="w-full text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    ไม่สูบเลย (0 คะแนน)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ไม่สูบบุหรี่ เสร็จสิ้นการประเมินและดูผลสรุปรวมทันที
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleTobaccoGateAnswer(true)}
                className="w-full text-left p-5 rounded-2xl border border-violet-200 dark:border-violet-800 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    สูบ (ประเมินแบบละเอียด FTND 6 ข้อ)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ประเมินระดับการติดนิโคตินเพื่อรับคำแนะนำในการดูแลสุขภาพ
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-violet-600" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* ========================================================
            ACTIVE QUESTION STEPPER (2Q, PHQ-A/9Q, 8Q, ST-5, AUDIT, FTND)
            ======================================================== */}
        {currentStage !== 'DEMOGRAPHICS' &&
          activeFormData &&
          !(currentStage === 'ALCOHOL' && drinksAlcohol === null) &&
          !(currentStage === 'TOBACCO' && smokesTobacco === null) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stage Progress Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-700 dark:text-teal-400 font-bold">
                      {activeFormData.title}
                    </span>
                    <Badge variant="low" className="text-[10px]">
                      รหัส: {activeFormData.code}
                    </Badge>
                  </div>
                  <span>
                    ข้อ {currentQuestionIndex + 1} จากทั้งหมด {activeFormData.questions.length} ข้อ
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 ease-out"
                    style={{
                      width: `${((currentQuestionIndex + 1) / activeFormData.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Question Card */}
              {(() => {
                const currentQ = activeFormData.questions[currentQuestionIndex];
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
                      {activeFormData.description && (
                        <CardDescription className="text-xs mt-1">
                          {activeFormData.description}
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
                        onClick={handlePrevQuestion}
                        className="rounded-xl flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>ข้อก่อนหน้า</span>
                      </Button>

                      <Button
                        variant="teal"
                        onClick={handleNextQuestion}
                        className="rounded-xl flex items-center gap-1 text-xs sm:text-sm font-semibold px-6"
                      >
                        <span>
                          {currentQuestionIndex === activeFormData.questions.length - 1 ? 'บันทึกและไปต่อ' : 'ข้อถัดไป'}
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
          title="ยืนยันการส่งคำตอบ"
          description={`ท่านตอบคำถามครบทุกข้อใน ${activeFormData?.title} แล้ว ต้องการบันทึกและดำเนินการต่อใช่หรือไม่`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>ระบบจะประมวลผลคะแนนและนำทางเข้าสู่ขั้นตอนต่อไปตามเกณฑ์มาตรฐานทางการแพทย์</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                กลับไปตรวจทาน
              </Button>
              <Button variant="teal" isLoading={isLoading} onClick={handleSubmitStageAnswers}>
                ยืนยันและดำเนินการต่อ
              </Button>
            </div>
          </div>
        </Modal>

        {/* Sequential Interstitial Transition Modal */}
        <Modal
          isOpen={transitionModal.isOpen}
          onClose={() => {}}
          title={transitionModal.title}
          description={transitionModal.description}
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  เกณฑ์การคัดกรองตามมาตรฐาน รพ.ปลวกแดง
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                ระบบจะใช้ข้อมูลส่วนตัวที่ท่านกรอกไว้ตั้งแต่ตอนเริ่มต้นโดยอัตโนมัติ ไม่ต้องกรอกข้อมูลส่วนบุคคลซ้ำ
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="teal"
                isLoading={isLoading}
                onClick={transitionModal.onConfirm}
                className="w-full sm:w-auto font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 py-5"
              >
                <span>{transitionModal.actionLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function ScreeningPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      }
    >
      <ScreeningContent />
    </React.Suspense>
  );
}
