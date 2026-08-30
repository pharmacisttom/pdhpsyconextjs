import { PrismaClient, Role, FormStatus, QuestionType, RiskLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PDHPSYCO Database Seeding...');

  // 1. Seed Super Admin User (Strictly from environment variables)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@pdhpsyco.pluakdaenghospital.cloud';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'PdhAdminSecurePassword2026!';
  const adminName = process.env.SEED_ADMIN_NAME || 'Super Administrator (PDH)';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminName,
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      active: true,
    },
    create: {
      username: 'superadmin',
      email: adminEmail,
      fullName: adminName,
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      active: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Create demo staff users if not existing
  const staffPassword = await bcrypt.hash('StaffPdh2026!Pass', 12);
  await prisma.user.upsert({
    where: { email: 'staff@pdhpsyco.pluakdaenghospital.cloud' },
    update: {},
    create: {
      username: 'pdh_staff01',
      email: 'staff@pdhpsyco.pluakdaenghospital.cloud',
      fullName: 'พว. สมหญิง ปลวกแดง (พยาบาลวิชาชีพ)',
      passwordHash: staffPassword,
      role: Role.STAFF,
      active: true,
    },
  });

  // 2. Seed Default Hospital Settings
  const defaultSettings = [
    { key: 'hospital_name', value: 'โรงพยาบาลปลวกแดง' },
    { key: 'hospital_sub_title', value: 'Pluak Daeng Hospital - จังหวัดระยอง' },
    { key: 'hotline_number', value: '1323' },
    { key: 'hospital_er_phone', value: '033 650413 ต่อ 115' },
    { key: 'emergency_phone', value: '1669' },
    { key: 'enable_telegram_notifications', value: 'true' },
    { key: 'enable_n8n_webhook', value: 'true' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  // 3. Seed Standard Thai Mental Health Forms

  // ==========================================
  // FORM 1: 2Q (แบบคัดกรองโรคซึมเศร้า 2 คำถาม)
  // ==========================================
  const form2Q = await prisma.screeningForm.upsert({
    where: { code: '2Q' },
    update: {},
    create: {
      code: '2Q',
      title: 'แบบคัดกรองโรคซึมเศร้า 2 คำถาม (2Q)',
      description: 'เครื่องมือคัดกรองเบื้องต้นเพื่อประเมินความเสี่ยงต่อภาวะซึมเศร้าในประชากรทั่วไป',
      version: 1,
      status: FormStatus.ACTIVE,
      questions: {
        create: [
          {
            questionOrder: 1,
            questionText: 'ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวัง หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 1, order: 2 },
              ],
            },
          },
          {
            questionOrder: 2,
            questionText: 'ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 1, order: 2 },
              ],
            },
          },
        ],
      },
      riskRules: {
        create: [
          {
            minScore: 0,
            maxScore: 0,
            riskLevel: RiskLevel.LOW,
            recommendation: 'ท่านไม่มีอาการผิดปกติที่บ่งชี้ภาวะซึมเศร้า ควรดูแลสุขภาพจิตและพักผ่อนให้เพียงพอ',
            active: true,
          },
          {
            minScore: 1,
            maxScore: 2,
            riskLevel: RiskLevel.HIGH,
            recommendation: 'ท่านมีแนวโน้มความเสี่ยงภาวะซึมเศร้าเบื้องต้น แนะนำให้ทำแบบประเมินโรคซึมเศร้า 9 คำถาม (9Q) ต่อ เพื่อการประเมินที่แม่นยำยิ่งขึ้น',
            active: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Form 2Q seeded: ${form2Q.title}`);

  // ==========================================
  // FORM 2: 9Q (แบบประเมินโรคซึมเศร้า 9 คำถาม)
  // ==========================================
  const scale9QOptions = [
    { label: 'ไม่มีเลย', value: '0', score: 0, order: 1 },
    { label: 'เป็นบางวัน (1-7 วัน)', value: '1', score: 1, order: 2 },
    { label: 'เป็นบ่อย (> 7 วัน)', value: '2', score: 2, order: 3 },
    { label: 'เป็นทุกวัน', value: '3', score: 3, order: 4 },
  ];

  const questions9Q = [
    'เบื่อ ไม่สนใจอยากทำอะไร',
    'ไม่สบายใจ ซึมเศร้า ท้อแท้',
    'หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป',
    'เหนื่อยง่าย หรือไม่ค่อยมีแรง',
    'เบื่ออาหาร หรือกินมากเกินไป',
    'รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ตนเองหรือครอบครัวผิดหวัง',
    'สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ',
    'พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้ หรือกระสับกระส่ายไม่สามารถอยู่นิ่งได้',
    'คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี',
  ];

  const form9Q = await prisma.screeningForm.upsert({
    where: { code: '9Q' },
    update: {},
    create: {
      code: '9Q',
      title: 'แบบประเมินโรคซึมเศร้า 9 คำถาม (9Q)',
      description: 'ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการเหล่านี้บ่อยแค่ไหน',
      version: 1,
      status: FormStatus.ACTIVE,
      questions: {
        create: questions9Q.map((text, idx) => ({
          questionOrder: idx + 1,
          questionText: text,
          questionType: QuestionType.radio,
          required: true,
          options: {
            create: scale9QOptions,
          },
        })),
      },
      riskRules: {
        create: [
          {
            minScore: 0,
            maxScore: 6,
            riskLevel: RiskLevel.LOW,
            recommendation: 'ไม่มีอาการของโรคซึมเศร้าหรือมีอาการน้อยมาก แนะนำออกกำลังกายสม่ำเสมอ พักผ่อนและผ่อนคลายความเครียด',
            active: true,
          },
          {
            minScore: 7,
            maxScore: 12,
            riskLevel: RiskLevel.MODERATE,
            recommendation: 'มีอาการของโรคซึมเศร้าระดับน้อย แนะนำให้ปรับเปลี่ยนพฤติกรรม ทำกิจกรรมคลายเครียด ปรึกษาผู้ใกล้ชิด และประเมินซ้ำใน 2-4 สัปดาห์',
            active: true,
          },
          {
            minScore: 13,
            maxScore: 18,
            riskLevel: RiskLevel.HIGH,
            recommendation: 'มีอาการของโรคซึมเศร้าระดับปานกลาง แนะนำให้รับการประเมินเพิ่มเติมโดยบุคลากรทางการแพทย์ หรือทำแบบประเมินการฆ่าตัวตาย (8Q) ต่อ',
            active: true,
          },
          {
            minScore: 19,
            maxScore: 27,
            riskLevel: RiskLevel.CRITICAL,
            recommendation: 'มีอาการของโรคซึมเศร้าระดับรุนแรง จำเป็นต้องพบแพทย์หรือจิตแพทย์เพื่อรับการตรวจวินิจฉัยและดูแลรักษาโดยเร็ว หรือติดต่อสายด่วน 1323 ทันที',
            active: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Form 9Q seeded: ${form9Q.title}`);

  // ==========================================
  // FORM 3: ST-5 (แบบประเมินความเครียด 5 คำถาม)
  // ==========================================
  const scaleST5Options = [
    { label: 'แทบไม่มี', value: '0', score: 0, order: 1 },
    { label: 'บางครั้ง', value: '1', score: 1, order: 2 },
    { label: 'บ่อยครั้ง', value: '2', score: 2, order: 3 },
    { label: 'ประจำ', value: '3', score: 3, order: 4 },
  ];

  const questionsST5 = [
    'มีปัญหาการนอน นอนไม่หลับหรือนอนมากเกินไป',
    'มีสมาธิน้อยลง ความจำแย่ลง',
    'หงุดหงิด กระวนกระวาย ว้าวุ่นใจง่าย',
    'รู้สึกเบื่อ เซ็ง ไม่อยากพบปะผู้คน',
    'ไม่อยากทำอะไรเลย รู้สึกหมดพลัง',
  ];

  const formST5 = await prisma.screeningForm.upsert({
    where: { code: 'ST-5' },
    update: {},
    create: {
      code: 'ST-5',
      title: 'แบบประเมินความเครียด (ST-5)',
      description: 'ในระยะ 2-4 สัปดาห์ที่ผ่านมา ท่านมีอาการหรือพฤติกรรมต่อไปนี้บ่อยเพียงใด',
      version: 1,
      status: FormStatus.ACTIVE,
      questions: {
        create: questionsST5.map((text, idx) => ({
          questionOrder: idx + 1,
          questionText: text,
          questionType: QuestionType.radio,
          required: true,
          options: {
            create: scaleST5Options,
          },
        })),
      },
      riskRules: {
        create: [
          {
            minScore: 0,
            maxScore: 4,
            riskLevel: RiskLevel.LOW,
            recommendation: 'ระดับความเครียดน้อย สุขภาพจิตอยู่ในเกณฑ์ปกติ สามารถจัดการความเครียดในชีวิตประจำวันได้ดี',
            active: true,
          },
          {
            minScore: 5,
            maxScore: 7,
            riskLevel: RiskLevel.MODERATE,
            recommendation: 'ระดับความเครียดปานกลาง ควรหาเวลาผ่อนคลาย ออกกำลังกาย หรือทำงานอดิเรกที่ชื่นชอบ',
            active: true,
          },
          {
            minScore: 8,
            maxScore: 9,
            riskLevel: RiskLevel.HIGH,
            recommendation: 'ระดับความเครียดสูง แนะนำให้ปรึกษาผู้ที่ไว้วางใจ หรือปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต',
            active: true,
          },
          {
            minScore: 10,
            maxScore: 15,
            riskLevel: RiskLevel.CRITICAL,
            recommendation: 'ระดับความเครียดรุนแรงมาก อาจส่งผลกระทบต่อร่างกายและจิตใจอย่างรุนแรง ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญทันที',
            active: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Form ST-5 seeded: ${formST5.title}`);

  // ==========================================
  // FORM 4: 8Q (แบบประเมินการฆ่าตัวตาย 8 คำถาม)
  // ==========================================
  const form8Q = await prisma.screeningForm.upsert({
    where: { code: '8Q' },
    update: {},
    create: {
      code: '8Q',
      title: 'แบบประเมินการฆ่าตัวตาย 8 คำถาม (8Q)',
      description: 'แบบประเมินความเสี่ยงต่อการทำร้ายตนเองและฆ่าตัวตาย สำหรับประเมินความเร่งด่วนในการช่วยเหลือ',
      version: 1,
      status: FormStatus.ACTIVE,
      questions: {
        create: [
          {
            questionOrder: 1,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านคิดอยากตาย หรือคิดว่าตายไปจะดีกว่า หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 1, order: 2 },
              ],
            },
          },
          {
            questionOrder: 2,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านอยากทำร้ายตัวเอง หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 2, order: 2 },
              ],
            },
          },
          {
            questionOrder: 3,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านคิดจะฆ่าตัวตาย หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 6, order: 2 },
              ],
            },
          },
          {
            questionOrder: 4,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านมีแผนการที่จะฆ่าตัวตาย หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 8, order: 2 },
              ],
            },
          },
          {
            questionOrder: 5,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านได้เตรียมการที่จะทำร้ายตนเองหรือฆ่าตัวตายโดยตั้งใจจะให้ตายจริงหรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 9, order: 2 },
              ],
            },
          },
          {
            questionOrder: 6,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านได้ทำให้ตนเองบาดเจ็บ แต่ไม่ตั้งใจที่จะทำให้เสียชีวิต หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 4, order: 2 },
              ],
            },
          },
          {
            questionOrder: 7,
            questionText: 'ใน 1 เดือนที่ผ่านมารวมวันนี้ ท่านได้พยายามฆ่าตัวตายโดยคาดหวัง/ตั้งใจที่จะให้เสียชีวิต หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่มี', value: 'no', score: 0, order: 1 },
                { label: 'มี', value: 'yes', score: 10, order: 2 },
              ],
            },
          },
          {
            questionOrder: 8,
            questionText: 'ตลอดชีวิตที่ผ่านมา ท่านเคยพยายามฆ่าตัวตาย หรือไม่',
            questionType: QuestionType.radio,
            required: true,
            options: {
              create: [
                { label: 'ไม่เคย', value: 'no', score: 0, order: 1 },
                { label: 'เคย', value: 'yes', score: 4, order: 2 },
              ],
            },
          },
        ],
      },
      riskRules: {
        create: [
          {
            minScore: 0,
            maxScore: 0,
            riskLevel: RiskLevel.LOW,
            recommendation: 'ไม่มีความเสี่ยงต่อการทำร้ายตนเองหรือฆ่าตัวตาย',
            active: true,
          },
          {
            minScore: 1,
            maxScore: 8,
            riskLevel: RiskLevel.MODERATE,
            recommendation: 'มีความเสี่ยงต่อการทำร้ายตนเองในระดับน้อย ควรได้รับคำปรึกษาและเฝ้าระวังอาการอย่างสม่ำเสมอ',
            active: true,
          },
          {
            minScore: 9,
            maxScore: 16,
            riskLevel: RiskLevel.HIGH,
            recommendation: 'มีความเสี่ยงต่อการทำร้ายตนเองในระดับปานกลาง ต้องได้รับการดูแลจากผู้เชี่ยวชาญสุขภาพจิต และแจ้งผู้ดูแลใกล้ชิด',
            active: true,
          },
          {
            minScore: 17,
            maxScore: 50,
            riskLevel: RiskLevel.CRITICAL,
            recommendation: 'มีความเสี่ยงต่อการทำร้ายตนเองในระดับรุนแรงมาก ต้องเฝ้าระวังตลอด 24 ชั่วโมง และนำส่งโรงพยาบาลหรือติดต่อสายด่วน 1323 / 1669 ทันที',
            active: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Form 8Q seeded: ${form8Q.title}`);

  console.log('🎉 PDHPSYCO Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
