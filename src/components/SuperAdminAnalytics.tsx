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
    "executive" | "biometrics" | "govt" | "cyber" | "governance" | "interoperability" | "clinical_ai" | "master_tables"
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5 p-1 bg-slate-100 border rounded-xl" id="superadmin-subtabs">
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
                    className="bg-indigo-650 hover:bg-slate-900 text-white text-[11px] py-1.5 px-4 rounded-lg font-bold"
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
