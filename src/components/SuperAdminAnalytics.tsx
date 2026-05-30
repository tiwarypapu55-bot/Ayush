import React, { useState, useEffect } from "react";
import { 
  Users, ShieldCheck, Database, CalendarCheck, TrendingUp, AlertTriangle, 
  Fingerprint, Key, RefreshCw, Layers, ShieldAlert, Cpu, Heart, CheckCircle2,
  Lock, Globe, FileSpreadsheet, Play, Activity, CheckSquare, Sparkles, Send,
  Sliders, Server, Zap, Search, Eye, Clipboard, BarChart2, Shield, HeartPulse,
  HardDrive, Terminal
} from "lucide-react";
import { 
  Patient, Encounter, PmjayClaim, HospitalBed, 
  AbhaMaster, HprRegistry, Department, Appointment, 
  Admission, BillingRecord, PmjayPackage, ConsentLog, 
  AuditLogEntry 
} from "../types";
import SuperAdminDatabaseExplorer from "./SuperAdminDatabaseExplorer";

interface SuperAdminProps {
  patients: Patient[];
  claims: PmjayClaim[];
  encounters: Encounter[];
  beds: HospitalBed[];
  abhaMaster: AbhaMaster[];
  doctors: HprRegistry[];
  departments: Department[];
  appointments: Appointment[];
  admissions: Admission[];
  billing: BillingRecord[];
  pmjayPackages: PmjayPackage[];
  consentLogs: ConsentLog[];
  auditLogs: AuditLogEntry[];
  onAddRow: (tableName: string, data: any) => void;
  onVerifyIntegrity: () => void;
}

interface ConsentLogEntry {
  id: string;
  patientName: string;
  type: "One-time" | "Time-bound" | "Department-specific" | "Doctor-specific" | "Emergency-override";
  doctor: string;
  expiresAt: string;
  sensitiveMasked: boolean;
  geofenced: boolean;
  status: "Active" | "Revoked" | "Expired";
}

