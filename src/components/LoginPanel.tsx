import React, { useState, FormEvent } from "react";
import { 
  ShieldCheck, Lock, Mail, ChevronRight, Activity, 
  User, CheckCircle2, AlertCircle, Fingerprint, RefreshCw, Key, Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface UserSession {
  id: string;
  name: string;
  role: string;
  email: string;
  designation: string;
  department: string;
  avatar: string;
  badgeId: string;
  authorizedScope: string;
}

export const PRESET_PANELISTS: UserSession[] = [
  {
    id: "receptionist_1",
    name: "Meera Sharma",
    role: "Receptionist",
    email: "meera.sharma@medinex.gov.in",
    designation: "Front Desk Registration Lead",
    department: "OPD & Patient Registry Desk",
    avatar: "📋",
    badgeId: "NHA-REG-1049",
    authorizedScope: "UIDAI Aadhaar Scan-and-Share, Client Register"
  },
  {
    id: "doctor_1",
    name: "Dr. Aarav Mehta",
    role: "Doctor",
    email: "aarav.mehta@medinex.gov.in",
    designation: "Senior Clinical Advisor",
    department: "Department of Cardiology & Emergency Care",
    avatar: "🩺",
    badgeId: "HPR-9011-2291",
    authorizedScope: "HL7 FHIR SOAP Prescription, LIS Lab Ref"
  },
  {
    id: "nurse_1",
    name: "Sister Sneha Mathew",
    role: "Nurse",
    email: "sneha.mathew@medinex.gov.in",
    designation: "ICU Ward Nursing In-charge",
    department: "Emergency Response & Allied Beds",
    avatar: "🏥",
    badgeId: "NURSE-ICU-054",
    authorizedScope: "HFR Bed Allocation, Pharmacy E-Dispense"
  },
  {
    id: "mitra_1",
    name: "Rajesh Kumar",
    role: "AyushmanMitra",
    email: "rajesh.pmjay@gov.in",
    designation: "Certified PM-JAY Mitra Executive",
    department: "BIS Integrated Patient Claims Helpdesk",
    avatar: "🛡️",
    badgeId: "BIS-MITRA-336",
    authorizedScope: "PM-JAY Claim Pre-Auth, Fraud Analysis, Settlement"
  },
  {
    id: "multipayer_1",
    name: "Gautam Singhania",
    role: "MultiPayer",
    email: "gautam.singhania@medinex.gov.in",
    designation: "Multi-Payer Commercial Desk Lead",
    department: "Corporate Insurance & Premium Services Desk",
    avatar: "👑",
    badgeId: "PMC-EXEC-991",
    authorizedScope: "Flexible Rate Cards, Escrows & Corporate Cover Verification"
  },
  {
    id: "lab_1",
    name: "Dr. Devendra Soni",
    role: "LabStaff",
    email: "devendra.lab@medinex.gov.in",
    designation: "Chief Medical Laboratory Director",
    department: "Ancillary Radiology & Pathology Unit",
    avatar: "🔬",
    badgeId: "LIS-PATH-884",
    authorizedScope: "LOINC Diagnostic Sync & Pathology Authorizer"
  },
  {
    id: "pharmacy_1",
    name: "Alok Verma",
    role: "Pharmacy",
    email: "alok.pharmacy@medinex.gov.in",
    designation: "Lead Registered Pharmacist",
    department: "Central Pharmacy & Distribution Terminal",
    avatar: "💊",
    badgeId: "CDSCO-RX-4412",
    authorizedScope: "Medicine Dispensing & Inventory Sync"
  },
  {
    id: "super_1",
    name: "Director Amit Jha",
    role: "SuperAdmin",
    email: "amit.jha@nha.gov.in",
    designation: "NHA Regional Auditing Commissioner",
    department: "Central Audit, Chain Integrity & National Registries",
    avatar: "📊",
    badgeId: "NHA-AUDIT-001",
    authorizedScope: "Full Sandbox Database Sync & Federal Integrity"
  },
  {
    id: "inventory_1",
    name: "Karan Seth",
    role: "Inventory",
    email: "karan.inventory@medinex.gov.in",
    designation: "Supplies & logistics Supervisor",
    department: "Emergency Supplies Store & Stocks",
    avatar: "📦",
    badgeId: "INV-LOG-992",
    authorizedScope: "Substance Re-order, Consumables Intake and Auditing"
  },
  {
    id: "patient_1",
    name: "Priyanjali Sen",
    role: "Patient",
    email: "priya.abha@gmail.com",
    designation: "Citizen Participant Sandbox Tester",
    department: "ABDM Self-Care Patient Portal Desk",
    avatar: "👤",
    badgeId: "ABHA-6612-4419",
    authorizedScope: "Personal Health Records Retrieval, Consent Log Tracker"
  }
];

interface LoginPanelProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [selectedPanelist, setSelectedPanelist] = useState<UserSession | null>(PRESET_PANELISTS[0]);
  const [emailInput, setEmailInput] = useState(PRESET_PANELISTS[0].email);
  const [passwordInput, setPasswordInput] = useState("••••••••");
  const [securityKeyInput, setSecurityKeyInput] = useState("SBX-TOKEN-9213");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [validationStage, setValidationStage] = useState<"idle" | "fingerprint" | "token" | "done">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [errorText, setErrorText] = useState("");

  const handleSelectPanelist = (panelist: UserSession) => {
    setSelectedPanelist(panelist);
    setEmailInput(panelist.email);
    setPasswordInput("••••••••");
    const keyPrefix = panelist.badgeId.split("-")[0];
    setSecurityKeyInput(`${keyPrefix}-SEC-KEY-${Math.floor(Math.random() * 8999) + 1000}`);
    setErrorText("");
  };

  const handleCustomLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorText("National security identifier email cannot be empty.");
      return;
    }
    // Attempt to match preset emails for nice pre-filled experience, else fallback to custom session
    const matched = PRESET_PANELISTS.find(p => p.email.toLowerCase() === emailInput.toLowerCase().trim());
    if (matched) {
      handleSelectPanelist(matched);
      triggerBiometricValidation(matched);
    } else {
      // Create dynamically authorized user based on common roles
      const generated: UserSession = {
        id: `custom_${Date.now()}`,
        name: emailInput.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        role: selectedPanelist?.role || "Receptionist",
        email: emailInput.toLowerCase().trim(),
        designation: "Contracted Health Assistant",
        department: "Federal Allied Desk Support",
        avatar: "👤",
        badgeId: `OFFICER-${Math.floor(Math.random() * 8990) + 10}`,
        authorizedScope: "Limited Gateway Sandbox Read-Write Access"
      };
      triggerBiometricValidation(generated);
    }
  };

  const triggerBiometricValidation = (user: UserSession) => {
    setIsAuthenticating(true);
    setValidationStage("fingerprint");
    setScanProgress(0);
    setErrorText("");

    // Interval to simulate high-fidelity secure fingerprint scanner matching
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setTimeout(() => {
            setValidationStage("token");
            // Simulate ABDM central validation delay
            setTimeout(() => {
              setValidationStage("done");
              setTimeout(() => {
                onLoginSuccess(user);
                setIsAuthenticating(false);
                setValidationStage("idle");
              }, 600);
            }, 1000);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 md:my-10 px-4 select-none">
      
      {/* Dynamic Intro Welcome Cards */}
      <div className="text-center mb-8 max-w-2xl mx-auto text-white">
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-teal-300/40 p-2 py-1 px-3 rounded-full text-xs font-semibold mb-3 tracking-wide">
          <Activity className="h-3.5 w-3.5 text-teal-300 animate-pulse" />
          <span>ABDM & PM-JAY Sovereign Health Network Gateway API v4.1</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight font-sans drop-shadow-xs">
          National Health Desk Gateway Sign-in
        </h2>
        <p className="text-xs text-slate-100/90 mt-2 leading-relaxed">
          Verify biometric credentials, token security keys, or choose pre-authorized sandboxed officer channels below to access ABDM, BIS, HFR, and HL7 FHIR database environments instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANEL: Presets Grid selector */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white/95 rounded-2xl p-5 border border-indigo-200/40 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b pb-3.5 mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-indigo-700" />
                  Pre-Authorized Officer Directories
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select a certified official block to load correct ABDM Sandbox clearance scopes instantly.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                {PRESET_PANELISTS.length} Roles Online
              </span>
            </div>

            {/* Scrolling Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-120 overflow-y-auto pr-1 style-scroll scrollbar-none flex-1">
              {PRESET_PANELISTS.map((pan) => {
                const isSelected = selectedPanelist?.id === pan.id;
                return (
                  <button
                    key={pan.id}
                    onClick={() => handleSelectPanelist(pan)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group flex items-start gap-3 ${
                      isSelected 
                        ? "bg-indigo-50/50 border-indigo-700 shadow-sm ring-1 ring-indigo-500/30" 
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-350"
                    }`}
                  >
                    {/* Corner accent */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 h-4 w-4 bg-indigo-700 rounded-bl-lg items-center justify-center flex">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}

                    <div className="h-10 w-10 shrink-0 text-xl bg-white border rounded-lg flex items-center justify-center shadow-xs">
                      {pan.avatar}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate group-hover:text-indigo-900 block">
                          {pan.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-700 font-mono tracking-tight uppercase">
                        {pan.role === "AyushmanMitra" ? "Ayushman Mitra" : pan.role}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{pan.designation}</p>
                      <p className="text-[9px] font-mono bg-white px-1 py-0.5 rounded border text-slate-600 inline-block">
                        ID: {pan.badgeId}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t text-[11px] text-rose-800 leading-normal flex items-start gap-1.5 bg-rose-50/60 p-2.5 rounded-xl border-rose-100">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>Federal Sandbox Safeguard:</strong> Selecting quick roles pre-loads verified local parameters to easily inspect HL7 registers, PM-JAY workflows, and database layers without failing standard credential tests.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentic Credential Form + Interactive biometric matching */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white/95 rounded-2xl p-6 border border-indigo-200/40 shadow-xl flex flex-col justify-between flex-1 relative overflow-hidden">
            
            {/* Form */}
            <form onSubmit={handleCustomLoginSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 mb-2">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Sign-In Credentials Portal</h3>
                  <p className="text-[10px] text-slate-500">Secure AES-256 encrypted local sandbox handshakes.</p>
                </div>
              </div>

              {selectedPanelist && (
                <div className="bg-slate-50 p-3 rounded-xl border border-dashed flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 text-slate-900 text-lg flex items-center justify-center font-bold">
                    {selectedPanelist.avatar}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-800 block uppercase tracking-tight">Active Role Loaded:</span>
                    <strong className="text-xs text-slate-800 font-bold block">{selectedPanelist.name} ({selectedPanelist.role})</strong>
                  </div>
                </div>
              )}

              {errorText && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{errorText}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-700 font-extrabold uppercase mb-1 flex justify-between">
                  <span>Authorized Email ID</span>
                  <span className="text-indigo-600 text-[9px] lowercase font-mono">domain: medinex.gov.in</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="officer.name@medinex.gov.in"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 font-extrabold uppercase mb-1 flex justify-between">
                  <span>Sign-in Security Code / Password</span>
                  <span className="text-slate-400 text-[9px]">Pre-filled passcode</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security passcode"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 font-extrabold uppercase mb-1 flex justify-between">
                  <span>NHA Sandbox Authority Token</span>
                  <span className="text-emerald-700 text-[9px] font-bold">AUTOMATIC KEY</span>
                </label>
                <input
                  type="text"
                  required
                  value={securityKeyInput}
                  onChange={(e) => setSecurityKeyInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-700 font-mono text-center font-bold text-slate-700"
                />
              </div>

              <div className="space-y-1.5 bg-teal-50 border border-teal-100 p-3 rounded-xl text-[10px] leading-relaxed select-none">
                <span className="font-bold text-teal-900 block">ABDM Central Authority Privileges:</span>
                <span className="text-slate-800">
                  {selectedPanelist ? selectedPanelist.authorizedScope : "Aadhaar e-KYC Patient Profile Matching, BIS Pre-auth records & Claims."}
                </span>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-indigo-700 hover:bg-indigo-850 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition duration-150 cursor-pointer disabled:opacity-50"
              >
                <span>Initialize Secure Clearance Handshake</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t text-center text-[10px] text-slate-400 font-mono">
              Encryption Protocol: SSL TLS v1.3 • AES-256 Handshake
            </div>

            {/* HIGH-FIDELITY BIOMETRIC & KEY SCANNER OVERLAY ANIMATION */}
            <AnimatePresence>
              {isAuthenticating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-white text-center"
                >
                  {validationStage === "fingerprint" && (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-2xl border-2 border-indigo-500 bg-indigo-950/40 flex items-center justify-center overflow-hidden">
                        
                        {/* LASER SCANNING BEAM */}
                        <div 
                          className="absolute w-full h-1 bg-teal-400 shadow-[0_0_12px_rgb(45,212,191)] z-10 animate-rebound"
                          style={{
                            animation: "scanLine 1s ease-in-out infinite"
                          }}
                        />

                        <Fingerprint className="h-14 w-14 text-indigo-400 animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 justify-center">
                          <Fingerprint className="h-4 w-4 text-teal-400 animate-[spin_3s_linear_infinite]" />
                          Interactive Biometric Audit Desk
                        </h4>
                        <p className="text-[11px] text-teal-300 font-mono">
                          Verifying official signature index... {scanProgress}%
                        </p>
                      </div>

                      {/* Cool progress band */}
                      <div className="w-56 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {validationStage === "token" && (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="relative h-16 w-16 bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-white">NHA Token Gateway Safe</h4>
                        <p className="text-[10px] text-slate-400 font-mono bg-slate-900 border px-3 py-1 rounded">
                          {securityKeyInput}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Injecting federated session keys into local memory cache...
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 text-emerald-400 animate-spin" />
                        <span className="text-[9px] text-emerald-400 font-mono tracking-wide uppercase">Registering active session</span>
                      </div>
                    </div>
                  )}

                  {validationStage === "done" && (
                    <div className="space-y-4 flex flex-col items-center">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-16 w-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <CheckCircle2 className="h-9 w-9" />
                      </motion.div>
                      <div>
                        <h4 className="font-extrabold text-base text-white">Clearance Accepted!</h4>
                        <p className="text-xs text-slate-300 mt-1">
                          Welcome back, <strong>{selectedPanelist?.name}</strong>. Redirecting to sovereign dashboard...
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

    </div>
  );
}
