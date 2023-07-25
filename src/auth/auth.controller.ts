import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, EditAuthDto } from './dto';
import { GetUser } from './decorator';
import { AtGuard, RtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('edit')
  editUser(@GetUser('id') userId: number, @Body() dto: EditAuthDto) {
    return this.authService.editUser(userId, dto);
  }

  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@GetUser('id') userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(
    @GetUser('id') userId: number,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
