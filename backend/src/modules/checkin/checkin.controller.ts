import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckinService } from './checkin.service';

@ApiTags('签到')
@Controller('api/v1/checkin')
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '每日签到' })
  async checkin(@Request() req) {
    return this.checkinService.dailyCheckin(req.user.id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取签到状态' })
  async getStatus(@Request() req) {
    return this.checkinService.getStatus(req.user.id);
  }
}
