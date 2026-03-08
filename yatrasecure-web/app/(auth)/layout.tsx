import { MapPin, Shield, MessageCircle, Wallet, Headphones } from "lucide-react";

const features = [
  { icon: Shield,        title: "Verified Groups",    desc: "Every traveler is ID-verified for your safety"      },
  { icon: MessageCircle, title: "Real-time Chat",     desc: "Coordinate with your group instantly"               },
  { icon: Wallet,        title: "Split Expenses",     desc: "Transparent cost sharing, no awkwardness"           },
  { icon: Headphones,    title: "24/7 Support",       desc: "Emergency help whenever you need it"                },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "#0f172a",
      fontFamily: "Inter, sans-serif",
    }}>

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "48%",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(155deg, #1a0a00 0%, #7c2d12 45%, #9a3412 100%)",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 52px",
        }}
      >
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "5%",
          width: 320, height: 320, borderRadius: "50%",
          background: "rgba(249,115,22,0.2)", filter: "blur(90px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "0%",
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(251,191,36,0.14)", filter: "blur(70px)", pointerEvents: "none",
        }} />

        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.055,
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "26px 26px", pointerEvents: "none",
        }} />

        {/* Diagonal stripe accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 180, height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.025))",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapPin style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              YatraSecure
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 44, fontWeight: 900, color: "white",
            lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 16,
          }}>
            Travel safe,<br />
            <span style={{
              background: "linear-gradient(135deg, #fbbf24, #f97316)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              travel together.
            </span>
          </h1>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.6)",
            lineHeight: 1.75, maxWidth: 360, marginBottom: 44,
          }}>
            India's most trusted platform for group travel — verified members, shared costs, zero stress.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "rgba(249,115,22,0.18)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: 17, height: 17, color: "#fbbf24" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 32, marginTop: 48,
            paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)",
          }}>
            {[["5,000+", "Travelers"], ["4.9★", "Rating"], ["500+", "Safe Trips"]].map(([v, l]) => (
              <div key={l}>
                <p style={{
                  fontSize: 22, fontWeight: 900, marginBottom: 3,
                  background: "linear-gradient(135deg,#fbbf24,#f97316)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {v}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        overflowY: "auto",
        padding: "40px 24px",
        position: "relative",
      }}>
        {/* Subtle right panel glow */}
        <div style={{
          position: "absolute", top: "30%", right: "10%",
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(249,115,22,0.04)", filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Mobile logo */}
        <div
          className="lg:hidden"
          style={{
            position: "absolute", top: 24, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg,#f97316,#fbbf24)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MapPin style={{ width: 15, height: 15, color: "white" }} />
          </div>
          <span style={{ fontWeight: 800, color: "white", fontSize: 15 }}>YatraSecure</span>
        </div>

        {/* Form content */}
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>

    </div>
  );
}
