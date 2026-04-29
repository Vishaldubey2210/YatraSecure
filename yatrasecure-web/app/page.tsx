"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, UserCheck, MessageCircle, Wallet, Map, Bot, Lock,
  Star, Play, CheckCircle, ShieldCheck, HelpCircle,
  Menu, X, Search, UserPlus, Youtube, X as XIcon, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

// --- Static Data ---
const features = [
  { icon: UserCheck, title: "Verified Travelers Only", desc: "ID & phone verified. No fake profiles." },
  { icon: Map, title: "Live Trip Tracking", desc: "Real-time location sharing & interactive map." },
  { icon: Bot, title: "AI Matchmaking", desc: "Find compatible travel buddies based on your style." },
  { icon: Wallet, title: "Shared Group Wallet", desc: "Split bills equally, log expenses, settle up." },
  { icon: MessageCircle, title: "Real-Time Group Chat", desc: "Share photos, plans, updates – all in one place." },
  { icon: Lock, title: "Bank-Grade Security", desc: "Enterprise encryption for your data & payments." },
];

const testimonials = [
  { name: "Priya, Delhi", text: "Planned a Goa trip with 6 strangers. YatraSecure made safety and expenses so easy!", rating: 5, avatar: "https://i.pravatar.cc/150?u=priya" },
  { name: "Amit, Mumbai", text: "The AI matchmaking found me trekking buddies who were perfect. Best travel decision.", rating: 5, avatar: "https://i.pravatar.cc/150?u=amit" },
  { name: "Sneha, Bangalore", text: "Emergency SOS feature gave my parents peace of mind. Highly recommend.", rating: 5, avatar: "https://i.pravatar.cc/150?u=sneha" },
];

