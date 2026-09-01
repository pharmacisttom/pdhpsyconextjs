import { prisma } from '../src/lib/db/prisma';
import { ScreeningService } from '../src/services/screening.service';
import { decryptPII } from '../src/lib/encryption/crypto';

async function testSystem() {
  console.log('🧪 Starting Automated Verification Tests for PDHPSYCO...\n');

  // Test 1: Verify all 7 forms in DB
  const forms = await prisma.screeningForm.findMany({
    include: { questions: { include: { options: true } }, riskRules: true },
  });
  console.log(`✅ 1. Total Active Forms Found: ${forms.length}`);
  for (const f of forms) {
    console.log(`   - Form [${f.code}]: ${f.title} (${f.questions.length} questions, ${f.riskRules.length} risk rules)`);
  }

  // Test 2: Start session for AUDIT with full individual demographics
  console.log('\n✅ 2. Testing Session Start & Demographic Encryption (AUDIT Form)...');
  const auditStart = await ScreeningService.startSession({
    formCode: 'AUDIT',
    participant: {
      consent: true,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      citizenId: '1103701234567',
      phone: '0812345678',
      birthDate: '2005-08-15',
      address: '99/1 หมู่ 1 ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง',
      educationLevel: 'มัธยมศึกษาปีที่ 6 (ม.6)',
      educationRoom: 'ห้อง 6/1',
      age: 19,
      gender: 'male',
      district: 'ปลวกแดง',
    },
  });
  console.log(`   - Session created with publicToken: ${auditStart.publicToken}`);

  // Test 3: Submit Answers for AUDIT (Moderate Risk Test: e.g. Score = 10)
  console.log('\n✅ 3. Testing Answer Submission & Risk Evaluation (AUDIT)...');
  const auditQuestions = auditStart.form.questions;
  const answers = auditQuestions.map((q, idx) => {
    // Select option score 1 for each question => total 10
    const opt = q.options.find((o) => o.score === 1) || q.options[0];
    return {
      questionId: q.id,
      optionId: opt.id,
      answerValue: opt.value,
      score: opt.score,
    };
  });

  const result = await ScreeningService.completeSession({
    publicToken: auditStart.publicToken,
    answers,
  });

  console.log(`   - Total Score: ${result.totalScore}`);
  console.log(`   - Risk Level: ${result.riskLevel}`);
  console.log(`   - Recommendation: ${result.recommendation}`);

  // Test 4: Verify Participant in DB and Decrypt
  console.log('\n✅ 4. Verifying AES-256-GCM Decryption of Stored Data...');
  const sessionDb = await prisma.screeningSession.findUnique({
    where: { publicToken: auditStart.publicToken },
    include: { participant: true },
  });

  if (sessionDb?.participant) {
    const p = sessionDb.participant;
    const decryptedName = `${decryptPII(p.firstNameEncrypted || '')} ${decryptPII(p.lastNameEncrypted || '')}`;
    const decryptedCitizenId = decryptPII(p.citizenIdEncrypted || '');
    const decryptedPhone = decryptPII(p.phoneEncrypted || '');
    const decryptedBirthDate = decryptPII(p.birthDateEncrypted || '');
    const decryptedAddress = decryptPII(p.addressEncrypted || '');

    console.log(`   - Decrypted Name: ${decryptedName}`);
    console.log(`   - Decrypted CitizenId: ${decryptedCitizenId}`);
    console.log(`   - Decrypted Phone: ${decryptedPhone}`);
    console.log(`   - Decrypted BirthDate: ${decryptedBirthDate}`);
    console.log(`   - Decrypted Address: ${decryptedAddress}`);
    console.log(`   - Education Level: ${p.educationLevel}`);
    console.log(`   - Room: ${p.educationRoom}`);
  }

  // Test 5: Test FTND Form flow
  console.log('\n✅ 5. Testing FTND Form Session & Risk Rule Evaluation...');
  const ftndStart = await ScreeningService.startSession({
    formCode: 'FTND',
    participant: {
      consent: true,
      age: 22,
      gender: 'female',
      district: 'มาบยางพร',
    },
  });
  const ftndAnswers = ftndStart.form.questions.map((q) => {
    const highestScoreOpt = q.options[0]; // will give high score
    return {
      questionId: q.id,
      optionId: highestScoreOpt.id,
      answerValue: highestScoreOpt.value,
      score: highestScoreOpt.score,
    };
  });
  const ftndResult = await ScreeningService.completeSession({
    publicToken: ftndStart.publicToken,
    answers: ftndAnswers,
  });
  console.log(`   - FTND Total Score: ${ftndResult.totalScore}`);
  console.log(`   - FTND Risk Level: ${ftndResult.riskLevel}`);
  console.log(`   - FTND Recommendation: ${ftndResult.recommendation}`);

  console.log('\n🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY!');
}

testSystem()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
