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
  NonVotingAdherentsController,
} from './non-voting-adherents.controller';

import {
  NonVotingAdherentsService,
} from './non-voting-adherents.service';

@Module({
  imports: [
    PrismaModule,
    AuditLogsModule,
  ],

  controllers: [
    NonVotingAdherentsController,
  ],

  providers: [
    NonVotingAdherentsService,
  ],

  exports: [
    NonVotingAdherentsService,
  ],
})
export class NonVotingAdherentsModule {}