import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GlassTypesService } from './glass-types.service';
import { GlassType } from '../entities/glass-type.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('glass-types')
export class GlassTypesController {
  constructor(private readonly glassTypesService: GlassTypesService) {}

  @Get()
  findAll(): Promise<GlassType[]> {
    return this.glassTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GlassType> {
    return this.glassTypesService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() glassType: Partial<GlassType>): Promise<GlassType> {
    return this.glassTypesService.create(glassType);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() glassType: Partial<GlassType>,
  ): Promise<GlassType> {
    return this.glassTypesService.update(+id, glassType);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.glassTypesService.remove(+id);
  }
}
