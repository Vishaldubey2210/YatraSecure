"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert, Bot, Activity, CheckCircle, Search, Compass,
  Wallet, UserPlus, FileCheck, Info, ChevronRight, Share2, LocateFixed, Bell, MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({ username: "Traveler" });
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  
  // Quick Safety Settings
  const [safetyPrefs, setSafetyPrefs] = useState({
    womenOnly: false,
    autoShareLocation: true,
    sosShortcut: true
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    const tripsStored = localStorage.getItem("yatra_trips");
    if (tripsStored) {
      const parsed = JSON.parse(tripsStored);
      const userTrips = parsed.filter((t: any) => t.createdBy === "TestTest");
      // Sort newest first
      setMyTrips(userTrips.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, []);

  const handleSosTrigger = () => {
    setIsSosModalOpen(false);
    toast.error("Demo: Emergency alert sent to your trusted contacts and local authorities.", {
      icon: "🚨",
      duration: 5000,
      style: { background: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5" }
    });
  };

  const handleJoinTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    toast.success(`Joined trip with code ${inviteCode.toUpperCase()} (Demo)`);
    setInviteCode("");
  };

  const togglePref = (key: keyof typeof safetyPrefs) => {
    setSafetyPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto", color: "var(--text)" }}>
      
      {/* ── Welcome Row ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Good morning, {user.username}</h1>
          <p style={{ color: "var(--text3)", margin: 0, fontSize: 15 }}>Ready for your next safe adventure?</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>80%</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Profile Strength</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text3)" }}>Complete KYC to reach 100%</p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        {[
          { label: "Active Trips", value: myTrips.length.toString(), icon: Compass, color: "var(--primary)" },
          { label: "Total Saved (Split)", value: "₹0", icon: Wallet, color: "var(--success)" },
          { label: "Safety Score", value: "75", icon: ShieldAlert, color: "var(--warning)" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "var(--card)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <stat.icon style={{ width: 28, height: 28, color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: 14, color: "var(--text2)", margin: "0 0 4px", fontWeight: 500 }}>{stat.label}</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--text)" }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        
        {/* LEFT COLUMN */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {myTrips.length === 0 ? (
            <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: 32, textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Compass style={{ width: 40, height: 40, color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>No Upcoming Trips</h3>
              <p style={{ color: "var(--text2)", marginBottom: 24, maxWidth: 300, margin: "0 auto 24px" }}>
                You don't have any trips planned. Create a new trip or join an existing one to get started.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => router.push("/create-trip")} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  Create New Trip
                </button>
                <button onClick={() => router.push("/trips")} style={{ background: "transparent", color: "var(--primary)", border: "2px solid var(--primary)", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  Explore Public Trips
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Compass style={{ width: 18, height: 18, color: "var(--primary)" }} /> Your Latest Trip</h3>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", cursor: "pointer", padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }} className="hover:border-primary/50 transition-colors" onClick={() => router.push(`/trip/${myTrips[0].id}`)}>
                  <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--bg2)" }}>
                    <img src={myTrips[0].imageBase64 || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"} alt={myTrips[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--text)" }}>{myTrips[0].title}</h4>
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}><MapPin style={{ width: 12, height: 12 }} /> {myTrips[0].route}</p>
                    <span style={{ fontSize: 12, background: "rgba(29, 158, 117, 0.1)", color: "var(--primary)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>{new Date(myTrips[0].startDate).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight style={{ width: 20, height: 20, color: "var(--text3)" }} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button onClick={() => router.push("/create-trip")} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    + Create Trip
                  </button>
                  <button onClick={() => router.push("/trips")} style={{ flex: 1, background: "transparent", color: "var(--text)", border: "1px solid var(--border)", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }} className="hover:bg-bg2">
                    Explore Trips
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Feed */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", display: "flex", alignItems: "center", gap: 10 }}>
              <Activity style={{ width: 18, height: 18, color: "var(--text2)" }} />
              <h3 style={{ fontSize: 16, margin: 0 }}>Recent Activity</h3>
            </div>
            <div style={{ padding: "0 20px" }}>
              {[
                { title: "You viewed Goa Beach Escape", time: "2 hours ago", icon: Search },
                { title: "Profile completed to 80%", time: "Yesterday", icon: FileCheck },
                { title: "Account verified successfully", time: "2 days ago", icon: CheckCircle },
              ].map((act, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <act.icon style={{ width: 16, height: 16, color: "var(--text2)" }} />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500 }}>{act.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text3)" }}>{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Emergency SOS */}
          <div style={{ background: "#FEF2F2", borderRadius: 16, border: "1px solid #FCA5A5", padding: 24, textAlign: "center" }}>
            <h3 style={{ color: "#991B1B", fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ShieldAlert style={{ width: 20, height: 20 }} /> Emergency SOS
            </h3>
            <p style={{ color: "#B91C1C", fontSize: 14, marginBottom: 20 }}>
              Instantly share your live location and alert your trusted contacts and local authorities.
            </p>
            <button 
              onClick={() => setIsSosModalOpen(true)}
              style={{ width: "100%", background: "#DC2626", color: "white", border: "none", padding: "14px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" }}
            >
              TRIGGER SOS
            </button>
          </div>

          {/* AI Assistant Placeholder */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
             <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Bot style={{ width: 18, height: 18, color: "var(--primary)" }} />
                <h3 style={{ fontSize: 16, margin: 0 }}>AI Travel Assistant <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 11, padding: "2px 8px", borderRadius: 12, marginLeft: 8 }}>BETA</span></h3>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Our intelligent ML models are currently training! Soon, your AI assistant will provide smart itinerary planning, budget predictions, and personalized safety insights.
              </p>
              <button onClick={() => toast.success("We'll notify you when the AI Assistant is live!")} style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Bell style={{ width: 16, height: 16 }} /> Notify me when ready
              </button>
            </div>
          </div>

          {/* Live Safety Feed */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <LocateFixed style={{ width: 18, height: 18, color: "var(--success)" }} /> Live Safety Feed
              </h3>
              <p style={{ fontSize: 12, color: "var(--text3)", margin: "4px 0 0" }}>Delhi NCR</p>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, padding: 12, background: "var(--bg)", borderRadius: 8 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <p style={{ fontSize: 13, margin: 0, color: "var(--text2)" }}>Low reported incidents in your current sector.</p>
              </div>
              <div style={{ display: "flex", gap: 12, padding: 12, background: "#FFFBEB", borderRadius: 8, border: "1px solid #FEF3C7" }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <p style={{ fontSize: 13, margin: 0, color: "#92400E" }}>Road closure expected near Connaught Place due to construction.</p>
              </div>
            </div>
          </div>

          {/* Safety Quick Settings */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: 20 }}>
            <h3 style={{ fontSize: 16, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              Safety Quick Settings
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { id: "womenOnly", label: "Women-Only Travel Mode", desc: "Only match with female travelers" },
                { id: "autoShareLocation", label: "Auto-Share Live Location", desc: "Share with trusted contacts on trip start" },
                { id: "sosShortcut", label: "Enable SOS Shortcut", desc: "Quick double-tap to trigger" },
              ].map(setting => (
                <div key={setting.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{setting.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>{setting.desc}</p>
                  </div>
                  {/* Custom Toggle Switch */}
                  <div 
                    onClick={() => togglePref(setting.id as keyof typeof safetyPrefs)}
                    style={{ 
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative",
                      background: safetyPrefs[setting.id as keyof typeof safetyPrefs] ? "var(--primary)" : "var(--border2)",
                      transition: "background 0.2s"
                    }}
                  >
                    <div style={{ 
                      width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2,
                      left: safetyPrefs[setting.id as keyof typeof safetyPrefs] ? 22 : 2, transition: "left 0.2s"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Code Join */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: 20 }}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>Have an invite code?</h3>
            <form onSubmit={handleJoinTrip} style={{ display: "flex", gap: 12 }}>
              <input 
                type="text" 
                placeholder="e.g. YS-A1B2" 
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}
              />
              <button type="submit" style={{ background: "var(--primary)", color: "white", border: "none", padding: "0 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom Verification Banner ── */}
      <div style={{ background: "rgba(239, 159, 39, 0.1)", border: "1px solid rgba(239, 159, 39, 0.3)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Info style={{ width: 20, height: 20, color: "var(--warning)" }} />
          <p style={{ margin: 0, fontSize: 14, color: "var(--text)" }}><strong>Account Not Fully Verified.</strong> Complete your KYC to unlock trip creation and shared wallet features.</p>
        </div>
        <button onClick={() => router.push("/profile")} style={{ background: "var(--warning)", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          Verify Now
        </button>
      </div>

      {/* ── Modals ── */}
      {isSosModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={() => setIsSosModalOpen(false)}>
          <div style={{ background: "var(--card)", borderRadius: 16, width: "100%", maxWidth: 400, padding: 32, textAlign: "center", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <ShieldAlert style={{ width: 32, height: 32, color: "#DC2626" }} />
            </div>
            <h2 style={{ fontSize: 24, margin: "0 0 12px", color: "var(--text)" }}>Trigger Emergency SOS?</h2>
            <p style={{ color: "var(--text2)", marginBottom: 24 }}>
              This will immediately send your live location and an emergency alert to your trusted contacts and local authorities.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={handleSosTrigger} style={{ width: "100%", background: "#DC2626", color: "white", border: "none", padding: "14px", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                YES, SEND ALERT
              </button>
              <button onClick={() => setIsSosModalOpen(false)} style={{ width: "100%", background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "14px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}