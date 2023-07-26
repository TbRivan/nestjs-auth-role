import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RBAC_POLICY } from './auth/rbac-policy';
import { AccessControlModule } from 'nest-access-control';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AccessControlModule.forRoles(RBAC_POLICY),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
