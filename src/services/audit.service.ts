import { prisma } from '@/lib/db/prisma';
import { hashIp } from '@/lib/security/ip-hash';
import { logger } from '@/lib/security/logger';

export interface RecordAuditInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | string;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Records an audit log event
   */
  static async record(input: RecordAuditInput) {
    try {
      const metaString =
        typeof input.metadata === 'object' ? JSON.stringify(input.metadata) : input.metadata || null;

      await prisma.auditLog.create({
        data: {
          userId: input.userId || null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId || null,
          metadata: metaString,
          ipHash: hashIp(input.ipAddress),
        },
      });
    } catch (error) {
      logger.error('Failed to write audit log', error);
    }
  }

  /**
   * Lists audit logs with pagination and filters
   */
  static async listLogs(params: {
    action?: string;
    entity?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;
    if (params.userId) where.userId = params.userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, username: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
