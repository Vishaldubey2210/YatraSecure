"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, UserPlus, CheckCircle, XCircle,
  Loader2, Shield, Clock, MapPin, Calendar, Trash2
} from "lucide-react";
import { API_BASE_URL, getAccessToken } from "@/app/lib/api";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface JoinRequest { id: string; message?: string; status: string; createdAt: string; requester: { id: string; username: string; city?: string; state?: string; }; }
interface Member      { id: string; role: string; joinedAt: string; userId: string; user: { id: string; username: string; city?: string; state?: string; }; }

export default function TripAdminPage() {
  const params  = useParams();
  const router  = useRouter();
  const tripId  = params.id as string;

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [members, setMembers]   = useState<Member[]>([]);
  const [trip, setTrip]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "members">("requests");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [removingId, setRemovingId]     = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setCurrentUser(JSON.parse(s));
    loadData();
  }, [tripId]);

  async function loadData() {
    setLoading(true); setError("");
    try {
      const token = getAccessToken();
      if (!token) { router.push("/login"); return; }
      const h = { Authorization: `Bearer ${token}` };

      const [tripRes, reqRes, memRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trips/${tripId}`,               { headers: h }),
        fetch(`${API_BASE_URL}/trips/${tripId}/join-requests`, { headers: h }),
        fetch(`${API_BASE_URL}/trips/${tripId}/members`,       { headers: h }),
      ]);

      if (!tripRes.ok) throw new Error("Trip not found");
      const tripData = await tripRes.json();
      setTrip(tripData);

      const cu = currentUser || JSON.parse(localStorage.getItem("user") || "{}");
      if (tripData.adminId !== cu.id && tripData.admin?.id !== cu.id) {
        toast.error("Admin access only");
        router.replace(`/trips/${tripId}`);
        return;
      }
      if (reqRes.ok) setRequests(await reqRes.json());
      if (memRes.ok) setMembers(await memRes.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleRequest(id: string, status: "accepted" | "rejected") {
    setProcessingId(id);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/join-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(status === "accepted" ? "✅ Member approved!" : "Request rejected");
      loadData();
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingId(null); }
  }

  async function handleRemove(userId: string, username: string) {
    if (!confirm(`Remove @${username} from the trip?`)) return;
    setRemovingId(userId);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${userId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`@${username} removed`);
      loadData();
    } catch (e: any) { toast.error(e.message); }
    finally { setRemovingId(null); }
  }

  const pending  = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  if (loading) return (
    <div className="anim-in">
      {[60, 120, 300].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: "#1a2744", marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  return (
    <div className="anim-in" style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* Back */}
      <button onClick={() => router.push(`/trips/${tripId}`)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Trip
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <h1 className="page-title" style={{ fontSize: 20 }}>Admin Panel</h1>
          </div>
          <p className="page-subtitle">{trip?.name}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: UserPlus, label: "Pending",  value: pending.length,  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"   },
          { icon: Users,    label: "Members",  value: members.length,  color: "#f97316", bg: "rgba(249,115,22,0.1)"   },
          { icon: CheckCircle, label: "Approved", value: resolved.filter(r => r.status === "accepted").length, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
          { icon: XCircle,  label: "Rejected", value: resolved.filter(r => r.status === "rejected").length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ width: 14, height: 14, color }} />
              </div>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: "white", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#1a2744", borderRadius: 12, padding: 4 }}>
        {(["requests", "members"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
            background: activeTab === tab ? "rgba(249,115,22,0.15)" : "transparent",
            border:     activeTab === tab ? "1px solid rgba(249,115,22,0.3)" : "1px solid transparent",
            color:      activeTab === tab ? "#f97316" : "#475569",
          }}>
            {tab === "requests"
              ? `Join Requests ${pending.length > 0 ? `(${pending.length})` : ""}`
              : `Members (${members.length})`
            }
          </button>
        ))}
      </div>

      {/* ── JOIN REQUESTS ── */}
      {activeTab === "requests" && (
        <div>
          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⏳ Pending ({pending.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map(r => (
                  <div key={r.id} className="card" style={{ padding: "16px 18px", borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
                          {r.requester.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>@{r.requester.username}</p>
                          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                            {r.requester.city && <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 3 }}><MapPin style={{ width: 9, height: 9 }} />{r.requester.city}</span>}
                            <span style={{ fontSize: 11, color: "#334155", display: "flex", alignItems: "center", gap: 3 }}><Clock style={{ width: 9, height: 9 }} />{timeAgo(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleRequest(r.id, "accepted")}
                          disabled={processingId === r.id}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", cursor: "pointer" }}
                        >
                          {processingId === r.id ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <CheckCircle style={{ width: 13, height: 13 }} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequest(r.id, "rejected")}
                          disabled={processingId === r.id}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}
                        >
                          <XCircle style={{ width: 13, height: 13 }} /> Reject
                        </button>
                      </div>
                    </div>
                    {r.message && (
                      <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 9, background: "rgba(148,163,184,0.05)", border: "1px solid #1e293b" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontStyle: "italic" }}>"{r.message}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Past Requests ({resolved.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {resolved.map(r => (
                  <div key={r.id} className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#64748b" }}>
                        {r.requester.username.slice(0, 2).toUpperCase()}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: 0 }}>@{r.requester.username}</p>
                    </div>
                    <span className="badge" style={{
                      background: r.status === "accepted" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      border:     `1px solid ${r.status === "accepted" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                      color:      r.status === "accepted" ? "#22c55e" : "#ef4444",
                    }}>
                      {r.status === "accepted" ? <CheckCircle style={{ width: 10, height: 10 }} /> : <XCircle style={{ width: 10, height: 10 }} />}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && resolved.length === 0 && (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <UserPlus style={{ width: 32, height: 32, color: "#334155", margin: "0 auto 12px" }} />
              <p style={{ color: "#475569", fontSize: 14 }}>No join requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS ── */}
      {activeTab === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <Users style={{ width: 32, height: 32, color: "#334155", margin: "0 auto 12px" }} />
              <p style={{ color: "#475569", fontSize: 14 }}>No members yet</p>
            </div>
          ) : members.map((m: Member) => {
            const isAdminMember = m.userId === trip?.adminId || m.user?.id === trip?.adminId;
            return (
              <div key={m.userId} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: isAdminMember ? "linear-gradient(135deg,#f97316,#fbbf24)" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: isAdminMember ? "white" : "#64748b", flexShrink: 0 }}>
                  {m.user.username.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>@{m.user.username}</p>
                    {isAdminMember && (
                      <span className="badge" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316" }}>
                        <Shield style={{ width: 9, height: 9 }} /> Admin
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                    {m.user.city && <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 3 }}><MapPin style={{ width: 9, height: 9 }} />{m.user.city}</span>}
                    <span style={{ fontSize: 11, color: "#334155", display: "flex", alignItems: "center", gap: 3 }}><Calendar style={{ width: 9, height: 9 }} />Joined {timeAgo(m.joinedAt)}</span>
                  </div>
                </div>
                {!isAdminMember && (
                  <button
                    onClick={() => handleRemove(m.userId, m.user.username)}
                    disabled={removingId === m.userId}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer" }}
                  >
                    {removingId === m.userId
                      ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                      : <Trash2 style={{ width: 12, height: 12 }} />
                    }
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
