import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AwardsService } from './awards.service';
import { VoteDto } from './dto/vote.dto';
import { CreateAwardDto, CreateNominationDto } from './dto/award-crud.dto';
import type { Request } from 'express';

@ApiTags('awards')
@Controller('awards')
export class AwardsController {
  constructor(private readonly awardsService: AwardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all awards (Admin)' })
  findAll() {
    return this.awardsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active awards with nominations' })
  findAllActive() {
    return this.awardsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get award details by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new award' })
  create(@Body() dto: CreateAwardDto) {
    return this.awardsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an award' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAwardDto>) {
    return this.awardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an award' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.remove(id);
  }

  @Post(':id/open')
  @ApiOperation({ summary: 'Open the voting period for an award (BF-10.4)' })
  open(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.openAward(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close voting and compute the winner (BF-10.4)' })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.awardsService.closeAward(id);
  }

  @Post(':id/nominations')
  @ApiOperation({ summary: 'Add a nomination to an award (player, team or coach)' })
  addNomination(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateNominationDto) {
    return this.awardsService.addNomination(id, dto);
  }

  @Delete(':id/nominations/:nominationId')
  @ApiOperation({ summary: 'Remove a nomination from an award' })
  removeNomination(
    @Param('id', ParseIntPipe) id: number,
    @Param('nominationId', ParseIntPipe) nominationId: number,
  ) {
    return this.awardsService.removeNomination(id, nominationId);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote for an award nomination' })
  vote(@Param('id', ParseIntPipe) id: number, @Body() dto: VoteDto, @Req() req: Request) {
    // Extract IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // User ID is extracted if user is authenticated (Optional)
    const userId = (req as any).user?.id;
    return this.awardsService.vote(id, dto, ipAddress as string, userId);
  }
}