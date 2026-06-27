import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RedeemService } from './redeem.service';

class RedeemDto {
  @IsString()
  code: string;
}

@ApiTags('兑换码')
@Controller('api/v1/redeem')
export class RedeemController {
  constructor(private redeemService: RedeemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '兑换码' })
  async redeem(@Request() req, @Body() dto: RedeemDto) {
    return this.redeemService.redeem(req.user.id, dto.code);
  }
}
