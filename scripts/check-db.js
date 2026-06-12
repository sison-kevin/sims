const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try {
    const products = await prisma.products.count();
    const users = await prisma.users.count();
    console.log('OK:connected', `products=${products}`, `users=${users}`);
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message || e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
})();
