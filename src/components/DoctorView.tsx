import React, { useState } from "react";
import { Stethoscope, FileJson, Heart, CheckCircle2, User, Sparkles, Plus, Trash2, Code, ShieldCheck, AlertTriangle } from "lucide-react";
import { Patient, Encounter, DiagnosisCode, Medication } from "../types";

interface DoctorViewProps {
  patients: Patient[];
  encounters: Encounter[];
  onAddEncounter: (encounter: Encounter) => void;
  hprVerifiedDoctors: { id: string; name: string; abdmNumber: string; specialty: string }[];
}

const COMMON_DIAGNOSES: DiagnosisCode[] = [
  { code: "I10", display: "Essential (primary) hypertension", system: "ICD-10" },
  { code: "E11.9", display: "Type 2 diabetes mellitus without complications", system: "ICD-10" },
  { code: "J06.9", display: "Acute upper respiratory infection, unspecified", system: "ICD-10" },
  { code: "371073007", display: "Retrosternal chest pain", system: "SNOMED-CT" },
  { code: "K80.20", display: "Calculus of gallbladder with acute cholecystitis", system: "ICD-10" },
  { code: "43878008", display: "Bronchial asthma", system: "SNOMED-CT" }
];

const SUGGESTED_DRUGS = [
  { medicine: "Ecosprin 75", generic: "Aspirin 75 mg", dosage: "1 Tab", frequency: "1-0-0" },
  { medicine: "Metformin 500", generic: "Metformin HCl 500 mg", dosage: "1 Tab", frequency: "1-0-1" },
  { medicine: "Pan-40", generic: "Pantoprazole 40 mg", dosage: "1 Tab", frequency: "1-0-0" },
  { medicine: "Augmentin 625 Duo", generic: "Amoxicillin + Clavulanic Acid", dosage: "1 Tab", frequency: "1-0-1" }
];

