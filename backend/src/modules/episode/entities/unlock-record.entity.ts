import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique
} from 'typeorm';

@Entity('unlock_records')
@Unique(['user_id', 'episode_id'])
export class UnlockRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column()
  episode_id: number;

  @Column()
  @Index()
  drama_id: number;

  @Column({ type: 'enum', enum: ['coins', 'vip', 'ad', 'redeem'] })
  unlock_type: string;

  @Column({ default: 0 })
  coins_spent: number;

  @CreateDateColumn()
  created_at: Date;
}
