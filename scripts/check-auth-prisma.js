const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
(async ()=>{
  const prisma = new PrismaClient();
  try{
    const email = 'alice@example.com';
    const password = 'admin123';
    const user = await prisma.users.findUnique({ where: { email } });
    console.log('db user:', user ? { id: user.id, email: user.email, role: user.role, password_hash: user.password_hash } : null);
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    console.log('computed hash', hash);
    console.log('match?', user && user.password_hash === hash);
    process.exit(0);
  }catch(e){console.error(e); process.exit(2);}finally{await prisma.$disconnect();}
})();
