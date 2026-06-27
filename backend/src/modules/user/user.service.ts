import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      coins: user.coins,
      balance: user.balance,
      vip_status: user.vip_status,
      vip_expire_time: user.vip_expire_time,
      checkin_days: user.checkin_days,
      total_checkin_days: user.total_checkin_days,
      invite_code: user.invite_code,
      created_at: user.created_at,
    };
  }

  async updateProfile(userId: number, data: Partial<User>) {
    await this.userRepo.update(userId, data);
    return this.getProfile(userId);
  }
}
