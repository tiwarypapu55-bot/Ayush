import { useState, useEffect, useRef } from "react";
import { Activity, ShieldCheck, Heart, User, Clock, Building2, ChevronLeft, ChevronRight } from "lucide-react";

interface NavbarProps {
  currentRole: string;
  onChangeRole: (role: string) => void;
  syncStatus: "connected" | "stale" | "error";
  hfrCounts: number;
  hprCounts: number;
}

const ROLES = [
  { id: "Receptionist", label: "Reception Panel", icon: "📋" },
  { id: "Doctor", label: "Doctor EMR", icon: "🩺" },
  { id: "Nurse", label: "Nurse / Bed Panel", icon: "🏥" },
  { id: "AyushmanMitra", label: "Ayushman Mitra", icon: "🛡️" },
  { id: "MultiPayer", label: "Multi-Payer Desk", icon: "👑" },
  { id: "LabStaff", label: "LIS / Radiology", icon: "🔬" },
  { id: "Pharmacy", label: "Pharmacy Unit", icon: "💊" },
  { id: "Inventory", label: "Store & Inventory", icon: "📦" },
  { id: "SuperAdmin", label: "Central Audit", icon: "📊" },
  { id: "Patient", label: "Patient Portal", icon: "👤" }
];

export default function Navbar({ currentRole, onChangeRole, syncStatus, hfrCounts, hprCounts }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Initialize arrows
      checkScroll();
      // Add resize event to catch container change
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "medium"
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="bg-image3-lavender text-slate-900 border-b border-indigo-200 sticky top-0 z-50 shadow-xs">
      {/* Prime Agency Govt Banner - Elegant ultra-thin subtle color band */}
      <div className="bg-gradient-to-r from-orange-500 via-slate-100 to-green-600 h-1 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Core Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-lg border border-indigo-400/20 shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold tracking-widest text-indigo-900 bg-white/70 px-2 py-0.5 rounded uppercase border border-indigo-200">
                ABDM & PM-JAY Sandbox
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-50 text-green-800 px-1.5 py-0.5 rounded border border-green-200">
                <ShieldCheck className="h-3 w-3 text-green-600" /> NHA Compliant
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-1.5">
              MediNexus National Health Digital Desk <Heart className="h-4 w-4 text-rose-550 fill-rose-500/30" />
            </h1>
          </div>
        </div>

        {/* Live Systems Metadata Tracker */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white/60 p-2 rounded-lg border border-indigo-250/40 shadow-2xs">
          <div className="flex items-center gap-1.5 px-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
            <span className="text-indigo-950 font-semibold">
              {currentTime}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 border-l border-indigo-200/60 pl-3 text-indigo-900 text-[11px] font-semibold">
            <span className="flex items-center gap-1 font-mono">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" /> HFR Beds: <strong className="text-indigo-950">{hfrCounts}</strong>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <User className="h-3.5 w-3.5 text-indigo-600" /> HPR Verified Doc: <strong className="text-indigo-950">{hprCounts}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Role View Toggle Controls */}
      <div className="bg-image3-lavender/90 border-t border-indigo-250/35 py-2.5 relative">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center">
          {/* Scroll Left Button */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 z-20 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 border border-indigo-400"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* List Container */}
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scroll-smooth py-1 px-8 custom-scrollbar select-none"
          >
            <div className="flex space-x-2 min-w-max">
              {ROLES.map((role) => {
                const isActive = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    id={`role-btn-${role.id}`}
                    onClick={() => onChangeRole(role.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 border cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-indigo-700 text-white border-indigo-700 shadow-md font-bold"
                        : "bg-white/80 text-indigo-950 border-indigo-200/60 hover:bg-white hover:text-indigo-900"
                    }`}
                  >
                    <span className="text-xs">{role.icon}</span>
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll Right Button */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 z-20 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 border border-indigo-400"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
