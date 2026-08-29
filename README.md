# PDHPSYCO (Pluak Daeng Hospital Mental Health Screening & Follow-up System)

ระบบคัดกรองสุขภาพจิตออนไลน์และระบบติดตามผลสำหรับ **โรงพยาบาลปลวกแดง** จังหวัดระยอง

---

## 🌟 จุดเด่นของระบบ (Key Features)

1. **Public Screening (Mobile-First)**
   - แบบประเมินคัดกรองสุขภาพจิตมาตรฐาน: **2Q**, **9Q**, **ST-5**, **8Q**
   - ใช้งานง่ายบนมือถือ สเต็ปเปอร์แสดงความก้าวหน้าทีละข้อ
   - รองรับการทำแบบประเมินแบบ **นิรนาม (Anonymous Token)** ไม่บังคับกรอกข้อมูลส่วนบุคคล
   - แสดงผลคะแนน ระดับความเสี่ยง และคำแนะนำทางการแพทย์ทันที

2. **Security & Data Privacy (PDPA Compliant)**
   - เข้ารหัสข้อมูลระบุตัวตน (เลขบัตรประชาชน, ชื่อ, เบอร์โทรศัพท์) ด้วย **AES-256-GCM**
   - มีระบบ Masking ข้อมูล PII อัตโนมัติ (`maskCitizenId`, `maskName`, `maskPhone`)
   - ไม่เก็บ Plaintext IP Address โดยเข้ารหัสด้วย SHA-256 Salted Hash
   - ไม่บันทึกข้อมูล PII ลง Application Logs หรือ Console

3. **High-Risk Workflow & Follow-up System**
   - ตรวจจับความเสี่ยงระดับ **HIGH** และ **CRITICAL** อัตโนมัติ
   - สร้าง Alert และ Follow-up Case สู่ระบบติดตาม
   - ระบบแจ้งเตือนเจ้าหน้าที่อัตโนมัติผ่าน **Telegram Bot** และ **n8n Webhook**
   - **Kanban Board** สำหรับบริหารจัดการเคสติดตาม (New, Contacted, Following, Referred, Closed) พร้อมระบบบันทึกไทม์ไลน์ความก้าวหน้า

4. **Modern Healthcare Dashboard & Analytics**
   - 8 การ์ดตัวชี้วัดสำคัญ (KPIs)
   - 6 กราฟสถิติขั้นสูง (Recharts): แนวโน้มรายวัน, สัดส่วนความเสี่ยง, สถิติตามแบบประเมิน, สถิติตามกลุ่มอายุ, สถานะการติดตาม, แนวโน้มรายเดือน
   - ระบบส่งออกรายงานรูปแบบ **CSV, Excel และ Print PDF**

5. **Dynamic Form Builder & RBAC**
   - สร้าง แก้ไข และเพิ่มแบบประเมินใหม่ได้ตลอดเวลา กำหนดคะแนนและเกณฑ์ความเสี่ยงได้อิสระ
   - ระบบจัดการสิทธิ์ผู้ใช้งาน: `SUPER_ADMIN`, `ADMIN`, `STAFF`, `VIEWER`
   - ระบบบันทึก **Audit Log** ติดตามกิจกรรมและความปลอดภัยทั้งหมด

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend / Fullstack**: Next.js 15+, React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Sonner, Zod
- **Backend**: Next.js App Router, Route Handlers, Server Actions, Prisma ORM, MySQL 8+, bcryptjs
- **Authentication**: NextAuth.js (Auth.js) JWT Session with Role Guard
- **Infrastructure**: Ubuntu 24.04, Node.js 22 LTS, PM2, Nginx Reverse Proxy, Certbot SSL, Docker

---

## 🚀 การติดตั้งและทดสอบในเครื่องพัฒนา (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอก Environment Variables
cp .env.example .env

# 3. สร้าง Prisma Client
npx prisma generate

# 4. Migrate Database (เมื่อต่อ MySQL)
npx prisma migrate dev

# 5. รัน Seed ข้อมูล Super Admin และแบบประเมิน 2Q, 9Q, ST-5, 8Q
npx prisma db seed

# 6. เริ่มต้น Development Server
npm run dev
```

เปิดบราวเซอร์ที่: [http://localhost:3000](http://localhost:3000)

---

## 🔒 ข้อมูลบัญชีผู้ดูแลระบบเริ่มต้น (Default Super Admin)

- **Email**: `admin@pdhpsyco.pluakdaenghospital.cloud` (กำหนดใน `.env` ผ่าน `SEED_ADMIN_EMAIL`)
- **Password**: กำหนดใน `.env` ผ่าน `SEED_ADMIN_PASSWORD` (ค่าตั้งต้นใน .env.example คือ `PdhAdminSecurePassword2026!`)

---

## 🌐 Production Deployment Summary

- **Production URL**: `https://pdhpsyco.pluakdaenghospital.cloud`
- **Application Port**: `127.0.0.1:3001`
- **Nginx Config**: `nginx/pdhpsyco.conf`
- **PM2 Config**: `ecosystem.config.cjs`
- **Backup Script**: `scripts/backup.sh`
- ดูคู่มือฉบับเต็มได้ที่ [DEPLOYMENT.md](file:///d:/pdhpsyco/DEPLOYMENT.md)

---

## 🏥 พัฒนาเพื่อ
**โรงพยาบาลปลวกแดง (Pluak Daeng Hospital)**
อำเภอปลวกแดง จังหวัดระยอง
