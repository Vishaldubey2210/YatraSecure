"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, Calendar, Wallet, Users, Search, 
  Trash2, Edit3, Eye, Plus, Shield
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  const loadTrips = () => {
    const stored = localStorage.getItem("yatra_trips");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter only trips created by this mock user
      const userTrips = parsed.filter((t: any) => t.createdBy === "TestTest");
      // Sort newest first
      setTrips(userTrips.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadTrips();
  }, []);

  const handleDelete = (tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      const stored = localStorage.getItem("yatra_trips");
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.filter((t: any) => t.id !== tripId);
        localStorage.setItem("yatra_trips", JSON.stringify(updated));
        loadTrips();
        toast.success("Trip deleted successfully");
      }
    }
  };

  const getTripStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < now) return "Completed";
    if (start <= now && end >= now) return "Ongoing";
    return "Upcoming";
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  if (!isClient) return null;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      {/* ── Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.02em" }}>My Trips</h1>
          <p style={{ color: "var(--text3)", margin: 0, fontSize: 15 }}>Manage the trips you've created and planned.</p>
        </div>
        <button 
          onClick={() => router.push("/create-trip")}
          style={{ background: "var(--primary)", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(29, 158, 117, 0.3)" }}
        >
          <Plus style={{ width: 18, height: 18 }} /> Create New Trip
        </button>
      </div>

      {/* ── Content ── */}
      {trips.length === 0 ? (
        <div className="anim-in" style={{ textAlign: "center", padding: "80px 20px", background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)" }}>
          <div style={{ width: 100, height: 100, background: "var(--bg2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <MapPin style={{ width: 40, height: 40, color: "var(--text3)" }} />
          </div>
          <h2 style={{ fontSize: 24, margin: "0 0 12px", color: "var(--text)" }}>No trips yet</h2>
          <p style={{ color: "var(--text2)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
            You haven't created any trips. Start planning your next adventure and invite others to join!
          </p>
          <button 
            onClick={() => router.push("/create-trip")}
            style={{ background: "var(--primary)", color: "white", border: "none", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {trips.map(trip => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const statusColor = status === "Completed" ? "var(--text3)" : status === "Ongoing" ? "var(--warning)" : "var(--success)";
            const statusBg = status === "Completed" ? "var(--bg)" : status === "Ongoing" ? "rgba(239, 159, 39, 0.15)" : "rgba(29, 158, 117, 0.15)";

            return (
              <div key={trip.id} className="anim-in hover:shadow-lg hover:-translate-y-1" style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s" }}>
                
                {/* Image Area */}
                <div style={{ height: 180, position: "relative", background: "var(--bg2)" }}>
                  <img src={trip.imageBase64} alt={trip.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  
                  {/* Top Badges */}
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, backdropFilter: "blur(4px)" }}>
                    {trip.tripType}
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 12, background: trip.privacy === "public" ? "rgba(15, 123, 58, 0.9)" : "rgba(100, 116, 139, 0.9)", color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield style={{ width: 12, height: 12 }} /> {trip.privacy === "public" ? "Public" : "Private"}
                  </div>
                </div>
                
                {/* Content Area */}
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 18, margin: 0, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>{trip.title}</h3>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text2)", fontSize: 13, marginBottom: 16 }}>
                    <MapPin style={{ width: 14, height: 14 }} /> {trip.route}
                  </div>

                  {/* Quick Info Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, padding: "12px", background: "var(--bg)", borderRadius: 12 }}>
                     <div>
                        <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>Dates</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                     </div>
                     <div>
                        <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>Budget (pp)</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--success)" }}>₹{trip.budget.toLocaleString()}</p>
                     </div>
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                       <Users style={{ width: 16, height: 16 }} />
                       <span>You + {trip.members?.length || 0} / {trip.maxMembers}</span>
                     </div>
                     <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: statusBg, color: statusColor }}>
                       {status}
                     </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <button onClick={() => router.push(`/trip/${trip.id}`)} style={{ flex: 1, background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "10px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Eye style={{ width: 16, height: 16 }} /> View
                    </button>
                    <button onClick={() => toast("Edit functionality coming soon", { icon: "✏️" })} style={{ flex: 1, background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "10px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Edit3 style={{ width: 16, height: 16 }} /> Edit
                    </button>
                    <button onClick={() => handleDelete(trip.id)} style={{ background: "transparent", color: "var(--danger)", border: "1px solid var(--border)", padding: "10px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:bg-danger/10 hover:border-danger">
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  );
}
