import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Drama } from '../drama/entities/drama.entity';
import { Episode } from '../episode/entities/episode.entity';
import { SubscriptionOrder, SubscriptionTier } from '../subscription/entities/subscription.entity';
import { PaymentOrder } from '../payment/entities/payment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Drama) private dramaRepo: Repository<Drama>,
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
    @InjectRepository(SubscriptionOrder) private subOrderRepo: Repository<SubscriptionOrder>,
    @InjectRepository(SubscriptionTier) private subTierRepo: Repository<SubscriptionTier>,
    @InjectRepository(PaymentOrder) private payOrderRepo: Repository<PaymentOrder>,
  ) {}

  /**
   * 仪表盘统计
   */
  async getDashboard() {
    const [
      totalUsers,
      totalDramas,
      totalEpisodes,
      totalRevenue,
      todayUsers,
      activeSubscriptions,
    ] = await Promise.all([
      this.userRepo.count(),
      this.dramaRepo.count(),
      this.episodeRepo.count(),
      this.payOrderRepo
        .createQueryBuilder('o')
        .select('SUM(o.amount)', 'total')
        .where('o.status = :s', { s: 'paid' })
        .getRawOne(),
      this.userRepo
        .createQueryBuilder('u')
        .where('DATE(u.created_at) = CURDATE()')
        .getCount(),
      this.subOrderRepo.count({ where: { status: 'active' } }),
    ]);

    return {
      total_users: totalUsers,
      total_dramas: totalDramas,
      total_episodes: totalEpisodes,
      total_revenue: parseFloat(totalRevenue?.total || '0'),
      today_users: todayUsers,
      active_subscriptions: activeSubscriptions,
    };
  }

  /**
   * 用户管理列表
   */
  async getUsers(page = 1, limit = 20, keyword?: string) {
    const qb = this.userRepo.createQueryBuilder('u');

    if (keyword) {
      qb.where('(u.nickname LIKE :kw OR u.phone LIKE :kw OR u.tt_open_id LIKE :kw)',
        { kw: `%${keyword}%` });
    }

    const [items, total] = await qb
      .orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  /**
   * 订阅管理列表
   */
  async getSubscriptions(page = 1, limit = 20, status?: string) {
    const qb = this.subOrderRepo.createQueryBuilder('o');

    if (status) {
      qb.where('o.status = :s', { s: status });
    }

    const [items, total] = await qb
      .orderBy('o.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  /**
   * 订阅档位管理
   */
  async getTiers() {
    return this.subTierRepo.find({ order: { sort_order: 'ASC' } });
  }

  async createTier(data: Partial<SubscriptionTier>) {
    const tier = this.subTierRepo.create(data);
    return this.subTierRepo.save(tier);
  }

  async updateTier(id: number, data: Partial<SubscriptionTier>) {
    await this.subTierRepo.update(id, data);
    return this.subTierRepo.findOne({ where: { id } });
  }
}
