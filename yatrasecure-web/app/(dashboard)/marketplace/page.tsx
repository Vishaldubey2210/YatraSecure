"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, Star, MapPin, CheckCircle2, ShieldCheck, 
  TrendingUp, Compass, Heart
} from "lucide-react";
import toast from "react-hot-toast";

type Experience = {
  id: string; title: string; location: string; price: number; 
  rating: number; provider: string; image: string; type: string;
};

const INITIAL_MOCK_EXPERIENCES: Experience[] = [
  { id: "e1", title: "Old Delhi Heritage Food Walk", location: "Delhi", price: 1500, rating: 4.8, provider: "Delhi By Foot", type: "Food Trail", image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1" },
  { id: "e2", title: "Sunrise Himalayan Trek", location: "Manali", price: 3500, rating: 4.9, provider: "Peak Adventures", type: "Trekking", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" },
  { id: "e3", title: "3-Day Ayurvedic Yoga Retreat", location: "Kerala", price: 12000, rating: 4.7, provider: "Veda Wellness", type: "Wellness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b" },
  { id: "e4", title: "Desert Safari & Cultural Camp", location: "Jaisalmer", price: 4500, rating: 4.6, provider: "Royal Sands", type: "Adventure", image: "https://images.unsplash.com/photo-1534008897995-27a23e859048" }
];

export default function MarketplacePage() {
  const [experiences, setExperiences] = useState<Experience[]>(INITIAL_MOCK_EXPERIENCES);
  
  // Provider Form State
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [provName, setProvName] = useState("");
  const [bizName, setBizName] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expPrice, setExpPrice] = useState("");
  const [expLocation, setExpLocation] = useState("");

  useEffect(() => {
    // Load custom providers from localStorage
    const saved = localStorage.getItem("yatra_marketplace_providers");
    if (saved) {
      const customExps = JSON.parse(saved);
      setExperiences(prev => [...prev, ...customExps]);
    }
  }, []);

  const handleBook = (exp: Experience) => {
    toast.success(`Booking request sent for ${exp.title}!`, { icon: "✅" });
  };

  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName || !bizName || !expTitle || !expPrice || !expLocation) {
      toast.error("Please fill all fields");
      return;
    }

    const newExp: Experience = {
      id: Date.now().toString(),
      title: expTitle,
      location: expLocation,
      price: parseInt(expPrice),
      rating: 5.0, // New providers start with 5 stars in our mock
      provider: bizName,
      type: "Custom",
      image: "https://images.unsplash.com/photo-1522878129833-838a904a0e9e" // Fallback image
    };

    // Save to local state
    setExperiences(prev => [...prev, newExp]);

    // Save to localStorage
    const saved = localStorage.getItem("yatra_marketplace_providers");
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem("yatra_marketplace_providers", JSON.stringify([...existing, newExp]));

    // Reset
    setShowProviderForm(false);
    setProvName(""); setBizName(""); setExpTitle(""); setExpPrice(""); setExpLocation("");
    toast.success("Successfully registered as a Verified Provider! Your experience is now live.", { icon: "🎉" });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      {/* ── Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 12 }}>
            <Store style={{ color: "var(--primary)", width: 32, height: 32 }} /> YatraSecure Marketplace
          </h1>
          <p style={{ color: "var(--text2)", margin: 0, fontSize: 16, maxWidth: 600 }}>
            Discover and book verified local experiences, or become a provider to offer your own unique adventures to the community.
          </p>
        </div>
        <button onClick={() => setShowProviderForm(!showProviderForm)} style={{ background: showProviderForm ? "var(--bg2)" : "var(--primary)", color: showProviderForm ? "var(--text)" : "white", border: showProviderForm ? "1px solid var(--border)" : "none", padding: "14px 24px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck style={{ width: 18, height: 18 }} /> {showProviderForm ? "Cancel Registration" : "Become a Provider"}
        </button>
      </div>

      {/* ── Provider Form (Conditional) ── */}
      {showProviderForm && (
        <div className="anim-in" style={{ background: "var(--card)", padding: 32, borderRadius: 24, border: "2px solid var(--primary)", marginBottom: 40, boxShadow: "0 10px 30px rgba(29, 158, 117, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <ShieldCheck style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>Verified Provider Registration</h2>
              <p style={{ color: "var(--text3)", margin: 0 }}>Join our network of trusted local guides and businesses.</p>
            </div>
          </div>

          <form onSubmit={handleProviderSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <input required value={provName} onChange={e => setProvName(e.target.value)} placeholder="Your Full Name" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            <input required value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Business/Agency Name" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            <input required value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="Experience Title (e.g. Sunset Boat Ride)" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15, gridColumn: "1 / -1" }} />
            <input required value={expLocation} onChange={e => setExpLocation(e.target.value)} placeholder="Location (City)" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            <input required type="number" value={expPrice} onChange={e => setExpPrice(e.target.value)} placeholder="Price per person (₹)" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            
            <button type="submit" style={{ gridColumn: "1 / -1", background: "var(--primary)", color: "white", border: "none", padding: "16px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 8 }}>
              Submit & Publish Experience
            </button>
          </form>
        </div>
      )}

      {/* ── Experiences Grid ── */}
      <h2 style={{ fontSize: 24, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingUp style={{ color: "var(--primary)" }} /> Top Rated Experiences
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {experiences.map(exp => (
          <div key={exp.id} className="anim-in hover:shadow-lg hover:-translate-y-1" style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s" }}>
            
            <div style={{ height: 180, position: "relative" }}>
              <img src={exp.image} alt={exp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                {exp.type}
              </div>
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255, 255, 255, 0.9)", color: "var(--text)", padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                <Star style={{ width: 12, height: 12, color: "#D97706", fill: "#D97706" }} /> {exp.rating}
              </div>
            </div>
            
            <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text2)", fontSize: 13, marginBottom: 8 }}>
                <MapPin style={{ width: 14, height: 14 }} /> {exp.location}
              </div>
              <h3 style={{ fontSize: 18, margin: "0 0 12px", fontWeight: 800, lineHeight: 1.3 }}>{exp.title}</h3>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck style={{ width: 14, height: 14, color: "var(--primary)" }} /> Verified Provider: {exp.provider}
              </p>
              
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>Price</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--success)" }}>₹{exp.price.toLocaleString()}</p>
                </div>
                <button onClick={() => handleBook(exp)} style={{ background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }} className="hover:bg-primary hover:text-white transition-colors">
                  Book Now
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
