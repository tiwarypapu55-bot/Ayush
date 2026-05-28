import React, { useState } from "react";
import { User, QrCode, ClipboardPlus, Phone, Shield, ArrowRight, CheckCircle2, BadgeAlert, Plus, HelpCircle, Activity } from "lucide-react";
import { Patient, Encounter, AbhaMaster } from "../types";
import AbhaIntegrationHub from "./AbhaIntegrationHub";

interface ReceptionistProps {
  patients: Patient[];
  abhaMaster: AbhaMaster[];
  encounters: Encounter[];
  onAddPatient: (patient: Patient) => void;
  onScanShareRegister: (abhaId: string, name: string) => Promise<any>;
  onAddAbhaMaster?: (record: AbhaMaster) => void;
  onRefreshData?: () => void;
}

export default function ReceptionistView({ 
  patients, 
  abhaMaster, 
  encounters, 
  onAddPatient, 
  onScanShareRegister,
  onAddAbhaMaster,
  onRefreshData
}: ReceptionistProps) {
  // Add Patient Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [guardian, setGuardian] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [dob, setDob] = useState("1990-01-01");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [socioeconomic, setSocioeconomic] = useState("General");
  const [insurance, setInsurance] = useState<"Cashless PM-JAY" | "TPA Private" | "Self-Pay">("Self-Pay");
  const [pmjayId, setPmjayId] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Delhi");
  const [district, setDistrict] = useState("New Delhi");

  // ABHA Generator Sandbox States
  const [aadhaarForAbha, setAadhaarForAbha] = useState("");
  const [nameForAbha, setNameForAbha] = useState("");
  const [abhaStep, setAbhaStep] = useState<"input" | "otp" | "complete">("input");
  const [sentOtpTxnId, setSentOtpTxnId] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedAbha, setGeneratedAbha] = useState<{ id: string; num: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scan & Share kiosk simulation
  const [kioskAbhaId, setKioskAbhaId] = useState("suresh.sharma@sbx");
  const [kioskName, setKioskName] = useState("Suresh Kumar Sharma");
  const [scanResultToken, setScanResultToken] = useState<string | null>(null);
  const [scannedPatientInfo, setScannedPatientInfo] = useState<Patient | null>(null);

  const handleCreateAbhaRequest = async () => {
    if (!aadhaarForAbha || !nameForAbha) return alert("Aadhaar Number and Full Name are required for ABHA Registry");
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/abdm/abha/create-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarForAbha })
      });
      const data = await resp.json();
      if (data.success) {
        setSentOtpTxnId(data.txnId);
        setAbhaStep("otp");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyAbhaOtp = async () => {
    if (!enteredOtp) return;
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/abdm/abha/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarForAbha, otp: enteredOtp, name: nameForAbha })
      });
      const data = await resp.json();
      if (data.success) {
        setGeneratedAbha({ id: data.abhaId, num: data.abhaNumber });
        setAbhaStep("complete");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanShareSubmit = async () => {
    if (!kioskAbhaId) return;
    try {
      const res = await onScanShareRegister(kioskAbhaId, kioskName);
      if (res.success) {
        setScanResultToken(res.token);
        setScannedPatientInfo(res.patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetKiosk = () => {
    setScanResultToken(null);
    setScannedPatientInfo(null);
  };

  const submitAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const dummyUhid = `UHID-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPat: Patient = {
      id: dummyUhid,
      name,
      guardianName: guardian,
      gender,
      dob,
      phone,
      aadhaar: aadhaar || "Not Provided",
      address,
      state,
      district,
      bloodGroup,
      socioeconomicCategory: socioeconomic,
      insuranceType: insurance,
      pmjayId: insurance === "Cashless PM-JAY" ? (pmjayId || `P-${Math.floor(10000 + Math.random() * 89999)}`) : undefined,
      registeredAt: new Date().toISOString()
    };

    onAddPatient(newPat);
    setShowAddForm(false);
    // Reset standard form fields
    setName("");
    setPhone("");
    setGuardian("");
    setAadhaar("");
    setPmjayId("");
    setAddress("");
  };

  const [activeWorkspace, setActiveWorkspace] = useState<"standard" | "abdm">("standard");

  return (
    <div className="space-y-6">
      {/* Workspace Selector Bar */}
      <div className="bg-image1-teal text-indigo-950 p-2.5 rounded-xl flex items-center justify-between shadow-md select-none border border-teal-300/30">
        <div className="flex items-center gap-2 pl-2">
          <Activity className="h-4.5 w-4.5 text-indigo-900 animate-pulse" />
          <span className="text-xs font-bold font-mono text-indigo-950">OPD Core Desk Workspaces:</span>
        </div>
        <div className="flex bg-teal-900/20 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveWorkspace("standard")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeWorkspace === "standard" 
                ? "bg-indigo-700 text-white font-bold" 
                : "text-indigo-950 hover:bg-white/20"
            }`}
          >
            📋 Standard Register
          </button>
          <button
            onClick={() => setActiveWorkspace("abdm")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeWorkspace === "abdm" 
                ? "bg-indigo-700 text-white font-bold" 
                : "text-indigo-950 hover:bg-white/20"
            }`}
          >
            🆔 ABDM Sandbox Gateway
          </button>
        </div>
      </div>

      {activeWorkspace === "abdm" ? (
        <AbhaIntegrationHub
          patients={patients}
          abhaMaster={abhaMaster}
          encounters={encounters}
          onAddPatient={onAddPatient}
          onAddAbhaMaster={onAddAbhaMaster}
          onRefreshData={onRefreshData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reception-view-container">
      {/* LEFT COLUMN: System Patient Registry list & Onboarding forms */}
      <div className="lg:col-span-8 space-y-6">
        {/* Core Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Standard OPD Registration Desk</h2>
            <p className="text-slate-500 text-sm">Assign local hospital UHID, link PM-JAY eligibility, or hook external digital resources.</p>
          </div>
          <button
            id="btn-toggle-add-patient"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3.5 rounded-lg text-xs tracking-tight transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> {showAddForm ? "View Registry List" : "Manual UHID Registration"}
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={submitAddPatient} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6" id="add-patient-form">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Manual UHID New Patient Registry Form</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sathe"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={guardian}
                  onChange={(e) => setGuardian(e.target.value)}
                  placeholder="Father's / Spouse name"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mobile number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option>O+</option>
                  <option>A+</option>
                  <option>B+</option>
                  <option>AB+</option>
                  <option>O-</option>
                  <option>A-</option>
                  <option>B-</option>
                  <option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Socioeconomic Category</label>
                <select
                  value={socioeconomic}
                  onChange={(e) => setSocioeconomic(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="General">APL (Above Poverty Line)</option>
                  <option value="BPL (Below Poverty Line)">BPL (Below Poverty Line)</option>
                  <option value="SECC Eligible">SECC Eligible (PM-JAY Target)</option>
                  <option value="Antyodaya Anna Yojana (AAY)">AAY (Antyodaya Anna Yojana)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Insurance Protocol</label>
                <select
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value as any)}
                  className="w-full text-sm border border-slate-300 bg-white rounded-lg p-2 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Self-Pay">Self-Pay / Cash</option>
                  <option value="Cashless PM-JAY">National PM-JAY Cashless</option>
                  <option value="TPA Private">TPA Private Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">12-Digit Aadhaar No</label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="e.g. 5566-7788-9900"
                  className="w-full text-sm border border-slate-300 bg-white rounded-lg p-2 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              {insurance === "Cashless PM-JAY" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">PM-JAY ID (Ayushman Card No)</label>
                  <input
                    type="text"
                    value={pmjayId}
                    onChange={(e) => setPmjayId(e.target.value)}
                    placeholder="e.g. P-1299-XX"
                    className="w-full text-sm border border-slate-300 bg-white rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold tracking-tight cursor-pointer"
              >
                Register & Onboard Patient
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Search filter Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Active Hospital Demographics UHID Registry ({patients.length})</h3>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
                National Longitudinal Synchronization Enabled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-250 text-slate-600 font-mono text-[10px] uppercase">
                    <th className="p-3">UHID / Patient</th>
                    <th className="p-3">ABHA Linkage</th>
                    <th className="p-3">Guard / Phone</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Ayushman Card / Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold text-slate-950">{pat.name}</p>
                          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-1 border border-slate-200 rounded">
                            {pat.id}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {pat.abhaId ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                              <Shield className="h-3 w-3 fill-green-500/10 text-green-600" /> {pat.abhaId}
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{pat.abhaNumber}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded font-medium">
                            Not ABHA linked
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        <p className="font-semibold">{pat.guardianName || "N/A"}</p>
                        <p className="flex items-center gap-1 font-mono text-slate-500 mt-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {pat.phone}
                        </p>
                      </td>
                      <td className="p-3 text-xs">
                        {pat.insuranceType === "Cashless PM-JAY" ? (
                          <span className="text-orange-700 bg-orange-50 select-none border border-orange-200 px-2 py-1 rounded font-bold">
                            PM-JAY Eligible
                          </span>
                        ) : pat.insuranceType === "TPA Private" ? (
                          <span className="text-blue-700 bg-blue-50 select-none border border-blue-100 px-2 py-1 rounded font-medium">
                            Private Cover
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 select-none border border-slate-200 px-2 py-1 rounded text-[11px]">
                            Cash / Self-Pay
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-slate-600 font-mono">
                        <p className="font-semibold text-slate-800">{pat.pmjayId || "—"}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{pat.socioeconomicCategory}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: ABHA generator Sandbox & Scan-and-Share QR Simulator */}
      <div className="lg:col-span-4 space-y-6">
        {/* ABDM ABHA ID Creator Simulator */}
        <div className="bg-image2-coral border border-rose-350 text-slate-950 p-6 rounded-xl shadow-md" id="sandbox-abha-gen">
          <div className="flex items-center gap-2 border-b border-rose-950/20 pb-3 mb-4">
            <span className="text-lg">🆔</span>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">UIDAI Aadhaar / ABHA Creator</h3>
              <p className="text-[11px] text-slate-900/80">Official Sandboxed ABHA card self-issuance portal.</p>
            </div>
          </div>

          {abhaStep === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold uppercase mb-1">Aadhaar (12 digits)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarForAbha}
                  onChange={(e) => setAadhaarForAbha(e.target.value)}
                  placeholder="e.g. 1111-2222-3333"
                  className="w-full text-slate-900 bg-white/95 border border-rose-950/15 text-xs p-2.5 rounded-md focus:outline-hidden focus:border-amber-600 font-mono placeholder:text-slate-500/70"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold uppercase mb-1">Full Beneficiary Name</label>
                <input
                  type="text"
                  value={nameForAbha}
                  onChange={(e) => setNameForAbha(e.target.value)}
                  placeholder="e.g. Suresh Chandra"
                  className="w-full text-slate-900 bg-white/95 border border-rose-950/15 text-xs p-2.5 rounded-md focus:outline-hidden focus:border-amber-600 placeholder:text-slate-500/70"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateAbhaRequest}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-lg cursor-pointer transition shadow-sm"
                disabled={isGenerating}
              >
                {isGenerating ? "Sending Request..." : "Request OTP Verification"}
              </button>
            </div>
          )}

          {abhaStep === "otp" && (
            <div className="space-y-4">
              <div className="p-3 bg-white/90 text-amber-950 border border-rose-200 rounded text-xs leading-relaxed font-semibold shadow-2xs">
                🚀 Simulated SMS OTP sent to mobile linked with Aadhaar! Use code <strong>123456</strong> to complete.
              </div>
              <div>
                <label className="block text-[10px] text-slate-900 font-extrabold uppercase mb-1">Enter 6-Digit Verification OTP</label>
                <input
                  type="text"
                  value={enteredOtp}
                  maxLength={6}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-slate-900 bg-white border border-rose-950/15 text-sm font-bold p-2.5 rounded-md font-mono focus:border-amber-600 outline-hidden placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyAbhaOtp}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition shadow-sm"
                disabled={isGenerating}
              >
                {isGenerating ? "Verifying Token..." : "Confirm & Link ABDM Registry"}
              </button>
            </div>
          )}

          {abhaStep === "complete" && generatedAbha && (
            <div className="space-y-4">
              <div className="bg-white/95 p-4 rounded-lg border border-rose-950/15 flex flex-col items-center shadow-xs">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-xs font-bold text-slate-900">ABDM Registry Linked Successful</p>
                
                <div className="w-full mt-3 pt-3 border-t border-slate-200 space-y-1">
                  <p className="text-[10px] text-slate-600 font-bold">ABHA Address / ID</p>
                  <p className="text-xs font-mono font-bold text-green-800 bg-green-50 py-1.5 px-2.5 rounded border border-green-200 text-center shadow-2xs">
                    {generatedAbha.id}
                  </p>
                  <p className="text-[10px] text-slate-600 font-bold mt-2">14-Digit ABHA Number</p>
                  <p className="text-xs font-mono text-slate-900 text-center font-bold">
                    {generatedAbha.num}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Direct auto filling of our patient form with linked ABHA settings
                  setName(nameForAbha);
                  setAadhaar(aadhaarForAbha);
                  setAbhaStep("input");
                  setNameForAbha("");
                  setAadhaarForAbha("");
                  setEnteredOtp("");
                  setGeneratedAbha(null);
                  setShowAddForm(true);
                  // Link preloaded abha address in state implicitly
                  alert("Linked profile transferred to manual registration form! Proceed to complete.");
                }}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs py-2 rounded-lg cursor-pointer transition shadow-sm"
              >
                Onboard into Patient Registry Now
              </button>
            </div>
          )}
        </div>

        {/* Scan & Share OPD Registration QR Kiosk */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs" id="scan-share-kiosk">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <QrCode className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">ABDM "Scan & Share" QR Kiosk</h3>
              <p className="text-slate-500 text-[11px]">Instant queue token bypass simulator.</p>
            </div>
          </div>

          {!scanResultToken ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <QrCode className="h-6 w-6" />
                </div>
                <div className="text-xs text-slate-700 leading-normal">
                  In practice, patients scan the facility's QR code on their Aarogya Setu or PHR app to instantly share their demographic profile.
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Simulated Phone ABHA App Profile</label>
                  <select
                    value={kioskAbhaId}
                    onChange={(e) => {
                      setKioskAbhaId(e.target.value);
                      if (e.target.value === "suresh.sharma@sbx") setKioskName("Suresh Kumar Sharma");
                      else if (e.target.value === "lalitha.devi@sbx") setKioskName("Lalitha Devi Prasad");
                    }}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-hidden"
                  >
                    <option value="suresh.sharma@sbx">Suresh Kumar Sharma (suresh.sharma@sbx)</option>
                    <option value="lalitha.devi@sbx">Lalitha Devi Prasad (lalitha.devi@sbx)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleScanShareSubmit}
                className="w-full bg-slate-900 text-slate-100 hover:bg-slate-850 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Scan Shared QR Profile <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-green-200 bg-green-50/10 p-4 rounded-lg flex flex-col items-center text-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg mb-1">
                  #{scanResultToken}
                </div>
                <h4 className="text-sm font-bold text-slate-800">OPD Queue Ticket Generated</h4>
                <p className="text-[11px] text-slate-500 mt-1">E-Record linked to UHID {scannedPatientInfo?.id}</p>

                <div className="w-full border-t border-slate-100 mt-3 pt-3 text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Beneficiary:</span>
                    <strong className="text-slate-800">{scannedPatientInfo?.name}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Wait Time Est:</span>
                    <strong className="text-emerald-700">Under 10 mins</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ABHA Address:</span>
                    <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-150 px-1 py-0.5 rounded text-[10px]">
                      {scannedPatientInfo?.abhaId}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetKiosk}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2 rounded-lg cursor-pointer"
              >
                Scan Next Patient Profile
              </button>
            </div>
          )}
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
