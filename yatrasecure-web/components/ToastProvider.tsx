"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, X } from "lucide-react";

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

interface ToastCtx { show: (message: string, type?: ToastType) => void; }
const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function useToast() { return useContext(ToastContext); }

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{
        position: "fixed", top: 20, right: 20,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "14px 18px",
              boxShadow: "0 8px 30px rgba(83,74,183,0.15)",
              border: "1px solid #E4E2F4",
              borderLeft: `4px solid ${t.type === "success" ? "#1D9E75" : "#E24B4A"}`,
              display: "flex", alignItems: "center", gap: 12,
              pointerEvents: "all",
              animation: "slideInRight 0.3s ease-out",
              minWidth: 280, maxWidth: 380,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: t.type === "success" ? "#E1F5EE" : "#FCEBEB",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {t.type === "success"
                ? <Check style={{ width: 14, height: 14, color: "#1D9E75" }} />
                : <X style={{ width: 14, height: 14, color: "#E24B4A" }} />}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E", flex: 1 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
