
export type SourceLanguage = 'typescript' | 'python';

export interface TranspilationResult {
  aikenCode: string;
  explanation: string;
  errors?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  sourceLanguage: SourceLanguage;
  sourceCode: string;
  result: TranspilationResult;
}
