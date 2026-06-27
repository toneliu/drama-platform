import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';

class CreateTierDto {
  @IsString()
  tier_id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  duration_days: number;

  @IsNumber()
  @IsOptional()
  trial_days?: number;
}

@ApiTags('管理后台')
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() dto: { username: string; password: string }) {
    // 简单验证：admin/admin123
    if (dto.username === 'admin' && dto.password === 'admin123') {
      const token = this.jwtService.sign({
        sub: 0,
        username: 'admin',
        role: 'admin',
      });
      return { token, username: 'admin' };
    }
    throw new UnauthorizedException('用户名或密码错误');
  }

  @Get('dashboard')
  @ApiOperation({ summary: '仪表盘统计' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.adminService.getUsers(page, limit, keyword);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: '订阅订单列表' })
  async getSubscriptions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSubscriptions(page, limit, status);
  }

  @Get('subscription-tiers')
  @ApiOperation({ summary: '订阅档位列表' })
  async getTiers() {
    return this.adminService.getTiers();
  }

  @Post('subscription-tiers')
  @ApiOperation({ summary: '创建订阅档位' })
  async createTier(@Body() dto: CreateTierDto) {
    return this.adminService.createTier(dto);
  }

  @Put('subscription-tiers/:id')
  @ApiOperation({ summary: '更新订阅档位' })
  async updateTier(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateTierDto>) {
    return this.adminService.updateTier(id, dto);
  }
}
