import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterEditorDto } from './auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthedRequest = Request & {
  user: { id: number; email: string; role: string; roleKeys: string[]; sessionId?: string };
};

const meta = (req: Request) => ({
  userAgent: req.headers['user-agent'] as string | undefined,
  ip: req.ip,
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/login — returns accessToken + rotating refreshToken */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, meta(req));
  }

  /** POST /auth/refresh — rotate the refresh token, mint a new access token */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  /** POST /auth/logout — revoke the current session (device) */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: AuthedRequest) {
    return this.authService.logout(req.user.id, req.user.email, req.user.sessionId, meta(req));
  }

  /** GET /auth/me — identity + effective permissions + field policies */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return this.authService.me(req.user.id);
  }

  /** POST /auth/change-password — self-service (clears mustChangePassword) */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: AuthedRequest,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword, meta(req));
  }

  /** POST /auth/register — regular user */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  /** POST /auth/register/editor — editor with CNI + agency */
  @Post('register/editor')
  @HttpCode(HttpStatus.CREATED)
  registerEditor(@Body() dto: RegisterEditorDto) {
    return this.authService.registerEditor(dto);
  }
}
