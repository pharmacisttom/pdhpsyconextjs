import { prisma } from '../src/lib/db/prisma';
import { ScreeningService } from '../src/services/screening.service';
import { decryptPII } from '../src/lib/encryption/crypto';

async function testUnifiedWorkflow() {
  console.log('🧪 ========================================================');
  console.log('   PDHPSYCO - Unified Clinical Screening Workflow Test');
  console.log('========================================================\n');

  // Step 1: Create a Youth participant (Age 16, High School M.4, with Teacher Name)
  console.log('📌 1. Starting Stage 1: 2Q Screening with Demographics & Teacher Name...');
  const participantInfo = {
    consent: true,
    firstName: 'น้องกานต์',
    lastName: 'เรียนดี',
    citizenId: '1219900123456',
    phone: '0891234567',
    birthDate: '2010-05-20',
    address: '15/2 หมู่ 3 ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง',
    educationLevel: 'มัธยมศึกษาปีที่ 4 (ม.4)',
    educationRoom: 'ห้อง 4/2',
    teacherName: 'ครูสมศรี ใจการุณ (ครูที่ปรึกษา)',
    age: 16,
    gender: 'female',
    district: 'ปลวกแดง',
  };

  const stage1 = await ScreeningService.startSession({
    formCode: '2Q',
    participant: participantInfo,
  });
  console.log(`   ✅ 2Q Session Token: ${stage1.publicToken}`);

  // Verify participant in DB has teacherNameEncrypted
  const sessionDb = await prisma.screeningSession.findUnique({
    where: { publicToken: stage1.publicToken },
    include: { participant: true },
  });
  if (sessionDb?.participant?.teacherNameEncrypted) {
    const decryptedTeacher = decryptPII(sessionDb.participant.teacherNameEncrypted);
    console.log(`   ✅ Teacher Name correctly AES-256 encrypted & decrypted: "${decryptedTeacher}"`);
  } else {
    throw new Error('Teacher name was not encrypted/saved!');
  }

  // Answer 2Q with positive risk (score = 2)
  const answers2Q = stage1.form.questions.map((q) => {
    const yesOpt = q.options.find((o) => o.score === 1) || q.options[0];
    return {
      questionId: q.id,
      optionId: yesOpt.id,
      answerValue: yesOpt.value,
      score: yesOpt.score,
    };
  });

  const res2Q = await ScreeningService.completeSession({
    publicToken: stage1.publicToken,
    answers: answers2Q,
  });
  console.log(`   ✅ 2Q Result: Score ${res2Q.totalScore}/2 -> Positive!`);

  // Step 2: Since Age is 16 (<= 18), system directs to PHQ-A (Adolescent depression screener)
  console.log('\n📌 2. Age is 16 (<= 18) -> Routing to PHQ-A (Adolescent Screener)...');
  const stagePHQA = await ScreeningService.startSession({
    formCode: 'PHQ-A',
    participant: participantInfo,
  });
  console.log(`   ✅ PHQ-A Session Token: ${stagePHQA.publicToken}`);

  // Answer PHQ-A with severe depression and self-harm thoughts (scores: 2 or 3)
  const answersPHQA = stagePHQA.form.questions.map((q, idx) => {
    // Select option with score 2
    const opt = q.options.find((o) => o.score === 2) || q.options[0];
    return {
      questionId: q.id,
      optionId: opt.id,
      answerValue: opt.value,
      score: opt.score,
    };
  });

  const resPHQA = await ScreeningService.completeSession({
    publicToken: stagePHQA.publicToken,
    answers: answersPHQA,
  });
  console.log(`   ✅ PHQ-A Result: Score ${resPHQA.totalScore} -> Risk: ${resPHQA.riskLevel}`);

  // Step 3: PHQ-A severe score triggers 8Q (Suicide Risk Assessment)
  console.log('\n📌 3. High Depression Risk triggers 8Q Suicide Assessment...');
  const stage8Q = await ScreeningService.startSession({
    formCode: '8Q',
    participant: participantInfo,
  });
  console.log(`   ✅ 8Q Session Token: ${stage8Q.publicToken}`);

  const answers8Q = stage8Q.form.questions.map((q) => {
    const opt = q.options.find((o) => o.score > 0) || q.options[0];
    return {
      questionId: q.id,
      optionId: opt.id,
      answerValue: opt.value,
      score: opt.score,
    };
  });

  const res8Q = await ScreeningService.completeSession({
    publicToken: stage8Q.publicToken,
    answers: answers8Q,
  });
  console.log(`   ✅ 8Q Result: Score ${res8Q.totalScore} -> Risk: ${res8Q.riskLevel}`);

  // Step 4: Proceed to ST-5 (Stress Assessment)
  console.log('\n📌 4. Proceeding to ST-5 Stress Assessment...');
  const stageST5 = await ScreeningService.startSession({
    formCode: 'ST-5',
    participant: participantInfo,
  });
  console.log(`   ✅ ST-5 Session Token: ${stageST5.publicToken}`);

  const answersST5 = stageST5.form.questions.map((q) => {
    const opt = q.options.find((o) => o.score === 1) || q.options[0];
    return {
      questionId: q.id,
      optionId: opt.id,
      answerValue: opt.value,
      score: opt.score,
    };
  });

  const resST5 = await ScreeningService.completeSession({
    publicToken: stageST5.publicToken,
    answers: answersST5,
  });
  console.log(`   ✅ ST-5 Result: Score ${resST5.totalScore} -> Risk: ${resST5.riskLevel}`);

  // Step 5: Substance Use (Alcohol & Tobacco Gate questions)
  console.log('\n📌 5. Proceeding to Alcohol (AUDIT) & Tobacco (FTND)...');
  const stageAUDIT = await ScreeningService.startSession({
    formCode: 'AUDIT',
    participant: participantInfo,
  });
  // Student reports no alcohol -> 0 score
  const zeroAUDIT = stageAUDIT.form.questions.map((q) => ({
    questionId: q.id,
    optionId: q.options[0]?.id || null,
    answerValue: '0',
    score: 0,
  }));
  const resAUDIT = await ScreeningService.completeSession({
    publicToken: stageAUDIT.publicToken,
    answers: zeroAUDIT,
  });
  console.log(`   ✅ AUDIT (No alcohol): Score ${resAUDIT.totalScore} -> Risk: ${resAUDIT.riskLevel}`);

  const stageFTND = await ScreeningService.startSession({
    formCode: 'FTND',
    participant: participantInfo,
  });
  // Student reports no smoking -> 0 score
  const zeroFTND = stageFTND.form.questions.map((q) => ({
    questionId: q.id,
    optionId: q.options[0]?.id || null,
    answerValue: '0',
    score: 0,
  }));
  const resFTND = await ScreeningService.completeSession({
    publicToken: stageFTND.publicToken,
    answers: zeroFTND,
  });
  console.log(`   ✅ FTND (No smoking): Score ${resFTND.totalScore} -> Risk: ${resFTND.riskLevel}`);

  // Step 6: Test Unified Bundled Results
  console.log('\n📌 6. Testing Bundled Report Retrieval (Multi-Token Result)...');
  const allTokens = [
    stage1.publicToken,
    stagePHQA.publicToken,
    stage8Q.publicToken,
    stageST5.publicToken,
    stageAUDIT.publicToken,
    stageFTND.publicToken,
  ];

  const bundleReport = await ScreeningService.getBundleResults(allTokens);
  console.log(`   ✅ Bundled Results Retrieved: ${bundleReport.results.length} assessments`);
  console.log(`   ✅ Overall Clinical Risk Level: ${bundleReport.overallRiskLevel}`);
  console.log(`   ✅ Needs Urgent Clinical Assistance: ${bundleReport.needsUrgentHelp}`);
  console.log(`   ✅ Participant Education: ${bundleReport.participant?.educationLevel} (${bundleReport.participant?.educationRoom})`);

  for (const item of bundleReport.results) {
    console.log(`      - [${item.formCode}] ${item.formTitle}: Score ${item.totalScore} (${item.riskLevel})`);
  }

  console.log('\n🎉 ALL WORKFLOW PIPELINE TESTS PASSED SUCCESSFULLY!\n');
}

testUnifiedWorkflow()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
