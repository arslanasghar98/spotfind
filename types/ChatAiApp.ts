import { ReactNode } from "react";
import type { ToolInvocation } from "ai";

export type AIState = Array<{
  id?: number;
  name?:
    | "get_podcast_episode_suggestion"
    | "get_podcast_summary"
    | "get_song_recommendations";
  role: "user" | "assistant" | "system";
  content: string;
}>;

export type UIState = Array<{
  id: number;
  role: "user" | "assistant";
  display: ReactNode;
  toolInvocations?: ToolInvocation[];
}>;
