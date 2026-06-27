import { Controller, Get, Post, Body, Param, UseGuards, Request, DefaultValuePipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

class CreateOrderDto {
  @IsString()
  tier_id: string;

  @IsString()
  @IsOptional()
  platform?: string = 'tt';
}

class CallbackDto {
  @IsString()
  order_id: string;

  @IsString()
  event_type: string;

  data: any;
}

@ApiTags('订阅管理')
@Controller('api/v1/subscription')
export class SubscriptionController {
  constructor(private subService: SubscriptionService) {}

  @Get('tiers')
  @ApiOperation({ summary: '获取订阅档位列表' })
  async getTiers() {
    return this.subService.getTiers();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建订阅订单' })
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.subService.createOrder(req.user.id, dto.tier_id, dto.platform);
  }

  @Post('callback')
  @ApiOperation({ summary: '支付回调 (TikTok/Google/Apple)' })
  async callback(@Body() dto: CallbackDto) {
    return this.subService.handleCallback(dto.order_id, dto.event_type, dto.data);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前订阅状态' })
  async getStatus(@Request() req) {
    return this.subService.getStatus(req.user.id);
  }

  @Post('cancel-auto-renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消自动续费' })
  async cancelAutoRenew(@Request() req) {
    return this.subService.cancelAutoRenew(req.user.id);
  }
}
