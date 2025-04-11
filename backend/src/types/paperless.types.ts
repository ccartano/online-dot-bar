export interface PaperlessDocument {
  id: number;
  title: string;
  content: string;
  created: Date;
  modified: Date;
  document_type: string | null;
  correspondent: string | null;
}
