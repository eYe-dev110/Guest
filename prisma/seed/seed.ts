import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';


const prisma = new PrismaClient();

async function main() { 
  //Create Admin Manager Role
  const systemAdmiRole = await prisma.role.create({
    data: {
      name: 'system_admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  //Create Admin Manager
  const hashedPassword = await bcryptjs.hash('admin', 10);
  
  await prisma.user.create({
    data: {
      role_id: systemAdmiRole.id,
      user_name: 'admin',
      password: hashedPassword
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
