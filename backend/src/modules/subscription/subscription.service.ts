import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { SubscriptionOrder, SubscriptionTier, SubscriptionCallback } from './entities/subscription.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionOrder) private orderRepo: Repository<SubscriptionOrder>,
    @InjectRepository(SubscriptionTier) private tierRepo: Repository<SubscriptionTier>,
    @InjectRepository(SubscriptionCallback) private callbackRepo: Repository<SubscriptionCallback>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /**
   * 获取所有订阅档位
   */
  async getTiers() {
    return this.tierRepo.find({
      where: { status: 1 },
      order: { sort_order: 'ASC' },
    });
  }

  /**
   * 创建订阅订单 (前端调用 TTMinis.subscribe 前先创建)
   */
  async createOrder(userId: number, tierId: string, platform: string = 'tt') {
    const tier = await this.tierRepo.findOne({ where: { tier_id: tierId, status: 1 } });
    if (!tier) throw new NotFoundException('订阅档位不存在');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const orderId = `SUB_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const order = this.orderRepo.create({
      user_id: userId,
      order_id: orderId,
      product_id: tier.tier_id,
      tier_id: tierId,
      status: 'pending',
      paid_amount: tier.price,
      currency: tier.currency,
      tt_open_id: user.tt_open_id,
      platform,
      trial_start_time: tier.trial_days > 0 ? new Date() : null,
      trial_end_time: tier.trial_days > 0
        ? new Date(Date.now() + tier.trial_days * 86400000)
        : null,
    });

    await this.orderRepo.save(order);

    return {
      order_id: orderId,
      tier: {
        tier_id: tier.tier_id,
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        duration_days: tier.duration_days,
        trial_days: tier.trial_days,
      },
    };
  }

  /**
   * 处理支付回调 (TikTok / Google / Apple)
   */
  async handleCallback(orderId: string, eventType: string, callbackData: any) {
    // 记录回调日志
    const callback = this.callbackRepo.create({
      order_id: orderId,
      event_type: eventType,
      callback_data: JSON.stringify(callbackData),
    });
    await this.callbackRepo.save(callback);

    const order = await this.orderRepo.findOne({ where: { order_id: orderId } });
    if (!order) {
      console.warn(`[Subscription] Order not found: ${orderId}`);
      return { success: false, message: 'Order not found' };
    }

    switch (eventType) {
      case 'payment.success':
        return this.handlePaymentSuccess(order, callbackData);
      case 'refund.success':
        return this.handleRefundSuccess(order);
      case 'refund.failed':
        return { success: true, message: 'Refund failed noted' };
      case 'subscription.expired':
        return this.handleExpired(order);
      default:
        return { success: true, message: 'Event received' };
    }
  }

  /**
   * 支付成功 → 激活订阅
   */
  private async handlePaymentSuccess(order: SubscriptionOrder, data: any) {
    const tier = await this.tierRepo.findOne({ where: { tier_id: order.tier_id } });

    order.status = 'active';
    order.subscribe_time = new Date();
    order.expire_time = new Date(Date.now() + (tier.duration_days || 30) * 86400000);
    order.callback_data = JSON.stringify(data);
    await this.orderRepo.save(order);

    // 更新用户VIP状态
    await this.userRepo.update(order.user_id, {
      vip_status: 'active',
      vip_expire_time: order.expire_time,
    });

    // 标记回调已处理
    await this.callbackRepo.update(
      { order_id: order.order_id },
      { processed: 1 },
    );

    return { success: true, message: 'Subscription activated' };
  }

  /**
   * 退款成功 → 终止订阅
   */
  private async handleRefundSuccess(order: SubscriptionOrder) {
    order.status = 'refunded';
    await this.orderRepo.save(order);

    // 检查用户是否还有其他有效订阅
    const activeCount = await this.orderRepo.count({
      where: { user_id: order.user_id, status: 'active' },
    });

    if (activeCount === 0) {
      await this.userRepo.update(order.user_id, {
        vip_status: 'expired',
      });
    }

    return { success: true, message: 'Refund processed' };
  }

  /**
   * 订阅过期
   */
  private async handleExpired(order: SubscriptionOrder) {
    order.status = 'expired';
    order.auto_renew = 0;
    await this.orderRepo.save(order);

    // 检查是否有其他有效订阅
    const activeCount = await this.orderRepo.count({
      where: { user_id: order.user_id, status: 'active' },
    });

    if (activeCount === 0) {
      await this.userRepo.update(order.user_id, {
        vip_status: 'expired',
      });
    }

    return { success: true, message: 'Subscription expired' };
  }

  /**
   * 获取用户当前订阅状态
   */
  async getStatus(userId: number) {
    const activeOrder = await this.orderRepo.findOne({
      where: { user_id: userId, status: 'active' },
      order: { expire_time: 'DESC' },
    });

    if (!activeOrder) {
      return { subscribed: false };
    }

    // 检查是否过期
    if (activeOrder.expire_time < new Date()) {
      activeOrder.status = 'expired';
      activeOrder.auto_renew = 0;
      await this.orderRepo.save(activeOrder);
      await this.userRepo.update(userId, { vip_status: 'expired' });
      return { subscribed: false };
    }

    return {
      subscribed: true,
      tier_id: activeOrder.tier_id,
      expire_time: activeOrder.expire_time,
      auto_renew: !!activeOrder.auto_renew,
    };
  }

  /**
   * 取消自动续费
   */
  async cancelAutoRenew(userId: number) {
    await this.orderRepo.update(
      { user_id: userId, status: 'active' },
      { auto_renew: 0 },
    );
    return { success: true, message: 'Auto-renew cancelled' };
  }
}
