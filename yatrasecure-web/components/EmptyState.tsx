import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  heading: string;
  subtext: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon, heading, subtext, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "72px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "#EEEDFE",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, flexShrink: 0,
      }}>
        <span style={{ color: "#534AB7", display: "flex" }}>{icon}</span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1A1A2E", margin: "0 0 8px" }}>{heading}</h3>
      <p style={{ fontSize: 14, color: "#6B6B8A", maxWidth: 280, margin: "0 auto", lineHeight: 1.6 }}>{subtext}</p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="btn-primary"
          style={{ marginTop: 24, padding: "10px 28px", fontSize: 14 }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
