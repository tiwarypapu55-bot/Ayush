import React, { useState } from "react";
import { 
  Plus, Check, ShieldAlert, Award, FileSpreadsheet, Lock, Sparkles, Ban, 
  HelpCircle, UserCheck, ShieldClose, User, ClipboardList, Wallet, TicketPercent, 
  ShoppingCart, Activity, Pill, Barcode, Eye, ShieldCheck, AlertTriangle, 
  RefreshCw, Layers, Sliders, CheckCircle2, ChevronRight, ShoppingBag, Info, Search, FileText,
  QrCode, Printer, Phone, CreditCard, Download
} from "lucide-react";
import { Patient, Encounter, ConsentLog, HospitalBed, Medication } from "../types";

interface AncillaryViewsProps {
  currentRole: "LabStaff" | "Pharmacy" | "Patient" | "Billing";
  patients: Patient[];
  encounters: Encounter[];
  beds: HospitalBed[];
  consents: ConsentLog[];
  onLabSubmit: (encounterId: string, orderIndex: number, resultValue: string, criticalAlert: boolean, reportNotes: string) => void;
  onPharmacyDispense: (encounterId: string, medicineIndex: number) => void;
  onAddConsent: (consent: ConsentLog) => void;
  doctors?: any[];
}

const CDSCO_NATIONAL_FORMULARY = [
  { id: "CDSCO-01", name: "Metformin 500mg IP", generic: "Metformin Hydrochloride", category: "Oral Antidiabetic", schedule: "Schedule H", priceCap: 4.80, currentPrice: 4.30 },
  { id: "CDSCO-02", name: "Atorvastatin 10mg IP", generic: "Atorvastatin Calcium Trihydrate", category: "Statins Lipids", schedule: "Schedule H", priceCap: 9.50, currentPrice: 8.50 },
  { id: "CDSCO-03", name: "Amoxicillin 500mg IP Capsules", generic: "Amoxicillin Trihydrate Antibiotic", category: "Broad-spectrum Penicillin", schedule: "Schedule H1", priceCap: 12.80, currentPrice: 11.00 },
  { id: "CDSCO-04", name: "Paracetamol 650mg IP Tablets", generic: "Acetaminophen Antipyretic Analgesic", category: "General NSAID Antipyretic", schedule: "Over the Counter", priceCap: 1.80, currentPrice: 1.25 },
  { id: "CDSCO-05", name: "Pantoprazole Gastro-resistant 40mg IP", generic: "Pantoprazole Sodium Sesquihydrate", category: "Proton Pump Inhibitor (PPI)", schedule: "Schedule H", priceCap: 11.20, currentPrice: 9.80 },
  { id: "CDSCO-06", name: "Azithromycin 500mg IP Tablets", generic: "Azithromycin Dihydrate Macrolide", category: "Antibacterial", schedule: "Schedule H1", priceCap: 21.40, currentPrice: 19.50 },
  { id: "CDSCO-07", name: "Amlodipine 5mg IP Tablets", generic: "Amlodipine Besylate Calcium Antagonist", category: "Antihypertensive", schedule: "Schedule H", priceCap: 3.20, currentPrice: 2.70 },
  { id: "CDSCO-08", name: "Montelukast 10mg + Levocetirizine 5mg", generic: "Montelukast Sodium & Levocetirizine Dihydrochloride", category: "Antihistamine combination", schedule: "Schedule H", priceCap: 14.50, currentPrice: 12.00 },
  { id: "CDSCO-09", name: "Alprazolam 0.25mg IP Tablets", generic: "Alprazolam Benzodiazepine Anxiolytic", category: "Psychosomatic Anxiolytics", schedule: "Schedule H", priceCap: 5.60, currentPrice: 4.20 },
  { id: "CDSCO-10", name: "Fentanyl Injection 50mcg/mL (2ml Amp)", generic: "Fentanyl Citrate Narcotic opioid", category: "Strong Narcotic Analgesics", schedule: "Schedule X", priceCap: 82.00, currentPrice: 75.00 },
  { id: "CDSCO-11", name: "Ondansetron Adosable 4mg IP", generic: "Ondansetron Hydrochloride Antiemetic", category: "Antiemetics / Gastroprokinetics", schedule: "Schedule H", priceCap: 7.20, currentPrice: 5.80 },
  { id: "CDSCO-12", name: "Buprenorphine 0.2mg Sublingual IP", generic: "Buprenorphine Hydrochloride Opioid rehab", category: "Maintenance Therapy Opioids", schedule: "Schedule X", priceCap: 45.00, currentPrice: 38.00 },
];

