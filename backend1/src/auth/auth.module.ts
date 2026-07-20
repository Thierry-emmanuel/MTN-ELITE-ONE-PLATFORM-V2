import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { JwtStrategy } from '../common/guards/jwt.strategy';

import { MfaService } from './mfa.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // registerAsync reads JWT_SECRET AFTER ConfigModule has loaded .env
    // (fixes the process.env read-at-module-parse-time bug)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): import('@nestjs/jwt').JwtModuleOptions => ({
        secret: cfg.get<string>('JWT_SECRET') ?? 'change_me_in_production',
        signOptions: {
          expiresIn: (cfg.get<string>('JWT_EXPIRES_IN') ?? '15m') as any,
        },
      }),
    }),

    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, MfaService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtStrategy, MfaService],
})
export class AuthModule {}