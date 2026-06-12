const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try {
    const res = await prisma.$queryRaw`
      SELECT conname, pg_get_constraintdef(pg_constraint.oid) as definition
      FROM pg_constraint
      JOIN pg_class ON conrelid = pg_class.oid
      WHERE relname = 'stock_movements' AND conname = 'stock_movement_type_check';
    `;
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message || e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
})();
