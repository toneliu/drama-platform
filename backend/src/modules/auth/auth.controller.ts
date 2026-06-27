import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class TikTokLoginDto {
  @IsString()
  tt_open_id: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

class PhoneLoginDto {
  @IsString()
  phone: string;
}

@ApiTags('认证')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('tiktok/login')
  @ApiOperation({ summary: 'TikTok Minis 静默登录' })
  async tiktokLogin(@Body() dto: TikTokLoginDto) {
    return this.authService.loginByTikTok(dto.tt_open_id, dto.nickname, dto.avatar);
  }

  @Post('h5/login')
  @ApiOperation({ summary: 'H5端 手机号登录' })
  async phoneLogin(@Body() dto: PhoneLoginDto) {
    return this.authService.loginByPhone(dto.phone);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
