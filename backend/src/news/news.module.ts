import {
  Module,
} from '@nestjs/common';

import {
  AuditLogsModule,
} from '../audit-logs/audit-logs.module';

import {
  NewsController,
} from './news.controller';

import {
  NewsService,
} from './news.service';

@Module({
  imports: [
    AuditLogsModule,
  ],

  controllers: [
    NewsController,
  ],

  providers: [
    NewsService,
  ],
})
export class NewsModule {}