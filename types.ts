export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GameOption {
  id: string;
  label: string;
  text: string;
}

export interface ParsedResponse {
  narrative: string;
  statusBlock: string | null;
  options: GameOption[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}