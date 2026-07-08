import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  nominationId: number;
}

export class PublicVoteDto {
  @ApiProperty()
  @IsNotEmpty()
  nomineeId: string;
}
