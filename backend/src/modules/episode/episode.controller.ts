import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EpisodeService } from './episode.service';

class CreateEpisodeDto {
  @IsNumber()
  drama_id: number;

  @IsNumber()
  episode_number: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  is_free?: boolean;
}

@ApiTags('剧集播放')
@Controller('api/v1/episode')
export class EpisodeController {
  constructor(private episodeService: EpisodeService) {}

  // ============ 管理后台接口 ============

  @Get('list/:dramaId')
  @ApiOperation({ summary: '获取某剧目的集数列表' })
  async findByDrama(
    @Param('dramaId', ParseIntPipe) dramaId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.episodeService.findByDrama(dramaId, page, limit);
  }

  @Post()
  @ApiOperation({ summary: '创建集数' })
  async create(@Body() dto: CreateEpisodeDto) {
    return this.episodeService.create(dto as any);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新集数' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEpisodeDto>) {
    return this.episodeService.update(id, dto as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除集数' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.episodeService.remove(id);
  }

  // ============ 前端播放接口 ============

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
