import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, Plus, LogOut, CheckSquare, Square, Clipboard, Info, ShieldCheck, 
  Heart, ThermometerSun, Sparkles, AlertTriangle, Search, Activity, Sliders, 
  Shield, Printer, Check, Baby, Clock, ShieldAlert, CheckCircle2, ChevronRight, X
} from "lucide-react";
import { HospitalBed, Patient, Encounter } from "../types";

interface NurseViewProps {
  patients: Patient[];
  beds: HospitalBed[];
  encounters: Encounter[];
  onAllocateBed: (bedId: string, patientId: string, patientName: string) => void;
  onReleaseBed: (bedId: string) => void;
  onDispenseMedication: (encounterId: string, medIndex: number) => void;
}

interface NewbornBaby {
  id: string;
  babyName: string;
  gender: "Boy" | "Girl" | "Twins" | "Other";
  motherName: string;
  motherId: string;
  birthDate: string;
  weight: number; // in kg
  gestationalWeeks: number;
  apgar1: number;
  apgar5: number;
  bassinetNumber: string;
  status: "Normal / Healthy Care" | "Phototherapy Enabled" | "Critical NICU Monitoring" | "Observation Stage";
  phototherapyOn: boolean;
  incubatorTemp: number; // in °C
  heartRate: number;
  respRate: number;
  spo2: number;
  nextFeedDue: string;
}

