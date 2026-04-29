"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plane, Building, Compass, Handshake, Sparkles, Loader2, CheckCircle2, Clock, Wallet, Check, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Star, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import { generateDeals, buildBundles } from "./bookingData";

const AGENT_LOGS: Record<string, string[]> = {
  flight: ["Scanning MakeMyTrip, Cleartrip, Yatra for flights...", "Checking 8+ airlines for best prices...", "Applying seasonal pricing & availability..."],
  hotel:  ["Searching Booking.com, Agoda for accommodations...", "Filtering by location & amenities...", "Found properties matching your dates..."],
  activity: ["Browsing Thrillophilia, Klook for activities...", "Checking availability & reviews...", "Curated top-rated local experiences..."],
  negotiator: ["Analyzing best combinations...", "Calculating group discounts...", "Built 3 optimized bundles for you!"],
};

const AIRLINES = ["IndiGo", "SpiceJet", "Vistara", "Akasa Air", "Air India"];

function Stars({ n }: { n: number }) {
  return <span style={{ color: "#F59E0B", fontSize: 12 }}>{"★".repeat(Math.round(n))}{"☆".repeat(5 - Math.round(n))} {n.toFixed(1)}</span>;
}

function SourceBtn({ source, url }: { source: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--primary)", background: "var(--primary-light)", padding: "4px 10px", borderRadius: 20, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(29,158,117,0.2)" }}>
      <ExternalLink style={{ width: 10 }} /> {source}
    </a>
  );
}

