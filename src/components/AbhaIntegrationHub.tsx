import React, { useState, useEffect } from "react";
import { 
  User, QrCode, ClipboardPlus, Phone, Shield, ArrowRight, CheckCircle2, 
  BadgeAlert, Plus, HelpCircle, Search, RefreshCw, Printer, Download, 
  Users, Award, Activity, Sparkles, Database, FileText, Check, AlertTriangle, 
  FileCheck, ShieldAlert, Lock, MapPin, HardDrive, Smartphone, FilePlus 
} from "lucide-react";
import { Patient, Encounter, AbhaMaster } from "../types";
import { 
  ConsentManagerPanel, 
  DpdpActPanel, 
  SecurityAuditTrailPanel, 
  SecureClinicalStoragePanel 
} from "./AbhaPrivacyHubComponents";

interface AbhaIntegrationProps {
  patients: Patient[];
  abhaMaster: AbhaMaster[];
  encounters: Encounter[];
  onAddPatient: (patient: Patient) => void;
  onAddAbhaMaster?: (record: AbhaMaster) => void;
  onRefreshData?: () => void;
}

export default function AbhaIntegrationHub({ 
  patients, 
  abhaMaster, 
  encounters, 
  onAddPatient,
  onAddAbhaMaster,
  onRefreshData
}: AbhaIntegrationProps) {
  // Main Navigation within ABDM hub (expanded to support all mandatory ABDM workflows)
  const [activeTab, setActiveTab] = useState<"create" | "verify" | "link" | "camp" | "consent" | "registries" | "scan_share">("create");

  // Sub-tabs for Creation methods
  const [creationMethod, setCreationMethod] = useState<"aadhaar" | "dl" | "mobile" | "face" | "demo">("aadhaar");

  // --- ABDM CONSENT MANAGER STATES ---
  const [consentLogs, setConsentLogs] = useState<any[]>([
    {
      id: "CON-7721",
      patientId: "UHID-108291",
      patientName: "Ramesh Chandra Kumar",
      doctorName: "Dr. Arvind Swaminathan",
      purpose: "General Clinical Diagnosis",
      scope: ["Prescriptions", "Diagnostic Reports"],
      status: "Active",
      validUntil: "2026-12-31",
      grantedAt: "2026-05-20"
    },
    {
      id: "CON-4532",
      patientId: "UHID-291024",
      patientName: "Priyanka Devi Patel",
      doctorName: "Dr. Arvind Swaminathan",
      purpose: "EHR Cross-Hospital Referral Audit",
      scope: ["Prescriptions", "Diagnostic Reports", "Discharge Summary"],
      status: "Active",
      validUntil: "2026-06-30",
      grantedAt: "2026-05-25"
    }
  ]);
  const [newConsentPatientId, setNewConsentPatientId] = useState("");
  const [newConsentPurpose, setNewConsentPurpose] = useState("Longitudinal Health History Sync");
  const [newConsentScope, setNewConsentScope] = useState<string[]>(["Prescriptions", "Diagnostic Reports"]);
  const [consentOtpSent, setConsentOtpSent] = useState(false);
  const [consentOtpInput, setConsentOtpInput] = useState("");
  const [consentActiveRequestJson, setConsentActiveRequestJson] = useState<any>(null);
  const [consentActiveResponseJson, setConsentActiveResponseJson] = useState<any>(null);

  // --- HEALTH RECORDS FHIR COMPILER STATES ---
  const [fhirDocType, setFhirDocType] = useState<"opd" | "prescription" | "discharge">("opd");

  // --- ABDM REGISTRY SEARCH STATES ---
  const [registryType, setRegistryType] = useState<"hfr" | "hpr" | "self_register">("hfr");
  const [registrySearchQuery, setRegistrySearchQuery] = useState("");
  const [registrySearchResults, setRegistrySearchResults] = useState<any[]>([]);
  const [selectedRegistryItem, setSelectedRegistryItem] = useState<any>(null);

  // --- HOSPITAL SELF REGISTRATION STATES ---
  const [selfRegStep, setSelfRegStep] = useState<"init" | "pending_otp" | "done">("init");
  const [selfRegHospitalName, setSelfRegHospitalName] = useState("Ambedkar Sandbox General Hospital");
  const [selfRegCategory, setSelfRegCategory] = useState<"hfr" | "pmjay" | "abdm">("hfr");
  const [selfRegStateCode, setSelfRegStateCode] = useState("DL");
  const [selfRegLicenseNum, setSelfRegLicenseNum] = useState("MC-DL-2026-9901");
  const [selfRegMobile, setSelfRegMobile] = useState("9876543210");
  const [selfRegOtp, setSelfRegOtp] = useState("");
  const [selfRegGatewayClient, setSelfRegGatewayClient] = useState<string>("");
  const [registeredHospitalRecord, setRegisteredHospitalRecord] = useState<any>(null);

  // --- UTTAR PRADESH SPECIAL SACHIS & PMJAY STATES ---
  const [upPmjaySubTab, setUpPmjaySubTab] = useState<"mapping" | "preauth" | "tms_claims" | "integration">("integration");
  const [upPmjayPackages, setUpPmjayPackages] = useState<any[]>([
    { code: "UP-S100155", name: "Bilateral Cataract Surgery with IOL", sachisRate: 14500, hospitalRate: 16000, type: "Surgical", status: "Mapped" },
    { code: "UP-S12003", name: "Laparoscopic Cholecystectomy (Gallbladder)", sachisRate: 24000, hospitalRate: 28050, type: "Surgical", status: "Mapped" },
    { code: "UP-S200151", name: "Total Knee Replacement - Unilateral", sachisRate: 90000, hospitalRate: 105000, type: "Surgical", status: "Mapped" },
    { code: "UP-M101235", name: "Severe Acute Malnutrition IPD Support (Child Care)", sachisRate: 12000, hospitalRate: 12000, type: "Medical", status: "Mapped" },
    { code: "UP-M201112", name: "Adult Acute Respiratory Distress Syndrome Management", sachisRate: 35000, hospitalRate: 42000, type: "Medical", status: "Unmapped" }
  ]);
  const [upPmjayClaims, setUpPmjayClaims] = useState<any[]>([
    {
      id: "CLM-UP-2026-9051",
      patientName: "Ram Swaroop Yadav",
      pmjayCardNo: "P-UP-9905-1823-4412",
      procedure: "Laparoscopic Cholecystectomy",
      packageCode: "UP-S12003",
      amount: 24000,
      status: "Disbursed",
      stage: "Settled",
      logs: [
        "05/10/2026: Intubation/In-admission check-in initiated at ward",
        "05/10/2026: E-Preauth request approved by UP-SACHIS auditor Lakhnau",
        "05/14/2026: Discharge summary compiled and Bed Audits passed",
        "05/15/2026: TMS claims submission completed. Verification code: SHA-UP-23051",
        "05/22/2026: UP Finance Treasury cleared transaction. Cashless fund disbursed."
      ],
      preauthPayload: null,
      claimPayload: null
    },
    {
      id: "CLM-UP-2026-9052",
      patientName: "Kiran Devi Chaurasia",
      pmjayCardNo: "P-UP-8812-4911-0023",
      procedure: "Bilateral Cataract Surgery with IOL",
      packageCode: "UP-S100155",
      amount: 14500,
      status: "Preauth Approved",
      stage: "IPD Active",
      logs: [
        "05/26/2026: Patient biometric authentication verified via PMJAY-fingerprint portal",
        "05/26/2026: E-Preauth packet uploaded over SACHIS SECURE-SSL node",
        "05/26/2026: Pre-authorization approved automatically by RuleEngine-SACHISv3"
      ],
      preauthPayload: null,
      claimPayload: null
    },
    {
      id: "CLM-UP-2026-9053",
      patientName: "Suresh Chandra Gupta",
      pmjayCardNo: "P-UP-1102-7744-8899",
      procedure: "Total Knee Replacement - Unilateral",
      packageCode: "UP-S200151",
      amount: 90000,
      status: "Draft",
      stage: "Clinical Stage",
      logs: [
        "05/28/2026: Diagnosed with Grade IV Bilateral Primary Osteoarthritis",
        "05/28/2026: Patient added to PMJAY Cashless IPD waitlist registry"
      ],
      preauthPayload: null,
      claimPayload: null
    }
  ]);

  const [selectedClaimDetail, setSelectedClaimDetail] = useState<any>(null);
  const [prevTmsLogs, setPrevTmsLogs] = useState<string[]>([
    "05/28/2026 08:12 AM: PING sachis.up.gov.in (164.100.180.22) - RTT 12ms",
    "05/28/2026 08:31 AM: Fetching updated UP-HBP 3.0 procedure tables... Success. 4380 packages active.",
    "05/28/2026 08:45 AM: Syncing hospital bed count with NHA Hospital Portal (HEM)"
  ]);

  // States for dynamic forms
  const [newMapCode, setNewMapCode] = useState("");
  const [newMapName, setNewMapName] = useState("");
  const [newMapSachisRate, setNewMapSachisRate] = useState("");
  const [newMapHospitalRate, setNewMapHospitalRate] = useState("");

  const [preauthPatientName, setPreauthPatientName] = useState("Suresh Chandra Gupta");
  const [preauthCardNo, setPreauthCardNo] = useState("P-UP-1102-7744-8899");
  const [preauthPackageCode, setPreauthPackageCode] = useState("UP-S200151");
  const [preauthEstimatedDays, setPreauthEstimatedDays] = useState("5");
  const [preauthImplantCharge, setPreauthImplantCharge] = useState("12000");
  const [preauthDiagnosisInfo, setPreauthDiagnosisInfo] = useState("Osteoarthritis Grade IV Knee Left");
  const [tmsPayloadView, setTmsPayloadView] = useState<any>(null);
  const [tmsResponseView, setTmsResponseView] = useState<any>(null);

  // States for subclaim draft form
  const [claimSubmitClaimId, setClaimSubmitClaimId] = useState("");
  const [claimSubmitTriggerPhoto, setClaimSubmitTriggerPhoto] = useState(true);
  const [claimSubmitFinalBill, setClaimSubmitFinalBill] = useState("92000");
  const [claimSubmitPostOpNotes, setClaimSubmitPostOpNotes] = useState("Surgical fixation successful. Drainage removed on day 2. Joint mobility normal.");

  // --- OPD SCAN & SHARE QR WORKFLOW STATES ---
  const [scanShareCurrentLocation, setScanShareCurrentLocation] = useState("OPD Reception Counter Desk A");
  const [scannedDemographics, setScannedDemographics] = useState<any>(null);
  const [scannedStep, setScannedStep] = useState<"waiting" | "simulated_scanned" | "otp_verify" | "registered">("waiting");
  const [scannedOtp, setScannedOtp] = useState("");
  const [scanShareActiveToken, setScanShareActiveToken] = useState<string | null>(null);
  const [incomingScansQueue, setIncomingScansQueue] = useState<any[]>([
    {
      id: "S&S-991",
      abhaId: "amit.sharma@sbx",
      abhaNumber: "45-9102-3342-8812",
      name: "Amit Sharma",
      gender: "Male",
      dob: "1985-04-12",
      phone: "7654321098",
      address: "House 24, Sector 15",
      district: "New Delhi",
      state: "Delhi",
      token: "ABDM-OPD-912",
      timestamp: "08:31 AM"
    }
  ]);

  // Common Simulator States
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTxnId, setSessionTxnId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- PRIVACY, DATA COGNIZANCE & DPDP SECURITY STATES ---
  const [privacySubTab, setPrivacySubTab] = useState<"consent_manager" | "dpdp_privacy" | "audit_logging" | "secure_storage">("consent_manager");
  const [dpdpLanguage, setDpdpLanguage] = useState<"en" | "hi" | "ur">("en");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<"ALL" | "INFO" | "SUCCESS" | "WARNING" | "CRITICAL">("ALL");
  const [privacySecurityLogs, setPrivacySecurityLogs] = useState<any[]>([
    {
      id: "LOG-SE-0581",
      timestamp: "2026-05-28T08:31:12.441Z",
      actor: "Dr. Arvind Swaminathan (HPR-10255)",
      action: "Access EMR clinical record",
      patientId: "PAT-002",
      patientName: "Kiran Devi Chaurasia",
      status: "APPROVED_WITH_CONSENT",
      consentId: "CON-4491",
      severity: "SUCCESS",
      details: "Decrypted 2 clinical files using ephemeral AES-GCM session key. Consent check: VALID."
    },
    {
      id: "LOG-SE-0582",
      timestamp: "2026-05-28T08:32:05.112Z",
      actor: "SysAdmin (HOSP-ADMIN-01)",
      action: "Rotate Local DB Cryptographic Master Key",
      patientId: "N/A",
      patientName: "N/A",
      status: "KEY_ROTATED_SUCCESSFULLY",
      consentId: "N/A",
      severity: "CRITICAL",
      details: "Re-encrypted 147 local records. Master key rotated from KEK-v2 to KEK-v3 (AES-256-KeyWrap)."
    },
    {
      id: "LOG-SE-0583",
      timestamp: "2026-05-28T09:01:22.901Z",
      actor: "Dr. Arvind Swaminathan (HPR-10255)",
      action: "Access EMR clinical record",
      patientId: "PAT-003",
      patientName: "Suresh Chandra Gupta",
      status: "BLOCKED_NO_CONSENT",
      consentId: "N/A",
      severity: "WARNING",
      details: "Attempted to access high-sensitivity orthopedic MRI. Access denied because patient consent has expired/not granted."
    },
    {
      id: "LOG-SE-0584",
      timestamp: "2026-05-28T09:05:00.000Z",
      actor: "NHA Gateway Listener",
      action: "Received ABDM Audit Request Query",
      patientId: "PAT-001",
      patientName: "Ram Swaroop Yadav",
      status: "VERIFIED",
      consentId: "CON-9051",
      severity: "INFO",
      details: "State Health Authority (SACHIS-UP) requested audit trace code for claim alignment. Signature confirmed."
    }
  ]);

  const [secureStorageStatus, setSecureStorageStatus] = useState({
    encryptionType: "AES-256-GCM (NHA Compliant)",
    cachedRecordsCount: 24,
    compromisedSectors: 0,
    zeroKnowledgeProofStatus: "Verified & Sealed",
    hardwareModule: "TPM 2.0 / HSM Cloud",
    keyRotationCycle: "30 Days (Standard)",
    lastBackup: "2026-05-28 07:44 AM",
    keyBits: 256
  });

  const [dpdpErasePatientId, setDpdpErasePatientId] = useState("");
  const [dpdpEraseReason, setDpdpEraseReason] = useState("Treatment complete; exercising right to be forgotten.");
  const [dpdpGrievanceLog, setDpdpGrievanceLog] = useState<any[]>([
    { id: "GRIV-9121", name: "Suresh Chandra Gupta", type: "Correction of personal data", status: "Resolved", registeredAt: "2026-05-24" }
  ]);
  const [grievantName, setGrievantName] = useState("");
  const [grivType, setGrivType] = useState("Correction of personal data");
  const [grivDetails, setGrivDetails] = useState("");

  // A. [CREATION STATE]
  // 1. Aadhaar
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [aadhaarName, setAadhaarName] = useState("");
  const [aadhaarMobile, setAadhaarMobile] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarStep, setAadhaarStep] = useState<"input" | "otp" | "complete">("input");

  // 2. Driving License
  const [dlInput, setDlInput] = useState("");
  const [dlName, setDlName] = useState("");
  const [dlDob, setDlDob] = useState("");
  const [dlMobile, setDlMobile] = useState("");
  const [dlOtp, setDlOtp] = useState("");
  const [dlStep, setDlStep] = useState<"input" | "otp" | "complete">("input");

  // 3. Mobile OTP
  const [mobileOnlyNumber, setMobileOnlyNumber] = useState("");
  const [mobileStep, setMobileStep] = useState<"phone" | "otp" | "profile" | "complete">("phone");
  const [mobileOtpInput, setMobileOtpInput] = useState("");
  const [mobileDemographics, setMobileDemographics] = useState({
    name: "",
    gender: "Male" as "Male" | "Female" | "Other",
    dob: "1994-06-12",
    address: "",
    state: "Maharashtra",
    district: "Mumbai"
  });

  // 4. Biometric Face Auth
  const [faceStep, setFaceStep] = useState<"select" | "scanning" | "matched" | "complete">("select");
  const [selectedPatientForFace, setSelectedPatientForFace] = useState<string>("");
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [faceScanLog, setFaceScanLog] = useState<string[]>([]);

  // 5. Demographic Search / Create
  const [demoSearchForm, setDemoSearchForm] = useState({
    name: "",
    birthYear: "",
    gender: "Male" as "Male" | "Female" | "Other",
    state: "Delhi",
    district: "Central Delhi"
  });
  const [demoSearchResults, setDemoSearchResults] = useState<any[]>([]);
  const [demoSearchTriggered, setDemoSearchTriggered] = useState(false);

  // Generated ABHA Result Cache for Card View
  const [generatedAbhaCard, setGeneratedAbhaCard] = useState<{
    id: string;
    num: string;
    name: string;
    dob: string;
    gender: string;
    mobile: string;
    aadhaar?: string;
    source: string;
  } | null>(null);

  // B. [VERIFICATION STATE]
  const [verAbhaIdOrNum, setVerAbhaIdOrNum] = useState("");
  const [verResult, setVerResult] = useState<{
    status: "verified" | "not_found" | "warning";
    message: string;
    abhaDetails?: AbhaMaster;
    matchedLocalPatient?: Patient;
    warnings: string[];
  } | null>(null);
  const [verOtpSent, setVerOtpSent] = useState(false);
  const [verOtpInput, setVerOtpInput] = useState("");
  const [verOtpVerified, setVerOtpVerified] = useState(false);

  // C. [RECORD EXCHANGE & LINKING STATE]
  const [linkSelectedPatientId, setLinkSelectedPatientId] = useState("");
  const [fhirMapStep, setFhirMapStep] = useState<"select" | "converting" | "fhir_ready" | "synced">("select");
  const [fhirBundleJson, setFhirBundleJson] = useState<any>(null);
  const [linkSelectedEncounters, setLinkSelectedEncounters] = useState<string[]>([]);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncPercentage, setSyncPercentage] = useState(0);

  // D. [BULK CAMP STATE]
  const [campName, setCampName] = useState("Ayushman Bharat Mega Camp - Block C");
  const [campLocation, setCampLocation] = useState("Community Hall, Sector 15");
  const [campLeader, setCampLeader] = useState("Dr. Arvind Swaminathan");
  const [campCohortSize, setCampCohortSize] = useState(10);
  const [campBulkResults, setCampBulkResults] = useState<any[]>([]);
  const [campProgress, setCampProgress] = useState(0);
  const [isCampRunning, setIsCampRunning] = useState(false);

  // Reset errors/success messages on tab switch
  useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, [activeTab, creationMethod]);

  // Clean Aadhaar format
  const formatAadhaar = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (raw.length <= 4) return raw;
    if (raw.length <= 8) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarInput(formatAadhaar(e.target.value));
  };

  // NHA Gateway Simulations
  const triggerAadhaarOtpRequest = async () => {
    if (aadhaarInput.replace(/\D/g, "").length !== 12) {
      setErrorMessage("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    if (!aadhaarName) {
      setErrorMessage("Please enter full beneficiary name matching Aadhaar.");
      return;
    }
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const resp = await fetch("/api/abdm/abha/create-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarInput })
      });
      const data = await resp.json();
      if (data.success) {
        setSessionTxnId(data.txnId);
        setAadhaarStep("otp");
        setSuccessMessage("Simulated Aadhaar verification OTP packet sent to mobile!");
      } else {
        setErrorMessage("Federal UIDAI Gateway responded with an error. Please try again.");
      }
    } catch (e) {
      setErrorMessage("Failed to communicate with NHA sandbox gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAadhaarOtpAndGenerate = async () => {
    if (!aadhaarOtp || aadhaarOtp.length < 4) {
      setErrorMessage("Please enter simulated 6-digit OTP (Enter 123456).");
      return;
    }
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const resp = await fetch("/api/abdm/abha/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaar: aadhaarInput,
          otp: aadhaarOtp,
          name: aadhaarName
        })
      });
      const data = await resp.json();
      if (data.success) {
        const payload = {
          id: data.abhaId,
          num: data.abhaNumber,
          name: aadhaarName,
          dob: "1988-10-15",
          gender: "Male",
          mobile: aadhaarMobile || "9876543210",
          aadhaar: aadhaarInput,
          source: "Aadhaar e-KYC"
        };
        // Add to global state through database direct row insertion
        const abhaRec = {
          id: data.abhaNumber,
          abhaId: data.abhaId,
          name: aadhaarName,
          aadhaar: aadhaarInput,
          gender: "Male" as const,
          dob: "1988-10-15",
          phone: aadhaarMobile || "9876543210",
          status: "Active" as const,
          updatedAt: new Date().toISOString()
        };

        await syncNewAbhaToDatabase(abhaRec);

        setGeneratedAbhaCard(payload);
        setAadhaarStep("complete");
        setSuccessMessage("ABHA Registry Verified & Digital Profile generated successfully!");
      } else {
        setErrorMessage("Authentication failed! Correct OTP is 123456.");
      }
    } catch (e) {
      setErrorMessage("Server communication failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  // DL e-KYC
  const triggerDlOtpRequest = () => {
    if (!dlInput || dlInput.length < 5) {
      setErrorMessage("Please fill a valid Driving License Number.");
      return;
    }
    if (!dlDob) {
      setErrorMessage("Date of birth required to match with Sarathi Registry.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDlStep("otp");
      setSuccessMessage("Driving License matches Sarathi records. DigiLocker handshake successful. OTP sent to verified phone.");
    }, 1200);
  };

  const verifyDlOtpAndGenerate = async () => {
    if (!dlOtp) {
      setErrorMessage("Please enter OTP.");
      return;
    }
    setIsProcessing(true);
    setTimeout(async () => {
      const textNum = Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join("");
      const abhaNumber = `${textNum.slice(0, 2)}-${textNum.slice(2, 6)}-${textNum.slice(6, 10)}-${textNum.slice(10, 14)}`;
      const cleanId = dlName.toLowerCase().replace(/\s+/g, ".") + `${Math.floor(10 + Math.random() * 90)}@sbx`;
      
      const payload = {
        id: cleanId,
        num: abhaNumber,
        name: dlName || "Sonia Gandhi",
        dob: dlDob || "1994-04-12",
        gender: "Female",
        mobile: dlMobile || "9988776655",
        source: "Driving License verification"
      };

      const abhaRec = {
        id: abhaNumber,
        abhaId: cleanId,
        name: dlName || "Sonia Gandhi",
        aadhaar: "DL-Verified-" + dlInput.slice(-4),
        gender: "Female" as const,
        dob: dlDob || "1994-04-12",
        phone: dlMobile || "9988776655",
        status: "Active" as const,
        updatedAt: new Date().toISOString()
      };

      await syncNewAbhaToDatabase(abhaRec);
      setGeneratedAbhaCard(payload);
      setDlStep("complete");
      setIsProcessing(false);
      setSuccessMessage("DL-linked ABHA card generated successfully.");
    }, 1200);
  };

  // Mobile Auth Flow
  const triggerMobileOtp = () => {
    if (mobileOnlyNumber.length !== 10) {
      setErrorMessage("Enter a valid 10-digit mobile number.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMobileStep("otp");
      setSuccessMessage("OTP sent to custom mobile endpoint via NHA Gateway.");
    }, 1000);
  };

  const verifyMobileOtp = () => {
    if (!mobileOtpInput) {
      setErrorMessage("Input OTP.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMobileStep("profile");
      setSuccessMessage("Mobile authenticated. Please provide fallback demographics to issue demographic ABHA.");
    }, 1000);
  };

  const generateMobileAbha = async () => {
    const { name, dob, gender, address, state, district } = mobileDemographics;
    if (!name) {
      setErrorMessage("Name is strictly required.");
      return;
    }
    setIsProcessing(true);
    setTimeout(async () => {
      const textNum = Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join("");
      const abhaNumber = `${textNum.slice(0, 2)}-${textNum.slice(2, 6)}-${textNum.slice(6, 10)}-${textNum.slice(10, 14)}`;
      const cleanId = name.toLowerCase().replace(/\s+/g, ".") + "@sbx";

      const payload = {
        id: cleanId,
        num: abhaNumber,
        name,
        dob,
        gender,
        mobile: mobileOnlyNumber,
        source: "Demographics & Mobile e-KYC"
      };

      const abhaRec = {
        id: abhaNumber,
        abhaId: cleanId,
        name,
        aadhaar: "Mobile-EKYC-Verified",
        gender,
        dob,
        phone: mobileOnlyNumber,
        status: "Active" as const,
        updatedAt: new Date().toISOString()
      };

      await syncNewAbhaToDatabase(abhaRec);
      setGeneratedAbhaCard(payload);
      setMobileStep("complete");
      setIsProcessing(false);
      setSuccessMessage("Mobile self-demographic verification succeeded!");
    }, 1200);
  };

  // Biometric Face Authentication Scanner Simulator
  const initializeBiometricAuth = (patId: string) => {
    const selected = patients.find(p => p.id === patId);
    if (!selected) return;
    setFaceStep("scanning");
    setFaceScanProgress(0);
    setFaceScanLog(["[UIDAI CLIENT] Launching ABDM BioCam Service v2.1...", "[Aadhaar BIOMETRIC] Searching biometric landscape registers..."]);
    
    const logs = [
      "[Aadhaar BIOMETRIC] Scanning face pattern, spatial coordinates reading...",
      "[UIDAI GATEWAY] Cryptographic challenge sent to central UIDAI biometrics cluster...",
      "[NHA COGNITIVE] Analyzing landmarks: pupillary distance, nasal bridge delta...",
      "[AUTHENTICATED] Pattern matched 99.4% with Aadhaar photo file.",
      "[NHA ID-ISSUER] Finalizing secure token signing..."
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setFaceScanProgress(current);
      if (current / 20 > 0 && current / 20 <= logs.length) {
        setFaceScanLog(prev => [...prev, logs[current / 20 - 1]]);
      }
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFaceStep("matched");
        }, 400);
      }
    }, 600);
  };

  const signFaceAuthAbha = async () => {
    const selected = patients.find(p => p.id === selectedPatientForFace);
    if (!selected) return;
    setIsProcessing(true);
    setTimeout(async () => {
      const textNum = Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join("");
      const abhaNumber = `${textNum.slice(0, 2)}-${textNum.slice(2, 6)}-${textNum.slice(6, 10)}-${textNum.slice(10, 14)}`;
      const cleanId = selected.name.toLowerCase().replace(/\s+/g, ".") + "@sbx";

      const payload = {
        id: cleanId,
        num: abhaNumber,
        name: selected.name,
        dob: selected.dob,
        gender: selected.gender,
        mobile: selected.phone,
        source: "Face Biometrics Verified"
      };

      const abhaRec = {
        id: abhaNumber,
        abhaId: cleanId,
        name: selected.name,
        aadhaar: selected.aadhaar,
        gender: selected.gender,
        dob: selected.dob,
        phone: selected.phone,
        status: "Active" as const,
        updatedAt: new Date().toISOString()
      };

      await syncNewAbhaToDatabase(abhaRec);
      setGeneratedAbhaCard(payload);
      setFaceStep("complete");
      setIsProcessing(false);
    }, 1000);
  };

  // Demographic based search before creating
  const handleDemographicSearch = () => {
    setDemoSearchTriggered(true);
    setIsProcessing(true);
    // Find matching items in abhaMaster
    setTimeout(() => {
      const match = abhaMaster.filter(a => {
        const nameMatch = a.name.toLowerCase().includes(demoSearchForm.name.toLowerCase());
        const genderMatch = a.gender === demoSearchForm.gender;
        return nameMatch || genderMatch;
      });
      setDemoSearchResults(match);
      setIsProcessing(false);
    }, 1000);
  };

  // Sync utilities
  const syncNewAbhaToDatabase = async (record: AbhaMaster) => {
    try {
      const resp = await fetch("/api/admin/add-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: "abha_master", rowData: record })
      });
      const res = await resp.json();
      if (res.success && onRefreshData) {
        onRefreshData();
      }
    } catch (e) {
      console.error("Failed syncing master record", e);
    }
  };

  // B [VERIFICATION DESK LOGIC]
  const runAbhaVerification = () => {
    if (!verAbhaIdOrNum) {
      setErrorMessage("Enter an ABHA ID or 14-digit number.");
      return;
    }
    setIsProcessing(true);
    setVerResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      // Try finding in abhaMaster
      const cleanInput = verAbhaIdOrNum.trim();
      const matchedMaster = abhaMaster.find(
        a => a.abhaId === cleanInput || a.id === cleanInput || a.id.replace(/\D/g, "") === cleanInput.replace(/\D/g, "")
      );

      if (!matchedMaster) {
        setVerResult({
          status: "not_found",
          message: "No registered ABDM National Health Account matches this credential.",
          warnings: ["ID not indexed in NHA active sandbox router.", "Cannot fetch CDG health cards from disconnected gateways."]
        });
        return;
      }

      // Check if already mapped to some local active Hospital patient UHID
      const mappedLocal = patients.find(p => p.abhaId === matchedMaster.abhaId || p.abhaNumber === matchedMaster.id);

      // Analyze discrepancies
      const warnings: string[] = [];
      
      // Let's simulated check duplicate cases
      const alternativePatient = patients.find(p => p.aadhaar === matchedMaster.aadhaar && p.id !== mappedLocal?.id);
      if (alternativePatient) {
        warnings.push(`⚠️ WARNING: Another hospital UHID (${alternativePatient.id} - ${alternativePatient.name}) has the exact same Aadhaar number listed.`);
      }

      // Demographic differences check
      if (mappedLocal) {
        if (mappedLocal.name.toLowerCase() !== matchedMaster.name.toLowerCase()) {
          warnings.push(`⚠️ DEMOGRAPHIC MISMATCH: Local Patient record lists Name as "${mappedLocal.name}" but ABDM registry lists "${matchedMaster.name}".`);
        }
        if (mappedLocal.gender !== matchedMaster.gender) {
          warnings.push(`⚠️ GENDER MISMATCH: Local Patient record has gender "${mappedLocal.gender}" while ABDM Registry lists "${matchedMaster.gender}".`);
        }
      }

      setVerResult({
        status: warnings.length > 0 ? "warning" : "verified",
        message: mappedLocal 
          ? `Verified! This ABHA is securely mapped locally to active record: ${mappedLocal.name} (${mappedLocal.id}).` 
          : "Demographics verified from NHA gateway! This record is not yet onboarded to local Hospital patient indexes.",
        abhaDetails: matchedMaster,
        matchedLocalPatient: mappedLocal,
        warnings
      });

      // Send OTP automatically to verify phone
      setVerOtpSent(true);
    }, 1200);
  };

  const handleLinkAbhaWithExistingPatient = async (pId: string, abhaIdStr: string, abhaNumStr: string) => {
    setIsProcessing(true);
    try {
      // Simulate mapping in our patient DB
      // In a real full-stack app, we can execute a patch or update API
      // We will perform a PUT / POST inside our server or simulate mapping locally
      const pat = patients.find(p => p.id === pId);
      if (pat) {
        pat.abhaId = abhaIdStr;
        pat.abhaNumber = abhaNumStr;
        
        // Notify server of update via /api/patients
        await fetch(`/api/patients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pat)
        });

        if (onRefreshData) onRefreshData();
        setSuccessMessage(`Successfully linked Patient UHID ${pId} with ABDM ABHA Number ${abhaNumStr}.`);
      }
    } catch (e) {
      setErrorMessage("Error linking patient EMR notes.");
    } finally {
      setIsProcessing(false);
    }
  };

  // C [FHIR RECORD BUNDLE EXCHANGER]
  const renderFhirEncoder = () => {
    const targetPatient = patients.find(p => p.id === linkSelectedPatientId);
    if (!targetPatient) return;

    setFhirMapStep("converting");
    setSyncLogs([
      "🔋 Initiating HL7 FHIR Document Bundle mapping (v4.0.1)...",
      `📄 Parsing clinical EMR records into ${fhirDocType.toUpperCase()} compliant FHIR template node structures...`,
    ]);
    setSyncPercentage(10);

    const stages = [
      { p: 30, log: `✅ Generative FHIR Node created: Patient Profile mapping (resourceType: "Patient")...` },
      { p: 55, log: fhirDocType === "prescription" 
        ? "✅ Synthesizing ePrescription node entries (resourceType: 'MedicationRequest')..."
        : fhirDocType === "discharge"
        ? "✅ Structuring Composition segments & Discharge instruction nodes (resourceType: 'Composition')..."
        : "✅ Mapping OPD consultation events & ICD-10 diagnostic codes (resourceType: 'Encounter')..." 
      },
      { p: 75, log: "🔒 Encasing in digital security envelope & applying ABDM DPDP signature certificates..." },
      { p: 90, log: "📡 Interoperability handshake complete with ABDM Gateway Health Information Provider (HIP) node..." },
      { p: 100, log: "🎉 Ready! HL7 FHIR Cryptographic bundle compiled." }
    ];

    stages.forEach((st, idx) => {
      setTimeout(() => {
        setSyncPercentage(st.p);
        setSyncLogs(prev => [...prev, st.log]);
        if (st.p === 100) {
          const relatedEnc = encounters.filter(e => e.patientId === targetPatient.id);
          
          let fhirResources: any[] = [
            {
              fullUrl: `Patient/${targetPatient.id}`,
              resource: {
                resourceType: "Patient",
                id: targetPatient.id,
                name: [{ text: targetPatient.name }],
                gender: targetPatient.gender.toLowerCase(),
                birthDate: targetPatient.dob,
                telecom: [{ system: "phone", value: targetPatient.phone }],
                identifier: [
                  { system: "https://ndhm.gov.in/abhaNumber", value: targetPatient.abhaNumber || "NA" },
                  { system: "https://ndhm.gov.in/abhaAddress", value: targetPatient.abhaId || "NA" }
                ],
                address: [{
                  text: `${targetPatient.address || ""}, ${targetPatient.district}, ${targetPatient.state}`,
                  state: targetPatient.state,
                  district: targetPatient.district
                }]
              }
            }
          ];

          if (fhirDocType === "prescription") {
            // Mappings for Digital Prescription (JSON entries including MedicationRequest)
            relatedEnc.forEach(enc => {
              if (enc.prescriptions && enc.prescriptions.length > 0) {
                enc.prescriptions.forEach((med, mIdx) => {
                  fhirResources.push({
                    fullUrl: `MedicationRequest/mr-${enc.id}-${mIdx}`,
                    resource: {
                      resourceType: "MedicationRequest",
                      id: `mr-${enc.id}-${mIdx}`,
                      status: "active",
                      intent: "order",
                      subject: { reference: `Patient/${targetPatient.id}` },
                      authoredOn: enc.date,
                      dosageInstruction: [{
                        text: `${med.dosage} Frequency: ${med.frequency}`,
                        timing: { code: { text: med.frequency } },
                        route: { text: "Oral" },
                        doseAndRate: [{ doseQuantity: { value: parseFloat(med.dosage) || 1, unit: "tablet" } }]
                      }],
                      medicationCodeableConcept: {
                        coding: [
                          { system: "https://ndhm.gov.in/snomed-ct", code: "38268001", display: med.generic }
                        ],
                        text: `${med.medicine} (${med.generic})`
                      },
                      note: [{ text: `Dispense instructions: ${med.instructions}. Substitution allowed: ${med.substitutionAllowed}` }]
                    }
                  });
                });
              }
            });

            // Fallback if no prescriptions exist
            if (fhirResources.length === 1) {
              fhirResources.push({
                fullUrl: `MedicationRequest/mr-fallback-01`,
                resource: {
                  resourceType: "MedicationRequest",
                  status: "active",
                  intent: "order",
                  subject: { reference: `Patient/${targetPatient.id}` },
                  medicationCodeableConcept: { text: "Paracetamol 500mg (Crocin) - Twice daily" }
                }
              });
            }
          } else if (fhirDocType === "discharge") {
            // Mappings for Discharge Summary (Composition node wrapping diagnostic outcomes)
            const dischargeEnc = relatedEnc[0];
            fhirResources.push({
              fullUrl: `Composition/discharge-comp-${targetPatient.id}`,
              resource: {
                resourceType: "Composition",
                id: `discharge-comp-${targetPatient.id}`,
                status: "final",
                type: {
                  coding: [{ system: "http://loinc.org", code: "18842-5", display: "Discharge Summary Document" }],
                  text: "Clinical Post-Admission Discharge Summary"
                },
                subject: { reference: `Patient/${targetPatient.id}` },
                date: new Date().toISOString(),
                title: "Electronic Clinical Discharge Dossier",
                section: [
                  {
                    title: "Active Inpatient Encounter details",
                    code: { text: "Encounter-Context" },
                    text: {
                      status: "generated",
                      div: `<div xmlns="http://www.w3.org/1999/xhtml">Chief complaint: ${dischargeEnc?.chiefComplaints || "Under review"} - Hospital Treatment status updated as General Ward Discharged</div>`
                    }
                  },
                  {
                    title: "Vital Signs at Discharge",
                    code: { text: "Discharge-Vitals" },
                    entry: [
                      { text: `Blood pressure: ${dischargeEnc?.vitals?.bp || "120/80"} mmHg` },
                      { text: `Pulse Rate: ${dischargeEnc?.vitals?.pulse || 72} bpm` }
                    ]
                  },
                  {
                    title: "Progress & Clinical SOAP Summary",
                    code: { text: "SOAP-Clinical" },
                    text: {
                      status: "generated",
                      div: `<div xmlns="http://www.w3.org/1999/xhtml">Subjective: ${dischargeEnc?.soapNotes?.subjective || "Patient stable"}, Assessment: ${dischargeEnc?.soapNotes?.assessment || "Recovered"}</div>`
                    }
                  }
                ]
              }
            });
          } else {
            // Default Standard OPD Encounter
            relatedEnc.forEach(re => {
              fhirResources.push({
                fullUrl: `Encounter/${re.id}`,
                resource: {
                  resourceType: "Encounter",
                  id: re.id,
                  status: "finished",
                  class: { code: "AMB", display: "ambulatory" },
                  subject: { reference: `Patient/${targetPatient.id}` },
                  reasonCode: [{ text: re.chiefComplaints }],
                  period: { start: re.date, end: re.date },
                  diagnosis: [
                    {
                      condition: { display: re.diagnoses },
                      rank: 1
                    }
                  ]
                }
              });
            });
          }

          const fhirJson = {
            resourceType: "Bundle",
            id: `bundle-abdm-${Math.floor(10000 + Math.random() * 90000)}`,
            type: "document",
            timestamp: new Date().toISOString(),
            identifier: {
              system: "https://ndhm.gov.in/bundle",
              value: `checksum-sha256-${Math.floor(200000 + Math.random() * 800000)}`
            },
            entry: fhirResources
          };
          
          setFhirBundleJson(fhirJson);
          setFhirMapStep("fhir_ready");
        }
      }, (idx + 1) * 350);
    });
  };

  const dispatchFhirToNhe = () => {
    setFhirMapStep("converting"); // re-use loader
    setSyncLogs(prev => [...prev, "⚡ Initiating National Health Exchange handshake protocol..."]);
    
    setTimeout(() => {
      setFhirMapStep("synced");
      setSuccessMessage("FHIR Bundle uploaded securely to longitudinal NHA portal!");
    }, 1500);
  };

  // D [BULK ONBOARDING CAMPS COORDINATOR]
  const executeBulkCampGeneration = () => {
    setIsCampRunning(true);
    setCampProgress(0);
    setCampBulkResults([]);

    const batch: any[] = [];
    const names = [
      "Arjun Prasad", "Sunita Bai", "Rajesh Khurana", "Meena Kumari", "Devkinandan Joshi", 
      "Prem Lata", "Shiv Ram", "Santosh Devi", "Harish Chander", "Champa Negi",
      "Ganga Ram", "Kamlesh Kumari", "Bhim Sen", "Suman Devi", "Tara Chand"
    ];

    const intervalVal = setInterval(() => {
      setCampProgress(prev => {
        const next = prev + (100 / campCohortSize);
        if (next >= 100) {
          clearInterval(intervalVal);
          setIsCampRunning(false);
          setSuccessMessage(`Bulk registration camp execution finished. issued ${campCohortSize} digital cards!`);
        }
        return Math.min(next, 100);
      });

      const idx = Math.floor(Math.random() * names.length);
      const randomName = names[idx];
      const textNum = Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join("");
      const abhaNo = `${textNum.slice(0, 2)}-${textNum.slice(2, 6)}-${textNum.slice(6, 10)}-${textNum.slice(10, 14)}`;
      const abhaAddressStr = `${randomName.toLowerCase().replace(/\s+/g, ".")}${Math.floor(100 + Math.random() * 899)}@sbx`;

      const generatedObj = {
        name: randomName,
        abhaNumber: abhaNo,
        abhaId: abhaAddressStr,
        phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
        status: "Active"
      };

      batch.push(generatedObj);
      setCampBulkResults(prev => [...prev, generatedObj]);

      // Insert directly into federal mock table synchronously
      syncNewAbhaToDatabase({
        id: abhaNo,
        abhaId: abhaAddressStr,
        name: randomName,
        aadhaar: "BATCH-CAMP-MEMBER",
        gender: Math.random() > 0.5 ? "Male" : "Female",
        dob: "1975-08-11",
        phone: generatedObj.phone,
        status: "Active",
        updatedAt: new Date().toISOString()
      });

    }, 3000 / campCohortSize);
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-xs" id="national-abha-hub">
      {/* Banner HUD header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 p-6 text-white text-left select-none relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Sandbox Mode
          </span>
          <span className="bg-white/10 text-white/85 p-1.5 rounded-lg text-xs leading-none">ID: NHA-RE-119</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/10">
            <Shield className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">ABDM Registry Hub</h1>
            <p className="text-white/70 text-xs mt-0.5">National Health Authority Gateway for Digital Identity & Longitudinal Records Interoperability</p>
          </div>
        </div>
      </div>

      {/* Primary ABDM Navigation Menu */}
      <div className="flex bg-slate-100 border-b border-slate-200 overflow-x-auto select-none scrollbar-none">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "create" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FilePlus className="h-4 w-4" /> ABHA Account Issuance
        </button>
        <button
          onClick={() => setActiveTab("camp")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "camp" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" /> Bulk Camp Modules
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "verify" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Search className="h-4 w-4" /> Verify & Validate ID
        </button>
        <button
          onClick={() => setActiveTab("consent")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "consent" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-emerald-600 animate-pulse" /> Consent & Privacy (DPDP)
        </button>
        <button
          onClick={() => setActiveTab("link")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "link" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database className="h-4 w-4 text-blue-600" /> FHIR Interop Exchange
        </button>
        <button
          onClick={() => setActiveTab("scan_share")}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "scan_share" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <QrCode className="h-4 w-4 text-orange-600" /> OPD Scan & Share
        </button>
        <button
          onClick={() => setActiveTab("registries")}
          className={`px-4 py-3.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "registries" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Award className="h-4 w-4 text-yellow-600" /> HFR/HPR Registries
        </button>
      </div>

      {/* Main Alert Message Area */}
      {successMessage && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-250 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <BadgeAlert className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* TAB CONTENTS */}
      <div className="p-6">
        
        {/* TAB 1: CREATION ENGINES */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Method Switcher */}
            <div className="lg:col-span-4 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Registration Pathway</label>
              {[
                { id: "aadhaar", label: "Aadhaar Handshake OTP", desc: "Fastest standard demographic sync" },
                { id: "dl", label: "Driving License verification", desc: "Sarathi platform DigiLocker verify" },
                { id: "mobile", label: "Mobile Only Registry", desc: "Fallback demographic generation" },
                { id: "face", label: "Face Biometric Capture", desc: "Instant visual identity match" },
                { id: "demo", label: "Demographic Lookup", desc: "Manual state matches" }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCreationMethod(m.id as any);
                    setGeneratedAbhaCard(null);
                    setAadhaarStep("input");
                    setDlStep("input");
                    setMobileStep("phone");
                    setFaceStep("select");
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    creationMethod === m.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="text-xs font-bold leading-none">{m.label}</div>
                  <div className={`text-[10px] mt-1 leading-normal ${creationMethod === m.id ? "text-slate-300" : "text-slate-500"}`}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Middle Configuration Zone */}
            <div className="lg:col-span-8 border border-slate-250 rounded-xl p-6 bg-slate-50/20">
              
              {/* Aadhaar Creation Step */}
              {creationMethod === "aadhaar" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-4">
                    <Smartphone className="h-4.5 w-4.5 text-blue-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Aadhaar-Based e-KYC Verification</h3>
                  </div>

                  {aadhaarStep === "input" && (
                    <div className="space-y-4">
                      <p className="text-slate-500 text-xs">Verify patient Identity using Aadhaar via secure e-KYC payload exchange standard.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aadhaar Number *</label>
                          <input
                            type="text"
                            value={aadhaarInput}
                            maxLength={14}
                            onChange={handleAadhaarChange}
                            placeholder="XXXX-XXXX-XXXX"
                            className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name (as in Aadhaar) *</label>
                          <input
                            type="text"
                            value={aadhaarName}
                            onChange={(e) => setAadhaarName(e.target.value)}
                            placeholder="e.g. Ramesh Chandra Kumar"
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Number for UIDAI notification</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={aadhaarMobile}
                          onChange={(e) => setAadhaarMobile(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                        />
                      </div>

                      <button
                        onClick={triggerAadhaarOtpRequest}
                        disabled={isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs w-full cursor-pointer"
                      >
                        {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                        Initiate Aadhaar e-KYC Handshake
                      </button>
                    </div>
                  )}

                  {aadhaarStep === "otp" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs leading-relaxed font-semibold">
                        🔑 Sandbox Hook: Use simulated verification OTP <strong className="text-amber-700 underline">123456</strong> to proceed.
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter 6-digit Aadhaar OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={aadhaarOtp}
                          onChange={(e) => setAadhaarOtp(e.target.value)}
                          placeholder="______"
                          className="w-full text-center tracking-widest text-base font-extrabold border border-indigo-405 text-indigo-750 rounded-lg p-3 focus:outline-hidden font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAadhaarStep("input")}
                          className="w-1/3 border text-slate-600 font-bold text-xs px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50"
                        >
                          Modify Details
                        </button>
                        <button
                          onClick={verifyAadhaarOtpAndGenerate}
                          disabled={isProcessing}
                          className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                          Verify UIDAI Credentials
                        </button>
                      </div>
                    </div>
                  )}

                  {aadhaarStep === "complete" && generatedAbhaCard && <AbhaCardViewer card={generatedAbhaCard} />}

                </div>
              )}

              {/* Driving License Step */}
              {creationMethod === "dl" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-4">
                    <FileText className="h-4.5 w-4.5 text-indigo-700" />
                    <h3 className="font-bold text-slate-800 text-sm">Driving License Registry Integration</h3>
                  </div>

                  {dlStep === "input" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Driving License Number (DL) *</label>
                          <input
                            type="text"
                            value={dlInput}
                            onChange={(e) => setDlInput(e.target.value)}
                            placeholder="e.g. DL-1112223344"
                            className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name (as in DL)</label>
                          <input
                            type="text"
                            value={dlName}
                            onChange={(e) => setDlName(e.target.value)}
                            placeholder="e.g. Priyanjali Sen"
                            className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={dlDob}
                            onChange={(e) => setDlDob(e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Verified Mobile No</label>
                          <input
                            type="text"
                            value={dlMobile}
                            maxLength={10}
                            onChange={(e) => setDlMobile(e.target.value)}
                            placeholder="e.g. 9822334455"
                            className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        onClick={triggerDlOtpRequest}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs p-3 rounded-lg w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Handshake with DigiLocker System
                      </button>
                    </div>
                  )}

                  {dlStep === "otp" && (
                    <div className="space-y-4 font-sans">
                      <div className="p-3 bg-amber-50 text-slate-705 border rounded-lg text-xs font-semibold">
                        🔒 DigiLocker SMS Gateway trigger simulation. Enter code <strong className="underline text-indigo-700">654321</strong> to confirm profile audit.
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter DigiLocker OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={dlOtp}
                          onChange={(e) => setDlOtp(e.target.value)}
                          placeholder="654321"
                          className="w-full font-mono text-center text-sm font-bold border rounded p-2.5 focus:outline-hidden"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setDlStep("input")} className="w-1/2 border font-bold text-xs p-2.5 rounded hover:bg-slate-50 cursor-pointer">Back</button>
                        <button onClick={verifyDlOtpAndGenerate} className="w-1/2 bg-green-600 text-white font-bold text-xs p-2.5 rounded hover:bg-green-700 cursor-pointer">Map sarathi system</button>
                      </div>
                    </div>
                  )}

                  {dlStep === "complete" && generatedAbhaCard && <AbhaCardViewer card={generatedAbhaCard} />}

                </div>
              )}

              {/* Mobile OTP Demographics Mode */}
              {creationMethod === "mobile" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-4">
                    <Smartphone className="h-4.5 w-4.5 text-indigo-700" />
                    <h3 className="font-bold text-slate-800 text-sm">Aadhaar-Free Mobile OTP Account Creation</h3>
                  </div>

                  {mobileStep === "phone" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter Mobile Number *</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={mobileOnlyNumber}
                          onChange={(e) => setMobileOnlyNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 7890123456"
                          className="w-full text-xs font-bold border border-slate-300 rounded-lg p-3 bg-white focus:outline-hidden"
                        />
                      </div>
                      <button
                        onClick={triggerMobileOtp}
                        className="w-full bg-slate-900 text-white text-xs font-bold p-3 rounded-lg hover:bg-slate-850 cursor-pointer"
                      >
                        Request ABDM OTP packet
                      </button>
                    </div>
                  )}

                  {mobileStep === "otp" && (
                    <div className="space-y-4">
                      <div className="p-2.5 bg-blue-50 text-blue-800 rounded border text-xs">
                        🔑 Simulated ABDM mobile packet. OTP code: <strong>987654</strong>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter Mobile Verify Pin</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={mobileOtpInput}
                          onChange={(e) => setMobileOtpInput(e.target.value)}
                          placeholder="987654"
                          className="w-full text-center border font-mono tracking-widest text-sm p-2.5 rounded focus:outline-hidden"
                        />
                      </div>
                      <button
                        onClick={verifyMobileOtp}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded cursor-pointer"
                      >
                        Confirm Mobile Verify Pin
                      </button>
                    </div>
                  )}

                  {mobileStep === "profile" && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">Provide direct demographic parameters due to lack of Aadhaar integration proxy.</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
                          <input
                            type="text"
                            value={mobileDemographics.name}
                            onChange={(e) => setMobileDemographics({...mobileDemographics, name: e.target.value})}
                            className="w-full text-xs border rounded p-2.5 focus:outline-hidden bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={mobileDemographics.dob}
                            onChange={(e) => setMobileDemographics({...mobileDemographics, dob: e.target.value})}
                            className="w-full text-xs border rounded p-2.5 focus:outline-hidden bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                          <select
                            value={mobileDemographics.gender}
                            onChange={(e) => setMobileDemographics({...mobileDemographics, gender: e.target.value as any})}
                            className="w-full text-xs border rounded p-2.5 focus:outline-hidden bg-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                          <input
                            type="text"
                            value={mobileDemographics.state}
                            onChange={(e) => setMobileDemographics({...mobileDemographics, state: e.target.value})}
                            className="w-full text-xs border rounded p-2.5 focus:outline-hidden bg-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={generateMobileAbha}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold p-3 rounded-lg cursor-pointer"
                      >
                        Issue New Demographic ABHA
                      </button>
                    </div>
                  )}

                  {mobileStep === "complete" && generatedAbhaCard && <AbhaCardViewer card={generatedAbhaCard} />}

                </div>
              )}

              {/* Biometric Face Verification Mode */}
              {creationMethod === "face" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-4">
                    <Award className="h-4.5 w-4.5 text-indigo-700" />
                    <h3 className="font-bold text-slate-800 text-sm">NHA Biometric Face Authentication</h3>
                  </div>

                  {faceStep === "select" && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Use high-security face detection models compared with UIDAI database archives to issue instant compliant credentials without physical OTP.
                      </p>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Patient to Validate Biometrics</label>
                        <select
                          value={selectedPatientForFace}
                          onChange={(e) => setSelectedPatientForFace(e.target.value)}
                          className="w-full text-xs border rounded-lg p-3 bg-white focus:outline-hidden"
                        >
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (UHID ID: {p.id})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => initializeBiometricAuth(selectedPatientForFace)}
                        disabled={!selectedPatientForFace}
                        className="w-full bg-slate-900 text-white text-xs font-bold p-3 rounded-lg hover:bg-slate-850 cursor-pointer disabled:bg-slate-200"
                      >
                        Launch Camera Camera Auth Session
                      </button>
                    </div>
                  )}

                  {faceStep === "scanning" && (
                    <div className="space-y-4 text-center py-6">
                      <div className="relative w-32 h-32 mx-auto rounded-full bg-blue-50 border-4 border-dashed border-indigo-600 flex items-center justify-center animate-spin">
                        <Activity className="h-10 w-10 text-indigo-600 animate-pulse" />
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full" style={{width: `${faceScanProgress}%`}} />
                      </div>

                      <div className="bg-slate-900 text-left p-3.5 rounded-lg border text-[11px] font-mono text-slate-400 space-y-1 mt-4 scrollbar-none h-44 overflow-y-auto">
                        <div className="font-bold text-amber-400">⚡ LIVE BIOCAM LOG CONSOLE:</div>
                        {faceScanLog.map((lg, i) => <div key={i}>{lg}</div>)}
                      </div>
                    </div>
                  )}

                  {faceStep === "matched" && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg mb-2">
                        99%
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Biometric Template Identity Audit Success!</h4>
                      <p className="text-xs text-slate-500">Aadhaar verified face credentials verified locally in Central NHA cloud vaults.</p>
                      
                      <button
                        onClick={signFaceAuthAbha}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded mt-3 cursor-pointer"
                      >
                        Generate securely signed ABHA Profile
                      </button>
                    </div>
                  )}

                  {faceStep === "complete" && generatedAbhaCard && <AbhaCardViewer card={generatedAbhaCard} />}

                </div>
              )}

              {/* Demographic manual search registry Match */}
              {creationMethod === "demo" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-4">
                    <Database className="h-4.5 w-4.5 text-indigo-700" />
                    <h3 className="font-bold text-slate-800 text-sm">Demographic-Based Health Account Retrieval</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State Profile</label>
                      <input
                        type="text"
                        value={demoSearchForm.state}
                        onChange={(e) => setDemoSearchForm({...demoSearchForm, state: e.target.value})}
                        className="w-full text-xs border rounded p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
                      <input
                        type="text"
                        value={demoSearchForm.district}
                        onChange={(e) => setDemoSearchForm({...demoSearchForm, district: e.target.value})}
                        className="w-full text-xs border rounded p-2.5 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partial Beneficiary Name *</label>
                      <input
                        type="text"
                        value={demoSearchForm.name}
                        onChange={(e) => setDemoSearchForm({...demoSearchForm, name: e.target.value})}
                        placeholder="e.g. Priyanka Patel"
                        className="w-full text-xs border rounded p-2.5 bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Year of Birth (Optional)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={demoSearchForm.birthYear}
                        onChange={(e) => setDemoSearchForm({...demoSearchForm, birthYear: e.target.value})}
                        placeholder="1990"
                        className="w-full text-xs border rounded p-2.5 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDemographicSearch}
                    className="w-full bg-slate-900 text-white hover:bg-slate-850 text-xs font-bold py-2.5 rounded cursor-pointer"
                  >
                    Search National Health Registries Gateway
                  </button>

                  {demoSearchTriggered && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div className="bg-slate-50 px-3 py-2 border-b text-[10px] font-bold text-slate-500 uppercase">
                        Returned Gateway Query Matches
                      </div>
                      
                      {demoSearchResults.length > 0 ? (
                        <div className="divide-y text-xs select-none">
                          {demoSearchResults.map((dm, i) => (
                            <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50">
                              <div>
                                <strong className="text-slate-800">{dm.name}</strong>
                                <span className="text-[10px] text-slate-400 block mt-0.5">UID: {dm.abhaId} | DoB: {dm.dob}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setGeneratedAbhaCard({
                                    id: dm.abhaId,
                                    num: dm.id,
                                    name: dm.name,
                                    dob: dm.dob,
                                    gender: dm.gender,
                                    mobile: dm.phone,
                                    source: "Demographic search match"
                                  });
                                  setSuccessMessage("Linked profile retrieved successfully.");
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2 rounded cursor-pointer"
                              >
                                Retrieve Profile Card
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No matching national profiles indexed. Proceed to issue standard Aadhaar e-KYC cards.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: BULK REGISTRATION CAMPS */}
        {activeTab === "camp" && (
          <div className="space-y-6">
            <div className="bg-slate-50 border rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4" id="camp-config-panel">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Camp Name Identification</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full text-xs border rounded p-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Camp Sector Location</label>
                <input
                  type="text"
                  value={campLocation}
                  onChange={(e) => setCampLocation(e.target.value)}
                  className="w-full text-xs border rounded p-2 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={executeBulkCampGeneration}
                  disabled={isCampRunning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-indigo-400"
                >
                  {isCampRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Execute Camp Generation ({campCohortSize} Kohorts)
                </button>
              </div>
            </div>

            {isCampRunning && (
              <div className="space-y-2 border border-blue-100 bg-blue-50/10 p-4 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-blue-800">
                  <span>Camp Onboarding Progress ...</span>
                  <span>{Math.round(campProgress)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300" style={{width: `${campProgress}%`}} />
                </div>
              </div>
            )}

            {campBulkResults.length > 0 && (
              <div className="border rounded-xl bg-white overflow-hidden shadow-xs">
                <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Camp Registry Dashboard ({campBulkResults.length} Members)</h4>
                    <p className="text-[10px] text-slate-400">Newly processed files synched to Ayushman sandbox registries.</p>
                  </div>
                  <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer">
                    <Printer className="h-3 w-3" /> Batch Print Slips
                  </button>
                </div>
                
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase border-b select-none">
                      <th className="p-3">Beneficiary</th>
                      <th className="p-3">14-Digit ABHA No</th>
                      <th className="p-3">ABDM Health ID</th>
                      <th className="p-3">Phone Linked</th>
                      <th className="p-3 text-right">E-Card Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {campBulkResults.map((cm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/55 transition">
                        <td className="p-3 font-semibold text-slate-800">{cm.name}</td>
                        <td className="p-3 font-mono text-slate-600">{cm.abhaNumber}</td>
                        <td className="p-3"><span className="p-1 px-2 border rounded bg-slate-50 font-mono text-indigo-700 text-[10px]">{cm.abhaId}</span></td>
                        <td className="p-3 text-slate-500 text-[11px]">{cm.phone}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setGeneratedAbhaCard({
                                id: cm.abhaId,
                                num: cm.abhaNumber,
                                name: cm.name,
                                dob: "1975-08-11",
                                gender: "Male",
                                mobile: cm.phone,
                                source: "Mega Camp Sync"
                              });
                              setSuccessMessage(`E-Card loaded for camp member ${cm.name}`);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] py-1 px-2.5 rounded transition cursor-pointer"
                          >
                            Unfurl Slip
                          </button>
                        </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERIFICATION AND VALIDATION MODULE */}
        {activeTab === "verify" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-5 space-y-4 border p-6 rounded-xl bg-slate-50/20">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">Gateway Authentication</h3>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter 14-Digit ABHA Number or ABHA Address ID</label>
                <input
                  type="text"
                  value={verAbhaIdOrNum}
                  onChange={(e) => setVerAbhaIdOrNum(e.target.value)}
                  placeholder="e.g. priyanka.patel@sbx"
                  className="w-full text-xs font-bold border rounded-lg p-3 bg-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={runAbhaVerification}
                disabled={isProcessing}
                className="w-full bg-slate-900 border hover:bg-slate-850 text-slate-100 font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                Pull Profile from NHA Federated Grid
              </button>

              {verOtpSent && (
                <div className="border-t pt-4 space-y-3">
                  <div className="p-2.5 bg-blue-50 text-slate-705 border border-blue-200 text-xs rounded-lg uppercase">
                    Verification PIN sent: <strong className="underline font-mono text-indigo-700">556123</strong>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter verification PIN to override</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verOtpInput}
                      onChange={(e) => setVerOtpInput(e.target.value)}
                      placeholder="e.g. 556123"
                      className="w-full text-center border p-2.5 text-xs font-bold rounded focus:outline-hidden bg-white font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (verOtpInput === "556123") {
                        setVerOtpVerified(true);
                        setSuccessMessage("Mobile verification PIN active. Multi-Hospital linkage verified.");
                      } else {
                        setErrorMessage("Wrong PIN code! Correct PIN is 556123.");
                      }
                    }}
                    className="w-full bg-green-600 text-white font-bold text-xs py-2 rounded hover:bg-green-700 cursor-pointer"
                  >
                    Confirm PIN Code Verification
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {verResult ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">ABDM Profile Sync Verdict</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      verResult.status === "verified" ? "bg-green-100 text-green-800" :
                      verResult.status === "warning" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }`}>
                      {verResult.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 leading-normal">{verResult.message}</p>
                    
                    {/* Discrepancies Warn Area */}
                    {verResult.warnings.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-250 text-[11px] font-semibold text-amber-800 space-y-1">
                        <div className="font-bold flex items-center gap-1 mb-1 text-slate-800 uppercase">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> ABDM Integrity Warnings:
                        </div>
                        {verResult.warnings.map((wr, idx) => <div key={idx}>{wr}</div>)}
                      </div>
                    )}

                    {verResult.abhaDetails && (
                      <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">NHA Demographic Payload</div>
                        <div className="grid grid-cols-2 gap-3 text-xs leading-none select-none">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Official Name:</span>
                            <span className="font-bold text-slate-800">{verResult.abhaDetails.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Gender:</span>
                            <span className="font-bold text-slate-800">{verResult.abhaDetails.gender}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Date of Birth:</span>
                            <span className="font-bold text-slate-800">{verResult.abhaDetails.dob}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Status in registry:</span>
                            <span className="font-bold text-green-700">{verResult.abhaDetails.status}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!verResult.matchedLocalPatient && verResult.abhaDetails && (
                      <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-xl text-xs space-y-3">
                        <p className="text-slate-700 font-medium">This patient currently exists in NHA National health directories, but has No active local hospital files mapped to their profile.</p>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Onboard EMR Map to Local Patient record</label>
                          <select
                            value={linkSelectedPatientId}
                            onChange={(e) => setLinkSelectedPatientId(e.target.value)}
                            className="w-full text-xs border rounded p-2.5 bg-white font-bold"
                          >
                            <option value="">-- Choose local hospital EHR --</option>
                            {patients.filter(p => !p.abhaId).map(p => (
                              <option key={p.id} value={p.id}>{p.name} (UHID ID: {p.id})</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => handleLinkAbhaWithExistingPatient(linkSelectedPatientId, verResult.abhaDetails!.abhaId, verResult.abhaDetails!.id)}
                          disabled={!linkSelectedPatientId || isProcessing}
                          className="bg-indigo-600 text-white font-bold p-2.5 rounded text-xs hover:bg-indigo-700 w-full disabled:bg-slate-300 cursor-pointer"
                        >
                          Establish Linkage Securely
                        </button>
                      </div>
                    )}

                    {verResult.status === "warning" && verResult.matchedLocalPatient && verResult.abhaDetails && (
                      <button
                        onClick={async () => {
                          // Perform one click name correction directly in mock hospital DB
                          setIsProcessing(true);
                          const pat = verResult.matchedLocalPatient!;
                          pat.name = verResult.abhaDetails!.name; // correcting mismatched name
                          
                          await fetch(`/api/patients`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(pat)
                          });

                          if (onRefreshData) onRefreshData();
                          setIsProcessing(false);
                          setSuccessMessage("Hospital local demographic name corrected from national registries successfully.");
                          setVerResult(null);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold p-2.5 rounded w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Correct Hospital EMR Name with National Identity Card
                      </button>
                    )}

                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                  <ShieldAlert className="h-8 w-8 text-slate-300 mb-2" />
                  Perform credential analysis to inspect for duplications, identity differences, or multiple registration hazards.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: LONGITUDINAL HEALTH RECORD LINKAGE & FHIR WORKFLOWS (M2/M3) */}
        {activeTab === "link" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-5 border p-6 rounded-xl bg-slate-50/20 space-y-4">
              <h3 className="font-bold text-slate-850 text-sm border-b pb-2 mb-3">Longitudinal Record Mapping</h3>
              <p className="text-slate-500 text-xs leading-normal">
                Synthesize and securely upload clinical EMR documents (OPD consultations, admissions, lab trials) mapped into standard compliant **HL7 FHIR Bundle** packets.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Patient to Export Records</label>
                <select
                  value={linkSelectedPatientId}
                  onChange={(e) => {
                    setLinkSelectedPatientId(e.target.value);
                    setFhirMapStep("select");
                    setFhirBundleJson(null);
                  }}
                  className="w-full text-xs border rounded-lg p-3 bg-white focus:outline-hidden"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.filter(p => p.abhaId).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.abhaId})</option>
                  ))}
                </select>
              </div>

              {linkSelectedPatientId && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target FHIR Schema / Document Type *</label>
                    <select
                      value={fhirDocType}
                      onChange={(e) => {
                        setFhirDocType(e.target.value as any);
                        setFhirMapStep("select");
                        setFhirBundleJson(null);
                      }}
                      className="w-full text-xs font-bold border rounded-lg p-2.5 bg-white focus:outline-hidden text-indigo-950 font-sans"
                    >
                      <option value="opd">HL7 FHIR OPD Consultation (Encounter Resource)</option>
                      <option value="prescription">HL7 FHIR Digital ePrescription (MedicationRequest Bunch)</option>
                      <option value="discharge">HL7 FHIR Clinical Discharge Summary (Composition Node)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                      FHIR structured exports are mandatory for ABDM unified longitudinal patient records search queries.
                    </span>
                  </div>

                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Hospital Documents to Compile</label>
                  <div className="border rounded bg-white p-3 divide-y text-xs max-h-48 overflow-y-auto">
                    {encounters.filter(e => e.patientId === linkSelectedPatientId).map((e, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-2 text-left">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="text-slate-800">OPD Case: {e.chiefComplaints}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Diagnose: {e.diagnoses && Array.isArray(e.diagnoses) ? e.diagnoses.map(d => d.display).join(", ") : (typeof e.diagnoses === "string" ? e.diagnoses : "General Checkup")} | BP Vitals: {e.vitals?.bp || "Good"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {encounters.filter(e => e.patientId === linkSelectedPatientId).length === 0 && (
                      <p className="text-slate-400 p-2 text-center text-xs">No active diagnostic encounters located.</p>
                    )}
                  </div>

                  <button
                    onClick={renderFhirEncoder}
                    className="w-full bg-slate-900 text-white font-bold text-xs p-3 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                  >
                    <Database className="h-4 w-4 text-indigo-400" />
                    Compile HL7 FHIR {fhirDocType === "opd" ? "OPD" : fhirDocType === "prescription" ? "ePrescription" : "Discharge"} Payload
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {fhirMapStep === "converting" && (
                <div className="border border-indigo-100 bg-indigo-50/10 rounded-xl p-5 text-left py-12 text-xs space-y-4">
                  <div className="flex justify-between items-center font-bold text-indigo-705">
                    <span>Converting to National FHIR Standards...</span>
                    <span>{syncPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 h-full transition-all duration-300" style={{width: `${syncPercentage}%`}} />
                  </div>
                  <div className="bg-slate-900 rounded p-4 border font-mono text-[10px] text-slate-400 leading-normal max-h-44 overflow-y-auto mt-4">
                    {syncLogs.map((lg, idx) => <div key={idx} className="mt-1">{lg}</div>)}
                  </div>
                </div>
              )}

              {fhirMapStep === "fhir_ready" && fhirBundleJson && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Secure FHIR Bundle Document Package</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">DPDP Compliant & Signed locally with NHA cryptos</span>
                    </div>
                    <button
                      onClick={dispatchFhirToNhe}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Lock className="h-3 w-3" /> Transmit to Exchange
                    </button>
                  </div>
                  
                  <textarea
                    readOnly
                    value={JSON.stringify(fhirBundleJson, null, 2)}
                    className="w-full h-96 p-4 font-mono text-[11px] text-green-400 bg-slate-900 border-0 focus:outline-hidden"
                  />
                </div>
              )}

              {fhirMapStep === "synced" && (
                <div className="border border-green-200 bg-green-50/10 rounded-xl p-6 text-center flex flex-col items-center justify-center">
                  <FileCheck className="h-10 w-10 text-green-700 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">FHIR Records Bundled & Dispatched Completing!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    The health records were successfully integrated on the central NHA servers. Multi-hospital networks can now request consent-based audits.
                  </p>
                  <button
                    onClick={() => setFhirMapStep("select")}
                    className="border text-slate-700 hover:bg-slate-55 text-xs font-bold py-1.5 px-4 rounded mt-4 cursor-pointer"
                  >
                    Exchanger Next Document
                  </button>
                </div>
              )}

              {fhirMapStep === "select" && (
                <div className="h-full border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs py-16">
                  <HardDrive className="h-8 w-8 text-slate-350 mb-2" />
                  Audit EMR diagnostic observation payloads to bundle as compliant HL7 records.
                </div>
              )}
            </div>
          </div>
        )}

         {/* --- TAB 5: ABDM CONSENT MANAGER WORKSPACE --- */}
        {activeTab === "consent" && (
          <div className="space-y-6 select-none font-sans text-left">
            {/* Top Command Banner explaining features */}
            <div className="p-5 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-1 font-sans">
                  🛡️ FIPS-140-2 & DPDP Compliant WebNode
                </span>
                <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
                  ABDM Privacy & Security Policy Command Central
                </h2>
                <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
                  Configure patient authorizations under the India DPDP Act 2023. Real-time logging records every view, withdrawal, erasure, and cryptographic rotation cleanly to meet National Health Authority (NHA) statutory gate audits.
                </p>
              </div>

              {/* Quick Status Pill */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10.5px] font-mono font-medium text-slate-300 space-y-1 shrink-0">
                <div className="flex justify-between gap-6">
                  <span>AES DB CRYPTO:</span>
                  <span className="text-emerald-400 font-bold font-sans">Active (256-Bit)</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span>AUDIT SYSTEM:</span>
                  <span className="text-indigo-400 font-bold font-sans">SHA-256 Chained</span>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Pills */}
            <div className="flex bg-slate-100 border p-1 rounded-xl gap-1 text-xs font-bold max-w-2xl justify-start overflow-x-auto scrollbar-none">
              <button
                onClick={() => setPrivacySubTab("consent_manager")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition cursor-pointer shrink-0 ${
                  privacySubTab === "consent_manager" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-emerald-600" /> Patient Consent Manager
              </button>
              <button
                onClick={() => setPrivacySubTab("dpdp_privacy")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition cursor-pointer shrink-0 ${
                  privacySubTab === "dpdp_privacy" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="h-4 w-4 text-indigo-650" /> DPDP Compliance Notices
              </button>
              <button
                onClick={() => setPrivacySubTab("audit_logging")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition cursor-pointer shrink-0 ${
                  privacySubTab === "audit_logging" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="h-4 w-4 text-rose-655 animate-pulse" /> Secure Audit Ledger
              </button>
              <button
                onClick={() => setPrivacySubTab("secure_storage")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition cursor-pointer shrink-0 ${
                  privacySubTab === "secure_storage" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HardDrive className="h-4 w-4 text-blue-650" /> Secure Health Storage
              </button>
            </div>

            {/* Dynamic Rendering of Panels based on selected Sub Tab */}
            <div className="pt-2">
              {privacySubTab === "consent_manager" && (
                <ConsentManagerPanel
                  patients={patients}
                  newConsentPatientId={newConsentPatientId}
                  setNewConsentPatientId={setNewConsentPatientId}
                  newConsentPurpose={newConsentPurpose}
                  setNewConsentPurpose={setNewConsentPurpose}
                  newConsentScope={newConsentScope}
                  setNewConsentScope={setNewConsentScope}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  consentOtpSent={consentOtpSent}
                  setConsentOtpSent={setConsentOtpSent}
                  consentOtpInput={consentOtpInput}
                  setConsentOtpInput={setConsentOtpInput}
                  consentActiveRequestJson={consentActiveRequestJson}
                  setConsentActiveRequestJson={setConsentActiveRequestJson}
                  consentActiveResponseJson={consentActiveResponseJson}
                  setConsentActiveResponseJson={setConsentActiveResponseJson}
                  consentLogs={consentLogs}
                  setConsentLogs={setConsentLogs}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  privacySecurityLogs={privacySecurityLogs}
                  setPrivacySecurityLogs={setPrivacySecurityLogs}
                />
              )}

              {privacySubTab === "dpdp_privacy" && (
                <DpdpActPanel
                  patients={patients}
                  dpdpLanguage={dpdpLanguage}
                  setDpdpLanguage={setDpdpLanguage}
                  dpdpErasePatientId={dpdpErasePatientId}
                  setDpdpErasePatientId={setDpdpErasePatientId}
                  dpdpEraseReason={dpdpEraseReason}
                  setDpdpEraseReason={setDpdpEraseReason}
                  dpdpGrievanceLog={dpdpGrievanceLog}
                  setDpdpGrievanceLog={setDpdpGrievanceLog}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  setPrivacySecurityLogs={setPrivacySecurityLogs}
                  grievantName={grievantName}
                  setGrievantName={setGrievantName}
                  grivType={grivType}
                  setGrivType={setGrivType}
                  grivDetails={grivDetails}
                  setGrivDetails={setGrivDetails}
                />
              )}

              {privacySubTab === "audit_logging" && (
                <SecurityAuditTrailPanel
                  privacySecurityLogs={privacySecurityLogs}
                  setPrivacySecurityLogs={setPrivacySecurityLogs}
                  auditSearchQuery={auditSearchQuery}
                  setAuditSearchQuery={setAuditSearchQuery}
                  auditSeverityFilter={auditSeverityFilter}
                  setAuditSeverityFilter={setAuditSeverityFilter}
                  setSuccessMessage={setSuccessMessage}
                  patients={patients}
                />
              )}

              {privacySubTab === "secure_storage" && (
                <SecureClinicalStoragePanel
                  secureStorageStatus={secureStorageStatus}
                  setSecureStorageStatus={setSecureStorageStatus}
                  setSuccessMessage={setSuccessMessage}
                  setPrivacySecurityLogs={setPrivacySecurityLogs}
                />
              )}
            </div>
          </div>
        )}

        {/* --- TAB 6: OPD SCAN & SHARE QR KIOSK (M1 Integration) --- */}
        {activeTab === "scan_share" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans text-left">
            {/* Left box: Unified QR code Visualizer */}
            <div className="lg:col-span-4 border border-slate-200 p-6 rounded-xl bg-slate-100/55 flex flex-col items-center justify-center text-center space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-805 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-orange-200">
                <QrCode className="h-3 w-3 text-orange-605" /> Live Kiosk Active
              </span>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-sm relative">
                <div className="absolute inset-0 border-2 border-orange-500/20 m-2 rounded-xl border-dashed pointer-events-none animate-pulse" />
                {/* Simulated Beautiful Stylized ABDM QR Code */}
                <div className="w-56 h-56 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center rounded-xl p-3">
                  <QrCode className="h-44 w-44 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold tracking-wider text-slate-500 mt-2 uppercase">Facility Kiosk ID: HFR-SBX-1337</span>
                </div>
              </div>

              <div className="space-y-1 max-w-xs">
                <h4 className="font-extrabold text-slate-800 text-xs">ABDM Kiosk Registration Counter</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Patients scan this QR code with Aarogya Setu or national PHR apps to broadcast encrypted demographics, bypass long lines, and register instantly.
                </p>
              </div>

              <div className="w-full bg-white p-3 border border-slate-200 rounded-lg">
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Counter Terminal Location</label>
                <select
                  value={scanShareCurrentLocation}
                  onChange={(e) => setScanShareCurrentLocation(e.target.value)}
                  className="w-full text-xs font-bold border rounded p-1.5 focus:outline-hidden text-slate-800"
                >
                  <option value="OPD Reception Counter Desk A">OPD Reception Counter Desk A</option>
                  <option value="Emergency Admitting Unit B">Emergency Admitting Unit B</option>
                  <option value="Specialty Cardiology Bay Floor 2">Specialty Cardiology Bay Floor 2</option>
                </select>
              </div>
            </div>

            {/* Right box: Simulated scan feed and mobile verification queue */}
            <div className="lg:col-span-8 space-y-4">
              <div className="border rounded-xl p-5 bg-white shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-4.5 w-4.5 text-orange-600" />
                    <h3 className="font-extrabold text-slate-800 text-sm">Scan & Share OPD Incoming Feed</h3>
                  </div>

                  <button
                    onClick={() => {
                      setScannedDemographics(null);
                      setScannedOtp("");
                      setScannedStep("simulated_scanned");
                      setScanShareActiveToken(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition"
                  >
                    Simulate New Patient QR Scan
                  </button>
                </div>

                {/* Simulated Scanned Patient Picker Module */}
                {scannedStep === "simulated_scanned" && (
                  <div className="p-4 bg-orange-50/40 border border-orange-200 rounded-xl space-y-4 text-left">
                    <h4 className="text-xs font-extrabold text-orange-900 uppercase tracking-wide">PHR App Handshake: Pick ABHA Beneficiary to Mock Scan</h4>
                    
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {patients.map(p => {
                        const abhaNo = p.abhaNumber || `45-9201-${Math.floor(1000 + Math.random()*9000)}-4411`;
                        const abhaAddress = p.abhaId || `${p.name.toLowerCase().replace(/\s+/g, ".")}@sbx`;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setScannedDemographics({
                                abhaId: abhaAddress,
                                abhaNumber: abhaNo,
                                name: p.name,
                                gender: p.gender,
                                dob: p.dob,
                                phone: p.phone,
                                address: p.address,
                                district: p.district,
                                state: p.state,
                                key: p.id
                              });
                              setScannedStep("otp_verify");
                              setSuccessMessage("Handshaked with central PHR App! Demographic details fetched.");
                            }}
                            className="bg-white hover:bg-slate-50 border p-2.5 rounded-lg text-left text-xs text-slate-850 font-bold flex flex-col cursor-pointer transition select-text"
                          >
                            <span>{p.name}</span>
                            <span className="text-[9px] text-indigo-700 font-normal">{abhaAddress}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scanned Demographics & Verification Step */}
                {scannedStep === "otp_verify" && scannedDemographics && (
                  <div className="p-4 border border-indigo-150 bg-indigo-50/10 rounded-xl space-y-4 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-indigo-950 block">Encrypted Demographics Package Shared</span>
                      <span className="p-1 bg-green-100 border border-green-200 text-green-800 text-[9px] font-bold rounded">Handshaked</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs p-3 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[9.5px] uppercase">Official Name</span>
                        <span className="font-black text-slate-800">{scannedDemographics.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9.5px] uppercase">ABHA Address</span>
                        <span className="font-mono font-bold text-slate-850">{scannedDemographics.abhaId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9.5px] uppercase">ABHA Number</span>
                        <span className="font-mono font-bold text-slate-850">{scannedDemographics.abhaNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-3 font-sans text-left">
                      <div className="p-2.5 bg-yellow-50 text-slate-705 border border-yellow-250 text-xs rounded-lg font-semibold leading-relaxed">
                        🔑 Sandbox SMS OTP Challenge: Input custom authentication OTP <strong className="underline text-orange-700 font-extrabold">999222</strong> to generate checkout registration.
                      </div>
                      <div className="flex gap-3 items-end">
                        <div className="w-1/2 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter 6-Digit SMS OTP</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={scannedOtp}
                            onChange={(e) => setScannedOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="______"
                            className="w-full text-center tracking-widest text-sm font-black border border-slate-300 text-indigo-950 rounded-lg p-2 font-mono bg-white focus:outline-hidden"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (scannedOtp !== "999222") {
                              setErrorMessage("Wrong OTP code entered! Sandbox OTP code is 999222.");
                              return;
                            }
                            setIsProcessing(true);
                            setTimeout(() => {
                              const tokenNo = `OPD-TK-${Math.floor(100 + Math.random() * 899)}`;
                              const scanRecord = {
                                ...scannedDemographics,
                                id: `S&S-${Math.floor(1000 + Math.random() * 9000)}`,
                                token: tokenNo,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              };
                              setIncomingScansQueue(prev => [scanRecord, ...prev]);
                              setScanShareActiveToken(tokenNo);
                              setScannedStep("registered");
                              setIsProcessing(false);
                              setSuccessMessage(`OPD Ticket ${tokenNo} issued! Patient added to outpatient waiting counter list.`);
                            }, 1200);
                          }}
                          className="w-1/2 bg-slate-900 hover:bg-slate-850 text-slate-50 font-bold text-xs p-2 rounded-lg cursor-pointer h-10 flex items-center justify-center gap-1.5"
                        >
                          {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                          Verify & Print Token Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Token Ticket Completed Block */}
                {scannedStep === "registered" && scanShareActiveToken && (
                  <div className="p-5 bg-emerald-50/15 border border-emerald-150 rounded-xl text-center space-y-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                    <div>
                      <h4 className="text-sm font-black text-slate-800">OPD DEMOGRAPHIC TICKET ISSUED Successfully!</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal mt-0.5">
                        Shared core demographics mapped to local registrations. Print physical thermal ticket below.
                      </p>
                    </div>

                    {/* Virtual Thermal Receipt Layout */}
                    <div className="max-w-xs mx-auto bg-slate-50 border border-slate-205 rounded-xl p-4 font-mono select-none text-left space-y-2 border-dashed">
                      <div className="text-center font-bold border-b border-dashed border-slate-300 pb-2">
                        <span className="text-[10px] block font-bold leading-normal">AMBEDKAR SANDBOX HOSPITALS</span>
                        <span className="text-[8px] text-slate-400 block tracking-wider mt-0.5">SCAN & SHARE OPD COUNTER</span>
                      </div>
                      <div className="text-[10px] space-y-1">
                        <div>Location: <span className="font-bold">{scanShareCurrentLocation}</span></div>
                        <div>Date: <span>{new Date().toISOString().split("T")[0]}</span></div>
                        <div>Patient: <span className="font-bold">{scannedDemographics?.name}</span></div>
                        <div>ABHA: <span className="font-bold">{scannedDemographics?.abhaId}</span></div>
                      </div>
                      <div className="border-t border-b border-dashed border-slate-300 py-3 text-center my-3">
                        <span className="text-[8px] text-slate-450 uppercase block font-bold text-center">OPD DEMOGRAPHIC QUEUE INDEX</span>
                        <span className="text-2xl font-black text-indigo-900 tracking-wider text-center block">
                          {scanShareActiveToken}
                        </span>
                      </div>
                      <div className="text-[7.5px] text-slate-400 text-center leading-relaxed">
                        Scan again using national Health apps. Integrates REST API v1.0 standard with NHA.
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border text-slate-750 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Print Ticket Receipt
                      </button>
                      <button
                        onClick={() => {
                          setScannedStep("waiting");
                          setScannedDemographics(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Next Counter Patient
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Incoming Feed Table */}
                <div className="space-y-2.5 text-left">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Live Counter Queue Registry</span>
                  
                  <div className="border rounded-xl bg-slate-50/50 max-h-56 overflow-y-auto overflow-x-auto">
                    <table className="w-full text-xs text-slate-705 divide-y font-medium text-left">
                      <thead className="bg-slate-105 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left select-none border-b border-slate-200">
                        <tr>
                          <th className="p-3">Queue ID</th>
                          <th className="p-3">Patient Name</th>
                          <th className="p-3">ABHA Address</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">OPD Token</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y">
                        {incomingScansQueue.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-500 text-[10px]">{s.id}</td>
                            <td className="p-3 font-extrabold text-slate-905">{s.name}</td>
                            <td className="p-3 font-mono text-indigo-750 font-semibold">{s.abhaId}</td>
                            <td className="p-3 font-mono text-[11px]">{s.phone}</td>
                            <td className="p-3 font-black text-rose-800 tracking-wider">{s.token}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                Registered ({s.timestamp})
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
          </div>
        )}

        {/* --- TAB 7: HFR (HOSPITAL FACILITY) & HPR (HEALTH PROFESSIONAL) REGISTRIES & ONBOARDING --- */}
        {activeTab === "registries" && (
          <div className="space-y-6 select-none font-sans text-left">
            {/* Header description */}
            <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-xl leading-relaxed text-xs">
              <span className="font-extrabold text-indigo-950 block mb-0.5">National Healthcare Directories & HMS Sandbox Onboarding</span>
              Verify accredited health facilities via HFR, locate certified care professionals in HPR, or empanel this Hospital HMS instance inside national networks like PM-JAY/SACHIS and ABDM sandbox nodes.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left query / selector controller */}
              <div className="lg:col-span-4 border p-6 rounded-xl bg-slate-50/20 space-y-4">
                <div className="flex bg-slate-200 border p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setRegistryType("hfr");
                      setRegistrySearchQuery("");
                      setRegistrySearchResults([]);
                      setSelectedRegistryItem(null);
                    }}
                    className={`w-1/3 py-2 text-center text-[11px] font-bold rounded-lg cursor-pointer transition ${
                      registryType === "hfr" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    HFR Directory
                  </button>
                  <button
                    onClick={() => {
                      setRegistryType("hpr");
                      setRegistrySearchQuery("");
                      setRegistrySearchResults([]);
                      setSelectedRegistryItem(null);
                    }}
                    className={`w-1/3 py-2 text-center text-[11px] font-bold rounded-lg cursor-pointer transition ${
                      registryType === "hpr" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    HPR Directory
                  </button>
                  <button
                    onClick={() => {
                      setRegistryType("self_register");
                      setSelfRegStep("init");
                      setSelfRegOtp("");
                    }}
                    className={`w-1/3 py-2 text-center text-[10.5px] font-bold rounded-lg cursor-pointer transition ${
                      registryType === "self_register" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    HMS Register
                  </button>
                </div>

                {registryType !== "self_register" ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Search {registryType === "hfr" ? "Facilities" : "Healthcare Professionals"} Directories
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={registrySearchQuery}
                          onChange={(e) => setRegistrySearchQuery(e.target.value)}
                          placeholder={registryType === "hfr" ? "e.g. Red Cross Clinic, AIIMS" : "e.g. Arvind, Shruti"}
                          className="w-full text-xs font-bold border rounded-lg p-3 pr-10 bg-white focus:outline-hidden text-slate-900"
                        />
                        <Search className="h-4 w-4 text-slate-400 absolute right-3.5 top-3.5" />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          setIsProcessing(false);
                          const q = registrySearchQuery.toLowerCase();
                          if (registryType === "hfr") {
                            const mockHfr = [
                              { id: "HFR-DEL-0001", name: "All India Gen Medicine AIIMS", type: "Government Hospital", district: "Central Delhi", state: "Delhi", status: "Verified & Onboarded" },
                              { id: "HFR-DEL-1049", name: "Red Cross Clinical Diagnostics", type: "Clinical Diagnostic Center", district: "New Delhi", state: "Delhi", status: "Verified & Onboarded" },
                              { id: "HFR-MAH-2083", name: "Apex Multispf Cardiology Annex", type: "Private Hospital Network", district: "Mumbai Suburb", state: "Maharashtra", status: "Verified & Onboarded" },
                              { id: "HFR-SBX-1337", name: "Sandbox Demonstration Health Unit", type: "Public Health Facility", district: "Bengaluru", state: "Karnataka", status: "Active Sandbox Counter" }
                            ];
                            const filtered = mockHfr.filter(f => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q));
                            setRegistrySearchResults(filtered.length > 0 ? filtered : mockHfr);
                          } else {
                            const mockHpr = [
                              { id: "arvind@hpr", name: "Dr. Arvind Swaminathan", role: "Cardiologist MD", registrationNo: "MCI-45129", dscSignature: "Linked & Verified", status: "Practitioner Registry Certified" },
                              { id: "shruti@hpr", name: "Nurse Shruti Patel", role: "Critical Care B.Sc", registrationNo: "NUR-98312", dscSignature: "Active PIN Enabled", status: "Professional Registry Certified" },
                              { id: "priya@hpr", name: "Dr. Priya Sharma", role: "General Surgeon MS", registrationNo: "MCI-11983", dscSignature: "Active DSC Linked", status: "Practitioner Registry Certified" }
                            ];
                            const filtered = mockHpr.filter(h => h.name.toLowerCase().includes(q) || h.id.toLowerCase().includes(q));
                            setRegistrySearchResults(filtered.length > 0 ? filtered : mockHpr);
                          }
                          setSuccessMessage(`ABDM Registry query completed. Found matches.`);
                        }, 800);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Query National Grid Server
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Ecosystem Registry Panels</span>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelfRegCategory("hfr");
                          setSelfRegStep("init");
                          setSelfRegOtp("");
                        }}
                        className={`p-3 border rounded-xl text-left font-sans flex items-start gap-2.5 cursor-pointer transition ${
                          selfRegCategory === "hfr" ? "bg-indigo-50/20 border-indigo-200" : "bg-white/40 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Award className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs text-slate-805">Link HFR Facility ID</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Register hospital node in NHA Health Facility Registry</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelfRegCategory("pmjay");
                          setSelfRegStep("init");
                          setSelfRegOtp("");
                        }}
                        className={`p-3 border rounded-xl text-left font-sans flex items-start gap-2.5 cursor-pointer transition ${
                          selfRegCategory === "pmjay" ? "bg-indigo-50/20 border-indigo-200" : "bg-white/40 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs text-slate-805">PMJAY / SACHIS Schemes</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Empanel for cashless treatment under State Health Authority</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelfRegCategory("abdm");
                          setSelfRegStep("init");
                          setSelfRegOtp("");
                        }}
                        className={`p-3 border rounded-xl text-left font-sans flex items-start gap-2.5 cursor-pointer transition ${
                          selfRegCategory === "abdm" ? "bg-indigo-50/20 border-indigo-200" : "bg-white/40 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Lock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs text-slate-805">ABDM Client Credentials</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Register API Sandbox client keys & Gateway webhooks</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right results / workspace interactive display list */}
              <div className="lg:col-span-8 border rounded-xl p-5 bg-white shadow-xs space-y-4">
                {registryType !== "self_register" ? (
                  <>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide border-b pb-2 text-left">
                      Matching Accredited ABDM {registryType === "hfr" ? "HIP / HIN Facilities" : "HP-S Practitioner Nodes"}
                    </span>

                    <div className="grid grid-cols-2 gap-4">
                      {(registrySearchResults.length > 0 ? registrySearchResults : (
                        registryType === "hfr" ? [
                          { id: "HFR-DEL-0001", name: "All India Gen Medicine AIIMS", type: "Government Hospital", district: "Central Delhi", state: "Delhi", status: "Verified & Onboarded" },
                          { id: "HFR-DEL-1049", name: "Red Cross Clinical Diagnostics", type: "Clinical Diagnostic Center", district: "New Delhi", state: "Delhi", status: "Verified & Onboarded" },
                          { id: "HFR-MAH-2083", name: "Apex Multispf Cardiology Annex", type: "Private Hospital Network", district: "Mumbai Suburb", state: "Maharashtra", status: "Verified & Onboarded" },
                          { id: "HFR-SBX-1337", name: "Sandbox Demonstration Health Unit", type: "Public Health Facility", district: "Bengaluru", state: "Karnataka", status: "Active Sandbox Counter" }
                        ] : [
                          { id: "arvind@hpr", name: "Dr. Arvind Swaminathan", role: "Cardiologist MD", registrationNo: "MCI-45129", dscSignature: "Linked & Verified", status: "Practitioner Registry Certified" },
                          { id: "shruti@hpr", name: "Nurse Shruti Patel", role: "Critical Care B.Sc", registrationNo: "NUR-98312", dscSignature: "Active PIN Enabled", status: "Professional Registry Certified" },
                          { id: "priya@hpr", name: "Dr. Priya Sharma", role: "General Surgeon MS", registrationNo: "MCI-11983", dscSignature: "Active DSC Linked", status: "Practitioner Registry Certified" }
                        ]
                      )).map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedRegistryItem(item)}
                          className={`p-3.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all text-left ${
                            selectedRegistryItem?.id === item.id ? "bg-indigo-50/15 border-indigo-200 ring-1 ring-indigo-200 shadow-sm" : "bg-slate-50 hover:bg-slate-100/50 border-slate-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono bg-white border font-bold text-slate-500 px-1.5 py-0.5 rounded inline-block">{item.id}</span>
                            <h4 className="text-xs font-black text-slate-805 leading-tight pt-1">{item.name}</h4>
                            <p className="text-[10.5px] font-medium text-slate-500">
                              {registryType === "hfr" ? `${item.type} | ${item.district}, ${item.state}` : `${item.role} | Class Registration: ${item.registrationNo}`}
                            </p>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-205 flex items-center justify-between text-[9px] select-none font-bold">
                            <span className="text-green-700 uppercase flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-600" /> {item.status}
                            </span>
                            <span className="text-slate-400 font-mono font-normal">
                              {registryType === "hfr" ? "Geo Verified" : `DSC: ${item.dscSignature}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Registry live details mockup */}
                    {selectedRegistryItem && (
                      <div className="p-4 border border-indigo-150 bg-indigo-50/10 rounded-xl text-left">
                        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-2">Detailed Accredited Metadata</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium pt-1">
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase">Registry Name</span>
                            <span className="text-slate-800 font-bold">{selectedRegistryItem.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase">ABDM Ident Code</span>
                            <span className="font-mono text-slate-800 font-black">{selectedRegistryItem.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase">Verification Status</span>
                            <span className="text-green-700 font-extrabold uppercase">Verified & Active</span>
                          </div>
                          <div>
                            <span className="text-slate-405 block text-[9px] uppercase">DPDP Compliant Node</span>
                            <span className="text-slate-800 font-bold">Yes (TLS v1.3)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* --- CATEGORY A: HEALTH FACILITY REGISTRY (HFR) --- */}
                    {selfRegCategory === "hfr" && (
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <h3 className="font-black text-slate-800 text-sm">HFR (Health Facility Registry) Onboarding</h3>
                            <p className="text-[10px] text-slate-400">Onboard this clinic inside NHA central accredited hospital index</p>
                          </div>
                          <span className="bg-blue-100 text-blue-850 px-2 py-0.5 rounded text-[9px] font-bold border border-blue-250 uppercase font-mono">Facility Module</span>
                        </div>

                        {registeredHospitalRecord?.hfrEnabled ? (
                          <div className="border border-green-200 bg-green-55/10 rounded-xl p-5 text-center space-y-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                            <div>
                              <h4 className="font-black text-slate-800 text-sm">Hospital Node Successfully Certified in HFR</h4>
                              <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal mt-0.5">
                                This facility matches national Health Facility Registry protocols. Central directory indexing active.
                              </p>
                            </div>

                            {/* Simulated Official HFR Verification Certificate */}
                            <div className="border border-double border-slate-300 max-w-sm mx-auto p-4 bg-slate-50 rounded-xl shadow-xs text-left relative">
                              <div className="border-2 border-green-500/20 rounded-lg p-3 space-y-2.5">
                                <div className="text-center font-bold border-b pb-2">
                                  <span className="text-[9px] text-slate-400 block tracking-widest font-mono">NATIONAL HEALTH AUTHORITY</span>
                                  <span className="text-xs text-indigo-900 font-black block mt-0.5">HEALTH FACILITY REGISTRY CERTIFICATE</span>
                                </div>
                                <div className="space-y-1.5 text-[10px] font-medium text-slate-750">
                                  <div>Hospital ID: <span className="font-mono text-indigo-700 font-black tracking-wider">{registeredHospitalRecord.hfrId}</span></div>
                                  <div>Legal Name: <span className="font-bold text-slate-900">{registeredHospitalRecord.hospitalName}</span></div>
                                  <div>State License: <span className="font-mono">{registeredHospitalRecord.license}</span></div>
                                  <div>Registration Date: <span>{registeredHospitalRecord.registeredAt}</span></div>
                                  <div className="text-emerald-700 font-bold uppercase tracking-wide pt-1">Status: NHA Accredited Active Facility Node</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => window.print()}
                                className="bg-slate-100 hover:bg-slate-200 border text-slate-755 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition select-none"
                              >
                                Print HFR Certificate
                              </button>
                              <button
                                onClick={() => {
                                  setRegisteredHospitalRecord(prev => ({ ...prev, hfrEnabled: false }));
                                  setSuccessMessage("HFR Registration unlinked for re-testing.");
                                }}
                                className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border text-slate-500 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer transition select-none"
                              >
                                Reset Node
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* GOVERNMENT OF INDIA OFFICIAL PORTAL PROMINENT ACCENT LINK BANNER */}
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-250 space-y-2.5">
                              <div className="flex items-start gap-2 text-xs">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="font-medium text-slate-750 leading-relaxed">
                                  <strong className="text-indigo-950 font-extrabold block mb-1">Mandatory NHA HFR National Portal Registration</strong>
                                  ABDM guidelines mandate that facilities must first sign-up on the official Government portal to verify physical infrastructure, biometrics, and medical licenses.
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-lg border border-amber-20 border-dashed">
                                <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500">OFFICIAL NHA NATIONAL FACILITY REGISTRY:</span>
                                <a
                                  href="https://facility.abdm.gov.in/?utm_source=chatgpt.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition shrink-0 select-text"
                                >
                                  Register at facility.abdm.gov.in ↗
                                </a>
                              </div>
                              <span className="text-[9.5px] text-amber-700 block select-none">
                                * Obtain your HFR facility ID on the portal above, then complete the clinical linkage and credentials check in this HMS below.
                              </span>
                            </div>

                            {selfRegStep === "init" && (
                              <div className="bg-slate-50/50 p-4 border rounded-xl space-y-3.5">
                                <h4 className="text-xs font-black uppercase text-slate-505 tracking-wider pb-1.5 border-b">Verify & Link Facility Credentials</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hospital Official Name</label>
                                    <input
                                      type="text"
                                      value={selfRegHospitalName}
                                      onChange={(e) => setSelfRegHospitalName(e.target.value)}
                                      className="w-full text-xs font-bold border rounded p-2 bg-white text-slate-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medical Council License Number</label>
                                    <input
                                      type="text"
                                      value={selfRegLicenseNum}
                                      onChange={(e) => setSelfRegLicenseNum(e.target.value)}
                                      className="w-full text-xs font-mono border rounded p-2 bg-white text-slate-900"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-xs font-bold pt-1">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State Demographics</label>
                                    <select
                                      value={selfRegStateCode}
                                      onChange={(e) => setSelfRegStateCode(e.target.value)}
                                      className="w-full text-xs border rounded p-2 bg-white text-slate-800"
                                    >
                                      <option value="DL">Delhi (NCT)</option>
                                      <option value="KA">Karnataka (KA)</option>
                                      <option value="MH">Maharashtra (MH)</option>
                                      <option value="TN">Tamil Nadu (TN)</option>
                                      <option value="KL">Kerala (KL)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admin Mobile</label>
                                    <input
                                      type="text"
                                      maxLength={10}
                                      value={selfRegMobile}
                                      onChange={(e) => setSelfRegMobile(e.target.value.replace(/\D/g, ""))}
                                      className="w-full text-xs font-mono tracking-wider border rounded p-2 bg-white text-slate-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pre-Fetched HFR ID ID</label>
                                    <input
                                      type="text"
                                      disabled
                                      value={`HFR-SBX-${selfRegStateCode}-1337`}
                                      className="w-full text-xs font-mono font-bold border rounded p-2 bg-slate-100 text-slate-500"
                                    />
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    if (selfRegMobile.length < 10) {
                                      setErrorMessage("Invalid 10-digit mobile number for authority SMS!");
                                      return;
                                    }
                                    setIsProcessing(true);
                                    setTimeout(() => {
                                      setIsProcessing(false);
                                      setSelfRegStep("pending_otp");
                                      setSuccessMessage("SMS Verification token dispatched to administrative council mobile.");
                                    }, 900);
                                  }}
                                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-3"
                                >
                                  Submit HFR Affiliation Application
                                </button>
                              </div>
                            )}

                            {selfRegStep === "pending_otp" && (
                              <div className="bg-slate-50 p-4 border rounded-xl space-y-4 text-left">
                                <div className="p-2.5 bg-yellow-50 text-slate-705 border border-yellow-250 text-xs rounded-lg font-semibold leading-relaxed">
                                  🔑 Sandbox SMS OTP Protocol: Enter registration confirmation PIN <strong className="underline text-orange-700 font-extrabold">777111</strong> to claim current HFR ownership token.
                                </div>
                                <div className="max-w-xs space-y-2">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Verification OTP Code</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      maxLength={6}
                                      placeholder="______"
                                      value={selfRegOtp}
                                      onChange={(e) => setSelfRegOtp(e.target.value.replace(/\D/g, ""))}
                                      className="w-2/3 text-center tracking-widest text-sm font-black border rounded p-2 bg-white text-indigo-950 font-mono"
                                    />
                                    <button
                                      onClick={() => {
                                        if (selfRegOtp !== "777111") {
                                          setErrorMessage("Wrong OTP validation code! Sandbox HFR verification code is 777111.");
                                          return;
                                        }
                                        setIsProcessing(true);
                                        setTimeout(() => {
                                          setIsProcessing(false);
                                          setRegisteredHospitalRecord(prev => ({
                                            ...prev,
                                            hfrEnabled: true,
                                            hfrId: `HFR-${selfRegStateCode}-SBX-1337`,
                                            hospitalName: selfRegHospitalName,
                                            license: selfRegLicenseNum,
                                            registeredAt: new Date().toISOString().split("T")[0]
                                          }));
                                          setSuccessMessage(`Accredited Health Facility ID HFR-${selfRegStateCode}-SBX-1337 verified and mapped successfully!`);
                                        }, 1000);
                                      }}
                                      className="w-1/3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded cursor-pointer flex items-center justify-center"
                                    >
                                      Verify & Activate
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- CATEGORY B: PMJAY / SACHIS SCHEME EMPANELMENT --- */}
                    {selfRegCategory === "pmjay" && (
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <h3 className="font-black text-slate-800 text-sm">PMJAY & State SACHIS Direct Empanelment</h3>
                            <p className="text-[10px] text-slate-400">Manage paperless cashless claims and state insurance system affiliations</p>
                          </div>
                          <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-250 uppercase font-mono">SACHIS Module</span>
                        </div>

                        {/* Interactive Jurisdiction Selector */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3.5 bg-indigo-50/20 border border-indigo-150 rounded-xl">
                          <div>
                            <span className="text-[9.5px] font-mono font-bold text-indigo-700 uppercase tracking-widest block">Active State Jurisdiction Server</span>
                            <span className="text-xs text-slate-600 font-medium">Configure schemas tailored for local state health agencies</span>
                          </div>
                          <select 
                            value={selfRegStateCode}
                            onChange={(e) => {
                              const sel = e.target.value;
                              setSelfRegStateCode(sel);
                              if (sel === "UP") {
                                setSuccessMessage("Activated Uttar Pradesh SACHIS and Transaction Management System (TMS) suite.");
                              } else {
                                setSuccessMessage("Switched back to Central National Health Authority gateway schema.");
                              }
                            }}
                            className="text-xs font-bold border border-slate-300 bg-white p-2 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="DL">Delhi (Central NHA Hub)</option>
                            <option value="UP">Uttar Pradesh (SACHIS-UP LucknowHQ)</option>
                            <option value="MH">Maharashtra (MJPJAY Mumbai)</option>
                            <option value="KA">Karnataka (SAST Bengaluru)</option>
                          </select>
                        </div>

                        {selfRegStateCode === "UP" ? (
                          /* --- SPECIALIZED UTTAR PRADESH PMJAY & SACHIS INTEGRATED HUB --- */
                          <div className="space-y-4 animate-fadeIn">
                            {/* Main State Agency Alert Banner */}
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-250/75 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                              <div className="md:col-span-2 space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">STATE PORTAL ACCREDITED</span>
                                <h4 className="text-sm font-black text-indigo-950">Uttar Pradesh Clinical Assurance Suite Active</h4>
                                <p className="text-xs text-slate-500 leading-snug">
                                  Configured with SACHIS-UP guidelines for digital claims mapping, E-Preauthorization requests, and direct connection to Lucknow State NHA node.
                                </p>
                              </div>
                              <div className="flex md:justify-end gap-2 text-center">
                                <div className="border border-emerald-200 bg-white px-3 py-1.5 rounded-xl">
                                  <span className="text-[8px] uppercase font-bold text-slate-400 block leading-tight">SAS-TMS Link</span>
                                  <span className="text-xs font-black text-emerald-700 font-mono tracking-wider flex items-center justify-center gap-1 mt-0.5">
                                    <span className="relative flex h-2 w-2 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    ACTIVE
                                  </span>
                                </div>
                                <div className="border border-indigo-100 bg-white px-3 py-1.5 rounded-xl">
                                  <span className="text-[8px] uppercase font-bold text-slate-400 block leading-tight">API Schema</span>
                                  <span className="text-xs font-black text-indigo-750 font-mono mt-0.5 block">TMS v2.3</span>
                                </div>
                              </div>
                            </div>

                            {/* Sub navigation inside UP PMJAY Dashboard */}
                            <div className="flex border-b text-xs font-black bg-slate-100/60 p-1.5 rounded-xl border gap-2">
                              <button
                                onClick={() => setUpPmjaySubTab("integration")}
                                className={`w-1/4 py-2 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  upPmjaySubTab === "integration" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
                                }`}
                              >
                                <Lock className="h-3.5 w-3.5" />
                                <span>1. State Connect</span>
                              </button>
                              <button
                                onClick={() => setUpPmjaySubTab("mapping")}
                                className={`w-1/4 py-2 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  upPmjaySubTab === "mapping" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-505 hover:text-slate-850"
                                }`}
                              >
                                <MapPin className="h-3.5 w-3.5" />
                                <span>2. Benefit Mapping</span>
                              </button>
                              <button
                                onClick={() => setUpPmjaySubTab("preauth")}
                                className={`w-1/4 py-2 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  upPmjaySubTab === "preauth" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-505 hover:text-slate-850"
                                }`}
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>3. E-Preauth APIs</span>
                              </button>
                              <button
                                onClick={() => setUpPmjaySubTab("tms_claims")}
                                className={`w-1/4 py-2 text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  upPmjaySubTab === "tms_claims" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-505 hover:text-slate-850"
                                }`}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>4. TMS Claims</span>
                              </button>
                            </div>

                            {/* --- UP TABS RENDER CONTENT --- */}

                            {/* SUB-TAB 1: STATE INTEGRATION PROFILE */}
                            {upPmjaySubTab === "integration" && (
                              <div className="space-y-4 text-xs font-semibold">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                                    <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide border-b pb-1.5">SACHIS State Agency Profile</h5>
                                    
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Designated State Agency:</span>
                                        <span className="font-bold text-slate-705">SACHIS (Lucknow, UP)</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">UP Official Empanelment ID:</span>
                                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">PMJAY-HOSP-UP-3321</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">SACHIS Reference Code:</span>
                                        <span className="font-mono font-bold text-slate-800">SHA-UP-EAST-LKO11</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">TMS Endpoint Node:</span>
                                        <span className="font-mono text-slate-600 bg-slate-105 px-1 py-0.5 rounded text-[10px]">https://up.tms.apidirect.abdm.gov.in/v2</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">SHA API Tunnel Status:</span>
                                        <span className="text-green-700 flex items-center gap-1">
                                          <Check className="h-3 w-3" /> Secure Handshake Passed
                                        </span>
                                      </div>
                                    </div>

                                    <div className="border rounded-lg bg-slate-900 font-mono text-[9px] text-slate-350 p-2.5 space-y-1">
                                      <div className="text-slate-500 font-bold tracking-widest text-[8px] uppercase">Cryptographic Audit Keys</div>
                                      <div>SHA-ALGORITHM: RSA_WITH_AES_256_GCM_SHA384</div>
                                      <div>TLS-VERSION: TLS 1.3 (NHA Core Compliant)</div>
                                      <div>STATE-CERT: SACHIS-UP_PROD_ENC_CERT_SIGNED_EXPD_2028.pem</div>
                                    </div>
                                  </div>

                                  <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <h5 className="font-extrabold text-slate-805 text-[11px] uppercase tracking-wide border-b pb-1.5">Active Network Telemetry & Logs</h5>
                                      
                                      <div className="border bg-white rounded-lg p-2.5 h-36 font-mono text-[10px] space-y-1 text-slate-600 overflow-y-auto whitespace-pre-line leading-relaxed">
                                        {prevTmsLogs.map((log, idx) => (
                                          <div key={idx} className="border-b last:border-0 border-slate-100 pb-1 text-[9.5px]">
                                            <span className="text-indigo-600 font-bold">&#10141;</span> {log}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setIsProcessing(true);
                                          setTimeout(() => {
                                            setIsProcessing(false);
                                            const newLog = `${new Date().toLocaleTimeString()} AM: Traced secure OAuth heartbeat query to Lucknow SACHIS database. 200 OK. Ping latency 14ms.`;
                                            setPrevTmsLogs(prev => [newLog, ...prev]);
                                            setSuccessMessage("UP SACHIS clinical telemetry ping completed.");
                                          }, 800);
                                        }}
                                        className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 rounded-lg cursor-pointer transition text-center"
                                      >
                                        Trigger SACHIS Ping
                                      </button>
                                      <button
                                        onClick={() => {
                                          setPrevTmsLogs([
                                            "05/28/2026: Cleared terminal and initialized clean Uttar Pradesh Transaction Management System (TMS) tracking buffer."
                                          ]);
                                        }}
                                        className="w-1/2 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold p-2 rounded-lg cursor-pointer transition text-center"
                                      >
                                        Clear Telemetry Buffer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUB-TAB 2: HEALTH BENEFIT PACKAGE MAPPING */}
                            {upPmjaySubTab === "mapping" && (
                              <div className="space-y-4">
                                <div className="p-3 bg-amber-55/10 text-slate-705 border border-amber-200 text-xs rounded-xl font-medium leading-relaxed font-sans text-left">
                                  🗺️ <strong>Benefit Tariff Mapping Guidelines:</strong> Uttar Pradesh SACHIS dictates strict CGHS rate capping under <strong>HBP 3.0</strong>. Select local inpatient Clinical Tariff Items and link them to NHA Package Codes to ensure automated cashless Pre-auth pre-checks.
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-semibold">
                                  {/* Left mapping table */}
                                  <div className="lg:col-span-8 border rounded-xl overflow-hidden bg-white shadow-xs">
                                    <div className="bg-slate-100 border-b p-3 flex justify-between items-center bg-slate-50">
                                      <span className="font-extrabold text-slate-800 text-[10px] uppercase">UP State Rate Schedules (Health Benefit Packages)</span>
                                      <span className="text-[9.5px] text-slate-400 bg-white border font-mono px-2 py-0.5 rounded-md font-bold">{upPmjayPackages.length} Active Codes</span>
                                    </div>
                                    <div className="divide-y bg-white">
                                      {upPmjayPackages.map((pkg, idx) => {
                                        const rateDiff = pkg.hospitalRate - pkg.sachisRate;
                                        const percentage = Math.round((rateDiff / pkg.sachisRate) * 100);
                                        return (
                                          <div key={idx} className="p-3 hover:bg-slate-50 transition-colors flex justify-between items-center text-left">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[9px] bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded-sm font-extrabold tracking-wider">{pkg.code}</span>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{pkg.type}</span>
                                                {pkg.status === "Mapped" ? (
                                                  <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.2 rounded font-extrabold border border-green-200">ACTIVE LINK</span>
                                                ) : (
                                                  <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-extrabold border border-rose-200">LOCAL DRIFT</span>
                                                )}
                                              </div>
                                              <h6 className="font-extrabold text-slate-800 text-xs leading-tight">{pkg.name}</h6>
                                              <div className="grid grid-cols-2 gap-4 pt-1 text-[10.5px]">
                                                <div>SACHIS Limit: <strong className="text-slate-900">₹{pkg.sachisRate.toLocaleString()}</strong></div>
                                                <div>HMS Local Tariff: <strong className="text-slate-900">₹{pkg.hospitalRate.toLocaleString()}</strong></div>
                                              </div>
                                            </div>

                                            <div className="text-right space-y-1 min-w-[110px]">
                                              {rateDiff === 0 ? (
                                                <span className="text-green-700 text-[9.5px] font-black uppercase tracking-wide">Perfect Capped Sync</span>
                                              ) : rateDiff > 0 ? (
                                                <div className="text-amber-705 text-[9.5px] font-black">
                                                  <span>+{percentage}% Cost Overage</span>
                                                  <span className="text-[8.5px] block font-normal text-slate-400 font-sans mt-0.5">(Requires UP SHA MD waiver)</span>
                                                </div>
                                              ) : (
                                                <span className="text-cyan-700 text-[9.5px] font-black">Under Cap (₹{-rateDiff} saving)</span>
                                              )}
                                              <button
                                                onClick={() => {
                                                  setUpPmjayPackages(prev => prev.filter(p => p.code !== pkg.code));
                                                  setSuccessMessage(`Package ${pkg.code} unlinked.`);
                                                }}
                                                className="text-[9px] text-slate-400 hover:text-rose-600 block w-full text-right underline font-medium pt-1 select-none cursor-pointer"
                                              >
                                                Remove Mapping
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Right side alignment portal */}
                                  <div className="lg:col-span-4 border rounded-xl p-4 bg-slate-50/50 space-y-3.5 h-fit text-left">
                                    <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide border-b pb-1.5">Map Hospital Service To UP-HBP</h5>
                                    
                                    <div className="space-y-2.5 text-xs font-semibold">
                                      <div>
                                        <label className="block text-[9.5px] text-slate-500 uppercase mb-1 font-bold">Benefit Package Code</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. S150021"
                                          value={newMapCode}
                                          onChange={(e) => setNewMapCode(e.target.value)}
                                          className="w-full text-xs font-mono font-bold bg-white border p-2 rounded text-slate-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9.5px] text-slate-505 uppercase mb-1 font-bold">Standard clinical Name</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Laparoscopic Appendectomy"
                                          value={newMapName}
                                          onChange={(e) => setNewMapName(e.target.value)}
                                          className="w-full text-xs bg-white border p-2 rounded text-slate-900 font-bold"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[9px] text-slate-505 uppercase mb-1 font-bold">SACHIS Cap (₹)</label>
                                          <input
                                            type="number"
                                            placeholder="₹"
                                            value={newMapSachisRate}
                                            onChange={(e) => setNewMapSachisRate(e.target.value)}
                                            className="w-full text-xs font-mono bg-white border p-2 rounded text-slate-900 font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] text-slate-550 uppercase mb-1 font-bold">Base Price (₹)</label>
                                          <input
                                            type="number"
                                            placeholder="₹"
                                            value={newMapHospitalRate}
                                            onChange={(e) => setNewMapHospitalRate(e.target.value)}
                                            className="w-full text-xs font-mono bg-white border p-2 rounded text-slate-900 font-bold"
                                          />
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          if (!newMapCode || !newMapName || !newMapSachisRate || !newMapHospitalRate) {
                                            setErrorMessage("Kindly complete all form fields to link clinical package!");
                                            return;
                                          }
                                          const item = {
                                            code: newMapCode.toUpperCase().startsWith("UP-") ? newMapCode.toUpperCase() : `UP-${newMapCode.toUpperCase()}`,
                                            name: newMapName,
                                            sachisRate: parseFloat(newMapSachisRate),
                                            hospitalRate: parseFloat(newMapHospitalRate),
                                            type: "Surgical",
                                            status: "Mapped"
                                          };
                                          setUpPmjayPackages(p => [...p, item]);
                                          setNewMapCode("");
                                          setNewMapName("");
                                          setNewMapSachisRate("");
                                          setNewMapHospitalRate("");
                                          setSuccessMessage(`Package alignment linked securely: ${item.code} - ${item.name}`);
                                        }}
                                        className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold p-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 mt-2.5"
                                      >
                                        <Plus className="h-4 w-4" /> Link Package Mapping
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUB-TAB 3: E-PREAUTHORIZATION (E-PREAUTH) APIS */}
                            {upPmjaySubTab === "preauth" && (
                              <div className="space-y-4 text-left">
                                <div className="p-3 bg-amber-55/15 text-slate-705 border border-amber-200 text-xs rounded-xl font-medium leading-relaxed font-sans text-left">
                                  🔑 <strong>Paperless Pre-Authorization Simulator:</strong> Under UP PM-JAY directives, major elective IPD surgeries require real-time pre-auth clearance. Select a package, configure diagnostic findings and medical indices, and submit an authorization request to test the secure <code>E-preauth API Payload</code>.
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                  {/* Left Panel - Request Builder */}
                                  <div className="lg:col-span-5 border p-4 rounded-xl bg-slate-50/50 space-y-3.5">
                                    <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide border-b pb-1.5 flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                                      <span>Pre-Authorisation Request Form</span>
                                      <span className="text-[8.5px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-250">SACHIS v3 SECURE</span>
                                    </h5>

                                    <div className="space-y-3 text-xs font-semibold">
                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Beneficiary Patient Name</label>
                                        <select
                                          value={preauthPatientName}
                                          onChange={(e) => {
                                            const sel = e.target.value;
                                            setPreauthPatientName(sel);
                                            if (sel === "Suresh Chandra Gupta") {
                                              setPreauthCardNo("P-UP-1102-7744-8899");
                                              setPreauthPackageCode("UP-S200151");
                                              setPreauthDiagnosisInfo("Osteoarthritis Grade IV Knee Left");
                                            } else if (sel === "Kiran Devi Chaurasia") {
                                              setPreauthCardNo("P-UP-8812-4911-0023");
                                              setPreauthPackageCode("UP-S100155");
                                              setPreauthDiagnosisInfo("Visually impairing senile cortical cataracts");
                                            } else {
                                              setPreauthCardNo("P-UP-9905-1823-4412");
                                              setPreauthPackageCode("UP-S12003");
                                              setPreauthDiagnosisInfo("Chronic calculous cholecystitis with repeated colic");
                                            }
                                          }}
                                          className="w-full text-xs font-bold bg-white border p-2 rounded text-slate-900 cursor-pointer"
                                        >
                                          <option value="Suresh Chandra Gupta">Suresh Chandra Gupta (Knee Osteoarthritis Case)</option>
                                          <option value="Kiran Devi Chaurasia">Kiran Devi Chaurasia (Cataract Clinical Case)</option>
                                          <option value="Ram Swaroop Yadav">Ram Swaroop Yadav (Cholecystitis Gallbladder Case)</option>
                                        </select>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold font-sans">Ayushman PMJAY ID Card</label>
                                          <input
                                            type="text"
                                            disabled
                                            value={preauthCardNo}
                                            className="w-full text-xs font-mono font-bold bg-slate-100 border p-2 rounded text-slate-500 font-sans"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Linked Tariff Code</label>
                                          <select
                                            value={preauthPackageCode}
                                            onChange={(e) => setPreauthPackageCode(e.target.value)}
                                            className="w-full text-xs font-mono font-bold bg-white border p-2 rounded text-slate-900 cursor-pointer"
                                          >
                                            {upPmjayPackages.map((p, i) => (
                                              <option key={i} value={p.code}>{p.code} - ₹{p.sachisRate}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Length of Stay (Days)</label>
                                          <input
                                            type="number"
                                            value={preauthEstimatedDays}
                                            onChange={(e) => setPreauthEstimatedDays(e.target.value)}
                                            className="w-full text-xs font-mono bg-white border p-2 rounded text-slate-900"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold">Implant Charges (₹)</label>
                                          <input
                                            type="number"
                                            value={preauthImplantCharge}
                                            onChange={(e) => setPreauthImplantCharge(e.target.value)}
                                            className="w-full text-xs font-mono bg-white border p-2 rounded text-slate-900"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Clinical Findings & Indications</label>
                                        <textarea
                                          value={preauthDiagnosisInfo}
                                          onChange={(e) => setPreauthDiagnosisInfo(e.target.value)}
                                          className="w-full text-xs bg-white border p-2 rounded h-16 text-slate-900 font-medium font-sans"
                                        />
                                      </div>

                                      <div className="flex items-start gap-1.5 pt-1">
                                        <input type="checkbox" id="preauth-consent" defaultChecked className="rounded text-indigo-600 mt-0.5 cursor-pointer" />
                                        <label htmlFor="preauth-consent" className="text-[10px] text-slate-500 select-none cursor-pointer leading-snug">
                                          Patient biometric checked & electronic signature stamped by chief clinical officer
                                        </label>
                                      </div>

                                      <button
                                        onClick={() => {
                                          setIsProcessing(true);
                                          const selectedPkg = upPmjayPackages.find(p => p.code === preauthPackageCode) || { name: "Clinical Surgery", sachisRate: 35000 };
                                          const amount = selectedPkg.sachisRate + (parseFloat(preauthImplantCharge) || 0);

                                          const payload = {
                                            requestHeader: {
                                              transactionId: `TXN-UP-AP-${Math.floor(Math.random() * 90000) + 10000}`,
                                              timestamp: new Date().toISOString(),
                                              senderId: "UP-HMS-SANDBOX-3321",
                                              stateCode: "UP"
                                            },
                                            claimantDetails: {
                                              hospitalCode: "UP-HMS-SANDBOX-3321",
                                              licenseNo: "MC-DL-2026-9901",
                                              district: "Lucknow",
                                              stateName: "Uttar Pradesh"
                                            },
                                            beneficiaryDetails: {
                                              ayushmanId: preauthCardNo,
                                              name: preauthPatientName,
                                              gender: "Male"
                                            },
                                            preAuthClinicalData: {
                                              packageCode: preauthPackageCode,
                                              packageName: selectedPkg.name,
                                              admissionType: "IPD",
                                              diagnosisCode: "ICD-10-M17.1",
                                              clinicalJustification: preauthDiagnosisInfo,
                                              lengthOfStayEstimated: parseInt(preauthEstimatedDays),
                                              breakupCharges: {
                                                packageCost: selectedPkg.sachisRate,
                                                implantFee: parseFloat(preauthImplantCharge) || 0,
                                                totalRequested: amount
                                              }
                                            },
                                            digitalLockDetails: {
                                              biometricCertified: true,
                                              surgeonRegistration: "UP-MCI-22019"
                                            }
                                          };

                                          setTmsPayloadView(payload);
                                          setTmsResponseView(null);

                                          setTimeout(() => {
                                            setIsProcessing(false);
                                            const response = {
                                              responseHeader: {
                                                transactionId: payload.requestHeader.transactionId,
                                                status: "SUCCESS",
                                                timestamp: new Date().toISOString()
                                              },
                                              preauthResult: {
                                                preauthId: `PA-UP-${Math.floor(Math.random() * 900000) + 100000}`,
                                                decision: "APPROVED",
                                                remarks: "Auto-cleared via electronic claim engine SACHIS Lucknow. Implant invoice validation cleared.",
                                                approvedAmountAllowed: amount,
                                                validTill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                                                electronicSignToken: "SHA256-SIGN-TOKEN_2026_9882AA91C_M_LKO"
                                              }
                                            };
                                            setTmsResponseView(response);

                                            // Insert into current claim workflows
                                            const exists = upPmjayClaims.find(c => c.patientName === preauthPatientName);
                                            if (exists) {
                                              setUpPmjayClaims(prev => prev.map(c => {
                                                if (c.patientName === preauthPatientName) {
                                                  return {
                                                    ...c,
                                                    status: "Preauth Approved",
                                                    amount: amount,
                                                    logs: [
                                                      `${new Date().toLocaleDateString()}: New E-Preauth requested. API transaction ${payload.requestHeader.transactionId}`,
                                                      `${new Date().toLocaleDateString()}: Pre-authorization APPROVED via secure SACHIS tunnel (ID: ${response.preauthResult.preauthId})`
                                                    ],
                                                    preauthPayload: payload
                                                  };
                                                }
                                                return c;
                                              }));
                                            } else {
                                              const newClaim = {
                                                id: `CLM-UP-${Math.floor(Math.random() * 9000) + 1000}`,
                                                patientName: preauthPatientName,
                                                pmjayCardNo: preauthCardNo,
                                                procedure: selectedPkg.name,
                                                packageCode: preauthPackageCode,
                                                amount: amount,
                                                status: "Preauth Approved",
                                                stage: "IPD Active",
                                                logs: [
                                                  `${new Date().toLocaleDateString()}: Pre-authorization requested over NHA network server.`,
                                                  `${new Date().toLocaleDateString()}: Pre-authorization APPROVED by SACHIS Medical Officer (RuleEngine-v3) Clearance ID: ${response.preauthResult.preauthId}`
                                                ],
                                                preauthPayload: payload,
                                                claimPayload: null
                                              };
                                              setUpPmjayClaims(prev => [newClaim, ...prev]);
                                            }

                                            // Add telemetry log
                                            setPrevTmsLogs(prev => [
                                              `${new Date().toLocaleTimeString()}: SUCCESS POST /api/v2/preauth/submit for ${preauthPatientName} (Code: ${preauthPackageCode}) - APPROVED ₹${amount}`,
                                              ...prev
                                            ]);

                                            setSuccessMessage(`E-Preauth APPROVED for ${preauthPatientName}! Code: ${response.preauthResult.preauthId}`);
                                          }, 2000);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm mt-3"
                                      >
                                        <CheckCircle2 className="h-4 w-4" /> Request Secure E-Preauth clearance
                                      </button>
                                    </div>
                                  </div>

                                  {/* Right Panel - API Inspecting console */}
                                  <div className="lg:col-span-7 border rounded-xl overflow-hidden flex flex-col justify-between bg-slate-950 font-mono text-xs select-text text-slate-350 min-h-[460px]">
                                    <div className="bg-slate-900 border-b p-3 flex justify-between items-center text-[10px] font-bold select-none text-slate-400">
                                      <span>NHA INTEGRATION SANDBOX: E-PREAUTH API CLIENT</span>
                                      <span className="text-indigo-400 font-extrabold font-sans">PORT: 3000 | TLSv1.3</span>
                                    </div>

                                    <div className="p-4 flex-grow space-y-4 max-h-[410px] overflow-y-auto leading-relaxed">
                                      {tmsPayloadView ? (
                                        <div className="space-y-4">
                                          <div>
                                            <div className="text-[10px] text-indigo-400 border-b border-slate-800 pb-1 mb-2 uppercase font-sans font-black select-none">
                                              📤 JSON Web API Post Request (TMS /api/v2/preauth/submit)
                                            </div>
                                            <pre className="text-[10.5px] text-cyan-400 font-mono overflow-x-auto whitespace-pre p-2 bg-slate-900 rounded-lg">
                                              {JSON.stringify(tmsPayloadView, null, 2)}
                                            </pre>
                                          </div>

                                          {isProcessing ? (
                                            <div className="flex items-center gap-3 p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl py-4">
                                              <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin shrink-0" />
                                              <div className="text-[11px] font-sans">
                                                <strong className="text-white block">Audit Rule Engine Active...</strong>
                                                <span className="text-slate-400">Handshaking securely with Lucknow SACHIS database range...</span>
                                              </div>
                                            </div>
                                          ) : tmsResponseView ? (
                                            <div>
                                              <div className="text-[10px] text-emerald-400 border-b border-slate-800 pb-1 mb-2 uppercase font-sans font-black select-none font-sans">
                                                📥 JSON Web Response Received (200 OK)
                                              </div>
                                              <pre className="text-[10.5px] text-green-400 font-mono overflow-x-auto whitespace-pre p-2 bg-slate-900 rounded-lg">
                                                {JSON.stringify(tmsResponseView, null, 2)}
                                              </pre>
                                            </div>
                                          ) : null}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-16 space-y-2 select-none font-sans">
                                          <Database className="h-10 w-10 text-slate-600" />
                                          <div>
                                            <p className="font-bold text-slate-400 text-xs">Awaiting E-Preauth Dispatch</p>
                                            <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">Configure and trigger the clinical authorization request in the builder to inspect UP state XML/JSON schema payloads.</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUB-TAB 4: DYNAMIC CLAIMS ENGINE & WORKFLOWS */}
                            {upPmjaySubTab === "tms_claims" && (
                              <div className="space-y-4 text-xs font-semibold">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Left list of claims */}
                                  <div className="border rounded-xl bg-white p-4 space-y-3.5 text-left bg-white shadow-xs">
                                    <h5 className="font-extrabold text-slate-850 text-[11px] uppercase tracking-wide border-b pb-1.5 flex justify-between items-center">
                                      <span>Active Admission Cases in TMS</span>
                                      <span className="text-[9.5px] text-slate-400">Total: {upPmjayClaims.length} cases</span>
                                    </h5>

                                    <div className="space-y-2.5">
                                      {upPmjayClaims.map((claim, idx) => (
                                        <div
                                          key={idx}
                                          onClick={() => setSelectedClaimDetail(claim)}
                                          className={`border p-3 rounded-xl transition cursor-pointer ${
                                            selectedClaimDetail?.id === claim.id ? "bg-indigo-50/15 border-indigo-200 ring-1 ring-indigo-200" : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"
                                          }`}
                                        >
                                          <div className="flex justify-between items-start mb-1 h-fit">
                                            <span className="font-mono text-[9px] bg-white border border-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded inline-block leading-none">
                                              {claim.id}
                                            </span>
                                            <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                                              claim.status === "Disbursed" ? "bg-green-100 text-green-800" :
                                              claim.status === "Preauth Approved" ? "bg-blue-100 text-blue-800 border" :
                                              claim.status === "TMS Submitted" ? "bg-indigo-100 text-indigo-800 border border-indigo-250" :
                                              "bg-amber-100 text-amber-800"
                                            }`}>
                                              {claim.status}
                                            </span>
                                          </div>

                                          <h6 className="font-extrabold text-slate-800 text-xs mt-1.5 pb-0.5">{claim.patientName}</h6>
                                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 pb-1">
                                            <span>Ayushman ID: {claim.pmjayCardNo}</span>
                                            <span className="font-semibold text-slate-705">₹{claim.amount.toLocaleString()}</span>
                                          </div>

                                          <div className="text-[9px] text-slate-400 bg-white p-1.5 border border-dashed rounded mt-1 overflow-x-auto select-none">
                                            Procedure: {claim.procedure} | HBP Code: {claim.packageCode}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Right Detailed Logs / Claim submission Trigger */}
                                  <div className="border rounded-xl p-4 bg-slate-50/50 space-y-4 text-left">
                                    {selectedClaimDetail ? (
                                      <div className="space-y-4">
                                        <div className="border-b pb-2">
                                          <h5 className="font-extrabold text-slate-800 text-xs">Clinical Case Dashboard</h5>
                                          <p className="text-[10px] text-amber-700 uppercase tracking-widest font-mono mt-0.5">{selectedClaimDetail.patientName} Case Portfolio</p>
                                        </div>

                                        <div className="space-y-2">
                                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">SACHIS Track audit log trail</span>
                                          <div className="border bg-white rounded-lg p-3 space-y-2.5 max-h-48 overflow-y-auto">
                                            {selectedClaimDetail.logs.map((log: string, i: number) => (
                                              <div key={i} className="text-[10px] text-slate-605 pl-4 border-l-2 border-indigo-500/40 relative leading-normal font-semibold">
                                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 bg-indigo-50 border border-indigo-400 rounded-full flex items-center justify-center">
                                                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                                                </div>
                                                {log}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Submit treatment claim form if Preauth Approved */}
                                        {selectedClaimDetail.status === "Preauth Approved" && (
                                          <div className="border border-indigo-200/60 p-3.5 bg-indigo-55/10 rounded-xl space-y-3.5">
                                            <span className="font-extrabold text-indigo-950 text-[10.5px] uppercase tracking-wide block border-b pb-1.5">Submit Treatment Claim to Uttar Pradesh TMS Node</span>
                                            
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                              <div>
                                                <label className="block text-[9px] text-slate-500 uppercase mb-0.5 font-bold">Patient Discharge Cost (₹)</label>
                                                <input
                                                  type="number"
                                                  value={claimSubmitFinalBill}
                                                  onChange={(e) => setClaimSubmitFinalBill(e.target.value)}
                                                  className="w-full text-xs font-mono bg-white border p-1.5 rounded text-slate-900"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[9.5px] text-slate-500 uppercase mb-1 font-bold">Verify surgery Photo</label>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                  <input
                                                    type="checkbox"
                                                    id="photo-trigger-up"
                                                    checked={claimSubmitTriggerPhoto}
                                                    onChange={(e) => setClaimSubmitTriggerPhoto(e.target.checked)}
                                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                  />
                                                  <label htmlFor="photo-trigger-up" className="text-[10.5px] text-emerald-700 select-none cursor-pointer font-bold">Live Upload Passed</label>
                                                </div>
                                              </div>
                                            </div>

                                            <div>
                                              <label className="block text-[9px] text-slate-500 uppercase mb-0.5 font-bold">Post-Operative surgeon's Notes</label>
                                              <input
                                                type="text"
                                                value={claimSubmitPostOpNotes}
                                                onChange={(e) => setClaimSubmitPostOpNotes(e.target.value)}
                                                className="w-full text-xs bg-white border p-1.5 rounded text-slate-900 font-semibold"
                                              />
                                            </div>

                                            <button
                                              onClick={() => {
                                                if (!claimSubmitTriggerPhoto) {
                                                  setErrorMessage("TMS API requires mandatory surgical trigger bedside photo check confirmation!");
                                                  return;
                                                }
                                                setIsProcessing(true);
                                                setTimeout(() => {
                                                  setIsProcessing(false);
                                                  
                                                  // Payload for TMS API submit claim
                                                  const tmsClaimPayload = {
                                                    claimHeader: {
                                                      transactionId: `TXN-CLM-UP-${Math.floor(Math.random() * 90000) + 10000}`,
                                                      timestamp: new Date().toISOString(),
                                                      hmsProvider: "UP-HMS-SANDBOX-3321"
                                                    },
                                                    caseDetails: {
                                                      preauthId: `PA-UP-${Math.floor(Math.random() * 10000) + 90000}`,
                                                      finalBillApproved: parseFloat(claimSubmitFinalBill),
                                                      dischargedAt: new Date().toISOString().split("T")[0]
                                                    },
                                                    mandatoryEvidenceDocs: {
                                                      bedsideSurgicalPhotoHash: "SHA256-V_PHOTO_EX771-UP-LKO",
                                                      clinicalDischargeSummaryHash: "SHA255-D_REC_989B1A",
                                                      surgeonDigitalApproval: "MCI-UP-9320"
                                                    }
                                                  };

                                                  setUpPmjayClaims(prev => prev.map(c => {
                                                    if (c.id === selectedClaimDetail.id) {
                                                      return {
                                                        ...c,
                                                        status: "TMS Submitted",
                                                        amount: parseFloat(claimSubmitFinalBill),
                                                        logs: [
                                                          ...c.logs,
                                                          `05/28/2026: Intramedullary bedside trigger photo verified and cryptographic signature validated in NHA cloud registry.`,
                                                          `05/28/2026: Discharge summary bundle successfully serialized under API v2.3 format.`,
                                                          `05/28/2026: Case Claim disbursed to TMS server. Verification receipt: SHA-CLAIM-UP-LKO-${Math.floor(Math.random()*90000) + 10000}`
                                                        ],
                                                        claimPayload: tmsClaimPayload
                                                      };
                                                    }
                                                    return c;
                                                  }));

                                                  // Update detailed logs showing
                                                  setSelectedClaimDetail(prev => {
                                                    if (!prev) return null;
                                                    return {
                                                      ...prev,
                                                      status: "TMS Submitted",
                                                      amount: parseFloat(claimSubmitFinalBill),
                                                      logs: [
                                                        ...prev.logs,
                                                        `05/28/2026: Intramedullary bedside trigger photo verified and cryptographic signature validated in NHA cloud registry.`,
                                                        `05/28/2026: Discharge summary bundle successfully serialized under API v2.3 format.`,
                                                        `05/28/2026: Case Claim disbursed to TMS server. Verification receipt: SHA-CLAIM-UP-LKO-${Math.floor(Math.random()*90000) + 10000}`
                                                      ]
                                                    };
                                                  });

                                                  // Add telemetries
                                                  setPrevTmsLogs(prev => [
                                                    `${new Date().toLocaleTimeString()}: SUCCESS POST /api/v2/claims/insert for ${selectedClaimDetail.patientName} (Approved claim: ₹${claimSubmitFinalBill})`,
                                                    ...prev
                                                  ]);

                                                  setSuccessMessage(`Cashless Claim successfully submitted to TMS for patient ${selectedClaimDetail.patientName}!`);
                                                }, 1100);
                                              }}
                                              className="w-full bg-indigo-700 hover:bg-indigo-850 text-white font-bold p-2.5 rounded-lg cursor-pointer transition text-center"
                                            >
                                              Disburse Treatment Claim to TMS Node
                                            </button>
                                          </div>
                                        )}

                                        {selectedClaimDetail.status === "TMS Submitted" && (
                                          <div className="p-3 bg-green-55/10 text-green-800 border-2 border-green-200 rounded-xl text-center space-y-1">
                                            <span className="font-extrabold text-[11px] uppercase tracking-wide block text-green-905">Claim Handshake In-Audit</span>
                                            <span className="text-[10px] text-green-700 block text-left font-semibold leading-relaxed mt-0.5">
                                              Treatment ledger submitted to UP SACHIS. Visual checks for discharge profiles are complete. Funds release query pending Lucknow treasury office signature.
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none py-16">
                                        <FileText className="h-9 w-9 text-slate-300" />
                                        <div className="mt-1.5">
                                          <p className="font-black text-slate-400 text-xs">Active Treatment Claims Tracker</p>
                                          <p className="text-[9.5px] text-slate-500 max-w-xs leading-normal mt-0.5">Select any admission record on the left grid directory to view treatment logs, verify e-preauth payloads, and trigger final TMS claim disbursements.</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* --- ORIGINAL DEL/GENERAL STATE REGISTRATION WORKFLOW (STAYS COMPLETELY INTENT SYNCED) --- */
                          <div className="space-y-4">
                            {registeredHospitalRecord?.pmjayEnabled ? (
                              <div className="border border-green-200 bg-green-55/10 rounded-xl p-5 text-center space-y-4">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                                <div>
                                  <h4 className="font-black text-slate-800 text-sm">PMJAY / SACHIS Affiliation Certified</h4>
                                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal mt-0.5">
                                    Your cashless surgery procedures list, bed allocations, and diagnostic packages are verified by State Health Agency.
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs p-3 bg-white border rounded-xl text-left font-semibold">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Empanelment Code</span>
                                    <span className="font-mono text-slate-900 font-bold">{registeredHospitalRecord.pmjayId}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-405 block text-[9px] uppercase">Verified Schemes</span>
                                    <span className="text-emerald-700 font-bold">AB-PMJAY & SACHIS Smart</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-405 block text-[9px] uppercase">State Authority Pin</span>
                                    <span className="font-mono text-slate-900">{registeredHospitalRecord.pmjayPin}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-405 block text-[9px] uppercase">Cashless Bed Caps</span>
                                    <span className="font-bold text-slate-800">120 Beds Active</span>
                                  </div>
                                </div>

                                <div className="pt-2">
                                  <button
                                    onClick={() => {
                                      setRegisteredHospitalRecord(prev => ({ ...prev, pmjayEnabled: false }));
                                      setSuccessMessage("PMJAY / SACHIS Empanelment code unlinked.");
                                    }}
                                    className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border text-slate-500 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition"
                                  >
                                    De-authorize Scheme Link
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-slate-505 text-xs leading-relaxed">
                                  Cashless medical disbursements for patients under PM-JAY (Ayushman Bharat scheme) or State-level Health Schemes (SACHIS) require empanelling the hospital’s unique local identity inside national health assurance directories.
                                </p>

                                {selfRegStep === "init" && (
                                  <div className="bg-slate-50/50 p-4 border rounded-xl space-y-3.5">
                                    <h4 className="text-xs font-black uppercase text-slate-505 tracking-wider pb-1.5 border-b">Scheme Verification Profile</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Empanelment ID (e.g. PMJAY-HOSP-DL-12)</label>
                                        <input
                                          type="text"
                                          defaultValue="PMJAY-HOSP-DL-5521"
                                          id="reg-pmjay-id"
                                          className="w-full text-xs font-mono font-bold border rounded p-2 bg-white text-slate-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State Authority Code (SACHIS-SHA)</label>
                                        <input
                                          type="text"
                                          defaultValue="SACHIS-DL-WEST-105"
                                          id="reg-sachis-code"
                                          className="w-full text-xs font-mono font-bold border rounded p-2 bg-white text-slate-900"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1.5 pt-1">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Applicable Treatment Schemes Portfolio</label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                          <span>AB-PMJAY (Central Cashless Pool)</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-505" />
                                          <span>SACHIS State Smart-Card Schemes</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                          <span>Rashtriya Swasthya Bima Yojana (RSBY)</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                          <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                          <span>CGHS Central Government Scheme</span>
                                        </label>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setIsProcessing(true);
                                        setTimeout(() => {
                                          setIsProcessing(false);
                                          setSelfRegStep("pending_otp");
                                          setSuccessMessage("Triggered clinical audit handshake with PM-JAY state authorization node.");
                                        }, 800);
                                      }}
                                      className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-3"
                                    >
                                      Submit Empanelment Audit Request
                                    </button>
                                  </div>
                                )}

                                {selfRegStep === "pending_otp" && (
                                  <div className="bg-slate-50 p-4 border rounded-xl space-y-4 text-left">
                                    <div className="p-2.5 bg-yellow-50 text-slate-705 border border-yellow-250 text-xs rounded-lg font-semibold leading-relaxed">
                                      🔑 State Scheme OTP Protocol: input empanelment validation PIN <strong className="underline text-emerald-800 font-extrabold">555222</strong> to authorize cashless ledger sync.
                                    </div>
                                    <div className="max-w-xs space-y-2">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Verification OTP Code</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          maxLength={6}
                                          placeholder="______"
                                          value={selfRegOtp}
                                          onChange={(e) => setSelfRegOtp(e.target.value.replace(/\D/g, ""))}
                                          className="w-2/3 text-center tracking-widest text-sm font-black border rounded p-2 bg-white text-indigo-950 font-mono"
                                        />
                                        <button
                                          onClick={() => {
                                            if (selfRegOtp !== "555222") {
                                              setErrorMessage("Wrong scheme OTP validation code! Sandbox PMJAY bypass code is 555222.");
                                              return;
                                            }
                                            setIsProcessing(true);
                                            const enteredPmjay = (document.getElementById("reg-pmjay-id") as HTMLInputElement)?.value || "PMJAY-HOSP-DL-5521";
                                            const enteredSachis = (document.getElementById("reg-sachis-code") as HTMLInputElement)?.value || "SACHIS-DL-WEST-105";
                                            setTimeout(() => {
                                              setIsProcessing(false);
                                              setRegisteredHospitalRecord(prev => ({
                                                ...prev,
                                                pmjayEnabled: true,
                                                pmjayId: enteredPmjay,
                                                pmjayPin: enteredSachis,
                                              }));
                                              setSuccessMessage(`Hospital Empanelment approved for cashless procedures under ${enteredPmjay}!`);
                                            }, 1000);
                                          }}
                                          className="w-1/3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded cursor-pointer flex items-center justify-center"
                                        >
                                          Authorize Sync
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- CATEGORY C: ABDM GATEWAY API CREDENTIALS --- */}
                    {selfRegCategory === "abdm" && (
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <h3 className="font-black text-slate-800 text-sm">ABDM Central Gateway Security Credentials</h3>
                            <p className="text-[10px] text-slate-400">Configure OAuth client secrets, gateway target endpoints, and webhook routing</p>
                          </div>
                          <span className="bg-orange-100 text-orange-850 px-2 py-0.5 rounded text-[9px] font-bold border border-orange-250 uppercase font-mono">Gateway Module</span>
                        </div>

                        {registeredHospitalRecord?.abdmEnabled ? (
                          <div className="border border-green-200 bg-green-55/10 rounded-xl p-5 text-center space-y-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                            <div>
                              <h4 className="font-black text-slate-800 text-sm">Central ABDM Bridge Connection Established</h4>
                              <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal mt-0.5">
                                Secure client credentials authenticated against NHA authorization endpoints. JWT Web token active.
                              </p>
                            </div>

                            <div className="font-mono text-[10.5px] border rounded-xl overflow-hidden bg-slate-900 text-left shadow-xs">
                              <div className="bg-slate-800 p-2.5 text-slate-300 font-bold border-b flex justify-between items-center text-[9px]">
                                <span>ABDM SDK API AUDIT PANEL</span>
                                <span className="text-green-500">Bearer Token: Active (TLS 1.3)</span>
                              </div>
                              <div className="p-3.5 space-y-1.5 text-slate-400">
                                <div><span className="text-slate-550 mr-2">NHA CLIENT ID:</span> <span className="text-slate-200 font-bold">{registeredHospitalRecord.clientId}</span></div>
                                <div><span className="text-slate-550 mr-2">SECRET HASH:</span> <span className="text-slate-500">••••••••••••••••••••</span></div>
                                <div><span className="text-slate-550 mr-2">GATEWAY URI:</span> <span className="text-slate-200">{registeredHospitalRecord.gatewayEndpoint}</span></div>
                                <div><span className="text-slate-550 mr-2">PING LATENCY:</span> <span className="text-green-400 font-bold">14 ms (Sandbox Direct Handshake)</span></div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setRegisteredHospitalRecord(prev => ({ ...prev, abdmEnabled: false }));
                                  setSuccessMessage("ABDM Gateway client credentials unlinked.");
                                }}
                                className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border text-slate-505 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition"
                              >
                                Revoke Client Access Key
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-slate-505 text-xs leading-relaxed">
                              Your hospital software uses secure API handshakes to sign OPD Scan & Share packets and bundle clinical records online. Register your client API access key and gateway signature parameters below.
                            </p>

                            <div className="bg-slate-50/50 p-4 border rounded-xl space-y-3.5">
                              <h4 className="text-xs font-black uppercase text-slate-505 tracking-wider pb-1.5 border-b">Ecosystem OAuth Credentials</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sandbox Client Access ID</label>
                                  <input
                                    type="text"
                                    defaultValue="SBX_CLIENT_1337_DL"
                                    id="reg-abdm-client"
                                    className="w-full text-xs font-mono font-bold border rounded p-2 bg-white text-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Client Secret Password Key</label>
                                  <input
                                    type="password"
                                    defaultValue="not_a_real_secret_key"
                                    className="w-full text-xs font-mono border rounded p-2 bg-slate-100 text-slate-500"
                                    disabled
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NHA Ecosystem API Gateway Gateway</label>
                                <select
                                  id="reg-abdm-gateway"
                                  className="w-full text-xs font-bold border rounded p-2 bg-white text-slate-800"
                                >
                                  <option value="https://sandbox.abdm.gov.in/v1.0">https://sandbox.abdm.gov.in/v1.0 (Government Sandbox Node)</option>
                                  <option value="https://api.ndhm.gov.in/v1.0">https://api.ndhm.gov.in/v0.5 (NHA Central Production Node)</option>
                                </select>
                              </div>

                              <button
                                onClick={() => {
                                  setIsProcessing(true);
                                  const cId = (document.getElementById("reg-abdm-client") as HTMLInputElement)?.value || "SBX_CLIENT_1337_DL";
                                  const gate = (document.getElementById("reg-abdm-gateway") as HTMLSelectElement)?.value || "https://sandbox.abdm.gov.in/v1.0";
                                  setTimeout(() => {
                                    setIsProcessing(false);
                                    setRegisteredHospitalRecord(prev => ({
                                      ...prev,
                                      abdmEnabled: true,
                                      clientId: cId,
                                      gatewayEndpoint: gate,
                                    }));
                                    setSuccessMessage("OAuth Handshake connection established with central NHA Gateway!");
                                  }, 1100);
                                }}
                                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                              >
                                Authenticate Gateway Client
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* HIGH FIDELITY ELECTRONIC ABHA CARD WRAPPER */
interface ViewerProps {
  card: {
    id: string;
    num: string;
    name: string;
    dob: string;
    gender: string;
    mobile: string;
    aadhaar?: string;
    source: string;
  };
}

function AbhaCardViewer({ card }: ViewerProps) {
  const triggerCardPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-left hover:bg-indigo-50/70">
        <h4 className="text-xs font-bold text-indigo-900">Ayushman Health Account Issued!</h4>
        <p className="text-[10px] text-indigo-700 mt-0.5 leading-normal">
          This digital health card allows biometric sync, seamless queue ticketing, and consent-based health exchanges across any accredited NHA hospital in India.
        </p>
      </div>

      {/* CSS Rendered Electronic ABHA Card Layout matching official colors */}
      <div className="border border-indigo-200 rounded-xl overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 w-full max-w-md mx-auto shadow-md" id="printable-abha-card">
        
        {/* Card Header band */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 p-3 flex justify-between items-center text-white text-[11px] font-bold">
          <div className="flex items-center gap-1.5 selection:bg-indigo-700/30">
            <span className="text-xs select-none">🇮🇳</span>
            <span>AYUSHMAN BHARAT DIGITAL MISSION</span>
          </div>
          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded uppercase">NHA Gateway</span>
        </div>

        <div className="p-4 grid grid-cols-12 gap-3 items-center">
          {/* Mock Patient Avatar / Image */}
          <div className="col-span-4 flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shrink-0">
            <div className="w-16 h-20 bg-slate-100 flex items-center justify-center rounded">
              <User className="h-10 w-10 text-slate-400" />
            </div>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Verified E-KYC</span>
          </div>

          {/* Core Demographic details */}
          <div className="col-span-8 space-y-1.5 text-left">
            <div>
              <span className="text-[8px] uppercase text-slate-405 block font-bold">Legal Name</span>
              <strong className="text-slate-800 text-xs tracking-tight font-extrabold">{card.name}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] select-none leading-none pt-0.5">
              <div>
                <span className="text-[8px] uppercase text-slate-405 block">Gender</span>
                <span className="font-bold text-slate-600">{card.gender}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-405 block">Date of Birth</span>
                <span className="font-bold text-slate-600 font-mono text-[9px]">{card.dob}</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200/50">
              <span className="text-[8px] uppercase text-slate-405 block font-bold">ABHA Address ID</span>
              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-150 inline-block">
                {card.id}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom card metrics band holding the 14 digit Number */}
        <div className="bg-slate-100 px-4 py-2.5 border-t flex justify-between items-center">
          <div className="text-left select-none">
            <span className="text-[8px] uppercase text-slate-500 block font-bold">14-Digit ABHA Number</span>
            <span className="font-mono text-xs font-black text-slate-900 tracking-wider">
              {card.num}
            </span>
          </div>
          <div className="p-1 bg-white border rounded">
            <QrCode className="h-6 w-6 text-slate-800" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center" id="card-action-bar">
        <button
          onClick={triggerCardPrint}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 border cursor-pointer transition"
        >
          <Printer className="h-4 w-4" /> Print ABHA E-Card
        </button>
        <button
          onClick={() => {
            alert(`Simulated XML download triggered. ABDM artifact: ${card.num}.xml ready internally.`);
          }}
          className="bg-slate-900 text-slate-150 hover:bg-slate-800 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer transition"
        >
          <Download className="h-4 w-4" /> Export XML Profile
        </button>
      </div>
    </div>
  );
}
