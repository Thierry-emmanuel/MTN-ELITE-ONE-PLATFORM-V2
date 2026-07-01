import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Selection, SelectionDocument, SelectionSchema } from './schemas/selection.schema';
import { CreateSelectionDto, UpdateSelectionDto } from './dto/selection.dto';

@Injectable()
export class SelectionsService {
  constructor(@InjectModel(Selection.name) private readonly model: Model<SelectionDocument>) {}

  findAll(): Promise<Selection[]> {
    return this.model.find().sort({ squadDate: -1 }).exec();
  }

  async findOne(id: string): Promise<Selection> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Sélection introuvable');
    return doc;
  }

  create(dto: CreateSelectionDto): Promise<Selection> {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateSelectionDto): Promise<Selection> {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Sélection introuvable');
    return doc;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.model.findByIdAndDelete(id).exec();
  }
}

@ApiTags('selections')
@Controller('selections')
export class SelectionsController {
  constructor(private readonly service: SelectionsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateSelectionDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateSelectionDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Selection.name, schema: SelectionSchema }])],
  controllers: [SelectionsController],
  providers: [SelectionsService],
  exports: [SelectionsService],
})
export class SelectionsModule {}