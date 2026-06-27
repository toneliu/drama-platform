import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index
} from 'typeorm';

@Entity('payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ length: 64, unique: true })
  order_id: string;        // 平台订单号

  @Column({ length: 64, nullable: true })
  tt_order_id: string;     // TikTok订单号

  @Column({
    type: 'enum',
    enum: ['coins', 'vip', 'episode'],
    default: 'coins'
  })
  order_type: string;      // coins=金币充值 vip=VIP购买 episode=单集购买

  @Column({ length: 64, nullable: true })
  product_id: string;      // 商品ID

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;          // 支付金额

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  })
  @Index()
  status: string;

  @Column({ length: 20 })
  pay_method: string;      // alipay / wechat / tt / google / apple

  @Column({ default: 0 })
  coins_amount: number;    // 购买的金币数

  @Column({ default: 0 })
  bonus_coins: number;     // 赠送金币

  @Column({ nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  callback_data: string;

  @Column({ length: 20, nullable: true })
  platform: string;        // tt / h5

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('coin_logs')
export class CoinLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column()
  amount: number;          // 变动数量(正=收入 负=支出)

  @Column()
  balance_after: number;   // 变动后余额

  @Column({
    type: 'enum',
    enum: ['recharge', 'purchase', 'checkin', 'invite', 'system', 'refund'],
  })
  type: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ nullable: true })
  related_id: number;      // 关联ID(订单ID/剧集ID等)

  @CreateDateColumn()
  created_at: Date;
}
