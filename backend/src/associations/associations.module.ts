import {
  Module,
} from '@nestjs/common';

import {
  AuditLogsModule,
} from '../audit-logs/audit-logs.module';

import {
  PrismaModule,
} from '../prisma/prisma.module';

import {
  AssociationsController,
} from './associations.controller';

import {
  AssociationsService,
} from './associations.service';

@Module({
  imports: [
    PrismaModule,
    AuditLogsModule,
  ],
  controllers: [
    AssociationsController,
  ],
  providers: [
    AssociationsService,
  ],
})
export class AssociationsModule {}