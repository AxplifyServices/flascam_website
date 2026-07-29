import {
  Module,
} from '@nestjs/common';

import {
  AuditLogsModule,
} from '../audit-logs/audit-logs.module';

import {
  VideosController,
} from './videos.controller';

import {
  VideosService,
} from './videos.service';

@Module({
  imports: [
    AuditLogsModule,
  ],

  controllers: [
    VideosController,
  ],

  providers: [
    VideosService,
  ],

  exports: [
    VideosService,
  ],
})
export class VideosModule {}