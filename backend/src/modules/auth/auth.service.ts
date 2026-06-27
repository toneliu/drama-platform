import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * TikTok Minis 静默登录
   * 用 tt_open_id 查找/创建用户，返回JWT
   */
  async loginByTikTok(ttOpenId: string, nickname?: string, avatar?: string) {
    let user = await this.userRepo.findOne({ where: { tt_open_id: ttOpenId } });

    if (!user) {
      user = this.userRepo.create({
        tt_open_id: ttOpenId,
        nickname: nickname || `user_${Date.now()}`,
        avatar,
        invite_code: this.generateInviteCode(),
      });
      user = await this.userRepo.save(user);
    }

    return this.generateToken(user);
  }

  /**
   * H5端 手机号登录(简化版，实际需短信验证码)
   */
  async loginByPhone(phone: string) {
    let user = await this.userRepo.findOne({ where: { phone } });

    if (!user) {
      user = this.userRepo.create({
        phone,
        nickname: `user_${phone.slice(-4)}`,
        invite_code: this.generateInviteCode(),
      });
      user = await this.userRepo.save(user);
    }

    return this.generateToken(user);
  }

  /**
   * 生成JWT Token
   */
  private generateToken(user: User) {
    const payload = { sub: user.id, tt_open_id: user.tt_open_id };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        coins: user.coins,
        vip_status: user.vip_status,
        vip_expire_time: user.vip_expire_time,
        invite_code: user.invite_code,
      },
    };
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
