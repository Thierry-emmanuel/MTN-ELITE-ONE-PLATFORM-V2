import { PartialType } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto';

// WHY: PartialType makes every CreatePlayerDto field optional automatically.
// No need to duplicate all decorators.
export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}