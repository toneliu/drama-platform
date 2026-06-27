import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drama } from './entities/drama.entity';
import { Episode } from '../episode/entities/episode.entity';

@Injectable()
export class DramaService {
  constructor(
    @InjectRepository(Drama) private dramaRepo: Repository<Drama>,
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
  ) {}

  /**
   * 获取首页推荐列表
   */
  async getFeatured(limit = 10) {
    return this.dramaRepo.find({
      where: { status: 1 },
      order: { sort_order: 'DESC', view_count: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取新剧列表
   */
  async getNewRelease(limit = 10) {
    return this.dramaRepo.find({
      where: { status: 1 },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取排行榜
   */
  async getRanking(type: 'hot' | 'new' | 'male' | 'female', limit = 10) {
    const qb = this.dramaRepo.createQueryBuilder('d').where('d.status = 1');

    switch (type) {
      case 'hot':
        qb.orderBy('d.view_count', 'DESC');
        break;
      case 'new':
        qb.orderBy('d.created_at', 'DESC');
        break;
      case 'male':
        qb.andWhere('d.target_audience IN (:...aud)', { aud: ['male', 'all'] });
        qb.orderBy('d.view_count', 'DESC');
        break;
      case 'female':
        qb.andWhere('d.target_audience IN (:...aud)', { aud: ['female', 'all'] });
        qb.orderBy('d.view_count', 'DESC');
        break;
    }

    return qb.take(limit).getMany();
  }

  /**
   * 按分类获取列表
   */
  async getByCategory(category: string, page = 1, limit = 20) {
    const [items, total] = await this.dramaRepo.findAndCount({
      where: { category, status: 1 },
      order: { sort_order: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  /**
   * 获取剧集详情(含剧集列表)
   */
  async getDetail(id: number) {
    const drama = await this.dramaRepo.findOne({
      where: { id, status: 1 },
      relations: ['episodes'],
    });
    if (!drama) throw new NotFoundException('剧集不存在');

    // 增加播放量
    await this.dramaRepo.increment({ id }, 'view_count', 1);

    // 按集数排序
    drama.episodes.sort((a, b) => a.episode_number - b.episode_number);

    return drama;
  }

  /**
   * 搜索
   */
  async search(keyword: string, page = 1, limit = 20) {
    const qb = this.dramaRepo.createQueryBuilder('d')
      .where('d.status = 1')
      .andWhere('(d.title LIKE :kw OR d.tags LIKE :kw)', { kw: `%${keyword}%` })
      .orderBy('d.view_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /**
   * 获取分类列表
   */
  async getCategories() {
    const result = await this.dramaRepo
      .createQueryBuilder('d')
      .select('d.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('d.status = 1')
      .groupBy('d.category')
      .getRawMany();
    return result;
  }

  // ============ 管理后台接口 ============

  /**
   * 管理后台 - 获取所有剧目（含下架）
   */
  async findAll(page = 1, limit = 20, keyword?: string) {
    const qb = this.dramaRepo.createQueryBuilder('d');

    if (keyword) {
      qb.where('(d.title LIKE :kw OR d.tags LIKE :kw)', { kw: `%${keyword}%` });
    }

    qb.orderBy('d.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /**
   * 管理后台 - 创建剧目
   */
  async create(data: Partial<Drama>) {
    const drama = this.dramaRepo.create(data);
    return this.dramaRepo.save(drama);
  }

  /**
   * 管理后台 - 更新剧目
   */
  async update(id: number, data: Partial<Drama>) {
    await this.dramaRepo.update(id, data);
    return this.dramaRepo.findOne({ where: { id } });
  }

  /**
   * 管理后台 - 删除剧目
   */
  async remove(id: number) {
    await this.dramaRepo.delete(id);
    return { success: true };
  }

  /**
   * 管理后台 - 上下架
   */
  async toggleStatus(id: number) {
    const drama = await this.dramaRepo.findOne({ where: { id } });
    if (!drama) throw new NotFoundException('剧目不存在');
    drama.status = drama.status === 1 ? 0 : 1;
    await this.dramaRepo.save(drama);
    return drama;
  }
}
