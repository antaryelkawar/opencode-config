import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "session-affinity",
  async setup(ctx) {
    await ctx.session.hook(
      "model.request",
      (event) => {
        const headers = event.headers
        if (!headers || typeof headers !== "object") return
        if (!event.sessionID) return

        const agentSessionID = event.agent ? `${event.agent}-${event.sessionID}` : event.sessionID
        headers["X-Session-Id"] = event.sessionID
        headers["X-LiteLLM-Session-Id"] = agentSessionID
        headers["x-opencode-session"] = agentSessionID
      },
      { providerID: "litellm" },
    )
  },
})
