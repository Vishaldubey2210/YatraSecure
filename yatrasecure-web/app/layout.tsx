import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { TravelThemeProvider } from "./TravelThemeProvider";

export const metadata: Metadata = {
  title: "YatraSecure — Safe Group Travel",
  description:
    "Plan safe group trips with verified travelers, real-time chat & shared wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ backgroundColor: "var(--bg)" }} suppressHydrationWarning>
        <TravelThemeProvider>{children}</TravelThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#FFFFFF",
              color: "#1A1A2E",
              border: "1px solid #E4E2F4",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 8px 24px rgba(83,74,183,0.12)",
            },
            success: { iconTheme: { primary: "#1D9E75", secondary: "#FFFFFF" } },
            error:   { iconTheme: { primary: "#E24B4A", secondary: "#FFFFFF" } },
          }}
        />
      </body>
    </html>
  );
}
