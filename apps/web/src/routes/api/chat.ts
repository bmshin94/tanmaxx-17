import { createFileRoute } from "@tanstack/react-router";
import {
  chat,
  chatParamsFromRequestBody,
  maxIterations,
  mergeAgentTools,
  toServerSentEventsResponse,
} from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { buildServerTools } from "#/server/ai/tools";
import { MODEL_SMART } from "#/server/ai/anthropic";

const SYSTEM_PROMPT =
  "You are a strength-training coach inside the TanMaxx app. Use the available tools to log sets, fetch PRs, and generate programs. Be concise and direct.";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const abortController = new AbortController();

        let params: Awaited<ReturnType<typeof chatParamsFromRequestBody>>;
        try {
          params = await chatParamsFromRequestBody(await request.json());
        } catch (error) {
          return new Response(
            error instanceof Error ? error.message : "Bad request",
            { status: 400 },
          );
        }

        const fp = params.forwardedProps as {
          sessionId?: unknown;
          lower?: unknown;
          upper?: unknown;
        };
        const sessionId =
          typeof fp.sessionId === "string" ? fp.sessionId : "seed-1";
        const lower = typeof fp.lower === "number" ? fp.lower : 40;
        const upper = typeof fp.upper === "number" ? fp.upper : 60;

        const serverTools = buildServerTools({ sessionId, lower, upper });
        const merged = mergeAgentTools(serverTools, params.tools);

        const stream = chat({
          adapter: anthropicText(MODEL_SMART),
          tools: Object.values(merged),
          systemPrompts: [SYSTEM_PROMPT],
          agentLoopStrategy: maxIterations(4),
          messages: params.messages,
          threadId: params.threadId,
          runId: params.runId,
          abortController,
        });

        return toServerSentEventsResponse(stream, { abortController });
      },
    },
  },
});
