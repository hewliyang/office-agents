# Compaction — TODO

## Design

Messages array stays flat. A `compactionSummary` custom message type is inserted at the cut point.
Old messages are preserved for display but excluded from LLM context.

```
m1, m2, m3, m4, m5, [compactionSummary], m6, m7
                      ^--- LLM context starts here
```

- **Display**: filter out `compactionSummary` messages, user sees linear history as-is
- **LLM context**: find last `compactionSummary` in array, send it + everything after it
- **Re-compaction**: no iterative logic needed — previous compaction summary is already in the LLM context window, gets naturally folded into the next summary
- **UI hint**: optional subtle divider at the compaction point (not the summary content itself)

## DB/Schema

No changes. `compactionSummary` is a custom `AgentMessage` that serializes into the existing `agentMessages: AgentMessage[]` array in IndexedDB.

## Implementation Steps

### 1. Define custom message type (SDK)
- Declaration-merge `CustomAgentMessages` to add `compactionSummary` role
- Shape: `{ role: "compactionSummary"; summary: string; timestamp: number }`

### 2. convertToLlm handling (SDK)
- In the agent's `convertToLlm` hook, convert `compactionSummary` to a `UserMessage` with summary text wrapped in `<compaction_summary>` tags
- Already have a `convertToLlm` in the Agent constructor — extend it

### 3. Context building (SDK — runtime.ts)
- Use the agent's `transformContext` hook (or add one)
- Before sending messages to LLM: find the last `compactionSummary` in the array, slice from there
- Everything before it stays in `agent.state.messages` (for persistence/display) but is excluded from LLM context

### 4. Overflow detection (SDK — runtime.ts)
- In `handleAgentEvent` for `message_end`: check if the assistant message indicates context overflow
  - `stopReason === "error"` + error message contains overflow indicators (pi-mono has `isContextOverflow()`)
  - OR `usage.totalTokens > contextWindow - reserveTokens` (threshold)
- pi-mono ref: `isContextOverflow(assistantMessage, contextWindow)`

### 5. Compaction flow (SDK — runtime.ts)
- On overflow trigger:
  1. Get current LLM context messages (from last compaction point or start of array)
  2. Find cut point: walk backwards keeping ~20k tokens of recent messages (chars/4 heuristic)
  3. Send old messages (before cut point) to LLM with summarization prompt via `completeSimple()`
  4. Insert `compactionSummary` message at cut point in `agent.state.messages`
  5. `agent.replaceMessages(updatedMessages)`
  6. If triggered by overflow, auto-retry the failed prompt

### 6. Display filtering (SDK — message-utils.ts)
- `agentMessagesToChatMessages()` already converts AgentMessage[] → ChatMessage[] for UI
- Filter out `compactionSummary` messages so they never appear in the chat UI

## UI Concerns

### State During Compaction
- Compaction is an async LLM call that happens **between** agent turns
- Need a new state flag: `isCompacting: boolean` on `RuntimeState`
- UI should show a loading/status indicator (e.g. "Compacting context...") while compaction runs
- Input should be disabled during compaction (same as during streaming)
- `isStreaming` stays `false` during compaction — it's a separate state

### Event Flow (overflow case)
```
1. agent streams response
2. message_end → stopReason: "error" (overflow)
3. agent_end fires → onStreamingEnd() saves session
4. detect overflow in message_end or agent_end handler
5. set isCompacting = true, emit state update
6. remove error message from agent state
7. run compaction (LLM call for summary)
8. insert compactionSummary, replaceMessages, save session
9. set isCompacting = false
10. auto-retry: re-send the last user prompt
```

### Event Flow (threshold case)
```
1. agent streams response successfully
2. message_end → usage shows context near limit
3. agent_end fires → onStreamingEnd() saves session
4. detect threshold breach
5. set isCompacting = true
6. run compaction (LLM call for summary)
7. insert compactionSummary, replaceMessages, save session
8. set isCompacting = false
9. NO auto-retry — user continues manually
```

### UI Updates Needed
- `RuntimeState`: add `isCompacting: boolean`
- `ChatInterface`: disable input when `isCompacting`
- `ChatInterface`: show compaction indicator (toast, inline status, or subtle banner)
- Stats bar: update `lastInputTokens` after compaction to reflect reduced context
