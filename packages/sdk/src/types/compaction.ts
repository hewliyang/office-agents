/**
 * Custom message type for compaction summary.
 * This is stored in agent messages to represent summarized conversation context.
 */
export interface CompactionSummaryMessage {
  role: "compactionSummary";
  summary: string;
  content: { type: "text"; text: string }[];
  timestamp: number;
}