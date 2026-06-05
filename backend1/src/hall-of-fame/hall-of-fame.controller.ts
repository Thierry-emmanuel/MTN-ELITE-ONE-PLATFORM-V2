import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { HallOfFameService } from './hall-of-fame.service';
import { CreateHallOfFameDto } from './dto/create-hall-of-fame.dto';

@ApiTags('hall-of-fame')
@ApiBearerAuth()
@Controller('hall-of-fame')
export class HallOfFameController {
  constructor(private readonly hallOfFameService: HallOfFameService) {}

  @Post()
  @ApiOperation({ summary: 'Add a legend to the Hall of Fame' })
  @ApiBody({ type: CreateHallOfFameDto })
  create(@Body() createDto: CreateHallOfFameDto) {
    return this.hallOfFameService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all legends in the Hall of Fame' })
  findAll() {
    return this.hallOfFameService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a legend by ID' })
  findOne(@Param('id') id: string) {
    return this.hallOfFameService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a legend' })
  @ApiBody({ type: CreateHallOfFameDto, required: false })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateHallOfFameDto>) {
    return this.hallOfFameService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a legend from the Hall of Fame' })
  remove(@Param('id') id: string) {
    return this.hallOfFameService.remove(id);
  }
}
