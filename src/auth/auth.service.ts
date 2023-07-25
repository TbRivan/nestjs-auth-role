import {
  BadRequestException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, EditAuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          username: dto.username,
          role: dto.role,
        },
      });

      return {
        statusCode: HttpCode(HttpStatus.CREATED),
        message: 'User Created, please Signin',
      };
    } catch (error) {
      // check if error is from prisma
      if (error instanceof PrismaClientKnownRequestError) {
        // if the error code P2002, which is code from prisma
        // for this case its email, that have been set unique
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async editUser(userId: number, dto: EditAuthDto) {
    let userUpdate = { ...dto };

    if (dto.password) {
      const hash = await argon.hash(dto.password);
      userUpdate = { ...dto, password: hash };
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: userUpdate,
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied');

    return {
      message: 'User Updated',
    };
  }

  async logout(userId: number) {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });
      return {
        message: 'Success Logout',
      };
    } catch (error) {
      throw new BadRequestException('You have Logged out!');
    }
  }

  async refreshToken(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatcher = await argon.verify(user.hashedRt, rt);

    if (!rtMatcher) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await argon.hash(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async getTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      id: userId,
      email: email,
      role: role,
    };

    const atSecret = this.config.get('JWT_ATSECRET');
    const rtSecret = this.config.get('JWT_RTSECRET');

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: atSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: rtSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
