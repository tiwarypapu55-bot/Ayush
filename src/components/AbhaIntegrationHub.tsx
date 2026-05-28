import React, { useState, useEffect } from "react";
import { 
  User, QrCode, ClipboardPlus, Phone, Shield, ArrowRight, CheckCircle2, 
  BadgeAlert, Plus, HelpCircle, Search, RefreshCw, Printer, Download, 
  Users, Award, Activity, Sparkles, Database, FileText, Check, AlertTriangle, 
  FileCheck, ShieldAlert, Lock, MapPin, HardDrive, Smartphone, FilePlus 
} from "lucide-react";
import { Patient, Encounter, AbhaMaster } from "../types";

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
  // Main Navigation within ABDM hub
  const [activeTab, setActiveTab] = useState<"create" | "verify" | "link" | "camp">("create");

  // Sub-tabs for Creation methods
  const [creationMethod, setCreationMethod] = useState<"aadhaar" | "dl" | "mobile" | "face" | "demo">("aadhaar");

  // Common Simulator States
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTxnId, setSessionTxnId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      "🔋 Initiating HL7 FHIR Bundle mapping (v4.0.1)...",
      "📄 Parsing hospital EMR records into clinical observation resources...",
    ]);
    setSyncPercentage(10);

    const stages = [
      { p: 30, log: "✅ Generated FHIR resource: Patient profile (Subject node mapping)..." },
      { p: 50, log: "✅ Mapped observation items: Diagnostic & ICD-10 encounter codes..." },
      { p: 70, log: "🔒 Applying DPDP compliant security envelope encryptors..." },
      { p: 90, log: "🚀 Handshaking with NHA Sandbox Central Interoperability Node..." },
      { p: 100, log: "🎉 Ready! Cryptographic integrity checksum validated." }
    ];

    stages.forEach((st, idx) => {
      setTimeout(() => {
        setSyncPercentage(st.p);
        setSyncLogs(prev => [...prev, st.log]);
        if (st.p === 100) {
          // Generate actual FHIR mock json
          const relatedEnc = encounters.filter(e => e.patientId === targetPatient.id);
          const fhirJson = {
            resourceType: "Bundle",
            id: `bundle-abdm-${Math.floor(10000 + Math.random() * 90000)}`,
            type: "document",
            timestamp: new Date().toISOString(),
            identifier: {
              system: "https://ndhm.gov.in/bundle",
              value: `checksum-${Math.floor(200000 + Math.random() * 800000)}`
            },
            entry: [
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
                  ]
                }
              },
              ...relatedEnc.map(re => ({
                fullUrl: `Encounter/${re.id}`,
                resource: {
                  resourceType: "Encounter",
                  id: re.id,
                  status: "finished",
                  class: { code: "AMB", display: "ambulatory" },
                  subject: { reference: `Patient/${targetPatient.id}` },
                  reasonCode: [{ text: re.chiefComplaints }],
                  diagnosis: [
                    {
                      condition: { display: re.diagnoses },
                      rank: 1
                    }
                  ]
                }
              }))
            ]
          };
          setFhirBundleJson(fhirJson);
          setFhirMapStep("fhir_ready");
        }
      }, (idx + 1) * 500);
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
      <div className="flex bg-slate-100 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 cursor-pointer ${
            activeTab === "create" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FilePlus className="h-4 w-4" /> ABHA Account Issuance
        </button>
        <button
          onClick={() => setActiveTab("camp")}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 cursor-pointer ${
            activeTab === "camp" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" /> Bulk Camp Modules
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-r flex items-center gap-1.5 cursor-pointer ${
            activeTab === "verify" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Search className="h-4 w-4" /> Verify & Validate ID
        </button>
        <button
          onClick={() => setActiveTab("link")}
          className={`px-5 py-3.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "link" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-700" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="h-4 w-4" /> FHIR Interop Exchange
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
                                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2 rounded cursor-pointer"
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
                          className="bg-indigo-650 text-white font-bold p-2.5 rounded text-xs hover:bg-indigo-700 w-full disabled:bg-slate-300 cursor-pointer"
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
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Hospital Documents to Compile</label>
                  <div className="border rounded bg-white p-3 divide-y text-xs max-h-48 overflow-y-auto">
                    {encounters.filter(e => e.patientId === linkSelectedPatientId).map((e, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="text-slate-800">OPD Case: {e.chiefComplaints}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Diagnose: {e.diagnoses} | Bed Allocation: {e.vitals?.bp || "Good"}</span>
                        </div>
                      </div>
                    ))}
                    {encounters.filter(e => e.patientId === linkSelectedPatientId).length === 0 && (
                      <p className="text-slate-400 p-2 text-center text-xs">No active diagnostic encounters located.</p>
                    )}
                  </div>

                  <button
                    onClick={renderFhirEncoder}
                    className="w-full bg-slate-900 text-white font-bold text-xs p-3 rounded-lg hover:bg-slate-850 cursor-pointer"
                  >
                    Compile HL7 FHIR Observation Payload
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
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center justify-center gap-1 cursor-pointer shadow-sm"
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
