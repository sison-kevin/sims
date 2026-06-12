const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try {
    const crypto = require('crypto');
    const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
    // create users
    // demo plaintext passwords: Alice -> admin123, Bob -> 12345678
    const alice = await prisma.users.upsert({ where: { email: 'alice@example.com' }, update: {}, create: { name: 'Alice Admin', email: 'alice@example.com', role: 'admin', password_hash: hash('admin123') } });
    const bob = await prisma.users.upsert({ where: { email: 'bob@example.com' }, update: {}, create: { name: 'Bob Clerk', email: 'bob@example.com', role: 'staff', password_hash: hash('12345678') } });

    // create products
    const p1 = await prisma.products.upsert({ where: { sku: 'TSHIRT-BLUE' }, update: {}, create: { name: 'Blue T-shirt', sku: 'TSHIRT-BLUE', barcode: '000111222333', category: 'Apparel', price: '19.99', cost_price: '8.50', stock_quantity: 50, reorder_level: 5 } });
    const p2 = await prisma.products.upsert({ where: { sku: 'MUG-RED' }, update: {}, create: { name: 'Red Mug', sku: 'MUG-RED', barcode: '000111222334', category: 'Home', price: '9.50', cost_price: '3.00', stock_quantity: 30, reorder_level: 3 } });
    const p3 = await prisma.products.upsert({ where: { sku: 'NOTE-A5' }, update: {}, create: { name: 'Notebook A5', sku: 'NOTE-A5', barcode: '000111222335', category: 'Stationery', price: '4.25', cost_price: '1.20', stock_quantity: 100, reorder_level: 10 } });

    // initial stock movements by Alice (use allowed types: STOCK_IN, STOCK_OUT, ADJUSTMENT)
    await prisma.stock_movements.create({ data: { product_id: p1.id, user_id: alice.id, type: 'STOCK_IN', quantity: 50, reason: 'Seed initial stock', balance_after: 50 } });
    await prisma.stock_movements.create({ data: { product_id: p2.id, user_id: alice.id, type: 'STOCK_IN', quantity: 30, reason: 'Seed initial stock', balance_after: 30 } });
    await prisma.stock_movements.create({ data: { product_id: p3.id, user_id: alice.id, type: 'STOCK_IN', quantity: 100, reason: 'Seed initial stock', balance_after: 100 } });

    // create a sale by Bob
    const sale = await prisma.sales.upsert({ where: { sale_number: 'S-1001' }, update: {}, create: { sale_number: 'S-1001', customer_name: 'Walk-in Customer', subtotal: '19.99', total: '19.99', user_id: bob.id } });
    await prisma.sale_items.createMany({ data: [ { sale_id: sale.id, product_id: p1.id, quantity: 1, unit_price: '19.99', line_total: '19.99' } ] });

    // audit log
    await prisma.audit_logs.create({ data: { user_id: alice.id, action: 'seed', description: 'Inserted demo seed data (users, products, stock, sale)' } });

    console.log('Seed complete');
    process.exit(0);
  } catch (e) {
    console.error('Seed error', e.message || e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
})();
