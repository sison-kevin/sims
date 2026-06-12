#!/usr/bin/env node
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: '.env.local' });

async function main() {
  const prisma = new PrismaClient();

  try {
    const products = await prisma.products.findMany({ take: 1 });
    console.log('OK products:', products.length);
  } catch (error) {
    console.error('ERR', error.code, error.name, error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
