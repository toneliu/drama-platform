import { registerAs } from '@nestjs/config';

export default registerAs('cdn', () => ({
  videoDomain: process.env.CDN_VIDEO_DOMAIN || 'https://video.your-domain.com',
  assetsDomain: process.env.CDN_ASSETS_DOMAIN || 'https://assets.your-domain.com',
  // URL鉴权密钥
  privateKey: process.env.CDN_PRIVATE_KEY || 'your-cdn-private-key',
  // 鉴权有效时间(秒)
  authExpireSeconds: parseInt(process.env.CDN_AUTH_EXPIRE, 10) || 7200,
}));
