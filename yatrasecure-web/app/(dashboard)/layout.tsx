"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin, LayoutDashboard, Compass, Wallet, Bell, User,
  LogOut, Menu, X, ChevronRight, Settings
} from "lucide-react";

const navItems = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Dashboard"  },
  { href: "/trips",           icon: Compass,         label: "Browse Trips" },
  { href: "/wallet",          icon: Wallet,          label: "Wallet"     },
  { href: "/notifications",   icon: Bell,            label: "Notifications" },
  { href: "/profile",         icon: User,            label: "Profile"    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]           = useState<any>(null);
  const [sidebarOpen, setSidebar] = useState(false);
  const [unread, setUnread]       = useState(0);
  const [dropOpen, setDrop]       = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const avatar = user?.username?.slice(0, 2).toUpperCase() || "YS";

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#0f172a", fontFamily: "Inter, sans-serif" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebar(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }}
        />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 240,
        background: "#0d1829",
        borderRight: "1px solid #1e293b",
        display: "flex", flexDirection: "column",
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }} className="lg:translate-x-0 lg:!transform-none">

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#f97316,#fbbf24)",
                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <MapPin style={{ width: 18, height: 18, color: "white" }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                YatraSecure
              </span>
            </Link>
            <button
              onClick={() => setSidebar(false)}
              className="lg:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
            Main Menu
          </p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} onClick={() => setSidebar(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                  background: active ? "rgba(249,115,22,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(249,115,22,0.25)" : "transparent"}`,
                  cursor: "pointer", transition: "all 0.15s",
                  position: "relative",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <Icon style={{ width: 17, height: 17, color: active ? "#f97316" : "#475569", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#f97316" : "#64748b" }}>
                    {label}
                  </span>
                  {label === "Notifications" && unread > 0 && (
                    <div style={{
                      marginLeft: "auto", minWidth: 18, height: 18,
                      borderRadius: 999, background: "#f97316",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "white", padding: "0 5px",
                    }}>
                      {unread > 9 ? "9+" : unread}
                    </div>
                  )}
                  {active && <ChevronRight style={{ marginLeft: "auto", width: 14, height: 14, color: "#f97316" }} />}
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div style={{ height: 1, background: "#1e293b", margin: "16px 8px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
            Account
          </p>

          <Link href="/settings" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, marginBottom: 2,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <Settings style={{ width: 17, height: 17, color: "#475569", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>Settings</span>
            </div>
          </Link>

          <div
            onClick={logout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <LogOut style={{ width: 17, height: 17, color: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#ef4444" }}>Logout</span>
          </div>
        </nav>

        {/* User card bottom */}
        {user && (
          <div style={{ padding: "16px", borderTop: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#f97316,#fbbf24)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "white",
              }}>
                {avatar}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.username}
                </p>
                <p style={{ fontSize: 11, color: "#334155", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }} className="lg:ml-[240px]">

        {/* ── TOPBAR ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(13,24,41,0.9)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1e293b",
          padding: "0 24px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}>

          {/* Left — hamburger + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebar(true)}
              className="lg:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}
            >
              <Menu style={{ width: 22, height: 22 }} />
            </button>
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#334155" }}>YatraSecure</span>
              <ChevronRight style={{ width: 13, height: 13, color: "#334155" }} />
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, textTransform: "capitalize" }}>
                {pathname.split("/")[1] || "dashboard"}
              </span>
            </div>
          </div>

          {/* Right — notifications + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Notifications bell */}
            <Link href="/notifications" style={{ textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                border: "1px solid #1e293b", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#f97316"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e293b"; }}
              >
                <Bell style={{ width: 16, height: 16, color: "#64748b" }} />
                {unread > 0 && (
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#f97316", border: "2px solid #0d1829",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "white",
                  }}>
                    {unread}
                  </div>
                )}
              </div>
            </Link>

            {/* Avatar dropdown */}
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDrop(!dropOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "1px solid #1e293b", borderRadius: 10,
                  padding: "6px 10px", cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#f97316"; }}
                onMouseLeave={e => { if (!dropOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e293b"; }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "linear-gradient(135deg,#f97316,#fbbf24)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "white",
                }}>
                  {avatar}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }} className="hidden sm:block">
                  {user?.username || "User"}
                </span>
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 200, borderRadius: 14,
                  background: "#0d1829", border: "1px solid #1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  overflow: "hidden", zIndex: 100,
                }}>
                  {/* User info */}
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{user?.username}</p>
                    <p style={{ fontSize: 11, color: "#334155", margin: "2px 0 0" }}>{user?.email}</p>
                  </div>
                  {[
                    { label: "View Profile", href: "/profile", icon: User   },
                    { label: "Settings",     href: "/settings", icon: Settings },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setDrop(false)} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 16px", cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(249,115,22,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        <Icon style={{ width: 14, height: 14, color: "#475569" }} />
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                      </div>
                    </Link>
                  ))}
                  <div style={{ height: 1, background: "#1e293b" }} />
                  <div
                    onClick={() => { setDrop(false); logout(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <LogOut style={{ width: 14, height: 14, color: "#ef4444" }} />
                    <span style={{ fontSize: 13, color: "#ef4444" }}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
