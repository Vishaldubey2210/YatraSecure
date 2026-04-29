"use client";

import React, { useState } from "react";
import { 
  Bot, Search, Plane, Hotel, Map, Calendar, 
  ChevronRight, Plus, Sparkles, CheckCircle2 
} from "lucide-react";
import toast from "react-hot-toast";

type Deal = {
  id: string; type: "flight" | "hotel" | "package"; title: string;
  provider: string; price: number; rating: number; desc: string;
};

export default function BookingAgentsPage() {
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [style, setStyle] = useState("Budget");
  
  const [isSearching, setIsSearching] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !dates) {
      toast.error("Please provide destination and dates.");
      return;
    }

    setIsSearching(true);
    setDeals([]);

    setTimeout(() => {
      // Mock deals based on style
      const basePrice = style === "Luxury" ? 25000 : style === "Mid-range" ? 12000 : 4500;
      
      const mockDeals: Deal[] = [
        { id: "1", type: "flight", title: `Roundtrip Flight to ${destination}`, provider: "SkyConnect Airlines", price: Math.floor(basePrice * 0.8), rating: 4.5, desc: "Direct flight with 1 checked bag included." },
        { id: "2", type: "hotel", title: `3 Nights at Central ${destination}`, provider: "StayWell Hotels", price: Math.floor(basePrice * 1.2), rating: 4.8, desc: "Breakfast included. Near main city center." },
        { id: "3", type: "package", title: `${destination} Explorer Package`, provider: "YatraSecure Partners", price: Math.floor(basePrice * 2.5), rating: 4.9, desc: "Includes flights, 3-star hotel, and guided city tour." }
      ];
      
      setDeals(mockDeals);
      setIsSearching(false);
      toast.success("CrewAI found the best deals!", { icon: "🤖" });
    }, 2500);
  };

  const addToTripExpenses = (deal: Deal) => {
    const stored = localStorage.getItem("yatra_trips");
    if (!stored) {
      toast.error("You need to create a trip first!");
      return;
    }
    
    // For mock purposes, just pick the first trip or show a success
    const trips = JSON.parse(stored);
    if (trips.length === 0) {
       toast.error("No trips found. Create one first.");
       return;
    }
    
    const tripId = trips[0].id;
    const expensesRaw = localStorage.getItem(`yatra_trip_expenses_${tripId}`);
    const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];
    
    const newExp = {
      id: Date.now().toString(), desc: `Booking: ${deal.title}`, amount: deal.price,
      category: deal.type === "hotel" ? "Accommodation" : deal.type === "flight" ? "Transport" : "Other",
      paidBy: "TestTest", date: new Date().toISOString()
    };
    
    localStorage.setItem(`yatra_trip_expenses_${tripId}`, JSON.stringify([newExp, ...expenses]));
    toast.success(`${deal.title} added to ${trips[0].title} expenses!`);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Bot style={{ width: 40, height: 40, color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 12px" }}>CrewAI Booking Agents</h1>
        <p style={{ color: "var(--text2)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Let our intelligent agents scour the web to find the best flights, hotels, and packages tailored to your specific travel style and budget.
        </p>
      </div>

      <div style={{ background: "var(--card)", padding: 32, borderRadius: 24, border: "1px solid var(--border)", marginBottom: 40 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
            Destination
            <div style={{ position: "relative" }}>
              <Map style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "var(--text3)" }} />
              <input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Bali" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            </div>
          </label>

          <label style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
            Dates
            <div style={{ position: "relative" }}>
              <Calendar style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "var(--text3)" }} />
              <input required value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. 10 Oct - 15 Oct" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            </div>
          </label>

          <label style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
            Travel Style
            <select value={style} onChange={e => setStyle(e.target.value)} style={{ padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }}>
              <option>Budget</option><option>Mid-range</option><option>Luxury</option>
            </select>
          </label>

          <button type="submit" disabled={isSearching} style={{ background: "var(--primary)", color: "white", border: "none", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {isSearching ? <Sparkles style={{ width: 18, height: 18, animation: "pulse 1s infinite" }} /> : <Search style={{ width: 18, height: 18 }} />}
            {isSearching ? "Agents Searching..." : "Find Deals"}
          </button>
        </form>
      </div>

      {isSearching && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 60, height: 60, border: "4px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
          <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>Scanning 100+ providers...</h2>
          <p style={{ color: "var(--text3)" }}>Our AI agents are negotiating the best rates for your {style} trip.</p>
        </div>
      )}

      {!isSearching && deals.length > 0 && (
        <div className="anim-in">
          <h2 style={{ fontSize: 24, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 style={{ color: "var(--success)" }} /> Found 3 Optimal Deals
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {deals.map(deal => (
              <div key={deal.id} style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }} className="hover:shadow-lg hover:-translate-y-1 transition-all">
                <div style={{ height: 120, background: deal.type === "flight" ? "rgba(37, 99, 235, 0.1)" : deal.type === "hotel" ? "rgba(239, 159, 39, 0.1)" : "rgba(147, 51, 234, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: deal.type === "flight" ? "#2563EB" : deal.type === "hotel" ? "#D97706" : "#9333EA" }}>
                  {deal.type === "flight" ? <Plane style={{ width: 48, height: 48 }} /> : deal.type === "hotel" ? <Hotel style={{ width: 48, height: 48 }} /> : <Map style={{ width: 48, height: 48 }} />}
                </div>
                
                <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.4 }}>{deal.title}</h3>
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text2)" }}>by {deal.provider} • ⭐ {deal.rating}</p>
                  <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text)" }}>{deal.desc}</p>
                  
                  <div style={{ marginTop: "auto" }}>
                    <p style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 900, color: "var(--success)" }}>₹{deal.price.toLocaleString()}</p>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => toast.success(`Redirecting to book with ${deal.provider}`)} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Book Now</button>
                      <button onClick={() => addToTripExpenses(deal)} style={{ flex: 1, background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} title="Add to Expenses">
                        <Plus style={{ width: 16, height: 16 }} /> Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
