import { PartialType } from '@nestjs/swagger';
import { CreateSponsorPlacementDto } from './create-sponsor-placement.dto';

export class UpdateSponsorPlacementDto extends PartialType(CreateSponsorPlacementDto) {}
