import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaperlessDocument } from '../types/paperless.types';
import axios, { AxiosError } from 'axios';

interface PaperlessApiResponse {
  results: Array<{
    id: number;
    title: string;
    content: string;
    created: string;
    modified: string;
    document_type?: { name: string };
    correspondent?: { name: string };
  }>;
}

interface PaperlessApiDocument {
  id: number;
  title: string;
  content: string;
  created: string;
  modified: string;
  document_type?: { name: string };
  correspondent?: { name: string };
}

@Injectable()
export class PaperlessService implements OnModuleInit {
  private readonly logger = new Logger(PaperlessService.name);
  private apiUrl: string;
  private username: string;
  private password: string;

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

  async onModuleInit() {
    try {
      // Test the API connection
      await axios.get(`${this.apiUrl}/documents/`, {
        headers: this.getAuthHeaders(),
      });
      this.logger.log('Successfully connected to Paperless API');
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

  async getAllDocuments(): Promise<PaperlessDocument[]> {
    try {
      const response = await axios.get<PaperlessApiResponse>(
        `${this.apiUrl}/documents/`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      return response.data.results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        created: new Date(doc.created),
        modified: new Date(doc.modified),
        document_type: doc.document_type?.name || null,
        correspondent: doc.correspondent?.name || null,
      }));
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
        created: new Date(doc.created),
        modified: new Date(doc.modified),
        document_type: doc.document_type?.name || null,
        correspondent: doc.correspondent?.name || null,
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
        created: new Date(doc.created),
        modified: new Date(doc.modified),
        document_type: doc.document_type?.name || null,
        correspondent: doc.correspondent?.name || null,
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Error searching documents:', axiosError.message);
      throw new Error(`Failed to search documents: ${axiosError.message}`);
    }
  }
}