function DealCard({ item, isAdded, onAdd }: { item: any; isAdded: boolean; onAdd: () => void }) {
  const isF = item.type === "flight", isH = item.type === "hotel";
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800 }}>{item.title}</h4>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>
            {isF && <span>{item.departure} → {item.arrival} · {item.duration} · {item.stops === 0 ? "Non-stop" : `${item.stops} stop`}</span>}
            {isH && <span>⭐{item.stars} · {item.location}</span>}
            {!isF && !isH && <span>{item.actType} · {item.duration} · {item.reviews} reviews</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Stars n={item.rating} />
            <SourceBtn source={item.source} url={item.sourceUrl} />
          </div>
          {item.features && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {item.features.slice(0, 2).map((f: string) => <span key={f} style={{ fontSize: 10, background: "var(--card)", color: "var(--text3)", padding: "2px 8px", borderRadius: 10, border: "1px solid var(--border)" }}>{f}</span>)}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", marginBottom: 4 }}>₹{item.price.toLocaleString()}{isH ? "/night" : ""}</div>
          <button disabled={isAdded} onClick={onAdd} style={{ background: isAdded ? "var(--bg2)" : "var(--primary)", color: isAdded ? "var(--text3)" : "white", border: "none", padding: "7px 14px", borderRadius: 8, fontWeight: 700, cursor: isAdded ? "default" : "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
            {isAdded ? <><Check style={{ width: 12 }} /> Added</> : <><Wallet style={{ width: 12 }} /> + Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingTab({ trip }: { trip: any }) {
  const BK = `yatra_trip_bookings_${trip.id}`;
  const WK = `yatra_wallet_${trip.id}`;

  const [agents, setAgents] = useState({ flight: "idle", hotel: "idle", activity: "idle", negotiator: "idle" });
  const [logs, setLogs] = useState<{ time: string; agent: string; msg: string }[]>([]);
  const [raw, setRaw] = useState<{ flights: any[]; hotels: any[]; activities: any[] }>({ flights: [], hotels: [], activities: [] });
  const [bundles, setBundles] = useState<any[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [open, setOpen] = useState({ bundles: true, flights: false, hotels: false, activities: false });
  const [filters, setFilters] = useState({ maxPrice: 30000, airlines: [] as string[], stops: [] as number[], starRating: 0, actType: "" });
  const [sort, setSort] = useState("price_asc");
  const logsEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = localStorage.getItem(BK);
    if (s) setAdded(JSON.parse(s));
    // Do NOT auto-run — wait for user to click Search
  }, []);

  useEffect(() => { logsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const addLog = (agent: string, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(p => [...p, { time, agent, msg }]);
  };

  const runScraping = async () => {
    if (!trip.destination) { toast.error("Set a trip destination first!"); return; }
    setLogs([]); setRaw({ flights: [], hotels: [], activities: [] }); setBundles([]);
    setAgents({ flight: "idle", hotel: "idle", activity: "idle", negotiator: "idle" });
    addLog("System", `Starting CrewAI agents for ${trip.destination}...`);
    for (const [key, msgs] of Object.entries(AGENT_LOGS)) {
      setAgents(p => ({ ...p, [key]: "searching" }));
      for (const msg of msgs) { addLog(key === "flight" ? "Flight Scout" : key === "hotel" ? "Hotel Hunter" : key === "activity" ? "Experience Curator" : "Package Negotiator", msg); await new Promise(r => setTimeout(r, 700)); }
      setAgents(p => ({ ...p, [key]: "done" }));
      if (key !== "negotiator") {
        const deals = generateDeals(trip.destination, trip.startDate, trip.budget);
        setRaw(deals);
        if (key === "activity") {
          const b = buildBundles(deals.flights, deals.hotels, deals.activities);
          setBundles(b);
        }
      }
    }
    toast.success("AI Agents found the best deals!");
  };

  const addToTrip = (item: any) => {
    if (added.includes(item.id)) return;
    const newAdded = [...added, item.id];
    setAdded(newAdded);
    localStorage.setItem(BK, JSON.stringify(newAdded));
    const storedW = localStorage.getItem(WK);
    let exp = storedW ? JSON.parse(storedW) : [];
    exp.push({ id: Date.now().toString(), description: item.title, amount: item.price || item.finalPrice, paidBy: "TestTest", splitType: "equal", date: new Date().toISOString() });
    localStorage.setItem(WK, JSON.stringify(exp));
    toast.success(`"${item.title}" added to trip wallet!`);
  };

  const applySort = (arr: any[]) => {
    if (sort === "price_asc") return [...arr].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return [...arr].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...arr].sort((a, b) => b.rating - a.rating);
    return arr;
  };

  const filtered = {
    flights: applySort(raw.flights.filter(f => f.price <= filters.maxPrice && (filters.airlines.length === 0 || filters.airlines.includes(f.airline)) && (filters.stops.length === 0 || filters.stops.includes(f.stops)))),
    hotels: applySort(raw.hotels.filter(h => h.price <= filters.maxPrice && (filters.starRating === 0 || h.stars >= filters.starRating))),
    activities: applySort(raw.activities.filter(a => a.price <= filters.maxPrice && (!filters.actType || a.actType === filters.actType))),
  };

  const AgentCard = ({ agentKey, name, icon: Icon, color }: any) => {
    const s = (agents as any)[agentKey];
    return (
      <div style={{ flex: 1, minWidth: 140, background: "var(--bg)", border: `1px solid ${s === "searching" ? color : "var(--border)"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: s === "searching" ? `0 0 12px ${color}30` : "none", opacity: s === "idle" ? 0.5 : 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: s === "done" ? "var(--primary)" : s === "searching" ? color : "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", color: s === "idle" ? "var(--text3)" : "white", transition: "all 0.3s" }}>
          {s === "searching" ? <Loader2 style={{ width: 18, animation: "spin 1s linear infinite" }} /> : s === "done" ? <CheckCircle2 style={{ width: 18 }} /> : <Icon style={{ width: 18 }} />}
        </div>
        <div><p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{name}</p><p style={{ margin: 0, fontSize: 10, color: s === "searching" ? color : "var(--text3)", fontWeight: 800, textTransform: "uppercase" }}>{s}</p></div>
      </div>
    );
  };

  const Accordion = ({ k, label, count, color, children }: any) => (
    <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
      <button onClick={() => setOpen(p => ({ ...p, [k]: !(p as any)[k] }))} style={{ width: "100%", background: "var(--bg)", border: "none", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ fontWeight: 800, color, display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>{label} <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>({count})</span></span>
        {(open as any)[k] ? <ChevronUp style={{ color: "var(--text3)" }} /> : <ChevronDown style={{ color: "var(--text3)" }} />}
      </button>
      {(open as any)[k] && <div style={{ padding: 20 }}>{children}</div>}
    </div>
  );

  if (!trip.destination) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <Compass style={{ width: 48, color: "var(--text3)", margin: "0 auto 16px", display: "block" }} />
      <h3>No destination set</h3>
      <p style={{ color: "var(--text2)" }}>Please set a trip destination before searching for deals.</p>
    </div>
  );

  return (
    <div className="anim-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: "0 0 6px" }}><Sparkles style={{ color: "var(--primary)", display: "inline", verticalAlign: "middle" }} /> CrewAI Booking</h2>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 13 }}>Multi-agent deal hunting for {trip.destination}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowFilters(p => !p)} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13 }}><Filter style={{ width: 14 }} /> Filters</button>
          <button onClick={runScraping} style={{ background: "var(--primary)", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}><RefreshCw style={{ width: 14 }} /> Search Again</button>
        </div>
      </div>

      {/* Agents */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <AgentCard agentKey="flight" name="Flight Scout" icon={Plane} color="#3B82F6" />
        <AgentCard agentKey="hotel" name="Hotel Hunter" icon={Building} color="#F59E0B" />
        <AgentCard agentKey="activity" name="Exp. Curator" icon={Compass} color="#10B981" />
        <AgentCard agentKey="negotiator" name="Negotiator" icon={Handshake} color="#8B5CF6" />
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Main Content */}
        <div style={{ flex: 2 }}>
          {/* Sort */}
          {raw.flights.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>Sort by:</span>
              {[["price_asc", "Price ↑"], ["price_desc", "Price ↓"], ["rating", "Rating"]].map(([v, l]) => (
                <button key={v} onClick={() => setSort(v)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)", background: sort === v ? "var(--primary)" : "var(--card)", color: sort === v ? "white" : "var(--text2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{l}</button>
              ))}
            </div>
          )}

          {/* Empty state — no deals yet */}
          {raw.flights.length === 0 && agents.flight === "idle" && (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg)", borderRadius: 20, border: "2px dashed var(--border)" }}>
              <Sparkles style={{ width: 52, height: 52, color: "var(--primary)", margin: "0 auto 16px", display: "block", opacity: 0.6 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: 20, color: "var(--text)" }}>Ready to find your best deals?</h3>
              <p style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 24px" }}>
                Our 4 AI agents will scan MakeMyTrip, Booking.com, Thrillophilia & more to find the best flights, hotels and activities for <strong>{trip.destination}</strong>.
              </p>
              <button onClick={runScraping} style={{ background: "var(--primary)", color: "white", border: "none", padding: "14px 32px", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 15, display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(29,158,117,0.3)" }}>
                <Sparkles style={{ width: 20 }} /> Dispatch AI Agents
              </button>
            </div>
          )}

          {/* Bundles */}
          {bundles.length > 0 && (
            <Accordion k="bundles" label="🤝 AI Recommended Bundles" count={bundles.length} color="#8B5CF6">
              {bundles.map(b => (
                <div key={b.id} style={{ background: "var(--bg)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px" }}>{b.icon} {b.label}</h4>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text2)" }}>✈ {b.f?.airline} · 🏨 {b.h?.title?.split(" ").slice(0, 2).join(" ")} · 🎯 {b.a?.title?.substring(0, 30)}...</p>
                      <span style={{ fontSize: 12, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>You save ₹{b.savedAmount?.toLocaleString()} ({b.discount}% OFF)</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ textDecoration: "line-through", color: "var(--text3)", fontSize: 13 }}>₹{b.originalPrice?.toLocaleString()}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)", lineHeight: 1.2 }}>₹{b.finalPrice?.toLocaleString()}</div>
                      <button disabled={added.includes(b.id)} onClick={() => { addToTrip({ ...b, id: b.id, title: `${b.label} Bundle`, price: b.finalPrice }); [b.f, b.h, b.a].forEach(item => { if (item && !added.includes(item.id)) { const newA = [...added, item.id]; setAdded(newA); localStorage.setItem(BK, JSON.stringify(newA)); } }); }} style={{ marginTop: 8, background: added.includes(b.id) ? "var(--bg2)" : "#8B5CF6", color: added.includes(b.id) ? "var(--text3)" : "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                        {added.includes(b.id) ? "✓ Booked" : "Book Bundle"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Accordion>
          )}

          {/* Flights */}
          {filtered.flights.length > 0 && (
            <Accordion k="flights" label="✈️ Flights" count={filtered.flights.length} color="#3B82F6">
              {filtered.flights.map(f => <DealCard key={f.id} item={f} isAdded={added.includes(f.id)} onAdd={() => addToTrip(f)} />)}
            </Accordion>
          )}

          {/* Hotels */}
          {filtered.hotels.length > 0 && (
            <Accordion k="hotels" label="🏨 Hotels" count={filtered.hotels.length} color="#F59E0B">
              {filtered.hotels.map(h => <DealCard key={h.id} item={h} isAdded={added.includes(h.id)} onAdd={() => addToTrip(h)} />)}
            </Accordion>
          )}

          {/* Activities */}
          {filtered.activities.length > 0 && (
            <Accordion k="activities" label="🎯 Activities" count={filtered.activities.length} color="#10B981">
              {filtered.activities.map(a => <DealCard key={a.id} item={a} isAdded={added.includes(a.id)} onAdd={() => addToTrip(a)} />)}
            </Accordion>
          )}

          {raw.flights.length > 0 && filtered.flights.length === 0 && filtered.hotels.length === 0 && filtered.activities.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", border: "2px dashed var(--border)", borderRadius: 16 }}>
              <X style={{ width: 40, color: "var(--text3)", margin: "0 auto 12px", display: "block" }} />
              <p style={{ color: "var(--text2)" }}>No deals match current filters. Adjust filters or click Search Again.</p>
            </div>
          )}
        </div>

        {/* Right: Filters + Log */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 16 }}>
          {/* Filters Panel */}
          {showFilters && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Filters</h3>
                <button onClick={() => setFilters({ maxPrice: 30000, airlines: [], stops: [], starRating: 0, actType: "" })} style={{ fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Reset All</button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>Max Price: ₹{filters.maxPrice.toLocaleString()}</label>
                <input type="range" min={2000} max={30000} step={1000} value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: Number(e.target.value) }))} style={{ width: "100%", accentColor: "var(--primary)" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>Airlines</label>
                {AIRLINES.map(a => (
                  <label key={a} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" checked={filters.airlines.includes(a)} onChange={e => setFilters(p => ({ ...p, airlines: e.target.checked ? [...p.airlines, a] : p.airlines.filter(x => x !== a) }))} /> {a}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>Stops</label>
                {[{ label: "Non-stop", val: 0 }, { label: "1 Stop", val: 1 }].map(s => (
                  <label key={s.val} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" checked={filters.stops.includes(s.val)} onChange={e => setFilters(p => ({ ...p, stops: e.target.checked ? [...p.stops, s.val] : p.stops.filter(x => x !== s.val) }))} /> {s.label}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>Min Hotel Stars</label>
                {[3, 4, 5].map(n => (
                  <label key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="radio" name="stars" checked={filters.starRating === n} onChange={() => setFilters(p => ({ ...p, starRating: n }))} /> {"★".repeat(n)} {n}+
                  </label>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>Activity Type</label>
                {["Adventure", "Cultural", "Relaxation", "Food"].map(t => (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="radio" name="actType" checked={filters.actType === t} onChange={() => setFilters(p => ({ ...p, actType: t }))} /> {t}
                  </label>
                ))}
                <button onClick={() => setFilters(p => ({ ...p, actType: "", starRating: 0 }))} style={{ fontSize: 11, color: "var(--text3)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Clear selection</button>
              </div>
            </div>
          )}

          {/* Agent Log */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <button onClick={() => setShowLog(p => !p)} style={{ width: "100%", background: "var(--bg)", border: "none", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}><Clock style={{ width: 13 }} /> Live Agent Log</span>
              {showLog ? <ChevronUp style={{ width: 14, color: "var(--text3)" }} /> : <ChevronDown style={{ width: 14, color: "var(--text3)" }} />}
            </button>
            {showLog && (
              <div style={{ maxHeight: 320, overflowY: "auto", padding: 16 }} className="hide-scrollbar">
                {logs.length === 0 ? <p style={{ color: "var(--text3)", fontSize: 12, textAlign: "center" }}>Awaiting agents...</p> : logs.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12, animation: "fadeIn 0.3s" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", marginTop: 5, flexShrink: 0 }} />
                    <div><span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700 }}>{l.time} </span><span style={{ fontSize: 10, fontWeight: 800, color: "var(--text)" }}>{l.agent}</span><p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text2)", lineHeight: 1.4 }}>{l.msg}</p></div>
                  </div>
                ))}
                <div ref={logsEnd} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
