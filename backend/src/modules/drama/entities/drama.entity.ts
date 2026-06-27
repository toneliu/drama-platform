import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index
} from 'typeorm';
import { Episode } from '../../episode/entities/episode.entity';

@Entity('dramas')
export class Drama {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 1024, nullable: true })
  description: string;

  @Column({ length: 512, nullable: true })
  cover_url: string;       // 封面图

  @Column({ length: 512, nullable: true })
  trailer_url: string;     // 预告片URL

  @Column({ length: 128, nullable: true })
  category: string;        // 分类: CEO, Revenge, Marriage...

  @Column({ length: 255, nullable: true })
  tags: string;            // 标签,逗号分隔

  @Column({ default: 0 })
  view_count: number;      // 播放量

  @Column({ default: 0 })
  like_count: number;

  @Column({ default: 0 })
  episode_count: number;   // 总集数

  @Column({ default: 0 })
  free_episodes: number;   // 免费集数

  @Column({ default: 150 })
  episode_price: number;   // 每集价格(金币)

  @Column({ type: 'enum', enum: ['male', 'female', 'all'], default: 'all' })
  target_audience: string; // 目标受众

  @Column({ default: 0 })
  sort_order: number;      // 排序权重

  @Column({ default: 1 })
  status: number;          // 1=上架 0=下架

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Episode, (ep) => ep.drama)
  episodes: Episode[];
}
