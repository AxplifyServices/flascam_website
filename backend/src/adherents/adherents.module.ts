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
  AdherentsController,
} from './adherents.controller';

import {
  AdherentsService,
} from './adherents.service';

@Module({
  imports: [
    PrismaModule,
    AuditLogsModule,
  ],

  controllers: [
    AdherentsController,
  ],

  providers: [
    AdherentsService,
  ],

  exports: [
    AdherentsService,
  ],
})
export class AdherentsModule {}