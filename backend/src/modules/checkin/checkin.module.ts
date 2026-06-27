import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CoinLog])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
