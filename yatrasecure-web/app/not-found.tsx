"use client";
import Link from "next/link";
import { MapPin, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 hero-pattern flex items-center justify-center px-4">
      <div className="text-center space-y-6 anim-in">
        <div className="w-24 h-24 rounded-3xl bg-gradient-brand flex items-center justify-center mx-auto shadow-brand-lg">
          <MapPin className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-8xl font-black gradient-text mb-3">404</h1>
          <h2 className="text-2xl font-bold text-white mb-3">Lost on the map?</h2>
          <p className="text-slate-400 max-w-sm mx-auto">
            This destination doesn't exist. Let's get you back on track.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/trips" className="btn-ghost">
            <Compass className="w-4 h-4" /> Browse Trips
          </Link>
        </div>
      </div>
    </div>
  );
}
