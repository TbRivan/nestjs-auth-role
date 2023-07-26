import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../auth/decorator';
import { AtGuard } from '../auth/guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { DemoteDto, PromoteDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AtGuard)
  @Get('me')
  getMe(@GetUser('id') userId: number) {
    return this.userService.getMe(userId);
  }

  @UseGuards(AtGuard, ACGuard)
  @UseRoles({
    resource: 'userData',
    action: 'read',
    possession: 'any',
  })
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(AtGuard, ACGuard)
  @UseRoles({
    resource: 'userData',
    action: 'update',
    possession: 'any',
  })
  @Post('promote')
  promoteToAdmin(@Body() dto: PromoteDto) {
    return this.userService.promoteToAdmin(dto);
  }

  @UseGuards(AtGuard, ACGuard)
  @UseRoles({
    resource: 'userData',
    action: 'update',
    possession: 'any',
  })
  @Post('demote')
  demoteToUser(@Body() dto: DemoteDto) {
    return this.userService.demoteToUser(dto);
  }
}