const publicTrips = [
  { id: 1, name: "Manali Trek", dates: "10-15 Jul", spots: "4 spots left", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80" },
  { id: 2, name: "Goa Beach Escape", dates: "20-24 Jul", spots: "6 travelers", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" },
  { id: 3, name: "Coorg Forest Camp", dates: "15-18 Sep", spots: "8 spots left", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80" },
  { id: 4, name: "Rishikesh Adventure", dates: "12-19 Aug", spots: "3 spots left", img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80" },
  { id: 5, name: "Lonavala Weekend", dates: "1-3 Sep", spots: "5 travelers", img: "https://images.unsplash.com/photo-1444228308431-7bd517d66ce1?w=600&q=80" },
  { id: 6, name: "Varanasi Ganges Tour", dates: "17-22 Sep", spots: "2 spots left", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80" },
];

const howItWorks = [
  { icon: UserPlus, title: "Create an Account", desc: "Sign up free and verify your profile." },
  { icon: Search, title: "Find or Build a Trip", desc: "Join public trips or create a private one." },
  { icon: MessageCircle, title: "Connect & Plan", desc: "Chat with verified members and share itineraries." },
  { icon: Wallet, title: "Split & Settle", desc: "Manage all group expenses securely on the go." },
];

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCookieConsentVisible, setIsCookieConsentVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers
  const handleAuthSubmit = (e: React.FormEvent, type: "login" | "signup") => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (type === "signup") setIsSignupModalOpen(false);
      else setIsLoginModalOpen(false);
      toast.success(type === "signup" ? "Account created successfully!" : "Logged in successfully!");
      console.log(`Mock ${type} API called`);
      router.push('/dashboard');
    }, 1000);
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      {/* ─── STYLES ───────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: #0F7B3A;
          --primary-hover: #0D6932;
          --secondary: #0066CC;
          --bg-white: #FFFFFF;
          --bg-alt: #F8FAFC;
          --text-dark: #1E293B;
          --text-muted: #64748B;
          --font-heading: 'Poppins', sans-serif;
          --font-body: 'Inter', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); color: var(--text-dark); line-height: 1.5; background: var(--bg-white); }
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: 700; color: var(--text-dark); }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .section-padding { padding: 80px 0; }
        @media (max-width: 768px) { .section-padding { padding: 48px 0; } }

        /* Buttons */
        .btn { display: inline-flex; justify-content: center; alignItems: center; gap: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 16px; border-radius: 40px; padding: 12px 28px; text-decoration: none; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); }
        .btn-secondary { background: transparent; border: 2px solid var(--secondary); color: var(--secondary); }
        .btn-secondary:hover { background: rgba(0,102,204,0.05); transform: translateY(-2px); }
        
        /* Cards */
        .card { background: white; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.05); padding: 24px; transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.03); }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }

        /* Inputs */
        .form-input { width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #CBD5E1; margin-bottom: 16px; font-family: var(--font-body); font-size: 15px; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--primary); }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 16px; }
        .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 480px; padding: 32px; position: relative; max-height: 90vh; overflow-y: auto; }
        .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; color: var(--text-muted); }
      `}} />

      {/* ─── STICKY HEADER ──────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: isScrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: isScrolled ? "blur(10px)" : "none",
        boxShadow: isScrolled ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
        transition: "all 0.3s ease",
        padding: "16px 0"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: isScrolled ? "var(--text-dark)" : "white", fontFamily: "var(--font-heading)" }}>
              YatraSecure
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "none" }} className="md-flex gap-8">
            <style>{`
              @media (min-width: 768px) { .md-flex { display: flex !important; } }
            `}</style>
            {["Features", "How It Works", "Explore", "FAQ"].map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, "-"))} style={{ 
                background: "none", border: "none", cursor: "pointer", 
                fontSize: 16, fontWeight: 500, color: isScrolled ? "var(--text-dark)" : "rgba(255,255,255,0.9)",
                fontFamily: "var(--font-body)"
              }}>
                {item}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div style={{ display: "none", alignItems: "center", gap: 16 }} className="md-flex">
            <button onClick={() => setIsLoginModalOpen(true)} className="btn btn-secondary" style={{ padding: "8px 24px", color: isScrolled ? "var(--secondary)" : "white", borderColor: isScrolled ? "var(--secondary)" : "white" }}>
              Login
            </button>
            <button onClick={() => setIsSignupModalOpen(true)} className="btn btn-primary" style={{ padding: "8px 24px" }}>
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setIsMenuOpen(true)} style={{ display: "block", background: "none", border: "none", color: isScrolled ? "var(--text-dark)" : "white", cursor: "pointer" }} className="md-hidden">
            <style>{`
              @media (min-width: 768px) { .md-hidden { display: none !important; } }
            `}</style>
            <Menu style={{ width: 28, height: 28 }} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "280px", background: "white", padding: 24, display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsMenuOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}>
              <X style={{ width: 24, height: 24, color: "var(--text-dark)" }} />
            </button>
            {["Features", "How It Works", "Explore", "FAQ"].map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, "-"))} style={{ background: "none", border: "none", textAlign: "left", fontSize: 18, fontWeight: 600, padding: "12px 0", color: "var(--text-dark)", borderBottom: "1px solid #E2E8F0" }}>
                {item}
              </button>
            ))}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => { setIsMenuOpen(false); setIsLoginModalOpen(true); }} className="btn btn-secondary">Login</button>
              <button onClick={() => { setIsMenuOpen(false); setIsSignupModalOpen(true); }} className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HERO SECTION ───────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 80,
        background: `url('https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1600&q=80') center/cover no-repeat`
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", color: "white", lineHeight: 1.1, marginBottom: 24 }}>
            Travel Together, Stay Safe
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.9)", maxWidth: 700, margin: "0 auto 40px", fontWeight: 400 }}>
            Plan group trips with verified travelers. Real-time chat, shared wallet, and smart expense splitting — everything in one secure place.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 48 }}>
            <button onClick={() => setIsSignupModalOpen(true)} className="btn btn-primary">
              Start Your Journey – Free <ChevronRight style={{ width: 18, height: 18, marginLeft: 4 }} />
            </button>
            <button onClick={() => setIsVideoModalOpen(true)} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "white" }}>
              <Play style={{ width: 18, height: 18, marginRight: 8, fill: "white" }} /> Watch Demo
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
            {[
              { icon: ShieldCheck, text: "Verified community" },
              { icon: CheckCircle, text: "No credit card required" },
              { icon: Star, text: "Free forever" }
            ].map((badge, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontSize: 14, fontWeight: 600 }}>
                <badge.icon style={{ width: 18, height: 18, color: "var(--primary)" }} /> {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST & SAFETY BANNER ────────────────────────────── */}
      <div style={{ background: "var(--text-dark)", padding: "20px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20 }}>
          {[
            { text: "100% verified travelers", icon: "🔒" },
            { text: "24/7 emergency support", icon: "🆘" },
            { text: "Live location sharing", icon: "📍" }
          ].map((item, i) => (
            <div key={i} style={{ color: "white", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES GRID ──────────────────────────────────────── */}
      <section id="features" className="section-padding" style={{ background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 16 }}>Everything for a Safe Group Trip</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 18 }}>Built for modern explorers who want transparency and zero drama.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {features.map((feature, i) => (
              <div key={i} className="card">
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(15,123,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <feature.icon style={{ width: 28, height: 28, color: "var(--primary)" }} />
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{feature.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="section-padding" style={{ background: "var(--bg-white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>From Sign Up to Takeoff</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, position: "relative" }}>
            <style>{`
              @media (min-width: 1024px) {
                .step-connector::after { content: ''; position: absolute; top: 40px; left: calc(50% + 40px); width: calc(100% - 80px); height: 2px; background: #E2E8F0; z-index: 0; }
                .step-connector:last-child::after { display: none; }
              }
            `}</style>
            {howItWorks.map((step, i) => (
              <div key={i} className="step-connector" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", position: "relative", zIndex: 2 }}>
                  <step.icon style={{ width: 32, height: 32, color: "var(--primary)" }} />
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPLORE PUBLIC TRIPS ───────────────────────────────── */}
      <section id="explore" className="section-padding" style={{ background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 16 }}>Explore Public Trips</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 18 }}>Join verified travelers on upcoming adventures.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {publicTrips.map(trip => (
              <div key={trip.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <img src={trip.img} alt={trip.name} loading="lazy" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 20, marginBottom: 12 }}>{trip.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin style={{ width: 16, height: 16 }} /> {trip.dates}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><UserCheck style={{ width: 16, height: 16 }} /> {trip.spots}</span>
                  </div>
                  <button onClick={() => toast("Trip details page coming soon.", { icon: "ℹ️" })} className="btn btn-secondary" style={{ width: "100%", marginTop: "auto", padding: "10px" }}>
                    View Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS CAROUSEL ──────────────────────────────── */}
      <section className="section-padding" style={{ background: "var(--bg-white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Loved by Verified Travelers</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(star => <Star key={star} style={{ width: 18, height: 18, fill: "#FBBF24", color: "#FBBF24" }} />)}
                </div>
                <p style={{ fontSize: 16, fontStyle: "italic", marginBottom: 24, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={t.avatar} alt={t.name} loading="lazy" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                  <span style={{ fontWeight: 700 }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="section-padding" style={{ background: "var(--bg-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Simple, Transparent Pricing</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
            <div className="card" style={{ flex: "1 1 350px", maxWidth: 400, borderTop: "4px solid var(--primary)" }}>
              <h3 style={{ fontSize: 24, marginBottom: 8 }}>Free</h3>
              <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>₹0 <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-muted)" }}>forever</span></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                {["Basic features", "Up to 5 trips", "10 members per trip", "Standard support"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle style={{ width: 20, height: 20, color: "var(--primary)" }} /> {f}</li>
                ))}
              </ul>
              <button onClick={() => setIsSignupModalOpen(true)} className="btn btn-primary" style={{ width: "100%" }}>Get Started Free</button>
            </div>

            <div className="card" style={{ flex: "1 1 350px", maxWidth: 400, position: "relative", opacity: 0.8 }}>
              <div style={{ position: "absolute", top: -14, right: 24, background: "var(--secondary)", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Launching in 2 months</div>
              <h3 style={{ fontSize: 24, marginBottom: 8 }}>Premium</h3>
              <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>₹499 <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-muted)" }}>/month</span></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                {["AI concierge", "Unlimited trips", "Unlimited members", "Priority support", "Advanced analytics"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle style={{ width: 20, height: 20, color: "var(--secondary)" }} /> {f}</li>
                ))}
              </ul>
              <button className="btn btn-secondary" style={{ width: "100%", cursor: "not-allowed" }} disabled>Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA & SOCIAL PROOF ─────────────────────────────────── */}
      <section className="section-padding" style={{ background: "var(--bg-white)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ background: "var(--text-dark)", borderRadius: 32, padding: "80px 24px", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, background: "url('https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80') center/cover" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
                Join 10,000+ verified travelers today
              </div>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "white", marginBottom: 32 }}>Ready to Travel Safe?</h2>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                <button onClick={() => setIsSignupModalOpen(true)} className="btn btn-primary" style={{ background: "white", color: "var(--text-dark)" }}>Create Free Account</button>
                <button onClick={() => scrollToSection("explore")} className="btn btn-secondary" style={{ color: "white", borderColor: "white" }}>Browse Trips</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ background: "var(--bg-alt)", padding: "80px 0 40px", borderTop: "1px solid #E2E8F0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 64 }}>
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin style={{ width: 16, height: 16, color: "white" }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading)" }}>YatraSecure</span>
              </Link>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>India's most trusted group travel platform. Travel together, stay safe.</p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Thanks for subscribing!"); }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="email" placeholder="Enter your email" required className="form-input" style={{ marginBottom: 0, padding: "10px 16px" }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>Subscribe</button>
                </div>
              </form>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Product</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Features", "How It Works", "Pricing", "FAQ"].map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{l}</a></li>)}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Company</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["About", "Blog", "Careers"].map(l => <li key={l}><a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{l}</a></li>)}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Legal</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Privacy", "Terms", "Cookie Policy"].map(l => <li key={l}><a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{l}</a></li>)}
              </ul>
            </div>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", paddingTop: 32, borderTop: "1px solid #E2E8F0", color: "var(--text-muted)", fontSize: 14 }}>
            <p>© 2026 YatraSecure. Safe journeys for everyone.</p>
            <div style={{ display: "flex", gap: 16 }}>
              {/* Dummy App Badges */}
              <div style={{ background: "black", color: "white", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>App Store</div>
              <div style={{ background: "black", color: "white", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Google Play</div>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MODALS & OVERLAYS ──────────────────────────────────── */}
      
      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVideoModalOpen(false)}>
          <div className="modal-content" style={{ padding: 0, maxWidth: 800, background: "transparent", overflow: "visible" }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsVideoModalOpen(false)} style={{ top: -40, right: -40, color: "white" }}>
              <XIcon style={{ width: 32, height: 32 }} />
            </button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "black", borderRadius: 16, overflow: "hidden" }}>
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} 
                frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen 
              />
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSignupModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSignupModalOpen(false)}><XIcon /></button>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Create Free Account</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Join the safest group travel platform.</p>
            
            <button className="btn" style={{ width: "100%", background: "white", border: "1px solid #E2E8F0", color: "var(--text-dark)", marginBottom: 24 }}>
              <Youtube style={{ width: 20, height: 20, color: "#EA4335" }} /> Sign up with Google
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, color: "var(--text-muted)", fontSize: 14 }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} /> OR <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={e => handleAuthSubmit(e, "signup")}>
              <input type="text" placeholder="Username" required className="form-input" />
              <input type="email" placeholder="Email" required className="form-input" />
              <input type="password" placeholder="Password" required className="form-input" />
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                 <div style={{ height: 4, flex: 1, background: "var(--primary)", borderRadius: 2 }} />
                 <div style={{ height: 4, flex: 1, background: "var(--primary)", borderRadius: 2 }} />
                 <div style={{ height: 4, flex: 1, background: "#E2E8F0", borderRadius: 2 }} />
              </div>
              <label style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                <input type="checkbox" required /> I agree to the Terms & Privacy Policy.
              </label>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isLoading}>
                {isLoading ? "Loading..." : "Create Account"}
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignupModalOpen(false); setIsLoginModalOpen(true); }} style={{ color: "var(--primary)", fontWeight: 600 }}>Login</a>
            </p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsLoginModalOpen(false)}><XIcon /></button>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Welcome Back</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Login to manage your trips.</p>
            
            <button className="btn" style={{ width: "100%", background: "white", border: "1px solid #E2E8F0", color: "var(--text-dark)", marginBottom: 24 }}>
              <Youtube style={{ width: 20, height: 20, color: "#EA4335" }} /> Login with Google
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, color: "var(--text-muted)", fontSize: 14 }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} /> OR <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={e => handleAuthSubmit(e, "login")}>
              <input type="email" placeholder="Email" required className="form-input" />
              <input type="password" placeholder="Password" required className="form-input" />
              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <a href="#" style={{ fontSize: 13, color: "var(--secondary)", textDecoration: "none", fontWeight: 500 }}>Forgot Password?</a>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isLoading}>
                {isLoading ? "Loading..." : "Login"}
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
              New here? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginModalOpen(false); setIsSignupModalOpen(true); }} style={{ color: "var(--primary)", fontWeight: 600 }}>Create an account</a>
            </p>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {isCookieConsentVisible && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--text-dark)", color: "white", padding: "16px 24px", zIndex: 900, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14 }}>We use cookies to improve your experience. By using our site, you agree to our Cookie Policy.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setIsCookieConsentVisible(false)} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 14, color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Decline</button>
            <button onClick={() => setIsCookieConsentVisible(false)} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 14 }}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
