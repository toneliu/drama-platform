import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CdnService {
  private videoDomain: string;
  private assetsDomain: string;
  private privateKey: string;
  private authExpireSeconds: number;

  constructor(private configService: ConfigService) {
    this.videoDomain = this.configService.get('cdn.videoDomain');
    this.assetsDomain = this.configService.get('cdn.assetsDomain');
    this.privateKey = this.configService.get('cdn.privateKey');
    this.authExpireSeconds = this.configService.get('cdn.authExpireSeconds');
  }

  /**
   * 生成CDN签名URL (Type A鉴权)
   * 格式: {domain}{uri}?auth_key={timestamp}-{rand}-{uid}-{md5hash}
   */
  generateSignedUrl(
    uri: string,
    userId: number | string,
    expireSeconds?: number,
    resourceType: 'video' | 'assets' = 'video',
  ): string {
    const domain = resourceType === 'video' ? this.videoDomain : this.assetsDomain;
    const expire = expireSeconds || this.authExpireSeconds;

    const timestamp = String(Math.floor(Date.now() / 1000) + expire);
    const randStr = crypto.randomBytes(8).toString('hex');

    // 签名: URI-过期时间-随机数-用户ID-私钥
    const signStr = `${uri}-${timestamp}-${randStr}-${userId}-${this.privateKey}`;
    const md5hash = crypto.createHash('md5').update(signStr).digest('hex');

    return `${domain}${uri}?auth_key=${timestamp}-${randStr}-${userId}-${md5hash}`;
  }

  /**
   * 验证签名URL
   */
  verifySignedUrl(uri: string, authKey: string): boolean {
    try {
      const [timestamp, randStr, userId, md5hash] = authKey.split('-');

      // 检查过期
      if (parseInt(timestamp) < Math.floor(Date.now() / 1000)) {
        return false;
      }

      const signStr = `${uri}-${timestamp}-${randStr}-${userId}-${this.privateKey}`;
      const expectedHash = crypto.createHash('md5').update(signStr).digest('hex');

      return md5hash === expectedHash;
    } catch {
      return false;
    }
  }

  /**
   * 生成HLS视频签名URL
   */
  getSignedVideoUrl(
    dramaId: number,
    episodeNumber: number,
    quality: string = '720p',
    userId: number | string,
  ): string {
    const uri = `/dramas/${dramaId}/episodes/ep${String(episodeNumber).padStart(2, '0')}/${quality}/index.m3u8`;
    return this.generateSignedUrl(uri, userId);
  }

  /**
   * 生成封面图签名URL
   */
  getSignedCoverUrl(path: string, userId: number | string): string {
    return this.generateSignedUrl(path, userId, 86400, 'assets'); // 24小时
  }
}
