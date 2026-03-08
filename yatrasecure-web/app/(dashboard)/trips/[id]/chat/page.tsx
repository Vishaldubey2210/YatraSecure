"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Users, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, getAccessToken } from "@/app/lib/api";
import toast from "react-hot-toast";

interface Msg { id: string; tripId: string; userId: string; username: string; content: string; createdAt: string; type?: string; }

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDay(d: string) {
  const date = new Date(d);
  const today = new Date();
  const diff  = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const params  = useParams();
  const router  = useRouter();
  const tripId  = params.id as string;

  const [trip, setTrip]           = useState<any>(null);
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [input, setInput]         = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const socketRef   = useRef<Socket | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setCurrentUser(JSON.parse(s));
    loadTrip();
    return () => { socketRef.current?.disconnect(); };
  }, [tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadTrip() {
    try {
      const token = getAccessToken();
      if (!token) { router.push("/login"); return; }
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Trip not found");
      setTrip(await res.json());
      // Load history
      const mRes = await fetch(`${API_BASE_URL}/trips/${tripId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      if (mRes.ok) setMessages(await mRes.json());
      connectSocket(token);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  function connectSocket(token: string) {
    const wsBase = API_BASE_URL.replace(/^http/, "ws").replace(/\/api$/, "");
    const socket = io(`${wsBase}/chat`, { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect",    ()  => { setConnected(true);  socket.emit("joinRoom", { tripId }); });
    socket.on("disconnect", ()  => setConnected(false));
    socket.on("joinedRoom", ()  => {});
    socket.on("newMessage", (m: Msg) => setMessages(p => [...p, m]));
    socket.on("error",      (e) => toast.error(e?.message || "Socket error"));
  }

  function sendMessage() {
    if (!input.trim() || !socketRef.current?.connected) return;
    socketRef.current.emit("sendMessage", { tripId, content: input.trim() });
    setInput("");
    inputRef.current?.focus();
  }

  // Group messages by day
  const grouped: { day: string; msgs: Msg[] }[] = [];
  messages.forEach(m => {
    const day = formatDay(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) { last.msgs.push(m); }
    else grouped.push({ day, msgs: [m] });
  });

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }} className="anim-in">
      <div style={{ height: 60, borderRadius: 14, background: "#1a2744", marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ flex: 1, borderRadius: 14, background: "#1a2744", animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );

  return (
    <div className="anim-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexShrink: 0 }}>
        <button onClick={() => router.push(`/trips/${tripId}`)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#475569" }}>
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{trip?.name} — Chat</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, background: "rgba(148,163,184,0.06)", border: "1px solid #1e293b" }}>
          <Users style={{ width: 13, height: 13, color: "#64748b" }} />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{trip?.members?.length || 0}</span>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="card" style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: 14, color: "#475569" }}>No messages yet — say hello!</p>
            </div>
          </div>
        ) : (
          grouped.map((g, gi) => (
            <div key={gi}>
              {/* Day separator */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: gi > 0 ? 16 : 0 }}>
                <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
                <span style={{ fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{g.day}</span>
                <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
              </div>
              {/* Messages */}
              {g.msgs.map((m, mi) => {
                const isMe    = m.userId === currentUser?.id;
                const showName = !isMe && (mi === 0 || g.msgs[mi - 1]?.userId !== m.userId);
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 4 }}>
                    <div style={{ maxWidth: "70%" }}>
                      {showName && <p style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginBottom: 3, marginLeft: 4 }}>@{m.username}</p>}
                      <div style={{
                        padding: "9px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isMe
                          ? "linear-gradient(135deg, rgba(249,115,22,0.25), rgba(251,191,36,0.15))"
                          : "#1e2d4a",
                        border: `1px solid ${isMe ? "rgba(249,115,22,0.25)" : "#2d3f5e"}`,
                      }}>
                        <p style={{ fontSize: 14, color: isMe ? "#fef3c7" : "#e2e8f0", margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>{m.content}</p>
                        <p style={{ fontSize: 10, color: isMe ? "rgba(251,191,36,0.6)" : "#334155", margin: "4px 0 0", textAlign: "right" }}>{formatTime(m.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexShrink: 0 }}>
        <input
          ref={inputRef}
          className="input-field"
          placeholder={connected ? "Type a message..." : "Connecting..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          disabled={!connected}
          style={{ flex: 1 }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
          className="btn-primary"
          style={{ padding: "12px 18px", flexShrink: 0 }}
        >
          <Send style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}
