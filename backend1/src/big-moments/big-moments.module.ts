import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags } from '@nestjs/swagger';
import { BigMoment, BigMomentDocument, BigMomentSchema } from './schemas/big-moment.schema';
import { CreateBigMomentDto, UpdateBigMomentDto } from './dto/big-moment.dto';

@Injectable()
export class BigMomentsService {
  constructor(@InjectModel(BigMoment.name) private readonly model: Model<BigMomentDocument>) {}

  findAll(featuredOnly?: boolean): Promise<BigMoment[]> {
    return this.model
      .find(featuredOnly ? { featured: true } : {})
      .sort({ momentDate: -1 })
      .exec();
  }

  async findOne(id: string): Promise<BigMoment> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Grand moment introuvable');
    return doc;
  }

  create(dto: CreateBigMomentDto): Promise<BigMoment> {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateBigMomentDto): Promise<BigMoment> {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Grand moment introuvable');
    return doc;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.model.findByIdAndDelete(id).exec();
  }
}

@ApiTags('big-moments')
@Controller('big-moments')
export class BigMomentsController {
  constructor(private readonly service: BigMomentsService) {}

  @Get() findAll(@Query('featured') featured?: string) { return this.service.findAll(featured === 'true'); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateBigMomentDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateBigMomentDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: BigMoment.name, schema: BigMomentSchema }])],
  controllers: [BigMomentsController],
  providers: [BigMomentsService],
  exports: [BigMomentsService],
})
export class BigMomentsModule {}