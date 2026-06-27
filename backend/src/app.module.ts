import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DramaModule } from './modules/drama/drama.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { RedeemModule } from './modules/redeem/redeem.module';
import { AdminModule } from './modules/admin/admin.module';
import { CdnModule } from './modules/cdn/cdn.module';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import ossConfig from './config/oss.config';
import cdnConfig from './config/cdn.config';

@Module({
  imports: [
    // 配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, ossConfig, cdnConfig],
      envFilePath: '.env',
    }),

    // 数据库
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'drama_platform'),
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
        synchronize: config.get('DB_SYNC', 'true') === 'true',
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 业务模块
    AuthModule,
    UserModule,
    DramaModule,
    EpisodeModule,
    SubscriptionModule,
    PaymentModule,
    CheckinModule,
    RedeemModule,
    AdminModule,
    CdnModule,
  ],
})
export class AppModule {}
