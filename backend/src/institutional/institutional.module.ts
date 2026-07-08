import {
  Module,
} from '@nestjs/common';

import {
  InstitutionalController,
} from './institutional.controller';

import {
  InstitutionalService,
} from './institutional.service';

@Module({
  controllers: [
    InstitutionalController,
  ],
  providers: [
    InstitutionalService,
  ],
  exports: [
    InstitutionalService,
  ],
})
export class InstitutionalModule {}