import { Injectable } from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';

import {
  PrismaService,
} from '../prisma/prisma.service';

type AuditInput = {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Prisma.InputJsonObject;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async log(
    input: AuditInput,
  ): Promise<void> {
    await this.prisma.audit_logs.create({
      data: {
        user_id:
          input.userId ?? null,
        action: input.action,
        entity_type:
          input.entityType,
        entity_id:
          input.entityId,
        description:
          input.description,
        metadata:
          input.metadata,
        ip_address:
          input.ipAddress,
        user_agent:
          input.userAgent,
      },
    });
  }
}