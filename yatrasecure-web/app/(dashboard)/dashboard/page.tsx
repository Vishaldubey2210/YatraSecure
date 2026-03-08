"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, MapPin, Users, Calendar, Wallet,
  TrendingUp, ArrowRight, Clock, Globe, Lock,
  Compass, Bell
} from "lucide-react";
import { fetchWithAuth } from "@/app/lib/api";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function TripCard({ trip }: { trip: any }) {
  const router = useRouter();
  const daysLeft = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);
  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="card card-hover"
      style={{ padding: 20, cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.1))",
            border: "1px solid rgba(249,115,22,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MapPin style={{ width: 17, height: 17, color: "#f97316" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>{trip.name}</p>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
              {trip.fromCity} → {trip.toCity}
            </p>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
          background: trip.isPublic ? "rgba(34,197,94,0.1)" : "rgba(148,163,184,0.1)",
          border: `1px solid ${trip.isPublic ? "rgba(34,197,94,0.2)" : "rgba(148,163,184,0.15)"}`,
          color: trip.isPublic ? "#22c55e" : "#64748b",
        }}>
          {trip.isPublic
            ? <Globe style={{ width: 10, height: 10 }} />
            : <Lock  style={{ width: 10, height: 10 }} />
          }
          {trip.isPublic ? "Public" : "Private"}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
          <Calendar style={{ width: 12, height: 12 }} /> {formatDate(trip.startDate)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
          <Users style={{ width: 12, height: 12 }} /> {trip.members?.length || 1} members
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
          <Wallet style={{ width: 12, height: 12 }} /> ₹{trip.budget?.toLocaleString()}
        </span>
      </div>

      {daysLeft > 0 ? (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: daysLeft <= 7 ? "rgba(249,115,22,0.12)" : "rgba(59,130,246,0.1)",
          border: `1px solid ${daysLeft <= 7 ? "rgba(249,115,22,0.25)" : "rgba(59,130,246,0.2)"}`,
          color: daysLeft <= 7 ? "#f97316" : "#60a5fa",
        }}>
          <Clock style={{ width: 10, height: 10 }} />
          {daysLeft <= 7 ? `${daysLeft}d left!` : `In ${daysLeft} days`}
        </div>
      ) : (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399",
        }}>
          Trip ongoing / completed
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [trips, setTrips]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const data = await fetchWithAuth("/trips");
      console.log("trips response:", data);

      if (Array.isArray(data)) {
        setTrips(data);
      } else if (Array.isArray(data?.trips)) {
        setTrips(data.trips);
      } else if (Array.isArray(data?.data)) {
        setTrips(data.data);
      } else {
        setTrips([]);
      }
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  const upcoming = trips.filter(t => new Date(t.startDate) > new Date()).slice(0, 4);
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statsData = [
    { label: "Total Trips",   value: trips.length,          icon: MapPin,     color: "#f97316" },
    { label: "Upcoming",      value: upcoming.length,        icon: Calendar,   color: "#fbbf24" },
    { label: "Group Members", value: trips.reduce((a, t) => a + (t.members?.length || 1), 0), icon: Users, color: "#f97316" },
    { label: "Total Budget",  value: `₹${trips.reduce((a, t) => a + (t.budget || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "#fbbf24" },
  ];

  return (
    <div className="anim-in">

      {/* ── WELCOME ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {greeting}, {user?.username || "Traveler"} 👋
        </h1>
        <p style={{ color: "#475569", fontSize: 14 }}>
          Here's what's happening with your trips today.
        </p>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {statsData.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </p>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${color}18`, border: `1px solid ${color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon style={{ width: 14, height: 14, color }} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: "white", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr" }} className="xl:grid-cols-[1fr_280px]">

        {/* Upcoming trips */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>Upcoming Trips</h2>
            <Link href="/trips" style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "#f97316", fontWeight: 600, textDecoration: "none",
            }}>
              Browse all <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 110, borderRadius: 16, background: "#1a2744",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MapPin style={{ width: 24, height: 24, color: "#334155" }} />
              </div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                No upcoming trips
              </p>
              <p style={{ color: "#334155", fontSize: 13, marginBottom: 20 }}>
                Create your first trip or browse existing ones
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => router.push("/trips/create")}
                  className="btn-primary"
                  style={{ padding: "10px 20px", fontSize: 13 }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> Create Trip
                </button>
                <button
                  onClick={() => router.push("/trips")}
                  className="btn-ghost"
                  style={{ padding: "10px 20px", fontSize: 13 }}
                >
                  Browse Trips
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {upcoming.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Create New Trip", desc: "Start planning a trip", href: "/trips/create", icon: Plus,    primary: true  },
              { label: "Browse Trips",    desc: "Find & join a group",   href: "/trips",         icon: Compass, primary: false },
              { label: "My Wallet",       desc: "View your expenses",    href: "/wallet",        icon: Wallet,  primary: false },
              { label: "Notifications",   desc: "Check latest updates",  href: "/notifications", icon: Bell,    primary: false },
            ].map(({ label, desc, href, icon: Icon, primary }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                    borderRadius: 13, transition: "all 0.15s", cursor: "pointer",
                    background: primary
                      ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.08))"
                      : "#1a2744",
                    border: `1px solid ${primary ? "rgba(249,115,22,0.3)" : "#2d3f5e"}`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.45)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = primary ? "rgba(249,115,22,0.3)" : "#2d3f5e";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: primary ? "linear-gradient(135deg,#f97316,#fbbf24)" : "rgba(249,115,22,0.1)",
                    border: primary ? "none" : "1px solid rgba(249,115,22,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: primary ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                  }}>
                    <Icon style={{ width: 15, height: 15, color: primary ? "white" : "#f97316" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>{desc}</p>
                  </div>
                  <ArrowRight style={{ width: 13, height: 13, color: "#334155", flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
