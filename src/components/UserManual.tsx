import { useState } from "react";
import { 
  BookOpen, X, Search, CheckCircle2, ChevronRight, HelpCircle, 
  Terminal, ShieldCheck, FileText, Activity, Heart, Award, Key, MapPin
} from "lucide-react";

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: string;
  onSwitchRole: (role: string) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function UserManual({ isOpen, onClose, activeRole, onSwitchRole }: UserManualProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Local interactive checklists for the user to mark items as they play in the sandbox
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>({
    receptionist: [
      { id: "r1", text: "Register a new patient demographic profile in the system", completed: false },
      { id: "r2", text: "Simulate a live 'Scan & Share' QR token exchange from ABHA Patient Portal", completed: false },
      { id: "r3", text: "Link a registered patient ID with their live ABHA Master Entry", completed: false },
      { id: "r4", text: "Add a custom ABHA demographic record directly inside Master Tables", completed: false },
    ],
    doctor: [
      { id: "d1", text: "Check active diagnostic OPD/IPD doctor encounter queue", completed: false },
      { id: "d2", text: "Bind an active diagnosis with a standard ICD-10 clinical code classification", completed: false },
      { id: "d3", text: "Log a complete EHR profile containing care referrals & structured medical orders", completed: false },
      { id: "d4", text: "File an electronic digital clinical pharmacy prescription for pharmacist fulfillment", completed: false },
    ],
    nurse: [
      { id: "n1", text: "Admit an active clinical patient into a general or high-intensity ICU bed", completed: false },
      { id: "n2", text: "Audit the available hospital bed indexes / census dashboard live", completed: false },
      { id: "n3", text: "Dispense prescribed medications and log compliance via eMAR tracker", completed: false },
    ],
    ayushmanmitra: [
      { id: "am1", text: "Verify patient's golden card coverage and process PM-JAY entitlement", completed: false },
      { id: "am2", text: "Initiate a cashless PM-JAY pre-authorization package claim request", completed: false },
      { id: "am3", text: "Attach legal claim diagnosis codes and verify standard CDSCO protocols", completed: false },
    ],
    lab: [
      { id: "l1", text: "Access LIS / Radiology diagnostic panel to view ordered pathology requests", completed: false },
      { id: "l2", text: "Input quantitative laboratory reports (blood, imaging, or physical parameters)", completed: false },
      { id: "l3", text: "Approve lab results and sign off securely onto patient digital health locker", completed: false },
    ],
    pharmacy: [
      { id: "p1", text: "Check pharmacy fulfillment queue for active doctor prescriptions", completed: false },
      { id: "p2", text: "Validate inventory levels and click 'Mark Dispensed' to clear logs", completed: false },
      { id: "p3", text: "Review payment calculation summary for PM-JAY cashless zero-billing compliance", completed: false },
    ],
    inventory: [
      { id: "i1", text: "Open 'Store & Inventory' and view central registered consumable digital assets", completed: false },
      { id: "i2", text: "Fill out the 'Add New Consumable' register with legal classification details", completed: false },
      { id: "i3", text: "Verify real-time stock levels and low-reorder alert thresholds", completed: false },
      { id: "i4", text: "Draft a new Procurement Purchase Order (PO) or review GRN receipts", completed: false },
    ],
    superadmin: [
      { id: "s1", text: "Access Central Audit & Database Sandbox Explorer console tabs", completed: false },
      { id: "s2", text: "Add a database row directly into Master Tables using 'Execute Insert' schema editor", completed: false },
      { id: "s3", text: "Initiate the cryptographic SHA-256 HMAC system integrity scan", completed: false },
    ],
    patient: [
      { id: "pa1", text: "Toggle to Patient Portal tab simulating citizen's personal mobile interface", completed: false },
      { id: "pa2", text: "Review combined electronic clinical health records compiled from active encounters", completed: false },
      { id: "pa3", text: "Review active ABDM consent mandates, grant permissions, or print customized ABHA Cards", completed: false },
    ]
  });

  const toggleChecklist = (role: string, id: string) => {
    setChecklists(prev => ({
      ...prev,
      [role]: prev[role].map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    }));
  };

  const overviewGuide = {
    title: "National Health Authority • Sandbox Operations Handbook",
    intro: "Welcome to the MediNexus National Health Sandbox, engineered to prototype, audit, and simulate complete end-to-end patient care pathways aligned with India's Ayushman Bharat Digital Mission (ABDM) and PM-JAY standards. This desk consolidates nine distinct roles into a fully synchronized sandbox terminal.",
    sections: [
      {
        title: "🔑 Core Architectural Pillars",
        items: [
          "ABDM ABHA Address: Unique clinical identifier allowing instant consent-driven record pulling.",
          "PM-JAY Gold Card Cashless Claims: Interactive pre-authorization workflow with automatic package cost deduction.",
          "HFR (Health Facility Registry) & HPR (Healthcare Professionals Registry): Standardized resource lists and practitioner verifications.",
          "FHIR v4 Standard compliant care record structures for secure electronic health transmission."
        ]
      }
    ]
  };

  const guides: Record<string, {
    title: string;
    icon: string;
    badges: string[];
    purpose: string;
    steps: string[];
    tips: string[];
    roleKey: string;
  }> = {
    receptionist: {
      title: "📋 Reception Panel Operations Guide",
      icon: "📋",
      badges: ["Patient Registry", "ABHA Verification", "Demographic Intake"],
      purpose: "Frontline clinical intake desk. Securely register incoming citizens, coordinate 'Scan & Share' ABDM QR authorizations, and associate real-time patient IDs with the overall ABHA Registry.",
      steps: [
        "Go to the 'Reception Panel' in the main navbar.",
        "To register a patient manually, use the 'Admit / Register New Patient' module. Provide unique demographics like Father/Spouse, Gender, Date of Birth, and Phone Number.",
        "To simulate mobile-based QR code check-in, click 'Start Live Scan & Share Gateway' under ABDM QR Scanner section. This initiates a real-time token.",
        "Link existing profiles with the public ABHA database instantly or trace verified patient indices."
      ],
      tips: [
        "Use the QR Code Simulator on the patient side to experience seamless one-click demographic parsing.",
        "Ensure all required fields marked with * are filled to maintain system registration validation integrity."
      ],
      roleKey: "receptionist"
    },
    doctor: {
      title: "🩺 Doctor EMR Clinical Portal Guide",
      icon: "🩺",
      badges: ["Care Plan", "ICD-10 Diagnoses", "Prescription e-Signing"],
      purpose: "Central EMR workspace tailored for clinical practitioners. Allows listing checkup queues, binding standard diagnoses, and prescribing items mapped directly to the local pharmacy ledger.",
      steps: [
        "Go to the 'Doctor EMR' tab to initialize clinician desk mode.",
        "Browse the active outpatient checkup logs list under 'OPD Consultations Queue'.",
        "Select a patient to access their customized clinical record writer.",
        "Fill out clinical observation notes, enter a standard ICD-10 diagnosis code classification, and draft prescription modules.",
        "Select required medications from the dropdown lookup, adjust dosages, and submit to securely compile the Electronic Health Record."
      ],
      tips: [
        "The system enforces standard clinical naming guidelines. Check key references like ICD-10 for accurate diagnoses.",
        "Prescriptions written here sync instantly with the Pharmacy Unit, ready for digital dispensing."
      ],
      roleKey: "doctor"
    },
    nurse: {
      title: "🏥 Nurse & Bed Management Portal Guide",
      icon: "🏥",
      badges: ["Ward Bed Census", "eMAR Dosage Administration", "Hospitalization Protocols"],
      purpose: "Eradicates paper-based tracking. Enables ward administrators to allocate emergency / intensive ICU beds and execute clinical care dosage checking via eMAR records.",
      steps: [
        "Access the 'Nurse / Bed Panel' from the top bar.",
        "Review the live 'Hospital Bed Real-Time Census Tracker' covering Intensive ICU, Pediatric, Isolation, and Executive units.",
        "Allocate a clean, available bed in any wing to an active, admitted clinically stable patient.",
        "Under ‘eMAR (Electronic Medication Administration Record) Queue’, cross-check incoming instructions from attending physicians.",
        "Select the prescribed medication batch number, check current volumes, and click 'Mark Dispensed' to log precise administration history."
      ],
      tips: [
        "Beds display explicit occupancy meters. Always transition patients back using the ‘Release Bed’ switch once discharged.",
        "Dosage administration audits are updated inside the system ledger trace to maintain complete sandbox visibility."
      ],
      roleKey: "nurse"
    },
    ayushmanmitra: {
      title: "🛡️ Ayushman Mitra PM-JAY Cashless Claims Guide",
      icon: "🛡️",
      badges: ["NHA Golden Card", "PM-JAY Pre-Auth", "Cashless Package Auditing"],
      purpose: "The official PM-JAY desk. Authenticates beneficiary package eligibility, creates cashless pre-authorization files, and forwards paperwork for expedited claim audits.",
      steps: [
        "Navigate to the 'Ayushman Mitra' desk of the sandbox.",
        "Examine the 'PM-JAY Beneficiary Screening' section to confirm if the citizen possesses a valid, authenticated Golden Card.",
        "Under the 'Pre-Authorization & Claims Ledger' click 'Create New Cashless Pre-Auth Sheet'.",
        "Select the targeted patient, select an approved PM-JAY Package Code (e.g., General Surgery, Neonatology, Cardiology), and input diagnostic medical records.",
        "Submit the document. The claim is queued immediately into 'Active Pre-Auth Submissions Dashboard' pending NHA settlement evaluation."
      ],
      tips: [
        "Under PM-JAY guidelines, eligible items are fully covered. Double-check package numbers to trigger 100% cashless discount computations in patient billing.",
        "Audit the claim state updates across status queues: 'Approved', 'Queried', or 'Processed'."
      ],
      roleKey: "ayushmanmitra"
    },
    labstaff: {
      title: "🔬 LIS / Radiology Diagnostic Desk Guide",
      icon: "🔬",
      badges: ["Laboratory Information System", "Specimen Handshake", "PACS Radiology"],
      purpose: "Hosts diagnostic pathology and imaging processes in the health layout. Input qualitative numerical results synced directly into citizen records.",
      steps: [
        "Click on the 'LIS / Radiology' tab.",
        "Under the 'Diagnostic Requests Queue', select active pathology requests ordered by the attending clinicians.",
        "Click on 'Enter Test Results'. Input qualitative, validated diagnostic metrics (e.g. Platelets, Hemoglobin, Creatinine, X-Ray imaging findings).",
        "Authorize and sign off the report. The values are automatically synchronized into the secure Patient Health Locker database sandbox."
      ],
      tips: [
        "All data structured here complies with HL7 LOINC and standard diagnostic reference intervals.",
        "Patients can view finalized pathology records immediately via their own 'Patient Portal' dashboard."
      ],
      roleKey: "lab"
    },
    pharmacy: {
      title: "💊 Pharmacy Dispensing Unit Guide",
      icon: "💊",
      badges: ["Prescription Queue", "Pharma Inventory Check", "Dynamic Real-Time Billing"],
      purpose: "Administers dispensary operations. Tracks medical compound volumes, analyzes prescription details, and concludes dispensing transactions.",
      steps: [
        "Go to the 'Pharmacy Unit' tab.",
        "Inspect the live prescription list under 'Doctor Prescriptions Queue'.",
        "Select a patient's pending prescription to review compound details, dosages, and batch metrics.",
        "Click 'Dispense Prescription & Clear' to log item removal and generate the digital payment invoice summary."
      ],
      tips: [
        "If a patient is verified under PM-JAY, a 100% cashless PM-JAY waiver is computed automatically.",
        "Verify remaining quantities. If a formula is low, notify the store supervisor to initiate stock requisition."
      ],
      roleKey: "pharmacy"
    },
    inventory: {
      title: "📦 Store & Consumable Inventory Guide",
      icon: "📦",
      badges: ["Consumable Asset Register", "GRN Cargo Logs", "Procurement Purchase Orders"],
      purpose: "Ensures back-end warehouse sustainability. Register raw medical consumables, review incoming logistics Cargo Receipts (GRN), and draft procurement purchase orders.",
      steps: [
        "Select the 'Store & Inventory' tab in the navbar.",
        "Use the 'Add New Consumable Asset Register' sub-tab to input legal assets (name, category classification, vendor, cost, custom batch, expiration date).",
        "Submit to save the data to the central database register, instantly updating the right-side live asset ledger table.",
        "To review incoming logistics, navigate to 'GRN Receipts Ledger' and record Cargo loads.",
        "Confirm PO drafts or track assets that dip below the low reorder warning boundary."
      ],
      tips: [
        "We've added an interactive Live Asset Ledger side-by-side with the entry form for real-time visualization!",
        "Low-reorder items highlight with pulsing red warnings, telling you exactly when items need restocked."
      ],
      roleKey: "inventory"
    },
    superadmin: {
      title: "📊 Central Audit & Sandbox DB Console Guide",
      icon: "📊",
      badges: ["Master Table Schemas", "Cryptographic Checks", "Audit Trails Log"],
      purpose: "Maintains maximum backend control. Examine database schemas, modify or insert database rows into master tables, and perform cryptographic digest validations.",
      steps: [
        "Navigate to the 'Central Audit' panel.",
        "Under 'Master Tables', switch between critical database indices like Patients, Doctors, Abha Master Records, Departments, and Admissions.",
        "Click 'Add Row' on any active table to open a schema-aware insert form paired with a live dataset preview layout.",
        "Under 'System Integrity Analytics' tab, perform the cryptographic check to scan health records against checksum alterations.",
        "Track audit logs tracking every critical sandbox action made during the live browser session."
      ],
      tips: [
        "Use the Master Tables live preview side-by-side display to confirm database alterations immediately upon input.",
        "All additions made here reflect globally, updating receptionist, nurse, or billing view indexes in real-time."
      ],
      roleKey: "superadmin"
    },
    patient: {
      title: "👤 Patient Self-Access EHR Portal Guide",
      icon: "👤",
      badges: ["Citizen Health Locker", "ABDM Consent Gateway", "Interactive ABHA Card"],
      purpose: "Citizen-centric mobile digital assistant. Allows patients to review electronic logs aggregated across inpatient and outpatient visits, handle medical consents, and print ABHA assets.",
      steps: [
        "Select the 'Patient Portal' tab in the main navbar.",
        "Click 'Digital Health Records' to pull up a compiled list of physical observation files, lab summaries, and active medications.",
        "Click 'ABDM Consent Gateway' to grant, deny, or revoke granular records sharing requests from third-party clinics.",
        "Go to 'National Health ABHA Card' to view and print your fully-customized digital citizen wallet card containing custom verification stamps."
      ],
      tips: [
        "This portal gives a real-time representation of how Indian citizens control their clinical data under ABDM consent architectures.",
        "Print layout scales perfectly formatted for digital or physical wallets."
      ],
      roleKey: "patient"
    }
  };

  const currentGuide = guides[activeTab];

  // Simple basic search function
  const filteredTips = searchQuery.trim() === "" 
    ? [] 
    : Object.values(guides).filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.badges.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="bg-slate-50 w-full max-w-4xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200"
        id="user-manual-panel"
      >
        {/* Government Style Header Strip */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-950 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-505 bg-indigo-600 rounded-lg text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold tracking-widest text-indigo-300 uppercase bg-slate-800/80 px-2 py-0.5 rounded border border-indigo-500/20">
                  Interactive Handbook
                </span>
                <span className="flex items-center gap-0.5 text-[8.5px] font-mono text-emerald-400 font-bold">
                  <ShieldCheck className="h-3 w-3" /> NHA v1.4
                </span>
              </div>
              <h2 className="text-sm font-extrabold tracking-tight mt-1 flex items-center gap-1.5 font-sans">
                MediNexus Sandbox Manual & User Guide
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 px-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition text-xs font-mono border border-slate-700/50 flex items-center gap-1 cursor-pointer"
          >
            <X className="h-4 w-4" /> Close [ESC]
          </button>
        </div>

        {/* Global Action Search banner */}
        <div className="bg-white border-b px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs shrink-0 select-none">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search handbook topics, roles or credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2 focus:outline-hidden font-semibold text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Assist Mode:</span>
            <span className="text-xs font-black text-indigo-900 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-md uppercase">
              {activeRole === "AyushmanMitra" ? "AYUSHMAN MITRA" : activeRole} Tab
            </span>
          </div>
        </div>

        {/* Core Book Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Index Sidebar */}
          <div className="w-56 bg-slate-100/90 border-r border-slate-200 p-4 overflow-y-auto style-scroll shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="block text-[9.5px] font-black uppercase text-slate-450 tracking-wider mb-2 pr-1 border-b pb-1">
                  Introduction
                </span>
                <button
                  onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition font-bold flex items-center justify-between ${
                    activeTab === "overview" && searchQuery === ""
                      ? "bg-indigo-600 text-white font-bold" 
                      : "text-slate-650 hover:bg-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Sandbox Concept
                  </span>
                  <ChevronRight className="h-3 w-3 opacity-60" />
                </button>
              </div>

              <div>
                <span className="block text-[9.5px] font-black uppercase text-slate-450 tracking-wider mb-2 pr-1 border-b pb-1">
                  Terminal Desk Roles
                </span>
                <div className="space-y-1">
                  {Object.entries(guides).map(([key, value]) => {
                    const isTabActive = activeTab === key && searchQuery === "";
                    return (
                      <button
                        key={key}
                        onClick={() => { setActiveTab(key); setSearchQuery(""); }}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition font-bold flex items-center justify-between ${
                          isTabActive 
                            ? "bg-indigo-600 text-white font-bold" 
                            : "text-slate-650 hover:bg-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-xs shrink-0">{value.icon}</span>
                          <span className="truncate">{value.title.split(" ")[1]} Desk</span>
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-indigo-950/5 border border-indigo-100 p-2.5 rounded-xl mt-4 select-none">
              <span className="text-[8.5px] font-black text-indigo-900 block uppercase tracking-wider">Quick Jump Desk Switch</span>
              <p className="text-[10px] text-slate-500 leading-snug mt-1 font-medium">Click buttons inside user manual tabs to instantly configure active role terminal desks.</p>
            </div>
          </div>

          {/* Guide Viewer Area */}
          <div className="flex-1 bg-white p-6 overflow-y-auto style-scroll font-sans">
            {/* Search Results Display if Query present */}
            {searchQuery.trim() !== "" ? (
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  🔍 Search Results matching &quot;{searchQuery}&quot; ({filteredTips.length})
                </h3>
                {filteredTips.map((g) => (
                  <div key={g.title} className="p-4 border border-slate-150 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition duration-150 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                        <span className="text-sm">{g.icon}</span> {g.title}
                      </h4>
                      <button
                        onClick={() => {
                          onSwitchRole(Object.keys(guides).find(key => guides[key] === g) || "Receptionist");
                          setSearchQuery("");
                          setActiveTab(Object.keys(guides).find(key => guides[key] === g) || "receptionist");
                        }}
                        className="text-[9.5px] font-black text-indigo-600 bg-white border border-indigo-200 rounded px-2 py-0.5 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        Launch Role Terminal
                      </button>
                    </div>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">{g.purpose}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {g.badges.map((b) => (
                        <span key={b} className="text-[9px] font-bold font-mono text-slate-500 bg-slate-100 border px-1.5 rounded-md">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredTips.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold mt-2">No matching help sheets or credentials parsed.</p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] font-black text-indigo-600 hover:underline mt-1 cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === "overview" ? (
              /* Overview handbook section */
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span className="p-1 px-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs rounded-md">🇮🇳</span>
                    {overviewGuide.title}
                  </h3>
                  <div className="h-0.5 bg-indigo-100 w-full mt-2.5 mb-4" />
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {overviewGuide.intro}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#003580] uppercase block">
                    🚀 Instant Sandbox Simulation Quickstart Guide
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                        1. Register Patient Demographics
                      </span>
                      <p className="text-[10.5px] text-slate-500 leading-normal font-medium">
                        Open the <strong>Patient Portal</strong>, click on <i>National Health ABHA Card</i> to copy details. Or, directly type new figures inside <strong>Reception Panel</strong>.
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                        2. Carry out Diagnosis
                      </span>
                      <p className="text-[10.5px] text-slate-500 leading-normal font-medium">
                        Log in as <strong>Doctor</strong> to write encounters, ICD diagnoses, and prescriptions. Your input updates queues globally!
                      </p>
                    </div>
                  </div>
                </div>

                {overviewGuide.sections.map((sect) => (
                  <div key={sect.title} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                      {sect.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {sect.items.map((it, idx) => (
                        <div key={idx} className="p-3 border rounded-xl bg-indigo-50/20 border-indigo-100 flex items-start gap-2.5">
                          <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-semibold text-slate-700 leading-relaxed">
                            {it}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Sandbox specs table */}
                <div className="border border-slate-150 rounded-2xl overflow-hidden font-mono mt-6 select-none shadow-3xs">
                  <div className="bg-slate-50 border-b p-2.5 px-4 text-[8.5px] font-black uppercase text-slate-505 text-slate-500 tracking-wider flex items-center justify-between">
                    <span>Compliant Standard Checklist Parameters</span>
                    <span className="bg-slate-200 px-1 py-0.5 rounded text-[7.5px]">Operational Sandbox</span>
                  </div>
                  <div className="p-3 bg-white space-y-2 text-[10px] text-slate-600">
                    <div className="flex justify-between items-center py-1 border-b border-dashed">
                      <span className="font-sans font-bold text-slate-700">HL7 FHIR Spec v4.0.1</span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-black text-[9px]">COMPLIANT</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-dashed">
                      <span className="font-sans font-bold text-slate-700">ICD-10 Clinical Diagnosis coding</span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-black text-[9px]">COMPLIANT</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-sans font-bold text-slate-700">SHA-256 Block integrity checks</span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-black text-[9px]">COMPLIANT</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Specific Role Guide Section */
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b pb-3.5 select-none">
                  <div>
                    <span className="text-[9px] font-extrabold tracking-wider bg-indigo-50 text-indigo-805 text-indigo-800 border border-indigo-150 px-2.5 py-0.5 rounded uppercase font-mono">
                      Official Role Handbook
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1 flex items-center gap-2">
                      <span className="text-xl">{currentGuide.icon}</span> {currentGuide.title}
                    </h3>
                  </div>
                  
                  {/* Instant Role Config Switcher Button */}
                  <button
                    onClick={() => {
                      onSwitchRole(currentGuide.roleKey === "receptionist" ? "Receptionist" :
                                   currentGuide.roleKey === "doctor" ? "Doctor" :
                                   currentGuide.roleKey === "nurse" ? "Nurse" :
                                   currentGuide.roleKey === "ayushmanmitra" ? "AyushmanMitra" :
                                   currentGuide.roleKey === "lab" ? "LabStaff" :
                                   currentGuide.roleKey === "pharmacy" ? "Pharmacy" :
                                   currentGuide.roleKey === "inventory" ? "Inventory" :
                                   currentGuide.roleKey === "superadmin" ? "SuperAdmin" :
                                   currentGuide.roleKey === "patient" ? "Patient" : "Receptionist");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer select-none"
                    title="Configures main view to display this panel"
                  >
                    <Terminal className="h-3.5 w-3.5 animate-pulse" /> Launch role desk
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {currentGuide.purpose}
                </p>

                <div className="flex flex-wrap gap-1.5 select-none">
                  {currentGuide.badges.map((b) => (
                    <span key={b} className="text-[9px] font-bold text-indigo-755 text-indigo-700 bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Interactive Checklist section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b pb-1 select-none">
                    <span className="text-[9.5px] font-black tracking-widest text-[#003580] uppercase flex items-center gap-1.5">
                      ✅ Interactive Sandbox Drill Progress Checklist
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-500 font-bold">
                      {checklists[currentGuide.roleKey]?.filter(i => i.completed).length} / {checklists[currentGuide.roleKey]?.length} Tasks
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {checklists[currentGuide.roleKey]?.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleChecklist(currentGuide.roleKey, item.id)}
                        className="flex items-start gap-2.5 p-2 px-3 bg-white border border-slate-150 hover:border-slate-350 hover:bg-slate-50/40 rounded-lg transition-all duration-100 cursor-pointer select-none"
                      >
                        <input 
                          type="checkbox" 
                          checked={item.completed}
                          onChange={() => {}} // toggled on container div click
                          className="mt-0.5 h-3.5 w-3.5 rounded-sm text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={`text-[11px] font-semibold tracking-tight leading-relaxed ${item.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflows details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1 select-none">
                    🧭 Detailed Sandbox Execution Procedure
                  </h4>
                  <ol className="space-y-2 text-xs font-semibold text-slate-650 tracking-tight list-decimal pl-4">
                    {currentGuide.steps.map((st, i) => (
                      <li key={i} className="leading-relaxed pl-1">
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Helpful tips card */}
                <div className="bg-amber-50/45 border border-amber-250 p-4 rounded-xl space-y-1.5 select-none hover:bg-amber-50/60 transition duration-150 shadow-3xs">
                  <span className="text-[9px] font-black tracking-widest text-amber-805 text-amber-850 uppercase flex items-center gap-1.5">
                    💡 Official Professional Guidance & Tips
                  </span>
                  <ul className="space-y-1 text-[10.5px] text-amber-900 leading-relaxed font-semibold pl-4 list-disc">
                    {currentGuide.tips.map((tp, idx) => (
                      <li key={idx}>{tp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Govt footer */}
        <div className="bg-slate-150 border-t p-4 px-6 text-slate-525 text-slate-500 text-[10px] font-mono select-none flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <span>🛡️ Sandbox system version v1.4.2 (Secure Build Compliance)</span>
          <span>Compliant to ABDM M1, M2 & M3 protocols</span>
        </div>
      </div>
    </div>
  );
}
