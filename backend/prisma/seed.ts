import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { generateAlerts } from '../scripts/generate-alerts';

const dbUrl = process.env.DATABASE_URL!;
const resolvedUrl =
  dbUrl && dbUrl.startsWith('file:./')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:./', ''))}`
    : dbUrl;

const adapter = new PrismaLibSql({ url: resolvedUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.alert.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('DefenderM8!', 10);
  await prisma.user.create({
    data: {
      username: 'analyst',
      email: 'analyst@defendermate.local',
      password: hashed,
    },
  });

  const alerts = generateAlerts(1000);
  const batchSize = 100;
  for (let i = 0; i < alerts.length; i += batchSize) {
    await prisma.alert.createMany({ data: alerts.slice(i, i + batchSize) });
  }
  console.log(`Seeded 1000 alerts and 1 user`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
