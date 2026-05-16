import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterEditorDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/login */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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