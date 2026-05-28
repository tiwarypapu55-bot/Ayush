/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Fingerprint } from "lucide-react";
import Navbar from "./components/Navbar";
import { supabase, mapPatientToDb, mapDbToPatient } from "./supabaseClient";
import ReceptionistView from "./components/ReceptionistView";
import DoctorView from "./components/DoctorView";
import NurseView from "./components/NurseView";
import AyushmanMitraView from "./components/AyushmanMitraView";
import AncillaryViews from "./components/AncillaryViews";
import SuperAdminAnalytics from "./components/SuperAdminAnalytics";
import InventoryView from "./components/InventoryView";
import LoginPanel, { UserSession, PRESET_PANELISTS } from "./components/LoginPanel";
import { 
  Patient, Encounter, PmjayClaim, HospitalBed, ConsentLog, 
  HfrRegistry, HprRegistry, AbhaMaster, Department, Appointment, 
  Admission, BillingRecord, PmjayPackage, AuditLogEntry 
} from "./types";

export default function App() {
  const [activeUser, setActiveUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem("active_user");
    if (saved) {
      try {
        return JSON.parse(saved).role;
      } catch (e) {
        return "Receptionist";
      }
    }
    return "Receptionist";
  });

  const handleLogin = (user: UserSession) => {
    setActiveUser(user);
    setCurrentRole(user.role);
    localStorage.setItem("active_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("active_user");
  };

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    const matched = PRESET_PANELISTS.find(p => p.role === role);
    if (matched) {
      setActiveUser(matched);
      localStorage.setItem("active_user", JSON.stringify(matched));
    }
  };
  
  // States holding our hospital records synced with backend mock
  const [patients, setPatients] = useState<Patient[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [claims, setClaims] = useState<PmjayClaim[]>([]);
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [consents, setConsents] = useState<ConsentLog[]>([]);
  const [hfr, setHfr] = useState<HfrRegistry[]>([]);
  const [hpr, setHpr] = useState<HprRegistry[]>([]);

  // States holding extended database master tables
  const [abhaMaster, setAbhaMaster] = useState<AbhaMaster[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [pmjayPackages, setPmjayPackages] = useState<PmjayPackage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const loadData = async () => {
    try {
      const [
        pRes, eRes, cRes, bRes, cnRes, hfrRes, hprRes,
        abhaRes, deptRes, aptRes, admRes, billRes, pkgRes, auditRes
      ] = await Promise.all([
        fetch("/api/patients").then(r => r.json()),
        fetch("/api/encounters").then(r => r.json()),
        fetch("/api/claims").then(r => r.json()),
        fetch("/api/beds").then(r => r.json()),
        fetch("/api/consents").then(r => r.json()),
        fetch("/api/hfr").then(r => r.json()),
        fetch("/api/hpr").then(r => r.json()),
        fetch("/api/abha_master").then(r => r.json()),
        fetch("/api/departments").then(r => r.json()),
        fetch("/api/appointments").then(r => r.json()),
        fetch("/api/admissions").then(r => r.json()),
        fetch("/api/billing").then(r => r.json()),
        fetch("/api/pmjay_packages").then(r => r.json()),
        fetch("/api/audit_logs").then(r => r.json())
      ]);

      // Attempt to load from Supabase - merging results on the fly
      let mergedPatients: Patient[] = [...pRes];
      try {
        const { data: sPats, error: sErr } = await supabase
          .from("patients")
          .select("*")
          .order("registered_at", { ascending: false });
        
        if (sErr) {
          console.warn("Could not query 'patients' table from Supabase yet, default mock dataset will be used. Error:", sErr.message);
        } else if (sPats && sPats.length > 0) {
          const fetchedPats = sPats.map(mapDbToPatient);
          // Merge avoiding duplicates by id (UHID)
          const localIds = new Set(mergedPatients.map(p => p.id));
          fetchedPats.forEach(fp => {
            if (!localIds.has(fp.id)) {
              mergedPatients.unshift(fp); // insert supabase ones at the beginning of the list
            }
          });
          console.log(`Successfully synced and mapped ${sPats.length} patients from Supabase. Total visible: ${mergedPatients.length}`);
        }
      } catch (sbErr) {
        console.warn("Supabase query bypass error:", sbErr);
      }

      setPatients(mergedPatients);
      setEncounters(eRes);
      setClaims(cRes);
      setBeds(bRes);
      setConsents(cnRes);
      setHfr(hfrRes);
      setHpr(hprRes);
      
      // Hydrate extended master tables
      setAbhaMaster(abhaRes);
      setDepartments(deptRes);
      setAppointments(aptRes);
      setAdmissions(admRes);
      setBilling(billRes);
      setPmjayPackages(pkgRes);
      setAuditLogs(auditRes);
    } catch (err) {
      console.error("Failed to load full-stack HMS state indexes:", err);
    }
  };

  // On mount: Fetch state from Express mock API database
  useEffect(() => {
    loadData();
  }, []);

  // Sync callbacks
  const handleAddPatient = async (pat: Patient) => {
    // 1. Write to Supabase (if database schema is set up)
    try {
      const dbRow = mapPatientToDb(pat);
      const { error } = await supabase.from("patients").insert([dbRow]);
      if (error) {
        console.warn("Supabase patient insert failed - make sure you ran the SQL creation script from the database panel! Error:", error.message);
      } else {
        console.log("Patient successfully written to Supabase Cloud Table");
      }
    } catch (sErr) {
      console.error("Supabase client error:", sErr);
    }

    // 2. Also save to current backend
    try {
      const resp = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pat)
      });
      const data = await resp.json();
      setPatients(prev => {
        if (!prev.some(p => p.id === data.id)) {
          return [...prev, data];
        }
        return prev;
      });
    } catch (err) {
      console.error(err);
      // Fallback state updater
      setPatients(prev => {
        if (!prev.some(p => p.id === pat.id)) {
          return [...prev, pat];
        }
        return prev;
      });
    }
  };

  const handleScanShareRegister = async (abhaId: string, name: string) => {
    try {
      const resp = await fetch("/api/abdm/scan-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abhaId, name })
      });
      const data = await resp.json();
      if (data.success) {
        // Also write Scan & Share patients to Supabase!
        try {
          const dbRow = mapPatientToDb(data.patient);
          await supabase.from("patients").insert([dbRow]);
        } catch (sErr) {
          console.warn("Supabase skipped for ABDM Token:", sErr);
        }

        // Append patient to state if not exists
        setPatients(prev => {
          if (!prev.some(p => p.id === data.patient.id)) {
            return [...prev, data.patient];
          }
          return prev;
        });
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const handleAddEncounter = async (enc: Encounter) => {
    try {
      const resp = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enc)
      });
      const data = await resp.json();
      setEncounters(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClaim = async (claim: PmjayClaim) => {
    try {
      const resp = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claim)
      });
      const data = await resp.json();
      setClaims(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, action: 'approve' | 'query' | 'reject' | 'pay', queryText?: string) => {
    try {
      const resp = await fetch("/api/claims/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action, queryText })
      });
      const data = await resp.json();
      setClaims(prev => prev.map(c => c.id === claimId ? data : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateBed = async (bedId: string, patientId: string, patientName: string) => {
    try {
      const resp = await fetch("/api/beds/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId, patientId, patientName })
      });
      const data = await resp.json();
      setBeds(prev => prev.map(b => b.id === bedId ? data : b));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseBed = async (bedId: string) => {
    try {
      const resp = await fetch("/api/beds/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId })
      });
      const data = await resp.json();
      setBeds(prev => prev.map(b => b.id === bedId ? data : b));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispenseMedication = async (encounterId: string, medIndex: number) => {
    try {
      const resp = await fetch("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterId, medicineIndex: medIndex })
      });
      const data = await resp.json();
      setEncounters(prev => prev.map(e => e.id === encounterId ? data : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLabSubmit = async (encounterId: string, orderIndex: number, resultValue: string, criticalAlert: boolean, reportNotes: string) => {
    try {
      const resp = await fetch("/api/lab/submit-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterId, orderIndex, resultValue, criticalAlert, reportNotes })
      });
      const data = await resp.json();
      setEncounters(prev => prev.map(e => e.id === encounterId ? data : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddConsent = async (consent: ConsentLog) => {
    try {
      const resp = await fetch("/api/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consent)
      });
      const data = await resp.json();
      setConsents(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRow = async (tableName: string, data: any) => {
    try {
      const resp = await fetch("/api/admin/add-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName, rowData: data })
      });
      const res = await resp.json();
      if (res.success) {
        switch (tableName) {
          case "patients":
            setPatients(prev => [...prev, res.record]);
            break;
          case "abha_master":
            setAbhaMaster(prev => [...prev, res.record]);
            break;
          case "doctors":
            setHpr(prev => [...prev, res.record]);
            break;
          case "departments":
            setDepartments(prev => [...prev, res.record]);
            break;
          case "appointments":
            setAppointments(prev => [...prev, res.record]);
            break;
          case "admissions":
            setAdmissions(prev => [...prev, res.record]);
            break;
          case "billing":
            setBilling(prev => [...prev, res.record]);
            break;
          case "claims":
            setClaims(prev => [...prev, res.record]);
            break;
          case "pmjay_packages":
            setPmjayPackages(prev => [...prev, res.record]);
            break;
          case "consent_log":
            setConsents(prev => [...prev, res.record]);
            break;
          case "audit_log":
            setAuditLogs(prev => [...prev, res.record]);
            break;
          default:
            break;
        }
      }
    } catch (err) {
      console.error("Failed to insert row directly to federal schema on endpoint:", err);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      await fetch("/api/admin/audit-verify", { method: "POST" });
      const auditRes = await fetch("/api/audit_logs").then(r => r.json());
      setAuditLogs(auditRes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-image1-teal flex flex-col font-sans text-slate-900">
      {/* Prime Agency Govt Banner Header */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        syncStatus="connected"
        hfrCounts={hfr.length}
        hprCounts={hpr.length}
      />

      {!activeUser ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20 flex items-center justify-center">
          <LoginPanel onLoginSuccess={handleLogin} />
        </main>
      ) : (
        <>
          {/* Active Session Dashboard Officer Bar */}
          <div className="max-w-7xl w-full mx-auto px-4 md:px-6 mt-4">
            <div className="bg-white/95 border border-indigo-200/40 p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 font-sans select-none animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 bg-indigo-50 text-2xl rounded-xl flex items-center justify-center border border-indigo-200 shadow-2xs">
                  {activeUser.avatar}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{activeUser.name}</span>
                    <span className="text-[9px] font-bold bg-indigo-750 text-white px-2 py-0.5 rounded-full uppercase">
                      {activeUser.role === "AyushmanMitra" ? "Ayushman Mitra" : activeUser.role} Panel
                    </span>
                    <span className="text-[9px] font-bold font-mono text-emerald-800 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      ID: {activeUser.badgeId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {activeUser.designation} &bull; <strong className="text-indigo-950 font-mono text-[10px] uppercase bg-indigo-50/70 px-1.5 py-0.5 rounded">{activeUser.department}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <span className="text-[9.5px] font-extrabold text-slate-400 block uppercase tracking-tight">Access Authority Scope</span>
                  <span className="text-[10.5px] font-bold text-teal-850 font-mono">{activeUser.authorizedScope}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-95"
                >
                  <Fingerprint className="h-4 w-4 text-rose-600 animate-pulse" />
                  <span>Lock Terminal</span>
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
            
            {/* VIEW ROUTER FOR ROLE DESKS */}
            {currentRole === "Receptionist" && (
              <ReceptionistView
                patients={patients}
                abhaMaster={abhaMaster}
                encounters={encounters}
                onAddPatient={handleAddPatient}
                onScanShareRegister={handleScanShareRegister}
                onAddAbhaMaster={(record) => handleAddRow("abha_master", record)}
                onRefreshData={loadData}
              />
            )}

            {currentRole === "Doctor" && (
              <DoctorView
                patients={patients}
                encounters={encounters}
                onAddEncounter={handleAddEncounter}
                hprVerifiedDoctors={hpr.filter(u => u.role === "Doctor")}
              />
            )}

            {currentRole === "Nurse" && (
              <NurseView
                patients={patients}
                beds={beds}
                encounters={encounters}
                onAllocateBed={handleAllocateBed}
                onReleaseBed={handleReleaseBed}
                onDispenseMedication={handleDispenseMedication}
              />
            )}

            {currentRole === "AyushmanMitra" && (
              <AyushmanMitraView
                patients={patients}
                claims={claims}
                encounters={encounters}
                abhaMaster={abhaMaster}
                onAddClaim={handleAddClaim}
                onUpdateClaimStatus={handleUpdateClaimStatus}
                onRefreshData={loadData}
              />
            )}

            {(currentRole === "LabStaff" || currentRole === "Pharmacy" || currentRole === "Patient" || currentRole === "Billing") && (
              <AncillaryViews
                currentRole={currentRole as any}
                patients={patients}
                encounters={encounters}
                beds={beds}
                consents={consents}
                onLabSubmit={handleLabSubmit}
                onPharmacyDispense={handleDispenseMedication}
                onAddConsent={handleAddConsent}
                doctors={hpr}
              />
            )}

            {currentRole === "SuperAdmin" && (
              <SuperAdminAnalytics
                patients={patients}
                claims={claims}
                encounters={encounters}
                beds={beds}
                abhaMaster={abhaMaster}
                doctors={hpr}
                departments={departments}
                appointments={appointments}
                admissions={admissions}
                billing={billing}
                pmjayPackages={pmjayPackages}
                consentLogs={consents}
                auditLogs={auditLogs}
                onAddRow={handleAddRow}
                onVerifyIntegrity={handleVerifyIntegrity}
              />
            )}

            {currentRole === "Inventory" && (
              <InventoryView />
            )}

          </main>
        </>
      )}

      {/* Persistent National NHA Footer info block */}
      <footer className="bg-white border-t border-slate-200 py-4.5 text-center text-xs text-slate-500 font-mono mt-auto">
        <p className="font-semibold text-slate-600">
          🇮🇳 National Health Authority • ABDM Ecosystem Sandbox Desk
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Complies completely with HL7 FHIR standard v4.0.1, ICD-10 clinical diagnosis guidelines, and CDSCO Schedule protocols.
        </p>
      </footer>
    </div>
  );
}
