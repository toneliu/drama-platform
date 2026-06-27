import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CoinLog) private coinLogRepo: Repository<CoinLog>,
  ) {}

  /**
   * 每日签到
   */
  async dailyCheckin(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (user.last_checkin_date === today) {
      throw new BadRequestException('今日已签到');
    }

    // 检查是否连续签到
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = user.last_checkin_date === yesterday;

    user.checkin_days = isConsecutive ? user.checkin_days + 1 : 1;
    user.total_checkin_days += 1;
    user.last_checkin_date = today;

    // 计算奖励
    const reward = this.calculateReward(user.checkin_days);
    user.coins += reward;

    await this.userRepo.save(user);

    // 记录日志
    const log = this.coinLogRepo.create({
      user_id: userId,
      amount: reward,
      balance_after: user.coins,
      type: 'checkin',
      description: `连续签到第${user.checkin_days}天，获得${reward}金币`,
    });
    await this.coinLogRepo.save(log);

    return {
      success: true,
      checkin_days: user.checkin_days,
      total_checkin_days: user.total_checkin_days,
      reward,
      coins_remaining: user.coins,
    };
  }

  /**
   * 获取签到状态
   */
  async getStatus(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const today = new Date().toISOString().split('T')[0];

    return {
      checked_in_today: user.last_checkin_date === today,
      checkin_days: user.checkin_days,
      total_checkin_days: user.total_checkin_days,
      rewards: this.getRewardList(),
    };
  }

  /**
   * 计算签到奖励
   */
  private calculateReward(consecutiveDays: number): number {
    if (consecutiveDays >= 35) return 200;
    if (consecutiveDays >= 15) return 100;
    if (consecutiveDays >= 7) return 50;
    if (consecutiveDays >= 3) return 20;
    return 5;
  }

  /**
   * 获取奖励阶梯列表
   */
  private getRewardList() {
    return [
      { days: 1, reward: 5, label: '每日签到' },
      { days: 3, reward: 20, label: '累计签到3天' },
      { days: 7, reward: 50, label: '累计签到7天' },
      { days: 15, reward: 100, label: '累计签到15天' },
      { days: 35, reward: 200, label: '累计签到35天' },
    ];
  }
}
