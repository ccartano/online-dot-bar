import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlassType } from '../entities/glass-type.entity';

@Injectable()
export class GlassTypesService {
  constructor(
    @InjectRepository(GlassType)
    private glassTypesRepository: Repository<GlassType>,
  ) {}

  async findAll(): Promise<GlassType[]> {
    return this.glassTypesRepository.find();
  }

  async findOne(id: number): Promise<GlassType> {
    const glassType = await this.glassTypesRepository.findOne({
      where: { id },
    });
    if (!glassType) {
      throw new NotFoundException(`Glass type with ID ${id} not found`);
    }
    return glassType;
  }

  async create(glassType: Partial<GlassType>): Promise<GlassType> {
    const newGlassType = this.glassTypesRepository.create(glassType);
    return this.glassTypesRepository.save(newGlassType);
  }

  async update(id: number, glassType: Partial<GlassType>): Promise<GlassType> {
    await this.glassTypesRepository.update(id, glassType);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.glassTypesRepository.delete(id);
  }
}
