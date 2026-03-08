"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MapPin, Shield, MessageCircle, Wallet, Star, ArrowRight, Users,
  CheckCircle, ChevronDown, Menu, X, Zap, Globe, Lock,
  TrendingUp, Heart, Bell, Mountain, Waves, Building2,
  Leaf, Backpack, Car
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Shield,
    title: "Verified Members Only",
    desc: "Every traveler goes through ID verification before joining any trip. Zero strangers, 100% trust.",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    color: "#f97316",
  },
  {
    icon: MessageCircle,
    title: "Real-time Group Chat",
    desc: "Instant messaging powered by WebSockets. Stay connected with your trip group at all times.",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    color: "#fbbf24",
  },
  {
    icon: Wallet,
    title: "Shared Group Wallet",
    desc: "Pool funds, split expenses automatically, and track every rupee with full transparency.",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    color: "#f97316",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Get instant alerts for join requests, expense updates, trip reminders and more.",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    color: "#fbbf24",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    desc: "JWT auth, bcrypt encryption, rate limiting — your data is protected at every layer.",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    color: "#f97316",
  },
  {
    icon: Globe,
    title: "Plan Any Trip",
    desc: "Weekend getaways to month-long adventures. Create public or private trips with custom budgets.",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    color: "#fbbf24",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    desc: "Sign up and get verified in minutes. Add your travel style, bio and preferences.",
  },
  {
    step: "02",
    title: "Create or Join a Trip",
    desc: "Browse public trips or create your own. Set destination, dates, budget and group size.",
  },
  {
    step: "03",
    title: "Coordinate & Chat",
    desc: "Use the real-time group chat to plan activities, share updates and stay connected.",
  },
  {
    step: "04",
    title: "Split Expenses Fairly",
    desc: "Log expenses, auto-split among members, and settle up — all inside the app.",
  },
];

const tripTypes = [
  { icon: Mountain,  type: "Adventure",   count: "120+ trips" },
  { icon: Waves,     type: "Beach",       count: "85+ trips"  },
  { icon: Building2, type: "City Tour",   count: "200+ trips" },
  { icon: Leaf,      type: "Wellness",    count: "60+ trips"  },
  { icon: Backpack,  type: "Backpacking", count: "150+ trips" },
  { icon: Car,       type: "Road Trip",   count: "95+ trips"  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    avatar: "PS",
    rating: 5,
    text: "Planned a Ladakh trip with 8 strangers. The wallet feature saved us from so many awkward money conversations. Highly recommend!",
  },
  {
    name: "Rahul Verma",
    city: "Delhi",
    avatar: "RV",
    rating: 5,
    text: "The real-time chat kept our Goa group perfectly coordinated. No more WhatsApp chaos. YatraSecure is just better.",
  },
  {
    name: "Ananya Singh",
    city: "Bangalore",
    avatar: "AS",
    rating: 5,
    text: "I love that everyone is verified. Felt completely safe travelling with people I met on the platform. 10/10 experience.",
  },
];

const stats = [
  { value: "5,000+", label: "Verified Travelers", icon: Users       },
  { value: "4.9★",   label: "Average Rating",     icon: Star        },
  { value: "500+",   label: "Safe Trips",          icon: CheckCircle },
  { value: "₹2Cr+",  label: "Expenses Managed",   icon: TrendingUp  },
];

const faqs = [
  {
    q: "Is YatraSecure free to use?",
    a: "Yes! Creating an account, joining trips, and using chat are completely free.",
  },
  {
    q: "How does member verification work?",
    a: "Users verify their email and complete a profile. Trip admins can approve or reject join requests.",
  },
  {
    q: "How does the group wallet work?",
    a: "Members contribute to a shared pool. Expenses are logged and auto-split. Settlement is calculated inside the app.",
  },
  {
    q: "Can I create a private trip?",
    a: "Absolutely. Set your trip to private — only people with your approval can join.",
  },
  {
    q: "What happens if someone leaves the trip?",
    a: "The admin is notified. Wallet shares are recalculated automatically.",
  },
];