export default function SuperAdminAnalytics({ 
  patients, 
  claims, 
  encounters, 
  beds,
  abhaMaster,
  doctors,
  departments,
  appointments,
  admissions,
  billing,
  pmjayPackages,
  consentLogs,
  auditLogs,
  onAddRow,
  onVerifyIntegrity
}: SuperAdminProps) {
  // Tabs Switcher
  const [activeSubTab, setActiveSubTab] = useState<
    "executive" | "biometrics" | "govt" | "cyber" | "governance" | "interoperability" | "clinical_ai" | "master_tables" | "fraud_suite"
  >("executive");

  // Vitals simulation states
  const [heartRate, setHeartRate] = useState(72);
  const [spo2Val, setSpo2Val] = useState(98);
  const [fpStatus, setFpStatus] = useState("Idle");
  const [irisStatus, setIrisStatus] = useState("Ready");
  const [faceStatus, setFaceStatus] = useState("Not Synced");
  const [lastScanHash, setLastScanHash] = useState("");
  const [connectedFP, setConnectedFP] = useState(true);
  const [connectedIris, setConnectedIris] = useState(true);
  const [connectedFace, setConnectedFace] = useState(true);

  // Security Toggles & Cyber SOC
  const [aesEnabled, setAesEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [ransomwareShield, setRansomwareShield] = useState(true);
  const [cyberLogs, setCyberLogs] = useState<string[]>([
    "[AES-256] Automatic cell-level EMR block storage encrypted.",
    "[RBAC] Access verified for role: Reception Panel on /api/patients",
    "[DPDP] Patient UHID-108291 explicitly consented to Longitudinal History share.",
    "[HIPAA] Transmission integrity hash verified on outgoing FHIR bundle.",
    "[ABDM Policy] Consent Manager CNS-4902 mapped under active State Node.",
    "[SOC Monitor] No malicious inbound connections flagged from non-approved IP blocks."
  ]);
  const [drProgress, setDrProgress] = useState(-1);
  const [clusterReplicas, setClusterReplicas] = useState(3);
  const [failoverStatus, setFailoverStatus] = useState("Optimal (Active Primary Zone A)");

  // Government Sandbox State
  const [executingApiId, setExecutingApiId] = useState<string | null>(null);
  const [apiResponseJson, setApiResponseJson] = useState<any>(null);
  const [abhaCreationStep, setAbhaCreationStep] = useState<"form" | "otp" | "success">("form");
  const [abhaInputName, setAbhaInputName] = useState("Ramesh Chandra Kumar");
  const [abhaInputAadhaar, setAbhaInputAadhaar] = useState("4493-2010-8849");
  const [abhaOtp, setAbhaOtp] = useState("123456");
  const [abhaGenerated, setAbhaGenerated] = useState<any>(null);
  const [sandboxTestsState, setSandboxTestsState] = useState<"idle" | "running" | "completed">("idle");
  const [sandboxScore, setSandboxScore] = useState(99.2);

  // Dynamic Consent States
  const [selectedConsentPatient, setSelectedConsentPatient] = useState(patients[0]?.name || "Priyanka Devi Patel");
  const [selectedConsentType, setSelectedConsentType] = useState<"One-time" | "Time-bound" | "Department-specific" | "Doctor-specific" | "Emergency-override">("Time-bound");
  const [assignedDoctor, setAssignedDoctor] = useState("Dr. Arvind Swaminathan");
  const [sensitiveMaskingCheck, setSensitiveMaskingCheck] = useState(true);
  const [geofencingCheck, setGeofencingCheck] = useState(false);
  const [consentValidityDays, setConsentValidityDays] = useState(30);
  const [localConsentLogs, setLocalConsentLogs] = useState<ConsentLogEntry[]>([
    {
      id: "CNS-1029",
      patientName: "Priyanka Devi Patel",
      type: "Time-bound",
      doctor: "Dr. Arvind Swaminathan",
      expiresAt: "2026-06-24",
      sensitiveMasked: true,
      geofenced: false,
      status: "Active"
    },
    {
      id: "CNS-1033",
      patientName: "Ramesh Chandra Kumar",
      type: "Doctor-specific",
      doctor: "Dr. Sanjay Mukherji",
      expiresAt: "2026-05-31",
      sensitiveMasked: true,
      geofenced: true,
      status: "Active"
    },
    {
      id: "CNS-0982",
      patientName: "Hariprasad Sharma",
      type: "One-time",
      doctor: "Dr. Arvind Swaminathan",
      expiresAt: "2026-05-25",
      sensitiveMasked: false,
      geofenced: false,
      status: "Expired"
    }
  ]);
  const [consentOverrideLog, setConsentOverrideLog] = useState<string[]>([]);

  // Interoperability & Terminology Mappings State
  const [fhirSchemaSelected, setFhirSchemaSelected] = useState<"Patient" | "Observation" | "DiagnosticReport">("Patient");
  const [fhirInputJson, setFhirInputJson] = useState("");
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [terminologySearch, setTerminologySearch] = useState("");
  const [terminologyResults, setTerminologyResults] = useState<any[]>([]);
  const [mpiMerged, setMpiMerged] = useState(false);

  // Clinical AI & Alerts States
  const [aiSelectedPatientId, setAiSelectedPatientId] = useState(patients[0]?.id || "UHID-108291");
  const [sepsisScore, setSepsisScore] = useState<number | null>(null);
  const [drugInteractionA, setDrugInteractionA] = useState("Metformin");
  const [drugInteractionB, setDrugInteractionB] = useState("Verapamil");
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [pendingSchedules, setPendingSchedules] = useState([
    { id: 1, type: "Appointment Recall Reminder", patient: "Priyanka Patel", sentVia: "WhatsApp", status: "Sent" },
    { id: 2, type: "Telemetry Alert Notification", patient: "ICU Bed Bed-04", sentVia: "SMS Push", status: "Sent" },
    { id: 3, type: "Claim Disbursement Sync Alert", patient: "NHA central Gateway", sentVia: "Secure Callback", status: "Pending" }
  ]);

  // MANDATORY FRAUD & GOVERNANCE COMPONENT STATES
  const [activeFraudTab, setActiveFraudTab] = useState<
    "overview" | "rules" | "ai_anomaly" | "clinical_val" | "package_gov" | "implants" | "audit_cert"
  >("overview");
  const [fraudAuditRunCount, setFraudAuditRunCount] = useState(0);
  const [isAnalyzingFraud, setIsAnalyzingFraud] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [selectedRiskClaimId, setSelectedRiskClaimId] = useState("");
  const [overallSystemRiskScore, setOverallSystemRiskScore] = useState(38); // starts low/moderate

  const [fraudRules, setFraudRules] = useState([
    { id: "FR-01", name: "High-Frequency Consultation Cap", desc: "Flags doctors logging > 40 consulting events per day.", limit: 40, unit: "encounters", status: "Active", count: 2 },
    { id: "FR-02", name: "Post-Discharge Procedure Buffer", desc: "Flags surgical procedures billed within 3 days post-discharge.", limit: 3, unit: "days", status: "Active", count: 1 },
    { id: "FR-03", name: "Mismatched Demographic Admission", desc: "Rejects claims with gender/age-mismatched clinical diagnosis rules.", limit: 0, unit: "mismatches", status: "Active", count: 1 },
    { id: "FR-04", name: "Double-Billing Transaction Fingerprint", desc: "Identifies duplicate item descriptions inside a 15-minute window for a single UHID.", limit: 15, unit: "minutes", status: "Active", count: 2 },
    { id: "FR-05", name: "Implant CDSCO Catalog Discrepancy", desc: "Blocks payments utilizing implants not authenticated with central warehouses.", limit: 0, unit: "violations", status: "Active", count: 1 },
    { id: "FR-06", name: "Short-Stay Surgical Claim Overlay", desc: "Flags major inpatient packages where real bed stay is < 12 hours.", limit: 12, unit: "hours", status: "Warning", count: 0 },
    { id: "FR-07", name: "Antibiotic Over-prescription threshold", desc: "Tracks anti-infectives exceeding 300% standard CDSCO guidelines.", limit: 300, unit: "% threshold", status: "Warning", count: 4 }
  ]);

  const [implantLifecycleList, setImplantLifecycleList] = useState([
    { id: "IMP-STENT-884029", name: "Coronary Drug-Eluting Stent (Zotarolimus)", cdscoReg: "CDSCO/MD/2024-A9", manufacturer: "Medtronic India Ltd", batch: "B-STENT-902", uhid: "UHID-108291", patientName: "Ramesh Chandra Kumar", status: "In-Situ (Active)", implantedAt: "2026-05-15", cost: 23600, certified: true },
    { id: "IMP-LENS-390291", name: "Hydrophobic Foldable Intraocular Lens", cdscoReg: "CDSCO/MD/2025-C1", manufacturer: "Alcon India", batch: "B-IOL-404", uhid: "UHID-108295", patientName: "Sunita Devi", status: "In-Situ (Active)", implantedAt: "2026-05-20", cost: 8500, certified: true },
    { id: "IMP-HIP-993021", name: "Titanium Acetabular Cup Total Hip System", cdscoReg: "CDSCO/MD/2023-F2", manufacturer: "Zimmer Biomet", batch: "B-HIP-501", uhid: "UHID-108304", patientName: "Gurpreet Singh", status: "In-Situ (Active)", implantedAt: "2026-05-24", cost: 67000, certified: true },
    { id: "IMP-PACER-440212", name: "Dual Chamber IPG Pacemaker System", cdscoReg: "CDSCO/MD/2022-X9", manufacturer: "Abbott Laboratories", batch: "B-PACER-022", uhid: "UHID-108311", patientName: "Dinesh Chandra", status: "Suspected Altered Batch", implantedAt: "2026-05-28", cost: 91000, certified: false }
  ]);

  const [aiAnomalyLogsState, setAiAnomalyLogsState] = useState([
    { time: "2026-05-29 11:00:21Z", category: "Dynamic Cluster Alert", msg: "Outlier detected: Clinic CLN-402 submitting eye surgeries for outer-state patients utilizing identical IP subnet block", isolationScore: 0.96 },
    { time: "2026-05-29 12:35:10Z", category: "Semantic EMR Mismatch", msg: "ICD-10 clinical diagnosis code J18 (Pneumonia) matched with expensive Cardiac Catheterization pack. High lexical divergence in notes.", isolationScore: 0.89 },
    { time: "2026-05-29 14:45:00Z", category: "Double Billing Signature", msg: "Attending Dr. Roy logged duplicate consultation consultations for UHID-108291 within 15 minutes across two desks.", isolationScore: 0.94 }
  ]);

  const [clinicalViolationsList, setClinicalViolationsList] = useState([
    { id: "CV-01", uhid: "UHID-108311", patient: "Dinesh Chandra", mismatch: "Pediatric PM-JAY vaccination bonus claimed for a senior citizen (Age 68).", severity: "High Risk", score: 88 },
    { id: "CV-02", uhid: "UHID-108295", patient: "Sunita Devi", mismatch: "Intraocular lens implant logged for a primary diagnosis of Cholelithiasis (Gallbladder Stone).", severity: "Critical Fraud", score: 96 },
    { id: "CV-03", uhid: "UHID-108304", patient: "Gurpreet Singh", mismatch: "Doctor billed a bilateral hip replacement procedure, but EMR x-ray attachment refers only to knee joint arthroscopy.", severity: "Medium Risk", score: 62 }
  ]);

  const [governedPackages, setGovernedPackages] = useState([
    { code: "SG-05", name: "Laparoscopic Cholecystectomy", capCost: 22000, maxDays: 3, workflowRequired: "Pre-Auth + Histopathology Record" },
    { code: "MC-01", name: "General Medicine - Pneumonia Management", capCost: 15000, maxDays: 5, workflowRequired: "Clinical Notes Upload" },
    { code: "SG-02", name: "Total Hip Arthroplasty (Unilateral)", capCost: 75000, maxDays: 7, workflowRequired: "Pre-Auth + CDSCO Implant Barcode Trace" },
    { code: "MC-02", name: "Critical Care - ICU Ventilation Management", capCost: 11000, maxDays: 14, workflowRequired: "Arterial Blood Gas Logs Attached" }
  ]);

  // Implant verification sandbox tool states
  const [implantSearchId, setImplantSearchId] = useState("");
  const [implantSearchResult, setImplantSearchResult] = useState<any | null>(null);

  // New Implant creation inputs for Traceability Log
  const [newImplantId, setNewImplantId] = useState("");
  const [newImplantName, setNewImplantName] = useState("");
  const [newImplantCdsco, setNewImplantCdsco] = useState("");
  const [newImplantManufacturer, setNewImplantManufacturer] = useState("");
  const [newImplantBatch, setNewImplantBatch] = useState("");
  const [newImplantUhid, setNewImplantUhid] = useState("");
  const [newImplantCost, setNewImplantCost] = useState(15000);

  // --- FRAUD CONTROL DASHBOARD STATES ---
  const [fraudSubDashboard, setFraudSubDashboard] = useState<
    "claims_audit" | "duplicate_admissions" | "excessive_diagnostics" | "implant_anomalies" | "doctor_risk_index" | "dept_heatmap"
  >("claims_audit");
  const [claimDetailsModal, setClaimDetailsModal] = useState<any | null>(null);
  
  const [localClaimsState, setLocalClaimsState] = useState<any[]>([]);

  const [duplicateAdmissionsList, setDuplicateAdmissionsList] = useState([
    {
      id: "DPA-101",
      patientId: "UHID-108291",
      patientName: "Ramesh Chandra Kumar",
      admission1: { id: "ADM-6502", ward: "Cardiology Semi-Private", doc: "Dr. Arvind Swaminathan", host: "Apex Health Central", period: "May 12 - May 17, 2026" },
      admission2: { id: "ADM-9014", ward: "General Ward Bed-08", doc: "Dr. Sanjay Mukherji", host: "Apollo Metro Sandbox Hospital", period: "May 14 - May 16, 2026" },
      overlappingDays: 2,
      pkgClaim: "CLM-884029",
      riskLevel: "CRITICAL",
      status: "Investigating"
    },
    {
      id: "DPA-102",
      patientId: "UHID-108295",
      patientName: "Sunita Devi",
      admission1: { id: "ADM-3204", ward: "Gastroenterology Private", doc: "Dr. Rakesh Roy", host: "Apex Health Central", period: "May 20 - May 22, 2026" },
      admission2: { id: "ADM-4412", ward: "Ophthalmology ICU", doc: "Dr. Sanjay Mukherji", host: "Apex Health Central", period: "May 21 - May 23, 2026" },
      overlappingDays: 1,
      pkgClaim: "CLM-390291",
      riskLevel: "HIGH RISK",
      status: "Under Review"
    },
    {
      id: "DPA-103",
      patientId: "UHID-108304",
      patientName: "Gurpreet Singh",
      admission1: { id: "ADM-8802", ward: "Orthopedics General Ward", doc: "Dr. Priyanka Deshmukh", host: "Apex Health Central", period: "May 24 - May 28, 2026" },
      admission2: { id: "ADM-8898", ward: "Physiotherapy Outpost", doc: "Dr. Sanjay Mukherji", host: "State District Polyclinic", period: "May 24 - May 25, 2026" },
      overlappingDays: 2,
      pkgClaim: "CLM-993021",
      riskLevel: "MEDIUM RISK",
      status: "Resolved"
    }
  ]);

  const [excessiveDiagnosticsList, setExcessiveDiagnosticsList] = useState([
    {
      id: "EXD-201",
      patientId: "UHID-108304",
      patientName: "Gurpreet Singh",
      testName: "Ultrasound Whole Abdomen (LOINC 45030-2)",
      department: "Gastroenterology",
      runCount: 3,
      timeWindow: "24 Hours (May 23 - May 24)",
      costWaste: 12500,
      riskScore: 82,
      justified: false,
      status: "Flagged"
    },
    {
      id: "EXD-202",
      patientId: "UHID-108311",
      patientName: "Dinesh Chandra",
      testName: "Cardiac Troponin I Assay (LOINC 10839-1)",
      department: "Cardiology",
      runCount: 4,
      timeWindow: "12 Hours (May 28)",
      costWaste: 6400,
      riskScore: 71,
      justified: true,
      status: "Approved-Justified"
    },
    {
      id: "EXD-203",
      patientId: "UHID-108295",
      patientName: "Sunita Devi",
      testName: "MRI Scan Lumbar Spine (Contrast) (LOINC 24902-1)",
      department: "Radiology / Neurology",
      runCount: 2,
      timeWindow: "48 Hours (May 21 - May 23)",
      costWaste: 38000,
      riskScore: 94,
      justified: false,
      status: "Flagged"
    }
  ]);

  const [doctorRiskList, setDoctorRiskList] = useState([
    {
      id: "DOC-901",
      name: "Dr. Sanjay Mukherji",
      abdmNumber: "HPR-992019-A",
      specialty: "General Surgery",
      dailyVisits: 44,
      riskClaimPercentage: 42,
      avgRiskScore: 74,
      violationsCount: 3,
      status: "Watchlist Alert",
      reason: "Bypassed 3 surgical buffer timeline limits & high consulting logs."
    },
    {
      id: "DOC-902",
      name: "Dr. Arvind Swaminathan",
      abdmNumber: "HPR-440211-X",
      specialty: "Cardiology",
      dailyVisits: 18,
      riskClaimPercentage: 4,
      avgRiskScore: 12,
      violationsCount: 0,
      status: "Unblemished Standard",
      reason: "Complete photographic biometric authentication matching all procedures."
    },
    {
      id: "DOC-903",
      name: "Dr. Rakesh Roy",
      abdmNumber: "HPR-112094-Z",
      specialty: "Ophthalmology",
      dailyVisits: 35,
      riskClaimPercentage: 22,
      avgRiskScore: 58,
      violationsCount: 1,
      status: "Minor Discrepancy Warnings",
      reason: "Two unverified implant serology codes logged temporarily."
    },
    {
      id: "DOC-904",
      name: "Dr. Priyanka Deshmukh",
      abdmNumber: "HPR-304921-W",
      specialty: "Pediatrics",
      dailyVisits: 21,
      riskClaimPercentage: 0,
      avgRiskScore: 9,
      violationsCount: 0,
      status: "Certified Compliant",
      reason: "Zero demographic discrepancies or unvalidated billing codes logged."
    }
  ]);

  const [departmentHeatmapList, setDepartmentHeatmapList] = useState([
    { code: "CARD", name: "Cardiology Unit", avgRiskScore: 48, claimCount: 14, billedAmount: 345000, colorClass: "bg-amber-100 border-amber-300 text-amber-900 shadow-xs", label: "MODERATE WATCH" },
    { code: "OPHT", name: "Ophthalmology", avgRiskScore: 82, claimCount: 8, billedAmount: 98000, colorClass: "bg-rose-150 border-rose-400 text-rose-950 shadow-xs", label: "CRITICAL BREACH" },
    { code: "ORTH", name: "Orthopedic Surgery", avgRiskScore: 54, claimCount: 11, billedAmount: 512000, colorClass: "bg-amber-200 border-amber-400 text-amber-950 shadow-xs", label: "HIGH RISK" },
    { code: "GSU", name: "General Medicine / Surgery", avgRiskScore: 68, claimCount: 19, billedAmount: 410000, colorClass: "bg-orange-100 border-orange-350 text-orange-950", label: "ELEVATED CONCURRENCE" },
    { code: "PED", name: "Pediatrics & Nursery", avgRiskScore: 15, claimCount: 22, billedAmount: 180000, colorClass: "bg-emerald-50 border-emerald-250 text-emerald-950", label: "COMPLIANT SAFE" },
    { code: "ICU", name: "Critical Care / ICU", avgRiskScore: 36, claimCount: 12, billedAmount: 670000, colorClass: "bg-slate-100 border-slate-350 text-slate-900", label: "SURVEILLANCE" }
  ]);

  // Synchronize local claims list state with incoming claims prop
  useEffect(() => {
    if (claims && claims.length > 0 && localClaimsState.length === 0) {
      const initial = claims.map((cl, index) => {
        let score = 15;
        let reasons = ["Patient eligibility checked OK"];
        let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        if (cl.packageCost > 60000) { 
          score = 78; 
          reasons = ["High value surgical package cost", "Central bank transfer threshold trigger"]; 
          severity = "HIGH";
        }
        if (cl.preAuthStatus === "Queried") { 
          score = 55; 
          reasons = ["Hospital requested budget modifications", "Incomplete photographic file attachment"]; 
          severity = "MEDIUM";
        }
        if (cl.id.includes("6") || cl.patientId.includes("D") || cl.patientId.includes("11")) { 
          score = 91; 
          reasons = ["CDSCO Implant serial mismatch warning", "Uncertified cardiac stent model identifier"]; 
          severity = "HIGH";
        }
        if (cl.id.includes("1002") || cl.patientId.includes("108311")) {
          score = 95;
          reasons = ["Senior citizen (Age 68) billed for Pediatric immunization bonus", "Aadhaar validation warning"];
          severity = "HIGH";
        }
        return {
          ...cl,
          riskScore: score,
          riskReasons: reasons,
          riskSeverity: severity,
          auditDecision: "Pending", // Pending, Approved, Flagged, Under-Audit
          notes: ""
        };
      });
      setLocalClaimsState(initial);
    }
  }, [claims]);
  // --- END OF FRAUD DASHBOARD STATES ---

  // Compliance Cert Inputs
  const [complianceInspectorName, setComplianceInspectorName] = useState("S. K. Swaminathan (Audit Director)");
  const [complianceNotes, setComplianceNotes] = useState("All 7 fraud guidelines scanned against live schemas. CDSCO implant databases and PM-JAY package costs are 100% compliant.");
  const [complianceSaved, setComplianceSaved] = useState(false);

  // General executive info
  const occupiedBedsCount = beds.filter(b => b.status === "Occupied").length;
  const occupancyPercentage = beds.length > 0 ? Math.round((occupiedBedsCount / beds.length) * 100) : 0;
  const totalClaimsCost = claims.reduce((acc, current) => acc + current.packageCost, 0);
  const pmjayApprovedCount = claims.filter(c => c.preAuthStatus === "Approved").length;
  const pmjayRejectedCount = claims.filter(c => c.preAuthStatus === "Rejected").length;
  const pmjayQueriedCount = claims.filter(c => c.preAuthStatus === "Queried" || c.claimStatus === "Queried").length;
  const averageConsultationsPerEncounter = encounters.length > 0 ? (encounters.length / patients.length).toFixed(1) : 0;

  // Real-time telemtry oscillating cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.floor(68 + Math.random() * 8));
      setSpo2Val(prev => Math.floor(97 + Math.random() * 3));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Sync FHIR Template selections
  useEffect(() => {
    let template = "";
    if (fhirSchemaSelected === "Patient") {
      template = `{
  "resourceType": "Patient",
  "id": "108291",
  "meta": {
    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
  },
  "identifier": [
    {
      "system": "https://ndhm.gov.in/id/abha-number",
      "value": "88-1092-3491-0022"
    }
  ],
  "name": [
    {
      "text": "Ramesh Chandra Kumar"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+919988776655"
    }
  ],
  "gender": "male",
  "birthDate": "1968-08-15"
}`;
    } else if (fhirSchemaSelected === "Observation") {
      template = `{
  "resourceType": "Observation",
  "id": "obs-oxygen-9921",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "2708-6",
        "display": "Oxygen saturation in Arterial blood"
      }
    ]
  },
  "subject": {
    "reference": "Patient/108291"
  },
  "valueQuantity": {
    "value": 98,
    "unit": "%",
    "system": "http://unitsofmeasure.org",
    "code": "%"
  }
}`;
    } else if (fhirSchemaSelected === "DiagnosticReport") {
      template = `{
  "resourceType": "DiagnosticReport",
  "id": "report-993",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "24331-1",
        "display": "Lipid panel - Serum or Plasma"
      }
    ]
  },
  "subject": {
    "reference": "Patient/108291"
  },
  "conclusion": "Borderline total cholesterol of 205 mg/dL. Recommending low lipid diet."
}`;
    }
    setFhirInputJson(template);
  }, [fhirSchemaSelected]);

  // Execute FHIR validation
  const handleFhirValidation = () => {
    try {
      const parsed = JSON.parse(fhirInputJson);
      if (!parsed.resourceType) {
        setValidationResult("❌ ERROR: Missing required 'resourceType' parameter on raw schema.");
        return;
      }
      setValidationResult(`✅ FHIR R4 SCHEMA VALIDATED: Interoperable NRCES compliance level 100%. Structure is a valid '${parsed.resourceType}' mapping.`);
    } catch (e: any) {
      setValidationResult(`❌ PARSING FAULT: Invalid JSON syntax. ${e.message}`);
    }
  };

  // Terminology search engine simulation
  const handleTerminologySearch = (val: string) => {
    setTerminologySearch(val);
    if (!val) {
      setTerminologyResults([]);
      return;
    }
    const query = val.toLowerCase();
    const mockData = [
      { code: "E11.9", system: "ICD-10", display: "Type 2 diabetes mellitus without complications" },
      { code: "I10", system: "ICD-10", display: "Essential (primary) hypertension" },
      { code: "J45.909", system: "ICD-10", display: "Unspecified asthma, uncomplicated" },
      { code: "44054006", system: "SNOMED-CT", display: "Type 2 diabetes mellitus (disorder)" },
      { code: "38341003", system: "SNOMED-CT", display: "Hypertensive disorder, systemic arterial (disorder)" },
      { code: "254153009", system: "SNOMED-CT", display: "Bacterial sepsis of newborn" },
      { code: "883-9", system: "LOINC", display: "ABO group [Type] in Blood" },
      { code: "24331-1", system: "LOINC", display: "Lipid 1996 panel - Serum or Plasma" },
      { code: "80351-4", system: "DICOM-MR", display: "Magnetic Resonance Imaging of Brain" }
    ];
    const filtered = mockData.filter(
      item => item.code.toLowerCase().includes(query) || item.display.toLowerCase().includes(query)
    );
    setTerminologyResults(filtered);
  };

  // AI-assisted early warning scoring sepsis predictor
  const handlePredictSepsis = (patId: string) => {
    const selectedPat = patients.find(p => p.id === patId);
    if (selectedPat) {
      const baselineHr = 72;
      const baselineSpo2 = 98;
      // Synthesize risk scores
      let riskVal = 4;
      if (selectedPat.name.includes("Priyanka")) {
        riskVal = 85; // Simulated high alert
      } else if (selectedPat.gender === "Female") {
        riskVal = 32;
      } else {
        riskVal = 14;
      }
      setSepsisScore(riskVal);
      setCyberLogs(prev => [
        `[CLINICAL AI] Predicted MEWS score of ${riskVal}% for patient ${selectedPat.name} (UHID ${patId}). Warning levels assessed.`,
        ...prev
      ]);
    }
  };

  // Multi-Drug interaction assessment
  const handleCalculateInteraction = () => {
    const itemA = drugInteractionA.toLowerCase();
    const itemB = drugInteractionB.toLowerCase();
    
    if (
      (itemA.includes("metformin") && itemB.includes("contrast")) || 
      (itemA.includes("contrast") && itemB.includes("metformin"))
    ) {
      setInteractionResult({
        severity: "CRITICAL SYNERGY",
        score: "HIGH ALERT (92%)",
        desc: "Severe risk of lactic acidosis. Metformin must be withheld for 48 hours following iodinated contrast media diagnostic scans.",
        system: "SNOMED-CT / LOINC Interoperability cross-match validated"
      });
    } else if (
      (itemA.includes("nitrate") || itemB.includes("nitrate")) &&
      (itemA.includes("sildenafil") || itemB.includes("sildenafil"))
    ) {
      setInteractionResult({
        severity: "FATAL CONTRAINDICATION",
        score: "MAX ALERT (100%)",
        desc: "Co-administration triggers profound systemic vasodilation causing absolute life-threatening refractory hypotension.",
        system: "ICD-10 clinical pathway restriction rule loaded"
      });
    } else if (
      ((itemA.includes("aspirin") || itemA.includes("clopidogrel")) && (itemB.includes("warfarin") || itemB.includes("heparin") || itemB.includes("apixaban"))) ||
      ((itemB.includes("aspirin") || itemB.includes("clopidogrel")) && (itemA.includes("warfarin") || itemA.includes("heparin") || itemA.includes("apixaban")))
    ) {
      setInteractionResult({
        severity: "HIGH BLEED RISK ALERT",
        score: "CRITICAL DANGER (88%)",
        desc: "Severe synergic combination of antiplatelet and anticoagulant agents. Extremely high danger of gastrointestinal bleeding or systemic hemorrhage. Requires regular PT-INR monitoring.",
        system: "CDSCO Pharmacology Registry warning"
      });
    } else if (
      ((itemA.includes("lisinopril") || itemA.includes("enalapril")) && itemB.includes("spironolactone")) ||
      ((itemB.includes("lisinopril") || itemB.includes("enalapril")) && itemA.includes("spironolactone"))
    ) {
      setInteractionResult({
        severity: "HYPERKALEMIA RISK",
        score: "MODERATE ALERT (75%)",
        desc: "Co-administration of aldosterone antagonist with ACE inhibitors causes severe serum potassium retention. Routine electrolyte levels audits recommended.",
        system: "WHO Therapeutics Formulary Guideline"
      });
    } else {
      setInteractionResult({
        severity: "STANDARD SAFE MATCH",
        score: "LOW ALERT (5%)",
        desc: "No significant adverse synergic interaction patterns detected on NDHM Health Data Dictionary.",
        system: "NDHM Dictionary Verified"
      });
    }
  };

  // Biometrics Scan simulators
  const triggerFingerprintScan = () => {
    setFpStatus("Scanning Bio-Metric...");
    setTimeout(() => {
      const demoHash = "SHA255:8c3a9e10ff42a3cf" + Math.floor(1000 + Math.random() * 9000);
      setLastScanHash(demoHash);
      setFpStatus("Scan Successful");
      setCyberLogs(prev => [
        `[AUDIT] Fingerprint matches patient. Bio-hash generated: ${demoHash} via Mantra USB Reader.`,
        ...prev
      ]);
    }, 1200);
  };

  const triggerIrisScan = () => {
    setIrisStatus("Measuring Iris Dimensions...");
    setTimeout(() => {
      setIrisStatus("IRIS_ISO_19794_COMPLIANT Match Verified");
      setCyberLogs(prev => [
        "[AUDIT] ISO-19794-compliant Iris topography successfully matched. National Node Security token dispatch complete.",
        ...prev
      ]);
    }, 1500);
  };

  const triggerFaceTemplate = () => {
    setFaceStatus("Capturing ABDM FaceRD parameters...");
    setTimeout(() => {
      setFaceStatus("Acquired face mesh - Verified Liveness Score 99.4%");
      setCyberLogs(prev => [
        "[AUDIT] Face Liveness validation score of 99.4% passed secure threshold via central gateway.",
        ...prev
      ]);
    }, 1200);
  };

  // Disaster Recovery Drill trigger
  const triggerDrBackup = () => {
    setDrProgress(0);
    setCyberLogs(prev => ["[SYSTEM] Initiating full high-availability EMR snapshot replication...", ...prev]);
    const interval = setInterval(() => {
      setDrProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setClusterReplicas(3);
          setFailoverStatus("Optimal (Secondary DR Standby Active)");
          setCyberLogs(prev => [
            "[SUCCESS] Disaster Recovery Hot-Standby Snapshot replicated successfully to Bengaluru NHA Node-B server (SLA Uptime: 99.99%)",
            "[SYSTEM] Simulated zero-downtime microservices failover drill completed under 1.8 seconds. Dynamic load balancer synchronized.",
            ...prev
          ]);
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

  // Governance - Revoke Consent
  const triggerRevocation = (id: string) => {
    setLocalConsentLogs(prev => 
      prev.map(c => c.id === id ? { ...c, status: "Revoked" as const } : c)
    );
    const revEntry = localConsentLogs.find(c => c.id === id);
    if (revEntry) {
      setConsentOverrideLog(prev => [
        `[REVOCABLE DATA LAW] Consent ID ${id} explicitly revoked by patient ${revEntry.patientName}. Longitudinal timeline retrieval privileges terminated immediately.`,
        ...prev
      ]);
      setCyberLogs(prev => [
        `[DPDP AUDIT] Access revoked for Consent ${id}. Revocation token signed on immutable chain.`,
        ...prev
      ]);
    }
  };

  // Emergency override override trigger
  const triggerEmergencyOverride = () => {
    const alertId = "CNS-" + Math.floor(1000 + Math.random() * 9000);
    const overTime = new Date().toISOString();
    const newOverride = {
      id: alertId,
      patientName: "Emergency Override Triggered",
      type: "Emergency-override" as const,
      doctor: "CMO on ICU Duty",
      expiresAt: "Immediate (1-hr lease)",
      sensitiveMasked: false,
      geofenced: false,
      status: "Active" as const
    };
    setLocalConsentLogs(prev => [newOverride, ...prev]);
    setConsentOverrideLog(prev => [
      `🚨 [EMERGENCY BYPASS] Critical Care emergency override executed at ${overTime}. Clinical documentation unmasked. Regulatory warning log saved.`,
      ...prev
    ]);
  };

  // Add Consent Form Trigger
  const handleCreateNewConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = "CNS-" + Math.floor(2000 + Math.random() * 8000);
    const expires = new Date();
    expires.setDate(expires.getDate() + consentValidityDays);
    const expiryStr = expires.toISOString().slice(0, 10);
    
    const newConsent: ConsentLogEntry = {
      id: newId,
      patientName: selectedConsentPatient,
      type: selectedConsentType,
      doctor: assignedDoctor,
      expiresAt: expiryStr,
      sensitiveMasked: sensitiveMaskingCheck,
      geofenced: geofencingCheck,
      status: "Active"
    };

    setLocalConsentLogs(prev => [newConsent, ...prev]);
    setCyberLogs(prev => [
      `[DPDP DATA RESTRICTION] New active consent artifact stored: ID ${newId} for ${selectedConsentPatient}. Masking: ${sensitiveMaskingCheck ? "ON" : "OFF"}.`,
      ...prev
    ]);
  };

  // ABDM Milestone tests
  const triggerABDMConformanceSandbox = () => {
    setSandboxTestsState("running");
    setTimeout(() => {
      setSandboxTestsState("completed");
      setCyberLogs(prev => [
        `[NHA AUDIT] Sandbox API Conformance Suite completed with 100% compliance. FHIR HL7 R4 validation conforms to national guidelines.`,
        ...prev
      ]);
    }, 2000);
  };

  // ABHA Registration
  const handleAbhaOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockAbhaNo = "91-" + Math.floor(1000 + Math.random() * 9000) + "-5592-2018";
    const adId = abhaInputName.toLowerCase().replace(/\s/g, "") + "@sbx";
    setAbhaGenerated({
      abhaNumber: mockAbhaNo,
      abhaId: adId,
      kycMatched: true,
      authMode: "AADHAAR_OTP"
    });
    setAbhaCreationStep("success");
    setCyberLogs(prev => [
      `[NHA COMPLIANCE] Successfully linked UHID and generated secure ABHA Profile: ${adId} (No. ${mockAbhaNo}) via Aadhaar verification.`,
      ...prev
    ]);
  };

  // Government API triggers
  const executeGovtApiTest = (apiName: string) => {
    setExecutingApiId(apiName);
    setApiResponseJson(null);
    
    setTimeout(() => {
      let mockPayload: any = {};
      const txnId = `txn-${Math.floor(Math.random() * 10000000)}`;

      if (apiName === "abha_creation") {
        mockPayload = {
          endpoint: "https://ndhm.gov.in/api/v2/abha/register",
          status: "SUCCESS",
          transactionId: txnId,
          data: {
            abhaId: "client.testing@sbx",
            abhaNo: "88-1092-3491-0022",
            status: "ACTIVE",
            kycVerified: true,
            authMode: "AADHAAR_OTP"
          }
        };
      } else if (apiName === "consent_manager") {
        mockPayload = {
          endpoint: "https://ndhm.gov.in/api/v2/consent/request",
          status: "CONSENT_GRANTED",
          consentId: `CNS-MGR-${Math.floor(10000 + Math.random() * 90000)}`,
          requester: { hprId: "arvind@hpr", name: "Dr. Arvind Swaminathan" },
          validity: { grantedAt: new Date().toISOString(), expiresAt: "2026-12-31T23:59:59Z" },
          permissions: ["Prescriptions", "DiagnosticReports", "DischargeSummary"]
        };
      } else if (apiName === "health_exchange") {
        mockPayload = {
          endpoint: "https://ndhm.gov.in/api/v2/hip/hiu/transfer",
          status: "FHIR_BUNDLE_DISPATCHED",
          recordsTransferred: 2,
          hl7V4Format: "Interoperable_OPD_Schema_Standard",
          encryptionKeyType: "Diffie-Hellman-Curve25519"
        };
      } else if (apiName === "scan_share") {
        mockPayload = {
          endpoint: "https://ndhm.gov.in/api/v2/scan-share/token",
          status: "TOKEN_SINK_CONNECTED",
          queueLength: patients.filter(p => p.scanShareToken).length,
          lastTokenProcessed: "109",
          syncSlaMs: 120
        };
      } else if (apiName === "pmjay_bis") {
        mockPayload = {
          endpoint: "https://bis.pmjay.gov.in/api/verify-beneficiary",
          status: "BENEFICIARY_FOUND",
          pmjayFamilyId: "PMJAY-DEL-908122",
          eligibilityScore: "94.5%",
          socioEconomicCategory: "SECC-2011 Eligible Tier-I"
        };
      } else if (apiName === "pmjay_tms") {
        mockPayload = {
          endpoint: "https://tms.pmjay.gov.in/api/transaction",
          status: "SHEET_SYNC_SUCCESS",
          activeAdmittedClaims: claims.filter(c => c.claimStatus !== "Paid").length,
          settledCapAmountLimit: 500000,
          remainingFamilyBalance: 462000
        };
      } else if (apiName === "pmjay_preauth") {
        mockPayload = {
          endpoint: "https://tms.pmjay.gov.in/api/preauth/apply",
          status: "PREAUTH_DELIVERED",
          currentAudits: claims.map(c => ({ claimId: c.id, state: c.preAuthStatus }))
        };
      } else if (apiName === "aadhaar_ekyc") {
        mockPayload = {
          endpoint: "https://uidai.gov.in/api/v2/ekyc",
          status: "UIDAI_MATCH_100",
          demographics: { gender: "M", dob: "1968-08-15", phoneVerified: true },
          pkiSignatureVerified: true
        };
      } else if (apiName === "digilocker_explorer") {
        mockPayload = {
          endpoint: "https://digilocker.gov.in/api/pull-doc",
          status: "FETCH_SUCCESS",
          documentType: "AADHAAR_CARD",
          authorizingAuthority: "UIDAI Government of India",
          pushedToHealthEhr: true
        };
      } else if (apiName === "cowin_cert") {
        mockPayload = {
          endpoint: "https://cowin.gov.in/api/vaccination-status",
          status: "FULLY_VACCINATED",
          dosesAdministered: 3,
          beneficiaryName: "Ramesh Chandra Kumar",
          certUuid: "COWIN-CERT-9901-22"
        };
      } else if (apiName === "esanjeevani") {
        mockPayload = {
          endpoint: "https://esanjeevani.gov.in/api/teleconsult",
          status: "ESANJEEVANI_GATEWAY_INTEGRATED",
          providerActive: true,
          secureSessionId: "sess-es-99831a"
        };
      } else {
        mockPayload = {
          status: "GATEWAY_ALIVE",
          pingMs: 45
        };
      }

      setApiResponseJson(mockPayload);
      setExecutingApiId(null);
      setCyberLogs(prev => [
        `[NDHM NODE CONNECT] Dispatched highly-interoperable outward secure query to registry API endpoint for element: ${apiName}`,
        ...prev
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6" id="super-admin-desk">
      {/* Dynamic Master Control Bento Banner */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-slate-300 bg-indigo-900 border border-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
            National Health Facility Authority Hub
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Master Command &amp; Certification</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            NHA Central Platform for ABDM Milestones M1, M2 &amp; M3, Dynamic Consent Auditing, Cyber Security SOC monitoring, and Clinical AI metrics.
          </p>
        </div>
        <div className="flex gap-4 font-mono select-none">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-sans uppercase">Milestones Score</p>
            <strong className="text-emerald-400 text-base">{sandboxScore}% Passed</strong>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-sans uppercase">API TLS SLA</p>
            <strong className="text-blue-400 text-base">● 99.99%</strong>
          </div>
        </div>
      </div>

      {/* Primary Sub Tabs Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-1.5 p-1 bg-slate-100 border rounded-xl" id="superadmin-subtabs">
        <button
          onClick={() => setActiveSubTab("executive")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "executive" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          <span>Executive BI</span>
        </button>
        <button
          onClick={() => setActiveSubTab("biometrics")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "biometrics" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Fingerprint className="h-3.5 w-3.5 text-indigo-500" />
          <span>Bio Terminals</span>
        </button>
        <button
          onClick={() => setActiveSubTab("govt")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "govt" ? "bg-white text-slate-955 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-green-500" />
          <span>ABDM Sandbox</span>
        </button>
        <button
          onClick={() => setActiveSubTab("cyber")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "cyber" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-rose-500" />
          <span>SOC & Failover</span>
        </button>
        <button
          onClick={() => setActiveSubTab("governance")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "governance" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-amber-500" />
          <span>DPDP Consent</span>
        </button>
        <button
          onClick={() => setActiveSubTab("interoperability")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "interoperability" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-cyan-500" />
          <span>FHIR Interop</span>
        </button>
        <button
          onClick={() => setActiveSubTab("clinical_ai")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "clinical_ai" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <span>AI & Portals</span>
        </button>
        <button
          onClick={() => setActiveSubTab("fraud_suite")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "fraud_suite" ? "bg-rose-50 text-rose-950 shadow-sm border border-rose-200" : "text-rose-650 hover:text-rose-950"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
          <span>Fraud Suite</span>
        </button>
        <button
          onClick={() => setActiveSubTab("master_tables")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
            activeSubTab === "master_tables" ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="h-3.5 w-3.5 text-indigo-650" />
          <span>Master Tables</span>
        </button>
      </div>

      {activeSubTab === "executive" && (
        <div className="space-y-6">
          {/* Detailed Enterprise KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Central Revenue</span>
              <h3 className="text-2.5xl font-black text-slate-900 mt-1">
                ₹{(claims.filter(c => c.claimStatus === 'Paid').reduce((a,c)=>a+c.packageCost,0) + (patients.length * 350)).toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Including clinical consulting and active pharmacy tallies
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PM-JAY Outflow Ledger</span>
              <h3 className="text-2.5xl font-black text-slate-900 mt-1">₹{totalClaimsCost.toLocaleString()}</h3>
              <p className="text-[10px] text-indigo-600 font-bold mt-2">
                Unified TMS synchronization latency: 3.4 mins
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource Occupancy</span>
              <h3 className="text-2.5xl font-black text-slate-900 mt-1">{occupancyPercentage}%</h3>
              <p className="text-[10px] text-slate-500 mt-2">
                Active Ward Beds: <strong>{occupiedBedsCount} of {beds.length} occupied</strong>
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">NHA Regulatory Status</span>
              <h3 className="text-2.5xl font-black text-green-700 mt-1">COMPLIANT</h3>
              <p className="text-[10px] text-slate-500 mt-2">
                Passed ABDM certification milestone protocols
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* National Claims Disbursment chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">PM-JAY Cashless Package Disbursement Ledger</h3>
                  <p className="text-[10px] text-slate-400">Live claims mapped to clinical episode cost limits</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 p-1 border rounded">Family Limit: ₹5,00,000</span>
              </div>
              
              <div className="space-y-4">
                {claims.length > 0 ? (
                  claims.map(cl => {
                    const approvalPercentage = Math.round((cl.packageCost / 120000) * 100);
                    return (
                      <div key={cl.id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-900 truncate max-w-sm">{cl.procedureName} (Ref {cl.id})</span>
                          <strong className="text-indigo-800 font-mono">₹{cl.packageCost.toLocaleString()}</strong>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-150">
                          <div
                            style={{ width: `${Math.min(100, Math.max(12, approvalPercentage))}%` }}
                            className="bg-indigo-600 h-full rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                          <span>Status: <strong className="text-indigo-700 capitalize">{cl.claimStatus}</strong></span>
                          <span>Pre-Auth: <strong className="text-slate-700">{cl.preAuthStatus}</strong></span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400">No active claims on the ledger.</div>
                )}
              </div>
            </div>

            {/* Quality indicators & Infection control */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b">
                  NABH Central Institutional Quality Indicators
                </span>
                
                <div className="space-y-3.5 my-3 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
                    <div>
                      <strong className="text-slate-900">Patient-Doctor Ratio</strong>
                      <p className="text-[9px] text-slate-500">Active outpatient consultations</p>
                    </div>
                    <span className="font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2.5 py-1 font-bold">
                      {averageConsultationsPerEncounter}:1
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
                    <div>
                      <strong className="text-slate-900">Infection Rate Index</strong>
                      <p className="text-[9px] text-slate-500">Nosocomial audit benchmark</p>
                    </div>
                    <span className="font-mono bg-green-50 text-green-700 border border-green-200 rounded px-2.5 py-1 font-bold">
                      0.04%
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
                    <div>
                      <strong className="text-slate-900">Occupancy Forecast</strong>
                      <p className="text-[9px] text-slate-500">Predictive ward allocation speed</p>
                    </div>
                    <span className="font-mono bg-purple-50 text-purple-700 border border-purple-200 rounded px-2.5 py-1 font-bold">
                      +12% (High)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-1.5 font-mono">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <ShieldCheck className="h-4 w-4" /> Comprehensive Compliance Statement
                </div>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  Deployable software is ABDM Sandbox certified, verifying digital identity patient registries, role-based encryption protocols, and dynamic revocable consents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "biometrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="biometrics-iot-desk">
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-indigo-600" /> Biometric Identity Verification Devices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mantra FP */}
              <div className="border border-slate-200 p-4.5 rounded-xl space-y-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Mantra Scanner</span>
                    <span className={`w-2 h-2 rounded-full ${connectedFP ? "bg-green-500" : "bg-red-400"}`} />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">Ref: MAN-MFS100-USB3</p>
                </div>
                
                <div className="p-2.5 bg-white border rounded text-center">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Scanner Status</span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">{fpStatus}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerFingerprintScan}
                    disabled={!connectedFP}
                    className="flex-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-750 text-white py-1.5 px-2.5 rounded-lg disabled:opacity-40"
                  >
                    Scan Finger
                  </button>
                  <button
                    onClick={() => setConnectedFP(!connectedFP)}
                    className="text-[10px] border border-slate-300 p-1 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    {connectedFP ? "Off" : "On"}
                  </button>
                </div>
              </div>

              {/* Iris Scanner */}
              <div className="border border-slate-200 p-4.5 rounded-xl space-y-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">ISO-19794 Iris</span>
                    <span className={`w-2 h-2 rounded-full ${connectedIris ? "bg-green-500" : "bg-red-400"}`} />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">Ref: COGENT-CIS100-IR</p>
                </div>

                <div className="p-2.5 bg-white border rounded text-center">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Iris Alignment</span>
                  <span className="text-xs font-bold text-green-700 font-mono block truncate">{irisStatus}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerIrisScan}
                    disabled={!connectedIris}
                    className="flex-1 text-[10px] font-semibold bg-green-650 text-white py-1.5 px-2.5 hover:bg-green-700 rounded-lg disabled:opacity-40"
                  >
                    Scan Iris
                  </button>
                  <button
                    onClick={() => setConnectedIris(!connectedIris)}
                    className="text-[10px] border border-slate-300 p-1 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    {connectedIris ? "Off" : "On"}
                  </button>
                </div>
              </div>

              {/* Face Auth */}
              <div className="border border-slate-200 p-4.5 rounded-xl space-y-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Face Auth Live</span>
                    <span className={`w-2 h-2 rounded-full ${connectedFace ? "bg-green-500" : "bg-red-400"}`} />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">Ref: ABDM-FACERD-GATE</p>
                </div>

                <div className="p-2.5 bg-white border rounded text-center">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Mesh Liveness Check</span>
                  <span className="text-[11px] font-bold text-slate-700 font-mono block truncate leading-tight">{faceStatus}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerFaceTemplate}
                    disabled={!connectedFace}
                    className="flex-1 text-[10px] font-semibold bg-slate-900 text-slate-100 py-1.5 px-2.5 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                  >
                    Scan Liveness
                  </button>
                  <button
                    onClick={() => setConnectedFace(!connectedFace)}
                    className="text-[10px] border border-slate-300 p-1 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    {connectedFace ? "Off" : "On"}
                  </button>
                </div>
              </div>
            </div>

            {lastScanHash && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs flex justify-between items-center font-mono">
                <span>Verified bio-hash dispatch logged token:</span>
                <strong className="text-indigo-800">{lastScanHash}</strong>
              </div>
            )}

            {/* Smart Bedside and Ventilator telemetry */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                SMART BED TELEMETRY &amp; ICU CRITICAL PATIENT MONITORS (PACS SERVER LINKED)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-200 text-center font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-3">
                    <span>12-LEAD ECG MACHINE</span>
                    <span className="text-emerald-400 flex items-center gap-1">● Online</span>
                  </div>
                  <span className="text-3xl font-black text-white">{heartRate}</span> <span className="text-xs font-semibold text-slate-400 font-sans">bpm</span>
                  <div className="mt-4 h-11 flex items-end justify-center gap-0.5" id="ecg-rhythm">
                    {[3, 8, 14, 28, 4, 3, 2, 8, 20, 15, 30, 2, 4, 8, 3, 4, 18, 22, 5, 2, 1, 9].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.floor(h * (heartRate / 74))}px` }}
                        className="w-1 bg-green-500 rounded-t-sm animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-200 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-3">
                    <span>ICU VENTILATOR FEED</span>
                    <span className="text-blue-400">● Streaming</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-1 bg-slate-900 rounded">
                      <p className="text-[8px] text-slate-500">PIP (cm)</p>
                      <strong className="text-white">20</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded">
                      <p className="text-[8px] text-slate-500">FiO2</p>
                      <strong className="text-sky-300">40%</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded">
                      <p className="text-[8px] text-slate-500">SpO2</p>
                      <strong className="text-green-400">{spo2Val}%</strong>
                    </div>
                  </div>
                  <div className="mt-4 text-[9px] text-slate-400 text-center border-t border-slate-900 pt-2">
                    Alarm Trigger: <span className="text-green-500 font-bold">NORMAL</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-200 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-3">
                    <span>PACS DICOM SERVER RIS</span>
                    <span className="text-indigo-400">● Synced</span>
                  </div>
                  <div className="space-y-2 text-[10px] font-mono leading-tight">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span>Ref File:</span>
                      <strong className="text-white">CT_BRAIN_108.dcm</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span>HL7 Socket:</span>
                      <span className="text-sky-400">Port 104</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RIS Index:</span>
                      <strong className="text-green-500 underline">Images Active</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-indigo-600 uppercase block tracking-wider mb-1">PACS Diagnostic Scope</span>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3">Device Diagnostic Audit</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                The device diagnostics system provides high-assurance simulation of hardware parameters. Interoperable diagnostic standards allow instantaneous data pushes onto HL7 FHIR Observation payloads.
              </p>
              <div className="p-3.5 bg-slate-50 border rounded-lg space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Aadhaar Biometric eKYC matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>ISO-19794 Handshake schemas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>DICOM C-FIND metadata verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "govt" && (
        <div className="space-y-6">
          {/* ABDM Milestones M1, M2, M3 Tracking Framework */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50/75 py-0.5 px-2 rounded-full font-mono border border-blue-200">
                  ABDM Milestone M1
                </span>
                <span className="text-xs text-slate-500 font-bold font-mono">100% Core</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Digital Identity &amp; Registers</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                ABHA onboarding, mobile/Aadhaar OTP handshake verification, Healthcare Facility Registry (HFR), and Scan &amp; Share QR tokens.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-full rounded-full" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-green-600 uppercase bg-green-50/75 py-0.5 px-2 rounded-full font-mono border border-green-200">
                  ABDM Milestone M2
                </span>
                <span className="text-xs text-slate-500 font-bold font-mono">100% Core</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Health Records &amp; Consent</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Consent Request Dispatch, Consent Artifact encryption logging, Patient Longitudinal Health History exchange HIP/HIU ready payloads.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full w-full rounded-full" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-purple-600 uppercase bg-purple-50/75 py-0.5 px-2 rounded-full font-mono border border-purple-200">
                  ABDM Milestone M3
                </span>
                <span className="text-xs text-slate-500 font-bold font-mono">98% Core</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Full Interoperability Ecosystem</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                National Unified Health Timeline, HL7 FHIR bundles execution, multi-facility continuity tracking modules, and PHR integration templates.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-[98%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="govt-interp-apis">
            {/* National Health Authority Playgrounds */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" /> NHA National Sandbox &amp; Government API Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400">Validate real-time API schema parameters against national endpoints</p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={triggerABDMConformanceSandbox}
                    disabled={sandboxTestsState === "running"}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-45"
                  >
                    <RefreshCw className={`h-3 w-3 ${sandboxTestsState === "running" ? "animate-spin" : ""}`} />
                    <span>Run Conformance Audit</span>
                  </button>
                </div>
              </div>

              {/* Interactive ABHA Card Creator and Linker Widget */}
              <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sliders className="h-4 w-4 text-blue-600" />
                    <span>Interactive Patient ABHA Registration (Milestone M1 Validation Test)</span>
                  </div>
                  <strong className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    AADHAAR SECURED
                  </strong>
                </div>

                {abhaCreationStep === "form" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Patient Name on Aadhaar</label>
                      <input
                        type="text"
                        value={abhaInputName}
                        onChange={(e) => setAbhaInputName(e.target.value)}
                        className="w-full text-xs p-2 border bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Ramesh Chandra Kumar"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">UIDAI Aadhaar Number</label>
                      <input
                        type="text"
                        value={abhaInputAadhaar}
                        onChange={(e) => setAbhaInputAadhaar(e.target.value)}
                        className="w-full text-xs p-2 border bg-white rounded-lg font-mono focus:outline-none"
                        placeholder="XXXX-XXXX-XXXX"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setAbhaCreationStep("otp")}
                        className="w-full bg-blue-600 hover:bg-blue-755 text-white text-xs py-2 font-semibold rounded-lg"
                      >
                        Request OTP SMS
                      </button>
                    </div>
                  </div>
                )}

                {abhaCreationStep === "otp" && (
                  <form onSubmit={handleAbhaOtpSubmit} className="flex flex-col md:flex-row items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 block leading-tight">
                        Enter 6-digit Aadhaar OTP (Simulated: SMS dispatched to patient registration profile)
                      </span>
                      <input
                        type="text"
                        value={abhaOtp}
                        onChange={(e) => setAbhaOtp(e.target.value)}
                        className="w-full text-xs p-2 border bg-white font-mono rounded-lg focus:outline-none font-bold tracking-widest text-center"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-650 hover:bg-green-700 text-white text-xs py-2 px-4 font-semibold rounded-lg"
                      >
                        Verify &amp; Issue ABHA
                      </button>
                      <button
                        type="button"
                        onClick={() => setAbhaCreationStep("form")}
                        className="border border-slate-300 text-xs py-2 px-3 hover:bg-slate-100 rounded-lg text-slate-600"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}

                {abhaCreationStep === "success" && abhaGenerated && (
                  <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <strong className="text-emerald-800 text-xs font-bold block">✓ ABHA Health Card Profile Successfully Linked</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Citizen Identifier: <strong className="font-mono text-slate-800">{abhaGenerated.abhaId}</strong> • Demographics Match: 100% UIDAI Verified.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-mono font-bold bg-white border border-emerald-300 px-3 py-1 rounded text-emerald-800">
                        {abhaGenerated.abhaNumber}
                      </span>
                      <button
                        onClick={() => {
                          setAbhaCreationStep("form");
                          setAbhaGenerated(null);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 underline active:opacity-70 font-semibold"
                      >
                        Reset Mock Form
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {sandboxTestsState === "running" && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono rounded-xl space-y-1.5 animate-pulse">
                  <p><strong>[SANDBOX PROCESSOR]</strong> Triggering compliance validations against NHA milestone nodes...</p>
                  <p>• Testing M1 patient self-registration Scan &amp; Share QR token queues...</p>
                  <p>• Validating M2 dynamic consent manager schema integrations...</p>
                  <p>• Scanning M3 FHIR HL7 multi-hospital exchange pipelines...</p>
                </div>
              )}

              {/* Endpoint buttons matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-slate-200 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b">
                    ABDM Core API Gateway (NHA)
                  </span>
                  <button
                    onClick={() => executeGovtApiTest("abha_creation")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>Register ABHA</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("consent_manager")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>Consent Request Sync</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("health_exchange")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>Health Data Push</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("scan_share")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>Scan &amp; Share Token</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b">
                    NHA Insurance &amp; Co-op Nodes
                  </span>
                  <button
                    onClick={() => executeGovtApiTest("pmjay_bis")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>PMJAY BIS Gateway</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("pmjay_tms")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>TMS Ledger Status</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("pmjay_preauth")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-705 flex justify-between items-center"
                  >
                    <span>Preauth Claim Verify</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b">
                    Auxiliary National Portals
                  </span>
                  <button
                    onClick={() => executeGovtApiTest("aadhaar_ekyc")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-750 flex justify-between items-center"
                  >
                    <span>Aadhaar eKYC Node</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("digilocker_explorer")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-750 flex justify-between items-center"
                  >
                    <span>DigiLocker Doc Fetch</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("cowin_cert")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-750 flex justify-between items-center"
                  >
                    <span>CoWIN Immunization</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                  <button
                    onClick={() => executeGovtApiTest("esanjeevani")}
                    className="w-full text-left text-xs p-2 bg-white border hover:bg-slate-100 rounded-lg font-medium text-slate-750 flex justify-between items-center"
                  >
                    <span>eSanjeevani Teleconsult</span>
                    <span className="text-slate-400">➔</span>
                  </button>
                </div>
              </div>

              {/* API response output */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase">Live Government API Response Gateway Payload</span>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 font-mono text-[11px] text-green-400 overflow-x-auto min-h-28 flex flex-col justify-center">
                  {executingApiId ? (
                    <div className="flex items-center gap-2.5 justify-center py-6 text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Post-handshaking secure gateway session...</span>
                    </div>
                  ) : apiResponseJson ? (
                    <pre className="whitespace-pre">{JSON.stringify(apiResponseJson, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 text-center block py-10">
                      Select an NHA, PM-JAY, or auxiliary portal API from the grid matrices above to execute simulated response bodies.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Government Portal Sync</span>
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3.5">Interoperability SLA</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  NHA regulations mandate strict telemetry responses, using Diffie-Hellman Key Exchange arrays to safeguard FHIR packaging metadata.
                </p>
                <div className="bg-slate-50 border p-3.5 border-slate-200 rounded-lg space-y-2 text-xs text-slate-700 font-mono">
                  <div className="font-sans font-bold text-slate-800">API Gateway Targets:</div>
                  <div>• Patient Registry matching: &lt;140ms</div>
                  <div>• Consent Request trigger: &lt;200ms</div>
                  <div>• Claim preauthorizations: &lt;2.4s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "cyber" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cyber-security-dashboard">
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-rose-600" /> Digital Health Operations &amp; Security Operations Center (SOC)
                </h3>
                <p className="text-[11px] text-slate-500">Zero-Trust access matrices, SIEM endpoint monitoring logs, and Ransomware Shields</p>
              </div>
              <span className="text-xs font-bold font-mono text-green-700 bg-green-50 border border-green-200 rounded py-0.5 px-2">
                ACTIVE SHIELD
              </span>
            </div>

            {/* SSO, AES-256 and Ransomware toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-xs">AES-256 Encryption</strong>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Automatic cell-level block database storage encryption</p>
                </div>
                <button
                  onClick={() => {
                    setAesEnabled(!aesEnabled);
                    setCyberLogs(prev => [
                      `[AES-256 AUDIT] Rest-state database AES encryption toggled: ${!aesEnabled ? "ON" : "OFF"}`,
                      ...prev
                    ]);
                  }}
                  className={`text-[10px] font-bold py-1.5 px-3 rounded-lg mt-3 cursor-pointer ${
                    aesEnabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {aesEnabled ? "Encryption ON" : "Encryption OFF"}
                </button>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-xs">SSO / MFA Gateway</strong>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Active OAuth 2.0 OpenID Connect multi-factor authentications</p>
                </div>
                <button
                  onClick={() => {
                    setMfaEnabled(!mfaEnabled);
                    setCyberLogs(prev => [
                      `[SSO AUDIT] Single Sign-On session verification rules updated: ${!mfaEnabled ? "Optimal Zero-Trust" : "Standard RBAC"}`,
                      ...prev
                    ]);
                  }}
                  className={`text-[10px] font-bold py-1.5 px-3 rounded-lg mt-3 cursor-pointer ${
                    mfaEnabled ? "bg-indigo-600 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {mfaEnabled ? "MFA/SSO Enabled" : "MFA Disabled"}
                </button>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 text-xs">Ransomware Shield</strong>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Behavioral anomaly pattern detection system logs</p>
                </div>
                <button
                  onClick={() => {
                    setRansomwareShield(!ransomwareShield);
                    setCyberLogs(prev => [
                      `[ANTIMALWARE] Behavioral file system intrusion filter updated. Shield: ${!ransomwareShield ? "ENABLED" : "BYPASED"}`,
                      ...prev
                    ]);
                  }}
                  className={`text-[10px] font-bold py-1.5 px-3 rounded-lg mt-3 cursor-pointer ${
                    ransomwareShield ? "bg-rose-600 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {ransomwareShield ? "Active Shield ON" : "Shield OFF"}
                </button>
              </div>
            </div>

            {/* Incremental Automated Hour backups and Disaster recovery simulation progress */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3.5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">HA REPLICATION &amp; DISASTER RECOVERY DRILLS</span>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    Incremental Hourly Snapshots &amp; Multi-region Fallback Simulation (SLA compliance 99.99%)
                  </p>
                </div>
                <button
                  onClick={triggerDrBackup}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold py-1.5 px-4.5 rounded-lg active:scale-95 transition"
                >
                  Initiate HA Fallover Drill
                </button>
              </div>

              {drProgress >= 0 && (
                <div className="space-y-1 bg-white p-3 border border-slate-250 rounded-lg">
                  <div className="flex justify-between text-xs font-mono font-bold text-indigo-700">
                    <span>Replicating EMR Database blocks to Standby node B (Bengaluru Core)</span>
                    <span>{drProgress}% Done</span>
                  </div>
                  <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${drProgress}%` }}
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-1">
                <div className="bg-white p-2.5 border rounded-lg">
                  <p className="text-[9px] text-slate-450 uppercase font-sans">Current Node Cluster</p>
                  <strong className="text-slate-800">K8s Kubernetes {clusterReplicas} Replicas</strong>
                </div>
                <div className="bg-white p-2.5 border rounded-lg">
                  <p className="text-[9px] text-slate-450 uppercase font-sans">RPO / RTO SLA Target</p>
                  <strong className="text-slate-800">RPO: &lt; 5m | RTO: 20s HA</strong>
                </div>
                <div className="bg-white p-2.5 border rounded-lg">
                  <p className="text-[9px] text-slate-450 uppercase font-sans">Active Zone Registry Status</p>
                  <strong className="text-indigo-805">{failoverStatus}</strong>
                </div>
              </div>
            </div>

            {/* Audit Logs list */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-500 uppercase">Real-Time Intrusion &amp; Compliance SIEM Log Stream</span>
              <div className="bg-slate-950 rounded-xl p-4.5 border border-slate-850 font-mono text-[11px] text-green-400 h-44 overflow-y-auto space-y-1">
                {cyberLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start hover:bg-slate-900 py-0.5 rounded">
                    <span className="text-slate-600 font-bold">[{new Date().toLocaleTimeString("en-IN")}]</span>
                    <span className="whitespace-normal leading-normal">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance targets */}
          <div className="lg:col-span-4 space-y-4 font-sans">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <span className="text-[10px] font-bold text-rose-600 uppercase block tracking-wider">National Security Controls</span>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-1.5">Legal Core Protections</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 flex justify-between">
                    <span>DPDP Act 2023 Rules</span>
                    <span className="text-green-600">99% Passed</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Strict revocable framework with explicit patient digital logs before longitudinal files are queried.
                  </p>
                </div>

                <div className="border-t pt-2.5">
                  <h4 className="font-bold text-slate-805 flex justify-between">
                    <span>NMC Health Guidelines</span>
                    <span className="text-green-600">100% Passed</span>
                  </h4>
                  <p className="text-[10px] text-slate-505 mt-0.5 leading-snug">
                    Verifiable HPR credentials required for clinical diagnostic modifications. Secure credentials active.
                  </p>
                </div>

                <div className="border-t pt-2.5">
                  <h4 className="font-bold text-slate-805 flex justify-between">
                    <span>HIPAA Data Security</span>
                    <span className="text-green-600">98% Passed</span>
                  </h4>
                  <p className="text-[10px] text-slate-505 mt-0.5 leading-snug">
                    Robust logging streams tracing nurse allocations, pharmacy inventory, and diagnostic data points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "governance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dpdp-consent-suite">
          {/* Dynamic Consent Management according to DPDP ACT */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-500" /> Dynamic Patient Consent Manager (DPDP Compliant)
                </h3>
                <p className="text-[11px] text-slate-500">Enable granular revocable consents, duration boundaries, and Emergency overrides</p>
              </div>
              <button
                onClick={triggerEmergencyOverride}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] py-1.5 px-3.5 rounded-lg flex items-center gap-1 leading-none shadow-xs uppercase font-mono animate-pulse"
              >
                🚨 Emergency override Bypass
              </button>
            </div>

            {/* Log layout of override actions */}
            {consentOverrideLog.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-800 text-[11px] rounded-xl font-mono leading-relaxed space-y-1">
                {consentOverrideLog.map((overLog, oIdx) => (
                  <div key={oIdx}>• {overLog}</div>
                ))}
              </div>
            )}

            {/* Create dynamic consent schema builder */}
            <form onSubmit={handleCreateNewConsent} className="bg-slate-50 p-4 border rounded-xl space-y-4 text-xs">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b pb-1.5">
                DISPATCH NEW DIGITAL CONSENT ARTIFACT REQUEST
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Select Target Patient</label>
                  <select
                    value={selectedConsentPatient}
                    onChange={(e) => setSelectedConsentPatient(e.target.value)}
                    className="w-full border p-2 bg-white rounded-lg focus:outline-none"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Consent Level Type</label>
                  <select
                    value={selectedConsentType}
                    onChange={(e) => setSelectedConsentType(e.target.value as any)}
                    className="w-full border p-2 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="One-time">One-time specific query</option>
                    <option value="Time-bound">Time-bound longitudinal access</option>
                    <option value="Department-specific">Department-specific access</option>
                    <option value="Doctor-specific">Doctor-specific access</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Authorized Care Clinician</label>
                  <input
                    type="text"
                    value={assignedDoctor}
                    onChange={(e) => setAssignedDoctor(e.target.value)}
                    className="w-full border p-2 bg-white rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5 pt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="sens-mask"
                    checked={sensitiveMaskingCheck}
                    onChange={(e) => setSensitiveMaskingCheck(e.target.checked)}
                    className="h-3.5 w-3.5 accent-indigo-650"
                  />
                  <label htmlFor="sens-mask" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                    Enable Sensitive Data Masking (HIV/Psychiatry restriction)
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="geo-fence"
                    checked={geofencingCheck}
                    onChange={(e) => setGeofencingCheck(e.target.checked)}
                    className="h-3.5 w-3.5 accent-indigo-650"
                  />
                  <label htmlFor="geo-fence" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                    Enable Geo-fenced Access Protection (Host IP must reside in India)
                  </label>
                </div>

                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <span className="text-[10px] text-slate-500 font-bold mr-1">Validity (Days):</span>
                  <input
                    type="number"
                    value={consentValidityDays}
                    onChange={(e) => setConsentValidityDays(parseInt(e.target.value) || 30)}
                    className="w-14 border p-1 bg-white text-center rounded focus:outline-none font-mono"
                    min={1}
                    max={365}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition"
              >
                Sign and Broadcast Consent Request Envelope
              </button>
            </form>

            {/* List active consents */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase">Tamper-Proof Consent Registries</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-slate-50 p-2.5 font-bold text-slate-500 border-b">
                  <div className="col-span-2">ID</div>
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-2">Level Type</div>
                  <div className="col-span-2">Approved Doctor</div>
                  <div className="col-span-1.5">Expires</div>
                  <div className="col-span-1.5 text-right">Action</div>
                </div>

                {localConsentLogs.map((con, cIdx) => (
                  <div key={con.id} className="grid grid-cols-12 p-3 border-b last:border-0 hover:bg-slate-50/50 items-center">
                    <div className="col-span-2 font-mono font-medium text-slate-500">{con.id}</div>
                    <div className="col-span-3">
                      <strong className="text-slate-900 block font-semibold">{con.patientName}</strong>
                      <span className="text-[9px] text-slate-450 block space-x-1.5 leading-none">
                        {con.sensitiveMasked && <span className="text-indigo-600 font-bold">● Masked</span>}
                        {con.geofenced && <span className="text-amber-600 font-bold">● Geo-fenced</span>}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="bg-slate-100 border text-slate-700 py-0.5 px-2 rounded-md font-mono text-[10px] uppercase">
                        {con.type}
                      </span>
                    </div>
                    <div className="col-span-2 text-slate-600">{con.doctor}</div>
                    <div className="col-span-1.5 font-mono text-slate-500">{con.expiresAt}</div>
                    <div className="col-span-1.5 text-right">
                      {con.status === "Active" ? (
                        <button
                          onClick={() => triggerRevocation(con.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold py-1 px-2.5 rounded border border-rose-200 transition"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase ${con.status === "Revoked" ? "text-rose-500" : "text-slate-400"}`}>
                          {con.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 font-sans">
            {/* Real patient privacy preview engine */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-amber-600 uppercase block tracking-wider">DPDP Privacy Controls sandbox</span>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-1.5">Sensitive Data Masking Simulation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check how critical EMR files are dynamically auto-masked at diagnostic query compilation depending on the active consent policy:
              </p>

              <div className="space-y-2 text-[11px] font-mono leading-snug">
                <div className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg">
                  <span className="text-[9px] block text-indigo-400 border-b border-slate-900 pb-1 font-bold">
                    Standard EMR Payload View (Clinical Console)
                  </span>
                  <div className="mt-1.5">
                    <p>Reason: Chronic Exertional Chest pain</p>
                    <p>Lab Run ID: LAB-991823</p>
                    <p>Result: HIV-Screen: <strong className="text-green-400">NON-REACTIVE</strong></p>
                    <p>Result: Substance Toxicity: <strong className="text-green-400">NEGATIVE</strong></p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg">
                  <span className="text-[9px] block text-amber-500 border-b border-slate-900 pb-1 font-bold">
                    Governed Inward API View (Masking Active)
                  </span>
                  <div className="mt-1.5">
                    <p>Reason: Chronic Exertional Chest pain</p>
                    <p>Lab Run ID: LAB-991823</p>
                    <p className="text-amber-350">Result: [RESTRICTED BY DATA PRIVACY LAWS]</p>
                    <p className="text-amber-355">Result: [RESTRICTED BY DATA PRIVACY LAWS]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "interoperability" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="interop-engine-tabs">
          {/* HL7 FHIR Interoperability & Terminology Mappings */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-600" /> Digital Health Interoperability Engine
                </h3>
                <p className="text-[11px] text-slate-500">Transform native patient data models to interoperable HL7 FHIR R4 standard resources</p>
              </div>
              <div className="flex gap-1.5">
                <select
                  value={fhirSchemaSelected}
                  onChange={(e) => setFhirSchemaSelected(e.target.value as any)}
                  className="text-xs p-1.5 border bg-slate-50 rounded-lg font-semibold text-slate-700"
                >
                  <option value="Patient">FHIR Patient Schema</option>
                  <option value="Observation">FHIR Observation Schema</option>
                  <option value="DiagnosticReport">FHIR DiagnosticReport</option>
                </select>
              </div>
            </div>

            {/* Live HL7 Validation testing space */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">HL7 FHIR JSON Payload Source</span>
                <textarea
                  value={fhirInputJson}
                  onChange={(e) => setFhirInputJson(e.target.value)}
                  className="w-full h-64 border p-3 bg-slate-950 text-green-400 font-mono text-[10px] rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleFhirValidation}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg"
                >
                  Validate HL7 FHIR Node Schema
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Schema Verification Status Console</span>
                  <div className="border rounded-xl p-4 bg-slate-50 font-sans text-xs min-h-24">
                    {validationResult ? (
                      <p className="leading-relaxed font-semibold text-slate-800">{validationResult}</p>
                    ) : (
                      <span className="text-slate-400 text-center block pt-6">
                        Click &quot;Validate HL7 FHIR Node Schema&quot; to test.
                      </span>
                    )}
                  </div>
                </div>

                {/* Terminology mapping selector */}
                <div className="space-y-2.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    NDHM TERMINOLOGY DICTIONARY MATRIX (SNOMED / ICD-10 LOINC)
                  </span>
                  <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={terminologySearch}
                        onChange={(e) => handleTerminologySearch(e.target.value)}
                        className="w-full text-xs p-2 border pl-8 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Search codes e.g. diabetes, LOINC, J45..."
                      />
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    </div>

                    {terminologyResults.length > 0 && (
                      <div className="max-h-28 overflow-y-auto space-y-1 pt-1.5 border-t">
                        {terminologyResults.map((r, ri) => (
                          <div key={ri} className="flex justify-between text-[11px] font-mono hover:bg-white p-1 rounded">
                            <span className="text-cyan-700 font-bold">{r.code}</span>
                            <span className="text-slate-650 truncate max-w-[180px]">{r.display}</span>
                            <span className="bg-slate-200 text-slate-600 px-1 rounded-sm text-[9px] uppercase">
                              {r.system}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Master Patient Index reconcile widget */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b pb-1.5">
                MASTER PATIENT INDEX (MPI) IDENTITY DUPLICATE RESOLVER
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                NHA National registries require automatic duplicate profile prevention rules. Below candidate matches were flagged with a demographic confidence score:
              </p>

              {mpiMerged ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-semibold text-center animate-fade-in">
                  ✓ Success: Candidate records consolidated under National Unified ID (UHID-108291). MPI index synced successfully.
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-3.5 border rounded-lg text-xs leading-normal">
                  <div>
                    <strong className="text-slate-900 block font-semibold">Candidate Record Duplication Flagged (88% Demographic Match)</strong>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 font-mono text-[10px] text-slate-500">
                      <div>Profile A: Priyanka Patel (F, DOB: 1993)</div>
                      <div>Profile B: Priyanka S. Patel (F, DOB: 1993)</div>
                      <div>Phone: +919022319022</div>
                      <div>Aadhaar Identity: XXXX-XXXX-2019</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMpiMerged(true);
                      setCyberLogs(prev => [
                        "[MPI ALGORITHM] Completed demographic reconciliation merger for Priyanka Patel candidate duplicates.",
                        ...prev
                      ]);
                    }}
                    className="bg-indigo-600 hover:bg-slate-900 text-white text-[11px] py-1.5 px-4 rounded-lg font-bold"
                  >
                    Merge MPI Records
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <span className="text-[10px] font-bold text-cyan-500 uppercase block tracking-wider">Health Data Repository</span>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-1.5">NHHM bulk datasets export</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                HMS complies with national public disease surveillance interfaces. Consented bulk epidemiological datasets can be queried for public health dashboards.
              </p>
              <div className="p-3.5 bg-slate-50 border rounded-lg space-y-2 text-xs text-slate-700 font-mono">
                <div className="font-sans font-bold text-slate-800">Supported standards:</div>
                <div>• FHIR bulk export conform</div>
                <div>• ICD-10 epidemiology tables</div>
                <div>• LOINC chemical diagnostics</div>
                <div>• DICOM radiographic structures</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "clinical_ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="clinical-ai-intelligence-tab">
          {/* Clinical AI & Patient Engagement Portals */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" /> Clinical Decision Support (CDSS) &amp; Engagement Hub
              </h3>
              <p className="text-[11px] text-slate-500">AI Sepsis forecaster tool, Drug interaction checker, and communication alert timelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* MEWS Sepsis forecaster */}
              <div className="border p-4 rounded-xl bg-slate-50 space-y-4">
                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b pb-1.5">
                  CLINICAL AI SEPSIS ALERT PREDICTOR
                </span>

                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Select Active Admitted Patient</label>
                    <select
                      value={aiSelectedPatientId}
                      onChange={(e) => {
                        setAiSelectedPatientId(e.target.value);
                        setSepsisScore(null);
                      }}
                      className="w-full border p-2 bg-white rounded-lg focus:outline-none"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handlePredictSepsis(aiSelectedPatientId)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 font-bold rounded-lg transition"
                  >
                    Run CDSS Early Warning Scan
                  </button>
                </div>

                {sepsisScore !== null && (
                  <div className={`p-3 border rounded-lg text-xs leading-normal animate-fade-in ${
                    sepsisScore > 50 ? "bg-red-50 border-red-200 text-red-900" : "bg-green-50 border-green-200 text-green-905"
                  }`}>
                    <strong className="block text-xs font-bold">
                      Calculated Sepsis score: {sepsisScore}% Risk rating
                    </strong>
                    <p className="text-[10.5px] mt-1 text-slate-600">
                      {sepsisScore > 50 
                        ? "🚨 High risk detected on heart rhythm and temperature trend lines. CDSS recommendation loaded on Doctor console."
                        : "✓ Optimal: Vital signs reside safely within baseline parametric range thresholds."}
                    </p>
                  </div>
                )}
              </div>

              {/* Multi drug interaction */}
              <div className="border p-4 rounded-xl bg-slate-50 space-y-4">
                <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest border-b pb-1.5">
                  CDSS DRUG-DRUG INTERACTION CALCULATOR
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 block">Prescribed Drug A</label>
                    <input
                      type="text"
                      className="w-full border p-1.5 bg-white rounded-lg focus:outline-none"
                      value={drugInteractionA}
                      onChange={(e) => {
                        setDrugInteractionA(e.target.value);
                        setInteractionResult(null);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 block">Prescribed Drug B</label>
                    <input
                      type="text"
                      className="w-full border p-1.5 bg-white rounded-lg focus:outline-none"
                      value={drugInteractionB}
                      onChange={(e) => {
                        setDrugInteractionB(e.target.value);
                        setInteractionResult(null);
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateInteraction}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 font-bold rounded-lg"
                >
                  Verify Synergic Side Effects
                </button>

                {interactionResult && (
                  <div className="p-3 bg-white border rounded-lg text-xs leading-normal font-sans">
                    <strong className={`block uppercase font-bold text-[10.5px] ${
                      interactionResult.severity.includes("CRITICAL") || interactionResult.severity.includes("FATAL")
                        ? "text-rose-600" : "text-emerald-700"
                    }`}>
                      {interactionResult.severity} ({interactionResult.score})
                    </strong>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{interactionResult.desc}</p>
                    <span className="text-[9px] text-slate-400 block mt-1.5 font-mono">{interactionResult.system}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Patient engagement communication queues */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase">Patient Engagement Dispatch Queue (WhatsApp / SMS)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pendingSchedules.map((sch) => (
                  <div key={sch.id} className="bg-slate-50 border p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-920 block font-semibold">{sch.type}</strong>
                      <p className="text-[10px] text-slate-500 font-medium">Recipient: {sch.patient} • {sch.sentVia}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 font-bold border border-green-250 py-0.5 px-2 rounded text-[9px] uppercase tracking-wide">
                      {sch.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <span className="text-[10px] font-bold text-purple-600 uppercase block tracking-wider">Patient Engagement Portals</span>
              <h3 className="text-sm font-bold text-slate-900 border-b pb-1.5">Linked Ecosystem</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect patients directly through digital health wallets, allowing instant access to longitudinal histories, online scheduling, and telemedicine queues:
              </p>
              <div className="bg-slate-50 border border-slate-205 p-3 rounded-lg space-y-1.5 text-xs text-slate-650 font-mono">
                <div>• WhatsApp reminders synced</div>
                <div>• 1-click self OPD registration</div>
                <div>• Verified ABHA card export</div>
                <div>• eSanjeevani consultations API</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "fraud_suite" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-rose-950/40 text-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] bg-rose-600/90 text-white font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-rose-500">
                  National Health Authority • Fraud Control & Security
                </span>
                <span className="text-[10px] bg-slate-850 bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                  NHA Sect-7 Compliance
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-450 text-rose-500" /> Fraud, Waste &amp; Abuse (FWA) Audit Control Desk
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Central regulatory console monitoring cashless claim overruns, demographic validation anomalies, clinical mispairings, unverified implant chains, and rule-based system risk indexes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 font-mono shrink-0 select-none">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-rose-500/10 text-center">
                <p className="text-[9px] text-slate-400 font-sans uppercase">Audit Score Status</p>
                <span className="text-emerald-400 text-xs font-black">● COMPLIANT</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-lg border border-indigo-500/10 text-center">
                <p className="text-[9px] text-slate-400 font-sans uppercase">Active Risk Level</p>
                <span className={`text-xs font-black ${overallSystemRiskScore > 70 ? "text-rose-500" : overallSystemRiskScore > 35 ? "text-amber-500 animate-pulse" : "text-emerald-400"}`}>
                  {overallSystemRiskScore > 70 ? "CRITICAL RISK" : overallSystemRiskScore > 35 ? "MODERATE ALERT" : "SECURED"} ({overallSystemRiskScore}/100)
                </span>
              </div>
            </div>
          </div>

          {/* Core Inner Tab Switcher Panel */}
          <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100 border rounded-xl select-none scroll-smooth">
            <button
              onClick={() => setActiveFraudTab("overview")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "overview" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              📊 Core Dashboard
            </button>
            <button
              onClick={() => setActiveFraudTab("rules")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "rules" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              ⚙️ Rule-Based Engine
            </button>
            <button
              onClick={() => setActiveFraudTab("ai_anomaly")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "ai_anomaly" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              🧠 AI Anomaly Logs
            </button>
            <button
              onClick={() => setActiveFraudTab("clinical_val")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "clinical_val" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              🩺 Clinical Validation
            </button>
            <button
              onClick={() => setActiveFraudTab("package_gov")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "package_gov" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              ⚖️ Package Governance
            </button>
            <button
              onClick={() => setActiveFraudTab("implants")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "implants" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              🧬 Implant Tracking
            </button>
            <button
              onClick={() => setActiveFraudTab("audit_cert")}
              className={`px-3 py-1.5 text-[11px] font-black tracking-tight rounded-md whitespace-nowrap transition cursor-pointer ${activeFraudTab === "audit_cert" ? "bg-indigo-600 text-white shadow-3xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
            >
              📜 Compliance Certificate
            </button>
          </div>

          {/* SWITCH VIEW CONTROLLER */}
          {activeFraudTab === "overview" && (
            <div className="space-y-6">
              
              {/* top level analytics overview cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. System Threat */}
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-white select-none relative overflow-hidden flex flex-col justify-between min-h-[110px] shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Threat Level Index</span>
                    <Activity className={`h-4 w-4 ${overallSystemRiskScore > 75 ? "text-rose-500 animate-pulse" : "text-amber-400"}`} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-rose-400 tracking-tight">{overallSystemRiskScore}%</h4>
                    <p className="text-[10px] text-slate-300 font-semibold truncate">
                      {overallSystemRiskScore > 75 ? "🔴 Active Incident Scope" : overallSystemRiskScore > 40 ? "🟡 Investigation Mode" : "🟢 Baseline Restored"}
                    </p>
                  </div>
                </div>

                {/* 2. High-Risk Claims */}
                <div className="bg-white border rounded-xl p-4 select-none flex flex-col justify-between min-h-[110px] shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">High-Risk Claims</span>
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-950 tracking-tight">
                      {localClaimsState.filter(c => c.riskScore > 70 && c.auditDecision === "Pending").length}
                    </h4>
                    <p className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 inline-block mt-1">
                      ⚠️ Audit Pending
                    </p>
                  </div>
                </div>

                {/* 3. Duplicate Admissions */}
                <div className="bg-white border rounded-xl p-4 select-none flex flex-col justify-between min-h-[110px] shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Duplicate Admissions</span>
                    <Layers className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-950 tracking-tight">
                      {duplicateAdmissionsList.filter(d => d.status !== "Resolved").length}
                    </h4>
                    <span className="text-[10px] text-indigo-850 font-bold bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 inline-block mt-1">
                      🗂️ ABDM Dual overlap
                    </span>
                  </div>
                </div>

                {/* 4. Excessive Diagnostics */}
                <div className="bg-white border rounded-xl p-4 select-none flex flex-col justify-between min-h-[110px] shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Excessive Panels</span>
                    <HeartPulse className="h-4 w-4 text-cyan-650 text-cyan-550" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-950 tracking-tight">
                      {excessiveDiagnosticsList.filter(e => !e.justified).length}
                    </h4>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1">
                      🚨 Redundant Orders
                    </span>
                  </div>
                </div>

                {/* 5. Implant Anomalies */}
                <div className="bg-white border rounded-xl p-4 select-none flex flex-col justify-between min-h-[110px] shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">CDSCO Violations</span>
                    <Cpu className="h-4 w-4 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-950 tracking-tight">
                      {implantLifecycleList.filter(imp => !imp.certified).length}
                    </h4>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 inline-block mt-1 font-bold">
                      🔴 Validation Breach
                    </span>
                  </div>
                </div>

                {/* 6. Health Integrity Score */}
                <div className="bg-[#003580] text-white border border-[#002b66] p-4 rounded-xl select-none flex flex-col justify-between min-h-[110px] shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-indigo-200 font-extrabold uppercase tracking-wide">National Integrity</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight text-emerald-300">96.5%</h4>
                    <p className="text-[9px] text-indigo-100 font-mono">Benchmark Tier: Excellent</p>
                  </div>
                </div>
              </div>


              {/* Navigation Selector Row for specialized dashboards */}
              <div className="bg-slate-50 border p-1 rounded-xl flex flex-wrap gap-1 select-none">
                <button
                  onClick={() => setFraudSubDashboard("claims_audit")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "claims_audit" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 text-indigo-600" />
                  <span>High-Risk Claims Audit ({localClaimsState.filter(c => c.riskScore > 70).length})</span>
                </button>
                
                <button
                  onClick={() => setFraudSubDashboard("duplicate_admissions")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "duplicate_admissions" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-rose-500" />
                  <span>Duplicate Admissions ({duplicateAdmissionsList.length})</span>
                </button>

                <button
                  onClick={() => setFraudSubDashboard("excessive_diagnostics")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "excessive_diagnostics" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <HeartPulse className="h-3.5 w-3.5 text-amber-500" />
                  <span>Excessive Diagnostics ({excessiveDiagnosticsList.length})</span>
                </button>

                <button
                  onClick={() => setFraudSubDashboard("implant_anomalies")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "implant_anomalies" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                  <span>CDSCO Implant Anomalies ({implantLifecycleList.filter(i => !i.certified).length} alerts)</span>
                </button>

                <button
                  onClick={() => setFraudSubDashboard("doctor_risk_index")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "doctor_risk_index" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Doctor Risk Index ({doctorRiskList.filter(d => d.status.includes("Watch")).length} Flagged)</span>
                </button>

                <button
                  onClick={() => setFraudSubDashboard("dept_heatmap")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    fraudSubDashboard === "dept_heatmap" ? "bg-white text-slate-950 shadow-xs border border-slate-250" : "text-slate-650 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5 text-purple-650 text-purple-555" />
                  <span>Dept Fraud Heatmap</span>
                </button>
              </div>


              {/* INTERACTIVE COMPONENT SWITCHER */}

              {/* VIEW 1: HIGH-RISK CLAIMS AUDIT */}
              {fraudSubDashboard === "claims_audit" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Claims List */}
                  <div className="lg:col-span-8 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 select-none">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-[#003580]" /> Dynamic Risk Assessment Registry
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Click on any record below to run an itemized micro-audit, check biological files, and dispatch decisions.
                        </p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                        Live DB Auditing Enabled • Real-Time Escrows
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                            <th className="p-3">Claim Ref</th>
                            <th className="p-3">Beneficiary UHID</th>
                            <th className="p-3">Billed Package</th>
                            <th className="p-3 text-right">Cost</th>
                            <th className="p-3 text-center">Threat Index</th>
                            <th className="p-3 text-center">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-semibold">
                          {localClaimsState.map((cl) => {
                            const isHigh = cl.riskScore > 70;
                            const isMedium = cl.riskScore > 40 && cl.riskScore <= 70;

                            return (
                              <tr 
                                key={cl.id} 
                                className="hover:bg-indigo-50/20 cursor-pointer transition active:bg-indigo-50/50"
                                onClick={() => setClaimDetailsModal(cl)}
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-[10px] text-slate-900 font-bold">{cl.id}</span>
                                    {cl.riskScore > 70 && cl.auditDecision === "Pending" && (
                                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="block text-slate-800 text-xs font-extrabold">{cl.patientName}</span>
                                  <span className="text-[9px] text-slate-400 font-mono block">{cl.patientId}</span>
                                </td>
                                <td className="p-3 truncate max-w-[180px]">
                                  <span className="block text-slate-700">{cl.procedureName}</span>
                                  <span className="text-[9px] text-indigo-700 font-medium font-mono">{cl.procedureCode}</span>
                                </td>
                                <td className="p-3 text-right text-slate-900 font-black font-mono">
                                  ₹{cl.packageCost?.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex flex-col items-center max-w-[80px] mx-auto">
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${cl.riskScore}%` }}
                                      />
                                    </div>
                                    <span className={`text-[9px] font-bold mt-0.5 ${isHigh ? "text-rose-600" : isMedium ? "text-amber-600" : "text-emerald-600"}`}>
                                      {cl.riskScore}% {isHigh ? "Critical" : isMedium ? "Warning" : "Safe"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold tracking-tight ${
                                    cl.auditDecision === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                                    cl.auditDecision === "Flagged" ? "bg-rose-50 text-rose-700 border border-rose-150" :
                                    cl.auditDecision === "Under-Audit" ? "bg-indigo-50 text-indigo-700 border border-indigo-150" :
                                    "bg-slate-100 text-slate-600 border border-slate-200"
                                  }`}>
                                    {cl.auditDecision === "Pending" ? "⏳ Unaudited" : cl.auditDecision}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-rose-50/40 border border-rose-150 p-3 rounded-lg flex items-start gap-2.5 select-none">
                      <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black text-rose-900 uppercase block">Inspector Manual Guidelines</span>
                        <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                          Clicking a candidate initializes the Central Health Locker verification bundle. Verify clinical diagnostic notes against scheduled implant barcoding criteria before releasing state reserve payments.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual Breakdown Charts */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Risk Indicators Analysis Chart */}
                    <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="border-b pb-2 select-none flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Distribution Drivers</span>
                        <Sliders className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      
                      <div className="space-y-3 font-semibold text-xs text-slate-705">
                        <span className="text-[10px] text-slate-400 block font-bold">DRIVER DEVIATION RATIOS:</span>
                        
                        {/* Driver 1: Upcoding */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>Cost Inflation &amp; Upcoding</span>
                            <span className="font-mono text-indigo-700">45% Volume</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: "45%" }} />
                          </div>
                        </div>

                        {/* Driver 2: Concurrent/Duplicate stays */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>Duplicate Admissions Interval</span>
                            <span className="font-mono text-rose-650">25% Volume</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full" style={{ width: "25%" }} />
                          </div>
                        </div>

                        {/* Driver 3: Uncertified medical implants */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>CDSCO Implant Catalog Clash</span>
                            <span className="font-mono text-amber-650">20% Volume</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: "20%" }} />
                          </div>
                        </div>

                        {/* Driver 4: Age/demographics clashes */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>Demographic Age-Gender Clashes</span>
                            <span className="font-mono text-emerald-750">10% Volume</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: "10%" }} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-3 text-[10px] space-y-1 select-none text-slate-600">
                        <span className="font-black text-slate-800 uppercase block">Engine Context</span>
                        <p className="leading-relaxed">
                          The National Health Authority (NHA) uses heuristic deep scanning comparing diagnostic ICD codes against biological variables registered on central Patient Health Lockers.
                        </p>
                      </div>
                    </div>

                    {/* Threat evaluation details panel */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl p-5 shadow-md relative overflow-hidden select-none">
                      <div className="space-y-3 relative z-10">
                        <span className="text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 px-2.5 py-0.5 rounded font-bold uppercase">
                          HEURISTIC THREAT SCANNERS
                        </span>
                        <h4 className="font-black text-sm tracking-tight text-white">Dynamic AI Sandbox Rules</h4>
                        <p className="text-[10.5px] text-slate-300 leading-normal">
                          The system aggregates CDSCO manufacturer logs, HPR prescribing indexes, and hospital admissions logs to assign an immediate threat indicator before settlement release.
                        </p>
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Escrow Release Ratio:</span>
                          <span className="text-emerald-400 font-bold">12 / 16 Approved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* VIEW 2: OVERLAPPING DUPLICATE ADMISSIONS */}
              {fraudSubDashboard === "duplicate_admissions" && (
                <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 select-none">
                    <div>
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-tight flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-rose-500 animate-pulse" /> Overlapping Hospital Stays (Duplicate Admissions)
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Identifies cases where identical Patient UHIDs are flagged in active bed slots across concurrent therapeutic intervals, a strict ABDM regulatory breach.
                      </p>
                    </div>
                    <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      Duplicate Admission Warning Set
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                          <th className="p-3">Reference ID</th>
                          <th className="p-3">Beneficiary Account</th>
                          <th className="p-3">Primary Host Hospital &amp; Bed</th>
                          <th className="p-3">Conflicting Concurrent Entry</th>
                          <th className="p-3 text-center">Clash Span</th>
                          <th className="p-3 text-center">Risk Factor</th>
                          <th className="p-3 text-right">Audit Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {duplicateAdmissionsList.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-[10.5px] font-bold text-slate-900">{d.id}</td>
                            <td className="p-3">
                              <span className="block text-slate-800 text-xs font-extrabold">{d.patientName}</span>
                              <span className="text-[9px] text-slate-400 font-mono block">{d.patientId}</span>
                            </td>
                            <td className="p-3 text-[11px]">
                              <span className="block text-slate-700">{d.admission1.host}</span>
                              <span className="text-[9.5px] text-indigo-700 font-mono block">{d.admission1.ward} • {d.admission1.doc}</span>
                              <span className="text-[9px] text-slate-450 text-slate-400 block">{d.admission1.period}</span>
                            </td>
                            <td className="p-3 text-[11px] bg-rose-50/20">
                              <span className="block text-rose-950 font-bold">{d.admission2.host}</span>
                              <span className="text-[9.5px] text-rose-700 font-mono block">{d.admission2.ward} • {d.admission2.doc}</span>
                              <span className="text-[9px] text-slate-450 text-slate-400 block">{d.admission2.period}</span>
                            </td>
                            <td className="p-3 text-center font-bold font-mono text-slate-800 bg-rose-50/40">
                              {d.overlappingDays} Overlapping Days
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                d.riskLevel === "CRITICAL" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                                d.riskLevel === "HIGH RISK" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {d.riskLevel}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex flex-col sm:flex-row justify-end gap-1.5">
                                {d.status === "Investigating" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setDuplicateAdmissionsList(prev => prev.map(item => item.id === d.id ? { ...item, status: "Resolved", riskLevel: "RESOLVED" } : item));
                                        alert("Settle and consolidate both patient claims profiles! Escrow holds released.");
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer transition select-none"
                                    >
                                      Consolidate Claims
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDuplicateAdmissionsList(prev => prev.map(item => item.id === d.id ? { ...item, status: "Quarantined", riskLevel: "PENALIZED" } : item));
                                        alert("Claim flagged to National NHA fraud ledger! Penalized audit logged.");
                                      }}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer transition select-none"
                                    >
                                      Flag Offense
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 rounded px-2 py-0.5 select-none">
                                    ✓ Action Taken: {d.riskLevel}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* VIEW 3: EXCESSIVE DIAGNOSTICS */}
              {fraudSubDashboard === "excessive_diagnostics" && (
                <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 select-none">
                    <div>
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-tight flex items-center gap-1.5">
                        <HeartPulse className="h-4 w-4 text-[#003580]" /> Excessive &amp; Redundant Clinical Diagnostics Scanner
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Identifies hospitals submitting repetitive lab or advanced radiological panels on identical UHID profiles within narrow 12 to 48-hour therapeutic windows without documented trauma flags.
                      </p>
                    </div>
                    <span className="text-[9px] bg-slate-100 border text-slate-650 px-2 py-0.5 rounded font-mono font-bold uppercase">
                      Diagnostic Sweep Status: Live
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                          <th className="p-3">Security ID</th>
                          <th className="p-3">Patient Beneficiary</th>
                          <th className="p-3">Flagged Redundant Procedure</th>
                          <th className="p-3">Repetition Count</th>
                          <th className="p-3">Temporal window</th>
                          <th className="p-3 text-right">Potential Billing Waste</th>
                          <th className="p-3 text-center">Threat Rating</th>
                          <th className="p-3 text-right">Audit Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {excessiveDiagnosticsList.map((exc) => (
                          <tr key={exc.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-[10.5px] font-bold text-slate-900">{exc.id}</td>
                            <td className="p-3">
                              <span className="block text-slate-800 text-xs font-extrabold">{exc.patientName}</span>
                              <span className="text-[9px] text-slate-400 font-mono block">{exc.patientId}</span>
                            </td>
                            <td className="p-3 text-[11px] text-slate-700">
                              <span className="block text-slate-800 font-bold">{exc.testName}</span>
                              <span className="text-[9px] text-slate-400 font-mono block">Dept: {exc.department}</span>
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">
                                {exc.runCount} Runs Recorded
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px]">
                              {exc.timeWindow}
                            </td>
                            <td className="p-3 text-right text-slate-800 font-black font-mono">
                              ₹{exc.costWaste?.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                                exc.riskScore > 80 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {exc.riskScore}% Threat
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {exc.status === "Flagged" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setExcessiveDiagnosticsList(prev => prev.map(i => i.id === exc.id ? { ...i, status: "Justified-Dismissed", justified: true } : i));
                                        alert("Redundancy justified in clinical notes (critical trauma tracking). Risk flagged dismissed.");
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer select-none transition"
                                    >
                                      Justify &amp; Dismiss
                                    </button>
                                    <button
                                      onClick={() => {
                                        setExcessiveDiagnosticsList(prev => prev.map(i => i.id === exc.id ? { ...i, status: "Fined-Recovered", justified: false } : i));
                                        alert("Billing waste identified! Excess diagnostics cost has been logged as a recovery fine on hospital escrow account.");
                                      }}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer select-none transition"
                                    >
                                      Issue Fine
                                    </button>
                                  </>
                                ) : (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${exc.status.includes("Justified") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                    {exc.status}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* VIEW 4: CDSCO IMPLANT ANOMALIES */}
              {fraudSubDashboard === "implant_anomalies" && (
                <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 select-none">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-emerald-600" /> CDSCO Medical Implant Device Safety Registry
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Tracks and verifies medical implants logged under PM-JAY packages with CDSCO central manufacturer databases to verify device trace chain legitimacy.
                      </p>
                    </div>
                    <span className="text-[9px] bg-rose-50 border border-rose-150 text-rose-700 px-2.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      Surveillance Target Active: 1 Clashing Implant Batch
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                          <th className="p-3">Device ID</th>
                          <th className="p-3">Device Name</th>
                          <th className="p-3">CDSCO Registry ID</th>
                          <th className="p-3">Batch Serial</th>
                          <th className="p-3">Affiliated UHID</th>
                          <th className="p-3 text-right">Device Cost</th>
                          <th className="p-3 text-center">CDSCO Safe Code</th>
                          <th className="p-3 text-right">Audit Action Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {implantLifecycleList.map((imp) => (
                          <tr key={imp.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-[10.5px] font-bold text-slate-950">{imp.id}</td>
                            <td className="p-3 text-[11px] text-slate-800 font-bold">{imp.name}</td>
                            <td className="p-3 font-mono text-slate-600">{imp.cdscoReg}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${imp.certified ? "bg-slate-100 text-slate-800" : "bg-rose-100 text-rose-800 animate-pulse"}`}>
                                {imp.batch}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="block text-slate-850">{imp.patientName}</span>
                              <span className="text-[9px] text-slate-400 font-mono block">{imp.uhid}</span>
                            </td>
                            <td className="p-3 text-right text-slate-900 font-black font-mono">
                              ₹{imp.cost?.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              {imp.certified ? (
                                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 inline-block text-[9.5px]">
                                  ● Certified &amp; Matched
                                </span>
                              ) : (
                                <span className="text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-150 inline-block text-[9.5px]">
                                  ⚠ Unverified / Repurposed
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {!imp.certified ? (
                                <button
                                  onClick={() => {
                                    setImplantLifecycleList(prev => prev.map(item => item.id === imp.id ? { ...item, certified: true, status: "In-Situ (Active)" } : item));
                                    alert("Query dispatched to Medtronic CDSCO database! Certificate validated in escrow.");
                                  }}
                                  className="bg-[#003580] hover:bg-indigo-900 text-white font-extrabold text-[9.5px] py-1 px-3 rounded cursor-pointer select-none transition"
                                >
                                  Authenticate CDSCO Manual Code
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">✓ Secured Integrity Chain</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* VIEW 5: DOCTOR RISK INDEX */}
              {fraudSubDashboard === "doctor_risk_index" && (
                <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs select-none">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                    <div>
                      <h4 className="text-xs font-black text-[#003580] uppercase tracking-tight flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-cyan-650" /> Practitioner Regulatory Risk &amp; Compliance Index
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        NHA Central Registry scoring on clinical practitioners based on consultation spikes, surgery-exclusion limits, and uncertified device billing alerts.
                      </p>
                    </div>
                    <span className="text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      HPR Central Audit Tracking Enabled
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                          <th className="p-3">HPR ID</th>
                          <th className="p-3">Practitioner Details</th>
                          <th className="p-3">Specialty</th>
                          <th className="p-3 text-center">Daily OPD Volume</th>
                          <th className="p-3 text-center">Billed Risk Ratio</th>
                          <th className="p-3 text-center">Avg Claims Risk Code</th>
                          <th className="p-3">Integrity Violation Notes</th>
                          <th className="p-3 text-center">Active Status</th>
                          <th className="p-3 text-right">Regulatory Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {doctorRiskList.map((doc) => {
                          const isAlert = doc.status.includes("Watch");
                          const isCompliant = doc.status.includes("Compliant") || doc.status.includes("Standard");

                          return (
                            <tr key={doc.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-[10px] text-slate-700">{doc.id}</td>
                              <td className="p-3">
                                <span className="block text-slate-900 text-xs font-extrabold">{doc.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono block">ABDM: {doc.abdmNumber}</span>
                              </td>
                              <td className="p-3 text-slate-600">{doc.specialty}</td>
                              <td className="p-3 text-center font-bold font-mono text-slate-800">{doc.dailyVisits} visits/day</td>
                              <td className="p-3 text-center font-bold text-rose-650 font-mono">{doc.riskClaimPercentage}% Claims Flagged</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                  doc.avgRiskScore > 60 ? "bg-rose-50 text-rose-600 border border-rose-150" :
                                  doc.avgRiskScore > 30 ? "bg-amber-50 text-amber-600 border border-amber-150" :
                                  "bg-emerald-50 text-emerald-600 border border-emerald-150"
                                }`}>
                                  {doc.avgRiskScore}% Risk
                                </span>
                              </td>
                              <td className="p-3 text-[10.5px] text-slate-500 max-w-[200px] leading-snug">
                                {doc.reason}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${
                                  isAlert ? "bg-rose-50 text-rose-700 border border-rose-150" :
                                  isCompliant ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                                  "bg-amber-50 text-amber-700 border border-amber-150"
                                }`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {isAlert ? (
                                  <button
                                    onClick={() => {
                                      setDoctorRiskList(prev => prev.map(item => item.id === doc.id ? { ...item, status: "Under Surveillance", avgRiskScore: 40 } : item));
                                      alert("Prescription audit locked. All claims of this clinician logged into secondary verification queue.");
                                    }}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer select-none transition"
                                  >
                                    Enforce Audit Hook
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      alert("Practice profile index validated. Audited historical case notes mapped compliant with NHA registry standards.");
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[9.5px] py-1 px-2.5 rounded cursor-pointer select-none transition border"
                                  >
                                    Verify Dossier
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* VIEW 6: DEPARTMENT FRAUD HEATMAP */}
              {fraudSubDashboard === "dept_heatmap" && (
                <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs select-none">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                    <div>
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-tight flex items-center gap-1.5">
                        <BarChart2 className="h-4 w-4 text-[#003580]" /> Clinical Departmental Risk and Claims Heatmap
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Aggregates claiming volumes, cumulative billing totals, and active fraud trigger weights across individual clinical specialties.
                      </p>
                    </div>
                    <span className="text-[9px] bg-slate-100 border text-slate-650 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      Heatmap Core: Multi-Factor Weighted
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentHeatmapList.map((dept) => {
                      const isHigh = dept.avgRiskScore > 65;
                      const isMedium = dept.avgRiskScore > 35 && dept.avgRiskScore <= 65;

                      return (
                        <div 
                          key={dept.code} 
                          className={`p-5 rounded-2xl border text-slate-900 space-y-3 transition transform hover:-translate-y-0.5 duration-150 hover:shadow-md ${dept.colorClass}`}
                        >
                          <div className="flex justify-between items-start border-b border-black/10 pb-2">
                            <div>
                              <span className="text-[9.5px] font-mono font-bold block opacity-60 uppercase">{dept.code}</span>
                              <h5 className="font-extrabold text-base tracking-tight leading-tight">{dept.name}</h5>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                              isHigh ? "bg-rose-600 text-white" :
                              isMedium ? "bg-amber-650 text-[#543b00] bg-amber-500/30" :
                              "bg-emerald-600 text-white"
                            }`}>
                              {dept.label}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* Score Display */}
                            <div className="flex justify-between items-baseline text-xs font-semibold">
                              <span className="opacity-75">Avg Risk Indicator Score</span>
                              <strong className="text-lg font-black font-mono leading-none">{dept.avgRiskScore}%</strong>
                            </div>

                            {/* Claims Count Display */}
                            <div className="flex justify-between text-[11px] font-semibold opacity-85">
                              <span>Total Monthly Claims Scanned</span>
                              <span className="font-mono">{dept.claimCount} claims</span>
                            </div>

                            {/* Cost Billed Volume */}
                            <div className="flex justify-between text-[11.5px] font-black border-t border-black/5 pt-2">
                              <span>Audit Claim Exposure</span>
                              <span className="font-mono text-xs">₹{dept.billedAmount?.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-1.5">
                            <button
                              onClick={() => {
                                alert(`Initializing deep forensic EMR audit scans for ${dept.name}...\nScanned claims: ${dept.claimCount} files.\nOutcome: Identified suspicious upcoding patterns logged across ${isHigh ? "3" : "0"} orthopedic surgical catalogs.`);
                              }}
                              className={`w-full py-1.5 rounded text-[10.5px] font-extrabold tracking-tight transition cursor-pointer select-none border text-center ${
                                isHigh ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-700" :
                                isMedium ? "bg-amber-600 hover:bg-amber-750 text-white border-amber-650" :
                                "bg-white hover:bg-slate-100 text-slate-800 border-slate-350"
                              }`}
                            >
                              Run Deep Forensic Analysis
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* INTERACTIVE POPUP / MICRO-AUDIT DRAWER MODAL FOR CLAIMS */}
              {claimDetailsModal && (
                <div 
                  className="fixed inset-0 bg-slate-950/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
                  id="claim-audit-detail-drawer"
                >
                  <div className="bg-white border rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={() => setClaimDetailsModal(null)}
                      className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer font-bold text-xs"
                    >
                      ✕
                    </button>

                    <div className="border-b pb-3 space-y-1">
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded font-mono border border-rose-150 inline-block uppercase">
                        ABDM Secure Audit Sandbox • Case {claimDetailsModal.id}
                      </span>
                      <h4 className="text-lg font-black text-slate-950 tracking-tight">
                        Audit File: {claimDetailsModal.patientName} ({claimDetailsModal.patientId})
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Registered with cash-reimbursable PM-JAY package procedure code <strong className="text-indigo-850 font-semibold">{claimDetailsModal.procedureCode}</strong>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Metadata */}
                      <div className="space-y-3 text-xs bg-slate-50 p-3.5 rounded-xl border font-semibold">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase block tracking-wider">Demographic &amp; Financial Dossier</span>
                        
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Total Billed Cost</span>
                          <strong className="text-slate-900 font-black font-mono">₹{claimDetailsModal.packageCost?.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Ayushman Card Number</span>
                          <strong className="text-slate-900 font-mono text-[10.5px]">{claimDetailsModal.pmjayId || "NHA-9042-X10"}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Submission Date Code</span>
                          <strong className="text-slate-900 font-mono">{claimDetailsModal.submissionDate || "2026-05-28"}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Pre-Auth Claim State</span>
                          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px] leading-tight">
                            {claimDetailsModal.preAuthStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Overall Threat Rating</span>
                          <strong className="text-rose-650 font-black font-mono text-[13px]">{claimDetailsModal.riskScore}%</strong>
                        </div>
                      </div>

                      {/* Right: Triggers */}
                      <div className="space-y-3">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase block tracking-wider select-none">Mutilated Custom Trigger Alerts</span>
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                          {claimDetailsModal.riskReasons ? (
                            claimDetailsModal.riskReasons.map((rsn: string, i: number) => (
                              <div key={i} className="bg-rose-50 border border-rose-100 p-2 rounded text-[10px] text-rose-950 font-semibold leading-relaxed flex items-start gap-1.5">
                                <span className="text-rose-500 shrink-0 mt-0.5">●</span>
                                <span>{rsn}</span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[10px]">
                              ● No severe risk indicators matched on first pass heuristic scan.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Change Audit Decision Option Panel */}
                    <div className="space-y-3 bg-indigo-50/30 border border-indigo-150 p-4 rounded-xl font-semibold">
                      <span className="text-[10px] font-black text-indigo-950 uppercase block select-none">Auditor Action Console</span>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {/* 1. Pending */}
                        <label className="flex items-center gap-1.5 bg-white border px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <input 
                            type="radio" 
                            name="decision" 
                            checked={claimDetailsModal.auditDecision === "Pending"} 
                            onChange={() => setClaimDetailsModal({ ...claimDetailsModal, auditDecision: "Pending" })}
                            className="cursor-pointer text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Keep Unaudited</span>
                        </label>

                        {/* 2. Approve */}
                        <label className="flex items-center gap-1.5 bg-white border px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 text-emerald-800">
                          <input 
                            type="radio" 
                            name="decision" 
                            checked={claimDetailsModal.auditDecision === "Approved"} 
                            onChange={() => setClaimDetailsModal({ ...claimDetailsModal, auditDecision: "Approved" })}
                            className="cursor-pointer text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Release Escrow Fund (Approve)</span>
                        </label>

                        {/* 3. Flag */}
                        <label className="flex items-center gap-1.5 bg-white border px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 text-rose-800">
                          <input 
                            type="radio" 
                            name="decision" 
                            checked={claimDetailsModal.auditDecision === "Flagged"} 
                            onChange={() => setClaimDetailsModal({ ...claimDetailsModal, auditDecision: "Flagged" })}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span>Quarantine and Penalize (Flag)</span>
                        </label>

                        {/* 4. Under Audit */}
                        <label className="flex items-center gap-1.5 bg-white border px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 text-indigo-900">
                          <input 
                            type="radio" 
                            name="decision" 
                            checked={claimDetailsModal.auditDecision === "Under-Audit"} 
                            onChange={() => setClaimDetailsModal({ ...claimDetailsModal, auditDecision: "Under-Audit" })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Submit Clinical Query</span>
                        </label>
                      </div>

                      {/* Text notes */}
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-500 uppercase font-extrabold select-none">Auditor Review Statement Notes</label>
                        <textarea 
                          value={claimDetailsModal.notes || ""}
                          onChange={(e) => setClaimDetailsModal({ ...claimDetailsModal, notes: e.target.value })}
                          placeholder="Type specific EMR discrepancies, photo biometric mismatch details, or justify the clinical exceptions..."
                          className="w-full bg-white border rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden min-h-[50px] font-medium"
                        />
                      </div>
                    </div>

                    {/* Submit Audit Action Button */}
                    <div className="flex justify-end gap-2 text-xs">
                      <button 
                        onClick={() => setClaimDetailsModal(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-3.5 py-2 rounded-lg cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setLocalClaimsState(prev => prev.map(cl => cl.id === claimDetailsModal.id ? claimDetailsModal : cl));
                          // Slightly adjust system risk score depending on action
                          if (claimDetailsModal.auditDecision === "Approved") {
                            setOverallSystemRiskScore(prev => Math.max(10, prev - 6));
                          } else if (claimDetailsModal.auditDecision === "Flagged") {
                            setOverallSystemRiskScore(prev => Math.min(99, prev + 8));
                          }
                          setClaimDetailsModal(null);
                          alert("Clinical audit finalized securely! Local escrow parameters synchronized.");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-lg cursor-pointer shadow-sm select-none transition"
                      >
                        Save Audit Status Code
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {activeFraudTab === "rules" && (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 select-none">
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                      ⚙️ Rule-Based Anti-Fraud Engine Control Center
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Customize local operational boundaries. Toggled rules are re-evaluated live matching hospital transaction records.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsAnalyzingFraud(true);
                      setTimeout(() => {
                        setIsAnalyzingFraud(false);
                        setFraudAuditRunCount(p => p + 1);
                        setOverallSystemRiskScore(Math.floor(25 + Math.random() * 20));
                        alert("Rule-Engine Re-evaluation complete!\nLive records scanned: 25\nRule alterations deployed: Yes\nSystem Risk Level Adjusted.");
                      }, 1200);
                    }}
                    disabled={isAnalyzingFraud}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:bg-slate-300 cursor-pointer select-none"
                  >
                    {isAnalyzingFraud ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Scanning Database...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Run Live DB Rule Audit Scan
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
                    <span className="text-[10.5px] font-black text-[#003580] uppercase block border-b pb-1">
                      🔧 Advanced Engine Configurations
                    </span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Max Consultations Cap per Practitioner (Daily)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="20"
                            max="60"
                            value={fraudRules[0].limit}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setFraudRules(prev => prev.map(r => r.id === "FR-01" ? { ...r, limit: val } : r));
                            }}
                            className="w-full"
                          />
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white border px-2 py-0.5 rounded leading-none shrink-0 border-slate-200">
                            {fraudRules[0].limit} visits
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Post-Discharge Procedure Exclusion Buffer
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="7"
                            value={fraudRules[1].limit}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setFraudRules(prev => prev.map(r => r.id === "FR-02" ? { ...r, limit: val } : r));
                            }}
                            className="w-full"
                          />
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white border px-2 py-0.5 rounded leading-none shrink-0 border-slate-200">
                            {fraudRules[1].limit} days
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Antibiotic Threshold Limit (Schedule H1 Volume)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="100"
                            max="400"
                            step="50"
                            value={fraudRules[6].limit}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setFraudRules(prev => prev.map(r => r.id === "FR-07" ? { ...r, limit: val } : r));
                            }}
                            className="w-full"
                          />
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white border px-2 py-0.5 rounded leading-none shrink-0 border-slate-200">
                            {fraudRules[6].limit}% Guideline
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/5 p-4 rounded-xl border border-indigo-100 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10.5px] font-black text-indigo-905 text-indigo-900 uppercase block">
                        🛡️ Engine Enforcement Directives
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        When a rule triggers, the sandbox isolates the submission immediately:
                      </p>
                      <ul className="text-[11px] text-slate-500 font-mono space-y-1 pl-1">
                        <li>• Hard rejection applied to FR-03, FR-05 modules.</li>
                        <li>• Yellow pending flags dispatched to FR-01, FR-02 cases.</li>
                        <li>• System integrity log dispatched with Attending Practitioner details.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white border rounded p-2.5 flex items-center justify-between text-[10.5px]">
                      <span className="font-mono font-bold text-slate-500">Integrity Signature:</span>
                      <span className="font-mono font-black text-[#003580]">HMAC-SHA256-OK</span>
                    </div>
                  </div>
                </div>

                {/* Rules Toggles Table */}
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                        <th className="p-3">Rule Reference</th>
                        <th className="p-3">Audit Rule Objective &amp; Details</th>
                        <th className="p-3">Enrolled Limit</th>
                        <th className="p-3">Triggers Mapped</th>
                        <th className="p-3 text-center">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-semibold">
                      {fraudRules.map((ru) => (
                        <tr key={ru.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-[#003580]">{ru.id}</td>
                          <td className="p-3 max-w-sm">
                            <span className="block text-slate-900 font-extrabold">{ru.name}</span>
                            <span className="text-[10px] text-slate-450 text-slate-500 leading-normal block font-medium mt-0.5">{ru.desc}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-705">
                            {ru.limit} <span className="text-[10px] text-slate-400 font-sans">{ru.unit}</span>
                          </td>
                          <td className="p-3 font-mono text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${ru.count > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
                              {ru.count} Flags
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={ru.status}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFraudRules(prev => prev.map(r => r.id === ru.id ? { ...r, status: val } : r));
                              }}
                              className="bg-white border rounded px-2.5 py-1 text-[11px] font-bold text-slate-750 focus:outline-hidden hover:border-slate-355 cursor-pointer leading-none"
                            >
                              <option value="Active">🟢 Active Enforcement</option>
                              <option value="Warning">🟡 Warning Warning Only</option>
                              <option value="Suppressed">⚪ Suppressed Off</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeFraudTab === "ai_anomaly" && (
            <div className="space-y-6">
              {/* AI Anomaly Panel */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 select-none">
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" /> Unsupervised Cognitive AI Anomaly Detector
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Deep learning vectors isolating high-dimensional EMR and claim discrepancies using density metrics.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsAnalyzingAi(true);
                      setTimeout(() => {
                        setIsAnalyzingAi(false);
                        const seed = {
                          time: new Date().toISOString().replace("T", " ").substring(0, 19) + "Z",
                          category: "Cognitive Vector Alert",
                          msg: "Isolation score exceeded threshold (0.91): Attending Dr. Sharma submitted overlapping claims for cardiac rehabilitation exercises totaling ₹95,000 for Patient " + (patients[0]?.name || "Ramesh"),
                          isolationScore: 0.92
                        };
                        setAiAnomalyLogsState(prev => [seed, ...prev]);
                        setOverallSystemRiskScore(p => Math.min(100, p + 8));
                      }, 1500);
                    }}
                    disabled={isAnalyzingAi}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:bg-slate-300 cursor-pointer select-none"
                  >
                    {isAnalyzingAi ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Generating Clustering Projections...
                      </>
                    ) : (
                      <>
                        <Cpu className="h-3.5 w-3.5 animate-pulse" />
                        Trigger Deep AI Isolation Forest Scan
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated Scatter Telemetry Map */}
                <div className="bg-slate-900 border text-slate-100 p-5 rounded-xl space-y-3 select-none">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>2D Vector Space Projection (PCA Dimensionality Reduction)</span>
                    <span className="text-emerald-400">Stable Clustering Engine Online</span>
                  </div>
                  
                  <div className="h-36 bg-slate-950/80 border border-slate-800 rounded-lg relative flex items-center justify-center overflow-hidden">
                    {/* Simulated plot points rendering */}
                    <div className="absolute left-[20%] top-[40%] h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                    <div className="absolute left-[20%] top-[40%] h-2 w-2 rounded-full bg-indigo-600"></div>
                    
                    <div className="absolute left-[45%] top-[70%] h-2 w-2 rounded-full bg-indigo-600"></div>
                    <div className="absolute left-[65%] top-[25%] h-2 w-2 rounded-full bg-indigo-600"></div>
                    <div className="absolute left-[15%] top-[80%] h-2 w-2 rounded-full bg-indigo-600"></div>
                    <div className="absolute left-[80%] top-[60%] h-2 w-2 rounded-full bg-indigo-600"></div>
                    
                    {/* Outlier Points */}
                    <div className="absolute right-[15%] top-[20%] h-3.5 w-3.5 rounded-full bg-rose-500/30 animate-pulse flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                    </div>
                    <div className="absolute right-[12%] top-[22%] text-[9px] font-bold font-mono text-rose-450 text-rose-400">
                      Anomaly Vector-891
                    </div>

                    <div className="absolute right-[30%] top-[85%] h-3.5 w-3.5 rounded-full bg-rose-500/30 animate-pulse flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                    </div>
                    <div className="absolute right-[27%] top-[87%] text-[9px] font-bold font-mono text-rose-450 text-rose-400">
                      Upcoding Cluster-2
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono text-center">
                      Dense centers depict compliant claims. Scatter points on periphery indicate outlying data.
                    </span>
                  </div>
                </div>

                {/* AI Log List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                    📝 Cognitive Deep Scan Real-Time Alert Log
                  </span>
                  
                  <div className="space-y-2 max-h-72 overflow-y-auto style-scroll">
                    {aiAnomalyLogsState.map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 transition-colors flex items-start justify-between gap-3 text-xs leading-relaxed font-semibold">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 rounded-md">
                              {log.category}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-mono font-medium">
                              {log.time}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {log.msg}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded block">
                            Score: {log.isolationScore}
                          </span>
                          <span className="text-[8.5px] text-slate-400 block font-bold uppercase mt-1">
                            outlier index
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFraudTab === "clinical_val" && (
            <div className="space-y-6">
              {/* Clinical Validation Engine Panel */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b pb-3 select-none">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                    🩺 Clinical Validation Engine &amp; Coding Audits
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Automatic clinical coding validation verifying match between clinical ICD diagnoses, inpatient admissions records, and billing package specifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-center space-y-1 shadow-3xs">
                    <span className="text-emerald-700 font-black text-xl">100%</span>
                    <strong className="text-slate-800 text-xs block font-bold">Standard ICD-10 Mapped</strong>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-xs mx-auto">
                      All consultation diagnoses are mapped to official WHO ICD coding registers to block custom code fabrication.
                    </p>
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-150 text-center space-y-1 shadow-3xs">
                    <span className="text-indigo-705 text-indigo-700 font-black text-xl">CDSCO</span>
                    <strong className="text-slate-800 text-xs block font-bold">Implant Registration Check</strong>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-xs mx-auto">
                      All orthopaedic, ophthalmic, and cardiac implants are certified against CDSCO manufacturing batches.
                    </p>
                  </div>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-250 text-center space-y-1 shadow-3xs">
                    <span className="text-amber-805 text-amber-800 font-black text-xl">{clinicalViolationsList.length} Items</span>
                    <strong className="text-slate-800 text-xs block font-bold">Discrepancies Found</strong>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-xs mx-auto">
                      Active diagnostic check flags discrepant medical package associations. Immediate review recommended.
                    </p>
                  </div>
                </div>

                {/* List of active clinical violations */}
                <div className="space-y-3">
                  <span className="text-[10.5px] font-black text-slate-400 block uppercase tracking-wider select-none">
                    ⚠️ Active Clinical Integration Discrepancy Warnings
                  </span>

                  <div className="space-y-2.5">
                    {clinicalViolationsList.map((cv) => (
                      <div key={cv.id} className="p-4 bg-white hover:bg-slate-50/30 border border-slate-200 rounded-xl shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 select-none">
                            <span className="text-[9px] font-mono font-bold bg-slate-100 border text-slate-650 px-1.5 rounded-md">
                              {cv.id}
                            </span>
                            <span className="text-slate-900 font-black text-xs">
                              Patient: {cv.patient} ({cv.uhid})
                            </span>
                            <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-150 px-2 rounded-md">
                              {cv.severity}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                            <strong className="text-rose-700">Violation:</strong> {cv.mismatch}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 select-none">
                          <div className="text-right">
                            <span className="text-[11px] font-mono font-black text-slate-800 block">
                              Maturity Score: {cv.score}/100
                            </span>
                            <span className="text-[8.5px] text-slate-400 block font-bold uppercase mt-0.5">
                              mismatch severity
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setClinicalViolationsList(prev => prev.filter(item => item.id !== cv.id));
                              setOverallSystemRiskScore(p => Math.max(0, p - 5));
                              alert("Clinical discrepancy dismissed! Recalculating system threat thresholds.");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 border text-slate-700 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Mark Handled
                          </button>
                        </div>
                      </div>
                    ))}

                    {clinicalViolationsList.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed select-none">
                        <span className="text-xs text-slate-450 text-slate-500 font-bold block">No active clinical validation errors. Perfect EMR synchronization.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFraudTab === "package_gov" && (
            <div className="space-y-6">
              {/* Package Governance panel */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b pb-3 select-none">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                    ⚖️ NHA PM-JAY Package Governance &amp; Limit Checks
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Ensuring strict financial caps, mandatory pre-auth guidelines, and max hospital stay metrics mapped to active package indexes.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left checklist catalog */}
                  <div className="lg:col-span-7 space-y-3">
                    <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider select-none">
                      Approved Registry Package Cost Ceilings
                    </span>
                    <div className="divide-y border rounded-xl overflow-hidden shadow-3xs font-semibold">
                      {governedPackages.map((gp) => (
                        <div key={gp.code} className="p-3 bg-white hover:bg-slate-50 flex justify-between items-center text-xs gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-805 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-150">
                              {gp.code}
                            </span>
                            <span className="text-slate-800 font-bold block mt-1">{gp.name}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold leading-none">Workflow: {gp.workflowRequired}</span>
                          </div>

                          <div className="text-right font-mono select-none">
                            <span className="text-xs font-black text-slate-900 block">₹{gp.capCost.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-sans font-bold block">Max: {gp.maxDays} Bed Days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right package validator sandbox tool */}
                  <div className="lg:col-span-5 bg-slate-50 p-4.5 rounded-2xl border space-y-4 shadow-3xs">
                    <span className="text-[10.5px] font-black text-[#003580] uppercase block select-none">
                      🔍 Instant Claims Package Cost Audit Simulator
                    </span>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10.5px] text-slate-655 text-slate-600 font-bold mb-1">Target Package Code</label>
                        <select
                          id="pkg-gov-selector"
                          className="w-full bg-white border rounded-lg p-2.5 font-bold focus:outline-hidden text-slate-800"
                          onChange={(e) => {
                            const val = e.target.value;
                            // Reset test outcome
                            const found = governedPackages.find(p => p.code === val);
                            if (found) {
                              setComplianceNotes(`Verifying against baseline limits for ${found.name}.`);
                            }
                          }}
                        >
                          {governedPackages.map((gp) => (
                            <option key={gp.code} value={gp.code}>
                              [{gp.code}] - {gp.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] text-slate-655 text-slate-600 font-bold mb-1">Proposed Cost (₹)</label>
                          <input
                            type="number"
                            id="pkg-gov-cost"
                            defaultValue={20000}
                            placeholder="Enter amount to verify"
                            className="w-full bg-white border rounded-lg p-2 font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-slate-655 text-slate-600 font-bold mb-1">Stay Duration (Days)</label>
                          <input
                            type="number"
                            id="pkg-gov-days"
                            defaultValue={3}
                            placeholder="Days in bed"
                            className="w-full bg-white border rounded-lg p-2 font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const code = (document.getElementById("pkg-gov-selector") as HTMLSelectElement)?.value || "SG-05";
                          const proposedCost = parseInt((document.getElementById("pkg-gov-cost") as HTMLInputElement)?.value || "0");
                          const proposedDays = parseInt((document.getElementById("pkg-gov-days") as HTMLInputElement)?.value || "0");
                          
                          const targetObj = governedPackages.find(p => p.code === code);
                          if (targetObj) {
                            if (proposedCost > targetObj.capCost) {
                              alert(`🛑 GOVERNANCE REJECTION:\nProposed claim value ₹${proposedCost} surpasses NHA Registry Cost cap of ₹${targetObj.capCost} for package code [${code}]!\nRefund or adjust claim down.`);
                              setOverallSystemRiskScore(p => Math.min(100, p + 10));
                            } else if (proposedDays > targetObj.maxDays) {
                              alert(`⚠️ REGULATORY ALIGNMENT WARNING:\nBilled stay (${proposedDays} days) exceeds specified NHA limit (${targetObj.maxDays} days).\nMandatory ward utilization notes required.`);
                              setOverallSystemRiskScore(p => Math.min(100, p + 5));
                            } else {
                              alert(`✅ VERIFICATION PASSED:\nBilled parameters compliant with baseline NHA Package registry criteria.`);
                              setOverallSystemRiskScore(p => Math.max(0, p - 6));
                            }
                          }
                        }}
                        className="w-full bg-[#003580] hover:bg-[#002b66] text-white font-extrabold text-xs py-2.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer text-center select-none"
                      >
                        Run Package Limit Compliance Check
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFraudTab === "implants" && (
            <div className="space-y-6">
              {/* Implant lifecycle tracking panel */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b pb-3 select-none">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                    🧬 Permanent Implant Traceability Registry (CDSCO)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Tracks full procurement-to-recipient pipeline for permanent cardiac stents, hip joints, and intraocular lenses to eliminate counterfeit supply layers.
                  </p>
                </div>

                {/* Implant registry search & add-new grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                  {/* CDSCO Tracker lookup tool */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3.5">
                    <span className="text-[10.5px] font-black text-indigo-905 text-indigo-900 uppercase block">
                      🔎 Live CDSCO Registry Serial Authentication
                    </span>

                    <div className="space-y-2 text-xs flex gap-2">
                      <input
                        type="text"
                        placeholder="Type Implant Serial ... (e.g. IMP-LENS-390291)"
                        value={implantSearchId}
                        onChange={(e) => setImplantSearchId(e.target.value)}
                        className="flex-1 bg-white border rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-hidden"
                      />
                      <button
                        onClick={() => {
                          const found = implantLifecycleList.find(rec => rec.id.toLowerCase() === implantSearchId.trim().toLowerCase());
                          if (found) {
                            setImplantSearchResult(found);
                          } else {
                            setImplantSearchResult({
                              error: true,
                              id: implantSearchId,
                              msg: "WARNING: Implant Serial Number not discovered inside national warehouse ledger or certified customs list. Highly suspected black-market supply."
                            });
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 rounded-lg transition active:scale-95 cursor-pointer leading-none"
                      >
                        Verify API
                      </button>
                    </div>

                    {implantSearchResult && (
                      <div className="p-3 bg-white border rounded-lg space-y-2 font-semibold">
                        {implantSearchResult.error ? (
                          <div className="p-2 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 text-[11px] leading-relaxed">
                            <strong>{implantSearchResult.msg}</strong>
                            <span className="block mt-1 font-mono text-[9px] text-rose-500">Hash Checksum Error • Action Initiated</span>
                          </div>
                        ) : (
                          <div className="text-[11px] space-y-1.5 text-slate-700 font-mono">
                            <span className="text-emerald-700 font-black flex items-center gap-1 text-[10.5px] uppercase font-sans mb-1">
                              ✓ Certified authentic NHA CDSCO Implant Record
                            </span>
                            <div>• Device Name: <span className="font-bold text-slate-900">{implantSearchResult.name}</span></div>
                            <div>• Batch/Reg: <span className="text-slate-800">{implantSearchResult.batch} / {implantSearchResult.cdscoReg}</span></div>
                            <div>• Importer: <span className="text-slate-850">{implantSearchResult.manufacturer}</span></div>
                            <div>• Recipient Name: <span className="text-slate-900 font-bold">{implantSearchResult.patientName} ({implantSearchResult.uhid})</span></div>
                            <div>• Lifecycle Status: <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans text-[9px] font-bold uppercase">{implantSearchResult.status}</span></div>
                          </div>
                        )}
                        <button
                          onClick={() => setImplantSearchResult(null)}
                          className="text-[10px] text-slate-450 text-slate-400 font-bold hover:underline"
                        >
                          Clear lookup
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add Consumable Implant Register form */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 shadow-3xs space-y-3">
                    <span className="text-[10.5px] font-black text-slate-800 uppercase block">
                      📥 Log Certified Implant Recipient Mapping
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2.5 text-[10.5px]">
                      <div>
                        <label className="block text-slate-500 mb-0.5">Device Serial ID</label>
                        <input
                          type="text"
                          placeholder="e.g. IMP-PACER-552"
                          value={newImplantId}
                          onChange={(e) => setNewImplantId(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-bold font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Device Model Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Polyethylene Joint"
                          value={newImplantName}
                          onChange={(e) => setNewImplantName(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">CDSCO Reg Stamp</label>
                        <input
                          type="text"
                          placeholder="CDSCO/MD/2026-X1"
                          value={newImplantCdsco}
                          onChange={(e) => setNewImplantCdsco(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-bold font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Recipient UHID</label>
                        <input
                          type="text"
                          placeholder="UHID-108291"
                          value={newImplantUhid}
                          onChange={(e) => setNewImplantUhid(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-bold font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newImplantId || !newImplantName || !newImplantUhid) {
                          alert("Ensure Device Serial, Name, and Recipient UHID parameters are logged.");
                          return;
                        }
                        
                        const entry = {
                          id: newImplantId,
                          name: newImplantName,
                          cdscoReg: newImplantCdsco || "CDSCO/MD/2026-T9",
                          manufacturer: newImplantManufacturer || "Authorized NHA Local Vendor",
                          batch: newImplantBatch || "B-IMPLANT-NEW",
                          uhid: newImplantUhid,
                          patientName: "Active Admitted Citizen",
                          status: "In-Situ (Active)",
                          implantedAt: new Date().toISOString().substring(0, 10),
                          cost: newImplantCost || 12000,
                          certified: true
                        };

                        setImplantLifecycleList(prev => [...prev, entry]);
                        setNewImplantId("");
                        setNewImplantName("");
                        setNewImplantUhid("");
                        alert("Certified Implant successfully synced into decentralized warehouse registry ledger.");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg transition text-center cursor-pointer"
                    >
                      Enforce Mapping Sign-Off
                    </button>
                  </div>
                </div>

                {/* Database Table layout of register */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider select-none">
                    📋 Active Permanent Recipient Traceability Ledger
                  </span>

                  <div className="overflow-x-auto text-[11px]">
                    <table className="w-full text-left border-collapse font-medium">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b">
                          <th className="p-2.5">Serial Reference</th>
                          <th className="p-2.5">Implant Device</th>
                          <th className="p-2.5">CDSCO Reg Token</th>
                          <th className="p-2.5">Recipient Citizen (UHID)</th>
                          <th className="p-2.5">Implant Date</th>
                          <th className="p-2.5">Regulatory License</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 font-semibold font-mono">
                        {implantLifecycleList.map((imp) => (
                          <tr key={imp.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-900">{imp.id}</td>
                            <td className="p-2.5 font-sans">
                              <span className="block text-slate-800 font-bold">{imp.name}</span>
                              <span className="text-[9px] text-slate-400 select-none">{imp.manufacturer} • Batch {imp.batch}</span>
                            </td>
                            <td className="p-2.5">{imp.cdscoReg}</td>
                            <td className="p-2.5 font-sans">
                              <span className="block text-slate-850">{imp.patientName}</span>
                              <span className="text-[10px] text-slate-450 font-mono text-slate-400">{imp.uhid}</span>
                            </td>
                            <td className="p-2.5">{imp.implantedAt}</td>
                            <td className="p-2.5 font-sans select-none">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${imp.certified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse font-extrabold"}`}>
                                {imp.certified ? "CDSCO APPROVED" : "SUSPECTED ALIEN ELEMENT"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFraudTab === "audit_cert" && (
            <div className="space-y-6">
              {/* Compliance dossier builder */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b pb-3 select-none">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
                    📜 Audit-Ready Documentation &amp; Certification Creator
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Submit compliance summaries below to lock database schemas under decentralized anti-tampering checksum profiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Inputs */}
                  <div className="lg:col-span-2 bg-slate-50 p-4.5 rounded-xl border space-y-3.5 text-xs font-semibold">
                    <div>
                      <label className="block text-[10.5px] text-slate-600 font-bold mb-1">Lead Audit Examiner</label>
                      <input
                        type="text"
                        value={complianceInspectorName}
                        onChange={(e) => setComplianceInspectorName(e.target.value)}
                        className="w-full bg-white border rounded-lg p-2 font-sans font-bold text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] text-slate-600 font-bold mb-1">Official Forensic Audit Ledger Remarks</label>
                      <textarea
                        rows={4}
                        value={complianceNotes}
                        onChange={(e) => setComplianceNotes(e.target.value)}
                        className="w-full bg-white border rounded-lg p-2 font-sans text-slate-800 focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setComplianceSaved(true);
                        alert("Cryptographic compliance dossier sealed! You may now export/print the certificate below.");
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 rounded-lg transition active:scale-95 cursor-pointer text-center select-none"
                    >
                      Lock Forensic Certificate Data
                    </button>
                  </div>

                  {/* Cert Presentation Box */}
                  <div className="lg:col-span-3 bg-slate-50 border rounded-2xl p-5 flex flex-col justify-between items-center relative overflow-hidden shadow-sm select-none">
                    
                    {/* Watermark logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none select-none hover:cursor-default">
                      <ShieldAlert className="h-64 w-64 text-slate-900 opacity-[0.03]" />
                    </div>

                    {/* Government style border design */}
                    <div className="p-6 border-4 border-double border-indigo-900 bg-white rounded-lg w-full space-y-4 shadow-3xs relative z-10 text-center font-sans">
                      
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#003580] block">
                          National Health Authority • Anti-Fraud Division
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                          Certificate of System Integrity &amp; FWA Conformity
                        </h4>
                        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-indigo-900 to-emerald-500 w-32 mx-auto" />
                      </div>

                      <div className="space-y-2 py-4">
                        <p className="text-[11px] text-slate-600 leading-normal font-medium max-w-sm mx-auto">
                          This document certifies that the <strong>MediNexus NHA Platform</strong> has audited the active patient records against upcoding, dual billing, and counterfeit implant serial lists.
                        </p>
                        
                        <div className="bg-slate-50 border border-dashed p-2.5 rounded text-[10px] font-mono leading-relaxed text-left text-slate-600">
                          <div>• Lead Inspector: {complianceInspectorName}</div>
                          <div>• Audit Run Count: {fraudAuditRunCount} runs</div>
                          <div>• Checked Claims: {claims.length} entries registered</div>
                          <div>• Remarks: "{complianceNotes}"</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t pt-2 text-[10px] leading-tight text-slate-500 text-left font-mono">
                        <div>
                          <span className="block text-slate-400 uppercase text-[8px] font-bold font-sans">Seal Authority:</span>
                          <span className="text-[#003580] font-black">NHA SECRETARIAT</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-slate-400 uppercase text-[8px] font-bold font-sans">SHA-256 Digest:</span>
                          <span className="text-indigo-950 font-black">HASH-COM-99120-OK</span>
                        </div>
                      </div>
                    </div>

                    {complianceSaved && (
                      <div className="w-full mt-4 flex justify-center">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
                        >
                          <FileSpreadsheet className="h-4 w-4" /> Download Certified Audit PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "master_tables" && (
        <SuperAdminDatabaseExplorer
          patients={patients}
          abhaMaster={abhaMaster}
          doctors={doctors}
          departments={departments}
          appointments={appointments}
          admissions={admissions}
          billing={billing}
          claims={claims}
          pmjayPackages={pmjayPackages}
          consentLogs={consentLogs}
          auditLogs={auditLogs}
          onAddRow={onAddRow}
          onVerifyIntegrity={onVerifyIntegrity}
        />
      )}
    </div>
  );
}
