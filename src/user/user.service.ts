import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemoteDto, PromoteDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Access Denied');

    return user;
  }

  async getAllUsers() {
    const user = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async promoteToAdmin(dto: PromoteDto) {
    const userId = dto.userId;

    const user = await this.updateRole(userId, 'ADMIN');

    return {
      message: `${user.username} has been promoted to Admin`,
    };
  }

  async demoteToUser(dto: DemoteDto) {
    const userId = dto.userId;

    const user = await this.updateRole(userId, 'USER');

    return {
      message: `${user.username} has been demoted to User`,
    };
  }

  async updateRole(userId: number, role: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException(`Can't found user with ${userId}`);

    if (user.role === role)
      throw new ForbiddenException(`${user.username} Already an User`);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role,
      },
    });

    return user;
  }
}