// ─── FAQ ACCORDION ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "#1a2744",
        border: `1px solid ${open ? "rgba(249,115,22,0.45)" : "#2d3f5e"}`,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14, margin: 0 }}>{q}</p>
        <ChevronDown
          style={{
            width: 16,
            height: 16,
            color: "#f97316",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {open && (
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12, lineHeight: 1.7, marginBottom: 0 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", overflowX: "hidden", fontFamily: "Inter, sans-serif" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(15,23,42,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(45,63,94,0.5)" : "none",
        transition: "all 0.3s ease",
      }}>
        <nav style={{ maxWidth: 1152, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#f97316,#fbbf24)",
              boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapPin style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              YatraSecure
            </span>
          </div>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {["Features", "How It Works", "Trips", "FAQ"].map((item) => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
            <button onClick={() => router.push("/login")} className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>
              Login
            </button>
            <button onClick={() => router.push("/signup")} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
              Get Started <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
            className="flex md:hidden"
          >
            {menuOpen
              ? <X style={{ width: 24, height: 24 }} />
              : <Menu style={{ width: 24, height: 24 }} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: "rgba(26,39,68,0.98)", backdropFilter: "blur(16px)",
            borderTop: "1px solid #2d3f5e", padding: "16px 24px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {["Features", "How It Works", "Trips", "FAQ"].map((item) => (
              <a key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 500, textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button onClick={() => router.push("/login")}  className="btn-ghost" style={{ flex: 1, padding: 10, fontSize: 13 }}>Login</button>
              <button onClick={() => router.push("/signup")} className="btn-primary" style={{ flex: 1, padding: 10, fontSize: 13 }}>Sign Up</button>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: 140, paddingBottom: 96, paddingLeft: 24, paddingRight: 24,
        textAlign: "center",
        background: `
          radial-gradient(circle at 20% 50%, rgba(249,115,22,0.13) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(251,191,36,0.09) 0%, transparent 40%),
          radial-gradient(circle at 60% 80%, rgba(249,115,22,0.07) 0%, transparent 40%),
          #0f172a
        `,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }} className="anim-in">

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 999,
            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
            color: "#f97316", fontSize: 12, fontWeight: 600, marginBottom: 32,
          }}>
            <Zap style={{ width: 13, height: 13, fill: "#f97316" }} />
            India's Most Trusted Group Travel Platform
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900,
            color: "white", lineHeight: 1.1, letterSpacing: "-0.03em",
            marginBottom: 24,
          }}>
            Travel Together,{" "}
            <span className="gradient-text">Stay Safe</span>
            <br />
            <span style={{ color: "#64748b", fontSize: "0.65em", fontWeight: 700 }}>
              Every Single Trip.
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Plan group trips with verified travelers. Real-time chat, shared wallet,
            smart expense splitting — everything in one secure place.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 48 }}>
            <button onClick={() => router.push("/signup")} className="btn-primary" style={{ padding: "15px 36px", fontSize: 15 }}>
              Start Your Journey <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={() => router.push("/trips")} className="btn-ghost" style={{ padding: "15px 36px", fontSize: 15 }}>
              <Users style={{ width: 18, height: 18 }} /> Browse Trips
            </button>
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, color: "#475569", fontSize: 12 }}>
            {["No credit card required", "Free to join", "Verified community"].map((t) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle style={{ width: 13, height: 13, color: "#f97316" }} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ maxWidth: 800, margin: "64px auto 0" }} className="anim-in-delay">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1, borderRadius: 18, overflow: "hidden", background: "#2d3f5e",
          }}>
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} style={{
                background: "#1a2744", padding: "24px 16px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                <Icon style={{ width: 20, height: 20, color: "#f97316" }} />
                <p className="gradient-text" style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{value}</p>
                <p style={{ color: "#475569", fontSize: 11, textAlign: "center", margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRIP TYPES ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px" }} id="trips">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Explore by Category
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", margin: 0 }}>
              Find Your Kind of Trip
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {tripTypes.map(({ icon: Icon, type, count }) => (
              <div
                key={type}
                onClick={() => router.push("/trips")}
                className="card card-hover"
                style={{ padding: "28px 16px", textAlign: "center", cursor: "pointer" }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, margin: "0 auto 14px",
                  background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.08))",
                  border: "1px solid rgba(249,115,22,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: 22, height: 22, color: "#f97316" }} />
                </div>
                <p style={{ fontWeight: 700, color: "white", fontSize: 13, margin: "0 0 4px" }}>{type}</p>
                <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        style={{ padding: "96px 24px", background: "linear-gradient(180deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)" }}
      >
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Why YatraSecure
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", marginBottom: 14 }}>
              Everything for a{" "}
              <span className="gradient-text">Safe Group Trip</span>
            </h2>
            <p style={{ color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7, fontSize: 15 }}>
              Built for Indian group travelers who want safety, transparency, and zero drama.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map(({ icon: Icon, title, desc, bg, border, color }) => (
              <div key={title} className="card card-hover" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                  background: bg, border: `1px solid ${border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
                <h3 style={{ fontWeight: 700, color: "white", fontSize: 15, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Simple Process
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", margin: 0 }}>
              Up & Running in{" "}
              <span className="gradient-text">4 Steps</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} style={{
                display: "flex", gap: 20, alignItems: "flex-start",
                background: "#1a2744", border: "1px solid #2d3f5e",
                borderRadius: 16, padding: "22px 24px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  flexShrink: 0, fontWeight: 900, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i % 2 === 0
                    ? "linear-gradient(135deg, #f97316, #fbbf24)"
                    : "rgba(249,115,22,0.1)",
                  color: i % 2 === 0 ? "white" : "#f97316",
                  border: i % 2 !== 0 ? "1px solid rgba(249,115,22,0.3)" : "none",
                }}>
                  {step}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: "white", fontSize: 15, marginBottom: 6 }}>{title}</h3>
                  <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px", background: "linear-gradient(180deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Loved by Travelers
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", margin: 0 }}>
              Real Stories,{" "}
              <span className="gradient-text">Real Trips</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {testimonials.map(({ name, city, avatar, rating, text }) => (
              <div key={name} className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} style={{ width: 15, height: 15, fill: "#f97316", color: "#f97316" }} />
                  ))}
                </div>
                <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg,#f97316,#fbbf24)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "white", fontSize: 13, margin: 0 }}>{name}</p>
                    <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Got Questions?
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", margin: 0 }}>
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{
          maxWidth: 860, margin: "0 auto", borderRadius: 24,
          padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, rgba(249,115,22,0.14), rgba(251,191,36,0.07))",
          border: "1px solid rgba(249,115,22,0.3)",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)",
            width: 280, height: 280, borderRadius: "50%",
            background: "rgba(249,115,22,0.12)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, margin: "0 auto 20px",
              background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Heart style={{ width: 24, height: 24, color: "#f97316" }} />
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", marginBottom: 16 }}>
              Ready for Your Next{" "}
              <span className="gradient-text">Adventure?</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Join thousands of verified travelers planning safe, fun, stress-free group trips across India and beyond.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <button onClick={() => router.push("/signup")} className="btn-primary" style={{ padding: "15px 40px", fontSize: 15 }}>
                Create Free Account <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button onClick={() => router.push("/trips")} className="btn-ghost" style={{ padding: "15px 40px", fontSize: 15 }}>
                Browse All Trips
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#f97316,#fbbf24)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapPin style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <span style={{ fontWeight: 800, color: "white", fontSize: 15 }}>YatraSecure</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Browse Trips", href: "/trips" },
              { label: "Login", href: "/login" },
              { label: "Sign Up", href: "/signup" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{ fontSize: 13, color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
              >
                {label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>
            © 2026 YatraSecure. Made with ❤️ in India
          </p>
        </div>
      </footer>

    </div>
  );
}
