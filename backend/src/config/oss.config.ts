import { registerAs } from '@nestjs/config';

export default registerAs('oss', () => ({
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucketVideo: process.env.OSS_BUCKET_VIDEO || 'drama-videos',
  bucketAssets: process.env.OSS_BUCKET_ASSETS || 'drama-assets',
  endpoint: process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com',
}));
