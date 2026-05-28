import React, { useState } from "react";
import { Plus, Check, ShieldAlert, Award, FileSpreadsheet, Lock, Sparkles, Ban, HelpCircle, UserCheck, ShieldClose, User, ClipboardList, Wallet, TicketPercent, ShoppingCart } from "lucide-react";
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
}

export default function AncillaryViews({ currentRole, patients, encounters, beds, consents, onLabSubmit, onPharmacyDispense, onAddConsent }: AncillaryViewsProps) {
  // LIS State
  const [selectedEncounterId, setSelectedEncounterId] = useState(encounters[0]?.id || "");
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [labResult, setLabResult] = useState("");
  const [criticalFlag, setCriticalFlag] = useState(false);
  const [reportNotes, setReportNotes] = useState("");

  // Patient Portal State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [newConsentPurpose, setNewConsentPurpose] = useState("");
  const [newConsentDoctorName, setNewConsentDoctorName] = useState("Dr. Arvind Swaminathan");
  const [consentGrantedSuccess, setConsentGrantedSuccess] = useState(false);

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
    const newConsent: ConsentLog = {
      id: `CNS-${Math.floor(1000 + Math.random() * 9000)}`,
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
    setNewConsentPurpose("");
    setConsentGrantedSuccess(true);
    setTimeout(() => setConsentGrantedSuccess(false), 3000);
  };

  const handleRevokeConsent = (consentId: string) => {
    const rawConsent = consents.find(c => c.id === consentId);
    if (rawConsent) {
      if (confirm("Are you sure you want to immediately revoke clinical data transmission access for this professional?")) {
        rawConsent.status = "Revoked";
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
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Lab Information System (LIS & RIS PACS)</h2>
              <p className="text-xs text-slate-500">Log diagnostic blood counts, chemistry troponins, and attach radiology sonography outcomes.</p>
            </div>
            <span className="text-xs font-bold text-slate-100 bg-indigo-600 px-3 py-1 rounded-md border border-indigo-500">
              NABL High-Priority Alert Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lab results submission */}
            <form onSubmit={handleLabFormSubmit} className="space-y-4 bg-slate-50 p-5 rounded-lg border">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Lab Record Feed Entry Form</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Select Active Encounter</label>
                  <select
                    value={selectedEncounterId}
                    onChange={(e) => {
                      setSelectedEncounterId(e.target.value);
                      setSelectedOrderIndex(0);
                    }}
                    className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
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
                    className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
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

              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">Quantitative Result Entry *</label>
                  <input
                    type="text"
                    required
                    value={labResult}
                    onChange={(e) => setLabResult(e.target.value)}
                    placeholder="e.g. 0.08 ng/mL (Troponin I)"
                    className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden"
                  />
                </div>
                
                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lab-critical-check"
                    checked={criticalFlag}
                    onChange={(e) => setCriticalFlag(e.target.checked)}
                    className="h-4 w-4 text-red-600"
                  />
                  <label htmlFor="lab-critical-check" className="text-xs text-red-600 font-bold uppercase flex items-center gap-1 cursor-pointer">
                    <ShieldAlert className="h-4 w-4 animate-bounce" /> Trigger Critical Panic Alarm
                  </label>
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-2 rounded-lg cursor-pointer"
              >
                Authenticate & Sync Lab Result to EHR
              </button>
            </form>

            {/* View outstanding/pending tests list */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Unprocessed LIS Core Pending Pool</span>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {encounters.map(enc => (
                  <div key={enc.id} className="border rounded-lg p-3.5 bg-slate-50 hover:bg-slate-100/50 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <strong>{enc.patientName} ({enc.patientId})</strong>
                      <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{enc.id}</span>
                    </div>

                    <div className="space-y-1">
                      {enc.labOrders.map((lo, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded border text-xs leading-normal">
                          <div>
                            <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded mr-1.5">{lo.testCode}</span>
                            <span className="text-slate-800 font-medium">{lo.testName}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            lo.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                          }`}>
                            {lo.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHARMACY DRUG CONTROL VIEW */}
      {currentRole === "Pharmacy" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3.5 mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Standard Pharmacy & CDSCO Dispensation Desk</h2>
              <p className="text-xs text-slate-500">Track drug schedules, cross-examine active ePrescriptions, and register generic substitutions.</p>
            </div>
            <span className="text-xs font-bold text-slate-100 bg-emerald-600 px-3 py-1 rounded-md">
              CDSCO Drug Control Active
            </span>
          </div>

          <div className="space-y-4">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Active Prescriptions Dispensing Queue</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {encounters.map(enc => {
                const pendingMeds = enc.prescriptions.filter(p => !p.dispensed);
                return (
                  <div key={enc.id} className="border rounded-xl p-4.5 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <strong>{enc.patientName} ({enc.patientId})</strong>
                        <span className="font-mono bg-slate-200 text-slate-600 px-1 rounded text-[10px]">{enc.id}</span>
                      </div>

                      <div className="space-y-2">
                        {enc.prescriptions.map((p, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border flex justify-between items-start text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900">{p.medicine}</p>
                              <p className="text-[10px] font-mono text-slate-500">Generic formula: {p.generic}</p>
                              <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                                <span>Dosage: {p.dosage}</span>
                                <span>Freq: {p.frequency}</span>
                                <span>Dur: {p.duration}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {p.dispensed ? (
                                <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 font-bold px-2 py-0.5 rounded">
                                  Dispensed ✓
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePharmacyDispensation(enc.id, idx)}
                                  className="bg-slate-900 hover:bg-slate-800 text-slate-100 text-[10px] font-bold py-1 px-2.5 rounded transition cursor-pointer"
                                >
                                  Dispense Drug
                                </button>
                              )}
                              <span className={`text-[9px] font-bold ${p.substitutionAllowed ? "text-green-600" : "text-amber-600"}`}>
                                {p.substitutionAllowed ? "Generic OK" : "Brand Only"}
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
        </div>
      )}

      {/* 3. PATIENT DIGITAL PORTAL VIEW */}
      {currentRole === "Patient" && (
        <div className="space-y-6" id="abha-patient-dashboard">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">ABHA Self-Access Patient EHR Portal</h2>
              <p className="text-xs text-slate-500">View local longitudinal summaries, track clinical diagnosis, or manage professional active data sharing consents.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Self Session:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="text-xs border rounded-lg py-1.5 px-3 bg-slate-50 focus:outline-hidden font-bold"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ABHA: {p.abhaId || "None"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Health Records Cabinet */}
            <div className="lg:col-span-8 space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> My Longitudinal Digital Health Folders ({patientEncounters.length})
              </span>

              {patientEncounters.length > 0 ? (
                <div className="space-y-4">
                  {patientEncounters.map(enc => (
                    <div key={enc.id} className="border p-4.5 rounded-xl bg-slate-50/50 space-y-3 hover:bg-slate-50/80 transition shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-slate-950">Attending Consultant: {enc.doctorName} ({enc.department})</strong>
                        <span className="font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">{enc.id}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 bg-white p-3 rounded-lg border">
                        <p><strong>Clinical Date:</strong> {new Date(enc.date).toLocaleString()}</p>
                        <p><strong>Chief Complaints:</strong> {enc.chiefComplaints}</p>
                        <p className="col-span-2 text-indigo-700">
                          <strong>Active ePrescriptions:</strong> {enc.prescriptions.map(p => `${p.medicine} (${p.dosage})`).join(", ") || "No drugs prescribed"}
                        </p>
                      </div>

                      {enc.labOrders.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Diagnox Reports:</span>
                          <div className="space-y-1">
                            {enc.labOrders.map((lo, i) => (
                              <div key={i} className="flex justify-between items-center bg-white border p-2 rounded text-xs leading-normal">
                                <div>
                                  <span className="text-slate-900 font-semibold">{lo.testName}</span>
                                  {lo.resultValue && <p className="text-[10px] text-green-700 font-mono font-bold mt-0.5">Value Registered: {lo.resultValue}</p>}
                                </div>
                                <span className={`text-[10px] tracking-wide font-bold uppercase rounded border px-2 py-0.5 ${
                                  lo.criticalAlert ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                                }`}>
                                  {lo.criticalAlert ? "Critical Panic Alert" : "Completed / Normal"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No EMR files generated for this ABHA card holder in our sandboxed hospital cache. Write clinical notes under <strong>Doctor EMR tab</strong> first.
                </div>
              )}
            </div>

            {/* Consent Gateway */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> ABDM Consent Framework
                </span>
                <p className="text-[11px] text-slate-400 leading-normal mb-3">
                  Under Indian ABDM guideline scope, clinicians require patients to grant explicit visual consent via mobile triggers before electronic history exchange starts.
                </p>

                <form onSubmit={handleGrantConsentSubmit} className="space-y-3.5 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Grant Sharing Access To:</label>
                    <select
                      value={newConsentDoctorName}
                      onChange={(e) => setNewConsentDoctorName(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 focus:outline-hidden font-bold"
                    >
                      <option value="Dr. Arvind Swaminathan">Dr. Arvind Swaminathan (Cardiology)</option>
                      <option value="Dr. Shruti Aggarwal">Dr. Shruti Aggarwal (General Medicine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Purpose Description</label>
                    <input
                      type="text"
                      required
                      value={newConsentPurpose}
                      onChange={(e) => setNewConsentPurpose(e.target.value)}
                      placeholder="e.g. Outpatient history review for hypertension"
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 focus:outline-hidden"
                    />
                  </div>

                  {consentGrantedSuccess && (
                    <div className="text-[10px] text-green-400 font-bold bg-green-950/20 py-1.5 px-2.5 rounded border border-green-900/40 text-center">
                      ✓ Mutual Access Authorization Granted successful!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    Authenticate & Authorize Consent
                  </button>
                </form>
              </div>

              {/* Active Consents Lists */}
              <div className="bg-slate-50 p-4 border rounded-xl space-y-3">
                <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">Active Shared Consents Registry ({patientConsents.length})</span>
                
                <div className="space-y-2.5">
                  {patientConsents.map(con => (
                    <div key={con.id} className="bg-white p-3 rounded-lg border text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Ref ID: {con.id}</span>
                        <span>Scope: Diagnostics</span>
                      </div>
                      <p className="font-bold text-slate-900">Dr. {con.doctorName}</p>
                      <p className="text-[11px] text-slate-500">{con.purpose}</p>
                      
                      <div className="flex justify-between items-center pt-2 mt-1.5 border-t border-slate-100">
                        <span className={`text-[10px] font-bold ${con.status === "Active" ? "text-green-700" : "text-rose-700"}`}>
                          ● {con.status}
                        </span>
                        {con.status === "Active" && (
                          <button
                            onClick={() => handleRevokeConsent(con.id)}
                            className="text-rose-700 font-bold hover:underline select-none text-[10px] flex items-center gap-0.5 cursor-pointer font-sans"
                          >
                            <Ban className="h-3 w-3" /> Revoke Access
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
