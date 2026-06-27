import { Controller, Get, Post, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EpisodeService } from './episode.service';

@ApiTags('剧集播放')
@Controller('api/v1/episode')
export class EpisodeController {
  constructor(private episodeService: EpisodeService) {}

  @Get(':id/play')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取剧集播放信息' })
  async getPlayInfo(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.episodeService.getPlayInfo(req.user.id, id);
  }

  @Post(':id/unlock/coins')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用金币解锁单集' })
  async unlockWithCoins(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.episodeService.unlockWithCoins(req.user.id, id);
  }

  @Post(':id/unlock/ad')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '看广告解锁单集' })
  async unlockByAd(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.episodeService.unlockByAd(req.user.id, id);
  }
}
