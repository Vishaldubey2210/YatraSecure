"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, Route, Calendar, Wallet, Users, FileText, 
  Image as ImageIcon, X, UploadCloud, Shield, CheckCircle2, ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";

const TRIP_TYPES = ["Group", "Solo", "Family", "Adventure", "Pilgrimage", "Business"];

export default function CreateTripPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [tripType, setTripType] = useState("Group");
  const [maxMembers, setMaxMembers] = useState("8");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  
  // Image State
  const [imageBase64, setImageBase64] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !destination || !route || !startDate || !endDate || !budget || !description) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newTrip = {
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        destination,
        route,
        startDate,
        endDate,
        budget: parseInt(budget),
        tripType,
        maxMembers: parseInt(maxMembers),
        description,
        imageBase64: imageBase64 || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // Fallback image
        privacy,
        createdBy: "TestTest", // Mock logged-in user
        createdAt: new Date().toISOString(),
        members: []
      };

      // Get existing
      const existingStr = localStorage.getItem("yatra_trips");
      const existingTrips = existingStr ? JSON.parse(existingStr) : [];
      
      // Save
      existingTrips.push(newTrip);
      localStorage.setItem("yatra_trips", JSON.stringify(existingTrips));

      toast.success("Trip created successfully!");
      router.push("/my-trips");
    }, 800);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>Create New Trip</h1>
          <p style={{ color: "var(--text2)", margin: 0, fontSize: 15 }}>Plan your next adventure and invite fellow travelers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 40 }}>
        
        {/* Basic Info */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><MapPin style={{ color: "var(--primary)" }} /> Trip Details</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Trip Title *
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Goa Beach Escape" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                Destination *
                <input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Goa" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                Route *
                <div style={{ position: "relative" }}>
                  <Route style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "var(--text3)" }} />
                  <input required value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g. Delhi → Goa" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Logistics */}
        <div style={{ marginBottom: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Calendar style={{ color: "var(--primary)" }} /> Dates & Logistics</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Start Date *
              <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              End Date *
              <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Estimated Budget (per person) *
              <div style={{ position: "relative" }}>
                <Wallet style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "var(--text3)" }} />
                <input required type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 15000" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
              </div>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Max Members *
              <div style={{ position: "relative" }}>
                <Users style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "var(--text3)" }} />
                <input required type="number" min="2" max="20" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }} />
              </div>
            </label>
          </div>
        </div>

        {/* Categorization & Privacy */}
        <div style={{ marginBottom: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Shield style={{ color: "var(--primary)" }} /> Trip Preferences</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Trip Type *
              <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15 }}>
                {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
              Privacy *
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, border: privacy === "public" ? "2px solid var(--primary)" : "1px solid var(--border)", background: privacy === "public" ? "var(--primary-light)" : "var(--bg)", cursor: "pointer" }}>
                  <input type="radio" name="privacy" value="public" checked={privacy === "public"} onChange={() => setPrivacy("public")} style={{ display: "none" }} />
                  {privacy === "public" ? <CheckCircle2 style={{ width: 18, color: "var(--primary)" }} /> : <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--text3)" }} />}
                  <span style={{ fontWeight: 700, color: privacy === "public" ? "var(--primary)" : "var(--text)" }}>Public</span>
                </label>
                <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, border: privacy === "private" ? "2px solid var(--primary)" : "1px solid var(--border)", background: privacy === "private" ? "var(--primary-light)" : "var(--bg)", cursor: "pointer" }}>
                  <input type="radio" name="privacy" value="private" checked={privacy === "private"} onChange={() => setPrivacy("private")} style={{ display: "none" }} />
                  {privacy === "private" ? <CheckCircle2 style={{ width: 18, color: "var(--primary)" }} /> : <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--text3)" }} />}
                  <span style={{ fontWeight: 700, color: privacy === "private" ? "var(--primary)" : "var(--text)" }}>Private</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Description */}
        <div style={{ marginBottom: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><FileText style={{ color: "var(--primary)" }} /> Description & Media</h2>
          
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            Trip Description *
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what the trip is about, what's included, and any rules..." style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", fontSize: 15, resize: "vertical" }} />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
            Trip Cover Image (Optional)
            
            {imageBase64 ? (
              <div style={{ position: "relative", width: "100%", height: 250, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={imageBase64} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={removeImage} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }} className="hover:bg-danger">
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", height: 200, border: "2px dashed var(--border)", borderRadius: 16, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                className="hover:border-primary hover:bg-primary-light"
              >
                <UploadCloud style={{ width: 40, height: 40, color: "var(--primary)", marginBottom: 12 }} />
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Click to upload an image</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text3)" }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", gap: 16, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: 16, borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" style={{ flex: 2, background: "var(--primary)", color: "white", border: "none", padding: 16, borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(29, 158, 117, 0.4)" }} disabled={isLoading}>
            {isLoading ? "Creating Trip..." : "Create Trip"}
          </button>
        </div>

      </form>
    </div>
  );
}
