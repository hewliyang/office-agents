import { createContext } from "svelte";
import type { ChatController } from "./chat-controller";

export const [getChatContext, setChatContext] = createContext<ChatController>();
