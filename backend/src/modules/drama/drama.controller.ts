import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DramaService } from './drama.service';

class CreateDramaDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  cover_url?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsNumber()
  @IsOptional()
  episode_count?: number;

  @IsNumber()
  @IsOptional()
  free_episodes?: number;

  @IsNumber()
  @IsOptional()
  episode_price?: number;

  @IsString()
  @IsOptional()
  target_audience?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

@ApiTags('剧集')
@Controller('api/v1/drama')
export class DramaController {
  constructor(private dramaService: DramaService) {}

  // ============ 前端接口 ============

  @Get('featured')
  @ApiOperation({ summary: '首页精选推荐' })
  async getFeatured(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.dramaService.getFeatured(limit);
  }

  @Get('new-release')
  @ApiOperation({ summary: '新剧上线' })
  async getNewRelease(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.dramaService.getNewRelease(limit);
  }

  @Get('ranking/:type')
  @ApiOperation({ summary: '排行榜 (hot/new/male/female)' })
  async getRanking(
    @Param('type') type: 'hot' | 'new' | 'male' | 'female',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dramaService.getRanking(type, limit);
  }

  @Get('category/:name')
  @ApiOperation({ summary: '按分类获取列表' })
  async getByCategory(
    @Param('name') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dramaService.getByCategory(category, page, limit);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有分类' })
  async getCategories() {
    return this.dramaService.getCategories();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索剧集' })
  async search(
    @Query('keyword') keyword: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dramaService.search(keyword, page, limit);
  }

  // ============ 管理后台接口 ============

  @Get('list')
  @ApiOperation({ summary: '管理后台 - 剧目列表' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.dramaService.findAll(page, limit, keyword);
  }

  @Post()
  @ApiOperation({ summary: '创建剧目' })
  async create(@Body() dto: CreateDramaDto) {
    return this.dramaService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新剧目' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateDramaDto>) {
    return this.dramaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除剧目' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.dramaService.remove(id);
  }

  @Post(':id/toggle-status')
  @ApiOperation({ summary: '上下架剧目' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.dramaService.toggleStatus(id);
  }

  // ============ 通用接口（放最后） ============

  @Get(':id')
  @ApiOperation({ summary: '剧集详情(含剧集列表)' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.dramaService.getDetail(id);
  }
}
