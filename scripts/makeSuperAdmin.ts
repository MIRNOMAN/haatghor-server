import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeSuperAdmin() {
  // Get email from command line argument or use default
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: bun run scripts/makeSuperAdmin.ts your-email@example.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    // Check current role
    console.log(`\n👤 Found user: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔐 Current role: ${user.role}`);

    // Update to SUPERADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPERADMIN' },
    });

    console.log(`\n✅ Successfully updated role to: ${updatedUser.role}`);
    console.log('🎉 User is now a SUPERADMIN!');
    console.log('\n💡 Please logout and login again in the dashboard for changes to take effect.\n');
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeSuperAdmin();
