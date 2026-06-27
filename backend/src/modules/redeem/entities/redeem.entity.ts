import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index
} from 'typeorm';

@Entity('redeem_codes')
export class RedeemCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, unique: true })
  code: string;

  @Column({ length: 32 })
  batch_id: string;

  @Column({ default: 0 })
  coins: number;

  @Column({ default: 0 })
  vip_days: number;

  @Column({ default: 0 })
  used: number;

  @Column({ nullable: true })
  used_by: number;

  @Column({ nullable: true })
  used_at: Date;

  @Column({ nullable: true })
  expire_time: Date;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;
}
