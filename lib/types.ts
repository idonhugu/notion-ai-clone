export type AIAction = 
  | 'generate' 
  | 'continue' 
  | 'summarize' 
  | 'improve' 
  | 'longer' 
  | 'simplify'
  | 'action_items'
  | 'translate'
  | 'eli5'
  | 'table'
  | 'checklist'
  | 'chat'
  | 'add_presentation'
  | 'clinical_evidence'
  | 'stockleys_checker'
  | 'analyze_pdf_for_presentation'
  | 'analyze_derm_photo'
  | 'fix_grammar'
  | 'doc_summarize'
  | 'doc_notes';

export interface AIPromptPayload {
  action: AIAction;
  prompt?: string;
  context?: string;
  selectedText?: string;
  tone?: 'concise' | 'professional' | 'casual';
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  folderId?: string | null;
  isFolder?: boolean;
  color?: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: any[];
  parent_id: string | null;
  is_archived: boolean;
  is_favorite: boolean;
  icon: string | null;
  cover_image: string | null;
  attachments?: AttachedFile[];
  created_at: string;
  updated_at: string;
}

export interface DocumentNode extends Document {
  children?: DocumentNode[];
  isExpanded?: boolean;
}