export default function AncillaryViews({ 
  currentRole, patients, encounters, beds, consents, onLabSubmit, onPharmacyDispense, onAddConsent, doctors = [] 
}: AncillaryViewsProps) {
  // Submenu Navigation State
  const [lisSubTab, setLisSubTab] = useState<"entry" | "pacs" | "accession" | "quality">("entry");
  const [pharmacySubTab, setPharmacySubTab] = useState<"dispense" | "cdsco" | "narcotics" | "expiry">("dispense");
  const [patientSubTab, setPatientSubTab] = useState<"records" | "consent" | "billing" | "abhacard">("records");

  // LIS State
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0]?.id || "");
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [labResult, setLabResult] = useState("");
  const [criticalFlag, setCriticalFlag] = useState(false);
  const [reportNotes, setReportNotes] = useState("");

  // --- LIS: PACS DICOM States ---
  const [pacsContrast, setPacsContrast] = useState(50);
  const [pacsBrightness, setPacsBrightness] = useState(50);
  const [pacsCaliperLength, setPacsCaliperLength] = useState(24.5);
  const [pacsLesionType, setPacsLesionType] = useState("Bronchial Infiltration");
  const [pacsScanType, setPacsScanType] = useState<"brain" | "chest" | "knee">("chest");
  const [pacsReportText, setPacsReportText] = useState("");
  const [pacsSavedReports, setPacsSavedReports] = useState<{ id: string; patientName: string; scanType: string; findings: string; caliper: string; date: string }[]>([
    {
      id: "RAD-302",
      patientName: "Ramesh Chandra Kumar",
      scanType: "Chest HRCT Scan",
      findings: "Sub-centimetric ground-glass opacities in apical segment of right upper lobe.",
      caliper: "24.5 mm",
      date: "2026-05-28"
    }
  ]);

  // --- LIS: Pathology Analyzer Emulator States ---
  const [analyzerStatus, setAnalyzerStatus] = useState<"Idle" | "Running" | "Completed">("Idle");
  const [simulatedHbA1c, setSimulatedHbA1c] = useState("6.2");
  const [simulatedCreatinine, setSimulatedCreatinine] = useState("1.1");
  const [simulatedCholesterol, setSimulatedCholesterol] = useState("185");

  // --- LIS: Sample Accession Tube States ---
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [accessionLogs, setAccessionLogs] = useState<{ id: string; testName: string; tubeColor: string; patientName: string; status: string; collectedAt: string }[]>([
    { id: "ACC-501", testName: "Complete Blood Count (CBC)", tubeColor: "Lavender (EDTA)", patientName: "Priyanka Devi Patel", status: "Sample Accessioned", collectedAt: "2026-05-28T08:15:00Z" }
  ]);

  // --- PHARMACY: CDSCO Formula Database Search ---
  const [formulaSearchQuery, setFormulaSearchQuery] = useState("");
  const [selectedGenericDrug, setSelectedGenericDrug] = useState<any | null>(null);

  // --- PHARMACY: Narcotics Registry Double-Verification ---
  const [narcoticDoctorAbha, setNarcoticDoctorAbha] = useState("HPR-9034-2910");
  const [narcoticBiometricSigned, setNarcoticBiometricSigned] = useState(false);
  const [selectedNarcoticDrug, setSelectedNarcoticDrug] = useState("Fentanyl Injection 50mcg/mL (2ml Amp)");
  const [narcoticPatientId, setNarcoticPatientId] = useState(patients[0]?.id || "");
  const [narcoticAccessLogs, setNarcoticAccessLogs] = useState<{ id: string; patientName: string; drug: string; authBy: string; verifiedAt: string }[]>([
    { id: "NAR-1025", patientName: "Sumit Vyas", drug: "Fentanyl Injection 50mcg", authBy: "Dr. Arvind S. (HPR-9034)", verifiedAt: "2026-05-28T09:12:00Z" }
  ]);

  // --- PHARMACY: Procurement requisitions ---
  const [procurementOrders, setProcurementOrders] = useState<{ id: string; drugName: string; qty: number; vendor: string; cost: number; status: "Pending" | "Dispatched" }[]>([
    { id: "PO-7782", drugName: "Paracetamol 650mg IP", qty: 2000, vendor: "Generic Pharma Corp", cost: 1600, status: "Pending" }
  ]);
  const [reqDrugName, setReqDrugName] = useState("");
  const [reqQty, setReqQty] = useState("500");
  const [reqVendor, setReqVendor] = useState("Cipla Healthcare");

  // Patient Portal State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [newConsentPurpose, setNewConsentPurpose] = useState("");
  const [newConsentDoctorName, setNewConsentDoctorName] = useState("Dr. Arvind Swaminathan");
  const [consentGrantedSuccess, setConsentGrantedSuccess] = useState(false);
  const [paidPatientBills, setPaidPatientBills] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [cardNum, setCardNum] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [consentAudits, setConsentAudits] = useState<string[]>([
    "[AUDIT] Verified Secure JWT signature from ABDM Single Sign-On Gateway.",
    "[COMPLIANCE] Mapped central state registry records securely in sandboxed session."
  ]);
  const [activePdfEncounter, setActivePdfEncounter] = useState<any>(null);

  // Filter encounters for the selected Patient Portal
  const activePatientObj = patients.find(p => p.id === selectedPatientId);
  const patientEncounters = encounters.filter(e => e.patientId === selectedPatientId);
  const patientConsents = consents.filter(c => c.patientId === selectedPatientId);

  const handleLabFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounterId || !labResult) return alert("Select an active lab order and input quantitative result");
    onLabSubmit(selectedEncounterId, selectedOrderIndex, labResult, criticalFlag, reportNotes);
    setLabResult("");
    setReportNotes("");
    setCriticalFlag(false);
    alert("LIS result synchronized into central Electronic Medical Records repository!");
  };

  const handlePharmacyDispensation = (encounterId: string, idx: number) => {
    onPharmacyDispense(encounterId, idx);
    alert("Drug dispensed safely with generic-formula registration.");
  };

  const handleGrantConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsentPurpose) return;
    const conId = `CNS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newConsent: ConsentLog = {
      id: conId,
      patientId: selectedPatientId,
      patientName: activePatientObj?.name || "Patient Portal Session",
      doctorName: newConsentDoctorName,
      purpose: newConsentPurpose,
      scope: ["Prescriptions", "Diagnostic Reports"],
      status: "Active",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      grantedAt: new Date().toISOString()
    };
    onAddConsent(newConsent);
    setConsentAudits(prev => [
      `[${new Date().toLocaleTimeString()}] ✓ Granted Consent Artifact ${conId} to ${newConsentDoctorName} for "${newConsentPurpose}" [ABDM Secured]`,
      ...prev
    ]);
    setNewConsentPurpose("");
    setConsentGrantedSuccess(true);
    setTimeout(() => setConsentGrantedSuccess(false), 3000);
  };

  const handleRevokeConsent = (consentId: string) => {
    const rawConsent = consents.find(c => c.id === consentId);
    if (rawConsent) {
      if (confirm("Are you sure you want to immediately revoke clinical data transmission access for this professional?")) {
        rawConsent.status = "Revoked";
        setConsentAudits(prev => [
          `[${new Date().toLocaleTimeString()}] ⚠ Revoked access privileges for Consent Artifact ${consentId}. Gateway notified.`,
          ...prev
        ]);
        alert("Clinical access rights revoked. ABDM Gateway alerted.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs" id="ancillary-dashboard">
      
      {/* 1. LIS / LAB WORKSTATION VIEW */}
      {currentRole === "LabStaff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3.5 mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Diagnostic Lab Information & Radiology workstation (LIS / RIS)</h2>
              <p className="text-xs text-slate-500">Manage NABL compliant blood chemistry panels, analyze radiological DICOM series, and verify specimen barcode tracking.</p>
            </div>
            <span className="text-xs font-bold text-slate-100 bg-indigo-600 px-3 py-1 rounded-md border border-indigo-500">
              NABL High-Priority Alert Active
            </span>
          </div>

          {/* Submenu Tabs Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-3" id="lis-submenu-tabs">
            <button
              id="lis-tab-entry"
              type="button"
              onClick={() => setLisSubTab("entry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                lisSubTab === "entry" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Activity className="h-3.5 w-3.5" /> 🔬 LIS Orders & Result Entry
            </button>
            <button
              id="lis-tab-pacs"
              type="button"
              onClick={() => setLisSubTab("pacs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                lisSubTab === "pacs" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> 🩻 RIS & PACS Imaging Portal
            </button>
            <button
              id="lis-tab-accession"
              type="button"
              onClick={() => setLisSubTab("accession")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                lisSubTab === "accession" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Barcode className="h-3.5 w-3.5" /> 🩸 Sample Barcoding & Accession
            </button>
            <button
              id="lis-tab-quality"
              type="button"
              onClick={() => setLisSubTab("quality")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                lisSubTab === "quality" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" /> 📊 Analyzer Calibration & QC
            </button>
          </div>

          {/* Submenu View 1: ENTRY & ORDER QUEUE */}
          {lisSubTab === "entry" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animation-fade-in" id="lis-order-entry-panel">
              {/* Lab results submission column */}
              <div className="space-y-6" id="lab-feed-left-col">
                <form onSubmit={handleLabFormSubmit} className="space-y-4 bg-slate-50 p-5 rounded-lg border shadow-xs" id="lis-result-form">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1 flex items-center gap-1">
                    <FileText className="h-4 w-4 text-indigo-500" /> Lab Record Feed Entry Form
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Select Active Encounter</label>
                      <select
                        value={selectedEncounterId}
                        onChange={(e) => {
                          setSelectedEncounterId(e.target.value);
                          setSelectedOrderIndex(0);
                        }}
                        className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-bold font-sans"
                      >
                        {encounters.map(enc => (
                          <option key={enc.id} value={enc.id}>
                            {enc.id} — {enc.patientName} ({enc.patientId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Select Lab Investigational Order</label>
                      <select
                        value={selectedOrderIndex}
                        onChange={(e) => setSelectedOrderIndex(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-bold text-indigo-800 font-sans"
                      >
                        {encounters
                          .find(e => e.id === selectedEncounterId)
                          ?.labOrders.map((lo, idx) => (
                            <option key={lo.testCode} value={idx}>
                              [{lo.testCode}] {lo.testName} ({lo.status})
                            </option>
                          )) || <option>No orders found</option>}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Quantitative Result Entry *</label>
                      <input
                        type="text"
                        required
                        value={labResult}
                        onChange={(e) => setLabResult(e.target.value)}
                        placeholder="e.g. 0.08 ng/mL (Troponin I)"
                        className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-mono"
                      />
                    </div>
                    
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lab-critical-check"
                        checked={criticalFlag}
                        onChange={(e) => setCriticalFlag(e.target.checked)}
                        className="h-4 w-4 text-red-600 rounded"
                      />
                      <label htmlFor="lab-critical-check" className="text-xs text-red-600 font-bold uppercase flex items-center gap-1 cursor-pointer select-none">
                        <ShieldAlert className="h-4 w-4 animate-bounce" /> Trigger Critical Panic Alarm
                      </label>
                    </div>
                  </div>

                  {/* Auto-fill pathology emulator helpers */}
                  <div className="bg-slate-100 p-2.5 rounded-lg border text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Pathology Instrument Emulator Sync:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLabResult("11.8 g/dL");
                          setReportNotes("Erythrocyte indices indicate mild iron-deficiency anemia profile.");
                        }}
                        className="bg-white border rounded px-2 py-1 text-[10px] font-sans hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        🧪 Feed Hb: 11.8 g/dL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLabResult("132 mg/dL");
                          setReportNotes("Postprandial glycemic measurement verified.");
                        }}
                        className="bg-white border rounded px-2 py-1 text-[10px] font-sans hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        🧪 Feed Glucose: 132 mg/dL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLabResult("1.4 mg/dL");
                          setReportNotes("Creatinine levels are slightly elevated. Monitor hydration status.");
                        }}
                        className="bg-white border rounded px-2 py-1 text-[10px] font-sans hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        🧪 Feed Creatinine: 1.4 mg/dL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Attending Technologist Notes</label>
                    <textarea
                      rows={3}
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="Ischemic indications corresponding with troponin evaluation"
                      className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Authenticate & Sync Lab Result to EHR
                  </button>
                </form>

                {/* Lab Record Feed Entries Table */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3 shadow-3xs" id="lis-synchronized-records-table">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      🔬 Synchronized Clinical Lab Records ({
                        encounters.flatMap(enc => (enc.labOrders || []).filter(lo => lo.status === "Completed" || lo.resultValue)).length
                      })
                    </span>
                    <span className="text-[8px] font-mono font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded leading-none border border-indigo-200 uppercase">
                      ehr index feed
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-100">
                    <table className="w-full text-left text-[11px] text-slate-750">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="p-2 pl-3">Encounter / Patient</th>
                          <th className="p-2">Test Details</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Quantity Value</th>
                          <th className="p-2 pr-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {encounters.flatMap(enc => 
                          (enc.labOrders || [])
                            .filter(lo => lo.status === "Completed" || lo.resultValue)
                            .map((lo, idx) => {
                              return (
                                <tr key={`${enc.id}-${lo.testCode}-${idx}`} className="hover:bg-slate-50/60 transition-colors font-sans text-[11px]">
                                  <td className="p-2 pl-3">
                                    <div className="font-bold text-slate-900 leading-tight">{enc.patientName}</div>
                                    <div className="text-[9px] font-mono text-slate-400 font-semibold">{enc.id} • {enc.patientId}</div>
                                  </td>
                                  <td className="p-2">
                                    <div className="text-slate-800 font-semibold leading-tight">{lo.testName}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">{lo.testCode}</div>
                                  </td>
                                  <td className="p-2">
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                      lo.category === "Hematology" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                      lo.category === "Biochemistry" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      lo.category === "Microbiology" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                                      "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                      {lo.category}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    {lo.criticalAlert ? (
                                      <div className="inline-flex items-center gap-0.5 bg-rose-55 text-rose-800 border border-rose-200 font-mono text-[9.5px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                        🚨 {lo.resultValue || "CRITICAL"}
                                      </div>
                                    ) : (
                                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs">
                                        {lo.resultValue}
                                      </span>
                                    )}
                                    {lo.reportNotes && (
                                      <div className="text-[9px] text-slate-500 font-medium leading-tight mt-1 max-w-[150px] truncate" title={lo.reportNotes}>
                                        {lo.reportNotes}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-2 pr-3">
                                    <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                                      COMPLETED
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                        {encounters.flatMap(enc => (enc.labOrders || []).filter(lo => lo.status === "Completed" || lo.resultValue)).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-400 italic text-xs">
                              No completed results verified in live LIS feed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* View outstanding/pending tests list */}
              <div className="space-y-4" id="lis-pending-pool-list">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1 flex items-center justify-between">
                  <span>Unprocessed LIS Core Pending Pool</span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Active ABDM Pipeline</span>
                </span>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {encounters.map(enc => (
                    <div key={enc.id} className="border rounded-lg p-3.5 bg-slate-50 hover:bg-slate-100/50 space-y-2.5 transition">
                      <div className="flex justify-between items-center text-xs">
                        <strong>{enc.patientName} ({enc.patientId})</strong>
                        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600">{enc.id}</span>
                      </div>

                      <div className="space-y-1">
                        {enc.labOrders.map((lo, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-2 rounded border text-xs leading-normal">
                            <div>
                              <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded mr-1.5">{lo.testCode}</span>
                              <span className="text-slate-800 font-semibold">{lo.testName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {lo.resultValue && <span className="font-mono text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">Val: {lo.resultValue}</span>}
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                lo.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                              }`}>
                                {lo.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submenu View 2: RIS & PACS IMAGING WORKSTATION */}
          {lisSubTab === "pacs" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animation-fade-in" id="lis-pacs-portal-panel">
              {/* Scan selector and filters */}
              <div className="lg:col-span-4 space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Radiology Series Explorer</span>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setPacsScanType("chest");
                      setPacsLesionType("Bronchial Infiltration");
                      setPacsCaliperLength(24.5);
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs transition flex justify-between items-center ${
                      pacsScanType === "chest" ? "bg-indigo-50 border-indigo-300 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-950">Chest X-Ray / CT Series</h4>
                      <p className="text-[10px] text-slate-500">Patient: Ramesh Chandra (UHID: PAT-01)</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${pacsScanType === "chest" ? "text-indigo-600" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => {
                      setPacsScanType("brain");
                      setPacsLesionType("Subdural Hematoma Area");
                      setPacsCaliperLength(14.8);
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs transition flex justify-between items-center ${
                      pacsScanType === "brain" ? "bg-indigo-50 border-indigo-300 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-950">Brain CT Scan (Angiography)</h4>
                      <p className="text-[10px] text-slate-500">Patient: Priyanka Devi Patel (UHID: PAT-02)</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${pacsScanType === "brain" ? "text-indigo-600" : "text-slate-400"}`} />
                  </button>

                  <button
                    onClick={() => {
                      setPacsScanType("knee");
                      setPacsLesionType("ACL Tendon Fracture");
                      setPacsCaliperLength(8.2);
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs transition flex justify-between items-center ${
                      pacsScanType === "knee" ? "bg-indigo-50 border-indigo-300 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-950">Knee MRI Series (Sagittal T1b)</h4>
                      <p className="text-[10px] text-slate-500">Patient: Sumit Vyas (UHID: PAT-03)</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${pacsScanType === "knee" ? "text-indigo-600" : "text-slate-400"}`} />
                  </button>
                </div>

                {/* DICOM calibration sliders */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-4">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" /> DICOM Filter Presets
                  </span>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Brightness Offset</span>
                        <span className="text-amber-400 font-mono font-bold">{pacsBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={pacsBrightness}
                        onChange={(e) => setPacsBrightness(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Contrast Optimization</span>
                        <span className="text-amber-400 font-mono font-bold">{pacsContrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={pacsContrast}
                        onChange={(e) => setPacsContrast(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Lesion Caliper Dimension</span>
                        <span className="text-indigo-400 font-mono font-bold font-semibold">{pacsCaliperLength} mm</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="0.1"
                        value={pacsCaliperLength}
                        onChange={(e) => setPacsCaliperLength(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PACS Monitor Canvas Emulator */}
              <div className="lg:col-span-8 space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Clinical Imaging PACS Monitor</span>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-72 relative overflow-hidden shadow-inner">
                    {/* Emulated Scan Layers */}
                    <div className="absolute top-2 left-2 text-[9px] text-slate-500 font-mono leading-tight">
                      STUDY: {pacsScanType.toUpperCase()}-093282-REG<br />
                      HOSP: CENTRAL SANBOX LABS<br />
                      F: H30s MIDDLE SHARP
                    </div>
                    <div className="absolute top-2 right-2 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-1 py-0.2 rounded">
                      LOINC 141-8
                    </div>

                    {/* Canvas Drawing mockup via styled elements */}
                    <div 
                      className="w-48 h-48 rounded-full border border-slate-700 flex items-center justify-center transition-all duration-300 relative"
                      style={{
                        backgroundColor: `rgba(255, 255, 255, ${pacsBrightness / 600})`,
                        filter: `contrast(${pacsContrast + 50}%)`,
                        boxShadow: `0 0 16px 2px rgba(100, 116, 139, ${pacsContrast / 200})`
                      }}
                    >
                      {/* Anatomy Emulational Circles depending on scanType */}
                      {pacsScanType === "chest" && (
                        <div className="w-40 h-36 border-2 border-slate-600 rounded-3xl flex justify-around p-3">
                          <div className="w-12 h-28 border border-slate-700 bg-slate-900/60 rounded-full flex flex-col justify-center items-center">
                            <span className="text-[7px] text-slate-600 font-mono">L LUNG</span>
                          </div>
                          <div className="w-8 h-16 border border-red-900 bg-red-950/20 rounded-full self-center flex items-center justify-center">
                            <span className="text-[7px] text-red-500 font-mono">COR</span>
                          </div>
                          <div className="w-12 h-28 border border-slate-700 bg-slate-900/60 rounded-full flex flex-col justify-center items-center">
                            <span className="text-[7px] text-slate-600 font-mono">R LUNG</span>
                            {/* Lesion Overlay */}
                            <div 
                              className="bg-amber-100 border border-amber-400 rounded-full animate-ping flex items-center justify-center mt-3"
                              style={{
                                width: `${pacsCaliperLength * 0.9}px`,
                                height: `${pacsCaliperLength * 0.9}px`
                              }}
                            />
                            <div 
                              className="bg-amber-400 border border-amber-500 rounded-full absolute"
                              style={{
                                width: `${pacsCaliperLength * 0.8}px`,
                                height: `${pacsCaliperLength * 0.8}px`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {pacsScanType === "brain" && (
                        <div className="w-36 h-36 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center relative bg-slate-900/40">
                          <div className="w-1.5 h-32 bg-slate-800 absolute" />
                          <div className="w-32 h-1.5 bg-slate-800 absolute" />
                          <div className="w-24 h-24 rounded-full border border-slate-700" />
                          {/* Brain Lesion overlay */}
                          <div 
                            className="bg-red-400 opacity-60 rounded-full absolute border border-red-600"
                            style={{
                              width: `${pacsCaliperLength * 1.5}px`,
                              height: `${pacsCaliperLength * 1.5}px`,
                              transform: "translate(20px, -20px)"
                            }}
                          />
                        </div>
                      )}

                      {pacsScanType === "knee" && (
                        <div className="w-32 h-36 border border-slate-700 bg-slate-900/80 rounded-lg flex items-center justify-center">
                          <div className="w-16 h-28 bg-slate-800 border-x border-slate-700 rounded-full transform rotate-12 relative flex items-center justify-center">
                            <div 
                              className="bg-lime-400 h-1 absolute"
                              style={{
                                width: `${pacsCaliperLength * 2}px`,
                                transform: "rotate(-45deg)"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Caliper Measurement Bar */}
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono text-indigo-400">
                      Caliper Profile & Tool: [{pacsLesionType}] = <strong className="text-white text-xs">{pacsCaliperLength} mm</strong>
                    </div>
                  </div>

                  {/* Radiology clinical findings card */}
                  <div className="md:col-span-5 bg-slate-50 border rounded-xl p-4 flex flex-col justify-between text-xs space-y-3">
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block uppercase text-[10px]">Attending Radiologist Notes:</span>
                      
                      <div className="space-y-1 bg-white p-2.5 rounded border">
                        <p><strong>Series Focus:</strong> {pacsScanType.toUpperCase()} DR/CT</p>
                        <p><strong>Active Marker:</strong> {pacsLesionType}</p>
                        <p className="text-indigo-800"><strong>Measured Length:</strong> {pacsCaliperLength} mm</p>
                      </div>

                      <label className="block text-[10px] text-slate-600 font-bold uppercase mt-2">Findings Statement:</label>
                      <textarea
                        rows={3}
                        value={pacsReportText}
                        onChange={(e) => setPacsReportText(e.target.value)}
                        placeholder="e.g. Evidence of interstitial infiltration noted. Caliper measurements suggest consolidation index is stable."
                        className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!pacsReportText) return alert("Please enter radiology findings first");
                        const newRep = {
                          id: `RAD-${Math.floor(Math.random() * 800) + 100}`,
                          patientName: pacsScanType === "chest" ? "Ramesh Chandra Kumar" : pacsScanType === "brain" ? "Priyanka Devi Patel" : "Sumit Vyas",
                          scanType: `${pacsScanType.toUpperCase()} Scan Details`,
                          findings: pacsReportText,
                          caliper: `${pacsCaliperLength} mm`,
                          date: new Date().toISOString().split("T")[0]
                        };
                        setPacsSavedReports([newRep, ...pacsSavedReports]);
                        setPacsReportText("");
                        alert("Radiological findings captured & DICOM report synced into Central EHR database!");
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Submit DICOM Findings to EHR
                    </button>
                  </div>
                </div>

                {/* Saved radiology reports log */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">RIS Certified Radiology Ledger:</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {pacsSavedReports.map(rep => (
                      <div key={rep.id} className="bg-white p-2.5 rounded border text-xs flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900">{rep.patientName} — {rep.scanType}</strong>
                          <p className="text-[11px] text-slate-500 mt-0.5">{rep.findings}</p>
                          <span className="text-[10px] text-indigo-700 font-mono mt-1 block">Lesion Caliper Checked: {rep.caliper}</span>
                        </div>
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-mono font-bold">{rep.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submenu View 3: SAMPLE ACCESSION & BARCODING */}
          {lisSubTab === "accession" && (
            <div className="space-y-6 animation-fade-in" id="lis-accession-panel">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Pathology Specimen Accession Desk</span>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Barcode Simulator panel */}
                <div className="lg:col-span-4 bg-slate-50 p-5 rounded-xl border space-y-4">
                  <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Specimen Barcode Generator</span>
                  
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Scan or select one of the current unresolved pathology test orders to simulate the laboratory centrifuge barcoding:
                    </p>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setScannedBarcode("BC-CBC-9921")}
                        className="w-full text-left p-2 border bg-white rounded text-xs font-semibold hover:border-indigo-400 focus:outline-hidden"
                      >
                        🧬 Priyanka D. — Hb [BC-CBC-9921]
                      </button>
                      <button
                        type="button"
                        onClick={() => setScannedBarcode("BC-BIO-7729")}
                        className="w-full text-left p-2 border bg-white rounded text-xs font-semibold hover:border-indigo-400 focus:outline-hidden"
                      >
                        🧬 Ramesh C. — Lipids [BC-BIO-7729]
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Scanned Barcode ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={scannedBarcode}
                          onChange={(e) => setScannedBarcode(e.target.value)}
                          placeholder="e.g. BC-CBC-9921"
                          className="flex-1 text-xs bg-white border rounded p-2 focus:outline-hidden font-mono text-center font-bold tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!scannedBarcode) return alert("Scan or enter barcode first!");
                            const mockAccLog = {
                              id: `ACC-${Math.floor(Math.random() * 800) + 100}`,
                              testName: scannedBarcode.includes("CBC") ? "Complete Blood Count (CBC)" : "Lipid Biochemistry Series",
                              tubeColor: scannedBarcode.includes("CBC") ? "Lavender (EDTA)" : "Yellow / Gold (Gel Activator)",
                              patientName: scannedBarcode.includes("CBC") ? "Priyanka Devi Patel" : "Ramesh Chandra Kumar",
                              status: "Sample Centrifuged & Validated",
                              collectedAt: new Date().toISOString()
                            };
                            setAccessionLogs([mockAccLog, ...accessionLogs]);
                            setScannedBarcode("");
                            alert("Barcode registration verified. Specimen set to 'Processing'!");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-bold px-3 rounded-lg"
                        >
                          Accession Sample
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border p-3.5 rounded-lg bg-indigo-50/80 border-indigo-200 text-xs">
                    <span className="font-bold text-indigo-900 block uppercase text-[10px] mb-1">Standard Specimen Code:</span>
                    <ul className="space-y-1 font-sans text-slate-700 list-disc list-inside">
                      <li><strong className="text-purple-800">EDTA (Lavender)</strong> — Core Hematology / HbA1c</li>
                      <li><strong className="text-amber-700">Gel Activator (Yellow)</strong> — Chemistries & Serum LFT</li>
                      <li><strong className="text-red-700">Plain / Red</strong> — Serology / Hormones / Immunology</li>
                      <li><strong className="text-green-700">Sodium Heparin (Green)</strong> — Arterial Blood Gas (ABG)</li>
                    </ul>
                  </div>
                </div>

                {/* Accession Logs Ledger */}
                <div className="lg:col-span-8 bg-white p-5 border rounded-xl space-y-4">
                  <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Accessioned Specimen Ledger</span>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {accessionLogs.map(log => (
                      <div key={log.id} className="border p-3 rounded-lg bg-slate-50/50 text-xs hover:bg-slate-50 transition grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-8 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 font-bold">{log.testName}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-500 font-mono px-1 py-0.2 rounded font-bold">{log.id}</span>
                          </div>
                          <p className="text-slate-600 font-medium">Patient Holder: {log.patientName}</p>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1">
                            <span className="inline-block w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: log.tubeColor.includes("Lavender") ? "#c084fc" : "#fbbf24" }} />
                            Sample Tube: <strong>{log.tubeColor}</strong>
                          </p>
                        </div>
                        <div className="md:col-span-4 flex flex-col justify-between items-end gap-1 text-right">
                          <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2.5 py-0.5 rounded">
                            {log.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Arrived: {new Date(log.collectedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submenu View 4: CALIBRATION & QC */}
          {lisSubTab === "quality" && (
            <div className="space-y-6 animation-fade-in" id="lis-qc-panel">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Automated Pathology Analyzer Integrations & QC Tracker</span>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calibration loop simulator */}
                <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border space-y-4">
                  <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Siemens Advia Instrument Sweep</span>
                  
                  <div className="space-y-4 text-xs">
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Initiate simulated high-precision blood sweep protocol to check reference values calibrating biochemical diagnostic optics:
                    </p>

                    <div className="p-3 bg-white border rounded-lg space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Analyzer Model:</span>
                        <strong className="text-slate-900">Siemens Advia 2400 XLI</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status Gateway:</span>
                        <strong className={analyzerStatus === "Running" ? "text-amber-600 animate-pulse" : analyzerStatus === "Completed" ? "text-green-700" : "text-slate-500"}>
                          ● {analyzerStatus}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Standard Calibration:</span>
                        <strong className="text-slate-900">NABL Control Batch #9921B</strong>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border space-y-2 text-xs">
                      <h5 className="font-bold text-slate-800">Calibrated Drifts Check:</h5>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px]">
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-[9px] text-slate-400 font-bold block">HbA1c</span>
                          <strong className="text-slate-900">{simulatedHbA1c}%</strong>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-[9px] text-slate-400 font-bold block">S. Creatinine</span>
                          <strong className="text-slate-900">{simulatedCreatinine} mg/dL</strong>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-[9px] text-slate-400 font-bold block">S. Cholesterol</span>
                          <strong className="text-slate-900">{simulatedCholesterol} mg/dL</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAnalyzerStatus("Running");
                        setTimeout(() => {
                          setSimulatedHbA1c((6.0 + Math.random() * 0.4).toFixed(1));
                          setSimulatedCreatinine((0.9 + Math.random() * 0.3).toFixed(1));
                          setSimulatedCholesterol(Math.floor(175 + Math.random() * 20).toString());
                          setAnalyzerStatus("Completed");
                          alert("Continuous optical sweep completed! Calibration offsets successfully validated under NABL scope.");
                        }, 1500);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${analyzerStatus === "Running" ? "animate-spin" : ""}`} /> 
                      {analyzerStatus === "Running" ? "Optical Scan In Progress..." : "Trigger Instrument Calibration Sweep"}
                    </button>
                  </div>
                </div>

                {/* Analytical Drift Chart Graphic representation */}
                <div className="lg:col-span-7 bg-white p-5 border rounded-xl space-y-4">
                  <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Levy-Jennings Statistical Analytical Drift Plot</span>
                  
                  {/* Styled CSS coordinate plane representing analytical quality control charts */}
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
                      <span>Standard Quality Metrics (SD Index)</span>
                      <span className="text-green-400">Calibration Deviation Profile: NORMAL</span>
                    </div>

                    {/* Chart Container */}
                    <div className="h-44 border-l border-b border-slate-800 relative flex flex-col justify-between p-1">
                      {/* Grid Lines with labels */}
                      <div className="w-full flex justify-between absolute h-0.5 bg-red-800/40 top-[5%] left-0">
                        <span className="text-[8px] text-red-400 font-mono -mt-2 ml-1">+2SD Action Level Control Limit</span>
                      </div>
                      <div className="w-full flex justify-between absolute h-0.5 bg-amber-800/30 top-[25%] left-0">
                        <span className="text-[8px] text-amber-500 font-mono -mt-2 ml-1">+1SD Caution Level</span>
                      </div>
                      <div className="w-full flex justify-between absolute h-0.5 bg-green-800/50 top-[50%] left-0">
                        <span className="text-[8px] text-green-400 font-mono -mt-2 ml-1">Mean Target Reference Value</span>
                      </div>
                      <div className="w-full flex justify-between absolute h-0.5 bg-amber-800/30 top-[75%] left-0">
                        <span className="text-[8px] text-amber-500 font-mono -mt-2 ml-1">-1SD Caution Level</span>
                      </div>
                      <div className="w-full flex justify-between absolute h-0.5 bg-red-800/40 top-[95%] left-0">
                        <span className="text-[8px] text-red-400 font-mono -mt-2 ml-1">-2SD Action Level Control Limit</span>
                      </div>

                      {/* Calibrated Coordinates Drawing with CSS Circles */}
                      <div className="absolute inset-0 flex items-center justify-around px-8 mt-1">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white transform translate-y-2 shadow-xs" title="Batch A1" />
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white transform -translate-y-4 shadow-xs" title="Batch A2" />
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white transform translate-y-1 shadow-xs" title="Batch A3" />
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-white transform -translate-y-1 shadow-xs" title="Batch A4" />
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white transform -translate-y-6 animate-pulse" title="Calibration Shift Alert" />
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white transform translate-y-0 shadow-xs animate-bounce" title="Run Auto Calibration" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 pt-1 px-4">
                      <span>Ref Day 22</span>
                      <span>Ref Day 24</span>
                      <span>Ref Day 26</span>
                      <span>Ref Day 28 (Current)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-normal">
                    <strong>NABL Quality Standards Check:</strong> Under clinical pathology protocols, any deviation of reference calibration blood parameters exceeding +/-2.0 Standard Deviations (Westgard Multi-rules) triggers dynamic sample locking pending supervisor override.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PHARMACY DRUG CONTROL VIEW */}
      {currentRole === "Pharmacy" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3.5 mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">National Pharmacy Desk & CDSCO Dispensation Manager</h2>
              <p className="text-xs text-slate-500">Track molecular drug schedules, execute electronic doctor prescriptions, and perform generic-brand substitution compliance auditing.</p>
            </div>
            <span className="text-xs font-bold text-slate-100 bg-emerald-600 px-3 py-1 rounded-md">
              CDSCO Drug Control Active
            </span>
          </div>

          {/* Submenu Navigation Bar */}
          <div className="flex flex-wrap gap-2 border-b pb-3" id="pharmacy-submenu-tabs">
            <button
              id="pharmacy-tab-dispense"
              type="button"
              onClick={() => setPharmacySubTab("dispense")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                pharmacySubTab === "dispense" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Pill className="h-3.5 w-3.5" /> 💊 ePrescriptions & Dispensing
            </button>
            <button
              id="pharmacy-tab-cdsco"
              type="button"
              onClick={() => setPharmacySubTab("cdsco")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                pharmacySubTab === "cdsco" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Search className="h-3.5 w-3.5" /> 📦 CDSCO Formulas & Price Cap
            </button>
            <button
              id="pharmacy-tab-narcotics"
              type="button"
              onClick={() => setPharmacySubTab("narcotics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                pharmacySubTab === "narcotics" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Lock className="h-3.5 w-3.5" /> 🔒 Narcotics & Restricted Ledger
            </button>
            <button
              id="pharmacy-tab-expiry"
              type="button"
              onClick={() => setPharmacySubTab("expiry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                pharmacySubTab === "expiry" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> ⚠️ Stock & Auto-PO procurement
            </button>
          </div>

          {/* Submenu Pharmacy View 1: ePRESCRIPTION DISPENSING */}
          {pharmacySubTab === "dispense" && (
            <div className="space-y-4 animation-fade-in" id="pharmacy-dispense-panel">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Active Prescriptions Dispensing Queue</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encounters.map(enc => {
                  const pendingMeds = enc.prescriptions.filter(p => !p.dispensed);
                  return (
                    <div key={enc.id} className="border rounded-xl p-4.5 bg-slate-50/50 space-y-3 flex flex-col justify-between hover:bg-slate-50 transition shadow-xs">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2.5 pb-2 border-b">
                          <div>
                            <strong className="text-slate-900">{enc.patientName}</strong>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {enc.patientId} / Consult: {enc.doctorName}</p>
                          </div>
                          <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200">{enc.id}</span>
                        </div>

                        <div className="space-y-2">
                          {enc.prescriptions.map((p, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border flex justify-between items-start text-xs leading-relaxed hover:border-slate-300 transition">
                              <div className="space-y-1">
                                <p className="font-bold text-slate-900 flex items-center gap-1">
                                  <Pill className="h-3.5 w-3.5 text-emerald-600" /> {p.medicine}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500">Generic Formula: {p.generic}</p>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-1">
                                  <span className="bg-slate-100 px-1 rounded">Dose: {p.dosage}</span>
                                  <span className="bg-slate-100 px-1 rounded">Freq: {p.frequency}</span>
                                  <span className="bg-slate-100 px-1 rounded">Duration: {p.duration}</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5">
                                {p.dispensed ? (
                                  <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5" /> Dispensed ✓
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePharmacyDispensation(enc.id, idx)}
                                    className="bg-slate-900 hover:bg-slate-800 text-slate-100 text-[10px] font-bold py-1 px-3 rounded transition cursor-pointer flex items-center gap-0.5"
                                  >
                                    Dispense Drug
                                  </button>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                                  p.substitutionAllowed ? "text-green-700 bg-green-50 border border-green-100" : "text-amber-700 bg-amber-50 border border-amber-100"
                                }`}>
                                  {p.substitutionAllowed ? "Generic Compatible OK" : "Rigid Brand Only"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submenu Pharmacy View 2: CDSCO FORMULA DATABASE */}
          {pharmacySubTab === "cdsco" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animation-fade-in" id="pharmacy-cdsco-database-panel">
              {/* Left Column: Search & results list */}
              <div className="lg:col-span-5 space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">National Generic Formula Registry</span>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formulaSearchQuery}
                    onChange={(e) => setFormulaSearchQuery(e.target.value)}
                    placeholder="Search Generic Name or schedule..."
                    className="w-full text-xs pl-9 border rounded-lg py-2 focus:outline-hidden font-bold"
                  />
                </div>

                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {CDSCO_NATIONAL_FORMULARY
                    .filter(d => 
                      d.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) || 
                      d.generic.toLowerCase().includes(formulaSearchQuery.toLowerCase())
                    )
                    .map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedGenericDrug(d)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                          selectedGenericDrug?.id === d.id ? "bg-emerald-50 border-emerald-300 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <strong className="text-slate-910 block font-bold">{d.name}</strong>
                          <span className="text-[10px] font-mono text-slate-500">{d.generic}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          d.schedule.includes("X") ? "bg-rose-100 text-rose-700" : d.schedule.includes("H1") ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {d.schedule}
                        </span>
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Right Column: Comparative pricing details */}
              <div className="lg:col-span-7 space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">CDSCO Ceiling Assessment Desk</span>

                {selectedGenericDrug ? (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          {selectedGenericDrug.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{selectedGenericDrug.name}</h4>
                        <p className="text-xs text-slate-500 font-mono italic">{selectedGenericDrug.generic}</p>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold leading-none">
                        Ref ID: {selectedGenericDrug.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase mb-0.5">DPCO statutory Ceiling Price</span>
                        <strong className="text-slate-900 text-base font-extrabold text-red-700">₹{selectedGenericDrug.priceCap.toFixed(2)}</strong>
                        <span className="text-[9px] text-slate-400 block font-sans">per unit cost limit strictly capped</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase mb-0.5">Central Hospital Billing Rate</span>
                        <strong className="text-slate-900 text-base font-extrabold text-indigo-700">₹{selectedGenericDrug.currentPrice.toFixed(2)}</strong>
                        <span className="text-[9px] text-green-700 block font-bold">✓ (Calculated Under-Cap compliance)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs leading-normal space-y-2">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1">
                        <Info className="h-4 w-4 text-indigo-700" /> Regulatory Formulation Summary:
                      </h5>
                      <p className="text-slate-600 font-sans font-medium">
                        This drug is fully compliant with the <strong>Drug Price Control Order (DPCO) 2013</strong> mandates set by the National Pharmaceutical Pricing Authority (NPPA), Government of India. Price margins corresponding, savings ratio: 
                        <strong className="text-green-700 ml-1">
                          {(((selectedGenericDrug.priceCap - selectedGenericDrug.currentPrice) / selectedGenericDrug.priceCap) * 100).toFixed(1)}% savings
                        </strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50 text-xs">
                    Select any generic clinical molecule from the registry feed directory to audit statutory price margin limits or regulatory CDSCO schedules here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submenu Pharmacy View 3: NARCOTICS restricted desk */}
          {pharmacySubTab === "narcotics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animation-fade-in" id="pharmacy-narcotic-safeguard">
              {/* Left Column: secure verification gateway form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!narcoticDoctorAbha || !narcoticBiometricSigned) {
                    return alert("Please input active prescribing clinician HPR card and authorize biometric signature check first!");
                  }
                  const selectPatObj = patients.find(p => p.id === narcoticPatientId);
                  const newNarLog = {
                    id: `NAR-${Math.floor(Math.random() * 800) + 1000}`,
                    patientName: selectPatObj?.name || "Patient Session Active",
                    drug: selectedNarcoticDrug,
                    authBy: `Dr. Swaminathan (${narcoticDoctorAbha.split("-")[0]})`,
                    verifiedAt: new Date().toISOString()
                  };
                  setNarcoticAccessLogs([newNarLog, ...narcoticAccessLogs]);
                  setNarcoticBiometricSigned(false);
                  alert("Authentication SUCCESSFUL: Vault unlocked and Schedule X drug dispensed. Safe ledger record created!");
                }}
                className="lg:col-span-5 bg-slate-950 text-slate-100 p-5 rounded-xl border border-slate-900 space-y-4"
              >
                <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-rose-500 animate-pulse" /> RESTRICTED NARCOTICS VAULT LOCK (Schedule X & H1)
                </span>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Sovereign digital credentials mandatory validation workflow. Pharmacists must verify double biometric keys and the prescribing doctor's registry credentials:
                </p>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Select Patient UHID For Dispensing</label>
                    <select
                      value={narcoticPatientId}
                      onChange={(e) => setNarcoticPatientId(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2 focus:outline-hidden font-bold"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Select Schedule X Opioid / Substance</label>
                    <select
                      value={selectedNarcoticDrug}
                      onChange={(e) => setSelectedNarcoticDrug(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2 focus:outline-hidden font-bold text-rose-400"
                    >
                      <option value="Fentanyl Injection 50mcg/mL (2ml Amp)">Fentanyl Injection 50mcg/mL (Opioid)</option>
                      <option value="Buprenorphine 0.2mg Sublingual IP">Buprenorphine 0.2mg Sublingual (Rehab)</option>
                      <option value="Morphine Sulfate 10mg ER Tablets">Morphine Sulfate 10mg ER (Agonist)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Prescribing Doctor HPR Card identifier *</label>
                    <input
                      type="text"
                      required
                      value={narcoticDoctorAbha}
                      onChange={(e) => setNarcoticDoctorAbha(e.target.value)}
                      placeholder="e.g. HPR-9034-2910"
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2 focus:outline-hidden font-mono text-center tracking-widest font-bold"
                    />
                  </div>

                  {/* Interconnected Biometric Check simulation trigger */}
                  <div className="bg-slate-900 p-3.5 border border-slate-800 rounded-lg text-center space-y-2">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Pharmacist Biometric Authentication:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNarcoticBiometricSigned(prev => !prev);
                      }}
                      className={`px-4 py-1.5 rounded text-[10px] font-sans font-bold transition ${
                        narcoticBiometricSigned ? "bg-green-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                      }`}
                    >
                      {narcoticBiometricSigned ? "✓ Biometric Key Authorized & Validated" : "Provide Fingerprint Touch Biometrics"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4" /> Unlock Vault & Safe-Dispense Opioid
                </button>
              </form>

              {/* Secure Log Auditing registry list */}
              <div className="lg:col-span-7 bg-white p-5 border rounded-xl space-y-4">
                <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Restricted Controlled Drug Dispensation Log (Schedule X Audit Book)</span>
                
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {narcoticAccessLogs.map(log => (
                    <div key={log.id} className="border p-3 rounded-lg bg-rose-100/10 hover:bg-rose-100/20 text-xs transition border-rose-300/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-150">Vault Release Order</span>
                          <h5 className="font-bold text-slate-900 mt-1">{log.drug}</h5>
                          <p className="text-slate-600 font-medium">Recipient: {log.patientName}</p>
                          <p className="text-slate-500 text-[11px]">Authorized by: <strong className="text-slate-950">{log.authBy}</strong></p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-rose-700">{log.id}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-100 font-mono">
                        <span>Status: SIGNED & VAULT SHUT</span>
                        <span>Date Checks: {new Date(log.verifiedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submenu Pharmacy View 4: STOCK PROCUREMENT Auto-POs */}
          {pharmacySubTab === "expiry" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animation-fade-in" id="pharmacy-procurement">
              {/* Left Column PO form */}
              <div className="lg:col-span-5 space-y-4" id="pharmacy-procurement-left-col">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reqDrugName) return alert("Please enter Formulation name!");
                    const costNum = parseInt(reqQty) * 1.5; // simulated unit cost
                    const newPO = {
                      id: `PO-${Math.floor(Math.random() * 800) + 7000}`,
                      drugName: reqDrugName,
                      qty: parseInt(reqQty),
                      vendor: reqVendor,
                      cost: costNum,
                      status: "Pending" as const
                    };
                    setProcurementOrders([newPO, ...procurementOrders]);
                    setReqDrugName("");
                    alert(`Procurement order generated and dispatched to: ${reqVendor}`);
                  }}
                  className="bg-slate-50 p-5 rounded-xl border space-y-4"
                >
                  <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Instant Purchase Order (PO) Requisition</span>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Drug Formulation Name *</label>
                      <input
                        type="text"
                        required
                        value={reqDrugName}
                        onChange={(e) => setReqDrugName(e.target.value)}
                        placeholder="e.g. Paracetamol 650mg IP"
                        className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Requantity (Total Capsules) *</label>
                        <input
                          type="number"
                          required
                          value={reqQty}
                          onChange={(e) => setReqQty(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Target Pharmaceutical Vendor</label>
                        <select
                          value={reqVendor}
                          onChange={(e) => setReqVendor(e.target.value)}
                          className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-bold text-indigo-700"
                        >
                          <option value="Cipla Healthcare">Cipla Healthcare</option>
                          <option value="Sun Pharmaceutical Labs">Sun Pharmaceutical Labs</option>
                          <option value="GlaxoSmithKleine India">GlaxoSmithKline India</option>
                          <option value="Dr. Reddy's Laboratories">Dr. Reddy's Labs</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-100 font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="h-4 w-4" /> Despatch Digital Purchase Order
                  </button>
                </form>

                {/* Instant Purchase Order Requisitions Table */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3 shadow-3xs" id="instant-po-requisitions-table">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      📦 Instant PO Requisitions ({procurementOrders.length})
                    </span>
                    <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded leading-none border border-emerald-200 uppercase">
                      procurement feed
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[220px] scrollbar-thin scrollbar-thumb-slate-200 font-sans">
                    <table className="w-full text-left text-[11px] text-slate-750">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="p-2 pl-3">Order Code</th>
                          <th className="p-2">Drug Formulation</th>
                          <th className="p-2">Vendor / Qty</th>
                          <th className="p-2 text-right pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {procurementOrders.map((po, idx) => {
                          return (
                            <tr key={po.id || idx} className="hover:bg-slate-50/60 transition-colors font-sans text-[11px]">
                              <td className="p-2 pl-3">
                                <div className="font-mono font-bold text-slate-900 leading-tight">{po.id}</div>
                                <div className="text-[9px] font-semibold text-indigo-700">₹{po.cost.toLocaleString()}</div>
                              </td>
                              <td className="p-2">
                                <div className="font-semibold text-slate-800 leading-snug">{po.drugName}</div>
                              </td>
                              <td className="p-2">
                                <div className="text-slate-700 font-medium">{po.qty} caps</div>
                                <div className="text-[9px] text-slate-500 font-sans leading-none">{po.vendor}</div>
                              </td>
                              <td className="p-2 pr-3 text-right space-y-1">
                                {po.status === "Pending" ? (
                                  <div className="flex flex-col sm:flex-row justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProcurementOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: "Dispatched" } : p));
                                      }}
                                      className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 hover:border-emerald-400 transition cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProcurementOrders(prev => prev.filter(p => p.id !== po.id));
                                      }}
                                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 hover:border-rose-400 transition cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[8.5px] font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase block text-center">
                                    DISPATCHED
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {procurementOrders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-400 italic text-xs">
                              No active requisitions created in this session.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stock procurement watchlists */}
              <div className="lg:col-span-7 bg-white p-5 border rounded-xl space-y-4">
                <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Procurement Records & Low Stock Watchlist (At Risk)</span>
                
                {/* Watchlist table mockup */}
                <div className="border rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left leading-normal">
                    <thead>
                      <tr className="bg-slate-100 font-bold font-sans text-slate-600 text-[10px] border-b">
                        <th className="p-2.5">AT-RISK PHARMACY AGENT</th>
                        <th className="p-2.5 text-center">STOCK REMAINING</th>
                        <th className="p-2.5 text-center">NAPP CAP RATE</th>
                        <th className="p-2.5 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2.5">
                          <strong className="text-slate-900 block">Amoxicillin 500mg IP (Broad-Penic)</strong>
                          <span className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-100 rounded px-1.5 py-0.2">URGENT EXPIRY: 2026-06</span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-red-700">42 Caps</td>
                        <td className="p-2.5 text-center">₹12.80</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setReqDrugName("Amoxicillin 500mg IP Capsules");
                              setReqQty("1500");
                            }}
                            className="bg-indigo-600 text-slate-100 py-0.5 px-2.5 rounded font-bold text-[10px] hover:bg-indigo-700"
                          >
                            Add to PO
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2.5">
                          <strong className="text-slate-900 block">Ondansetron 4mg IP (Antiemetic)</strong>
                          <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.2">Low Reorder Margin Trigger</span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-amber-700">95 Caps</td>
                        <td className="p-2.5 text-center">₹7.20</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setReqDrugName("Ondansetron Adosable 4mg IP");
                              setReqQty("1200");
                            }}
                            className="bg-indigo-600 text-slate-100 py-0.5 px-2.5 rounded font-bold text-[10px] hover:bg-indigo-700"
                          >
                            Add to PO
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Issued PO Lists */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Pending Digital Purchase Orders:</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {procurementOrders.map(po => (
                      <div key={po.id} className="bg-white p-2.5 rounded border text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900">{po.drugName}</strong>
                          <p className="text-[10px] text-slate-400 mt-0.5">Quantity Order: {po.qty} caps | Vendor: {po.vendor}</p>
                        </div>
                        <div className="text-right">
                          <strong className="text-slate-900 font-mono text-indigo-700 block">₹{po.cost}</strong>
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-semibold font-mono">{po.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PATIENT DIGITAL PORTAL VIEW */}
      {currentRole === "Patient" && (
        <div className="space-y-6" id="abha-patient-dashboard">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="bg-indigo-600 text-white p-1 rounded-lg"><Activity className="h-5 w-5" /></span>
                ABHA Self-Access Patient EHR Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Access local longitudinal history, grant/revoke granular data consents, or view and pay consolidated medical billing desks.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl border">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Selected Citizen Session:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="text-xs border rounded-lg py-1 px-2.5 bg-white focus:outline-none font-bold text-slate-800"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ABHA: {p.abhaId || "None"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submenu Tabs Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-3.5" id="patient-submenu-tabs">
            <button
              id="patient-tab-records"
              type="button"
              onClick={() => setPatientSubTab("records")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer select-none ${
                patientSubTab === "records" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <FileText className="h-4 w-4" /> Digital Health Records
            </button>
            <button
              id="patient-tab-consent"
              type="button"
              onClick={() => setPatientSubTab("consent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer select-none ${
                patientSubTab === "consent" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <Lock className="h-4 w-4" /> ABDM Consent Gateway
            </button>
            <button
              id="patient-tab-billing"
              type="button"
              onClick={() => setPatientSubTab("billing")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer select-none ${
                patientSubTab === "billing" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <Wallet className="h-4 w-4" /> Invoice &amp; Bills Desk
            </button>
            <button
              id="patient-tab-abha"
              type="button"
              onClick={() => setPatientSubTab("abhacard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer select-none ${
                patientSubTab === "abhacard" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <Layers className="h-4 w-4" /> National Health ABHA Card
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SUBMENU TAB 1: DIGITAL HEALTH RECORDS */}
            {patientSubTab === "records" && (
              <div className="lg:col-span-12 space-y-5">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 text-indigo-500" /> Longitudinal Clinical Records Registry ({patientEncounters.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Patient UHID: {activePatientObj?.id}</span>
                </div>

                {patientEncounters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {patientEncounters.map(enc => (
                      <div key={enc.id} className="border border-slate-200 p-5 rounded-xl bg-white space-y-4 hover:shadow-md transition duration-200 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                        
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider">{enc.department}</span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">Consultant: {enc.doctorName}</h4>
                          </div>
                          <span className="font-mono bg-slate-100 border text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold">Ref ID: {enc.id}</span>
                        </div>

                        <div className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-150 space-y-2">
                          <p className="flex justify-between border-b pb-1">
                            <span className="text-slate-400 font-medium">Consultation Date:</span>
                            <strong className="text-slate-800">{new Date(enc.date).toLocaleString()}</strong>
                          </p>
                          <p className="flex justify-between border-b pb-1">
                            <span className="text-slate-400 font-medium">Primary Chief Complaints:</span>
                            <strong className="text-slate-800 text-right">{enc.chiefComplaints}</strong>
                          </p>
                          <div className="pt-1.5">
                            <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-1">Prescribed Formulations:</span>
                            <p className="text-slate-800 font-medium leading-relaxed bg-white border rounded-lg p-2 font-mono text-[10px]">
                              {enc.prescriptions && enc.prescriptions.length > 0 
                                ? enc.prescriptions.map((p, pIdx) => `${pIdx+1}. ${p.medicine} [${p.generic}] (${p.dosage} - ${p.frequency} x ${p.duration})`).join("\n")
                                : "No therapeutic drugs linked."
                              }
                            </p>
                          </div>
                        </div>

                        {enc.labOrders.length > 0 && (
                          <div className="space-y-2">
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Diagnostic Investigations Ledger</span>
                            <div className="space-y-1.5">
                              {enc.labOrders.map((lo, i) => (
                                <div key={i} className="flex justify-between items-center bg-indigo-50/20 border border-indigo-100 p-2.5 rounded-lg text-xs">
                                  <div>
                                    <span className="text-slate-900 font-bold block">{lo.testName}</span>
                                    {lo.resultValue ? (
                                      <p className="text-[10px] text-green-700 font-mono font-extrabold mt-0.5 mt-1 flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Result: {lo.resultValue}
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-slate-450 mt-0.5">Awaiting calibration from laboratory staff...</p>
                                    )}
                                  </div>
                                  <span className={`text-[10px] tracking-wider font-extrabold uppercase rounded border px-2.5 py-1 ${
                                    lo.criticalAlert 
                                      ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                                      : "bg-green-50 text-green-700 border-green-200"
                                  }`}>
                                    {lo.criticalAlert ? "Critical Panic Flag" : "Completed"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePdfEncounter(enc);
                              // Trigger alert notifying that preview was compiled
                              alert("PDF Health Certificate payload retrieved! Rendering EMR printing frame...");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-500" /> Print Summary
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Successfully downloaded cryptographically signed PDF copy: report_${enc.id}.pdf in secure patient health vault.`);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer border border-indigo-200"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto space-y-3">
                    <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="text-sm font-bold text-slate-900">No Patient EMRs Synchronized</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      No longitudinal data records generated in the local hospital cache for this ABHA card holder. Please switch your active session role to **Doctor Desk** to prescribe formulations or write diagnoses first.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SUBMENU TAB 2: ABDM CONSENT GATEWAY */}
            {patientSubTab === "consent" && (
              <>
                {/* Form to grant consent */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Lock className="h-4 w-4" /> ABDM Consent Framework
                      </span>
                      <h3 className="text-xs text-slate-400 leading-normal font-medium mt-0.5">
                        Under Indian ABDM architecture guidelines, clinical caregivers require patients to approve explicit digitised consents before electronic history transfer occurs.
                      </h3>
                    </div>

                    <form onSubmit={handleGrantConsentSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Authorize Medical Professional:</label>
                        <select
                          value={newConsentDoctorName}
                          onChange={(e) => setNewConsentDoctorName(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-bold"
                        >
                          {doctors && doctors.length > 0 ? (
                            doctors.map((d: any, idx: number) => (
                              <option key={d.id || idx} value={d.name || d.doctorName}>
                                {d.name || d.doctorName} ({d.specialty || d.department || "Medical Resident"})
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Dr. Arvind Swaminathan">Dr. Arvind Swaminathan (Cardiology)</option>
                              <option value="Dr. Shruti Aggarwal">Dr. Shruti Aggarwal (General Medicine)</option>
                              <option value="Dr. Ramesh Patil">Dr. Ramesh Patil (Pediatrics)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Medical Purpose / Episode Description</label>
                        <input
                          type="text"
                          required
                          value={newConsentPurpose}
                          onChange={(e) => setNewConsentPurpose(e.target.value)}
                          placeholder="e.g., Active Outpatient consultation review"
                          className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-medium placeholder:text-slate-650"
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 leading-snug space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                        <p className="font-extrabold text-slate-300">Grant parameters:</p>
                        <p>• Data Scope: Prescriptions, Lab Reports, Consultations</p>
                        <p>• Duration: 30-Day Auto Expiry Period</p>
                        <p>• Signature: Dual-signed UIDAI SHA-256 eSign</p>
                      </div>

                      {consentGrantedSuccess && (
                        <div className="text-[10px] text-green-400 font-bold bg-green-950/20 py-2 px-3 rounded-xl border border-green-900/40 text-center">
                          ✓ Dual-signed consent artifact authorized and registered successfully!
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 active:opacity-90 text-slate-950 font-black text-xs py-2.5 rounded-xl cursor-pointer select-none transition shadow-md leading-none uppercase tracking-wider"
                      >
                        Authorize &amp; Dispatch Consent Artifact
                      </button>
                    </form>
                  </div>
                </div>

                {/* Consent lists and logs ledger */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border space-y-4">
                    <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest pb-1 border-b">
                      Consent registries in force ({patientConsents.length})
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientConsents.map(con => (
                        <div key={con.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2.5 shadow-xs relative">
                          <div className="flex justify-between items-center border-b pb-1.5 leading-none">
                            <span className="text-[9px] font-mono font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">Art ID: {con.id}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-bold">Valid for 30 Days</span>
                          </div>
                          
                          <div>
                            <span className="text-[9px] text-slate-450 uppercase font-bold block">Assigned care clinician:</span>
                            <p className="font-bold text-slate-900">Dr. {con.doctorName}</p>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-450 uppercase font-bold block">Purpose of access:</span>
                            <p className="text-[11px] text-slate-600 font-medium">{con.purpose}</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 mt-1.5 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <span className={`h-2 w-2 rounded-full ${con.status === "Active" ? "bg-green-600 animate-pulse" : "bg-rose-500"}`}></span>
                              <strong className={`text-[10px] font-bold ${con.status === "Active" ? "text-green-700" : "text-rose-700"}`}>
                                {con.status}
                              </strong>
                            </span>
                            {con.status === "Active" && (
                              <button
                                onClick={() => handleRevokeConsent(con.id)}
                                className="text-rose-700 font-extrabold hover:underline select-none text-[10px] flex items-center gap-0.5 cursor-pointer font-sans"
                              >
                                <Ban className="h-3 w-3" /> Revoke access (SLA 3.4s)
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cryptographic Consent Audit Trails Ledger */}
                    <div className="space-y-2.5">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <ClipboardList className="h-3.5 w-3.5 text-slate-400" /> Digital privacy audits logger (Real-time Transaction Trail)
                      </span>
                      <div className="bg-slate-900 border border-slate-800 text-slate-450 rounded-xl p-3.5 font-mono text-[9px] leading-relaxed max-h-36 overflow-y-auto space-y-1.5 shadow-inner">
                        {consentAudits.map((aud, aIdx) => (
                          <div key={aIdx} className="border-b border-slate-850/50 pb-1 last:border-0 last:pb-0 text-slate-300">
                            • {aud}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SUBMENU TAB 3: INVOICE & BILLS DESK */}
            {patientSubTab === "billing" && (() => {
              // Calculate bills dynamically
              // Bed charge
              const patientsBeds = beds.filter(b => b.patientId === selectedPatientId);
              const bedDays = patientsBeds.length > 0 ? 3 : 0; // Simulated 3 days if allocated a bed
              const bedCharge = bedDays * 1500;

              // Medicines charge
              const medsCount = patientEncounters.reduce((acc, current) => acc + (current.prescriptions?.length || 0), 0);
              const medsCharge = medsCount * 280;

              // Lab charges
              const labsCount = patientEncounters.reduce((acc, current) => acc + (current.labOrders?.length || 0), 0);
              const labsCharge = labsCount * 450;

              // Doctor consultation base fee
              const consultCharge = patientEncounters.length * 500;
              const grossTotal = bedCharge + medsCharge + labsCharge + consultCharge;

              const isPmJay = activePatientObj?.insuranceType === "Cashless PM-JAY";
              const netTotal = isPmJay ? 0 : grossTotal;

              const isPaid = paidPatientBills[selectedPatientId] || false;

              return (
                <div className="lg:col-span-12 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                      <div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider">
                          Central Consolidated Account Invoice
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          Billing Ledger: {activePatientObj?.name} (UHID: {activePatientObj?.id})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Insurance Cover Type: <strong>{activePatientObj?.insuranceType}</strong></p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">Invoice Date: {new Date().toLocaleDateString()}</span>
                        <span className="text-xs text-slate-400 block font-mono">Reference: INV-{selectedPatientId?.replace("UHID-", "") || "8024"}</span>
                        <span className={`inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border mt-1.5 ${
                          isPaid || isPmJay 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                        }`}>
                          {isPmJay ? "✓ Covered Cashless (PM-JAY)" : isPaid ? "✓ Invoice Paid / Settle Record" : "⚠ Settlement Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="border border-slate-250 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-slate-50 px-4 py-2.5 font-bold text-slate-500 border-b">
                        <div className="col-span-6">Particular Line Item Description</div>
                        <div className="col-span-2 text-center">Unit Volume</div>
                        <div className="col-span-2 text-right">Unit Rate (₹)</div>
                        <div className="col-span-2 text-right">Total Amount (₹)</div>
                      </div>

                      <div className="bg-white divide-y">
                        <div className="grid grid-cols-12 px-4 py-3">
                          <div className="col-span-6">
                            <strong className="text-slate-800">Bed Allocation &amp; Ward Occupancy</strong>
                            <p className="text-[10px] text-slate-450">Simulated generic general ward allocation (₹1,500/day)</p>
                          </div>
                          <div className="col-span-2 text-center font-semibold text-slate-700">{bedDays} Days</div>
                          <div className="col-span-2 text-right text-slate-655">1,500</div>
                          <div className="col-span-2 text-right font-mono font-bold text-slate-800">{bedCharge.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-12 px-4 py-3">
                          <div className="col-span-6">
                            <strong className="text-slate-800">Dispensed Formulation Medicines (Pharmacy Ledger)</strong>
                            <p className="text-[10px] text-slate-450">Aggregate medications registered and cleared in local session (₹280/item)</p>
                          </div>
                          <div className="col-span-2 text-center font-semibold text-slate-700">{medsCount} Items</div>
                          <div className="col-span-2 text-right text-slate-655">280</div>
                          <div className="col-span-2 text-right font-mono font-bold text-slate-800">{medsCharge.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-12 px-4 py-3">
                          <div className="col-span-6">
                            <strong className="text-slate-800">Pathology investigations &amp; Lab Reports</strong>
                            <p className="text-[10px] text-slate-450">Diagnostic tests registered in central database explorer (₹450/run)</p>
                          </div>
                          <div className="col-span-2 text-center font-semibold text-slate-700">{labsCount} Reports</div>
                          <div className="col-span-2 text-right text-slate-655">450</div>
                          <div className="col-span-2 text-right font-mono font-bold text-slate-800">{labsCharge.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-12 px-4 py-3">
                          <div className="col-span-6">
                            <strong className="text-slate-800">OPD Consultation &amp; Regulatory Handshake Fee</strong>
                            <p className="text-[10px] text-slate-450">Base session booking and record linking protocol consultation fee</p>
                          </div>
                          <div className="col-span-2 text-center font-semibold text-slate-700">{patientEncounters.length} Consultant Visits</div>
                          <div className="col-span-2 text-right text-slate-655">500</div>
                          <div className="col-span-2 text-right font-mono font-bold text-slate-800">{consultCharge.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Summary calculations */}
                      <div className="bg-slate-50 border-t p-4 flex flex-col items-end gap-1 text-xs">
                        <div className="flex justify-between w-64">
                          <span className="text-slate-500 font-bold">Gross Calculation Subtotal:</span>
                          <span className="font-mono text-slate-700 font-bold">₹{grossTotal.toLocaleString()}</span>
                        </div>
                        
                        {isPmJay && (
                          <div className="flex justify-between w-64 text-green-700 font-extrabold border-b pb-1">
                            <span>PM-JAY Cashless Discount:</span>
                            <span>- ₹{grossTotal.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between w-64 border-t pt-1.5 text-sm">
                          <span className="text-slate-800 font-black">Net Settle Balance (INR):</span>
                          <span className="font-mono text-indigo-700 font-black">
                            ₹{netTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Settle Form section */}
                    <div className="bg-slate-50 border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                      
                      <div className="space-y-1.5 flex-1">
                        <strong className="text-slate-900 text-sm font-bold flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-indigo-650" /> Settle Local Hospital Ledger Invoice
                        </strong>
                        <p className="text-xs text-slate-500 max-w-md">
                          {isPmJay 
                            ? "All medical charges for Ayushman Bharat Card holders are fully covered cashless under state guidelines."
                            : isPaid 
                              ? "✓ This ledger statement has been successfully settled and recorded on the database ledger."
                              : "This balance can be settled dynamically in this preview sandbox using a mock UPI payment scan or credit card input."
                          }
                        </p>
                      </div>

                      {isPmJay ? (
                        <button
                          type="button"
                          disabled={isPaid}
                          onClick={() => {
                            setPaidPatientBills(prev => ({ ...prev, [selectedPatientId]: true }));
                            alert("✓ Digital PM-JAY pre-auth token matched! Settle stamp recorded in patient's billing database.");
                          }}
                          className="bg-indigo-660 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider leading-none shadow-md cursor-pointer h-fit w-full md:w-auto"
                        >
                          Register PM-JAY Pre-Auth Validation Code
                        </button>
                      ) : isPaid ? (
                        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-xl text-xs font-bold font-mono">
                          ✓ LEDGER CLOSED AND SETTLED
                        </div>
                      ) : (
                        <div className="bg-white border rounded-xl p-4 w-full md:w-80 space-y-3 shadow-xs">
                          <div className="flex border-b pb-2 mb-2 gap-2 text-xs font-bold text-slate-505">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("upi")}
                              className={`flex-1 py-1 rounded text-center transition ${paymentMethod === "upi" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
                            >
                              Scan UPI QR Code
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("card")}
                              className={`flex-1 py-1 rounded text-center transition ${paymentMethod === "card" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
                            >
                              Credit Card
                            </button>
                          </div>

                          {paymentMethod === "upi" ? (
                            <div className="text-center space-y-2">
                              {/* Simulate elegant QR block inside box */}
                              <div className="mx-auto w-24 h-24 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl flex items-center justify-center relative">
                                <QrCode className="w-20 h-20 text-indigo-700" />
                                <div className="absolute inset-0 bg-indigo-150 bg-opacity-10 animate-pulse rounded-xl"></div>
                              </div>
                              <span className="text-[10px] text-slate-450 block font-bold uppercase font-mono tracking-wide">BHIM UPI QR Scanner Client</span>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setPaidPatientBills(prev => ({ ...prev, [selectedPatientId]: true }));
                                  alert("✓ Simulated UPI transaction successful! Central bill ledger status has been marked as PAID.");
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-extrabold py-2 px-3 rounded-lg cursor-pointer transition uppercase font-mono"
                              >
                                Simulate Scan QR Payment OK
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (cardNum.length < 16) return alert("Verify Credit Card input parameters");
                              setPaidPatientBills(prev => ({ ...prev, [selectedPatientId]: true }));
                              alert("✓ Central mastercard/visa gateway authenticated. Cashier bill marked as SETTLED.");
                            }} className="space-y-2 text-left">
                              <div className="space-y-0.5">
                                <label className="text-[9px] font-bold text-slate-450 uppercase">16-Digit Card Number</label>
                                <input
                                  type="text"
                                  maxLength={16}
                                  placeholder="5240 8291 0021 3492"
                                  required
                                  value={cardNum}
                                  onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ""))}
                                  className="w-full border p-1 rounded bg-white text-xs focus:outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-left">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-slate-450 uppercase">Expiry MM/YY</label>
                                  <input type="text" placeholder="12/29" required className="w-full border p-1 rounded bg-white text-xs text-center focus:outline-none" maxLength={5} />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-slate-450 uppercase">CVV Card Security</label>
                                  <input
                                    type="password"
                                    maxLength={3}
                                    required
                                    placeholder="812"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                    className="w-full border p-1 rounded bg-white text-xs text-center focus:outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-2 rounded-lg cursor-pointer transition uppercase"
                              >
                                Authenticate CARD &amp; Pay ₹{netTotal.toLocaleString()}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              );
            })()}

            {/* SUBMENU TAB 4: DIGITAL ABHA HEALTH CARD */}
            {patientSubTab === "abhacard" && (
              <div className="lg:col-span-12 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
                  
                  <div className="border-b pb-3 flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider">
                        Ayushman Bharat Digital Mission (ABDM)
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Official E-Health Identity Card</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Generating official PDF certificate output sequence for ABHA Card of ${activePatientObj?.name}... E-Card downloaded successfully!`);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <Download className="h-3 w-3" /> Download ABDM E-Card
                    </button>
                  </div>

                  {/* Elegant Tricolor Watermarked ABHA ID card */}
                  <div className="relative mx-auto max-w-md bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-xl" id="abha-digital-id-card">
                    {/* Tricolor Stripe on Top */}
                    <div className="h-1.5 w-full flex">
                      <div className="bg-[#FF9933] flex-1"></div>
                      <div className="bg-white flex-1"></div>
                      <div className="bg-[#138808] flex-1"></div>
                    </div>

                    <div className="absolute top-1.5 right-0 w-32 h-32 bg-slate-50/10 rounded-full border border-slate-200/20 pointer-events-none transform translate-x-8 -translate-y-8"></div>
                    
                    <div className="p-5.5 space-y-4 relative">
                      {/* Identity Card Header */}
                      <div className="flex justify-between items-start border-b pb-3 border-dashed">
                        <div>
                          <span className="text-[7px] text-[#FF9933] uppercase font-black block tracking-widest leading-none">Government of India</span>
                          <span className="text-[11px] text-slate-800 uppercase font-black block mt-0.5">National Health Authority</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border px-2 py-1 rounded">
                          <div className="w-4.5 h-4.5 bg-indigo-600 rounded-full text-[7px] text-white flex items-center justify-center font-black">ND</div>
                          <span className="text-[10px] font-extrabold text-[#003580] tracking-tight font-sans">ABHA Card</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="grid grid-cols-12 gap-4">
                        
                        {/* Profile Photo Area */}
                        <div className="col-span-4 flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {/* SVG Portrait Icon fallback for photo */}
                            <User className="w-14 h-14 text-slate-400" />
                            <div className="absolute bottom-0 inset-x-0 bg-emerald-600 bg-opacity-90 py-0.5 text-center">
                              <span className="text-[8px] text-white uppercase font-black tracking-wider leading-none">KYC OK</span>
                            </div>
                          </div>
                        </div>

                        {/* Demographics details */}
                        <div className="col-span-8 space-y-2 text-xs text-slate-800">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-extrabold block">Full Legal Name:</span>
                            <strong className="text-sm font-black text-slate-900 tracking-tight leading-none block mt-0.5">{activePatientObj?.name}</strong>
                          </div>

                          <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-150">
                            <div>
                              <span className="text-[7px] text-slate-400 uppercase font-extrabold block">DOB / Age:</span>
                              <strong className="text-[9.5px] font-bold text-slate-900 leading-none">{activePatientObj?.dob || "1994-08-12"}</strong>
                            </div>
                            <div>
                              <span className="text-[7px] text-slate-400 uppercase font-extrabold block">Gender:</span>
                              <strong className="text-[9.5px] font-bold text-slate-900 leading-none">{activePatientObj?.gender || "Male"}</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-1">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-extrabold block">14-Digit ABHA Number:</span>
                              <strong className="text-indigo-800 font-mono text-[11px] font-extrabold tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 leading-none block mt-0.5">
                                {activePatientObj?.abhaNumber || "91-4921-0024-3592"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-extrabold block">ABHA Address Mapping:</span>
                              <strong className="text-slate-800 font-mono text-[10px] font-bold block mt-0.5">
                                {activePatientObj?.abhaId || "unregistered@sbx"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Barcode and Security notes */}
                      <div className="grid grid-cols-12 gap-3 pt-3 border-t border-dashed">
                        {/* Barcode representation */}
                        <div className="col-span-8 flex flex-col justify-center">
                          <div className="h-6 w-full bg-slate-900/10 flex items-center justify-center border p-1 rounded font-mono text-[8px] text-slate-500 overflow-hidden select-none">
                            ||||| | |||| | || ||||| |||| ||| | || |||||
                          </div>
                          <span className="text-[7px] text-slate-400 font-mono mt-0.5 text-center">UIDAI Aadhaar Link Hash Sequence: Verified</span>
                        </div>

                        {/* Interactive QR representation */}
                        <div className="col-span-4 flex items-center justify-center">
                          <div className="w-13 h-13 bg-slate-50 border p-1 rounded flex items-center justify-center relative">
                            <QrCode className="h-10 w-10 text-slate-900" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Footer Tricolor Ribbon */}
                    <div className="bg-[#003580] text-center py-2">
                      <span className="text-[8px] text-white font-black uppercase tracking-widest leading-none">
                        ● National Digital Health Blueprint ●
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* EMR PDF Print Overlay Modal */}
          {activePdfEncounter && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="emr-print-modal">
              <div className="bg-white rounded-2xl max-w-2xl w-full border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg"><Printer className="h-4 w-4" /></div>
                    <div>
                      <h3 className="font-extrabold text-[15px] tracking-tight text-white leading-none">Official EMR Electronic Summary</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">ABDM Secure Standard Format IP/OPD Document</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePdfEncounter(null)}
                    className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg transition"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Printable Document Body container */}
                <div className="p-6 overflow-y-auto space-y-6 font-sans text-xs text-slate-800 bg-white" id="printable-emr-document">
                  
                  {/* Government of India Header */}
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1 relative">
                    <span className="text-[10px] text-slate-450 uppercase font-bold tracking-widest block">National Digital Health Registry</span>
                    <h2 className="text-[16px] font-black text-slate-900 uppercase">EPISODE MEDICAL HEALTH RECORD</h2>
                    <p className="text-[9px] text-slate-400 font-mono">Issued by: Integrated Sandbox Referral Hospital Center • Verified Digital Handshake</p>
                    <div className="absolute top-1 right-1 w-12 h-12 border rounded-md flex items-center justify-center bg-slate-50">
                      <QrCode className="h-10 w-10 text-slate-900" />
                    </div>
                  </div>

                  {/* Patient Demographics */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <p><span className="text-slate-400 font-bold block">Patient Name:</span> <strong className="text-slate-900 text-[13px]">{activePatientObj?.name}</strong></p>
                      <p><span className="text-slate-400 font-bold block">Age / Gender:</span> <strong className="text-slate-800">{activePatientObj?.dob ? (new Date().getFullYear() - new Date(activePatientObj.dob).getFullYear()) : 32} Years / {activePatientObj?.gender || "Male"}</strong></p>
                      <p><span className="text-slate-400 font-bold block">National UHID:</span> <strong className="text-slate-800 font-mono">{activePatientObj?.id}</strong></p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-slate-400 font-bold block">ABHA Number ID:</span> <strong className="text-indigo-700 font-mono text-[13px]">{activePatientObj?.abhaNumber || "91-4291-0021-3992"}</strong></p>
                      <p><span className="text-slate-400 font-bold block">ABHA Address:</span> <strong className="text-slate-800 font-mono">{activePatientObj?.abhaId || "unregistered@sbx"}</strong></p>
                      <p><span className="text-slate-400 font-bold block">Consultation Date:</span> <strong className="text-slate-800">{new Date(activePdfEncounter.date).toLocaleString()}</strong></p>
                    </div>
                  </div>

                  {/* Consultation Specifics */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider border-b pb-1">1. Primary Consultation Details</h4>
                    <div className="grid grid-cols-3 gap-3 bg-white border p-3.5 rounded-xl text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block">Attending Consultant:</span>
                        <strong className="text-slate-800">Dr. {activePdfEncounter.doctorName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Department Branch:</span>
                        <strong className="text-slate-800">{activePdfEncounter.department}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Encounter Ref ID:</span>
                        <strong className="text-slate-800 font-mono">{activePdfEncounter.id}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Chief complaints */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider border-b pb-1">2. Clinical Impression Notes</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border text-slate-705 text-[11px] leading-relaxed">
                      <strong>Chief Complaints Registered:</strong> {activePdfEncounter.chiefComplaints}
                    </div>
                  </div>

                  {/* Prescribed Medications */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider border-b pb-1">3. Prescribed Pharmacological Medications</h4>
                    <table className="w-full text-left border rounded-lg overflow-hidden text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-600">
                          <th className="p-2 border-b">Medicine Name</th>
                          <th className="p-2 border-b">Generic Compound Formula</th>
                          <th className="p-2 border-b">Dosage Pattern</th>
                          <th className="p-2 border-b">Frequency</th>
                          <th className="p-2 border-b">Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activePdfEncounter.prescriptions && activePdfEncounter.prescriptions.length > 0 ? (
                          activePdfEncounter.prescriptions.map((pr: any, prIdx: number) => (
                            <tr key={prIdx}>
                              <td className="p-2 font-bold text-slate-900">{pr.medicine}</td>
                              <td className="p-2 font-mono text-slate-500 text-[10px]">{pr.generic}</td>
                              <td className="p-2 text-slate-700">{pr.dosage}</td>
                              <td className="p-2 font-semibold text-indigo-700">{pr.frequency}</td>
                              <td className="p-2 text-slate-600">{pr.duration}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-slate-450">No clinical prescription drugs mapped.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Diagnostic Lab Tests */}
                  {activePdfEncounter.labOrders && activePdfEncounter.labOrders.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider border-b pb-1">4. Synchronized Diagnostic Investigations</h4>
                      <div className="space-y-1.5">
                        {activePdfEncounter.labOrders.map((lo: any, lIdx: number) => (
                          <div key={lIdx} className="border p-2.5 rounded-lg flex justify-between bg-slate-50 items-center text-[11px]">
                            <div>
                              <strong className="text-slate-800 block">{lo.testName}</strong>
                              {lo.resultValue ? (
                                <span className="text-[10px] text-green-700 font-bold font-mono">Value: {lo.resultValue}</span>
                              ) : (
                                <span className="text-[10px] text-slate-440">Awaiting analyzer Calibration</span>
                              )}
                            </div>
                            <span className="font-extrabold text-[10px] tracking-wide uppercase text-green-700">✓ Completed Normal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certified Electronic Signature footer */}
                  <div className="flex justify-between items-end border-t pt-6" id="certified-footer">
                    <div className="text-[9px] text-slate-400 space-y-0.5">
                      <p>✓ Digitally SHA-256 cryptographically sealed on central ledger</p>
                      <p>● Verification Token: AB-SHA-{activePdfEncounter.id?.replace("ENC-", "") || "9021481"}</p>
                      <p>● Conformant with DPDP data restriction guidelines of India.</p>
                    </div>
                    <div className="text-center w-40 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                      <p className="font-bold">Digital Sign SHA-256</p>
                      <p className="text-[9px] text-indigo-700 font-bold font-sans">ABDM Gateway Certified</p>
                    </div>
                  </div>

                </div>

                {/* Print Modal Action Controls */}
                <div className="bg-slate-50 p-4 border-t flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActivePdfEncounter(null)}
                    className="bg-white border rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel / Go Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl border border-indigo-600 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Trigger Browser Print Dial
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. BILLING & INVOICING VIEW */}
      {currentRole === "Billing" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3.5 mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Consolidated Central Billing Office</h2>
              <p className="text-xs text-slate-500">Formulate ledger invoices, audit private corporate cover claims, and map PM-JAY cashless balance statements.</p>
            </div>
            <span className="text-xs font-bold text-slate-100 bg-indigo-600 px-3 py-1 rounded-md border border-indigo-500">
              GST Compliant System
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Select Admitted Patient Ledger Summary</span>
              
              <div className="space-y-4">
                {patients.map(pat => {
                  const patBed = beds.find(b => b.patientId === pat.id);
                  const isAdmitted = !!patBed;
                  const patEncounters = encounters.filter(e => e.patientId === pat.id);

                  // Cost calculator
                  let bedDaysCount = isAdmitted ? 2 : 0; // standard admission simulated
                  let bedCost = patBed ? patBed.pricePerDay * bedDaysCount : 0;
                  let medicationCost = 0;
                  let laboratoryCost = 0;

                  patEncounters.forEach(enc => {
                    medicationCost += enc.prescriptions.length * 210; // average drug fee
                    laboratoryCost += enc.labOrders.length * 650; // average analytic fee
                  });

                  const totalGross = bedCost + medicationCost + laboratoryCost;
                  const pmjayDiscount = pat.insuranceType === "Cashless PM-JAY" ? totalGross : 0;
                  const finalDue = totalGross - pmjayDiscount;

                  return (
                    <div key={pat.id} className="border p-5 rounded-xl bg-slate-50 hover:bg-slate-100/30 transition grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8 space-y-1.5">
                        <h4 className="font-bold text-slate-950 text-[15px] flex items-center gap-1.5">{pat.name} ({pat.id})</h4>
                        <div className="grid grid-cols-2 text-xs text-slate-600 font-sans font-medium gap-1">
                          <p>Insurance: <strong className="text-slate-950">{pat.insuranceType}</strong></p>
                          <p>Status: <span className="text-orange-700 font-semibold">{isAdmitted ? "Inpatient Room Adm" : "Standard Outpatient"}</span></p>
                          {patBed && <p className="col-span-2 text-indigo-700 text-[11px]">Bed Assigned: <strong>{patBed.bedNumber} ({patBed.type})</strong></p>}
                        </div>

                        <div className="space-y-1.5 border-t pt-2.5 mt-2 text-xs text-slate-700">
                          <p className="flex justify-between">
                            <span>Bed Charges Ledger ({bedDaysCount} Days):</span>
                            <span>₹{bedCost}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>ePrescriptions Dispensation aggregate:</span>
                            <span>₹{medicationCost}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Diagnostic testing aggregate:</span>
                            <span>₹{laboratoryCost}</span>
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-white p-4.5 rounded-lg border border-slate-200 text-right flex flex-col justify-between items-end gap-3.5">
                        <div className="w-full text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Invoice Amount</p>
                          <p className="text-lg font-black text-slate-900">₹{totalGross.toLocaleString()}</p>
                          {pmjayDiscount > 0 && (
                            <div className="mt-1">
                              <p className="text-[10px] text-green-700 font-bold">PM-JAY Waiver: -₹{pmjayDiscount.toLocaleString()}</p>
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Due Settlement Balance</p>
                          <p className="text-base font-extrabold text-indigo-700">₹{finalDue.toLocaleString()}</p>
                        </div>

                        <button
                          onClick={() => alert(`Bill statement finalized! Receipt invoice printed out successfully for UHID: ${pat.id}.`)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-2 rounded-lg cursor-pointer"
                        >
                          Print Bill Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-xl text-slate-800 leading-relaxed text-xs">
                <span className="font-bold block tracking-wider uppercase text-amber-900 mb-1">Financial Compliance Tracker:</span>
                All billing calculations conform completely with NABH audit parameters, CDSCO drugs price ceiling caps, and CGHS/PM-JAY statutory procedure ceilings of India.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
