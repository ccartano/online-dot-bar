import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaperlessDocument } from '../types/paperless.types';
import axios, { AxiosError } from 'axios';

interface PaperlessTag {
  id: number;
  name: string;
  slug: string;
}

interface PaperlessApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    title: string;
    content: string;
    created: string;
    modified: string;
    tags?: number[];
  }>;
}

interface PaperlessApiDocument {
  id: number;
  title: string;
  content: string;
  created: string;
  modified: string;
  tags?: number[];
}

@Injectable()
export class PaperlessService implements OnModuleInit {
  private readonly logger = new Logger(PaperlessService.name);
  private apiUrl: string;
  private username: string;
  private password: string;
  private tagsCache: Map<number, PaperlessTag> = new Map();

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('PAPERLESS_API_URL');
    this.username = this.configService.get<string>('PAPERLESS_USERNAME');
    this.password = this.configService.get<string>('PAPERLESS_PASSWORD');
  }

  private getAuthHeaders() {
    const credentials = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');
    return {
      Authorization: `Basic ${credentials}`,
    };
  }

  private async fetchTags(): Promise<void> {
    try {
      const response = await axios.get<{ results: PaperlessTag[] }>(
        `${this.apiUrl}/tags/`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      response.data.results.forEach((tag) => {
        this.tagsCache.set(tag.id, tag);
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error fetching tags:', axiosError.message);
      throw new Error(`Failed to fetch tags: ${axiosError.message}`);
    }
  }

  private getTagNames(tagIds: number[]): string[] {
    return tagIds.map(
      (id) => this.tagsCache.get(id)?.name || `Unknown Tag (${id})`,
    );
  }

  async onModuleInit() {
    try {
      // Test the API connection and fetch tags
      await axios.get(`${this.apiUrl}/documents/`, {
        headers: this.getAuthHeaders(),
      });
      await this.fetchTags();
      this.logger.log(
        'Successfully connected to Paperless API and fetched tags',
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        'Failed to connect to Paperless API:',
        axiosError.message,
      );
      throw new Error(
        `Failed to connect to Paperless API: ${axiosError.message}`,
      );
    }
  }

  async getAllDocuments(
    page: number = 1,
    pageSize: number = 200,
    ordering: string = '-created',
    truncateContent: string = 'true',
    tagId?: string
  ): Promise<{ documents: PaperlessDocument[]; hasMore: boolean }> {
    try {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        ordering,
        truncate_content: truncateContent
      };

      if (tagId) {
        params.tags__id__all = tagId;
      }

      const response = await axios.get<PaperlessApiResponse>(
        `${this.apiUrl}/documents/`,
        {
          headers: this.getAuthHeaders(),
          params
        },
      );

      const documents = response.data.results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        created: doc.created,
        modified: doc.modified,
        tags: this.getTagNames(doc.tags || []),
      }));

      return {
        documents,
        hasMore: response.data.next !== null,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error fetching documents:', axiosError.message);
      throw new Error(`Failed to fetch documents: ${axiosError.message}`);
    }
  }

  async getDocumentById(id: number): Promise<PaperlessDocument | null> {
    if (isNaN(id)) {
      throw new Error('Invalid document ID');
    }

    try {
      const response = await axios.get<PaperlessApiDocument>(
        `${this.apiUrl}/documents/${id}/`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      const doc = response.data;
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        created: doc.created,
        modified: doc.modified,
        tags: this.getTagNames(doc.tags || []),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching document ${id}:`, axiosError.message);
      throw new Error(`Failed to fetch document: ${axiosError.message}`);
    }
  }

  async searchDocuments(query: string): Promise<PaperlessDocument[]> {
    try {
      const response = await axios.get<PaperlessApiResponse>(
        `${this.apiUrl}/documents/`,
        {
          headers: this.getAuthHeaders(),
          params: {
            query: query,
          },
        },
      );

      return response.data.results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        created: doc.created,
        modified: doc.modified,
        tags: this.getTagNames(doc.tags || []),
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error searching documents:', axiosError.message);
      throw new Error(`Failed to search documents: ${axiosError.message}`);
    }
  }

  async getDocumentThumbnail(id: number): Promise<Buffer> {
    const response = await axios.get(`${this.apiUrl}/documents/${id}/thumb/`, {
      headers: this.getAuthHeaders(),
      responseType: 'arraybuffer',
    });

    return response.data as Buffer;
  }
}
