import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedeemController } from './redeem.controller';
import { RedeemService } from './redeem.service';
import { RedeemCode } from './entities/redeem.entity';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RedeemCode, User, CoinLog])],
  controllers: [RedeemController],
  providers: [RedeemService],
})
export class RedeemModule {}
