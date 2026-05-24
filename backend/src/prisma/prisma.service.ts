import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL!;
    // Railway sets absolute file: URLs; local dev uses relative ./
    const resolvedUrl =
      dbUrl && dbUrl.startsWith('file:./')
        ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:./', ''))}`
        : dbUrl;

    const adapter = new PrismaLibSql({ url: resolvedUrl });
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
