import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Drama } from '../drama/entities/drama.entity';
import { Episode } from '../episode/entities/episode.entity';
import { SubscriptionOrder, SubscriptionTier } from '../subscription/entities/subscription.entity';
import { PaymentOrder } from '../payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Drama, Episode, SubscriptionOrder, SubscriptionTier, PaymentOrder])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
