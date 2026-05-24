import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcrypt';
import { generateAlerts } from '../scripts/generate-alerts';

dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL!;
  const resolvedUrl =
    dbUrl && dbUrl.startsWith('file:./')
      ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:./', ''))}`
      : dbUrl;

  const adapter = new PrismaLibSql({ url: resolvedUrl });
  const prisma = new PrismaClient({ adapter } as any);

  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log('Database already seeded, skipping.');
    await prisma.$disconnect();
    return;
  }

  console.log('Seeding database...');

  const hashed = await bcrypt.hash('DefenderM8!', 10);
  await prisma.user.create({
    data: {
      username: 'analyst',
      email: 'analyst@defendermate.local',
      password: hashed,
    },
  });

  console.log('Created analyst user');

  const alerts = generateAlerts(1000);
  const batchSize = 100;
  for (let i = 0; i < alerts.length; i += batchSize) {
    await prisma.alert.createMany({ data: alerts.slice(i, i + batchSize) });
    console.log(`Inserted ${Math.min(i + batchSize, alerts.length)} / ${alerts.length} alerts`);
  }

  console.log('Seeding complete.');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