export default function DoctorView({ patients, encounters, onAddEncounter, hprVerifiedDoctors }: DoctorViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState(hprVerifiedDoctors[0]);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  
  // Encounter Form states
  const [complaints, setComplaints] = useState("");
  const [allergies, setAllergies] = useState("NKA (No Known Allergies)");
  const [bp, setBp] = useState("120/80");
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(99);
  const [respRate, setRespRate] = useState(16);

  // SOAP
  const [subNotes, setSubNotes] = useState("");
  const [objNotes, setObjNotes] = useState("");
  const [assNotes, setAssNotes] = useState("");
  const [planNotes, setPlanNotes] = useState("");

  const [diagnoses, setDiagnoses] = useState<DiagnosisCode[]>([]);
  const [prescriptions, setPrescriptions] = useState<Medication[]>([]);
  const [labOrders, setLabOrders] = useState<{ testCode: string; testName: string; category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Radiology' }[]>([]);

  // Drug inline builder state
  const [pillBrand, setPillBrand] = useState("");
  const [pillGeneric, setPillGeneric] = useState("");
  const [pillDose, setPillDose] = useState("1 Tab");
  const [pillFreq, setPillFreq] = useState("1-0-1");
  const [pillDuration, setPillDuration] = useState("5 Days");
  const [pillIns, setPillIns] = useState("After Food");
  const [pillSub, setPillSub] = useState(true);

  // FHIR Output Panel State
  const [activeEncounterForFhir, setActiveEncounterForFhir] = useState<Encounter | null>(encounters[0] || null);
  const [fhirBundleJson, setFhirBundleJson] = useState<any>(null);
  const [isFHIRSyncing, setIsFHIRSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "encounter" | "clinical-history">("dashboard");

  const addDiagnosisCode = (code: DiagnosisCode) => {
    if (!diagnoses.some(d => d.code === code.code)) {
      setDiagnoses([...diagnoses, code]);
    }
  };

  const removeDiagnosisCode = (codeText: string) => {
    setDiagnoses(diagnoses.filter(d => d.code !== codeText));
  };

  const addPrescriptionPill = () => {
    if (!pillBrand) return;
    const newMed: Medication = {
      medicine: pillBrand,
      generic: pillGeneric || "Generic Equivalent formula",
      dosage: pillDose,
      frequency: pillFreq,
      duration: pillDuration,
      instructions: pillIns,
      substitutionAllowed: pillSub,
      dispensed: false
    };
    setPrescriptions([...prescriptions, newMed]);
    setPillBrand("");
    setPillGeneric("");
  };

  const removePrescriptionPill = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const triggerAddLabOrder = (code: string, name: string, cat: any) => {
    if (!labOrders.some(l => l.testCode === code)) {
      setLabOrders([...labOrders, { testCode: code, testName: name, category: cat }]);
    }
  };

  const removeLabOrder = (code: string) => {
    setLabOrders(labOrders.filter(l => l.testCode !== code));
  };

  const handleEncounterCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (!patientObj) return alert("Select patient before record creation");

    const newEncounter: Encounter = {
      id: `ENC-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientObj.id,
      patientName: patientObj.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.specialty,
      date: new Date().toISOString(),
      chiefComplaints: complaints,
      allergies,
      vitals: { bp, pulse, temp, spo2, respRate },
      soapNotes: {
        subjective: subNotes || "Patient came for review.",
        objective: objNotes || "Patient alert, cooperative, clinically stable.",
        assessment: assNotes || "Diagnosed per ICD coding parameters.",
        plan: planNotes || "Standard follow-up and pharmacological guidelines."
      },
      diagnoses: diagnoses.length > 0 ? diagnoses : [{ code: "Z00.0", display: "General medical examination", system: "ICD-10" }],
      prescriptions,
      labOrders: labOrders.map(lo => ({
        testCode: lo.testCode,
        testName: lo.testName,
        category: lo.category,
        status: "Pending" as const
      })),
      treatmentStatus: "OPD Ongoing" as const
    };

    onAddEncounter(newEncounter);
    setActiveEncounterForFhir(newEncounter);
    
    // Reset Form
    setComplaints("");
    setSubNotes("");
    setObjNotes("");
    setAssNotes("");
    setPlanNotes("");
    setDiagnoses([]);
    setPrescriptions([]);
    setLabOrders([]);
    alert(`Encounter ${newEncounter.id} safely stored in Electronic Health Records!`);
  };

  const convertToABDMFHIR = async (encounterObj: Encounter | null) => {
    if (!encounterObj) return;
    setIsFHIRSyncing(true);
    setFhirBundleJson(null);
    try {
      const response = await fetch("/api/emr/fhir-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounter: encounterObj })
      });
      const data = await response.json();
      if (data.fhir) {
        setFhirBundleJson(data.fhir);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFHIRSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="doctor-emr-panel">
      {/* LEFT COMPONENT: Detailed EMR SOAP consultation form */}
      <div className="xl:col-span-8 space-y-6">
        {/* Clinician Profile Selector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pradhan Mantri National Clinical Interface</h3>
              <p className="text-xs text-slate-500">Sign clinical sheets with registered Health Professional Registry credentials.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 font-semibold uppercase">Active Attending:</label>
            <select
              value={selectedDoctor.id}
              onChange={(e) => {
                const found = hprVerifiedDoctors.find(d => d.id === e.target.value);
                if (found) setSelectedDoctor(found);
              }}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-3 bg-slate-50 font-semibold focus:outline-hidden"
              id="doctor-selector"
            >
              {hprVerifiedDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialty}) • Verified
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action navigation tabs */}
        <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200" id="doctor-view-tab-control">
          <button
            onClick={() => setActiveTab("encounter")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition ${
              activeTab === "encounter" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📋 Create Active Consultation (OPD/IPD)
          </button>
          <button
            onClick={() => setActiveTab("clinical-history")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition ${
              activeTab === "clinical-history" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📂 Longitudinal EMR EHR File Cabinet ({encounters.length})
          </button>
        </div>

        {/* Action navigation tabs */}
        <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200" id="doctor-view-tab-control">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition ${
              activeTab === "dashboard" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🩺 Doctor Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab("encounter")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition ${
              activeTab === "encounter" ? "bg-white text-slate-950 shadow-xs" : "text-slate-505 hover:text-slate-800"
            }`}
          >
            📋 Create Active Consultation (OPD/IPD)
          </button>
          <button
            onClick={() => setActiveTab("clinical-history")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition ${
              activeTab === "clinical-history" ? "bg-white text-slate-950 shadow-xs" : "text-slate-505 hover:text-slate-800"
            }`}
          >
            📂 Longitudinal EMR EHR File Cabinet ({encounters.length})
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6" id="doctor-dashboard-module">
            {/* Header */}
            <div>
              <h4 className="text-base font-bold text-slate-900">Clinician Session Overview Dashboard</h4>
              <p className="text-xs text-slate-500">Scheduled appointments, emergency vitals telemetry, and critical LOINC pathology reports for active response.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Appointments */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-250 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5 mb-3">Today's Scheduled Appointments (3 Patients)</span>
                  <div className="space-y-2.5">
                    {patients.slice(0, 3).map((pat, idx) => {
                      const appointmentTimes = ["10:15 AM", "11:00 AM", "11:45 AM"];
                      const purposes = ["Exertional Dyspnea Follow-up", "Post-Surgical Bile Leak Review", "Chronic Backache Assessment"];
                      return (
                        <div key={pat.id} className="flex justify-between items-center p-3.5 bg-slate-50 border rounded-lg hover:bg-slate-100/50 transition duration-150">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-905 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">{appointmentTimes[idx]}</span>
                              <strong className="text-slate-900 text-xs font-semibold">{pat.name}</strong>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{purposes[idx]} • <span className="font-mono text-[9px]">{pat.id}</span></p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(pat.id);
                              setActiveTab("encounter");
                            }}
                            className="bg-blue-600 hover:bg-blue-750 text-white font-bold text-[9px] py-1 px-3.5 rounded-md cursor-pointer transition shadow-xs"
                          >
                            Open Consult
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Critical warnings and reports */}
              <div className="lg:col-span-6 space-y-4">
                {/* Critical Patients Tracker */}
                <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-xs text-xs">
                  <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-widest border-b pb-1.5 mb-3 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Critical Patients Alert (ICU & Ward Bed-Sensing Alerts)
                  </span>
                  
                  <div className="space-y-2 leading-relaxed">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 text-xs">Priyanka Devi Patel</strong>
                        <p className="text-[10px] text-slate-505 font-medium">B-101 (General Ward) • <strong>Post-OP Sepsis Assessment</strong></p>
                      </div>
                      <span className="text-[10px] font-extrabold font-mono text-rose-700 bg-rose-100 p-1 rounded border border-rose-200">SpO2: 95% (Caution)</span>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 text-xs">Ramesh Chandra Kumar</strong>
                        <p className="text-[10px] text-slate-505 font-medium">Outpatient Clinic • <strong>Angina Pectoris NYHA-II</strong></p>
                      </div>
                      <span className="text-[10px] font-extrabold font-mono text-amber-700 bg-amber-50 p-1 border rounded border-amber-200">BP: 138/88 mmHg</span>
                    </div>
                  </div>
                </div>

                {/* Pending Lab Reports */}
                <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-xs text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5 mb-3">Pending Lab/Imaging LOINC reports ({encounters.length > 0 ? encounters[0].labOrders.filter(l=>l.status!=='Completed').length : 0})</span>
                  
                  <div className="space-y-2">
                    {encounters.length > 0 ? (
                      encounters.flatMap(enc => 
                        enc.labOrders.map((lo, lIdx) => (
                          <div key={lIdx} className="flex justify-between items-center p-2 border-b last:border-0 pb-2">
                            <div>
                              <strong className="text-slate-900 font-medium text-[11px]">{lo.testName}</strong>
                              <p className="text-[10px] text-slate-400 font-mono">LOINC: {lo.testCode} • {lo.category}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-sans uppercase border ${
                              lo.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                            }`}>
                              {lo.status}
                            </span>
                          </div>
                        ))
                      )
                    ) : (
                      <p className="text-slate-400 text-center py-2">No active pending pathology/radiologic orders on file.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "encounter" ? (
          <form onSubmit={handleEncounterCommit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6" id="emr-consultation-form">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">New OPD Consultation Intake Sheet</h4>

            {/* Patient Target Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Active Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) • {p.abhaId ? `ABHA: ${p.abhaId}` : "No ABHA Linked"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Drug Food Allergies Tracker</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 outline-hidden text-rose-600 font-medium"
                />
              </div>
            </div>

            {/* Complaints and Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chief Complaints *</label>
                <textarea
                  required
                  rows={4}
                  value={complaints}
                  onChange={(e) => setComplaints(e.target.value)}
                  placeholder="e.g. Chest tightness radiating to left shoulder on stairs"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-3 text-center border-b border-slate-200 pb-1.5">Registered Nursing Vitals</span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">BP (mmHg)</label>
                    <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} className="w-full text-center text-xs bg-white border rounded p-1.5 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">Pulse (bpm)</label>
                    <input type="number" value={pulse} onChange={(e) => setPulse(parseInt(e.target.value) || 0)} className="w-full text-center text-xs bg-white border rounded p-1.5 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">Temp (°F)</label>
                    <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value) || 0)} className="w-full text-center text-xs bg-white border rounded p-1.5 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">SPO2 (%)</label>
                    <input type="number" value={spo2} onChange={(e) => setSpo2(parseInt(e.target.value) || 0)} className="w-full text-center text-xs bg-white border rounded p-1.5 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-1">Resp Rate</label>
                    <input type="number" value={respRate} onChange={(e) => setRespRate(parseInt(e.target.value) || 0)} className="w-full text-center text-xs bg-white border rounded p-1.5 font-bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* SOAP Clinical Paradigm Frame */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 p-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>SOAP Methodology (NABH Compliant Clinician Notes)</span>
                <span className="text-[10px] font-mono text-slate-400">HL7 Exchange Standards</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="p-3">
                  <label className="block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded text-center uppercase mb-1">Subjective (S)</label>
                  <textarea rows={3} value={subNotes} onChange={(e) => setSubNotes(e.target.value)} placeholder="Radiating pain, nitrates ease discomfort" className="w-full text-xs p-1 focus:outline-hidden" />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-center uppercase mb-1">Objective (O)</label>
                  <textarea rows={3} value={objNotes} onChange={(e) => setObjNotes(e.target.value)} placeholder="ECG showed minor elevation in V5" className="w-full text-xs p-1 focus:outline-hidden" />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold text-orange-700 bg-orange-50 px-1 py-0.5 rounded text-center uppercase mb-1">Assessment (A)</label>
                  <textarea rows={3} value={assNotes} onChange={(e) => setAssNotes(e.target.value)} placeholder="Suspected CAD/angina index" className="w-full text-xs p-1 focus:outline-hidden" />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold text-purple-700 bg-purple-50 px-1 py-0.5 rounded text-center uppercase mb-1">Plan (P)</label>
                  <textarea rows={3} value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} placeholder="Coronary arteriography requested" className="w-full text-xs p-1 focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Diagnosis Selection ICD-10 */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">ICD-10 / SNOMED CT Diagnosis Search & Tag</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COMMON_DIAGNOSES.map(cd => (
                  <button
                    key={cd.code}
                    type="button"
                    onClick={() => addDiagnosisCode(cd)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1 font-sans cursor-pointer"
                  >
                    <span>{cd.code}</span> • <span className="font-semibold">{cd.display}</span>
                  </button>
                ))}
              </div>

              {diagnoses.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase basis-full">Diagnosis Tagged in Active Encounter:</span>
                  {diagnoses.map(diag => (
                    <span key={diag.code} className="inline-flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 text-slate-100 font-semibold py-1 px-2 rounded-md">
                      [{diag.system}] {diag.code} — {diag.display}
                      <button type="button" onClick={() => removeDiagnosisCode(diag.code)} className="text-amber-400 hover:text-white ml-1 filter">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ePrescriptions Builder */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <span className="block text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5">ePrescription Pharmacological Standard Builder</span>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase">Medicine Brand Title</label>
                  <input
                    type="text"
                    value={pillBrand}
                    onChange={(e) => setPillBrand(e.target.value)}
                    placeholder="e.g. Augmentin 625 Duo"
                    className="w-full text-xs bg-white border rounded p-2"
                  />
                  {/* Preset Helper */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {SUGGESTED_DRUGS.map(d => (
                      <button
                        key={d.medicine}
                        type="button"
                        onClick={() => {
                          setPillBrand(d.medicine);
                          setPillGeneric(d.generic);
                          setPillDose(d.dosage);
                          setPillFreq(d.frequency);
                        }}
                        className="text-[9px] bg-slate-200 text-slate-700 border rounded px-1 cursor-pointer"
                      >
                        {d.medicine}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase">Generic Substituted Name</label>
                  <input
                    type="text"
                    value={pillGeneric}
                    onChange={(e) => setPillGeneric(e.target.value)}
                    placeholder="e.g. Amoxicillin Clavulanic"
                    className="w-full text-xs bg-white border rounded p-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1Name">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Dosage</label>
                    <input type="text" value={pillDose} onChange={(e) => setPillDose(e.target.value)} className="w-full text-xs bg-white border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Frequency</label>
                    <input type="text" value={pillFreq} onChange={(e) => setPillFreq(e.target.value)} placeholder="1-0-1" className="w-full text-xs bg-white border rounded p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Duration</label>
                    <input type="text" value={pillDuration} onChange={(e) => setPillDuration(e.target.value)} className="w-full text-xs bg-white border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Actions</label>
                    <button
                      type="button"
                      onClick={addPrescriptionPill}
                      className="w-full bg-slate-900 border hover:bg-slate-800 text-slate-100 font-bold text-xs py-2 rounded flex justify-center items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Pill generic substitution authorization */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="pill-sub-auth"
                  checked={pillSub}
                  onChange={(e) => setPillSub(e.target.checked)}
                />
                <label htmlFor="pill-sub-auth" className="text-slate-600 font-semibold cursor-pointer select-none">
                  Authorize Pharmacist Generic Substitution (CDSCO Standard Regulation)
                </label>
              </div>

              {prescriptions.length > 0 && (
                <div className="space-y-1 bg-white p-2 rounded-lg border">
                  {prescriptions.map((p, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 hover:bg-slate-100/50 rounded border border-slate-200/50">
                      <div>
                        <strong className="text-slate-900">{p.medicine}</strong> ({p.dosage}) • <span className="text-slate-500 font-mono font-medium">{p.generic}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                          <span>Freq: {p.frequency}</span>
                          <span>Dur: {p.duration}</span>
                          <span className={p.substitutionAllowed ? "text-green-700 font-bold" : "text-rose-700 font-medium"}>
                            {p.substitutionAllowed ? "✓ Generic Sub OK" : "⚡ Brand-Specific Dispense Only"}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removePrescriptionPill(index)} className="text-red-500 p-1 filter cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ancillary Lab Diagnox ordering (LOINC-based) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">LOINC Labs / Diagno Diagnostic Panel Order</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button type="button" onClick={() => triggerAddLabOrder("883-9", "ECG 12-Lead Standard", "Radiology")} className="bg-slate-50 hover:bg-slate-100 border p-2 rounded text-left cursor-pointer">
                    + Electrocardiogram (LOINC 883-9)
                  </button>
                  <button type="button" onClick={() => triggerAddLabOrder("29258-2", "Troponin I Ischemic", "Biochemistry")} className="bg-slate-50 hover:bg-slate-100 border p-2 rounded text-left cursor-pointer">
                    + Troponin I Serology (29258-2)
                  </button>
                  <button type="button" onClick={() => triggerAddLabOrder("2823-3", "Serum Potassium Level", "Biochemistry")} className="bg-slate-50 hover:bg-slate-100 border p-2 rounded text-left cursor-pointer">
                    + Serum Potassium (2823-3)
                  </button>
                  <button type="button" onClick={() => triggerAddLabOrder("11502-2", "Upper Abdomen Ultrasound", "Radiology")} className="bg-slate-50 hover:bg-slate-100 border p-2 rounded text-left cursor-pointer">
                    + USG Abdomen Sonography
                  </button>
                </div>
              </div>

              {labOrders.length > 0 && (
                <div className="bg-slate-50 p-4 border rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Pending Lab Investigations Ordered:</span>
                  <div className="space-y-1.5 scrollbar-none max-h-32 overflow-y-auto">
                    {labOrders.map(lo => (
                      <div key={lo.testCode} className="flex justify-between bg-white px-2 py-1.5 rounded border text-xs">
                        <div>
                          <span className="font-mono bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-[9px] mr-1.5">{lo.testCode}</span>
                          <strong className="text-slate-800">{lo.testName}</strong>
                        </div>
                        <button type="button" onClick={() => removeLabOrder(lo.testCode)} className="text-rose-600 font-bold filter px-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-150">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-tight transition cursor-pointer"
              >
                Authenticate & Publish Digital Consultation Encounter
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Facility-Wide Longitudinal Health Records Repository</h4>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {encounters.map(enc => (
                <div key={enc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50/90 transition flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-900 text-white p-1 rounded font-mono font-bold">{enc.id}</span>
                      <strong className="text-slate-900 text-sm">{enc.patientName} ({enc.patientId})</strong>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                      <p><strong>Clincian:</strong> {enc.doctorName} ({enc.department})</p>
                      <p><strong>Clinical Date:</strong> {new Date(enc.date).toLocaleDateString()}</p>
                      <p className="col-span-2"><strong>Chief Complaints:</strong> {enc.chiefComplaints}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {enc.diagnoses.map(d => (
                        <span key={d.code} className="text-[10px] bg-slate-200 text-slate-800 font-medium px-1.5 py-0.5 rounded border border-slate-300">
                          [{d.code}] {d.display}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-2 text-right">
                    <button
                      onClick={() => {
                        setActiveEncounterForFhir(enc);
                        convertToABDMFHIR(enc);
                      }}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 border border-indigo-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Code className="h-3.5 w-3.5" /> View ABDM FHIR Bundle
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">Published: {new Date(enc.date).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COMPONENT: Interoperable EMR JSON Bundle Generator */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-950 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col h-full" id="abdm-fhir-transformer-widget">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-slate-200 text-sm">NDHM / ABDM FHIR Core</h3>
                <p className="text-[10px] text-slate-500 font-medium">Interoperability Exchange Gateway</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-800/40">
              <ShieldCheck className="h-2.5 w-2.5" /> compliant v4.01
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <div className="p-3 bg-indigo-950/20 text-indigo-300 border border-indigo-900/40 rounded text-[11px] leading-relaxed">
              👉 Selecting any clinical EMR record triggers instant creation of standard HL7 compliant <strong>FHIR Exchange Document (Document Bundle)</strong> mapping practitioner, diagnoses structures and medication registries.
            </div>

            {activeEncounterForFhir ? (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 relative">
                  <span className="absolute -top-2 right-3 text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded border">Selected Encounter</span>
                  <p className="text-xs font-bold text-slate-200">{activeEncounterForFhir.id} — {activeEncounterForFhir.patientName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-medium">Clinician Registry: {activeEncounterForFhir.doctorName}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => convertToABDMFHIR(activeEncounterForFhir)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition duration-150"
                    disabled={isFHIRSyncing}
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> {isFHIRSyncing ? "Synthesizing..." : "Convert with Gemini API"}
                  </button>
                </div>

                <div className="flex-1 flex flex-col min-h-64 h-96 relative bg-slate-900/50 rounded-lg border border-slate-850 p-2.5 font-mono text-[10px] overflow-hidden">
                  <span className="absolute top-2.5 right-2.5 uppercase text-[9px] text-slate-500 font-bold font-mono tracking-widest bg-slate-950 p-1 rounded border border-slate-800 flex items-center gap-1">
                    <Code className="h-3 w-3" /> JSON Viewer
                  </span>
                  
                  {isFHIRSyncing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 border-2 border-t-amber-500 border-r-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-slate-400">Synthesizing resources (Practitioner, Composition, Device, MedicationRequest)...</p>
                    </div>
                  ) : fhirBundleJson ? (
                    <textarea
                      readOnly
                      value={JSON.stringify(fhirBundleJson, null, 2)}
                      className="w-full h-full text-indigo-300 bg-transparent resize-none focus:outline-hidden"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
                      <p className="text-slate-400 text-xs font-medium">Click "Convert" to process this record through ABDM Core exchange simulator.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 py-12 flex flex-col items-center justify-center text-slate-500 text-center text-xs">
                No active clinical session has been initialized. Create or select an encounter on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
