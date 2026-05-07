import { useState, useEffect, useRef, useCallback } from "react";
import { getMyChats } from "../api/chatApi";
import { readLastSeen } from "../utils/chatStorage";

/**
 * Polls the chat list every `intervalMs` milliseconds and returns
 * `hasAnyUnread` — true when at least one chat has a message newer
 * than the user's last-seen timestamp stored in localStorage.
 *
 * Accepts `userId` directly from the caller (obtained via `useAuth()`),
 * so no token decoding happens here.
 */
export function useUnreadBadge(userId, intervalMs = 10_000) {
  const [hasAnyUnread, setHasAnyUnread] = useState(false);
  const pollRef = useRef(null);

  const check = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getMyChats();
      const data = res.data?.data ?? res.data ?? [];
      const lastSeen = readLastSeen(userId);
      const anyUnread = data.some((chat) => {
        if (chat.isReadOnly) return false;       // archived chats never count as unread
        if (!chat.lastMessageAt) return false;
        const seenAt = lastSeen[chat._id] ? new Date(lastSeen[chat._id]) : new Date(0);
        return new Date(chat.lastMessageAt) > seenAt;
      });
      setHasAnyUnread(anyUnread);
    } catch {
      // silent — don't disrupt the UI on network errors
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    check(); // immediate first check
    pollRef.current = setInterval(check, intervalMs);
    return () => clearInterval(pollRef.current);
  }, [check, intervalMs, userId]);

  return hasAnyUnread;
}
