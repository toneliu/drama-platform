import { Controller, Get, Post, Body, Query, UseGuards, Request, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

class CreateRechargeDto {
  @IsString()
  package_id: string;

  @IsString()
  pay_method: string;

  @IsString()
  @IsOptional()
  platform?: string = 'h5';
}

@ApiTags('支付中心')
@Controller('api/v1/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('coin-packages')
  @ApiOperation({ summary: '获取金币充值套餐' })
  async getCoinPackages() {
    return this.paymentService.getCoinPackages();
  }

  @Post('recharge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建充值订单' })
  async recharge(@Request() req, @Body() dto: CreateRechargeDto) {
    return this.paymentService.createRechargeOrder(
      req.user.id, dto.package_id, dto.pay_method, dto.platform,
    );
  }

  @Post('callback')
  @ApiOperation({ summary: '支付回调' })
  async callback(@Body() body: { order_id: string; tt_order_id?: string }) {
    await this.paymentService.handlePaySuccess(body.order_id, body.tt_order_id);
    return { success: true };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '充值记录' })
  async getOrders(@Request() req, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.paymentService.getUserOrders(req.user.id, page);
  }

  @Get('coin-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '金币变动记录' })
  async getCoinLogs(@Request() req, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.paymentService.getCoinLogs(req.user.id, page);
  }
}
