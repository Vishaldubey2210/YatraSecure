"use client";

import React, { useState, useEffect } from "react";
import {
  Search, MapPin, Compass, Sparkles, Navigation, Clock, ShieldCheck,
  Languages, Globe2, AlertCircle, Share2, Heart, Plus, Calendar,
  Utensils, Map, CheckCircle2, ChevronRight, Bus, Bed, ArrowLeft,
  Users, User, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

// --- Mock Database ---
const MOCK_DESTINATIONS: Record<string, any> = {
  goa: {
    name: "Goa", country: "India", flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    stats: { bestTime: "Nov - Feb", currency: "INR (₹)", language: "Konkani, English", timezone: "IST (UTC+5:30)", safety: "4.5/5" },
    overview: "Goa is a kaleidoscope of Indian and Portuguese cultures, sweetened with sun, sea, sand, seafood, and susegad. Whether you seek vibrant nightlife in North Goa or serene, untouched beaches in South Goa, this coastal paradise offers a perfect escape.",
    attractions: [
      { name: "Baga Beach", desc: "Famous for water sports and vibrant nightlife.", price: "Free" },
      { name: "Basilica of Bom Jesus", desc: "UNESCO World Heritage site with baroque architecture.", price: "Free" },
      { name: "Dudhsagar Falls", desc: "A magnificent four-tiered waterfall accessible via trek or jeep.", price: "₹500/person" },
      { name: "Fort Aguada", desc: "17th-century Portuguese fort with stunning ocean views.", price: "₹25 entry" }
    ],
    cuisine: ["Fish Curry Rice", "Pork Vindaloo", "Bebinca", "Feni"],
    activities: [
      { name: "Scuba Diving at Grande Island", price: "₹2,500 - ₹4,000" },
      { name: "Sunset Cruise on Mandovi River", price: "₹500 - ₹1,200" },
      { name: "Spice Plantation Walk", price: "₹400 - ₹600" }
    ],
    transport: "Rent a scooter (₹400-₹600/day) for maximum flexibility. Taxis and auto-rickshaws are available but can be expensive. Local buses are cheap but infrequent.",
    weather: "Tropical monsoon climate. Hot and humid in summer (Mar-May), heavy rains in monsoon (Jun-Oct), and pleasant in winter (Nov-Feb).",
    accommodation: { budget: "Zostel, Woke Hostel", mid: "Taj Holiday Village, Riva Resort", luxury: "W Goa, The Leela" },
    baseSafety: ["Swim only at beaches with lifeguards.", "Negotiate taxi fares before boarding.", "Be cautious of your belongings at crowded parties."],
    personalization: {
      Family: { 
        safety: ["Keep a close eye on kids at busy beaches like Baga.", "Ensure resort pools have lifeguards."], 
        activity: "Visit the Sahakari Spice Farm for a family-friendly educational tour." 
      },
      Solo: { 
        safety: ["Avoid isolated beaches in South Goa after dark.", "Don't accept opened drinks at clubs."], 
        activity: "Join a pub crawl in Tito's Lane to meet other travelers." 
      }
    }
  },
  manali: {
    name: "Manali", country: "India", flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80",
    stats: { bestTime: "Oct - Jun", currency: "INR (₹)", language: "Hindi, Pahari", timezone: "IST (UTC+5:30)", safety: "4.7/5" },
    overview: "Nestled in the picturesque Beas River valley, Manali is a high-altitude Himalayan resort town. It is a popular backpacking center and honeymoon destination, offering breathtaking snow-capped peaks, pine forests, and thrilling adventure sports.",
    attractions: [
      { name: "Solang Valley", desc: "Adventure hub for paragliding, skiing, and zorbing.", price: "Free entry, activities extra" },
      { name: "Rohtang Pass", desc: "High mountain pass with year-round snow (requires permit).", price: "₹500 permit" },
      { name: "Hadimba Temple", desc: "Ancient cave temple surrounded by a cedar forest.", price: "Free" },
      { name: "Old Manali", desc: "Quaint village with bohemian cafes and apple orchards.", price: "Free" }
    ],
    cuisine: ["Khatta", "Babru", "Trout Fish", "Siddu"],
    activities: [
      { name: "Paragliding in Solang", price: "₹1,500 - ₹3,000" },
      { name: "Trekking to Bhrigu Lake", price: "₹3,000 - ₹5,000" },
      { name: "River Rafting in Kullu", price: "₹1,000 - ₹2,000" }
    ],
    transport: "Local auto-rickshaws and taxis. Renting a Royal Enfield is popular for exploring nearby valleys. HPDC buses connect major spots.",
    weather: "Cold winters with heavy snowfall (Dec-Feb). Pleasant summers (May-Jun). Avoid monsoons (Jul-Aug) due to landslides.",
    accommodation: { budget: "Alt Life, Hosteller", mid: "Johnson Lodge, Apple Country", luxury: "The Himalayan, Span Resort" },
    baseSafety: ["Acclimatize properly to avoid altitude sickness.", "Check weather and road conditions before driving to Rohtang.", "Carry heavy woolens in winter."],
    personalization: {
      Family: { 
        safety: ["Pack essential medicines; pharmacies can be sparse outside the main town.", "Ensure children wear anti-slip shoes in snow."], 
        activity: "Enjoy a safe and scenic gondola ride in Solang Valley." 
      },
      Solo: { 
        safety: ["Inform your hostel before embarking on solo treks.", "Beware of touts offering cheap adventure sports."], 
        activity: "Hike the scenic trails behind Old Manali to meet fellow backpackers." 
      }
    }
  },
  paris: {
    name: "Paris", country: "France", flag: "🇫🇷",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    stats: { bestTime: "Apr - Oct", currency: "Euro (€)", language: "French", timezone: "CET (UTC+1)", safety: "4.2/5" },
    overview: "The City of Light dazzles with its iconic monuments, world-class art museums, and chic café culture. Paris is synonymous with romance, fashion, and gastronomy, offering a timeless urban experience along the romantic Seine river.",
    attractions: [
      { name: "Eiffel Tower", desc: "The iconic wrought-iron lattice tower on the Champ de Mars.", price: "€28.30 (Top)" },
      { name: "Louvre Museum", desc: "World's largest art museum, home to the Mona Lisa.", price: "€22" },
      { name: "Notre-Dame Cathedral", desc: "Historic Catholic cathedral (currently under restoration).", price: "Free outside" },
      { name: "Montmartre", desc: "Historic bohemian district featuring the Sacré-Cœur.", price: "Free" }
    ],
    cuisine: ["Croissant", "Escargots", "Macarons", "Boeuf Bourguignon"],
    activities: [
      { name: "Seine River Cruise", price: "€15 - €30" },
      { name: "Wine & Cheese Tasting", price: "€40 - €80" },
      { name: "Cabaret Show at Moulin Rouge", price: "€100 - €200" }
    ],
    transport: "The Paris Métro is highly efficient and connects the entire city. Walking is the best way to explore individual neighborhoods.",
    weather: "Mild winters and warm summers. Spring (April-May) and Autumn (Sep-Oct) are ideal.",
    accommodation: { budget: "St Christopher's, Generator", mid: "Hotel des Grands Boulevards", luxury: "Ritz Paris, Le Meurice" },
    baseSafety: ["Beware of pickpockets at major tourist sites and on the Métro.", "Avoid signing fake petitions on the street.", "Keep bags zipped in crowded cafes."],
    personalization: {
      Couple: { safety: ["Locking love locks is now banned on most bridges; take photos instead."], activity: "Take a romantic twilight cruise on the Seine followed by a candlelit dinner in Le Marais." },
      Solo: { safety: ["Stick to well-lit main streets if walking late in Montmartre."], activity: "Join a walking tour of the Latin Quarter to mingle with other tourists." }
    }
  },
  bali: {
    name: "Bali", country: "Indonesia", flag: "🇮🇩",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    stats: { bestTime: "Apr - Oct", currency: "Rupiah (IDR)", language: "Indonesian, Balinese", timezone: "WITA (UTC+8)", safety: "4.6/5" },
    overview: "Known as the Island of the Gods, Bali captivates with its lush volcanic mountains, iconic rice paddies, and coral reefs. It blends profound spiritual culture with incredible natural beauty and world-class surfing.",
    attractions: [
      { name: "Uluwatu Temple", desc: "Sea temple perched on a cliff, famous for sunset Kecak dances.", price: "50,000 IDR" },
      { name: "Sacred Monkey Forest", desc: "Lush sanctuary in Ubud home to hundreds of macaques.", price: "80,000 IDR" },
      { name: "Tegallalang Rice Terrace", desc: "Iconic, beautiful terraced rice paddies.", price: "25,000 IDR" },
      { name: "Mount Batur", desc: "Active volcano popular for sunrise treks.", price: "500,000 IDR (Tour)" }
    ],
    cuisine: ["Nasi Goreng", "Babi Guling", "Satay", "Gado-Gado"],
    activities: [
      { name: "Surfing Lessons in Canggu", price: "300k - 500k IDR" },
      { name: "Yoga Retreat in Ubud", price: "200k IDR/class" },
      { name: "Traditional Cooking Class", price: "400k - 600k IDR" }
    ],
    transport: "Renting a scooter is the most popular way to get around. Ride-hailing apps like Grab and Gojek are widely available and cheap.",
    weather: "Tropical, warm year-round. Dry season (Apr-Oct) is the best time; wet season (Nov-Mar) has frequent showers.",
    accommodation: { budget: "Tribal Hostel, Kos One", mid: "Ubud Village Resort", luxury: "Four Seasons Sayan, Ayana" },
    baseSafety: ["Do not touch or provoke the monkeys in temples.", "Only drink bottled water (Bali Belly is real).", "Wear a helmet and drive extremely carefully if renting a scooter."],
    personalization: {
      Family: { safety: ["Ensure villas have pool fences if traveling with toddlers."], activity: "Spend a day at Waterbom Bali, one of Asia's best water parks." },
      Couple: { safety: ["Be cautious of strong undercurrents at quiet southern beaches."], activity: "Enjoy a private floating breakfast in a luxury jungle villa in Ubud." }
    }
  }
};

const POPULAR_CHIPS = [
  "Goa", "Manali", "Rishikesh", "Jaipur", "Kerala", "Bali", 
  "Dubai", "Paris", "Tokyo", "New York", "Ladakh", "Andaman"
];

const TRAVELER_TYPES = ["Solo", "Couple", "Family", "Friends", "Business"];

export default function AIDestinationGuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGuide, setActiveGuide] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [travelerType, setTravelerType] = useState<string>("Solo");
  const [activeTab, setActiveTab] = useState("overview");

  // Load recents
  useEffect(() => {
    const stored = localStorage.getItem("ys_recent_guide_searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem("ys_recent_guide_searches", JSON.stringify(updated));
  };

  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    setIsLoading(true);
    setActiveGuide(null);
    setSearchQuery(term);
    saveRecentSearch(term);
    setActiveTab("overview");

    setTimeout(() => {
      const lower = term.toLowerCase().trim();
      // Match exact or partial
      const foundKey = Object.keys(MOCK_DESTINATIONS).find(k => k === lower || MOCK_DESTINATIONS[k].name.toLowerCase().includes(lower));
      
      if (foundKey) {
        setActiveGuide(MOCK_DESTINATIONS[foundKey]);
      } else {
        // Fallback fake guide
        setActiveGuide({
          name: term, country: "Global", flag: "🌍",
          image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",
          stats: { bestTime: "Varies", currency: "Local", language: "Local", timezone: "Local", safety: "Unrated" },
          overview: `Our AI is still gathering deep insights for ${term}, but it looks like a wonderful place to explore. Check back soon as we continuously update our global database with new itineraries, safety tips, and cultural insights!`,
          attractions: [], cuisine: [], activities: [], transport: "Information currently unavailable.", weather: "Check local forecasts.",
          accommodation: { budget: "TBD", mid: "TBD", luxury: "TBD" },
          baseSafety: ["Standard travel precautions apply.", "Always keep digital copies of your passport.", "Research local emergency numbers."],
          personalization: {}
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleAction = (action: string) => {
    toast.success(`${action} successful! (Demo)`, { icon: "✨" });
  };

  // Process personalized content
  const getPersonalizedSafety = () => {
    if (!activeGuide) return [];
    let tips = [...activeGuide.baseSafety];
    if (activeGuide.personalization && activeGuide.personalization[travelerType]?.safety) {
      tips = [...tips, ...activeGuide.personalization[travelerType].safety];
    }
    return tips;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      {/* ── Search Hero ── */}
      {!activeGuide && !isLoading && (
        <div className="anim-in" style={{ textAlign: "center", padding: "60px 20px", background: "var(--card)", borderRadius: 32, border: "1px solid var(--border)", marginBottom: 40, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "var(--primary-light)", borderRadius: "50%", filter: "blur(80px)", opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -100, left: -100, width: 250, height: 250, background: "rgba(29, 158, 117, 0.1)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

          <Sparkles style={{ width: 48, height: 48, color: "var(--primary)", margin: "0 auto 20px" }} />
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 16px", color: "var(--text)", letterSpacing: "-0.03em" }}>AI Destination Guides</h1>
          <p style={{ fontSize: 18, color: "var(--text2)", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Search for any city, country, or location to get a beautifully crafted, detailed travel guide generated instantly.
          </p>

          <form onSubmit={e => { e.preventDefault(); executeSearch(searchQuery); }} style={{ maxWidth: 700, margin: "0 auto 24px", position: "relative" }}>
            <Search style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, color: "var(--primary)" }} />
            <input 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Amsterdam, Tokyo, Ladakh..."
              style={{ width: "100%", padding: "24px 24px 24px 64px", fontSize: 18, borderRadius: 24, border: "2px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", boxShadow: "0 12px 40px rgba(83,74,183,0.08)" }}
            />
            <button type="submit" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "var(--primary)", color: "white", border: "none", padding: "14px 28px", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }} className="hover:scale-105">
              Generate Guide
            </button>
          </form>

          {recentSearches.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "var(--text3)", fontWeight: 600 }}>Recent:</span>
              {recentSearches.map(s => (
                <button key={s} onClick={() => executeSearch(s)} style={{ background: "transparent", border: "1px solid var(--border)", padding: "6px 16px", borderRadius: 20, fontSize: 13, color: "var(--text2)", cursor: "pointer", fontWeight: 500 }} className="hover:bg-bg2">
                  <Clock style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} /> {s}
                </button>
              ))}
            </div>
          )}

          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Popular Destinations</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 800, margin: "0 auto" }}>
              {POPULAR_CHIPS.map(chip => (
                <button key={chip} onClick={() => executeSearch(chip)} style={{ background: "var(--primary-light)", border: "none", color: "var(--primary)", padding: "10px 20px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} className="hover:-translate-y-1 hover:shadow-md">
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isLoading && (
        <div className="anim-in">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Sparkles style={{ width: 40, height: 40, color: "var(--primary)", margin: "0 auto 16px", animation: "pulse 1s infinite" }} />
            <h2 style={{ fontSize: 24, margin: 0, color: "var(--text)" }}>AI is crafting your personalized guide...</h2>
          </div>
          <div style={{ height: 400, background: "var(--card)", borderRadius: 32, border: "1px solid var(--border)", marginBottom: 24, animation: "pulse 1.5s infinite" }} />
          <div style={{ display: "flex", gap: 24 }}>
             <div style={{ flex: 1, height: 600, background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />
             <div style={{ width: 350, height: 600, background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />
          </div>
        </div>
      )}

      {/* ── Active Guide View ── */}
      {activeGuide && !isLoading && (
        <div className="anim-in">
          
          {/* Top Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <button onClick={() => { setActiveGuide(null); setSearchQuery(""); }} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> New Search
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", padding: "6px 16px", borderRadius: 12 }}>
                <User style={{ width: 14, height: 14, color: "var(--text2)" }} />
                <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>Traveling as:</span>
                <select value={travelerType} onChange={e => setTravelerType(e.target.value)} style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: 800, fontSize: 14, outline: "none", cursor: "pointer" }}>
                  {TRAVELER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleAction("Saved Guide")} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Heart style={{ width: 18, height: 18 }} /></button>
              <button onClick={() => handleAction("Shared link copied")} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Share2 style={{ width: 18, height: 18 }} /></button>
            </div>
          </div>

          {/* Hero Image & Title */}
          <div style={{ position: "relative", height: 400, borderRadius: 32, overflow: "hidden", marginBottom: 32, border: "1px solid var(--border)" }}>
            <img src={activeGuide.image} alt={activeGuide.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
            
            <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <span style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "white", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, display: "inline-block", marginBottom: 16 }}>
                  {activeGuide.flag} {activeGuide.country}
                </span>
                <h1 style={{ fontSize: 56, margin: 0, color: "white", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>{activeGuide.name}</h1>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { icon: Calendar, label: "Best Time", value: activeGuide.stats.bestTime },
              { icon: Globe2, label: "Language", value: activeGuide.stats.language },
              { icon: Navigation, label: "Timezone", value: activeGuide.stats.timezone },
              { icon: ShieldCheck, label: "Safety Rating", value: activeGuide.stats.safety, color: "var(--success)" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "var(--card)", padding: "16px 20px", borderRadius: 16, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ background: "var(--bg2)", width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon style={{ width: 18, height: 18, color: stat.color || "var(--primary)" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Layout (Sidebar + Content) */}
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Tabs Sidebar */}
            <div className="guide-tabs" style={{ width: 280, flexShrink: 0, position: "sticky", top: 100, background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 12 }}>
              {[
                { id: "overview", label: "Overview", icon: Compass },
                { id: "attractions", label: "Top Attractions", icon: MapPin },
                { id: "cuisine", label: "Local Cuisine", icon: Utensils },
                { id: "activities", label: "Activities", icon: Map },
                { id: "safety", label: "Safety Tips", icon: AlertCircle },
                { id: "logistics", label: "Logistics & Transport", icon: Bus },
              ].map(tab => (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    width: "100%", textAlign: "left", padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600, transition: "all 0.2s",
                    background: activeTab === tab.id ? "var(--primary)" : "transparent",
                    color: activeTab === tab.id ? "white" : "var(--text2)"
                  }}
                >
                  <tab.icon style={{ width: 18, height: 18, opacity: activeTab === tab.id ? 1 : 0.7 }} /> {tab.label}
                  {activeTab === tab.id && <ChevronRight style={{ width: 16, height: 16, marginLeft: "auto" }} />}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: "1 1 500px", background: "var(--card)", borderRadius: 32, border: "1px solid var(--border)", padding: 40, minHeight: 600 }}>
              
              {activeTab === "overview" && (
                <div className="anim-in">
                  <h2 style={{ fontSize: 28, margin: "0 0 24px", color: "var(--text)" }}>Welcome to {activeGuide.name}</h2>
                  <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8, marginBottom: 32 }}>{activeGuide.overview}</p>
                  
                  {activeGuide.personalization && activeGuide.personalization[travelerType]?.activity && (
                    <div style={{ background: "var(--primary-light)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", display: "flex", gap: 16 }}>
                      <Sparkles style={{ width: 24, height: 24, color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <h4 style={{ margin: "0 0 8px", fontSize: 16, color: "var(--primary)" }}>AI Suggestion for {travelerType} Travelers</h4>
                        <p style={{ margin: 0, fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{activeGuide.personalization[travelerType].activity}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "attractions" && (
                <div className="anim-in">
                  <h2 style={{ fontSize: 28, margin: "0 0 24px", color: "var(--text)" }}>Must-Visit Attractions</h2>
                  {activeGuide.attractions.length > 0 ? (
                    <div style={{ display: "grid", gap: 20 }}>
                      {activeGuide.attractions.map((attr: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 24, border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg)" }}>
                          <div>
                            <h4 style={{ fontSize: 18, margin: "0 0 6px", color: "var(--text)" }}>{attr.name}</h4>
                            <p style={{ fontSize: 14, color: "var(--text2)", margin: "0 0 8px" }}>{attr.desc}</p>
                            <span style={{ fontSize: 12, fontWeight: 700, background: "var(--card)", padding: "4px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>{attr.price}</span>
                          </div>
                          <button onClick={() => handleAction("Added to Itinerary")} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <Plus style={{ width: 16, height: 16 }} /> Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : <p>No attractions listed for this destination.</p>}
                </div>
              )}

              {activeTab === "cuisine" && (
                <div className="anim-in">
                  <h2 style={{ fontSize: 28, margin: "0 0 24px", color: "var(--text)" }}>Local Flavors</h2>
                  {activeGuide.cuisine.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                      {activeGuide.cuisine.map((dish: string, i: number) => (
                        <div key={i} style={{ background: "rgba(239, 159, 39, 0.1)", border: "1px solid rgba(239, 159, 39, 0.2)", padding: "16px 24px", borderRadius: 16, color: "#B45309", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                          <Utensils style={{ width: 18, height: 18 }} /> {dish}
                        </div>
                      ))}
                    </div>
                  ) : <p>Cuisine info unavailable.</p>}
                </div>
              )}

              {activeTab === "activities" && (
                <div className="anim-in">
                  <h2 style={{ fontSize: 28, margin: "0 0 24px", color: "var(--text)" }}>Experiences & Activities</h2>
                  {activeGuide.activities.length > 0 ? (
                    <div style={{ display: "grid", gap: 16 }}>
                      {activeGuide.activities.map((act: any, i: number) => (
                        <div key={i} style={{ padding: 20, background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ fontSize: 16, margin: 0, color: "var(--text)" }}>{act.name}</h4>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{act.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p>No activities listed.</p>}
                </div>
              )}

              {activeTab === "safety" && (
                <div className="anim-in">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <ShieldCheck style={{ width: 32, height: 32, color: "var(--success)" }} />
                    <h2 style={{ fontSize: 28, margin: 0, color: "var(--text)" }}>Safety Guidelines</h2>
                  </div>
                  
                  {travelerType !== "Solo" && (
                    <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "8px 16px", borderRadius: 12, display: "inline-block", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                      Customized for {travelerType} Travelers
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {getPersonalizedSafety().map((tip: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 20, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16 }}>
                        <div style={{ background: "var(--card)", padding: 6, borderRadius: "50%", border: "1px solid var(--border)", flexShrink: 0 }}>
                          <CheckCircle2 style={{ width: 18, height: 18, color: "var(--success)" }} />
                        </div>
                        <p style={{ margin: 0, fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "logistics" && (
                <div className="anim-in">
                  <h2 style={{ fontSize: 28, margin: "0 0 24px", color: "var(--text)" }}>Logistics & Transport</h2>
                  
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Clock style={{ width: 20, height: 20, color: "var(--primary)" }} /> Weather & Seasons</h3>
                    <p style={{ background: "var(--bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", lineHeight: 1.6 }}>{activeGuide.weather}</p>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Bus style={{ width: 20, height: 20, color: "var(--primary)" }} /> Getting Around</h3>
                    <p style={{ background: "var(--bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", lineHeight: 1.6 }}>{activeGuide.transport}</p>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Bed style={{ width: 20, height: 20, color: "var(--primary)" }} /> Accommodation Areas</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                      {Object.entries(activeGuide.accommodation).map(([level, name]) => (
                        <div key={level} style={{ background: "var(--bg)", padding: 16, borderRadius: 16, border: "1px solid var(--border)" }}>
                          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text3)", margin: "0 0 4px" }}>{level}</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{String(name)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Helper CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .guide-tabs {
            width: 100% !important;
            position: static !important;
            display: flex;
            overflow-x: auto;
            padding: 8px !important;
          }
          .guide-tabs button {
            white-space: nowrap;
            padding: 10px 16px !important;
          }
          .guide-tabs button svg:last-child {
            display: none;
          }
        }
      `}} />
    </div>
  );
}
