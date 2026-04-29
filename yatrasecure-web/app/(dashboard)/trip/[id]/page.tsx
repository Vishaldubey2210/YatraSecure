"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Calendar, Wallet, Users, MessageSquare, Briefcase, 
  Bot, Image as ImageIcon, Sparkles, Plus, Trash2, Send, 
  CheckCircle2, Camera, Map, Edit3, Heart, Download, Share2
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ItineraryTab from "./ItineraryTab";
import BookingTab from "./BookingTab";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false, loading: () => <div style={{ height: 300, background: "var(--bg2)", borderRadius: 16 }} /> });

// --- TABS ---
const TABS = [
  { id: 'overview', label: 'Overview', icon: MapPin },
  { id: 'itinerary', label: 'AI Itinerary', icon: Sparkles },
  { id: 'booking', label: 'Booking', icon: Briefcase },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'chat', label: 'Group Chat', icon: MessageSquare },
  { id: 'packing', label: 'Packing', icon: CheckCircle2 },
  { id: 'album', label: 'Trip Album', icon: ImageIcon },
  { id: 'memory', label: 'Memory Lane', icon: Heart },
];

const COLORS = ['#0F7B3A', '#D97706', '#2563EB', '#9333EA', '#E11D48'];

export default function TripDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [trip, setTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);
  const [showAiHelp, setShowAiHelp] = useState(false);

  // Load Trip
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("yatra_trips");
    if (stored) {
      const trips = JSON.parse(stored);
      const found = trips.find((t: any) => t.id === id);
      if (found) {
        // Ensure members array exists
        if (!found.members) found.members = ["TestTest"];
        setTrip(found);
      } else {
        toast.error("Trip not found");
        router.push("/dashboard");
      }
    }
  }, [id, router]);

  // AI Assistant pop-up every 5 seconds
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setShowAiHelp(true);
      setTimeout(() => setShowAiHelp(false), 3000);
    }, 5000);
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient || !trip) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      {/* ── Header ── */}
      <div style={{ position: "relative", height: 280, borderRadius: 32, overflow: "hidden", marginBottom: 32, border: "1px solid var(--border)" }}>
        <img src={trip.imageBase64 || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"} alt={trip.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
        
        {/* Floating Action Buttons */}
        <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 8 }}>
           <button onClick={() => toast.success("Trip link copied to clipboard!")} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} className="hover:bg-white/20 transition-all">
              <Share2 style={{ width: 18, height: 18 }} />
           </button>
           <button onClick={() => router.push(`/trips/${trip.id}/edit`)} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} className="hover:bg-white/20 transition-all">
              <Edit3 style={{ width: 18, height: 18 }} />
           </button>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: 32, right: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={{ background: "var(--primary)", color: "white", padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 800, marginBottom: 12, display: "inline-block" }}>
              {trip.tripType}
            </span>
            <h1 style={{ fontSize: 40, margin: "0 0 8px", color: "white", fontWeight: 900, lineHeight: 1.1 }}>{trip.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin style={{ width: 16, height: 16 }} /> {trip.destination}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar style={{ width: 16, height: 16 }} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, marginBottom: 32, borderBottom: "1px solid var(--border)" }} className="hide-scrollbar">
        {TABS.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ 
              whiteSpace: "nowrap", padding: "12px 20px", borderRadius: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, transition: "all 0.2s",
              background: activeTab === tab.id ? "var(--primary)" : "transparent",
              color: activeTab === tab.id ? "white" : "var(--text2)"
            }}
          >
            <tab.icon style={{ width: 18, height: 18 }} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ background: "var(--card)", borderRadius: 24, padding: 32, border: "1px solid var(--border)", minHeight: 500 }}>
        {activeTab === 'overview' && <OverviewTab trip={trip} />}
        {activeTab === 'itinerary' && <ItineraryTab trip={trip} />}
        {activeTab === 'booking' && <BookingTab trip={trip} />}
        {activeTab === 'chat' && <ChatTab tripId={trip.id} />}
        {activeTab === 'wallet' && <WalletTab trip={trip} />}
        {activeTab === 'packing' && <PackingTab tripId={trip.id} destination={trip.destination} />}
        {activeTab === 'album' && <AlbumTab tripId={trip.id} />}
        {activeTab === 'memory' && <MemoryLaneTab tripId={trip.id} trip={trip} />}
      </div>
      
      {/* ── Floating AI Assistant ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        {showAiHelp && (
          <div style={{ background: "var(--card)", color: "var(--text)", padding: "12px 20px", borderRadius: "20px 20px 4px 20px", border: "1px solid var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontSize: 14, fontWeight: 600, animation: "fadeIn 0.3s ease-out" }}>
            May I help you? ✨
          </div>
        )}
        <button 
          onClick={() => toast("AI Assistant chat coming soon!", { icon: "🤖" })}
          style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 24px rgba(29, 158, 117, 0.4)" }} 
          className="hover:scale-110 transition-transform"
        >
          <Bot style={{ width: 32, height: 32 }} />
        </button>
      </div>
      
    </div>
  );
}



// ─────────────────────────────────────────────────────────
// TAB: OVERVIEW
// ─────────────────────────────────────────────────────────
function OverviewTab({ trip }: { trip: any }) {
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`yatra_trip_itinerary_${trip.id}`);
    if (saved) setItinerary(JSON.parse(saved));
  }, [trip.id]);

  const generateItinerary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockItinerary = [
        { day: 1, morning: `Arrive in ${trip.destination}, Check-in and relax`, afternoon: "Explore local markets", evening: "Welcome dinner with the group" },
        { day: 2, morning: "Guided city tour", afternoon: "Visit main historical sites", evening: "Sunset viewing at popular spot" },
        { day: 3, morning: "Adventure activity / Nature walk", afternoon: "Free time for shopping", evening: "Farewell party and departure" }
      ];
      setItinerary(mockItinerary);
      localStorage.setItem(`yatra_trip_itinerary_${trip.id}`, JSON.stringify(mockItinerary));
      setIsGenerating(false);
      toast.success("AI Itinerary Generated!");
    }, 1500);
  };

  return (
    <div className="anim-in">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        
        {/* Left Col */}
        <div>
          <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>About this Trip</h2>
          <p style={{ color: "var(--text)", lineHeight: 1.6, marginBottom: 32 }}>{trip.description}</p>
          
          <h3 style={{ fontSize: 20, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><Map style={{ color: "var(--primary)" }} /> Smart Route Map</h3>
          <div style={{ height: 350, background: "var(--bg2)", borderRadius: 16, marginBottom: 32, overflow: "hidden", border: "1px solid var(--border)" }}>
            <MapComponent destination={trip.destination} route={trip.route} />
          </div>
        </div>

        {/* Right Col */}
        <div>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, margin: "0 0 16px", textTransform: "uppercase", color: "var(--text3)" }}>Trip Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text2)" }}>Route</p><p style={{ margin: 0, fontWeight: 700 }}>{trip.route}</p></div>
              <div><p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text2)" }}>Budget (per person)</p><p style={{ margin: 0, fontWeight: 700, color: "var(--success)" }}>₹{trip.budget.toLocaleString()}</p></div>
              <div><p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text2)" }}>Privacy</p><p style={{ margin: 0, fontWeight: 700 }}>{trip.privacy === 'public' ? 'Public Trip' : 'Private (Invite Only)'}</p></div>
            </div>
          </div>

          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 24, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 16, margin: "0 0 16px", textTransform: "uppercase", color: "var(--text3)" }}>Members ({trip.members?.length || 1}/{trip.maxMembers || 8})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {trip.members?.map((m: string, i: number) => {
                const isMe = m === "TestTest";
                // Simulate online status for demo: "TestTest" is online, others are offline
                const isOnline = isMe || i % 3 === 0;
                const lastSeen = isOnline ? "Online" : `Last seen ${Math.floor(Math.random() * 15) + 1}m ago`;
                
                return (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
                        {m.charAt(0).toUpperCase()}
                      </div>
                      {/* Online/Offline Status Dot */}
                      <div style={{ 
                        position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", 
                        background: isOnline ? "#10B981" : "#94A3B8", border: "2px solid var(--bg)" 
                      }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                        {m} 
                        {m === (trip.createdBy || "TestTest") && <span style={{ fontSize: 10, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 6px", borderRadius: 8, fontWeight: 800, textTransform: "uppercase" }}>Admin</span>}
                      </span>
                      <span style={{ fontSize: 12, color: isOnline ? "#10B981" : "var(--text3)", fontWeight: 500 }}>
                        {lastSeen}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAB 2: GROUP CHAT
// ─────────────────────────────────────────────────────────
function ChatTab({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`yatra_trip_messages_${tripId}`);
    if (saved) setMessages(JSON.parse(saved));
    else {
      // Add initial welcome message
      const initial = [{ id: '1', text: "Welcome to the group chat! Say hi to everyone.", sender: "System", time: new Date().toISOString() }];
      setMessages(initial);
      localStorage.setItem(`yatra_trip_messages_${tripId}`, JSON.stringify(initial));
    }
  }, [tripId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), text: input, sender: "TestTest", time: new Date().toISOString() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`yatra_trip_messages_${tripId}`, JSON.stringify(updated));
    setInput("");
  };

  return (
    <div className="anim-in" style={{ display: "flex", flexDirection: "column", height: 600 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
        {messages.map((m, i) => {
          const isMe = m.sender === "TestTest";
          const isSystem = m.sender === "System";
          if (isSystem) return <div key={m.id} style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", margin: "16px 0", fontWeight: 600 }}>{m.text}</div>;
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 16 }}>
              {!isMe && <span style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4, marginLeft: 4 }}>{m.sender}</span>}
              <div style={{ background: isMe ? "var(--primary)" : "var(--card)", color: isMe ? "white" : "var(--text)", padding: "12px 16px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", border: isMe ? "none" : "1px solid var(--border)", maxWidth: "70%" }}>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{m.text}</p>
              </div>
              <span style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>{new Date(m.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: "16px 20px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 15, outline: "none" }} />
        <button type="submit" style={{ background: "var(--primary)", color: "white", border: "none", width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send style={{ width: 20, height: 20 }} /></button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAB 3: WALLET & EXPENSES
// ─────────────────────────────────────────────────────────
function WalletTab({ trip }: { trip: any }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  useEffect(() => {
    const saved = localStorage.getItem(`yatra_trip_expenses_${trip.id}`);
    if (saved) setExpenses(JSON.parse(saved));
  }, [trip.id]);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const newExp = { id: Date.now().toString(), desc, amount: parseInt(amount), category, paidBy: "TestTest", date: new Date().toISOString() };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    localStorage.setItem(`yatra_trip_expenses_${trip.id}`, JSON.stringify(updated));
    setDesc(""); setAmount("");
    toast.success("Expense added");
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem(`yatra_trip_expenses_${trip.id}`, JSON.stringify(updated));
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = trip.budget * (trip.members?.length || 1) - totalSpent;

  // Chart Data
  const chartData = useMemo(() => {
    const categories = ["Food", "Transport", "Accommodation", "Activities", "Other"];
    return categories.map(c => ({
      name: c,
      value: expenses.filter(e => e.category === c).reduce((sum, e) => sum + e.amount, 0)
    })).filter(d => d.value > 0);
  }, [expenses]);

  return (
    <div className="anim-in">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--bg)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>Total Budget</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>₹{(trip.budget * (trip.members?.length || 1)).toLocaleString()}</p>
          </div>
          <div style={{ background: "var(--bg)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>Total Spent</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "var(--danger)" }}>₹{totalSpent.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Chart */}
        <div style={{ background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "var(--text3)" }}>Add expenses to see breakdown</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
        {/* Add Form */}
        <form onSubmit={addExpense} style={{ background: "var(--bg)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", alignSelf: "start" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Add Expense</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (e.g. Dinner)" style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", outline: "none" }} />
            <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", outline: "none" }} />
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", outline: "none" }}>
              <option>Food</option><option>Transport</option><option>Accommodation</option><option>Activities</option><option>Other</option>
            </select>
            <button type="submit" style={{ background: "var(--primary)", color: "white", border: "none", padding: 14, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Save Expense</button>
          </div>
        </form>

        {/* List */}
        <div>
          <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Recent Expenses</h3>
          {expenses.length === 0 ? <p style={{ color: "var(--text3)" }}>No expenses recorded yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {expenses.map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{e.desc} <span style={{ fontSize: 11, fontWeight: 600, background: "var(--card)", padding: "2px 6px", borderRadius: 6, marginLeft: 6 }}>{e.category}</span></p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text2)" }}>Paid by {e.paidBy} on {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontWeight: 800, color: "var(--danger)" }}>-₹{e.amount}</span>
                    <button onClick={() => deleteExpense(e.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer" }}><Trash2 style={{ width: 16, height: 16 }} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAB 4: PACKING LIST
// ─────────────────────────────────────────────────────────
function PackingTab({ tripId, destination }: { tripId: string, destination: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`yatra_trip_packing_${tripId}`);
    if (saved) setItems(JSON.parse(saved));
    else setItems([{ id: '1', name: 'Passport/ID', checked: false }, { id: '2', name: 'Phone Charger', checked: false }]);
  }, [tripId]);

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem(`yatra_trip_packing_${tripId}`, JSON.stringify(newItems));
  };

  const toggleItem = (id: string) => {
    saveItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    saveItems([{ id: Date.now().toString(), name: newItem, checked: false }, ...items]);
    setNewItem("");
  };

  const suggestAI = () => {
    const p = toast.loading("AI analyzing destination...");
    setTimeout(() => {
      const suggestions = [{ id: 's1', name: 'Sunscreen SPF 50', checked: false }, { id: 's2', name: 'Comfortable Walking Shoes', checked: false }, { id: 's3', name: 'Power Bank', checked: false }];
      saveItems([...suggestions, ...items]);
      toast.success("AI added 3 suggested items!", { id: p });
    }, 1000);
  };

  const checkedCount = items.filter(i => i.checked).length;
  const progress = items.length === 0 ? 0 : Math.round((checkedCount / items.length) * 100);

  return (
    <div className="anim-in" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>Packing List</h2>
        <button onClick={suggestAI} style={{ background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles style={{ width: 16, height: 16 }} /> Suggest with AI
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
          <span>Packing Progress</span>
          <span style={{ color: "var(--primary)" }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: "var(--bg2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s" }} />
        </div>
      </div>

      <form onSubmit={addItem} style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add new item..." style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
        <button type="submit" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", padding: "0 24px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Add</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", opacity: item.checked ? 0.6 : 1 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flex: 1 }}>
              <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
              <span style={{ fontSize: 16, textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "var(--text3)" : "var(--text)", fontWeight: 500 }}>{item.name}</span>
            </label>
            <button onClick={() => saveItems(items.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer" }}><Trash2 style={{ width: 16, height: 16 }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: TRIP ALBUM
// ─────────────────────────────────────────────────────────
function AlbumTab({ tripId }: { tripId: string }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`yatra_trip_album_${tripId}`);
    if (saved) setPhotos(JSON.parse(saved));
  }, [tripId]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [reader.result as string, ...photos];
      setPhotos(newPhotos);
      localStorage.setItem(`yatra_trip_album_${tripId}`, JSON.stringify(newPhotos));
      toast.success("Photo added to album");
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    localStorage.setItem(`yatra_trip_album_${tripId}`, JSON.stringify(newPhotos));
  };

  return (
    <div className="anim-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>Trip Album</h2>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 14 }}>{photos.length} photos shared</p>
        </div>
        <button onClick={() => fileRef.current?.click()} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Camera style={{ width: 18, height: 18 }} /> Upload Photo
        </button>
        <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} style={{ display: "none" }} />
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, border: "2px dashed var(--border)", borderRadius: 16, background: "var(--bg)" }}>
          <ImageIcon style={{ width: 48, height: 48, color: "var(--text3)", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text2)", margin: 0, fontSize: 16 }}>No photos yet. Be the first to add a memory!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative", height: 200, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }} className="group">
              <img src={p} alt={`Trip photo ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => deletePhoto(i)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", border: "none", padding: 6, borderRadius: 8, cursor: "pointer", backdropFilter: "blur(4px)" }} className="hover:bg-danger">
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAB 7: MEMORY LANE
// ─────────────────────────────────────────────────────────
function MemoryLaneTab({ tripId, trip }: { tripId: string, trip: any }) {
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStory = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setStory(`What an incredible journey to ${trip.destination}! Starting from ${trip.route.split('→')[0].trim()}, the group bonded instantly. Over the course of the trip, we explored amazing sites, laughed over delicious local meals, and captured beautiful moments. A truly unforgettable ${trip.tripType} adventure with amazing people.`);
      setIsGenerating(false);
      toast.success("Trip Story Generated!", { icon: "📖" });
    }, 2000);
  };

  return (
    <div className="anim-in" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <Sparkles style={{ width: 48, height: 48, color: "var(--primary)", margin: "0 auto 24px" }} />
      <h2 style={{ fontSize: 32, margin: "0 0 16px" }}>Memory Lane</h2>
      <p style={{ color: "var(--text2)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
        Relive the magic of your {trip.destination} trip. Generate a beautiful narrative combining your photos, places visited, and expenses.
      </p>

      {!story ? (
        <button onClick={generateStory} disabled={isGenerating} style={{ background: "var(--primary)", color: "white", border: "none", padding: "16px 32px", borderRadius: 16, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(29, 158, 117, 0.3)" }} className="hover:scale-105 transition-transform">
          {isGenerating ? "AI is writing your story..." : "Write Our Trip Story"}
        </button>
      ) : (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 24, padding: 40, textAlign: "left", position: "relative" }}>
          <div style={{ position: "absolute", top: -20, left: 40, background: "var(--card)", padding: "8px 16px", borderRadius: 16, border: "1px solid var(--border)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8, color: "var(--primary)" }}>
            <Heart style={{ width: 16, height: 16 }} /> Our Story
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--text)", margin: "20px 0 32px", fontStyle: "italic" }}>
            "{story}"
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <button style={{ background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
               <Download style={{ width: 18, height: 18 }} /> Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
