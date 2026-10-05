/** Messages exchanged with the Python PSL inference server (`/ws`). */

/** A completed-sign prediction pushed by the server. */
export interface PredictionMessage {
  type: "prediction";
  word: string;
  confidence: number;
  duration: number;
}

/** Signing/idle status, sent when it changes. */
export interface StatusMessage {
  type: "status";
  signing: boolean;
}

/** Any message the server may send. */
export type ServerMessage = PredictionMessage | StatusMessage;

/** A recognized word recorded in the running transcript. */
export interface TranscriptEntry {
  id: string;
  word: string;
  confidence: number;
  at: number;
}

/** Connection lifecycle of the recognition WebSocket. */
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";
