import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedeemCode } from './entities/redeem.entity';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';

@Injectable()
export class RedeemService {
  constructor(
    @InjectRepository(RedeemCode) private codeRepo: Repository<RedeemCode>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CoinLog) private coinLogRepo: Repository<CoinLog>,
  ) {}

  /**
   * 兑换码
   */
  async redeem(userId: number, code: string) {
    const redeemCode = await this.codeRepo.findOne({ where: { code, status: 1 } });
    if (!redeemCode) throw new NotFoundException('兑换码无效');
    if (redeemCode.used) throw new BadRequestException('兑换码已使用');
    if (redeemCode.expire_time && redeemCode.expire_time < new Date()) {
      throw new BadRequestException('兑换码已过期');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });

    // 标记已使用
    redeemCode.used = 1;
    redeemCode.used_by = userId;
    redeemCode.used_at = new Date();
    await this.codeRepo.save(redeemCode);

    // 发放金币
    if (redeemCode.coins > 0) {
      user.coins += redeemCode.coins;
      await this.userRepo.save(user);

      const log = this.coinLogRepo.create({
        user_id: userId,
        amount: redeemCode.coins,
        balance_after: user.coins,
        type: 'system',
        description: `兑换码 ${code} 充值 ${redeemCode.coins} 金币`,
      });
      await this.coinLogRepo.save(log);
    }

    // 发放VIP
    if (redeemCode.vip_days > 0) {
      const currentExpire = user.vip_expire_time && user.vip_expire_time > new Date()
        ? user.vip_expire_time
        : new Date();
      user.vip_status = 'active';
      user.vip_expire_time = new Date(currentExpire.getTime() + redeemCode.vip_days * 86400000);
      await this.userRepo.save(user);
    }

    return {
      success: true,
      coins: redeemCode.coins,
      vip_days: redeemCode.vip_days,
    };
  }
}
