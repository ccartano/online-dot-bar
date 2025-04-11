import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaperlessService } from '../services/paperless.service';
import { PaperlessDocument } from '../types/paperless.types';

@Controller('paperless')
export class PaperlessController {
  constructor(private readonly paperlessService: PaperlessService) {}

  @Get()
  async getAllDocuments(): Promise<PaperlessDocument[]> {
    return this.paperlessService.getAllDocuments();
  }

  @Get(':id')
  async getDocumentById(
    @Param('id') id: string,
  ): Promise<PaperlessDocument | null> {
    return this.paperlessService.getDocumentById(parseInt(id, 10));
  }

  @Get('search')
  async searchDocuments(
    @Query('q') query: string,
  ): Promise<PaperlessDocument[]> {
    return this.paperlessService.searchDocuments(query);
  }
}
