/**
 * Pure state logic for the recognition stream, kept separate from the React hook
 * so it can be unit-tested without a DOM or a live WebSocket.
 */
import type {
  ConnectionStatus,
  ServerMessage,
  TranscriptEntry,
} from "@/types/recognition";

export interface RecognitionState {
  connection: ConnectionStatus;
  isSigning: boolean;
  latest: TranscriptEntry | null;
  transcript: TranscriptEntry[];
}

export type RecognitionAction =
  | { type: "connection"; status: ConnectionStatus }
  | { type: "message"; message: ServerMessage; at: number }
  | { type: "clear" };

/** Max transcript entries kept in memory (prevents unbounded growth). */
export const MAX_TRANSCRIPT_ENTRIES = 100;

export const initialRecognitionState: RecognitionState = {
  connection: "idle",
  isSigning: false,
  latest: null,
  transcript: [],
};

/** Parse a raw WebSocket payload into a typed message, or null if invalid. */
export function parseServerMessage(raw: string): ServerMessage | null {
  try {
    const data = JSON.parse(raw) as Partial<ServerMessage>;
    if (data.type === "prediction" && typeof data.word === "string") {
      return {
        type: "prediction",
        word: data.word,
        confidence: Number(data.confidence ?? 0),
        duration: Number(data.duration ?? 0),
      };
    }
    if (data.type === "status" && typeof data.signing === "boolean") {
      return { type: "status", signing: data.signing };
    }
    return null;
  } catch {
    return null;
  }
}

export function recognitionReducer(
  state: RecognitionState,
  action: RecognitionAction,
): RecognitionState {
  switch (action.type) {
    case "connection":
      return { ...state, connection: action.status };

    case "message": {
      const { message, at } = action;
      if (message.type === "status") {
        return { ...state, isSigning: message.signing };
      }
      // prediction
      const entry: TranscriptEntry = {
        id: `${at}-${message.word}`,
        word: message.word,
        confidence: message.confidence,
        at,
      };
      const transcript = [...state.transcript, entry].slice(
        -MAX_TRANSCRIPT_ENTRIES,
      );
      return { ...state, latest: entry, isSigning: false, transcript };
    }

    case "clear":
      return { ...state, latest: null, transcript: [] };

    default:
      return state;
  }
}

/** Build a readable sentence from transcript words. */
export function transcriptToSentence(transcript: TranscriptEntry[]): string {
  return transcript.map((entry) => entry.word.replace(/_/g, " ")).join(" ");
}
