import { prisma } from '../api/_lib/prisma';

async function main() {
  console.log('Starter template database seed ready (no-op).');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
