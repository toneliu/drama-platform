import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { Drama } from '../../drama/entities/drama.entity';

@Entity('episodes')
export class Episode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  drama_id: number;

  @Column()
  episode_number: number;  // 第几集

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ length: 512, nullable: true })
  video_url: string;       // 视频路径(OSS相对路径)

  @Column({ length: 512, nullable: true })
  master_m3u8: string;     // HLS主索引路径

  @Column({ length: 512, nullable: true })
  cover_url: string;       // 单集封面

  @Column({ default: 0 })
  duration: number;        // 时长(秒)

  @Column({ default: 0 })
  is_free: number;         // 1=免费 0=付费

  @Column({ default: 150 })
  price: number;           // 价格(金币)

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Drama, (drama) => drama.episodes)
  @JoinColumn({ name: 'drama_id' })
  drama: Drama;
}
