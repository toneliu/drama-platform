import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DramaService } from './drama.service';

@ApiTags('剧集')
@Controller('api/v1/drama')
export class DramaController {
  constructor(private dramaService: DramaService) {}

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

  @Get(':id')
  @ApiOperation({ summary: '剧集详情(含剧集列表)' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.dramaService.getDetail(id);
  }
}
