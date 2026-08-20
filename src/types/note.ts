export interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

export interface NoteData {
  id: string;
  topic: string;
  rawQuery: string;
  title: string;
  content: NoteContent;
  diagramUrl: string | null;
  createdAt: string;
}

export interface NoteExport {
  title: string;
  content: NoteContent;
}
