import { useState } from "react";

import { env } from "@seile/env/native";

export function useAiStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stream = async (
    prompt: string,
    handlers?: {
      onChunk?: (chunk: string) => void;
      onDone?: () => void;
    },
  ) => {
    setError(null);
    setIsStreaming(true);

    try {
      const response = await fetch(
        `${env.EXPO_PUBLIC_CONVEX_SITE_URL.replace(/\/$/, "")}/ai/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ prompt }),
        },
      );

      if (!response.ok || !response.body) {
        throw new Error(`AI stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        handlers?.onChunk?.(decoder.decode(value, { stream: true }));
      }

      handlers?.onDone?.();
    } catch (streamError) {
      setError(
        streamError instanceof Error ? streamError.message : "AI stream failed.",
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    stream,
    isStreaming,
    error,
  };
}
