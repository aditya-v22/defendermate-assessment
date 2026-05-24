import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAlertsDto } from './dto/get-alerts.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetAlertsDto) {
    const { page = 1, limit = 25, sortBy = 'timestamp', sortOrder = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(dto);

    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data: data.map((a) => this.formatAlert(a)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    return this.formatAlert(alert);
  }

  async update(id: string, dto: UpdateAlertDto) {
    const existing = await this.prisma.alert.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.assignee !== undefined) updateData.assignee = dto.assignee;

    if (dto.severity !== undefined) {
      updateData.severity = dto.severity;
      updateData.severityRank = this.getSeverityRank(dto.severity);
    }

    const updated = await this.prisma.alert.update({
      where: { id },
      data: updateData,
    });

    return this.formatAlert(updated);
  }

  async getTimeline(days = 30) {
    const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
    const rows: { date: string; count: number }[] = await this.prisma.$queryRaw`
      SELECT
        strftime('%Y-%m-%d', timestamp) AS date,
        COUNT(*) AS count
      FROM Alert
      WHERE timestamp >= ${since}
      GROUP BY date
      ORDER BY date ASC
    `;

    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getStats() {
    const [bySeverity, byStatus, byCategory] = await Promise.all([
      this.prisma.alert.groupBy({ by: ['severity'], _count: { id: true } }),
      this.prisma.alert.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.alert.groupBy({ by: ['category'], _count: { id: true } }),
    ]);

    return {
      bySeverity: bySeverity.map((r) => ({ severity: r.severity, count: r._count.id })),
      byStatus: byStatus.map((r) => ({ status: r.status, count: r._count.id })),
      byCategory: byCategory.map((r) => ({ category: r.category, count: r._count.id })),
    };
  }

  private buildWhereClause(dto: GetAlertsDto) {
    const where: any = {};

    if (dto.severity) {
      where.severity = { in: dto.severity.split(',').map((s) => s.trim()) };
    }

    if (dto.status) {
      where.status = { in: dto.status.split(',').map((s) => s.trim()) };
    }

    if (dto.category) {
      where.category = { in: dto.category.split(',').map((s) => s.trim()) };
    }

    if (dto.source) {
      where.source = { in: dto.source.split(',').map((s) => s.trim()) };
    }

    if (dto.from || dto.to) {
      where.timestamp = {};
      if (dto.from) where.timestamp.gte = new Date(dto.from);
      if (dto.to) where.timestamp.lte = new Date(dto.to);
    }

    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search } },
        { description: { contains: dto.search } },
      ];
    }

    return where;
  }

  private formatAlert(alert: any) {
    let rawEvent: unknown;
    try {
      rawEvent = JSON.parse(alert.rawEvent);
    } catch {
      rawEvent = {};
    }
    return { ...alert, rawEvent };
  }

  private getSeverityRank(severity: string): number {
    const ranks: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return ranks[severity] ?? 1;
  }
}
