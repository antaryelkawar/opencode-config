import type { Plugin } from "@opencode-ai/plugin"

export const SessionAffinityOpenCodePlugin: Plugin = async () => {
  return {
    "chat.headers": async (input, output) => {
      if (!input?.provider?.info?.id || input.provider.info.id !== "litellm") return
      if (!input?.sessionID) return
      if (!output || typeof output.headers !== "object") return

      const sessionId = input.sessionID
      const agentSessionId = input.agent ? `${input.agent}-${sessionId}` : sessionId
      output.headers["X-Session-Id"] = sessionId
      output.headers["X-LiteLLM-Session-Id"] = agentSessionId
    },
  }
}
