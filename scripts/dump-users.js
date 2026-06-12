const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const users = await prisma.users.findMany({ select: { id: true, email: true, name: true, password_hash: true, role: true } });
    console.log(JSON.stringify(users, null, 2));
  }catch(e){
    console.error(e);
    process.exit(2);
  }finally{
    await prisma.$disconnect();
  }
})();
