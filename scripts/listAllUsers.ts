import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('📭 No users found in database');
      return;
    }

    console.log(`\n👥 Found ${users.length} user(s):\n`);
    console.log('━'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Role: ${user.role}`);
      console.log(`   📊 Status: ${user.status}`);
      console.log(`   📅 Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log('━'.repeat(80));
    });

    const superAdmins = users.filter(u => u.role === 'SUPERADMIN');
    console.log(`\n✅ Super Admins: ${superAdmins.length}`);
    console.log(`👤 Regular Users: ${users.filter(u => u.role === 'USER').length}\n`);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
