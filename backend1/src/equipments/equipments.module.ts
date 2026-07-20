import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './equipment.entity';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  providers: [EquipmentsService],
  controllers: [EquipmentsController],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}
