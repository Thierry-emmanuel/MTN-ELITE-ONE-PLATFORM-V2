import { PartialType } from '@nestjs/swagger';
import { CreateSeasonDto } from './create-season.dto';

// WHY: PartialType makes every CreateSeasonDto field optional automatically.
export class UpdateSeasonDto extends PartialType(CreateSeasonDto) {}