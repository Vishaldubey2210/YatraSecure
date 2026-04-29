"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  User, ShieldCheck, MapPin, Settings, Camera, AlertTriangle, 
  Trash2, Plus, Info, Save, RotateCcw, Heart, Briefcase, Smile
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types & Defaults ---
interface Contact { id: string; name: string; phone: string; relation: string; }

interface ProfileData {
  username: string; age: string; gender: string; bio: string; email: string;
  quickPicks: string[]; customInterests: string[]; personality: string;
  travelStyles: string[]; groupPrefs: string[]; minBudget: string; maxBudget: string; destinations: string[];
  isVerified: boolean; contacts: Contact[];
  city: string; state: string; phone: string; languages: string[];
}

const DEFAULT_DATA: ProfileData = {
  username: "TestTest", age: "", gender: "", bio: "", email: "test123@gmail.com",
  quickPicks: [], customInterests: [], personality: "",
  travelStyles: [], groupPrefs: [], minBudget: "0", maxBudget: "50000", destinations: [],
  isVerified: false, contacts: [],
  city: "", state: "", phone: "", languages: []
};

const QUICK_PICKS = [
  "Photography", "Trekking", "Food", "History", "Music", "Art", 
  "Beach", "Mountains", "Wildlife", "Temples", "Nightlife", 
  "Shopping", "Yoga", "Camping", "Road Trips", "Volunteering"
];

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'interests', label: 'Interests', icon: Heart },
  { id: 'travel', label: 'Travel Prefs', icon: Briefcase },
  { id: 'safety', label: 'Safety', icon: ShieldCheck },
  { id: 'location', label: 'Location', icon: MapPin },
];

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA);
  const [savedData, setSavedData] = useState<ProfileData>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState('basic');
  const [isClient, setIsClient] = useState(false);
  
  // Modals / Inputs
  const [customTagInput, setCustomTagInput] = useState("");
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("ys_profile_data");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setSavedData(parsed);
    }
  }, []);

  // --- Calculations ---
  const { completionPercent, missingCount } = useMemo(() => {
    let filled = 0;
    const totalFields = 12; // Key fields to check
    if (data.username) filled++;
    if (data.age) filled++;
    if (data.gender) filled++;
    if (data.bio) filled++;
    if (data.quickPicks.length > 0 || data.customInterests.length > 0) filled++;
    if (data.personality) filled++;
    if (data.travelStyles.length > 0) filled++;
    if (data.groupPrefs.length > 0) filled++;
    if (data.isVerified) filled++;
    if (data.contacts.length > 0) filled++;
    if (data.city) filled++;
    if (data.phone) filled++;

    return { 
      completionPercent: Math.round((filled / totalFields) * 100),
      missingCount: totalFields - filled
    };
  }, [data]);

  const reputationScore = useMemo(() => {
    let base = 50;
    base += Math.floor((completionPercent / 100) * 300); // Up to 300 from completion
    if (data.isVerified) base += 200; // 200 from verification
    return base;
  }, [completionPercent, data.isVerified]);

  const badgeLevel = reputationScore >= 400 ? "Gold" : reputationScore >= 200 ? "Silver" : "Bronze";

  // --- Actions ---
  const updateData = (key: keyof ProfileData, value: any) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const p = toast.loading("Saving profile...");
    setTimeout(() => {
      localStorage.setItem("ys_profile_data", JSON.stringify(data));
      setSavedData(data);
      toast.success("Profile updated successfully", { id: p });
    }, 600);
  };

  const handleReset = () => {
    setData(savedData);
    toast("Changes discarded", { icon: "🔄" });
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const tag = customTagInput.trim();
    if (!tag) return;
    if (data.customInterests.includes(tag)) { toast.error("Tag already exists"); return; }
    if (data.customInterests.length >= 20) { toast.error("Max 20 custom tags allowed"); return; }
    
    updateData("customInterests", [...data.customInterests, tag]);
    setCustomTagInput("");
  };

  const removeTag = (tag: string) => {
    updateData("customInterests", data.customInterests.filter(t => t !== tag));
  };

  const toggleArrayItem = (key: 'quickPicks' | 'travelStyles' | 'groupPrefs', item: string) => {
    const arr = data[key];
    if (arr.includes(item)) updateData(key, arr.filter(i => i !== item));
    else {
      // Logic: Warning if selecting Budget and Luxury
      if (key === 'travelStyles' && ((item === 'Budget' && arr.includes('Luxury')) || (item === 'Luxury' && arr.includes('Budget')))) {
        toast("Warning: Budget and Luxury selected together", { icon: "⚠️" });
      }
      updateData(key, [...arr, item]);
    }
  };

  const verifyProfileMock = () => {
    const p = toast.loading("Verifying documents...");
    setTimeout(() => {
      updateData("isVerified", true);
      setVerificationModalOpen(false);
      toast.success("Profile verified successfully!", { id: p });
    }, 1500);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) { toast.error("Name and phone required"); return; }
    if (data.contacts.length >= 3) { toast.error("Max 3 contacts allowed"); return; }
    
    updateData("contacts", [...data.contacts, { ...newContact, id: Date.now().toString() }]);
    setNewContact({ name: "", phone: "", relation: "" });
    setContactModalOpen(false);
    toast.success("Contact added");
  };

  if (!isClient) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 100, color: "var(--text)" }}>
      
      {/* ── Global Header ── */}
      <div className="anim-in" style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 32, marginBottom: 32, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800, color: "var(--primary)" }}>
            {data.username.charAt(0).toUpperCase()}
          </div>
          <button onClick={() => toast("File picker opened", {icon:"📸"})} style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", border: "4px solid var(--card)", color: "white", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Camera style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>{data.username}</h1>
            <span style={{ background: badgeLevel === 'Gold' ? "rgba(234, 179, 8, 0.1)" : badgeLevel === 'Silver' ? "rgba(148, 163, 184, 0.2)" : "rgba(180, 83, 9, 0.1)", color: badgeLevel === 'Gold' ? "#CA8A04" : badgeLevel === 'Silver' ? "#64748B" : "#B45309", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontWeight: 800 }}>
              {badgeLevel} Traveler
            </span>
            {data.isVerified && <ShieldCheck style={{ color: "var(--success)", width: 24, height: 24 }} />}
          </div>
          
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase" }}>AI Reputation</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--primary)" }}>{reputationScore} <span style={{ fontSize: 14, color: "var(--text3)" }}>/ 1000</span></p>
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase" }}>Completion</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: completionPercent === 100 ? "var(--success)" : "var(--text)" }}>{completionPercent}%</p>
            </div>
          </div>

          <div style={{ width: "100%", height: 8, background: "var(--bg2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionPercent}%`, background: completionPercent === 100 ? "var(--success)" : "var(--primary)", transition: "width 0.5s ease" }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text2)" }}>
            {completionPercent === 100 ? "Your profile is fully complete! You get maximum visibility." : `Complete your profile to unlock better matches. ${missingCount} fields remaining.`}
          </p>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Sidebar Tabs */}
        <div className="profile-tabs" style={{ width: 240, flexShrink: 0, background: "var(--card)", padding: 12, borderRadius: 20, border: "1px solid var(--border)", position: "sticky", top: 100 }}>
          {TABS.map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600, transition: "all 0.2s", background: activeTab === tab.id ? "var(--primary)" : "transparent", color: activeTab === tab.id ? "white" : "var(--text2)" }}
            >
              <tab.icon style={{ width: 18, height: 18, opacity: activeTab === tab.id ? 1 : 0.7 }} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ flex: "1 1 500px", background: "var(--card)", padding: 32, borderRadius: 24, border: "1px solid var(--border)", minHeight: 500 }}>
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="anim-in form-section">
              <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Basic Information</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  Username
                  <input type="text" value={data.username} onChange={e => updateData('username', e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  Email Address
                  <input type="email" value={data.email} disabled style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text3)", cursor: "not-allowed" }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  Age
                  <input type="number" min="18" max="100" value={data.age} onChange={e => updateData('age', e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  Gender
                  <select value={data.gender} onChange={e => updateData('gender', e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                Bio <span style={{ color: "var(--text3)", fontWeight: 400 }}>({data.bio.length}/500)</span>
                <textarea rows={4} maxLength={500} value={data.bio} onChange={e => updateData('bio', e.target.value)} placeholder="Tell other travelers about yourself..." style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)", resize: "none" }} />
              </label>
            </div>
          )}

          {/* TAB 2: INTERESTS */}
          {activeTab === 'interests' && (
            <div className="anim-in form-section">
              <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Interests & Personality</h2>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Personality Type</h3>
                <div style={{ display: "flex", gap: 16 }}>
                  {["Introvert", "Extrovert", "Ambivert"].map(p => (
                    <label key={p} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", borderRadius: 12, border: data.personality === p ? "2px solid var(--primary)" : "1px solid var(--border)", background: data.personality === p ? "var(--primary-light)" : "var(--bg)", cursor: "pointer", fontWeight: 600 }}>
                      <input type="radio" name="personality" value={p} checked={data.personality === p} onChange={e => updateData('personality', e.target.value)} style={{ display: "none" }} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Quick Picks</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {QUICK_PICKS.map(p => {
                    const isSel = data.quickPicks.includes(p);
                    return (
                      <button key={p} onClick={() => toggleArrayItem('quickPicks', p)} style={{ background: isSel ? "var(--primary)" : "var(--bg)", color: isSel ? "white" : "var(--text2)", border: isSel ? "1px solid var(--primary)" : "1px solid var(--border)", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Custom Interests <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 400 }}>({data.customInterests.length}/20)</span></h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <input type="text" value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type a custom interest and press Enter..." style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                  <button onClick={handleAddTag} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", padding: "0 24px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Add</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {data.customInterests.map(tag => (
                    <span key={tag} style={{ background: "var(--bg2)", padding: "6px 12px", borderRadius: 16, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {tag} <Trash2 style={{ width: 14, height: 14, cursor: "pointer", color: "var(--danger)" }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAVEL PREFERENCES */}
          {activeTab === 'travel' && (
            <div className="anim-in form-section">
              <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Travel Preferences</h2>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Travel Style</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {["Budget", "Mid-range", "Luxury", "Backpacking"].map(style => {
                    const isSel = data.travelStyles.includes(style);
                    return (
                      <label key={style} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: isSel ? "var(--primary-light)" : "var(--bg)", cursor: "pointer" }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleArrayItem('travelStyles', style)} style={{ width: 18, height: 18 }} />
                        <span style={{ fontWeight: 600, color: isSel ? "var(--primary)" : "var(--text)" }}>{style}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Group Size Preference</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {["Solo", "Small Group", "Large Adventure"].map(g => {
                    const isSel = data.groupPrefs.includes(g);
                    return (
                      <label key={g} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: isSel ? "var(--primary)" : "var(--bg)", color: isSel ? "white" : "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleArrayItem('groupPrefs', g)} style={{ display: "none" }} />
                        {g}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Ideal Trip Budget Range (₹)</h3>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                    Min Budget
                    <input type="number" value={data.minBudget} onChange={e => updateData('minBudget', e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                  </label>
                  <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                    Max Budget
                    <input type="number" value={data.maxBudget} onChange={e => updateData('maxBudget', e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY */}
          {activeTab === 'safety' && (
            <div className="anim-in form-section">
              <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Safety & Verification</h2>

              <div style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg)", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    ID Verification {data.isVerified ? <ShieldCheck style={{ color: "var(--success)", width: 20, height: 20 }} /> : <AlertTriangle style={{ color: "var(--warning)", width: 20, height: 20 }} />}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text2)" }}>
                    {data.isVerified ? "Your identity is verified. You have higher trust scores." : "Verify your identity to increase your Reputation Score by 200 points."}
                  </p>
                </div>
                {!data.isVerified && (
                  <button onClick={() => setVerificationModalOpen(true)} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Verify Now</button>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, margin: 0 }}>Emergency Contacts</h3>
                  <button onClick={() => setContactModalOpen(true)} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus style={{ width: 16, height: 16 }} /> Add Contact
                  </button>
                </div>
                
                {data.contacts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, border: "1px dashed var(--border)", borderRadius: 16 }}>
                    <p style={{ color: "var(--text3)", margin: 0 }}>No emergency contacts added yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.contacts.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)" }}>
                        <div>
                          <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{c.name} <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>• {c.relation}</span></p>
                          <p style={{ margin: 0, fontSize: 14, color: "var(--text2)" }}>{c.phone}</p>
                        </div>
                        <button onClick={() => updateData('contacts', data.contacts.filter(x => x.id !== c.id))} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                          <Trash2 style={{ width: 18, height: 18 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === 'location' && (
            <div className="anim-in form-section">
              <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Location & Contact</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  City
                  <input type="text" value={data.city} onChange={e => updateData('city', e.target.value)} placeholder="e.g. Mumbai" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>
                  State
                  <input type="text" value={data.state} onChange={e => updateData('state', e.target.value)} placeholder="e.g. Maharashtra" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
                Phone Number
                <input type="tel" value={data.phone} onChange={e => updateData('phone', e.target.value)} placeholder="+91 9876543210" style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Action Bar ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card)", borderTop: "1px solid var(--border)", padding: "16px 32px", display: "flex", justifyContent: "center", gap: 16, zIndex: 50, boxShadow: "0 -10px 40px rgba(0,0,0,0.05)" }}>
        <button onClick={handleReset} style={{ background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "12px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <RotateCcw style={{ width: 18, height: 18 }} /> Cancel
        </button>
        <button onClick={handleSave} style={{ background: "var(--primary)", color: "white", border: "none", padding: "12px 48px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(29, 158, 117, 0.4)" }}>
          <Save style={{ width: 18, height: 18 }} /> Save All Changes
        </button>
      </div>

      {/* ── Modals ── */}
      {isVerificationModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={() => setVerificationModalOpen(false)}>
          <div style={{ background: "var(--card)", borderRadius: 20, width: "100%", maxWidth: 400, padding: 32, border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>Verify Identity</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Upload your Aadhar or PAN card to get the verified badge and unlock high-trust trips.</p>
            <div style={{ border: "2px dashed var(--border)", borderRadius: 16, padding: 40, textAlign: "center", cursor: "pointer", marginBottom: 24, background: "var(--bg)" }}>
               <ShieldCheck style={{ width: 32, height: 32, color: "var(--text3)", margin: "0 auto 12px" }} />
               <p style={{ margin: 0, fontWeight: 600, color: "var(--text2)" }}>Click to upload document</p>
            </div>
            <button onClick={verifyProfileMock} style={{ width: "100%", background: "var(--primary)", color: "white", padding: 14, borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}>Submit for Verification</button>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={() => setContactModalOpen(false)}>
          <div style={{ background: "var(--card)", borderRadius: 20, width: "100%", maxWidth: 400, padding: 32, border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, margin: "0 0 24px" }}>Add Emergency Contact</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <input type="text" placeholder="Full Name" value={newContact.name} onChange={e => setNewContact(prev => ({...prev, name: e.target.value}))} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
              <input type="tel" placeholder="Phone Number" value={newContact.phone} onChange={e => setNewContact(prev => ({...prev, phone: e.target.value}))} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
              <input type="text" placeholder="Relationship (e.g. Mother)" value={newContact.relation} onChange={e => setNewContact(prev => ({...prev, relation: e.target.value}))} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", outline: "none", color: "var(--text)" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setContactModalOpen(false)} style={{ flex: 1, background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: 14, borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={addContact} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", padding: 14, borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Helper CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .profile-tabs { width: 100% !important; position: static !important; display: flex; overflow-x: auto; padding: 8px !important; }
          .profile-tabs button { white-space: nowrap; padding: 10px 16px !important; }
        }
      `}} />
    </div>
  );
}
