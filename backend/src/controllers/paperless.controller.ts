import { Controller, Get, Param, Query, Res, Header } from '@nestjs/common';
import { PaperlessService } from '../services/paperless.service';
import { PaperlessDocument } from '../types/paperless.types';
import { Response } from 'express';

@Controller('paperless')
export class PaperlessController {
  constructor(private readonly paperlessService: PaperlessService) {}

  @Get('documents')
  async getAllDocuments(@Query('page') page: number = 1): Promise<{ documents: PaperlessDocument[]; hasMore: boolean }> {
    return this.paperlessService.getAllDocuments(page);
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

  @Get('documents/:id/thumb')
  @Header('Content-Type', 'image/webp')
  @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Vary', 'Origin')
  async getDocumentThumbnail(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const imageData = await this.paperlessService.getDocumentThumbnail(
      parseInt(id, 10),
    );
    res.send(imageData);
  }
}
