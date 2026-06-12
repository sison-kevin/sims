const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const crypto = require('crypto');
    const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
    await prisma.users.update({ where: { email: 'alice@example.com' }, data: { password_hash: hash('admin123') } });
    await prisma.users.update({ where: { email: 'bob@example.com' }, data: { password_hash: hash('12345678') } });
    console.log('Passwords updated');
  }catch(e){
    console.error('ERR', e);
    process.exit(2);
  }finally{
    await prisma.$disconnect();
  }
})();
