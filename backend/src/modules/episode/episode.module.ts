import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { Episode } from './entities/episode.entity';
import { UnlockRecord } from './entities/unlock-record.entity';
import { Drama } from '../drama/entities/drama.entity';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';
import { SubscriptionOrder } from '../subscription/entities/subscription.entity';
import { CdnModule } from '../cdn/cdn.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Episode, UnlockRecord, Drama, User, CoinLog, SubscriptionOrder]),
    CdnModule,
  ],
  controllers: [EpisodeController],
  providers: [EpisodeService],
  exports: [EpisodeService],
})
export class EpisodeModule {}
