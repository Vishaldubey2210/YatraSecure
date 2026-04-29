"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, SlidersHorizontal, MapPin, Calendar, Wallet, Users,
  CheckCircle, Plus, X, Sparkles, Filter, AlertCircle, Bot
} from "lucide-react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

// --- Data Constants ---
const DESTINATIONS = [
  "Goa", "Manali", "Rishikesh", "Coorg", "Kerala", "Jaipur", "Leh Ladakh",
  "Andaman", "Darjeeling", "Udaipur", "Gokarna", "Varanasi", "Spiti Valley"
];
const TRIP_TYPES = ["Group", "Solo", "Family", "Adventure", "Pilgrimage", "Business"];
const STATUSES = ["Upcoming", "Ongoing", "Completed"];

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
};

export default function ExploreTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [minMatch, setMinMatch] = useState<number>(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState("date-asc");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // AI Matchmaking State
  const [isMatchmakingModalOpen, setIsMatchmakingModalOpen] = useState(false);
  const [travelStylePref, setTravelStylePref] = useState<string>("");

  useEffect(() => {
    // Load dynamically created trips from localStorage
    let localTrips: any[] = [];
    try {
      const stored = localStorage.getItem("yatra_trips");
      if (stored) {
        const parsed = JSON.parse(stored);
        localTrips = parsed.filter((t: any) => t.privacy === 'public').map((t: any) => {
          const now = new Date();
          const start = new Date(t.startDate);
          const end = new Date(t.endDate);
          let status = "Upcoming";
          if (end < now) status = "Completed";
          else if (start <= now && end >= now) status = "Ongoing";

          return {
             id: t.id,
             name: t.title,
             fromCity: t.route?.split('→')[0]?.trim() || "Home",
             toCity: t.destination,
             startDate: t.startDate,
             endDate: t.endDate,
             budget: t.budget,
             tripType: t.tripType,
             status: status,
             totalSpots: t.maxMembers,
             spotsLeft: t.maxMembers - (t.members?.length || 1),
             joinedCount: t.members?.length || 1,
             baseMatch: 95, // High match for user-created
             image: t.imageBase64 || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
             isPublic: true,
             isUserCreated: true,
             createdBy: t.createdBy
          };
        });
      }
    } catch (e) {}
    
    setTrips(localTrips);
    setIsInitializing(false);
  }, []);

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Recalculate Match %
    result = result.map(t => {
      let finalMatch = t.baseMatch;
      if (travelStylePref && t.tripType === travelStylePref) {
        finalMatch = Math.min(100, finalMatch + 25);
      }
      return { ...t, matchPercentage: finalMatch };
    });

    // Filter Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(lowerQ) || 
        t.toCity.toLowerCase().includes(lowerQ)
      );
    }

    // Filter Type
    if (selectedTypes.length > 0) {
      result = result.filter(t => selectedTypes.includes(t.tripType));
    }

    // Filter Budget
    if (minBudget) result = result.filter(t => t.budget >= parseInt(minBudget));
    if (maxBudget) result = result.filter(t => t.budget <= parseInt(maxBudget));

    // Filter Match
    if (minMatch > 0) {
      result = result.filter(t => t.matchPercentage >= minMatch);
    }

    // Filter Status
    if (!showCompleted) {
      result = result.filter(t => t.status !== "Completed");
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === "date-desc") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sortBy === "budget-asc") return a.budget - b.budget;
      if (sortBy === "budget-desc") return b.budget - a.budget;
      if (sortBy === "match-desc") return b.matchPercentage - a.matchPercentage;
      return 0;
    });

    return result;
  }, [trips, searchQuery, selectedTypes, minBudget, maxBudget, minMatch, showCompleted, sortBy, travelStylePref]);

  const visibleTrips = filteredAndSortedTrips.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedTrips.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 9);
      setIsLoading(false);
    }, 400); // Mock loading delay
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    setIsMobileFiltersOpen(false);
    setTimeout(() => {
      setVisibleCount(9);
      setIsLoading(false);
    }, 400);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setMinBudget("");
    setMaxBudget("");
    setMinMatch(0);
    setShowCompleted(false);
    handleApplyFilters();
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getMatchColor = (match: number) => {
    if (match >= 70) return { bg: "#E1F5EE", text: "var(--success)" };
    if (match >= 40) return { bg: "rgba(239, 159, 39, 0.15)", text: "var(--warning)" };
    return { bg: "#FEF2F2", text: "var(--danger)" };
  };

  if (isInitializing) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      
      {/* ── AI Matchmaking Banner ── */}
      <div style={{ background: "var(--primary-light)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--primary)", width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot style={{ width: 24, height: 24, color: "white" }} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--text)" }}>AI Matchmaking</h3>
            <p style={{ margin: 0, color: "var(--text2)", fontSize: 14 }}>Get personalized trip suggestions based on your travel personality.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMatchmakingModalOpen(true)}
          style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
        >
          Improve My Matches
        </button>
      </div>

      {/* ── Header & Search ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Explore Trips</h1>
          <p style={{ color: "var(--text3)", margin: 0, fontSize: 15 }}>Discover verified group trips across India.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 600 }}>
          {/* Mobile Filter Toggle */}
          <button onClick={() => setIsMobileFiltersOpen(true)} className="lg:hidden" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "12px", borderRadius: 12, display: "flex", alignItems: "center", color: "var(--text)" }}>
            <Filter style={{ width: 20, height: 20 }} />
          </button>
          
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <Search style={{ position: "absolute", left: 16, width: 20, height: 20, color: "var(--text3)" }} />
            <input 
              type="text" 
              placeholder="Search by destination or name..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(9); }}
              style={{ width: "100%", padding: "14px 14px 14px 48px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 15, outline: "none" }}
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={e => { setSortBy(e.target.value); setVisibleCount(9); }}
            style={{ padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 15, outline: "none", cursor: "pointer" }}
          >
            <option value="date-asc">Date (Nearest First)</option>
            <option value="date-desc">Date (Furthest First)</option>
            <option value="budget-asc">Budget (Low to High)</option>
            <option value="budget-desc">Budget (High to Low)</option>
            <option value="match-desc">Match % (High to Low)</option>
          </select>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* LEFT COLUMN: FILTERS (Desktop) */}
        <div className={`filter-sidebar ${isMobileFiltersOpen ? 'mobile-open' : 'hidden lg:block'}`} style={{ width: 280, flexShrink: 0, background: "var(--card)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", position: "sticky", top: 100 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><SlidersHorizontal style={{ width: 18, height: 18 }} /> Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="lg:hidden" style={{ background: "none", border: "none", color: "var(--text)" }}><X style={{ width: 20, height: 20 }} /></button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Trip Type */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase" }}>Trip Type</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TRIP_TYPES.map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 15, color: "var(--text)" }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase" }}>Price Range (₹)</p>
              <div style={{ display: "flex", gap: 12 }}>
                <input type="number" placeholder="Min" value={minBudget} onChange={e => setMinBudget(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
                <input type="number" placeholder="Max" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              </div>
            </div>

            {/* Match Percentage */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 12, textTransform: "uppercase" }}>Min Match %: {minMatch}%</p>
              <input 
                type="range" min="0" max="100" step="10" 
                value={minMatch} onChange={e => setMinMatch(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Status Toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 15, color: "var(--text)" }}>Show Completed Trips</span>
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              <button onClick={handleApplyFilters} style={{ background: "var(--primary)", color: "white", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Apply Filters
              </button>
              <button onClick={clearFilters} style={{ background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GRID */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Active Filters Chips */}
          {(selectedTypes.length > 0 || minBudget || maxBudget || minMatch > 0 || showCompleted) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text2)", marginRight: 8 }}>Active Filters:</span>
              {selectedTypes.map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
                  {t} <X style={{ width: 12, height: 12, cursor: "pointer" }} onClick={() => toggleType(t)} />
                </div>
              ))}
              {(minBudget || maxBudget) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
                  ₹{minBudget || "0"} - ₹{maxBudget || "Max"} <X style={{ width: 12, height: 12, cursor: "pointer" }} onClick={() => { setMinBudget(""); setMaxBudget(""); }} />
                </div>
              )}
              {minMatch > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
                  &gt;{minMatch}% Match <X style={{ width: 12, height: 12, cursor: "pointer" }} onClick={() => setMinMatch(0)} />
                </div>
              )}
              {showCompleted && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
                  Including Completed <X style={{ width: 12, height: 12, cursor: "pointer" }} onClick={() => setShowCompleted(false)} />
                </div>
              )}
              <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", marginLeft: 8 }}>Clear All</button>
            </div>
          )}

          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24, fontWeight: 500 }}>
            Showing {filteredAndSortedTrips.length} results
          </p>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 400, background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : visibleTrips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)" }}>
              <div style={{ width: 80, height: 80, background: "var(--bg2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Search style={{ width: 32, height: 32, color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: 22, margin: "0 0 12px", color: "var(--text)" }}>No trips found</h3>
              <p style={{ color: "var(--text2)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>We couldn't find any trips matching your exact filters. Try broadening your search or adjusting the price range.</p>
              <button onClick={clearFilters} style={{ background: "var(--primary)", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Reset Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                {visibleTrips.map(trip => {
                  const matchColors = getMatchColor(trip.matchPercentage);
                  return (
                    <div key={trip.id} style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }} className="hover:shadow-lg hover:-translate-y-1">
                      {/* Image Area */}
                      <div style={{ height: 160, position: "relative", background: "#E2E8F0" }}>
                        <img src={trip.image} alt={trip.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, backdropFilter: "blur(4px)" }}>
                          {trip.tripType}
                        </div>
                        <div style={{ position: "absolute", top: 12, right: 12, background: matchColors.bg, color: matchColors.text, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800, border: `1px solid ${matchColors.text}40` }}>
                          {trip.matchPercentage}% Match
                        </div>
                      </div>
                      
                      {/* Content Area */}
                      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <h3 style={{ fontSize: 18, margin: 0, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>{trip.name}</h3>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text2)", fontSize: 13, marginBottom: 16 }}>
                          <MapPin style={{ width: 14, height: 14 }} /> {trip.fromCity} &rarr; {trip.toCity}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, padding: "12px", background: "var(--bg)", borderRadius: 12 }}>
                           <div>
                              <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>Dates</p>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatDate(trip.startDate)}</p>
                           </div>
                           <div>
                              <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>Budget</p>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--success)" }}>₹{trip.budget.toLocaleString()}</p>
                           </div>
                        </div>

                        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                           <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)" }}>
                             <Users style={{ width: 16, height: 16 }} />
                             <span>{trip.joinedCount} Joined &middot; {trip.spotsLeft} spots left</span>
                           </div>
                           <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: trip.status === "Completed" ? "var(--bg)" : trip.status === "Ongoing" ? "rgba(239, 159, 39, 0.15)" : "rgba(29, 158, 117, 0.15)", color: trip.status === "Completed" ? "var(--text3)" : trip.status === "Ongoing" ? "var(--warning)" : "var(--success)" }}>
                             {trip.status}
                           </span>
                        </div>

                        <button 
                          onClick={() => router.push(`/trip/${trip.id}`)}
                          disabled={trip.status === "Completed"}
                          style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: trip.status === "Completed" ? "not-allowed" : "pointer", background: trip.status === "Completed" ? "var(--bg)" : "var(--primary)", color: trip.status === "Completed" ? "var(--text3)" : "white" }}
                        >
                          {trip.status === "Completed" ? "Completed" : trip.createdBy === "TestTest" ? "Manage Trip" : "Request to Join"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <button 
                    onClick={handleLoadMore}
                    style={{ background: "transparent", border: "2px solid var(--border)", color: "var(--text)", padding: "12px 32px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Load More Trips
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── AI Matchmaking Quiz Modal ── */}
      {isMatchmakingModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={() => setIsMatchmakingModalOpen(false)}>
          <div style={{ background: "var(--card)", borderRadius: 20, width: "100%", maxWidth: 450, padding: 32, textAlign: "center", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bot style={{ width: 32, height: 32, color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontSize: 24, margin: "0 0 12px", color: "var(--text)" }}>Improve Your Matches</h2>
            <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 15 }}>
              Answer one quick question so our AI can personalize your trip recommendations.
            </p>
            
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>What is your preferred travel style?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TRIP_TYPES.map(style => (
                  <label key={style} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", background: travelStylePref === style ? "var(--primary-light)" : "var(--bg)" }}>
                    <input type="radio" name="travelStyle" value={style} checked={travelStylePref === style} onChange={() => setTravelStylePref(style)} />
                    <span style={{ fontWeight: 500 }}>{style}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setIsMatchmakingModalOpen(false)} style={{ flex: 1, background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "12px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button 
                onClick={() => {
                  setIsMatchmakingModalOpen(false);
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast.success("AI Models updated! Your match scores have improved.", { icon: "🧠" });
                  }, 600);
                }} 
                style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", padding: "12px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Helper CSS for Mobile Drawer */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .filter-sidebar.hidden { display: none !important; }
          .filter-sidebar.mobile-open {
            display: block !important;
            position: fixed !important;
            top: 0 !important; left: 0 !important; bottom: 0 !important;
            z-index: 1000;
            width: 300px !important;
            border-radius: 0 !important;
            overflow-y: auto;
            box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
}
