import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import Alert from "../components/ui/Alert";
import { getMyChats } from "../api/chatApi";
import { useAuth } from "../context/useAuth";
import { readLastSeen, writeLastSeen } from "../utils/chatStorage";

export default function ChatPage({ navItems = [], title = "Messages" }) {
  const { userId: currentUserId } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [initialLoadingChats, setInitialLoadingChats] = useState(false);
  const [error, setError] = useState(null);
  // chatId → true/false (has unread), computed from lastMessageAt vs localStorage
  const [hasUnreadMap, setHasUnreadMap] = useState({});
  const pollRef = useRef(null);

  // Compute which chats have unseen messages from lastMessageAt vs localStorage.
  // Archived (read-only) chats are always treated as read — their unread state
  // is irrelevant once the chat is closed/archived.
  const computeUnread = useCallback((chatList) => {
    if (!currentUserId) return;
    const lastSeen = readLastSeen(currentUserId);
    const map = {};
    for (const chat of chatList) {
      // Archived chats: never show as unread
      if (chat.isReadOnly) { map[chat._id] = false; continue; }
      if (!chat.lastMessageAt) { map[chat._id] = false; continue; }
      const seenAt = lastSeen[chat._id] ? new Date(lastSeen[chat._id]) : new Date(0);
      map[chat._id] = new Date(chat.lastMessageAt) > seenAt;
    }
    setHasUnreadMap(map);
  }, [currentUserId]);

  const fetchChats = useCallback(async (silent = false) => {
    if (!silent) setInitialLoadingChats(true);
    if (!silent) setError(null);
    try {
      const res = await getMyChats();
      const data = res.data?.data ?? res.data ?? [];
      setChats(data);
      computeUnread(data);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message ?? "Failed to load conversations.");
    } finally {
      if (!silent) setInitialLoadingChats(false);
    }
  }, [computeUnread]);

  // Initial load (with spinner), then silent background polling every 10 s
  useEffect(() => {
    fetchChats(false); // first fetch shows spinner
    pollRef.current = setInterval(() => fetchChats(true), 10_000);
    return () => clearInterval(pollRef.current);
  }, [fetchChats]);

  // Called by ChatWindow: when a chat is opened, mark it as seen in localStorage
  const handleUnreadCount = useCallback((chatId, count) => {
    if (count === 0 && currentUserId) {
      // User has read the messages — persist the current time as lastSeen
      const lastSeen = readLastSeen(currentUserId);
      lastSeen[chatId] = new Date().toISOString();
      writeLastSeen(currentUserId, lastSeen);
      setHasUnreadMap((prev) => ({ ...prev, [chatId]: false }));
    }
  }, [currentUserId]);


  return (
    <DashboardLayout navItems={navItems}>
      {/* ── Page title row ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary dark:text-dark-text">
            {title}
          </h1>
          <span className="mt-0.5 block h-1 w-12 rounded-full bg-primary" />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* ── Two-panel chat area ─────────────────────────────── */}
      <div
        className="
          flex rounded-2xl overflow-hidden
          border border-border dark:border-dark-border
          bg-bg-main dark:bg-dark-bg shadow-sm
        "
        style={{ height: "calc(100vh - 168px)" }}
      >
        {/* ── Left: conversation list ────────────────────────── */}
        <aside
          className="
            w-72 shrink-0 flex flex-col
            border-r border-border dark:border-dark-border
            bg-bg-card dark:bg-dark-surface overflow-y-auto
          "
        >
          <div className="px-4 py-3 border-b border-border dark:border-dark-border shrink-0">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Conversations
            </span>
          </div>
          <ConversationList
            chats={chats}
            activeChatId={activeChat?._id}
            currentUserId={currentUserId}
            onSelectChat={setActiveChat}
            loading={initialLoadingChats}
            hasUnreadMap={hasUnreadMap}
          />
        </aside>

        {/* ── Right: chat window ─────────────────────────────── */}
        <div className="flex-1 flex min-w-0 bg-bg-main dark:bg-dark-bg">
          <ChatWindow
            chat={activeChat}
            currentUserId={currentUserId}
            onUnreadCount={handleUnreadCount}
            isReadOnly={activeChat?.isReadOnly ?? false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
