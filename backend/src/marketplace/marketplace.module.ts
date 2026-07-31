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
  NonVotingAdherentsModule,
} from '../non-voting-adherents/non-voting-adherents.module';

import {
  MarketplaceController,
} from './marketplace.controller';

import {
  MarketplaceService,
} from './marketplace.service';

import {
  MarketplaceOffersService,
} from './marketplace-offers.service';

@Module({
imports: [
  PrismaModule,
  AuditLogsModule,
  NonVotingAdherentsModule,
],

  controllers: [
    MarketplaceController,
  ],

providers: [
  MarketplaceService,
  MarketplaceOffersService,
],

exports: [
  MarketplaceService,
  MarketplaceOffersService,
],
})
export class MarketplaceModule {}