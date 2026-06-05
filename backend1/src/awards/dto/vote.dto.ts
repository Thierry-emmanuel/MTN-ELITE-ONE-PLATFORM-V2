import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nominationId: string;
}
