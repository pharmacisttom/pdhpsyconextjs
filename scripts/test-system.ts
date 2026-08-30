import { prisma } from '../src/lib/db/prisma';
import { encryptPII, decryptPII } from '../src/lib/encryption/crypto';
import { hashIp } from '../src/lib/security/ip-hash';
import { maskCitizenId, maskPhone, maskName } from '../src/lib/security/masking';
import { ScreeningService } from '../src/services/screening.service';
import { RiskLevel } from '@prisma/client';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PDHPSYCO SYSTEM INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, extraInfo?: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${extraInfo ? `(${extraInfo})` : ''}`);
      failed++;
    }
  }

  // 1. Test Database Connection
  try {
    const userCount = await prisma.user.count();
    assert('1. Database Connection & User Count', userCount >= 1, `Users in DB: ${userCount}`);
  } catch (e: any) {
    assert('1. Database Connection', false, e.message);
  }

  // 2. Test Screening Forms In Database
  try {
    const forms = await prisma.screeningForm.findMany({
      include: { questions: { include: { options: true } }, riskRules: true },
    });
    assert('2. Active Screening Forms Seeded', forms.length >= 4, `Forms: ${forms.map(f => f.code).join(', ')}`);
    
    const form2Q = forms.find(f => f.code === '2Q');
    const form9Q = forms.find(f => f.code === '9Q');
    assert('   - Form 2Q has 2 questions', form2Q?.questions.length === 2);
    assert('   - Form 9Q has 9 questions', form9Q?.questions.length === 9);
  } catch (e: any) {
    assert('2. Forms verification', false, e.message);
  }

  // 3. Test AES-256-GCM Encryption & Decryption
  try {
    const sampleCitizenId = '1210100123456';
    const samplePhone = '0812345678';
    const sampleName = 'นายทดสอบ ระบบจิตเวช';

    const encryptedCitizen = encryptPII(sampleCitizenId);
    const decryptedCitizen = decryptPII(encryptedCitizen);

    const encryptedPhone = encryptPII(samplePhone);
    const decryptedPhone = decryptPII(encryptedPhone);

    const encryptedName = encryptPII(sampleName);
    const decryptedName = decryptPII(encryptedName);

    assert('3. PII AES-256-GCM Encryption/Decryption', 
      decryptedCitizen === sampleCitizenId &&
      decryptedPhone === samplePhone &&
      decryptedName === sampleName &&
      encryptedCitizen !== sampleCitizenId
    );
  } catch (e: any) {
    assert('3. PII Encryption/Decryption', false, e.message);
  }

  // 4. Test PII Masking
  try {
    const maskedId = maskCitizenId('1210100123456');
    const maskedPhone = maskPhone('0812345678');
    const maskedName = maskName('ทดสอบ', 'จิตเวช');

    assert('4. Data Masking Integrity',
      maskedId === '1210xxxxxx456' &&
      maskedPhone === '08x-xxx-5678' &&
      maskedName.includes('xx')
    );
  } catch (e: any) {
    assert('4. Data Masking', false, e.message);
  }

  // 5. Test SHA-256 Salted IP Hashing
  try {
    const ip = '192.168.1.100';
    const hash1 = hashIp(ip);
    const hash2 = hashIp(ip);
    assert('5. IP Hash Deterministic & Non-reversible', hash1 === hash2 && hash1.length === 32 && !hash1.includes(ip));
  } catch (e: any) {
    assert('5. IP Hashing', false, e.message);
  }

  // 6. Test Screening Lifecycle (Start -> Submit 2Q Positive -> Evaluate Risk)
  try {
    const sessionResult = await ScreeningService.startSession({
      formCode: '2Q',
      participant: {
        consent: true,
        gender: 'male',
        district: 'ปลวกแดง',
        age: 30,
        firstName: 'ผู้ทดสอบ',
        lastName: 'คัดกรองจิตเวช',
        phone: '0899999999',
      },
    });

    assert('6. Start 2Q Session (Public Token generated)', !!sessionResult.publicToken && sessionResult.form.code === '2Q');

    // Simulate 2Q positive answers (score = 2)
    const q1 = sessionResult.form.questions[0];
    const q2 = sessionResult.form.questions[1];
    const optYes1 = q1.options.find(o => o.score === 1);
    const optYes2 = q2.options.find(o => o.score === 1);

    const completeResult = await ScreeningService.completeSession({
      publicToken: sessionResult.publicToken,
      answers: [
        { questionId: q1.id, optionId: optYes1?.id, score: 1, answerValue: 'yes' },
        { questionId: q2.id, optionId: optYes2?.id, score: 1, answerValue: 'yes' },
      ],
    });

    assert('   - Complete 2Q session: Score is 2', completeResult.totalScore === 2);
    assert('   - 2Q Positive Risk evaluated as HIGH', completeResult.riskLevel === RiskLevel.HIGH);
    assert('   - Recommendation points to 9Q assessment', completeResult.recommendation.includes('9Q'));
  } catch (e: any) {
    assert('6. Screening Lifecycle 2Q', false, e.message);
  }

  // 7. Test System Settings for Clinic Phone
  try {
    const phoneSetting = await prisma.systemSetting.findUnique({
      where: { key: 'hospital_er_phone' },
    });
    assert('7. Clinic Phone In Database Setting', phoneSetting?.value === '033 650413 ต่อ 115', `Value: ${phoneSetting?.value}`);
  } catch (e: any) {
    assert('7. Clinic Phone Setting', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
