import { describe, expect, it } from "vitest";

import {
  MAX_TRANSCRIPT_ENTRIES,
  initialRecognitionState,
  parseServerMessage,
  recognitionReducer,
  transcriptToSentence,
} from "@/lib/recognition-state";
import type { TranscriptEntry } from "@/types/recognition";

describe("parseServerMessage", () => {
  it("parses a valid prediction", () => {
    const msg = parseServerMessage(
      '{"type":"prediction","word":"hello","confidence":0.9,"duration":1.2}',
    );
    expect(msg).toEqual({
      type: "prediction",
      word: "hello",
      confidence: 0.9,
      duration: 1.2,
    });
  });

  it("parses a status message", () => {
    expect(parseServerMessage('{"type":"status","signing":true}')).toEqual({
      type: "status",
      signing: true,
    });
  });

  it("returns null for invalid JSON or unknown types", () => {
    expect(parseServerMessage("not json")).toBeNull();
    expect(parseServerMessage('{"type":"other"}')).toBeNull();
    expect(parseServerMessage('{"type":"prediction"}')).toBeNull();
  });
});

describe("recognitionReducer", () => {
  it("updates connection status", () => {
    const next = recognitionReducer(initialRecognitionState, {
      type: "connection",
      status: "open",
    });
    expect(next.connection).toBe("open");
  });

  it("sets signing from a status message", () => {
    const next = recognitionReducer(initialRecognitionState, {
      type: "message",
      message: { type: "status", signing: true },
      at: 1,
    });
    expect(next.isSigning).toBe(true);
  });

  it("appends predictions and clears the signing flag", () => {
    const next = recognitionReducer(
      { ...initialRecognitionState, isSigning: true },
      {
        type: "message",
        message: {
          type: "prediction",
          word: "thank_you",
          confidence: 0.95,
          duration: 1.5,
        },
        at: 1000,
      },
    );
    expect(next.transcript).toHaveLength(1);
    expect(next.latest?.word).toBe("thank_you");
    expect(next.isSigning).toBe(false);
  });

  it("caps the transcript length", () => {
    let state = initialRecognitionState;
    for (let i = 0; i < MAX_TRANSCRIPT_ENTRIES + 10; i += 1) {
      state = recognitionReducer(state, {
        type: "message",
        message: {
          type: "prediction",
          word: `w${i}`,
          confidence: 1,
          duration: 1,
        },
        at: i,
      });
    }
    expect(state.transcript).toHaveLength(MAX_TRANSCRIPT_ENTRIES);
    expect(state.transcript.at(-1)?.word).toBe(
      `w${MAX_TRANSCRIPT_ENTRIES + 9}`,
    );
  });

  it("clears the transcript", () => {
    const seeded = recognitionReducer(initialRecognitionState, {
      type: "message",
      message: { type: "prediction", word: "yes", confidence: 1, duration: 1 },
      at: 1,
    });
    const cleared = recognitionReducer(seeded, { type: "clear" });
    expect(cleared.transcript).toHaveLength(0);
    expect(cleared.latest).toBeNull();
  });
});

describe("transcriptToSentence", () => {
  it("joins words and replaces underscores", () => {
    const entries: TranscriptEntry[] = [
      { id: "1", word: "how_are_you", confidence: 1, at: 1 },
      { id: "2", word: "thank_you", confidence: 1, at: 2 },
    ];
    expect(transcriptToSentence(entries)).toBe("how are you thank you");
  });
});
