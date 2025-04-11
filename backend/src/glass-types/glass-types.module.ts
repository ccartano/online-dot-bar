import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlassType } from '../entities/glass-type.entity';
import { GlassTypesService } from './glass-types.service';
import { GlassTypesController } from './glass-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GlassType])],
  controllers: [GlassTypesController],
  providers: [GlassTypesService],
  exports: [GlassTypesService],
})
export class GlassTypesModule {}
