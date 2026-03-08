"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Plus, Wallet, TrendingDown, Users, Receipt,
  Loader2, AlertCircle, X, ChevronDown
} from "lucide-react";
import { API_BASE_URL, getAccessToken } from "@/app/lib/api";

const CATEGORIES = ["Food", "Transport", "Accommodation", "Shopping", "Activities", "Medical", "Other"];

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_COLOR: Record<string, string> = {
  food: "#f97316", transport: "#60a5fa", accommodation: "#a78bfa",
  shopping: "#fbbf24", activities: "#34d399", medical: "#f87171", other: "#94a3b8",
};

export default function WalletPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [wallet, setWallet]       = useState<any>(null);
  const [expenses, setExpenses]   = useState<any[]>([]);
  const [members, setMembers]     = useState<any[]>([]);
  const [trip, setTrip]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [form, setForm] = useState({
    description: "", amount: "", category: "Food",
    splitType: "equal", paidBy: "",
  });
  const [fe, setFe] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); setCurrentUser(u); setForm(p => ({ ...p, paidBy: u.id })); }
    loadAll();
  }, [tripId]);

  async function loadAll() {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) { router.push("/login"); return; }
      const h = { Authorization: `Bearer ${token}` };

      const [tripRes, memRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trips/${tripId}`,         { headers: h }),
        fetch(`${API_BASE_URL}/trips/${tripId}/members`, { headers: h }),
      ]);
      if (tripRes.ok) setTrip(await tripRes.json());
      if (memRes.ok) setMembers(await memRes.json());

      const wRes = await fetch(`${API_BASE_URL}/trips/${tripId}/wallet`, { headers: h });
      if (wRes.ok) {
        const w = await wRes.json();
        setWallet(w);
        const eRes = await fetch(`${API_BASE_URL}/trips/${tripId}/wallet/expenses`, { headers: h });
        if (eRes.ok) setExpenses(await eRes.json());
      }
    } catch (e: any) { toast.error("Failed to load wallet"); }
    finally { setLoading(false); }
  }

  function validate(f: string, v: string) {
    if (f === "description") return !v.trim() ? "Required" : "";
    if (f === "amount")      return !v ? "Required" : Number(v) <= 0 ? "Must be > 0" : "";
    if (f === "paidBy")      return !v ? "Required" : "";
    return "";
  }

  function change(f: string, v: string) {
    setForm(p => ({ ...p, [f]: v }));
    if (fe[f]) setFe(p => ({ ...p, [f]: validate(f, v) }));
  }

  async function addExpense() {
    const errs = { description: validate("description", form.description), amount: validate("amount", form.amount), paidBy: validate("paidBy", form.paidBy) };
    setFe(errs);
    if (Object.values(errs).some(Boolean)) return;
    setSubmitting(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/wallet/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Failed"); }
      toast.success("Expense added!");
      setForm(p => ({ ...p, description: "", amount: "", category: "Food" }));
      setShowForm(false);
      loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  }

  const totalSpent   = expenses.reduce((a, e) => a + (e.amount || 0), 0);
  const totalBudget  = wallet?.totalBudget || trip?.budget || 0;
  const remaining    = totalBudget - totalSpent;
  const spentPct     = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  if (loading) return (
    <div className="anim-in">
      {[80, 140, 300].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: "#1a2744", marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  return (
    <div className="anim-in">

      {/* Back */}
      <button onClick={() => router.push(`/trips/${tripId}`)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Trip
      </button>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wallet & Expenses</h1>
          <p className="page-subtitle">{trip?.name}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-ghost" : "btn-primary"} style={{ padding: "10px 20px" }}>
          {showForm ? <><X style={{ width: 15, height: 15 }} /> Cancel</> : <><Plus style={{ width: 15, height: 15 }} /> Add Expense</>}
        </button>
      </div>

      {/* ── BUDGET OVERVIEW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { icon: Wallet,      label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`,  color: "#f97316", bg: "rgba(249,115,22,0.1)"   },
          { icon: TrendingDown,label: "Spent",        value: `₹${totalSpent.toLocaleString()}`,   color: "#ef4444", bg: "rgba(239,68,68,0.1)"    },
          { icon: Wallet,      label: "Remaining",    value: `₹${remaining.toLocaleString()}`,    color: remaining >= 0 ? "#22c55e" : "#ef4444", bg: remaining >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" },
          { icon: Receipt,     label: "Transactions", value: expenses.length,                     color: "#60a5fa", bg: "rgba(96,165,250,0.1)"   },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ width: 13, height: 13, color }} />
              </div>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "white", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Budget progress bar */}
      {totalBudget > 0 && (
        <div className="card" style={{ padding: "18px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Budget Usage</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: spentPct > 80 ? "#ef4444" : "#f97316" }}>{spentPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#1e293b", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, width: `${spentPct}%`, transition: "width 0.5s ease", background: spentPct > 80 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#f97316,#fbbf24)" }} />
          </div>
          {remaining < 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <AlertCircle style={{ width: 13, height: 13, color: "#ef4444" }} />
              <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>Over budget by ₹{Math.abs(remaining).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* ── ADD EXPENSE FORM ── */}
      {showForm && (
        <div className="card" style={{ padding: 22, marginBottom: 24, borderColor: "rgba(249,115,22,0.2)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 18 }}>New Expense</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Description</label>
              <input className="input-field" style={{ border: `1.5px solid ${fe.description ? "#ef4444" : "#1e293b"}` }} placeholder="e.g. Hotel stay night 1" value={form.description} onChange={e => change("description", e.target.value)} />
              {fe.description && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{fe.description}</p>}
            </div>
            {/* Amount */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Amount (₹)</label>
              <input type="number" className="input-field" style={{ border: `1.5px solid ${fe.amount ? "#ef4444" : "#1e293b"}` }} placeholder="e.g. 2500" value={form.amount} onChange={e => change("amount", e.target.value)} min={1} />
              {fe.amount && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{fe.amount}</p>}
            </div>
            {/* Category */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Category</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.category}
                  onChange={e => change("category", e.target.value)}
                  style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1.5px solid #1e293b", borderRadius: 12, padding: "12px 36px 12px 14px", color: "#f1f5f9", fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#475569", pointerEvents: "none" }} />
              </div>
            </div>
            {/* Paid By */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Paid By</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.paidBy}
                  onChange={e => change("paidBy", e.target.value)}
                  style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: `1.5px solid ${fe.paidBy ? "#ef4444" : "#1e293b"}`, borderRadius: 12, padding: "12px 36px 12px 14px", color: "#f1f5f9", fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}
                >
                  <option value="">Select member</option>
                  {members.map((m: any) => (
                    <option key={m.userId || m.user?.id} value={m.userId || m.user?.id}>
                      @{m.user?.username || m.username}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#475569", pointerEvents: "none" }} />
              </div>
              {fe.paidBy && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{fe.paidBy}</p>}
            </div>
            {/* Split type */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Split Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["equal", "custom"].map(t => (
                  <button key={t} type="button" onClick={() => change("splitType", t)} style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: form.splitType === t ? "rgba(249,115,22,0.12)" : "transparent", border: `1px solid ${form.splitType === t ? "rgba(249,115,22,0.35)" : "#1e293b"}`, color: form.splitType === t ? "#f97316" : "#475569" }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={addExpense} disabled={submitting} className="btn-primary" style={{ width: "100%", padding: "13px" }}>
            {submitting ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Adding...</> : <><Plus style={{ width: 15, height: 15 }} /> Add Expense</>}
          </button>
        </div>
      )}

      {/* ── EXPENSE LIST ── */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16 }}>
          Expenses {expenses.length > 0 && <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>({expenses.length})</span>}
        </h2>

        {expenses.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Receipt style={{ width: 32, height: 32, color: "#334155", margin: "0 auto 12px" }} />
            <p style={{ color: "#475569", fontSize: 14, marginBottom: 16 }}>No expenses yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>
              <Plus style={{ width: 14, height: 14 }} /> Add First Expense
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {expenses.map((exp: any) => {
              const catColor = CATEGORY_COLOR[exp.category?.toLowerCase()] || "#94a3b8";
              const paidByUser = members.find((m: any) => (m.userId || m.user?.id) === exp.paidBy);
              return (
                <div key={exp.id} className="card card-hover" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Category dot */}
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: `${catColor}15`, border: `1px solid ${catColor}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Receipt style={{ width: 15, height: 15, color: catColor }} />
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{exp.description}</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                      <span className="badge" style={{ background: `${catColor}15`, border: `1px solid ${catColor}25`, color: catColor, fontSize: 10 }}>
                        {exp.category || "Other"}
                      </span>
                      <span style={{ fontSize: 11, color: "#334155" }}>
                        Paid by @{paidByUser?.user?.username || paidByUser?.username || "Unknown"}
                      </span>
                      <span style={{ fontSize: 11, color: "#334155" }}>{timeAgo(exp.createdAt)}</span>
                    </div>
                  </div>
                  {/* Amount */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 900, color: "#f97316", margin: 0 }}>₹{exp.amount?.toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "#334155", margin: 0 }}>
                      {exp.splitType === "equal" ? `÷${members.length}` : "Custom split"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
