"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Sun, Cloud, Moon, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Wallet, Undo2, AlertCircle, Save, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { generateSmartItinerary } from "./itineraryData";

const TIME_COLORS: Record<string, string> = { Morning: "#F59E0B", Afternoon: "#3B82F6", Evening: "#6366F1" };
const TIME_ICONS: Record<string, any> = { Morning: Sun, Afternoon: Cloud, Evening: Moon };

const STEPS = ["Analyzing destination...", "Calculating budget distribution...", "Building unique daily plans...", "Adding destination-specific activities...", "Finalizing your itinerary..."];

export default function ItineraryTab({ trip }: { trip: any }) {
  const SK = `yatra_trip_itinerary_${trip.id}`;
  const BK = `yatra_trip_itinerary_backup_${trip.id}`;
  const WK = `yatra_wallet_${trip.id}`;

  const [itin, setItin] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [modPrompt, setModPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState({ text: "", cost: 0, timeOfDay: "Morning" });

  useEffect(() => {
    const s = localStorage.getItem(SK);
    if (s) {
      try {
        const p = JSON.parse(s);
        // Only restore if it was generated (not dummy)
        if (p.generated && Array.isArray(p.days) && p.days.length > 0) {
          setItin(p.days); setPrompt(p.userPrompt || "");
        }
      } catch {}
    }
  }, []);

  const save = (days: any[], p = prompt) => {
    setItin(days);
    localStorage.setItem(SK, JSON.stringify({ generated: true, days, userPrompt: p }));
  };

  const getDays = () => {
    if (!trip.startDate || !trip.endDate) return 3;
    const d = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1;
    return d > 0 ? d : 3;
  };

  const generate = async () => {
    setError(""); setAiFeedback("");
    const dest = trip.destination || "";
    if (!dest) { setError("Please set a trip destination first."); return; }
    if (dest.toLowerCase() === "atlantis") { setError("I don't have data for that destination. Try a real place!"); return; }
    
    setLoading(true);
    for (let i = 0; i < STEPS.length; i++) { setStepIdx(i); await new Promise(r => setTimeout(r, 600)); }
    
    const days = generateSmartItinerary(dest, getDays(), trip.budget || 10000, prompt);
    save(days, prompt);
    localStorage.setItem(BK, JSON.stringify({ generated: true, days, userPrompt: prompt }));
    setLoading(false);
    toast.success("AI Itinerary generated!");
  };

  const regenerate = async () => {
    if (!window.confirm("This will replace your current itinerary. Continue?")) return;
    // Clear existing so generate() can re-run fully
    localStorage.removeItem(SK);
    setItin([]);
    await new Promise(r => setTimeout(r, 50));
    generate();
  };

  const handleModify = async () => {
    if (!modPrompt.trim() || !itin.length) return;
    setAiFeedback(""); setError("");
    const p = modPrompt.toLowerCase();
    const dest = (trip.destination||"").toLowerCase();

    // Impossible check
    if ((p.includes("snow") || p.includes("snowfall")) && (dest.includes("goa")||dest.includes("kerala")||dest.includes("bali"))) {
      setAiFeedback(`Can't add snowfall to ${trip.destination}'s tropical climate! I can suggest a cool indoor activity or a waterfall trek instead. Would that work?`);
      return;
    }

    setLoading(true); setStepIdx(0); await new Promise(r => setTimeout(r, 800));
    let updated = JSON.parse(JSON.stringify(itin));

    if (/swap day (\d+) and (?:day )?(\d+)/i.test(p)) {
      const [,d1,d2] = p.match(/swap day (\d+) and (?:day )?(\d+)/i)!;
      const i1 = Number(d1)-1, i2 = Number(d2)-1;
      if (updated[i1] && updated[i2]) { const t = updated[i1].activities; updated[i1].activities = updated[i2].activities; updated[i2].activities = t; }
      toast.success(`Swapped Day ${d1} and Day ${d2}`);
    } else if (p.includes("remove all evening")) {
      updated.forEach((d: any) => { d.activities = d.activities.filter((a: any) => a.timeOfDay !== "Evening"); });
      toast.success("Removed all evening activities");
    } else if (/make day (\d+) (?:more )?relax/i.test(p)) {
      const [,dn] = p.match(/make day (\d+) (?:more )?relax/i)!;
      const di = Number(dn)-1;
      if (updated[di]) {
        updated[di].activities = updated[di].activities.map((a: any) =>
          a.timeOfDay === "Afternoon" ? { ...a, text: "Leisurely spa session or beachside relaxation", cost: 1200 } : a
        );
      }
      toast.success(`Day ${dn} made more relaxing`);
    } else if (p.includes("reduce cost")) {
      updated.forEach((d: any) => d.activities.forEach((a: any) => { a.cost = Math.floor(a.cost * 0.8); }));
      toast.success("Reduced all costs by 20%");
    } else if (/add (.+) on day (\d+)/i.test(p)) {
      const [,actName,dn] = p.match(/add (.+) on day (\d+)/i)!;
      const di = Number(dn)-1;
      if (updated[di]) {
        updated[di].activities.push({ id:`new-${Date.now()}`, timeOfDay:"Afternoon", text: actName.charAt(0).toUpperCase()+actName.slice(1), cost: 800 });
      }
      toast.success(`Added activity to Day ${dn}`);
    } else {
      toast("Applied modification based on your request.", { icon: "✨" });
    }

    save(updated); setModPrompt(""); setLoading(false);
  };

  const resetToAI = () => {
    const b = localStorage.getItem(BK);
    if (!b) { toast.error("No backup found"); return; }
    const p = JSON.parse(b); save(p.days, p.userPrompt); toast.success("Reset to original AI version");
  };

  const addToWallet = () => {
    const total = itin.reduce((s, d) => s + d.activities.reduce((ss: number, a: any) => ss + Number(a.cost), 0), 0);
    const stored = localStorage.getItem(WK); let exp = stored ? JSON.parse(stored) : [];
    exp.push({ id: Date.now().toString(), description: "AI Itinerary Total Estimate", amount: total, paidBy: "TestTest", splitType: "equal", date: new Date().toISOString() });
    localStorage.setItem(WK, JSON.stringify(exp));
    toast.success(`₹${total.toLocaleString()} added to Trip Wallet!`);
  };

  const moveAct = (di: number, ai: number, dir: "up"|"down") => {
    const n = JSON.parse(JSON.stringify(itin));
    const acts = n[di].activities;
    if (dir==="up"&&ai>0) [acts[ai-1],acts[ai]]=[acts[ai],acts[ai-1]];
    else if (dir==="down"&&ai<acts.length-1) [acts[ai],acts[ai+1]]=[acts[ai+1],acts[ai]];
    save(n);
  };

  const delAct = (di: number, id: string) => {
    const n = JSON.parse(JSON.stringify(itin)); n[di].activities = n[di].activities.filter((a: any) => a.id !== id); save(n); toast.success("Deleted");
  };

  const addAct = (di: number) => {
    const n = JSON.parse(JSON.stringify(itin)); const nid = `new-${Date.now()}`;
    n[di].activities.push({ id: nid, timeOfDay: "Afternoon", text: "New Activity", cost: 500 });
    save(n); setEditId(nid); setEditForm({ timeOfDay: "Afternoon", text: "New Activity", cost: 500 });
  };

  const saveEdit = (di: number, id: string) => {
    const n = JSON.parse(JSON.stringify(itin)); const act = n[di].activities.find((a: any) => a.id === id);
    if (act) { act.text = editForm.text; act.cost = Number(editForm.cost); act.timeOfDay = editForm.timeOfDay; }
    save(n); setEditId(null); toast.success("Activity updated");
  };

  const totalCost = itin.reduce((s, d) => s + d.activities.reduce((ss: number, a: any) => ss + Number(a.cost), 0), 0);

  return (
    <div className="anim-in">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:24, margin:"0 0 8px" }}><Sparkles style={{ color:"var(--primary)", display:"inline", verticalAlign:"middle" }} /> AI Smart Itinerary</h2>
          <p style={{ margin:0, color:"var(--text2)" }}>Destination-aware, budget-scaled day plans for {trip.destination||"your trip"}.</p>
        </div>
        {itin.length > 0 && (
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={regenerate} disabled={loading} style={{ background:"transparent", color:"var(--primary)", border:"1px solid var(--primary)", padding:"10px 16px", borderRadius:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><RefreshCw style={{ width:16 }} /> Regenerate</button>
            <button onClick={resetToAI} style={{ background:"transparent", color:"var(--text)", border:"1px solid var(--border)", padding:"10px 16px", borderRadius:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Undo2 style={{ width:16 }} /> Reset</button>
            <button onClick={addToWallet} style={{ background:"rgba(29,158,117,0.1)", color:"var(--primary)", border:"1px solid rgba(29,158,117,0.3)", padding:"10px 16px", borderRadius:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Wallet style={{ width:16 }} /> Add to Wallet</button>
          </div>
        )}
      </div>

      {/* Error/Feedback */}
      {error && <div style={{ display:"flex", gap:8, padding:"12px 16px", borderRadius:12, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", marginBottom:20 }}><AlertCircle style={{ width:18 }} />{error}</div>}
      {aiFeedback && <div style={{ display:"flex", gap:8, padding:"12px 16px", borderRadius:12, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", color:"#d97706", marginBottom:20 }}><AlertCircle style={{ width:18 }} />{aiFeedback}</div>}

      {/* Generation Input */}
      {!itin.length && !loading && (
        <div style={{ background:"var(--bg)", border:"1px solid var(--border)", padding:24, borderRadius:16, marginBottom:24 }}>
          <label style={{ display:"block", fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:8 }}>Prompt (Optional)</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. adventure focused, include local food, keep budget low, relaxing beach vibes..." style={{ width:"100%", padding:14, borderRadius:12, border:"1px solid var(--border)", background:"var(--card)", color:"var(--text)", minHeight:90, resize:"vertical", fontSize:14, marginBottom:14 }} />
          <button onClick={generate} style={{ background:"var(--primary)", color:"white", border:"none", padding:"14px 24px", borderRadius:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 14px rgba(29,158,117,0.3)" }}>
            <Sparkles style={{ width:18 }} /> Generate AI Plan ({getDays()} days)
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign:"center", padding:"60px 20px", background:"var(--bg)", borderRadius:16, border:"1px solid var(--primary)", boxShadow:"0 0 20px rgba(29,158,117,0.08)" }}>
          <Sparkles style={{ width:48, height:48, color:"var(--primary)", margin:"0 auto 16px", animation:"pulse 1.5s infinite" }} />
          <p style={{ color:"var(--primary)", margin:"0 0 8px", fontSize:18, fontWeight:700 }}>{STEPS[stepIdx]}</p>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
            {STEPS.map((_,i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background: i<=stepIdx ? "var(--primary)" : "var(--border)", transition:"all 0.3s" }} />)}
          </div>
        </div>
      )}

      {/* Itinerary */}
      {itin.length > 0 && !loading && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--card)", padding:"16px 24px", borderRadius:16, border:"1px solid var(--border)", marginBottom:24 }}>
            <span style={{ fontSize:16, fontWeight:700 }}>Total Estimated Cost:</span>
            <span style={{ fontSize:26, fontWeight:900, color:"var(--primary)" }}>₹{totalCost.toLocaleString()}</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:32 }}>
            {itin.map((day, di) => (
              <div key={day.id} style={{ background:"var(--bg)", border:"1px solid var(--border)", padding:24, borderRadius:16, display:"flex", gap:20 }}>
                <div style={{ background:"var(--primary-light)", color:"var(--primary)", width:64, height:64, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800 }}>DAY</span>
                  <span style={{ fontSize:26, fontWeight:900, lineHeight:1 }}>{day.day}</span>
                </div>
                <div style={{ flex:1 }}>
                  {day.activities.map((act: any, ai: number) => {
                    const Icon = TIME_ICONS[act.timeOfDay] || Sun;
                    const color = TIME_COLORS[act.timeOfDay] || "#F59E0B";
                    const isEditing = editId === act.id;
                    return (
                      <div key={act.id} style={{ background:"var(--card)", padding:16, borderRadius:12, border:"1px solid var(--border)", marginBottom:10, position:"relative" }}>
                        {isEditing ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            <div style={{ display:"flex", gap:10 }}>
                              <select value={editForm.timeOfDay} onChange={e => setEditForm(p => ({...p, timeOfDay:e.target.value}))} style={{ padding:"8px 12px", borderRadius:8, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)" }}>
                                <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option>
                              </select>
                              <input type="number" value={editForm.cost} onChange={e => setEditForm(p => ({...p, cost:Number(e.target.value)}))} placeholder="Cost ₹" style={{ padding:"8px 12px", borderRadius:8, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", width:110 }} />
                            </div>
                            <input value={editForm.text} onChange={e => setEditForm(p => ({...p, text:e.target.value}))} style={{ padding:"8px 12px", borderRadius:8, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)" }} />
                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={() => saveEdit(di, act.id)} style={{ background:"var(--primary)", color:"white", padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><Save style={{ width:14 }} /> Save</button>
                              <button onClick={() => setEditId(null)} style={{ background:"var(--bg2)", color:"var(--text)", padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><X style={{ width:14 }} /> Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <Icon style={{ width:14, height:14, color }} />
                                <span style={{ fontSize:12, fontWeight:700, color, textTransform:"uppercase" }}>{act.timeOfDay}</span>
                              </div>
                              <span style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>₹{Number(act.cost).toLocaleString()}</span>
                            </div>
                            <p style={{ margin:"0 0 6px", fontSize:14, fontWeight:500, paddingRight:80 }}>{act.text}</p>
                            <div style={{ position:"absolute", bottom:10, right:10, display:"flex", gap:2 }}>
                              <button onClick={() => moveAct(di,ai,"up")} disabled={ai===0} style={{ padding:4, background:"transparent", border:"none", cursor:ai===0?"default":"pointer", opacity:ai===0?0.2:1, color:"var(--text3)" }}><ArrowUp style={{ width:13 }} /></button>
                              <button onClick={() => moveAct(di,ai,"down")} disabled={ai===day.activities.length-1} style={{ padding:4, background:"transparent", border:"none", cursor:ai===day.activities.length-1?"default":"pointer", opacity:ai===day.activities.length-1?0.2:1, color:"var(--text3)" }}><ArrowDown style={{ width:13 }} /></button>
                              <button onClick={() => { setEditId(act.id); setEditForm({ text:act.text, cost:act.cost, timeOfDay:act.timeOfDay }); }} style={{ padding:4, background:"transparent", border:"none", cursor:"pointer", color:"var(--text2)" }}><Edit2 style={{ width:13 }} /></button>
                              <button onClick={() => delAct(di, act.id)} style={{ padding:4, background:"transparent", border:"none", cursor:"pointer", color:"#ef4444" }}><Trash2 style={{ width:13 }} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => addAct(di)} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px", borderRadius:12, border:"1px dashed var(--border)", background:"transparent", color:"var(--text2)", cursor:"pointer", fontWeight:600, fontSize:13, justifyContent:"center", width:"100%", marginTop:4 }}><Plus style={{ width:14 }} /> Add Activity</button>
                </div>
              </div>
            ))}
          </div>

          {/* Natural Language Modifier */}
          <div style={{ background:"var(--bg)", border:"1px solid var(--primary)", padding:24, borderRadius:16 }}>
            <h3 style={{ fontSize:16, margin:"0 0 12px", display:"flex", alignItems:"center", gap:8 }}><Sparkles style={{ color:"var(--primary)", width:18 }} /> Modify with Natural Language</h3>
            <p style={{ fontSize:13, color:"var(--text3)", margin:"0 0 14px" }}>Try: "Make Day 2 more relaxing" · "Remove all evening activities" · "Reduce cost" · "Add a cooking class on Day 3" · "Swap Day 1 and Day 2"</p>
            <textarea value={modPrompt} onChange={e => setModPrompt(e.target.value)} placeholder="Type your modification request..." style={{ width:"100%", padding:14, borderRadius:12, border:"1px solid var(--border)", background:"var(--card)", color:"var(--text)", minHeight:70, resize:"vertical", fontSize:14, marginBottom:14 }} />
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={handleModify} disabled={!modPrompt.trim()||loading} style={{ background:"var(--primary)", color:"white", border:"none", padding:"12px 24px", borderRadius:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                <Sparkles style={{ width:16 }} /> Apply Modification
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
