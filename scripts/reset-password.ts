import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function listAndResetUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      active: true,
    },
  });

  console.log('📋 Current Users in PDHPSYCO Database:');
  console.table(users);

  // Optional: Reset superadmin password to default or custom
  const targetEmail = process.argv[2] || 'admin@pdhpsyco.pluakdaenghospital.cloud';
  const newPassword = process.argv[3] || 'PdhAdminSecurePassword2026!';

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: targetEmail }, { username: targetEmail }],
    },
  });

  if (user) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    console.log(`\n✅ Successfully reset password for user: ${user.username} (${user.email})`);
    console.log(`🔑 New Password: ${newPassword}`);
  } else {
    console.log(`\n⚠️ User not found for identifier: ${targetEmail}`);
  }
}

listAndResetUsers()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
