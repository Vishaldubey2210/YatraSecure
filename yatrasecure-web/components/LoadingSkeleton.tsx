"use client";
import React from "react";

export function SkeletonCard({ height = 180 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 16,
        background: "#EEEDFE",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function SkeletonText({ width = "100%", height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: "#E4E2F4",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function SkeletonCardGrid({ count = 3, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 20,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          borderRadius: 16, overflow: "hidden",
          background: "#FFFFFF",
          border: "1px solid #E4E2F4",
          padding: 20,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <SkeletonCard height={100} />
          <SkeletonText width="70%" />
          <SkeletonText width="100%" />
          <SkeletonText width="50%" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
