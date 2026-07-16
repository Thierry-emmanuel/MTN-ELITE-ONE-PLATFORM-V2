// src/referees/dto/update-referee.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRefereeDto } from './create-referee.dto';

export class UpdateRefereeDto extends PartialType(CreateRefereeDto) {}
