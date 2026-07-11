import {
  Module,
} from '@nestjs/common';

import {
  HomepageHeroController,
} from './homepage-hero.controller';

import {
  HomepageHeroService,
} from './homepage-hero.service';

@Module({
  controllers: [
    HomepageHeroController,
  ],
  providers: [
    HomepageHeroService,
  ],
})
export class HomepageHeroModule {}