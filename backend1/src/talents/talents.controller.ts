import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TalentsService } from './talents.service';
import { CreateTalentProfileDto } from './dto/create-talent-profile.dto';

@ApiTags('talents')
@ApiBearerAuth()
@Controller('talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new talent profile' })
  create(@Body() createTalentProfileDto: CreateTalentProfileDto) {
    return this.talentsService.create(createTalentProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all talent profiles' })
  findAll() {
    return this.talentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a talent profile by ID' })
  findOne(@Param('id') id: string) {
    return this.talentsService.findOne(id);
  }

  @Get('player/:playerId')
  @ApiOperation({ summary: 'Get a talent profile by player UUID' })
  findByPlayerId(@Param('playerId') playerId: string) {
    return this.talentsService.findByPlayerId(playerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a talent profile' })
  update(@Param('id') id: string, @Body() updateTalentProfileDto: Partial<CreateTalentProfileDto>) {
    return this.talentsService.update(id, updateTalentProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a talent profile' })
  remove(@Param('id') id: string) {
    return this.talentsService.remove(id);
  }
}
