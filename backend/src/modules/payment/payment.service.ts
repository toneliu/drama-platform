import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PaymentOrder, CoinLog } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentOrder) private orderRepo: Repository<PaymentOrder>,
    @InjectRepository(CoinLog) private coinLogRepo: Repository<CoinLog>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /**
   * 获取金币充值套餐列表
   */
  async getCoinPackages() {
    // 从数据库或配置读取，这里简化返回固定套餐
    return [
      { id: 'coin1000', coins: 1000, price: 0.50, original_price: 19.90, bonus: 10 },
      { id: 'coin2000', coins: 2000, price: 19.90, original_price: 29.90, bonus: 50 },
      { id: 'coin3000', coins: 3000, price: 29.90, original_price: 29.90, bonus: 80 },
      { id: 'coin4000', coins: 4000, price: 39.90, original_price: 39.90, bonus: 100 },
    ];
  }

  /**
   * 创建充值订单
   */
  async createRechargeOrder(userId: number, packageId: string, payMethod: string, platform: string = 'h5') {
    const packages = await this.getCoinPackages();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new BadRequestException('套餐不存在');

    const orderId = `PAY_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const order = this.orderRepo.create({
      user_id: userId,
      order_id: orderId,
      order_type: 'coins',
      product_id: packageId,
      amount: pkg.price,
      pay_method: payMethod,
      coins_amount: pkg.coins,
      bonus_coins: pkg.bonus,
      platform,
    });

    await this.orderRepo.save(order);

    return { order_id: orderId, amount: pkg.price, coins: pkg.coins, bonus: pkg.bonus };
  }

  /**
   * 支付成功回调
   */
  async handlePaySuccess(orderId: string, ttOrderId?: string) {
    const order = await this.orderRepo.findOne({ where: { order_id: orderId } });
    if (!order || order.status !== 'pending') return;

    order.status = 'paid';
    order.paid_at = new Date();
    if (ttOrderId) order.tt_order_id = ttOrderId;
    await this.orderRepo.save(order);

    // 充值金币
    if (order.order_type === 'coins') {
      const totalCoins = order.coins_amount + order.bonus_coins;
      const user = await this.userRepo.findOne({ where: { id: order.user_id } });
      user.coins += totalCoins;
      await this.userRepo.save(user);

      // 记录日志
      const log = this.coinLogRepo.create({
        user_id: order.user_id,
        amount: totalCoins,
        balance_after: user.coins,
        type: 'recharge',
        description: `充值${order.coins_amount}金币 + 赠送${order.bonus_coins}金币`,
        related_id: order.id,
      });
      await this.coinLogRepo.save(log);
    }
  }

  /**
   * 获取用户充值记录
   */
  async getUserOrders(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.orderRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  /**
   * 获取金币变动记录
   */
  async getCoinLogs(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.coinLogRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }
}
