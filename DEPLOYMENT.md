# คู่มือการติดตั้งและ Deploy ระบบ PDHPSYCO บน Ubuntu 24.04 LTS

เอกสารนี้ระบุขั้นตอนการติดตั้งระบบ **PDHPSYCO** (ระบบคัดกรองสุขภาพจิตและติดตามผล โรงพยาบาลปลวกแดง) บน Ubuntu 24.04 Server โดยใช้สถาปัตยกรรม **Next.js 15+ + PM2 + Nginx Reverse Proxy + MySQL 8 + Certbot SSL**

---

## 1. ข้อมูลระบบและพารามิเตอร์หลัก
- **Production URL**: `https://pdhpsyco.pluakdaenghospital.cloud`
- **Application Local Port**: `127.0.0.1:3001` (ไม่เปิดสู่ Public Internet โดยตรง)
- **Application Directory**: `/var/www/pdhpsyco/source`
- **Database Name**: `pdhpsyco`
- **Node.js Version**: Node.js 22 LTS

---

## 2. การเตรียมความพร้อมบน Ubuntu 24.04

```bash
# อัปเดตแพ็กเกจระบบ
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban unzip build-essential nginx mysql-server certbot python3-certbot-nginx
```

---

## 3. การติดตั้ง Node.js 22 LTS และ PM2

```bash
# ติดตั้ง Node.js 22 ผ่าน NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# ตรวจสอบเวอร์ชัน
node -v  # v22.x.x
npm -v   # 10.x.x หรือ 11.x.x

# ติดตั้ง PM2 Global
sudo npm install -g pm2
```

---

## 4. การตั้งค่าฐานข้อมูล MySQL 8+

```bash
sudo mysql
```

รันคำสั่ง SQL สร้างฐานข้อมูลและ User:

```sql
CREATE DATABASE pdhpsyco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'pdh_user'@'localhost' IDENTIFIED BY 'StrongHospitalPassword2026!';
GRANT ALL PRIVILEGES ON pdhpsyco.* TO 'pdh_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Clone และตั้งค่า Directory โครงการ

```bash
sudo mkdir -p /var/www/pdhpsyco/source
sudo chown -R $USER:$USER /var/www/pdhpsyco

cd /var/www/pdhpsyco/source
git clone <GITHUB_REPOSITORY_URL> .
```

---

## 6. การสร้างและตั้งค่าไฟล์ `.env` สำหรับ Production

```bash
cp .env.example .env
nano .env
```

ระบุค่า Production Environment Variables:

```env
NODE_ENV="production"
PORT=3001
APP_URL="https://pdhpsyco.pluakdaenghospital.cloud"
NEXTAUTH_URL="https://pdhpsyco.pluakdaenghospital.cloud"

# สุ่มคีย์ความยาว 32 bytes (สร้างด้วย openssl rand -base64 32)
AUTH_SECRET="สุ่มคีย์32ตัวอักษรเพื่อความปลอดภัย"
NEXTAUTH_SECRET="สุ่มคีย์32ตัวอักษรเพื่อความปลอดภัย"

DATABASE_URL="mysql://pdh_user:StrongHospitalPassword2026!@127.0.0.1:3306/pdhpsyco"
ENCRYPTION_KEY="สุ่มคีย์สำหรับเข้ารหัสข้อมูลส่วนบุคคล32ตัวอักษร"

SEED_ADMIN_EMAIL="admin@pdhpsyco.pluakdaenghospital.cloud"
SEED_ADMIN_PASSWORD="ตั้งรหัสผ่านSuperAdminที่ปลอดภัยมาก"
SEED_ADMIN_NAME="Super Administrator"

# Integrations (Optional)
TELEGRAM_BOT_TOKEN="123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TELEGRAM_CHAT_ID="-100xxxxxxxxxx"
N8N_WEBHOOK_URL="https://n8n.yourdomain.com/webhook/mental-health-alert"
```

---

## 7. ติดตั้ง Dependencies, Migrate Database และ Build โครงการ

```bash
# ติดตั้ง dependencies ตาม package-lock.json
npm ci

# สร้าง Prisma Client และ Migrate Database
npx prisma generate
npx prisma migrate deploy

# รัน Seed ข้อมูล Super Admin และแบบประเมิน 2Q, 9Q, 8Q, ST-5
npx tsx prisma/seed.ts

# Build Production Bundle
npm run build
```

---

## 8. ตั้งค่า PM2 Service

```bash
# เริ่มต้นรันด้วย ecosystem config
pm2 start ecosystem.config.cjs

# บันทึกสถานะ PM2 และตั้งให้เปิดอัตโนมัติเมื่อรีสตาร์ท Server
pm2 save
pm2 startup
# (รันคำสั่ง sudo env PATH=... ที่ PM2 แนะนำ)
```

---

## 9. การตั้งค่า Nginx Reverse Proxy และ SSL Certbot

คัดลอกไฟล์ Nginx config:

```bash
sudo cp nginx/pdhpsyco.conf /etc/nginx/sites-available/pdhpsyco.conf
sudo ln -s /etc/nginx/sites-available/pdhpsyco.conf /etc/nginx/sites-enabled/

# ทดสอบ syntax
sudo nginx -t
sudo systemctl reload nginx

# ขอใบรับรอง SSL ฟรีด้วย Certbot
sudo certbot --nginx -d pdhpsyco.pluakdaenghospital.cloud
```

---

## 10. การตั้งค่า Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 11. Workflow การ Deploy / Update ผ่าน GitHub

เมื่อมีการ push โค้ดใหม่ขึ้น GitHub `main`:

```bash
cd /var/www/pdhpsyco/source

git fetch origin
git reset --hard origin/main

npm ci

npx prisma generate
npx prisma migrate deploy

npm run build

pm2 reload pdhpsyco

sudo nginx -t
sudo systemctl reload nginx
```

---

## 12. Automated Backup Script & Crontab

```bash
chmod +x /var/www/pdhpsyco/source/scripts/backup.sh

# เพิ่มใน crontab เพื่อสำรองข้อมูลทุกวันเวลา 02:00 น.
crontab -e
```

เพิ่มบรรทัดนี้:
```cron
0 2 * * * DB_NAME=pdhpsyco DB_USER=pdh_user DB_PASS=StrongHospitalPassword2026! /var/www/pdhpsyco/source/scripts/backup.sh >> /var/log/pdhpsyco_backup.log 2>&1
```

---

## 13. การตรวจสอบความพร้อมของระบบ (Health Check)

```bash
curl -I https://pdhpsyco.pluakdaenghospital.cloud/api/health
```

ผลลัพธ์:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-..."
}
```
