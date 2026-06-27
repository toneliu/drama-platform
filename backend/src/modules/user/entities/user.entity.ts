import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128, nullable: true })
  @Index()
  tt_open_id: string;  // TikTok用户标识

  @Column({ length: 128, nullable: true })
  @Index()
  h5_token: string;    // H5端登录token

  @Column({ length: 64, nullable: true })
  nickname: string;

  @Column({ length: 512, nullable: true })
  avatar: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: 0 })
  coins: number;        // 金币余额

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;      // 现金余额

  @Column({ type: 'enum', enum: ['none', 'active', 'expired'], default: 'none' })
  vip_status: string;

  @Column({ nullable: true })
  vip_expire_time: Date;

  @Column({ default: 0 })
  checkin_days: number; // 连续签到天数

  @Column({ default: 0 })
  total_checkin_days: number;

  @Column({ nullable: true })
  last_checkin_date: string; // YYYY-MM-DD

  @Column({ nullable: true })
  @Index()
  invite_code: string;  // 邀请码

  @Column({ nullable: true })
  invited_by: number;   // 邀请人ID

  @Column({ default: 1 })
  status: number;       // 1=正常 0=禁用

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
