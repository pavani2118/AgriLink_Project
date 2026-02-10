import { apiGet, apiPost } from "./api";

// open/create thread from product (cart button)
export const openChatByProduct = async (productId) =>
  apiPost("/api/chats/open-by-product", { productId });

// bottom tab list
export const getMyThreads = async () =>
  apiGet("/api/chats/threads/mine");

// messages
export const getThreadMessages = async (threadId) =>
  apiGet(`/api/chats/threads/${threadId}/messages`);

// send message
export const sendMessage = async (threadId, text) =>
  apiPost(`/api/chats/threads/${threadId}/messages`, { text });

// mark seen (for unread/bold)
export const markThreadSeen = async (threadId) =>
  apiPost(`/api/chats/threads/${threadId}/seen`, {});
