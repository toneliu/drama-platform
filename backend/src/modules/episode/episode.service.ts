import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './entities/episode.entity';
import { UnlockRecord } from './entities/unlock-record.entity';
import { Drama } from '../drama/entities/drama.entity';
import { User } from '../user/entities/user.entity';
import { CoinLog } from '../payment/entities/payment.entity';
import { CdnService } from '../cdn/cdn.service';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(Episode) private episodeRepo: Repository<Episode>,
    @InjectRepository(UnlockRecord) private unlockRepo: Repository<UnlockRecord>,
    @InjectRepository(Drama) private dramaRepo: Repository<Drama>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CoinLog) private coinLogRepo: Repository<CoinLog>,
    private cdnService: CdnService,
  ) {}

  /**
   * 获取剧集播放信息
   */
  async getPlayInfo(userId: number, episodeId: number) {
    const episode = await this.episodeRepo.findOne({
      where: { id: episodeId, status: 1 },
      relations: ['drama'],
    });
    if (!episode) throw new NotFoundException('剧集不存在');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const drama = episode.drama;

    // 免费集数
    if (episode.is_free || episode.episode_number <= drama.free_episodes) {
      return this.buildPlayResponse(episode, drama, user, true);
    }

    // VIP用户
    if (user.vip_status === 'active' && user.vip_expire_time > new Date()) {
      return this.buildPlayResponse(episode, drama, user, true);
    }

    // 检查是否已解锁
    const unlockRecord = await this.unlockRepo.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });
    if (unlockRecord) {
      return this.buildPlayResponse(episode, drama, user, true);
    }

    // 未解锁
    return this.buildPlayResponse(episode, drama, user, false);
  }

  /**
   * 用金币解锁单集
   */
  async unlockWithCoins(userId: number, episodeId: number) {
    const episode = await this.episodeRepo.findOne({
      where: { id: episodeId, status: 1 },
      relations: ['drama'],
    });
    if (!episode) throw new NotFoundException('剧集不存在');

    // 检查是否已解锁
    const existing = await this.unlockRepo.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });
    if (existing) throw new BadRequestException('该集已解锁');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const price = episode.price || episode.drama.episode_price;

    if (user.coins < price) {
      throw new BadRequestException('金币不足，请先充值');
    }

    // 扣除金币
    user.coins -= price;
    await this.userRepo.save(user);

    // 记录解锁
    const unlock = this.unlockRepo.create({
      user_id: userId,
      episode_id: episodeId,
      drama_id: episode.drama_id,
      unlock_type: 'coins',
      coins_spent: price,
    });
    await this.unlockRepo.save(unlock);

    // 记录金币日志
    const log = this.coinLogRepo.create({
      user_id: userId,
      amount: -price,
      balance_after: user.coins,
      type: 'purchase',
      description: `解锁《${episode.drama.title}》第${episode.episode_number}集`,
      related_id: episodeId,
    });
    await this.coinLogRepo.save(log);

    return { success: true, coins_remaining: user.coins };
  }

  /**
   * 看广告解锁
   */
  async unlockByAd(userId: number, episodeId: number) {
    const episode = await this.episodeRepo.findOne({
      where: { id: episodeId, status: 1 },
    });
    if (!episode) throw new NotFoundException('剧集不存在');

    const existing = await this.unlockRepo.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });
    if (existing) throw new BadRequestException('该集已解锁');

    // 记录解锁
    const unlock = this.unlockRepo.create({
      user_id: userId,
      episode_id: episodeId,
      drama_id: episode.drama_id,
      unlock_type: 'ad',
      coins_spent: 0,
    });
    await this.unlockRepo.save(unlock);

    return { success: true, message: '解锁成功' };
  }

  /**
   * 构建播放响应
   */
  private buildPlayResponse(episode: Episode, drama: Drama, user: User, unlocked: boolean) {
    if (unlocked) {
      const m3u8Url = this.cdnService.getSignedVideoUrl(
        drama.id, episode.episode_number, '720p', user.id,
      );
      return {
        unlocked: true,
        episode: {
          id: episode.id,
          episode_number: episode.episode_number,
          title: episode.title,
          duration: episode.duration,
          m3u8_url: m3u8Url,
        },
      };
    }

    return {
      unlocked: false,
      episode: {
        id: episode.id,
        episode_number: episode.episode_number,
        title: episode.title,
        duration: episode.duration,
      },
      price: episode.price || drama.episode_price,
      unlock_methods: [
        { type: 'coins', label: `${episode.price || drama.episode_price}金币解锁` },
        { type: 'vip', label: 'VIP会员免费看' },
        { type: 'ad', label: '看广告免费解锁' },
      ],
    };
  }
}
