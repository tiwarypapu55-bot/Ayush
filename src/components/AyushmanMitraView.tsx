import React, { useState } from "react";
import { Shield, Sparkles, AlertTriangle, CheckCircle2, FileText, Upload, Plus, Play, HelpCircle, FileChartLine, DollarSign, Activity } from "lucide-react";
import { Patient, PmjayClaim, Encounter, AbhaMaster } from "../types";
import AbhaIntegrationHub from "./AbhaIntegrationHub";

interface AyushmanMitraProps {
  patients: Patient[];
  claims: PmjayClaim[];
  encounters: Encounter[];
  abhaMaster: AbhaMaster[];
  onAddClaim: (claim: PmjayClaim) => void;
  onUpdateClaimStatus: (claimId: string, action: 'approve' | 'query' | 'reject' | 'pay', queryText?: string) => void;
  onRefreshData?: () => void;
}

const PMJAY_PACKAGES = [
  { code: "SG013", name: "Laparoscopic Cholecystectomy (Gallbladder Removal)", cost: 24000, specialty: "Surgical Gastroenterology" },
  { code: "SU004", name: "Total Hip Replacement (Unilateral)", cost: 90000, specialty: "Orthopedics" },
  { code: "MC001", name: "Coronary Artery Bypass Grafting (CABG)", cost: 140000, specialty: "Cardiology" },
  { code: "MC008", name: "Severe Sepsis Management in ICU", cost: 35000, specialty: "Critical Care" },
  { code: "SO011", name: "Cataract Surgery with Foldable Intraocular Lens (IOL)", cost: 12000, specialty: "Ophthalmology" }
];