export default function NurseView({ patients, beds, encounters, onAllocateBed, onReleaseBed, onDispenseMedication }: NurseViewProps) {
  // Active Submenu Navigation state
  const [currentSubTab, setCurrentSubTab] = useState<"beds" | "nursery" | "mar" | "icu" | "handover">("beds");

  // --- SUBMENU 1: WARD BED LOGS & ALLOCATION STATES ---
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [targetPatientId, setTargetPatientId] = useState(patients[0]?.id || "");
  const [showAllocatePopup, setShowAllocatePopup] = useState(false);
  const [bedCategoryFilter, setBedCategoryFilter] = useState<string>("All");
  
  // Custom Dynamic Bed Creator State - Allows user to scale sandbox clinic capacity
  const [localBeds, setLocalBeds] = useState<HospitalBed[]>([]);
  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [newBedNumber, setNewBedNumber] = useState("");
  const [newBedType, setNewBedType] = useState<'General Ward' | 'Semi Private' | 'Private' | 'ICU' | 'NICU' | 'PICU' | 'Isolation Ward'>("General Ward");
  const [newBedPrice, setNewBedPrice] = useState("500");

  // --- SUBMENU 2: NEWBORN NURSERY HUB STATES ---
  const [nurseryBabies, setNurseryBabies] = useState<NewbornBaby[]>([
    {
      id: "NEWBORN-101",
      babyName: "Baby Boy of Priyanka Devi",
      gender: "Boy",
      motherName: "Priyanka Devi Patel",
      motherId: "UHID-291024",
      birthDate: "2026-05-25T04:30:00Z",
      weight: 2.85,
      gestationalWeeks: 38,
      apgar1: 8,
      apgar5: 9,
      bassinetNumber: "Bassinet N-01",
      status: "Normal / Healthy Care",
      phototherapyOn: false,
      incubatorTemp: 36.5,
      heartRate: 142,
      respRate: 46,
      spo2: 99,
      nextFeedDue: "In 1 Hour 15 Mins"
    },
    {
      id: "NEWBORN-102",
      babyName: "Baby Girl of Priyanka Devi",
      gender: "Girl",
      motherName: "Priyanka Devi Patel",
      motherId: "UHID-291024",
      birthDate: "2026-05-25T04:34:00Z",
      weight: 2.45,
      gestationalWeeks: 38,
      apgar1: 6,
      apgar5: 8,
      bassinetNumber: "Bassinet N-02",
      status: "Phototherapy Enabled",
      phototherapyOn: true,
      incubatorTemp: 36.8,
      heartRate: 146,
      respRate: 48,
      spo2: 97,
      nextFeedDue: "In 45 Mins"
    }
  ]);

  const [showNewBabyForm, setShowNewBabyForm] = useState(false);
  const [newBabyNameInput, setNewBabyNameInput] = useState("");
  const [newBabyMomId, setNewBabyMomId] = useState(patients[0]?.id || "");
  const [newBabyGenderInput, setNewBabyGenderInput] = useState<"Boy" | "Girl" | "Twins" | "Other">("Boy");
  const [newBabyWeightInput, setNewBabyWeightInput] = useState("3.1");
  const [newBabyGestational, setNewBabyGestational] = useState("39");
  const [newBabyApgar1, setNewBabyApgar1] = useState("8");
  const [newBabyApgar5, setNewBabyApgar5] = useState("9");
  const [newBabyBassinetInput, setNewBabyBassinetInput] = useState("Bassinet N-03");
  const [newBabyCareCategory, setNewBabyCareCategory] = useState<"Normal" | "NICU" | "Phototherapy">("Normal");

  // --- SUBMENU 3: HOURLY MAR SCHEDULE STATES ---
  const [selectedHourSlot, setSelectedHourSlot] = useState<"08:00 AM" | "12:00 PM" | "04:00 PM" | "08:00 PM">("08:00 AM");
  const [marSignatureNurse, setMarSignatureNurse] = useState("Officer Rosamma Varghese");
  const [showMedicationInfoModal, setShowMedicationInfoModal] = useState<any | null>(null);
  
  // Custom local MAR logs
  const [adHocMarLogs, setAdHocMarLogs] = useState<{ id: string; patientName: string; medicine: string; dosage: string; frequency: string; timestamp: string; signedBy: string }[]>([
    {
      id: "LOG-5512",
      patientName: "Ramesh Chandra Kumar",
      medicine: "Metformin 500mg",
      dosage: "1 Tab",
      frequency: "1-0-1",
      timestamp: "2026-05-28T08:00:00Z",
      signedBy: "Officer Sr. Rosamma"
    }
  ]);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedDose, setCustomMedDose] = useState("");
  const [customMedPatientId, setCustomMedPatientId] = useState(patients[0]?.id || "");

  // --- SUBMENU 4: ICU / PYCHIC CARE MONITORING ---
  const [icuTriageLevel, setIcuTriageLevel] = useState<"stable" | "fever" | "hypoxic" | "crisis">("stable");
  const [ventilatorMode, setVentilatorMode] = useState("PEEP Standard Support");
  const [oxygenFlow, setOxygenFlow] = useState("4 L/min");
  const [tidalVolume, setTidalVolume] = useState("420 mL");
  const [fiO2Percent, setFiO2Percent] = useState("40%");
  const [icuTelemetryBp, setIcuTelemetryBp] = useState("120/80");
  const [icuTelemetryHr, setIcuTelemetryHr] = useState(72);
  const [icuTelemetryTemp, setIcuTelemetryTemp] = useState(98.6);
  const [icuTelemetrySpo2, setIcuTelemetrySpo2] = useState(99);
  const [icuTelemetryRr, setIcuTelemetryRr] = useState(16);
  const [showCodeBlueAlert, setShowCodeBlueAlert] = useState(false);

  // --- SUBMENU 5: SHIFT HANDOVER STATES ---
  const [handoverLogs, setHandoverLogs] = useState<{ id: string; time: string; text: string; author: string; bedNo: string; severity: "Normal" | "Caution" | "Major Alarm" }[]>([
    {
      id: "HND-001",
      time: "2026-05-28T06:00:00Z",
      text: "[SBAR Report] Bed GW-01: Priyanka Devi Patel stable post-recovery check. Administered evening IV fluids. Incubator bassinets N-01 and N-02 inspected; vital signals optimal.",
      author: "Officer Sr. Rosamma",
      bedNo: "GW-01",
      severity: "Normal"
    }
  ]);
  const [sbarSituation, setSbarSituation] = useState("");
  const [sbarBackground, setSbarBackground] = useState("");
  const [sbarAssessment, setSbarAssessment] = useState("");
  const [sbarRecommendation, setSbarRecommendation] = useState("");
  const [handoverTargetBed, setHandoverTargetBed] = useState("GW-01");
  const [handoverSeverity, setHandoverSeverity] = useState<"Normal" | "Caution" | "Major Alarm">("Normal");

  // Sync vital variables when ICU state filter shifts
  useEffect(() => {
    if (icuTriageLevel === "stable") {
      setIcuTelemetryBp("118/74");
      setIcuTelemetryHr(74);
      setIcuTelemetryTemp(98.4);
      setIcuTelemetrySpo2(99);
      setIcuTelemetryRr(15);
      setVentilatorMode("PEEP Assist/Control");
    } else if (icuTriageLevel === "fever") {
      setIcuTelemetryBp("130/85");
      setIcuTelemetryHr(104);
      setIcuTelemetryTemp(102.4);
      setIcuTelemetrySpo2(96);
      setIcuTelemetryRr(22);
      setVentilatorMode("PEEP Temperature Compensated");
    } else if (icuTriageLevel === "hypoxic") {
      setIcuTelemetryBp("98/60");
      setIcuTelemetryHr(118);
      setIcuTelemetryTemp(99.0);
      setIcuTelemetrySpo2(88); // CRITICAL LOW
      setIcuTelemetryRr(28);
      setVentilatorMode("High Frequency Oscillatory");
    } else if (icuTriageLevel === "crisis") {
      setIcuTelemetryBp("82/45");
      setIcuTelemetryHr(148);
      setIcuTelemetryTemp(97.2);
      setIcuTelemetrySpo2(81);
      setIcuTelemetryRr(34);
      setVentilatorMode("BiPAP Mask Mode Peak Safety");
    }
  }, [icuTriageLevel]);

  // Merge pre-existing beds list from database api with custom added beds
  const allAvailableBeds = [...beds, ...localBeds];

  // Bed filtering based on UI Category Selector
  const filteredBeds = allAvailableBeds.filter(bed => {
    if (bedCategoryFilter === "All") return true;
    return bed.type === bedCategoryFilter;
  });

  // Bed allocation & discharge functions
  const handleOpenAllocation = (bedId: string) => {
    setSelectedBedId(bedId);
    setShowAllocatePopup(true);
  };

  const handleAllocationSubmit = () => {
    if (!selectedBedId || !targetPatientId) return;
    const patObj = patients.find(p => p.id === targetPatientId);
    if (!patObj) return;

    // Check if bed is inside regional local state or API state
    const isLocal = localBeds.some(b => b.id === selectedBedId);
    if (isLocal) {
      setLocalBeds(prev => prev.map(b => b.id === selectedBedId ? {
        ...b,
        status: "Occupied",
        patientId: patObj.id,
        patientName: patObj.name,
        admittedAt: new Date().toISOString()
      } : b));
      alert(`Capacity Bed ${selectedBedId} successfully allocated locally!`);
    } else {
      onAllocateBed(selectedBedId, patObj.id, patObj.name);
    }
    
    setShowAllocatePopup(false);
    setSelectedBedId(null);
  };

  const executeReleaseBed = (bedId: string) => {
    if (confirm("Are you sure you want to vacate and discharge this bed block? Total charges ledger will be computed.")) {
      const isLocal = localBeds.some(b => b.id === bedId);
      if (isLocal) {
        setLocalBeds(prev => prev.map(b => b.id === bedId ? {
          ...b,
          status: "Available",
          patientId: undefined,
          patientName: undefined,
          admittedAt: undefined
        } : b));
        alert(`Capacity Bed Block ${bedId} vacating status processed!`);
      } else {
        onReleaseBed(bedId);
      }
    }
  };

  // Create additional bed block locally
  const handleCreateCustomBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNumber.trim()) return;
    const newId = `LOCAL-B-${Math.floor(200 + Math.random() * 800)}`;
    const createdBed: HospitalBed = {
      id: newId,
      bedNumber: newBedNumber.toUpperCase(),
      type: newBedType,
      pricePerDay: parseFloat(newBedPrice) || 500,
      status: "Available"
    };
    setLocalBeds([...localBeds, createdBed]);
    setNewBedNumber("");
    setShowAddBedForm(false);
    alert(`Successfully installed bed ${newBedNumber.toUpperCase()} into Ward Management matrix!`);
  };

  // Add shift notes
  const addHandoverNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbarSituation.trim() && !sbarAssessment.trim()) return;

    const formattedText = `[SBAR Shift Log - Bed ${handoverTargetBed}] \nSITUATION: ${sbarSituation}\nBACKGROUND: ${sbarBackground}\nASSESSMENT: ${sbarAssessment}\nRECOMMENDATION: ${sbarRecommendation}`;
    const newLog = {
      id: `HND-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toISOString(),
      text: formattedText,
      author: marSignatureNurse,
      bedNo: handoverTargetBed,
      severity: handoverSeverity
    };
    
    setHandoverLogs([newLog, ...handoverLogs]);
    setSbarSituation("");
    setSbarBackground("");
    setSbarAssessment("");
    setSbarRecommendation("");
    alert(`Bedside SBAR Shift Handover logged for Bed ${handoverTargetBed}!`);
  };

  const deleteHandoverLog = (id: string) => {
    setHandoverLogs(prev => prev.filter(l => l.id !== id));
  };

  // Add newborn infant register
  const handleRegisterNewborn = (e: React.FormEvent) => {
    e.preventDefault();
    const mom = patients.find(p => p.id === newBabyMomId);
    if (!mom) return;

    const formattedName = newBabyNameInput ? newBabyNameInput : `Baby ${newBabyGenderInput === 'Boy' ? 'Boy' : 'Girl'} of ${mom.name}`;
    const apg1 = parseInt(newBabyApgar1) || 9;
    const apg5 = parseInt(newBabyApgar5) || 10;
    const gestational = parseInt(newBabyGestational) || 39;
    const wgt = parseFloat(newBabyWeightInput) || 3.1;

    let initialStatus: NewbornBaby["status"] = "Normal / Healthy Care";
    if (newBabyCareCategory === "NICU") initialStatus = "Critical NICU Monitoring";
    if (newBabyCareCategory === "Phototherapy") initialStatus = "Phototherapy Enabled";

    const newBaby: NewbornBaby = {
      id: `NEWBORN-${Math.floor(200 + Math.random() * 800)}`,
      babyName: formattedName,
      gender: newBabyGenderInput,
      motherName: mom.name,
      motherId: mom.id,
      birthDate: new Date().toISOString(),
      weight: wgt,
      gestationalWeeks: gestational,
      apgar1: apg1,
      apgar5: apg5,
      bassinetNumber: newBabyBassinetInput,
      status: initialStatus,
      phototherapyOn: newBabyCareCategory === "Phototherapy",
      incubatorTemp: newBabyCareCategory === "NICU" ? 37.0 : 36.5,
      heartRate: newBabyCareCategory === "NICU" ? 152 : 140,
      respRate: newBabyCareCategory === "NICU" ? 54 : 44,
      spo2: newBabyCareCategory === "NICU" ? 96 : 99,
      nextFeedDue: "In 2 Hours"
    };

    setNurseryBabies([...nurseryBabies, newBaby]);
    setNewBabyNameInput("");
    setShowNewBabyForm(false);
    alert(`Infant ${formattedName} admitted in Newborn Nursery ${newBabyBassinetInput}!`);
  };

  // Trigger adHoc dose administration
  const administerAdHocDose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim() || !customMedDose.trim()) return;

    const targetPatient = patients.find(p => p.id === customMedPatientId);
    const patientName = targetPatient ? targetPatient.name : "Walk-in Patient";

    const customLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      medicine: customMedName,
      dosage: customMedDose,
      frequency: "1-0-1",
      timestamp: new Date().toISOString(),
      signedBy: marSignatureNurse
    };

    setAdHocMarLogs([customLog, ...adHocMarLogs]);
    setCustomMedName("");
    setCustomMedDose("");
    alert(`Custom Dose of ${customMedName} administered & signed!`);
  };

  // Toggle phototherapy for baby
  const togglePhototherapy = (babyId: string) => {
    setNurseryBabies(prev => prev.map(bb => {
      if (bb.id === babyId) {
        const nextState = !bb.phototherapyOn;
        return {
          ...bb,
          phototherapyOn: nextState,
          status: nextState ? "Phototherapy Enabled" : "Normal / Healthy Care",
          spo2: nextState ? 98 : 99
        };
      }
      return bb;
    }));
  };

  const updateIncubatorTemp = (babyId: string, delta: number) => {
    setNurseryBabies(prev => prev.map(bb => {
      if (bb.id === babyId) {
        return {
          ...bb,
          incubatorTemp: parseFloat((bb.incubatorTemp + delta).toFixed(1))
        };
      }
      return bb;
    }));
  };

  const resetFeedTimerRef = (babyId: string) => {
    setNurseryBabies(prev => prev.map(bb => {
      if (bb.id === babyId) {
        return {
          ...bb,
          nextFeedDue: "Scheduled Just Now (Due in 3h)"
        };
      }
      return bb;
    }));
    alert("Newborn feeding calendar slot updated successfully!");
  };

  // Find active prescriptions across system encounters
  const activePrxList: { encounterId: string; patientName: string; medicine: string; generic: string; dosage: string; frequency: string; duration: string; index: number; dispensed?: boolean }[] = [];
  
  encounters.forEach(enc => {
    if (enc.prescriptions) {
      enc.prescriptions.forEach((p, idx) => {
        activePrxList.push({
          encounterId: enc.id,
          patientName: enc.patientName,
          medicine: p.medicine,
          generic: p.generic,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          index: idx,
          dispensed: p.dispensed
        });
      });
    }
  });

  return (
    <div className="space-y-6 select-none font-sans text-left" id="nursery-bed-panel-workspace">
      
      {/* HEADER BANNER CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-indigo-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest bg-indigo-100 text-indigo-800 px-2.0 py-0.5 rounded-sm uppercase">
                Facility Code Master: IN-MH-BD44
              </span>
              <span className="text-[9px] font-black tracking-wider bg-rose-50 text-rose-700 border border-rose-150 px-1.5 py-0.5 rounded-sm select-none">
                CRITICAL MONITOR LIVE
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 mt-1">Multi-Specialty Nursery, Ward & Intelligent Bed Registry</h2>
            <p className="text-xs text-slate-500 font-medium">Coordinate NICU/Baby bassinets, nurse MAR administrations, active ward census, and SBAR bedside shift logs cooperatively.</p>
          </div>
        </div>
        
        {/* State Indicators */}
        <div className="flex gap-2 bg-slate-50/70 p-1.5 rounded-xl border border-slate-150 text-xs shrink-0 font-mono">
          <div className="px-2 py-1 text-center border-r border-slate-200">
            <span className="text-[8px] text-slate-400 block font-bold uppercase">WARD CAPACITY</span>
            <strong className="text-slate-900 text-sm">
              {allAvailableBeds.filter(b => b.status === "Occupied").length} / {allAvailableBeds.length}
            </strong>
          </div>
          <div className="px-2 py-1 text-center">
            <span className="text-[8px] text-emerald-600 block font-bold uppercase">BABIES ACTIVE</span>
            <strong className="text-emerald-800 text-sm">{nurseryBabies.length}</strong>
          </div>
        </div>
      </div>

      {/* SUBMENU NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 font-sans max-w-full overflow-x-auto scrollbar-none">
        <button
          onClick={() => setCurrentSubTab("beds")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            currentSubTab === "beds"
              ? "bg-white text-indigo-950 shadow-xs border-b border-indigo-400"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>🛏️</span> Ward Bed Registry
        </button>
        <button
          onClick={() => setCurrentSubTab("nursery")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            currentSubTab === "nursery"
              ? "bg-white text-indigo-950 shadow-xs border-b border-indigo-400"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Baby className="h-4.5 w-4.5 text-rose-500" /> Newborn Nursery & Bassinets
        </button>
        <button
          onClick={() => setCurrentSubTab("mar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            currentSubTab === "mar"
              ? "bg-white text-indigo-950 shadow-xs border-b border-indigo-400"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>💊</span> Hourly MAR Ledger
        </button>
        <button
          onClick={() => setCurrentSubTab("icu")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            currentSubTab === "icu"
              ? "bg-white text-indigo-950 shadow-xs border-b border-indigo-400"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Activity className="h-4.5 w-4.5 text-indigo-600" /> ICU & PICU Telemetry
        </button>
        <button
          onClick={() => setCurrentSubTab("handover")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            currentSubTab === "handover"
              ? "bg-white text-indigo-950 shadow-xs border-b border-indigo-400"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Clipboard className="h-4.5 w-4.5 text-slate-600" /> Bed Shift Handovers
        </button>
      </div>

      {/* SUBTAB CONTENTS COMPONENT SWITCHER */}

      {/* --- SUBTAB 1: WARD BED CENSUS --- */}
      {currentSubTab === "beds" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    Admission Ward Occupancy Census Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">Live grid deployment to general, private cabins, ICU rooms, and specialty isolation beds.</p>
                </div>
                
                {/* Ward filters */}
                <div className="flex flex-wrap items-center gap-1">
                  {["All", "General Ward", "Semi Private", "Private", "ICU", "NICU", "PICU", "Isolation Ward"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setBedCategoryFilter(cat)}
                      className={`text-[10px] py-1 px-2 font-bold rounded-md border cursor-pointer transition ${
                        bedCategoryFilter === cat 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Bed Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredBeds.map(bed => {
                  const isOccupied = bed.status === "Occupied";
                  const isLocal = bed.id.startsWith("LOCAL-");
                  return (
                    <div
                      key={bed.id}
                      className={`rounded-xl border p-4.5 transition hover:shadow-xs relative ${
                        isOccupied
                          ? "bg-rose-50/20 border-rose-200"
                          : "bg-emerald-50/20 border-emerald-250/60"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-black text-slate-800 bg-white shadow-3xs px-1.5 py-0.5 rounded border border-slate-250">
                          {bed.bedNumber} {isLocal && "• Capacity Node"}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded select-none border ${
                            isOccupied
                              ? "bg-rose-50 text-rose-700 border-rose-200/50"
                              : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {bed.status}
                        </span>
                      </div>

                      <h4 className="text-[10px] font-black text-slate-400 mt-2.5 uppercase tracking-widest leading-none">{bed.type}</h4>
                      
                      {isOccupied ? (
                        <div className="mt-3.5 space-y-1 bg-white p-2.5 rounded-lg border border-rose-100/70 text-xs">
                          <p className="font-extrabold text-slate-900 truncate">{bed.patientName}</p>
                          <p className="text-[10px] text-slate-450 font-mono">UHID: {bed.patientId}</p>
                          {bed.admittedAt && (
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Placed: {new Date(bed.admittedAt).toLocaleDateString()}</p>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => executeReleaseBed(bed.id)}
                            className="mt-3 w-full border border-rose-205 hover:bg-rose-50 text-rose-700 text-[10.5px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <LogOut className="h-3 w-3" /> Discharge & Free Bed
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3.5 space-y-1 text-xs">
                          <p className="text-slate-505 font-medium">Standard nursing support included.</p>
                          <p className="text-[10.5px] text-slate-700 font-bold font-mono">Charge: ₹{bed.pricePerDay}/Day</p>

                          <button
                            type="button"
                            onClick={() => handleOpenAllocation(bed.id)}
                            className="mt-3.5 w-full bg-slate-900 hover:bg-slate-800 text-slate-100 text-[10.5px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Plus className="h-3 w-3" /> Assign Admitted Patient
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            {/* Dynamic Bed Creator Box */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  🛡️ Manage Ward Capacity Scales
                </h4>
                <p className="text-xs text-slate-500 font-medium">Temporarily deploy emergency reserve beds to satisfy incoming patient influxes.</p>
              </div>

              {showAddBedForm ? (
                <form onSubmit={handleCreateCustomBed} className="bg-white p-5 rounded-2xl border border-slate-205 space-y-4 shadow-sm text-left animate-in fade-in zoom-in-95 duration-150">
                  <h5 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex justify-between items-center">
                    <span>Add New Bed Assignment Node</span>
                    <button type="button" onClick={() => setShowAddBedForm(false)} className="text-slate-400 hover:text-slate-650 font-black text-lg transition-transform hover:scale-110">×</button>
                  </h5>
                  <div>
                    <label className="block text-[9.5px] text-slate-700 font-extrabold tracking-wider uppercase mb-1.5">BED NUMBER CODE *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICU-04, PRIVATE-102"
                      value={newBedNumber}
                      onChange={(e) => setNewBedNumber(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-slate-800 transition"
                      id="input-bed-number"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-700 font-extrabold tracking-wider uppercase mb-1.5">WARD CLASSIFICATION CLASS *</label>
                    <select
                      value={newBedType}
                      onChange={(e) => setNewBedType(e.target.value as any)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-slate-800 transition bg-white"
                      id="select-bed-type"
                    >
                      {["General Ward", "Semi Private", "Private", "ICU", "NICU", "PICU", "Isolation Ward"].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-700 font-extrabold tracking-wider uppercase mb-1.5">SIMULATED DAILY FACILITY PRICING (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newBedPrice}
                      onChange={(e) => setNewBedPrice(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-slate-800 transition"
                      id="input-bed-price"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-lg cursor-pointer transition shadow-xs"
                    id="btn-deploy-custom-bed"
                  >
                    Deploy New Bed To Active Census
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddBedForm(true)}
                  className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 border-dashed rounded-xl py-4.5 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  id="btn-activate-add-bed"
                >
                  <Plus className="h-5 w-5 text-indigo-500" /> Install Emergency Reserve Bed Node
                </button>
              )}

              {/* LIVE CAPACITY SCALES MONITOR TABLE */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 mt-4 space-y-3 shadow-3xs" id="capacity-scales-monitor-table">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1">
                    📋 Deployed Space Capacity Scales ({allAvailableBeds.length})
                  </span>
                  <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-55 text-emerald-50 px-1.5 py-0.5 rounded leading-none border border-emerald-300/40 uppercase">
                    live grid
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left text-[11px] text-slate-750">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-2 pl-3">Designation CODE</th>
                        <th className="p-2">Classification</th>
                        <th className="p-2">daily Rate</th>
                        <th className="p-2 text-center text-slate-400">status</th>
                        <th className="p-2 pr-3 text-right">actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allAvailableBeds.map((bed, idx) => {
                        const isOccupied = bed.status === "Occupied";
                        const isLocal = bed.id.startsWith("LOCAL-");
                        return (
                          <tr key={bed.id || idx} className="hover:bg-slate-50/60 transition-colors font-mono text-[10.5px]">
                            <td className="p-2 pl-3 font-semibold text-slate-900">
                              <span className="flex items-center gap-1">
                                {bed.bedNumber}
                                {isLocal && <span className="text-[7px] font-sans font-bold bg-indigo-50 text-indigo-600 px-1 rounded-sm border border-indigo-200/40 shrink-0">Scale</span>}
                              </span>
                            </td>
                            <td className="p-2 text-slate-500 font-sans">{bed.type}</td>
                            <td className="p-2 font-bold text-slate-800">₹{bed.pricePerDay}</td>
                            <td className="p-2 text-center">
                              <span className={`text-[8.5px] font-bold font-sans uppercase px-1.5 py-0.3 rounded border ${
                                isOccupied 
                                  ? "bg-rose-50 text-rose-700 border-rose-200/50" 
                                  : "bg-emerald-50 text-emerald-705 border-emerald-250/50"
                              }`}>
                                {bed.status}
                              </span>
                            </td>
                            <td className="p-2 pr-3 text-right">
                              {isLocal ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isOccupied) {
                                      alert("Cannot dismantle an allocated bed block while occupied. Discharge the patient first.");
                                    } else {
                                      setLocalBeds(prev => prev.filter(b => b.id !== bed.id));
                                    }
                                  }}
                                  className="text-rose-502 hover:bg-rose-50 text-xs font-bold font-sans px-1.5 py-0.5 rounded border border-rose-200 hover:border-rose-400 transition"
                                >
                                  Dismantle
                                </button>
                              ) : (
                                <span className="text-[9px] font-sans text-slate-400">Base Master</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status and instructions */}
              <div className="text-xs space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Instructions:</span>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Hospital beds created from this control console exist inside the local sandbox context and allow placing any patient in search indices. Standard hospital rules are triggered on allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: NEWBORN NURSERY & BABY BASSINETS --- */}
      {currentSubTab === "nursery" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200" id="nursery-crib-grid">
          {/* Main Bassinets Area */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    🍼 Live Neonatal Bassinet & NICU Incubator Monitoring Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">Track newborn weight indices, custom phototherapy triggers, temperature bounds, and active parent linkages.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewBabyForm(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Register Newborn Admission
                </button>
              </div>

              {/* Dynamic Bassinets cards list! */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nurseryBabies.map(baby => {
                  const hasAlert = baby.heartRate > 150 || baby.spo2 < 95;
                  const isPhototherapyOn = baby.phototherapyOn;
                  
                  return (
                    <div
                      key={baby.id}
                      className={`rounded-xl border p-4.5 transition duration-200 relative ${
                        isPhototherapyOn 
                          ? "ring-2 ring-cyan-500 bg-cyan-50/10 shadow-md shadow-cyan-100/35 border-cyan-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Phototherapy Glowing Backdrop Overlay */}
                      {isPhototherapyOn && (
                        <div className="absolute inset-0 bg-cyan-400/5 rounded-xl pointer-events-none animate-pulse" />
                      )}

                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-black text-slate-900 bg-slate-100 border border-slate-250 px-2 py-0.5 rounded shadow-3xs flex items-center gap-1">
                          <Baby className="h-3 w-3 text-indigo-505" /> {baby.bassinetNumber}
                        </span>
                        
                        <span
                          className={`text-[9.5px] font-black uppercase tracking-wide px-2 py-0.5 rounded border select-none ${
                            isPhototherapyOn
                              ? "bg-cyan-100 text-cyan-800 border-cyan-300 animate-pulse"
                              : hasAlert
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {baby.status}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-xs font-black text-slate-900">{baby.babyName}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Mother: <span className="font-semibold text-slate-700">{baby.motherName}</span> ({baby.motherId})</p>
                      </div>

                      {/* Vital Data micro grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-150 my-3 font-mono text-[10.5px]">
                        <div>
                          <span className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Birth Weight</span>
                          <strong className="text-slate-800">{baby.weight} kg</strong>
                        </div>
                        <div>
                          <span className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Gestation</span>
                          <strong className="text-slate-800">{baby.gestationalWeeks} Wks</strong>
                        </div>
                        <div>
                          <span className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider block">APGAR (1m/5m)</span>
                          <strong className="text-slate-800">{baby.apgar1} / {baby.apgar5}</strong>
                        </div>
                      </div>

                      {/* Live Telemetry monitor mimics */}
                      <div className="bg-slate-900 text-cyan-400 p-2.5 rounded-lg font-mono text-[11px] border border-slate-950 space-y-1 my-3">
                        <div className="flex justify-between items-center text-[8px] uppercase font-bold text-slate-450 tracking-widest border-b border-slate-800 pb-1">
                          <span>ICU Sensor Telemetry</span>
                          <span className="text-[7.5px] bg-cyan-950 px-1 py-0.5 text-cyan-300 rounded leading-none shrink-0">Live q5s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Heart Rate: <strong className="text-white">{baby.heartRate} bpm</strong></span>
                          <span>Rr Rate: <strong className="text-white">{baby.respRate}/m</strong></span>
                          <span>SpO2: <strong className="text-white">{baby.spo2}%</strong></span>
                        </div>
                      </div>

                      {/* Interactive Bedside Controls */}
                      <div className="border-t border-slate-100 pt-3 mt-3.5 space-y-2.5 text-xs">
                        {/* Incubator Temperature controller */}
                        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-201 text-[11px]">
                          <span className="font-bold text-slate-600 flex items-center gap-1">
                            <ThermometerSun className="h-3.5 w-3.5 text-amber-500" /> Incubator Temp:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateIncubatorTemp(baby.id, -0.1)}
                              className="w-5 h-5 bg-white text-slate-900 border rounded cursor-pointer hover:bg-slate-100 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold font-mono text-slate-850 px-1">{baby.incubatorTemp} °C</span>
                            <button
                              type="button"
                              onClick={() => updateIncubatorTemp(baby.id, 0.1)}
                              className="w-5 h-5 bg-white text-slate-900 border rounded cursor-pointer hover:bg-slate-100 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Feeding schedule info */}
                        <div className="flex items-center justify-between text-[11.5px] bg-slate-50 p-1.5 rounded-lg border border-slate-201">
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-500" /> Feeding Index:
                          </span>
                          <span className="text-slate-800 font-bold font-mono">{baby.nextFeedDue}</span>
                          <button
                            type="button"
                            onClick={() => resetFeedTimerRef(baby.id)}
                            className="text-[9px] bg-white border border-slate-300 text-slate-705 px-1.5 py-0.5 rounded cursor-pointer font-bold hover:bg-slate-100"
                          >
                            Feed
                          </button>
                        </div>

                        {/* Blue Light Phototherapy Controller */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => togglePhototherapy(baby.id)}
                            className={`w-full text-center font-bold text-xs py-1.5 px-3.5 rounded-md border cursor-pointer transition ${
                              isPhototherapyOn
                                ? "bg-cyan-600 border-cyan-600 text-white shadow-2xs hover:bg-cyan-700"
                                : "bg-slate-50 border-slate-300 text-slate-705 hover:bg-slate-100"
                            }`}
                          >
                            {isPhototherapyOn ? "💙 Shut Down Phototherapy Light" : "💡 Engage UV Blue-Light Phototherapy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* New baby registering modal form overlay or right box context */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-rose-50/30 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  👶 Register Neonatal Crib Slot
                </h4>
                <p className="text-xs text-slate-500 font-medium font-sans">Enroll a newly-delivered infant into the hospital pediatric sandbox nursery index.</p>
              </div>

              {showNewBabyForm ? (
                <form onSubmit={handleRegisterNewborn} className="bg-white p-4.5 rounded-xl border border-slate-205 space-y-3.5">
                  <h5 className="font-bold text-xs text-slate-800 border-b pb-1 flex justify-between items-center">
                    <span>Admit Infant Baby form</span>
                    <button type="button" onClick={() => setShowNewBabyForm(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
                  </h5>
                  
                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Select Mother / Parent *</label>
                    <select
                      value={newBabyMomId}
                      onChange={(e) => setNewBabyMomId(e.target.value)}
                      className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Custom Baby Name / Tag (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Baby of Priyanka (Male)"
                      value={newBabyNameInput}
                      onChange={(e) => setNewBabyNameInput(e.target.value)}
                      className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Gender *</label>
                      <select
                        value={newBabyGenderInput}
                        onChange={(e) => setNewBabyGenderInput(e.target.value as any)}
                        className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden"
                      >
                        <option value="Boy">Boy</option>
                        <option value="Girl">Girl</option>
                        <option value="Twins">Twins</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Bassinet Allocation *</label>
                      <input
                        type="text"
                        required
                        value={newBabyBassinetInput}
                        onChange={(e) => setNewBabyBassinetInput(e.target.value)}
                        className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Birth Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newBabyWeightInput}
                        onChange={(e) => setNewBabyWeightInput(e.target.value)}
                        className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Gestate (Weeks)</label>
                      <input
                        type="number"
                        required
                        value={newBabyGestational}
                        onChange={(e) => setNewBabyGestational(e.target.value)}
                        className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-1">
                      <label className="block text-[9px] text-slate-450 font-bold uppercase mb-1">APGAR 1m</label>
                      <input
                        type="number"
                        value={newBabyApgar1}
                        onChange={(e) => setNewBabyApgar1(e.target.value)}
                        className="w-full text-xs border border-slate-250 rounded p-1.5 outline-hidden font-mono"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[9px] text-slate-450 font-bold uppercase mb-1">APGAR 5m</label>
                      <input
                        type="number"
                        value={newBabyApgar5}
                        onChange={(e) => setNewBabyApgar5(e.target.value)}
                        className="w-full text-xs border border-slate-250 rounded p-1.5 outline-hidden font-mono"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[9px] text-slate-450 font-bold uppercase mb-1">Care Setup</label>
                      <select
                        value={newBabyCareCategory}
                        onChange={(e) => setNewBabyCareCategory(e.target.value as any)}
                        className="w-full text-xs border border-slate-250 rounded p-1.5 outline-hidden font-sans"
                      >
                        <option value="Normal">Normal</option>
                        <option value="NICU">NICU</option>
                        <option value="Phototherapy">UV Lamp</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-2 rounded-lg cursor-pointer transition"
                  >
                    Admit Newborn to Bassinet Catalog
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewBabyForm(true)}
                  className="w-full bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 border-dashed rounded-xl py-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Baby className="h-5 w-5 text-rose-500" /> Enroll Newborn Infant Crib
                </button>
              )}

              {/* REGISTERED NEWBORN ADMISSIONS TABLE */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3 shadow-3xs" id="neonatal-admissions-monitor-table">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1">
                    👶 Registered Newborn Admissions ({nurseryBabies.length})
                  </span>
                  <span className="text-[8px] font-mono font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded leading-none border border-rose-200 uppercase">
                    nursery index
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[220px] scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left text-[11px] text-slate-750">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-2 pl-3">Infant Name</th>
                        <th className="p-2">Details</th>
                        <th className="p-2">Mother</th>
                        <th className="p-2">Bassinet</th>
                        <th className="p-2 text-right pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {nurseryBabies.map((baby, idx) => {
                        return (
                          <tr key={baby.id || idx} className="hover:bg-slate-50/60 transition-colors font-sans text-[11px]">
                            <td className="p-2 pl-3">
                              <div className="font-bold text-slate-900 leading-tight">{baby.babyName}</div>
                              <div className="text-[9px] font-mono text-slate-400 font-semibold">{baby.id}</div>
                            </td>
                            <td className="p-2">
                              <div className="text-slate-700 font-medium">{baby.gender} • {baby.weight} kg</div>
                              <div className="text-[9px] text-slate-500 font-mono">{baby.gestationalWeeks} wks gestation</div>
                            </td>
                            <td className="p-2 text-slate-600">
                              <div className="font-medium text-slate-700">{baby.motherName}</div>
                              <div className="text-[9px] font-mono text-slate-400">{baby.motherId}</div>
                            </td>
                            <td className="p-2">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs">{baby.bassinetNumber}</span>
                            </td>
                            <td className="p-2 pr-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setNurseryBabies(prev => prev.filter(b => b.id !== baby.id));
                                }}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200 hover:border-rose-400 transition cursor-pointer"
                              >
                                Discharge
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {nurseryBabies.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic text-xs">
                            No registered neonatal admissions currently on ward.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stat Card */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed font-sans">
                💡 <strong>Dynamic Nursery Status:</strong> All newborns are synchronized automatically with respective parent charts to support M3 ABDM health lockers and PMJAY newborn pediatric surgery approvals.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: HOURLY MAR LEDGER --- */}
      {currentSubTab === "mar" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Active Prescriptions Medication Registry */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    💊 Patient Medication Administration Record (MAR)
                  </h3>
                  <p className="text-[11px] text-slate-500">Hourly clinic dosing ledger matching doctor EMR prescriptions to nurse dispatch.</p>
                </div>

                {/* Hour slots selector */}
                <select
                  value={selectedHourSlot}
                  onChange={(e) => setSelectedHourSlot(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-250 rounded-lg p-1.5 font-bold text-indigo-900 outline-hidden"
                >
                  <option value="08:00 AM">08:00 AM Slot (Morning Daily)</option>
                  <option value="12:00 PM">12:00 PM Slot (Afternoon Daily)</option>
                  <option value="04:00 PM">04:00 PM Slot (Evening Daily)</option>
                  <option value="08:00 PM">08:00 PM Slot (Night Bedtime)</option>
                </select>
              </div>

              {/* Table ledger */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-w-full">
                <table className="w-full text-xs text-left text-slate-750">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[9.5px] uppercase font-bold tracking-wider text-slate-505">
                    <tr>
                      <th className="p-3">Admitted Patient Demographics</th>
                      <th className="p-3">Prescribed Medicine Name</th>
                      <th className="p-3">Dose Index</th>
                      <th className="p-3 font-mono">Frequency</th>
                      <th className="p-3">Allergy safety</th>
                      <th className="p-3 text-right">MAR Dispensation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {activePrxList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-450 font-medium">
                          No active pharmacological orders detected in the system repository. Set prescriptions in the EMR panel to view hourly schedules.
                        </td>
                      </tr>
                    ) : (
                      activePrxList.map((med, i) => {
                        const patObj = patients.find(p => p.name === med.patientName);
                        const allergiesStr = patObj?.insuranceType === "Cashless PM-JAY" ? "NKA" : "Penicillin Alert";
                        
                        return (
                          <tr key={i} className="hover:bg-slate-50/70 transition">
                            <td className="p-3">
                              <strong className="text-slate-900 text-xs block">{med.patientName}</strong>
                              <span className="text-[10px] text-slate-450 font-mono block">Encounter Ref: {med.encounterId}</span>
                            </td>
                            <td className="p-3">
                              <p className="font-extrabold text-slate-850">{med.medicine}</p>
                              <p className="text-[10px] font-mono text-slate-400 font-semibold">{med.generic}</p>
                            </td>
                            <td className="p-3 font-mono font-medium text-slate-805">{med.dosage}</td>
                            <td className="p-3 font-mono text-indigo-800 font-bold">{med.frequency}</td>
                            <td className="p-3">
                              {allergiesStr !== "NKA" ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9.5px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                                  ⚠️ PENICILLIN
                                </span>
                              ) : (
                                <span className="text-[9.5px] text-slate-400 bg-slate-100 border px-1 rounded">No Allergies</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {med.dispensed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold px-2 py-0.8 rounded-md select-none">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 fill-emerald-110" /> Administered and Signed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDispenseMedication(med.encounterId, med.index);
                                    // Add to signature logs
                                    const mockLog = {
                                      id: `LOG-${Math.floor(1000 + Math.random() * 90) * 10}`,
                                      patientName: med.patientName,
                                      medicine: med.medicine,
                                      dosage: med.dosage,
                                      frequency: med.frequency,
                                      timestamp: new Date().toISOString(),
                                      signedBy: marSignatureNurse
                                    };
                                    setAdHocMarLogs(prev => [mockLog, ...prev]);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg select-none transition cursor-pointer"
                                >
                                  Mark Dispensed
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Local signed off logs table */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-xs text-slate-800 border-b pb-2 flex items-center justify-between">
                  <span>📝 Hourly Active Administered & Signed-Off Medication Record Logs</span>
                  <span className="text-[10px] font-mono text-slate-450">signed off by nurse in charge</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {adHocMarLogs.map(log => (
                    <div key={log.id} className="bg-slate-50 p-3 rounded-lg border text-xs leading-normal">
                      <div className="flex justify-between font-mono text-[9px] text-slate-400 font-semibold mb-1 border-b border-slate-200 pb-1">
                        <span>Session Ref ID: {log.id}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="font-semibold text-slate-900">{log.patientName}</p>
                      <p className="text-slate-650 mt-0.5">Administered: <strong className="text-indigo-900">{log.medicine} ({log.dosage})</strong> under frequency schedule {log.frequency}.</p>
                      <p className="text-[9.5px] mt-1.5 text-slate-450 block font-sans">Verified by Signature Badge ID: <strong>{log.signedBy}</strong></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Hand: Log STAT Ad-hoc Medication Code */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  💊 Administer & Sign STAT Doses
                </h4>
                <p className="text-xs text-slate-500 font-medium font-sans">Log custom emergency meds, injections, or fluid infusions not in routine EMR logs.</p>
              </div>

              <form onSubmit={administerDose => administerAdHocDose(administerDose)} className="bg-slate-50 p-4.5 rounded-xl border border-slate-205 space-y-3.5">
                <div>
                  <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Nurse Signature Badge *</label>
                  <input
                    type="text"
                    required
                    value={marSignatureNurse}
                    onChange={(e) => setMarSignatureNurse(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden focus:border-indigo-400 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Target Patient UHID *</label>
                  <select
                    value={customMedPatientId}
                    onChange={(e) => setCustomMedPatientId(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-sans"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">STAT Medication Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Injection Ceftriaxone 1g, Ringers Lactate 500ml"
                    value={customMedName}
                    onChange={(e) => setCustomMedName(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">STAT Dose Parameters *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IV Stat, 1 Amp, 100ml/hr"
                    value={customMedDose}
                    onChange={(e) => setCustomMedDose(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded p-2 outline-hidden font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition"
                >
                  Administer Dose & Log Sign-Off
                </button>
              </form>

              {/* Advisory note */}
              <div className="bg-rose-50/20 p-3.5 rounded-xl border border-rose-200">
                <span className="text-[10px] font-black text-rose-700 tracking-wider uppercase block mb-1">Allergy Safety Check active:</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  The software checks Aadhaar connected safety registries and warns instantly if a patient is administered penicillin or beta-lactam families in high severity alert modes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: ICU / PICU LIVE MONITORING --- */}
      {currentSubTab === "icu" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200" id="icu-telemetry-panel">
          {/* Main Waveforms simulation block */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl border border-slate-900 shadow-md relative overflow-hidden">
              
              {/* Telemetry CRT screen grids */}
              <div className="rounded-xl border border-emerald-950 p-4.5 bg-black space-y-5">
                <div className="flex items-center justify-between border-b border-emerald-950/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[9.5px] font-mono tracking-widest text-emerald-500 font-extrabold uppercase">
                      MULTIPARAMETER PATIENT MONITOR CRT SLOT - BED ICU-01
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono bg-emerald-955 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded leading-none select-none">
                    AMBEDKAR LIVE TELEMETRY V3.1
                  </span>
                </div>

                {/* Oscilloscope Waveform simulator mimics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 relative h-28 bg-slate-950 rounded-lg overflow-hidden border border-emerald-950/60 p-2 text-[9px] font-mono">
                    <span className="text-emerald-500 uppercase tracking-widest block font-bold">EKG (II) Live trace</span>
                    {/* Simulated pulse wave */}
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around pointer-events-none opacity-85">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 w-16 flex items-center justify-center relative">
                          {/* Fake EKG peak */}
                          <svg className="w-full h-full text-emerald-400 stroke-2 fill-none" viewBox="0 0 100 100">
                            <path d="M 0,50 L 30,50 L 35,20 L 40,80 L 45,50 L 52,50 L 55,42 L 58,50 L 100,50" className="animate-pulse" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right hand numeric parameters blocks */}
                  <div className="col-span-1 border border-emerald-950/80 rounded bg-emerald-950/10 p-2.5 font-mono space-y-2 select-none">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider block text-emerald-500/70">Arterial Pulse</span>
                      <strong className="text-2xl text-emerald-400 font-black">{icuTelemetryHr}</strong>
                      <span className="text-[8px] text-emerald-500/50 block font-normal">bpm</span>
                    </div>
                    <div className="border-t border-emerald-950/60 pt-1">
                      <span className="text-[8px] uppercase tracking-wider block text-emerald-500/70">Non-Invasive BP</span>
                      <strong className="text-sm text-zinc-100 font-black">{icuTelemetryBp}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 relative h-28 bg-slate-950 rounded-lg overflow-hidden border border-emerald-950/60 p-2 text-[9px] font-mono">
                    <span className="text-cyan-400 uppercase tracking-widest block font-bold">Plethysmograph wave (SpO2)</span>
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around pointer-events-none opacity-50">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-1/3 flex items-center justify-center relative">
                          <svg className="w-full h-full text-cyan-400 stroke-2 fill-none" viewBox="0 0 100 100">
                            <path d="M 0,50 C 25,20 25,85 50,50 C 75,20 75,85 100,50" className="animate-pulse" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-1 border border-emerald-950/80 rounded bg-emerald-950/10 p-2.5 font-mono space-y-2 select-none">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider block text-cyan-400/80">O2 Sat (SpO2)</span>
                      <strong className="text-2xl text-cyan-400 font-black">{icuTelemetrySpo2}%</strong>
                      <span className="text-[8px] text-cyan-500/50 block font-normal text-right">Alarm: &lt;90%</span>
                    </div>
                    <div className="border-t border-emerald-950/60 pt-1">
                      <span className="text-[8px] uppercase tracking-wider block text-emerald-505">Temp • Core °F</span>
                      <strong className="text-xs text-white block">{icuTelemetryTemp} °F</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* central alarm broadcast trigger */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-950/40 border border-rose-900/60 p-4.5 rounded-xl text-xs mt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 bg-red-600 rounded-full animate-ping shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-red-400 leading-tight">National Registry central ER Trigger</h5>
                    <p className="text-slate-400 text-[11px] font-sans">Simulate and push state critical alarms directly to hospital control panels.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeBlueAlert(true);
                      alert("⚠️ CODE BLUE BROADCASTED across sandbox telemetry gateways!");
                    }}
                    className="bg-red-650 hover:bg-red-700 text-white font-black text-[11px] py-2 px-4 rounded-lg cursor-pointer transition"
                  >
                    🚨 Broadcast central CODE BLUE
                  </button>
                  {showCodeBlueAlert && (
                    <button
                      type="button"
                      onClick={() => setShowCodeBlueAlert(false)}
                      className="bg-slate-800 text-slate-300 font-medium text-[11px] py-1 px-2.0 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ICU controller box */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  🎛️ ICU Ventilator Triage Station
                </h4>
                <p className="text-xs text-slate-500 font-medium font-sans">Simulate vital anomalies and tune ventilation rates hourly.</p>
              </div>

              {/* Triage states trigger buttons */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-201 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Simulate Bed Patient State:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIcuTriageLevel("stable")}
                    className={`p-2 rounded font-bold transition text-[11px] cursor-pointer ${
                      icuTriageLevel === "stable" ? "bg-emerald-600 text-white shadow-xs" : "bg-white hover:bg-slate-100 border text-slate-700"
                    }`}
                  >
                    Stable State
                  </button>
                  <button
                    type="button"
                    onClick={() => setIcuTriageLevel("fever")}
                    className={`p-2 rounded font-bold transition text-[11px] cursor-pointer ${
                      icuTriageLevel === "fever" ? "bg-amber-600 text-white shadow-xs" : "bg-white hover:bg-slate-100 border text-slate-705"
                    }`}
                  >
                    Hyperthermia Fever
                  </button>
                  <button
                    type="button"
                    onClick={() => setIcuTriageLevel("hypoxic")}
                    className={`p-2 rounded font-bold transition text-[11px] cursor-pointer ${
                      icuTriageLevel === "hypoxic" ? "bg-rose-600 text-white shadow-xs" : "bg-white hover:bg-slate-100 border text-slate-705"
                    }`}
                  >
                    Hypoxia Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => setIcuTriageLevel("crisis")}
                    className={`p-2 rounded font-bold transition text-[11px] cursor-pointer ${
                      icuTriageLevel === "crisis" ? "bg-red-700 text-white shadow-xs" : "bg-white hover:bg-slate-100 border text-slate-705"
                    }`}
                  >
                    Cardio-Vascular Shock
                  </button>
                </div>
              </div>

              {/* Ventilator controls */}
              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-205 space-y-3.5">
                <h5 className="font-black text-xs text-slate-800 border-b pb-1 flex items-center gap-1">
                  <Sliders className="h-4 w-4 text-indigo-600" /> Ventilator Calibration Setting
                </h5>

                <div>
                  <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Ventilation Operation Mode</label>
                  <input
                    type="text"
                    value={ventilatorMode}
                    onChange={(e) => setVentilatorMode(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-250 rounded p-2 focus:border-indigo-400 outline-hidden bg-white text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Oxygen Infuse (FiO2)</label>
                    <input
                      type="text"
                      value={fiO2Percent}
                      onChange={(e) => setFiO2Percent(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-250 rounded p-2 focus:border-indigo-400 outline-hidden bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Oxygen Speed</label>
                    <input
                      type="text"
                      value={oxygenFlow}
                      onChange={(e) => setOxygenFlow(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-250 rounded p-2 focus:border-indigo-400 outline-hidden bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Tidal Volume *</label>
                    <input
                      type="text"
                      value={tidalVolume}
                      onChange={(e) => setTidalVolume(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-250 rounded p-2 focus:border-indigo-400 outline-hidden bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-455 font-black uppercase mb-1">Assigned Respiration Rate *</label>
                    <input
                      type="number"
                      value={icuTelemetryRr}
                      onChange={(e) => setIcuTelemetryRr(parseInt(e.target.value) || 16)}
                      className="w-full text-xs font-mono border border-slate-250 rounded p-2 focus:border-indigo-400 outline-hidden bg-white text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Ventilator calibrations sent over pediatric Bed telemetry socket!")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition text-center"
                >
                  Synchronize Ventilator Calibrations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 5: SHIFT HANDOVER LOGS --- */}
      {currentSubTab === "handover" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200" id="shift-handover-session">
          {/* Main List Handovers Area */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  📝 Nursing Shift Handover Logs Ledger (SBAR Standard)
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Log SBAR parameters (Situation, Background, Assessment, Recommendation) during changes of active duty nurse personnel.</p>
              </div>

              {/* Records Loop */}
              <div className="space-y-4 max-h-[480px] overflow-y-auto scrollbar-none pr-1">
                {handoverLogs.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-semibold">No registered shift handovers in historical registries.</p>
                ) : (
                  handoverLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-4.5 rounded-xl border text-xs leading-relaxed relative hover:shadow-2xs transition duration-150 text-left ${
                        log.severity === "Major Alarm"
                          ? "bg-rose-50 border-rose-355"
                          : log.severity === "Caution"
                          ? "bg-amber-50/50 border-amber-250"
                          : "bg-slate-50 border-slate-205"
                      }`}
                    >
                      <div className="flex justify-between font-mono text-[9.5px] text-slate-450 font-semibold mb-2 pb-1.5 border-b border-dashed border-slate-250">
                        <span className="flex items-center gap-1 uppercase tracking-wide">
                          Session {log.id} • Bed: <span className="font-sans font-black text-slate-800">{log.bedNo}</span>
                        </span>
                        <span>{new Date(log.time).toLocaleString()}</span>
                      </div>

                      <div className="whitespace-pre-line text-slate-850 font-medium text-xs leading-relaxed">
                        {log.text}
                      </div>

                      <div className="flex items-center justify-between mt-3.5 border-t border-slate-200/80 pt-2.5">
                        <span className="text-[10px] text-slate-505 font-semibold">
                          Logged by Outgoing Nurse: <strong className="text-slate-800 font-serif italic font-extrabold">{log.author}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const printText = `--- NURSING HANDOVER SLIP ---\nID: ${log.id}\nTime: ${new Date(log.time).toLocaleString()}\nSigned By: ${log.author}\nBed: ${log.bedNo}\n\n${log.text}`;
                              navigator.clipboard.writeText(printText);
                              alert("Copied shift handover slip content to clipboard!");
                            }}
                            className="bg-white border rounded font-bold hover:bg-slate-100 text-[10px] p-1.5 cursor-pointer text-slate-700"
                          >
                            Copy Content
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHandoverLog(log.id)}
                            className="text-rose-650 hover:bg-rose-100/50 p-1 rounded-lg border border-transparent transition cursor-pointer font-bold"
                          >
                            Delete log
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Form box */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  📝 Log SBAR Shift Handover Note
                </h4>
                <p className="text-xs text-slate-500 font-medium font-sans">SBAR structured bedside handover documentation prevents clinical errors.</p>
              </div>

              <form onSubmit={addHandoverNote} className="space-y-3 bg-slate-50 p-4.5 border border-slate-205 rounded-xl text-xs">
                
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[9px] text-slate-450 font-black uppercase mb-1">Target Bed Number *</label>
                    <select
                      value={handoverTargetBed}
                      onChange={(e) => setHandoverTargetBed(e.target.value)}
                      className="w-full text-xs border border-slate-250 rounded p-1.5 outline-hidden"
                    >
                      {allAvailableBeds.map(b => (
                        <option key={b.id} value={b.bedNumber}>{b.bedNumber} ({b.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-450 font-black uppercase mb-1">Triage Severity *</label>
                    <select
                      value={handoverSeverity}
                      onChange={(e) => setHandoverSeverity(e.target.value as any)}
                      className="w-full text-xs border border-slate-250 rounded p-1.5 outline-hidden font-bold"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Caution">Caution</option>
                      <option value="Major Alarm">Major Alarm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-450 font-black uppercase mb-0.5">SITUATION (Current condition) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Post-op coronary bypass check"
                    value={sbarSituation}
                    onChange={(e) => setSbarSituation(e.target.value)}
                    className="w-full text-xs border border-slate-250 bg-white rounded p-1.5 outline-hidden focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-450 font-black uppercase mb-0.5">BACKGROUND (Brief history)</label>
                  <input
                    type="text"
                    placeholder="e.g. Admitted 2 days ago, PMJAY approved"
                    value={sbarBackground}
                    onChange={(e) => setSbarBackground(e.target.value)}
                    className="w-full text-xs border border-slate-250 bg-white rounded p-1.5 outline-hidden focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-450 font-black uppercase mb-0.5">ASSESSMENT (Your clinical opinion) *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Stable vitals checked. PEEP support optimal."
                    value={sbarAssessment}
                    onChange={(e) => setSbarAssessment(e.target.value)}
                    className="w-full text-xs border border-slate-250 bg-white rounded p-1.5 outline-hidden focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-455 font-black uppercase mb-0.5">RECOMMENDATION (Suggestions next shift) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Continue hourly vitals check, check incision site"
                    value={sbarRecommendation}
                    onChange={(e) => setSbarRecommendation(e.target.value)}
                    className="w-full text-xs border border-slate-250 bg-white rounded p-1.5 outline-hidden focus:border-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition select-none"
                >
                  Log Shift Handover Slip Note
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- SELECTED PATIENT ALLOCATION MODAL POPUP --- */}
      {showAllocatePopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans select-none text-left">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
              <span>🛏️</span> Allocate Selected Bed Block
            </h3>
            
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-455 font-bold uppercase mb-1">Target Patient UHID *</label>
                <select
                  value={targetPatientId}
                  onChange={(e) => setTargetPatientId(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250 rounded p-2 focus:outline-hidden"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-450 mt-1 italic">Only admitted or recommended outpatient candidates from central directory are shown.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAllocatePopup(false);
                  setSelectedBedId(null);
                }}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-655 font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAllocationSubmit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer shadow-sm"
              >
                Confirm Placement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
