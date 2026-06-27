import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index
} from 'typeorm';

@Entity('subscription_orders')
export class SubscriptionOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ length: 64, unique: true })
  order_id: string;        // 平台订单号

  @Column({ length: 64, nullable: true })
  tt_order_id: string;     // TikTok订单号

  @Column({ length: 64 })
  product_id: string;      // 订阅商品ID

  @Column({ length: 64 })
  tier_id: string;         // 订阅档位ID

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'expired', 'refunded', 'cancelled'],
    default: 'pending'
  })
  @Index()
  status: string;

  @Column({ nullable: true })
  trial_start_time: Date;

  @Column({ nullable: true })
  trial_end_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  subscribe_time: Date;

  @Column({ nullable: true })
  @Index()
  expire_time: Date;

  @Column({ default: 1 })
  auto_renew: number;      // 是否自动续费

  @Column({ length: 128, nullable: true })
  tt_open_id: string;      // TikTok用户标识

  @Column({ length: 20, nullable: true })
  platform: string;        // tt / h5 / google / apple

  @Column({ type: 'text', nullable: true })
  callback_data: string;   // 最新回调原始数据

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('subscription_tiers')
export class SubscriptionTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  tier_id: string;         // weekly / monthly / yearly

  @Column({ length: 128 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column()
  duration_days: number;   // 有效期天数

  @Column({ default: 0 })
  trial_days: number;      // 试用天数

  @Column({ length: 128, nullable: true })
  tt_product_id: string;   // TikTok商品ID

  @Column({ length: 128, nullable: true })
  google_product_id: string;

  @Column({ length: 128, nullable: true })
  apple_product_id: string;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('subscription_callbacks')
export class SubscriptionCallback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  @Index()
  order_id: string;

  @Column({ length: 64 })
  event_type: string;      // payment.success / refund.success etc.

  @Column({ type: 'text' })
  callback_data: string;

  @Column({ default: 0 })
  processed: number;

  @CreateDateColumn()
  created_at: Date;
}
