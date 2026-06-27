import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DramaController } from './drama.controller';
import { DramaService } from './drama.service';
import { Drama } from './entities/drama.entity';
import { Episode } from '../episode/entities/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drama, Episode])],
  controllers: [DramaController],
  providers: [DramaService],
  exports: [DramaService],
})
export class DramaModule {}
