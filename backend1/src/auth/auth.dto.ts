import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional,
  IsString, MinLength, MaxLength, Matches,
} from 'class-validator';
import { UserRole } from '../users/user.entity';

// ── Login ──────────────────────────────────────────────────────
export class LoginDto {
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

// ── Register (base — shared fields) ───────────────────────────
export class RegisterDto {
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Minimum 8 caractères' })
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Le mot de passe doit contenir au moins une majuscule et un chiffre',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// ── Register Editor (extends base with editor fields) ─────────
export class RegisterEditorDto extends RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro CNI est requis' })
  cniNumber: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom de l'agence est requis" })
  agency: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type de média est requis' })
  mediaType: string;

  @IsString()
  @IsNotEmpty({ message: 'Le motif est requis' })
  @MaxLength(500)
  purpose: string;

  @IsOptional()
  @IsString()
  pressCardNumber?: string;
}