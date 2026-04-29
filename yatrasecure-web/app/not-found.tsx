"use client";
import Link from "next/link";
import { MapPin, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0EFF8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div className="anim-in" style={{ textAlign: "center", maxWidth: 480 }}>

        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 24,
          background: "#534AB7",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: "0 12px 32px rgba(83,74,183,0.3)",
        }}>
          <MapPin style={{ width: 48, height: 48, color: "white" }} />
        </div>

        {/* 404 */}
        <h1 style={{
          fontSize: 96, fontWeight: 800,
          background: "linear-gradient(135deg, #534AB7, #7F77DD)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1, marginBottom: 12,
        }}>
          404
        </h1>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>
          Lost on the map?
        </h2>
        <p style={{ color: "#6B6B8A", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" }}>
          This destination doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", textDecoration: "none" }}
          >
            <Home style={{ width: 16, height: 16 }} /> Dashboard
          </Link>
          <Link
            href="/trips"
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", textDecoration: "none" }}
          >
            <Compass style={{ width: 16, height: 16 }} /> Browse Trips
          </Link>
        </div>

        {/* Back to home */}
        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ fontSize: 14, color: "#534AB7", fontWeight: 500, textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
