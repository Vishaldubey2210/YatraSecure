"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin, LayoutDashboard, Compass, Bell,
  User, LogOut, Menu, X, Settings, Plus, Map, ShoppingBag,
  PanelLeftClose, PanelLeftOpen, Sun, Moon
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import CurrentLocation from "@/components/CurrentLocation";

const navItems = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Overview"     },
  { href: "/trips",         icon: Compass,         label: "Trips"        },
  { href: "/guides",        icon: Map,             label: "Destinations" },
  { href: "/marketplace",   icon: ShoppingBag,     label: "Marketplace"  },
  { href: "/notifications", icon: Bell,            label: "Alerts"       },
  { href: "/profile",       icon: User,            label: "Profile"      },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]                     = useState<any>(null);
  const [mobileSidebar, setMobileSidebar]   = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [dropOpen, setDrop]                 = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return nextTheme;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

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
  const sidebarWidth = desktopCollapsed ? 80 : 260;

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--dashboard-bg)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          onClick={() => setMobileSidebar(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.5)", zIndex: 40, backdropFilter: "blur(4px)" }}
          className="lg:hidden"
        />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: sidebarWidth,
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "2px 0 12px rgba(83,74,183,0.06)",
      }}
      className={`transform ${mobileSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* ── Logo Area ── */}
        <div style={{ padding: desktopCollapsed ? "24px 12px 20px" : "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: desktopCollapsed ? "center" : "space-between" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <MapPin style={{ width: 16, height: 16, color: "white" }} />
              </div>
              {!desktopCollapsed && (
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  YatraSecure
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileSidebar(false)}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: "#9898B0", padding: 4,
                display: "flex", borderRadius: 8,
                transition: "color 0.2s ease-in-out",
              }}
              className="flex lg:hidden hover:text-brand-text"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* New Trip Button */}
          {!desktopCollapsed && (
            <Link href="/create-trip" style={{ textDecoration: "none", display: "block", width: "100%", marginTop: 16 }}>
              <button style={{
                width: "100%", height: 38, borderRadius: 10,
                background: "#EEEDFE",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: "#534AB7", fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "background 0.2s ease-in-out",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#DDD9FC")}
              onMouseLeave={e => (e.currentTarget.style.background = "#EEEDFE")}
              >
                <Plus style={{ width: 15, height: 15 }} />
                New Trip
              </button>
            </Link>
          )}
          {desktopCollapsed && (
            <Link href="/create-trip" style={{ textDecoration: "none", display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#EEEDFE", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#534AB7", cursor: "pointer",
                transition: "background 0.2s ease-in-out",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#DDD9FC")}
              onMouseLeave={e => (e.currentTarget.style.background = "#EEEDFE")}
              >
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            </Link>
          )}
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: desktopCollapsed ? "16px 8px" : "16px 12px", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} onClick={() => setMobileSidebar(false)} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: desktopCollapsed ? 0 : 10,
                    justifyContent: desktopCollapsed ? "center" : "flex-start",
                    padding: desktopCollapsed ? "10px 0" : "10px 12px",
                    borderRadius: desktopCollapsed ? 10 : "0 10px 10px 0",
                    background: active ? "var(--primary-light)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    position: "relative",
                    borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
                    marginLeft: active ? 0 : 0,
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = "var(--bg2)";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                  title={desktopCollapsed ? label : undefined}
                  >
                    <Icon style={{
                      width: 18, height: 18,
                      color: active ? "var(--primary)" : "var(--text2)",
                      flexShrink: 0,
                      transition: "color 0.2s ease-in-out",
                    }} />
                    {!desktopCollapsed && (
                      <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "var(--primary)" : "var(--text2)", transition: "color 0.2s ease-in-out" }}>
                        {label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Support section */}
          <div style={{ marginTop: 24 }}>
            {!desktopCollapsed && (
              <p style={{ fontSize: 11, fontWeight: 600, color: "#9898B0", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
                SUPPORT
              </p>
            )}
            <Link href="/settings" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center",
                gap: desktopCollapsed ? 0 : 10,
                justifyContent: desktopCollapsed ? "center" : "flex-start",
                padding: desktopCollapsed ? "10px 0" : "10px 12px",
                borderRadius: 10, cursor: "pointer",
                transition: "background 0.2s ease-in-out",
                borderLeft: "3px solid transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F8F7FD")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              title={desktopCollapsed ? "Settings" : undefined}
              >
                <Settings style={{ width: 18, height: 18, color: "#6B6B8A", flexShrink: 0 }} />
                {!desktopCollapsed && <span style={{ fontSize: 14, fontWeight: 500, color: "#6B6B8A" }}>Settings</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* ── User profile snippet (bottom) ── */}
        {user && (
          <div style={{ padding: desktopCollapsed ? "12px 8px 24px" : "12px 12px 24px", borderTop: "1px solid var(--border)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 10,
              transition: "background 0.2s ease-in-out", cursor: "pointer",
              justifyContent: desktopCollapsed ? "center" : "flex-start",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "white",
                }}>
                  {avatar}
                </div>
                {!desktopCollapsed && (
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
          </div>
        )}
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh" }}
        className={desktopCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"}
      >
        {/* ── TOP NAV BAR ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px", height: 68,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 1px 8px rgba(83,74,183,0.05)",
        }}>
          {/* Left — Breadcrumb & Collapse Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B8A", display: "flex", padding: 4, borderRadius: 8 }}
            >
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="hidden lg:flex"
              style={{
                background: "#F8F7FD", border: "1px solid #E4E2F4",
                borderRadius: 8, cursor: "pointer", color: "#6B6B8A",
                padding: 6, transition: "background 0.2s ease-in-out", display: "flex",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#EEEDFE")}
              onMouseLeave={e => (e.currentTarget.style.background = "#F8F7FD")}
            >
              {desktopCollapsed ? <PanelLeftOpen style={{ width: 16, height: 16 }} /> : <PanelLeftClose style={{ width: 16, height: 16 }} />}
            </button>
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 500 }}>YatraSecure</span>
              <span style={{ color: "var(--border2)" }}>/</span>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, textTransform: "capitalize" }}>
                {pathname.split("/")[1] || "overview"}
              </span>
            </div>
          </div>

          {/* Right — Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: "var(--bg2)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text2)", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {isDarkMode ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
            </button>
            <CurrentLocation />
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <div ref={dropRef} style={{ position: "relative" }}>
              <div
                onClick={() => setDrop(!dropOpen)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "#534AB7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  userSelect: "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#3C3489")}
                onMouseLeave={e => (e.currentTarget.style.background = "#534AB7")}
              >
                {avatar}
              </div>

              {dropOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: 220, borderRadius: 14,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  overflow: "hidden", zIndex: 100, padding: 8,
                }}
                className="anim-in"
                >
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{user?.username}</p>
                    <p style={{ fontSize: 12, color: "var(--text3)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                  </div>

                  <Link href="/profile" onClick={() => setDrop(false)} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13, color: "#6B6B8A", cursor: "pointer", transition: "all 0.2s ease-in-out" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EEEDFE"; e.currentTarget.style.color = "#534AB7"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B6B8A"; }}
                    >
                      <User style={{ width: 14, height: 14 }} /> Profile
                    </div>
                  </Link>
                  <Link href="/settings" onClick={() => setDrop(false)} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13, color: "#6B6B8A", cursor: "pointer", transition: "all 0.2s ease-in-out" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EEEDFE"; e.currentTarget.style.color = "#534AB7"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B6B8A"; }}
                    >
                      <Settings style={{ width: 14, height: 14 }} /> Settings
                    </div>
                  </Link>
                  <div style={{ height: 1, background: "#F0EFF8", margin: "6px 0" }} />
                  <div
                    onClick={() => { setDrop(false); logout(); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13, color: "#E24B4A", cursor: "pointer", transition: "background 0.2s ease-in-out" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FCEBEB")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut style={{ width: 14, height: 14 }} /> Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", position: "relative", background: "var(--dashboard-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