export default function AyushmanMitraView({ 
  patients, 
  claims, 
  encounters, 
  abhaMaster, 
  onAddClaim, 
  onUpdateClaimStatus, 
  onRefreshData 
}: AyushmanMitraProps) {
  // Only show patients eligible for PM-JAY
  const pmjayPatients = patients.filter(p => p.insuranceType === "Cashless PM-JAY" || p.pmjayId);

  // New Claim Form state
  const [selectedPatientId, setSelectedPatientId] = useState(pmjayPatients[0]?.id || "");
  const [selectedPackageCode, setSelectedPackageCode] = useState(PMJAY_PACKAGES[0].code);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [queryText, setQueryText] = useState("");
  const [activeClaimIdQuery, setActiveClaimIdQuery] = useState<string | null>(null);

  // AI Fraud audit states
  const [auditedClaimId, setAuditedClaimId] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ score: number; flags: string[]; explanation: string; recommendation: string } | null>(null);

  const handlePreAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patObj = patients.find(p => p.id === selectedPatientId);
    if (!patObj) return alert("Select a valid PM-JAY beneficiary patient");

    const packObj = PMJAY_PACKAGES.find(p => p.code === selectedPackageCode);
    if (!packObj) return;

    const newClaim: PmjayClaim = {
      id: `CLM-${Math.floor(4000 + Math.random() * 5999)}`,
      patientId: patObj.id,
      patientName: patObj.name,
      pmjayId: patObj.pmjayId || `P-${Math.floor(10000 + Math.random() * 89999)}`,
      diagnosisCode: "K81.0 (Acute Cholecystitis / Related)",
      procedureCode: packObj.code,
      procedureName: packObj.name,
      packageCost: packObj.cost,
      preAuthStatus: "Pending Approval",
      claimStatus: "Submitted",
      clinicalDocUrl: "/docs/clinical_notes_preauth.pdf",
      investigationDocUrl: "/docs/lab_imaging_preauth.pdf",
      submissionDate: new Date().toISOString()
    };

    onAddClaim(newClaim);
    alert(`Ayushman Bharat Cashless Pre-Authorization ${newClaim.id} submitted for NHA review!`);
  };

  const executeAIAudit = async (claim: PmjayClaim) => {
    setIsAuditing(true);
    setAuditResult(null);
    setAuditedClaimId(claim.id);

    // Fetch related encounters for clinical correlation
    const relatedEncounters = encounters
      .filter(e => e.patientId === claim.patientId)
      .map(e => ({
        soap: e.soapNotes,
        complaints: e.chiefComplaints,
        diagnoses: e.diagnoses
      }));

    try {
      const resp = await fetch("/api/claims/audit-fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimData: {
            patientName: claim.patientName,
            pmjayId: claim.pmjayId,
            diagnosisCode: claim.diagnosisCode,
            procedureCode: claim.procedureCode,
            procedureName: claim.procedureName,
            packageCost: claim.packageCost
          },
          clinicHistory: relatedEncounters.length > 0 ? relatedEncounters : "No historical EMR matching files present."
        })
      });
      const data = await resp.json();
      if (data) {
        setAuditResult(data);
        // Save audit into global state by mutating claim locally so the SuperAdmin/Mitra view can read it
        claim.fraudAnalysis = data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAuditorQuery = (claimId: string) => {
    if (!queryText) return alert("Provide query context text for tracking");
    onUpdateClaimStatus(claimId, "query", queryText);
    setQueryText("");
    setActiveClaimIdQuery(null);
    alert("Auditor clarification query dispatched back to medical desk.");
  };

  const [activeWorkspace, setActiveWorkspace] = useState<"standard" | "abdm">("standard");

  return (
    <div className="space-y-6">
      {/* Workspace Selector Bar */}
      <div className="bg-image1-teal text-indigo-950 p-2.5 rounded-xl flex items-center justify-between shadow-md select-none border border-teal-300/30">
        <div className="flex items-center gap-2 pl-2">
          <Activity className="h-4.5 w-4.5 text-indigo-900 animate-pulse" />
          <span className="text-xs font-bold font-mono text-indigo-950">PM-JAY Mitra Desk Workspaces:</span>
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
            🛡️ Cashless BIS Desk
          </button>
          <button
            onClick={() => setActiveWorkspace("abdm")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeWorkspace === "abdm" 
                ? "bg-indigo-700 text-white font-bold" 
                : "text-indigo-950 hover:bg-white/20"
            }`}
          >
            🆔 ABDM Registry Gateway
          </button>
        </div>
      </div>

      {activeWorkspace === "abdm" ? (
        <AbhaIntegrationHub
          patients={patients}
          abhaMaster={abhaMaster}
          encounters={encounters}
          onAddPatient={() => {}}
          onAddAbhaMaster={() => {}}
          onRefreshData={onRefreshData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ayushman-mitra-view">
      {/* LEFT COLUMN: Beneficiary Validation, Card BIS Look-up and Pre-Auth forms */}
      <div className="lg:col-span-4 space-y-6">
        {/* Ayushman Mitra Desk Header */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-3">
            <span className="p-2 bg-orange-600 rounded-lg text-white">🛡️</span>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Ayushman Mitra Help Desk</h3>
              <p className="text-[10px] text-slate-400">Pradhan Mantri Jan Arogya Yojana Registration Hub</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Verify SECC/BPL beneficiary cards, map procedure codes to NHA state packages, and initiate secure cashless billing pre-authorizations.
          </p>
        </div>

        {/* Cashless Claim Pre-Authorization Submission */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Cashless Claim Pre-Authorization Sheet</h4>
          
          {pmjayPatients.length > 0 ? (
            <form onSubmit={handlePreAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Verify Patient Beneficiary *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  required
                >
                  {pmjayPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Card: {p.pmjayId || "Gen Card"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Specialty Package Code *</label>
                <select
                  value={selectedPackageCode}
                  onChange={(e) => setSelectedPackageCode(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  required
                >
                  {PMJAY_PACKAGES.map(pack => (
                    <option key={pack.code} value={pack.code}>
                      {pack.code} — {pack.name} (₹{pack.cost.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Files checklist */}
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2 text-xs">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Documents Checklist For Pre-Auth</span>
                
                <div className="flex items-center justify-between bg-white border p-1.5 rounded text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-slate-400 font-medium" /> Clinical Operative Indications.pdf
                  </span>
                  <Upload className="h-3.5 w-3.5 text-indigo-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between bg-white border p-1.5 rounded text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> Lab Imaging Diagnostics.pdf
                  </span>
                  <Upload className="h-3.5 w-3.5 text-indigo-600 cursor-pointer" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg cursor-pointer transition"
              >
                Onboard Claim & Upload Pre-Auth
              </button>
            </form>
          ) : (
            <div className="p-6 text-center text-rose-700 bg-rose-50 border border-rose-100 rounded-lg text-xs leading-normal">
              No PM-JAY Cashless Eligible patients registered in active databases. Go to <strong>Receptionist Panel</strong> to link a patient to "National PM-JAY" protocol first.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive claim settlement audit workspace & AI FRAUD prevention details */}
      <div className="lg:col-span-8 space-y-6">
        {/* Ayushman Mitra Executive KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ayushman-mitra-dashboard-indicators">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 font-sans shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pre-Auth Approved</span>
            <strong className="text-lg text-green-700 font-black font-mono block">
              {claims.filter(c => c.preAuthStatus === "Approved").length} / {claims.length} Claims
            </strong>
            <span className="text-[9px] text-slate-500 font-medium">Approved cashless settlements</span>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 font-sans shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pre-Auth Rejected</span>
            <strong className="text-lg text-rose-700 font-black font-mono block">
              {claims.filter(c => c.preAuthStatus === "Rejected").length} Claims
            </strong>
            <span className="text-[9px] font-semibold text-rose-600 block leading-tight mt-0.5">Flagged duplicate entries</span>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 font-sans shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">AI Fraud Shield Guard</span>
            <strong className="text-lg text-amber-700 font-black font-mono block">
              {claims.filter(c => c.fraudAnalysis && c.fraudAnalysis.score > 40).length} High Alerts
            </strong>
            <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">Mismatched package codes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">NHA Central Claims & Fraud Prevention Workspace</h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-250 text-[10px] font-mono uppercase text-slate-500">
                  <th className="p-3">Claim Ref & Beneficiary</th>
                  <th className="p-3">Procedure & Cost</th>
                  <th className="p-3">Pre-Auth Status</th>
                  <th className="p-3">AI Fraud Audit</th>
                  <th className="p-3">Auditor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {claims.length > 0 ? (
                  claims.map(claim => (
                    <tr key={claim.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <strong className="text-slate-900 text-[13px]">{claim.patientName}</strong>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Card ID: {claim.pmjayId}</p>
                        <p className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1 border rounded w-max mt-1">{claim.id}</p>
                      </td>
                      <td className="p-3">
                        <strong className="text-slate-800 font-medium truncate max-w-xs block">{claim.procedureName}</strong>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Code: {claim.procedureCode} ({claim.diagnosisCode})</p>
                        <p className="text-indigo-700 font-extrabold text-xs mt-1">₹{claim.packageCost.toLocaleString()}</p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase border px-2 py-0.5 rounded ${
                            claim.preAuthStatus === "Approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : claim.preAuthStatus === "Queried"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : claim.preAuthStatus === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {claim.preAuthStatus}
                        </span>
                        {/* Audit Details link */}
                        {claim.fraudAnalysis && (
                          <div className="mt-1">
                            <span className="text-[9px] font-bold text-green-700 font-mono">
                              Risk Score: {claim.fraudAnalysis.score}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => executeAIAudit(claim)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-sans text-[10px] py-1 px-2 rounded-md flex items-center gap-1 cursor-pointer transition"
                        >
                          <Play className="h-3 w-3 fill-slate-950" /> {auditedClaimId === claim.id && isAuditing ? "Auditing..." : "Trigger AI Audit"}
                        </button>
                      </td>
                      <td className="p-3 space-y-1.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => onUpdateClaimStatus(claim.id, "approve")}
                            className="bg-green-600 hover:bg-green-750 text-white font-bold text-[9px] py-1 px-1.5 rounded-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActiveClaimIdQuery(claim.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[9px] py-1 px-1.5 rounded-md cursor-pointer"
                          >
                            Query
                          </button>
                          <button
                            onClick={() => onUpdateClaimStatus(claim.id, "reject")}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] py-1 px-1.5 rounded-md cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>

                        {activeClaimIdQuery === claim.id && (
                          <div className="p-2 bg-slate-50 border rounded-lg space-y-1 mt-2">
                            <input
                              type="text"
                              value={queryText}
                              onChange={(e) => setQueryText(e.target.value)}
                              placeholder="Type reason e.g., missing USG report"
                              className="text-[10px] w-full border rounded p-1 whitespace-normal leading-normal focus:outline-hidden"
                            />
                            <button
                              onClick={() => handleAuditorQuery(claim.id)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] py-1 rounded"
                            >
                              Dispatch Query
                            </button>
                          </div>
                        )}

                        {claim.claimStatus === "Approved for Settlement" && (
                          <button
                            onClick={() => onUpdateClaimStatus(claim.id, "pay")}
                            className="w-full bg-slate-900 text-slate-100 hover:bg-slate-800 font-bold text-[10px] py-1 rounded block"
                          >
                            Settle Payment (₹)
                          </button>
                        )}
                        {claim.claimStatus === "Paid" && (
                          <span className="text-[10px] text-slate-500 font-semibold block text-center">Settled ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No PM-JAY Cashless Claims uploaded in active session directories. Setup cashless claims parameters on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Claim auditor report diagnostics */}
        {auditResult && auditedClaimId && (
          <div className="bg-slate-950 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-md space-y-6" id="ai-fraud-reporting-panel">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/10" />
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Gemini AI Specialty Claims Audit Diagnostic Report</h4>
                  <p className="text-[10px] text-slate-500">Evaluating against core NHA claims guidelines</p>
                </div>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 font-mono py-1 px-2 rounded">
                Claim Match Context: {auditedClaimId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Score visualizer */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-850 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Claim Fraud/Anomaly Index</span>
                
                <div className="relative h-28 w-28 flex items-center justify-center rounded-full border-4 border-slate-800">
                  <span className={`text-2xl font-black ${
                    auditResult.score <= 25 ? "text-green-400" : auditResult.score <= 60 ? "text-amber-400" : "text-red-500 animate-pulse"
                  }`}>
                    {auditResult.score}%
                  </span>
                </div>

                <div className="mt-3.5 space-y-1">
                  <p className={`text-xs font-bold leading-normal uppercase ${
                    auditResult.score <= 25 ? "text-green-400" : auditResult.score <= 60 ? "text-amber-400" : "text-red-500"
                  }`}>
                    {auditResult.score <= 25 ? "Sincere Claim" : auditResult.score <= 60 ? "Moderate Discrepancy" : "HIGH FRAUD SUSPICION"}
                  </p>
                  <p className="text-[10px] text-slate-500">Recommendation: <strong>{auditResult.recommendation}</strong></p>
                </div>
              </div>

              {/* Explanations and specific flags */}
              <div className="md:col-span-8 space-y-4">
                {auditResult.flags.length > 0 && (
                  <div className="space-y-1 bg-red-950/20 text-red-400 border border-red-900/40 p-3.5 rounded-lg text-xs leading-relaxed">
                    <span className="text-[10px] font-bold uppercase block tracking-wider text-red-300 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> High Risk Flags Raised:
                    </span>
                    {auditResult.flags.map((fl, idx) => (
                      <p key={idx} className="flex gap-1.5 font-medium items-start">
                        <span>•</span> {fl}
                      </p>
                    ))}
                  </div>
                )}

                <div className="bg-slate-900 px-4 py-3 border border-slate-850 rounded-lg space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Evaluation Audit Trail:</span>
                  <p className="text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-wrap">{auditResult.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        </div>
      )}
    </div>
  );
}
