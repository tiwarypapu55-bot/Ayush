import React from "react";
import { 
  CheckCircle2, BadgeAlert, ShieldAlert, Lock, Activity, FileText, 
  Users, HardDrive, RefreshCw, Download, Search, AlertTriangle, Check, Plus
} from "lucide-react";
import { Patient } from "../types";

// --- SECTION 1: CONSENT MANAGER WIDGET PANEL ---
interface ConsentManagerPanelProps {
  patients: Patient[];
  newConsentPatientId: string;
  setNewConsentPatientId: (id: string) => void;
  newConsentPurpose: string;
  setNewConsentPurpose: (purpose: string) => void;
  newConsentScope: string[];
  setNewConsentScope: (scope: string[] | ((prev: string[]) => string[])) => void;
  isProcessing: boolean;
  setIsProcessing: (b: boolean) => void;
  consentOtpSent: boolean;
  setConsentOtpSent: (b: boolean) => void;
  consentOtpInput: string;
  setConsentOtpInput: (s: string) => void;
  consentActiveRequestJson: any;
  setConsentActiveRequestJson: (o: any) => void;
  consentActiveResponseJson: any;
  setConsentActiveResponseJson: (o: any) => void;
  consentLogs: any[];
  setConsentLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
  setSuccessMessage: (m: string) => void;
  setErrorMessage: (m: string) => void;
  privacySecurityLogs: any[];
  setPrivacySecurityLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
}

export const ConsentManagerPanel: React.FC<ConsentManagerPanelProps> = ({
  patients,
  newConsentPatientId,
  setNewConsentPatientId,
  newConsentPurpose,
  setNewConsentPurpose,
  newConsentScope,
  setNewConsentScope,
  isProcessing,
  setIsProcessing,
  consentOtpSent,
  setConsentOtpSent,
  consentOtpInput,
  setConsentOtpInput,
  consentActiveRequestJson,
  setConsentActiveRequestJson,
  consentActiveResponseJson,
  setConsentActiveResponseJson,
  consentLogs,
  setConsentLogs,
  setSuccessMessage,
  setErrorMessage,
  privacySecurityLogs,
  setPrivacySecurityLogs
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Box: Request Explicit Electronic Consent (M2/DPDP Compliance) */}
      <div className="lg:col-span-5 border border-slate-200 p-6 rounded-xl bg-slate-50/40 space-y-4">
        <div className="flex items-center gap-1.5 border-b pb-2.5">
          <ShieldAlert className="h-5 w-5 text-emerald-600 animate-pulse" />
          <h3 className="font-extrabold text-slate-800 text-sm">Explicit Consent Requester</h3>
        </div>
        
        <p className="text-slate-500 text-xs leading-normal">
          ABDM mandates explicit patient authorization under the DPDP Act 2023. This form triggers a secure clinical consent request artifact via standard NHA API gateways with a strict purpose limitation declaration.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consenting Patient (ABHA Mapped)</label>
            <select
              value={newConsentPatientId}
              onChange={(e) => {
                setNewConsentPatientId(e.target.value);
                setConsentOtpSent(false);
                setConsentOtpInput("");
                setConsentActiveRequestJson(null);
                setConsentActiveResponseJson(null);
              }}
              className="w-full text-xs border rounded-lg p-2.5 bg-white font-semibold focus:outline-hidden text-slate-900 border-slate-300"
            >
              <option value="">-- Choose Mapped Patient --</option>
              {patients.filter(p => p.abhaId).map(p => (
                <option key={p.id} value={p.id}>{p.name} (ABHA: {p.abhaId})</option>
              ))}
            </select>
          </div>

          {newConsentPatientId && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Access Purpose Indicator</label>
                <select
                  value={newConsentPurpose}
                  onChange={(e) => setNewConsentPurpose(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white focus:outline-hidden font-medium text-slate-900 border-slate-300"
                >
                  <option value="Longitudinal Health History Sync">Longitudinal Health History Sync</option>
                  <option value="Active OPD Consultation Diagnostic Lookup">Active OPD Consultation Diagnostic Lookup</option>
                  <option value="Inpatient Emergency Treatment History">Inpatient Emergency Treatment History</option>
                  <option value="Surgical Pre-Assessment Audit">Surgical Pre-Assessment Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinical Information Scope Types</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: "Prescriptions", label: "ePrescriptions" },
                    { id: "Diagnostic Reports", label: "Diagnostic Lab Reports" },
                    { id: "Discharge Summary", label: "Discharge Summaries" },
                    { id: "Immunization Records", label: "Immunizations" }
                  ].map(t => (
                    <label key={t.id} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newConsentScope.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewConsentScope(prev => [...prev, t.id]);
                          } else {
                            setNewConsentScope(prev => prev.filter(x => x !== t.id));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explicit DPDP Notice block */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10.5px] text-slate-600 leading-normal">
                <span className="font-bold text-indigo-950 block mb-0.5">⚠️ DPDP Purpose Limitation Clause:</span>
                Under DPDP Act Section 6, this health data is strictly locked to specified purposes. Safe removal is guaranteed upon withdrawal of consent. Secondary processing or unapproved transfer is cryptographically prevented.
              </div>

              {/* Simulating APIS */}
              {!consentOtpSent ? (
                <button
                  onClick={() => {
                    const pat = patients.find(p => p.id === newConsentPatientId);
                    if (!pat) return;
                    
                    // Mocking real ABDM REST API request structure
                    const reqPayload = {
                      consent: {
                        status: "REQUESTED",
                        purpose: {
                          code: "REFERRAL",
                          text: newConsentPurpose
                        },
                        patient: { id: pat.abhaId },
                        requester: {
                          name: "Dr. Arvind Swaminathan",
                          identifier: {
                            system: "https://hpr.ndhm.gov.in",
                            value: "hpr-arvind@sbx"
                          }
                        },
                        hiTypes: newConsentScope,
                        permission: {
                          accessMode: "VIEW",
                          dateRange: {
                            from: "2020-01-01",
                            to: new Date().toISOString().split("T")[0]
                          },
                          dataEraseAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
                        }
                      }
                    };
                    setConsentActiveRequestJson(reqPayload);
                    setIsProcessing(true);
                    
                    setTimeout(() => {
                      setIsProcessing(false);
                      setConsentOtpSent(true);
                      setConsentActiveResponseJson({
                        txnId: `txn-${Math.floor(100000 + Math.random() * 900000)}`,
                        consentRequestId: `con-req-${Math.floor(200000 + Math.random() * 800000)}`,
                        status: "PENDING_AWAITING_APPROVAL",
                        timestamp: new Date().toISOString()
                      });
                      
                      // Add an Audit Log
                      const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
                      const newAudit = {
                        id: auditId,
                        timestamp: new Date().toISOString(),
                        actor: "Dr. Arvind Swaminathan (HPR-10255)",
                        action: "Init ABDM Consent Authorization",
                        patientId: pat.id,
                        patientName: pat.name,
                        status: "PENDING_APPROVAL",
                        consentId: "Awaiting",
                        severity: "INFO",
                        details: `Created consent request for '${newConsentPurpose}' covering [${newConsentScope.join(", ")}]. Broadcast sent to NHA Gateway.`
                      };
                      setPrivacySecurityLogs(prev => [newAudit, ...prev]);
                      setSuccessMessage("ABDM Consent Request broadcasted! Awaiting patient approval code.");
                    }, 1000);
                  }}
                  disabled={isProcessing || newConsentScope.length === 0}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  Sign and Broadcast Consent Request Envelope
                </button>
              ) : (
                <div className="space-y-3.5 border-t pt-3">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded-lg text-[10.5px] leading-relaxed font-semibold text-slate-700">
                    📲 Simulated Approval PIN sent to patient's phone. Use Sandbox bypass bypass-code <strong className="underline text-indigo-700">888999</strong> to approve consent.
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">6-Digit Approve PIN</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={consentOtpInput}
                      onChange={(e) => setConsentOtpInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="______"
                      className="w-full text-center tracking-widest text-base font-extrabold border p-2 text-indigo-950 bg-white rounded-lg focus:outline-hidden font-mono border-indigo-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConsentOtpSent(false);
                        setConsentOtpInput("");
                        setConsentActiveRequestJson(null);
                        setConsentActiveResponseJson(null);
                      }}
                      className="w-1/3 border border-slate-300 text-slate-600 font-bold text-xs p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => {
                        if (consentOtpInput !== "888999") {
                          setErrorMessage("Invalid verification PIN! Sandbox bypass-code is 888999.");
                          return;
                        }
                        setIsProcessing(true);
                        setTimeout(() => {
                          const pat = patients.find(p => p.id === newConsentPatientId);
                          if (!pat) return;

                          const newLog = {
                            id: `CON-${Math.floor(1000 + Math.random() * 9000)}`,
                            patientId: pat.id,
                            patientName: pat.name,
                            doctorName: "Dr. Arvind Swaminathan",
                            purpose: newConsentPurpose,
                            scope: newConsentScope,
                            status: "Active",
                            validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
                            grantedAt: new Date().toISOString().split("T")[0]
                          };
                          setConsentLogs(prev => [newLog, ...prev]);

                          // Add Audit Log
                          const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
                          const newAudit = {
                            id: auditId,
                            timestamp: new Date().toISOString(),
                            actor: "Dr. Arvind Swaminathan (HPR-10255)",
                            action: "Consent Granted by Patient",
                            patientId: pat.id,
                            patientName: pat.name,
                            status: "AUTHORIZED",
                            consentId: newLog.id,
                            severity: "SUCCESS",
                            details: `Explicit electronic consent artifact signed by patient via ABHA Gateway. Cryptographic token validated for HIPAA/DPDP.`
                          };
                          setPrivacySecurityLogs(prev => [newAudit, ...prev]);

                          setConsentOtpSent(false);
                          setConsentOtpInput("");
                          setNewConsentPatientId("");
                          setConsentActiveRequestJson(null);
                          setConsentActiveResponseJson(null);
                          setIsProcessing(false);
                          setSuccessMessage(`Consent artifact ${newLog.id} approved by patient and recorded securely!`);
                        }, 1100);
                      }}
                      className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                      Approve Explicit Consent
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Box: Live Consents List & API Trace Logs */}
      <div className="lg:col-span-7 space-y-4">
        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
          <span className="block text-xs font-bold text-slate-500 uppercase mb-3 pb-1 border-b text-left">
            Active Explicit Consents Registry ({consentLogs.filter(c => c.status === "Active").length})
          </span>

          <div className="space-y-3.5 max-h-64 overflow-y-auto">
            {consentLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active clinical authorization artifacts found in HSM keystore.
              </div>
            ) : (
              consentLogs.map((con, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 border rounded-xl flex justify-between items-start transition-all ${
                    con.status === "Active" ? "bg-emerald-50/20 border-emerald-150" : "bg-slate-50/60 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${con.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      <strong className="text-xs text-slate-800">{con.patientName} (UHID: {con.patientId})</strong>
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">{con.id}</span>
                    </div>
                    <p className="text-[10.5px] font-medium text-slate-600">
                      <span className="font-semibold text-indigo-900 block">Purpose: {con.purpose}</span>
                      Authorized EMR scope: {con.scope.join(", ")}
                    </p>
                    <div className="text-[9.5px] text-slate-400 font-mono">
                      Granted: {con.grantedAt} | Expiry Boundary: <strong className="text-rose-700 font-bold">{con.validUntil}</strong>
                    </div>
                  </div>

                  {con.status === "Active" && (
                    <button
                      onClick={() => {
                        setConsentLogs(prev => prev.map(c => c.id === con.id ? { ...c, status: "Revoked" } : c));
                        
                        // Add Audit Log
                        const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
                        const newAudit = {
                          id: auditId,
                          timestamp: new Date().toISOString(),
                          actor: "Patient ABHA Mobile App",
                          action: "Revoke Clinical Consent Act",
                          patientId: con.patientId,
                          patientName: con.patientName,
                          status: "REVOKED_BY_PRINCIPAL",
                          consentId: con.id,
                          severity: "WARNING",
                          details: `Under DPDP Act Sec 6(5), the patient withdrew consent. Consent token invalidated. Access keys erased immediately.`
                        };
                        setPrivacySecurityLogs(prev => [newAudit, ...prev]);

                        setSuccessMessage(`Consent ${con.id} revoked and blocked under DPDP mandate!`);
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0 transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Endpoint Tracer API Panel */}
        {consentActiveRequestJson && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 font-mono text-[10.5px] shadow-xs text-left">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-slate-300">
              <span className="font-bold flex items-center gap-1"><Lock className="h-3 w-3 text-indigo-400" /> Gateway REST API Audit Tracer</span>
              <span className="text-[9px] font-bold text-indigo-400">POST /api/v1.0/consent-requests/init</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-800 h-52 overflow-y-auto">
              <div className="p-3 space-y-1 text-slate-400">
                <span className="text-slate-500 font-bold uppercase block text-[8.5px]">Headers Payload</span>
                <div className="text-green-500">Authorization: Bearer oauth2_hosp_abdm_prod</div>
                <div className="text-yellow-500">X-HIP-ID: HFR-UP-LKO-99120</div>
                <span className="text-slate-500 font-bold uppercase block text-[8.5px] pt-1">JSON Request Body</span>
                <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(consentActiveRequestJson, null, 2)}</pre>
              </div>
              <div className="p-3 space-y-1 text-slate-400">
                <span className="text-slate-500 font-bold uppercase block text-[8.5px]">JSON Response Body</span>
                {consentActiveResponseJson ? (
                  <pre className="text-green-400 whitespace-pre-wrap">{JSON.stringify(consentActiveResponseJson, null, 2)}</pre>
                ) : (
                  <div className="text-slate-600 italic animate-pulse">Awaiting API Gateway response...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- SECTION 2: DPDP ACT 2023 COMPLIANCE WIDGET ---
interface DpdpActPanelProps {
  patients: Patient[];
  dpdpLanguage: "en" | "hi" | "ur";
  setDpdpLanguage: (lang: "en" | "hi" | "ur") => void;
  dpdpErasePatientId: string;
  setDpdpErasePatientId: (id: string) => void;
  dpdpEraseReason: string;
  setDpdpEraseReason: (r: string) => void;
  dpdpGrievanceLog: any[];
  setDpdpGrievanceLog: (logs: any[] | ((prev: any[]) => any[])) => void;
  setSuccessMessage: (m: string) => void;
  setErrorMessage: (m: string) => void;
  setPrivacySecurityLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
  grievantName: string;
  setGrievantName: (n: string) => void;
  grivType: string;
  setGrivType: (t: string) => void;
  grivDetails: string;
  setGrivDetails: (d: string) => void;
}

export const DpdpActPanel: React.FC<DpdpActPanelProps> = ({
  patients,
  dpdpLanguage,
  setDpdpLanguage,
  dpdpErasePatientId,
  setDpdpErasePatientId,
  dpdpEraseReason,
  setDpdpEraseReason,
  dpdpGrievanceLog,
  setDpdpGrievanceLog,
  setSuccessMessage,
  setErrorMessage,
  setPrivacySecurityLogs,
  grievantName,
  setGrievantName,
  grivType,
  setGrivType,
  grivDetails,
  setGrivDetails
}) => {
  // Multilingual statutory notices
  const notices = {
    en: {
      title: "DIGITAL PERSONAL DATA PROTECTION (DPDP) SECTION 5 COMPLIANCE NOTICE",
      subtitle: "Consent Notice for Processing Personal Clinical Data",
      officer: "Data Protection Officer: Shri Alok Kumar Pathak, UP State Coordinator",
      email: "grievance.dpdp@uphealth.gov.in",
      body: "Under the India Digital Personal Data Protection Act 2023 (Section 5), this healthcare facility acts as a Data Fiduciary. By granting consent, you authorize processing solely for treatment, diagnosis, and PMJAY claim verification. Your data is protected by AES-256 local encrypted vaults bound to your National ID. You possess the absolute statutory rights to access personal data, rectify inaccuracies, withdraw consent at any time, or request complete erasure of your record (Right to be Forgotten). Processing strictly adheres to state and national guidelines."
    },
    hi: {
      title: "डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) धारा 5 अनुपालन सूचना",
      subtitle: "व्यक्तिगत नैदानिक डेटा के प्रसंस्करण के लिए सहमति सूचना",
      officer: "डेटा संरक्षण अधिकारी: श्री आलोक कुमार पाठक, उत्तर प्रदेश राज्य समन्वयक",
      email: "grievance.dpdp@uphealth.gov.in",
      body: "भारत के 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम २०२३' (धारा ५) के अंतर्गत, यह चिकित्सा संस्थान 'डेटा फिडुशियरी' (Data Fiduciary) के रूप में कार्य करता है। सहमति प्रदान करके, आप केवल उपचार, निदान और स्वास्थ्य दावों (PM-JAY) के सत्यापन के लिए डेटा प्रोसेसिंग की अनुमति दे रहे हैं। आपका डेटा अत्याधुनिक राष्ट्रीय एन्क्रिप्शन पद्धति (AES-256) से सुरक्षित है। आपके पास अपने डेटा को देखने, त्रुटियों को सुधारने, अपनी सहमति वापस लेने और अपने ऐतिहासिक रिकॉर्ड को हमेशा के लिए मिटाने (Right to be Forgotten) का पूर्ण कानूनी अधिकार है।"
    },
    ur: {
      title: "ڈیجیٹل پرسنل ڈیٹا پروٹیکشن (DPDP) سیکشن 5 نوٹس",
      subtitle: "ذاتی طبی ڈیٹا کی پروسیسنگ کے لیے رضامندی کا نوٹس",
      officer: "ڈیٹا پروٹیکشن آفیسر: شری آلوک کمار پاٹھک، اتر پردیش کوآرڈینیٹر",
      email: "grievance.dpdp@uphealth.gov.in",
      body: "انڈیا ڈیجیٹل پرسنل ڈیٹا پروٹیکشن ایکٹ 2023 (سیکشن 5) کے تحت، یہ ہسپتال بطور 'ڈیٹا فڈوشیری' کام کرتا ہے۔ رضامندی دے کر، آپ صرف علاج، تشخیص اور بیمہ کلیمز کی تصدیق کے لیے ڈیٹا پروسیسنگ کی اجازت دیتے ہیں۔ آپ کے ڈیٹا کو محفوظ AES-256 انکرپشن میں رکھ کر محفوظ کیا گیا ہے۔ آپ کو قانونی طور پر یہ اختیار حاصل ہے کہ جب چاہیں رضامندی واپس لے سکتے ہیں، ڈیٹا میں تصحیح کرا سکتے ہیں، یا اپنے ڈیٹا کو ہسپتال ریکارڈ سے مکمل خارج (مٹانے) کرانے کا حق استعمال کر سکتے ہیں۔"
    }
  };

  const selectedNotice = notices[dpdpLanguage];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Multilingual DPDP Notice and Statutory Guardrails */}
      <div className="lg:col-span-7 border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex justify-between items-center border-b pb-2.5">
          <div className="flex items-center gap-1.5 align-middle">
            <FileText className="h-5 w-5 text-indigo-700" />
            <h3 className="font-extrabold text-slate-800 text-sm">Statutory DPDP Consent Notice Selector</h3>
          </div>
          
          <div className="flex bg-slate-100 border p-1 rounded-lg gap-1">
            {(["en", "hi", "ur"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setDpdpLanguage(lang)}
                className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-md uppercase transition cursor-pointer ${
                  dpdpLanguage === lang ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
                }`}
              >
                {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "اردو"}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Multilingual Statutory Notice Body */}
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-sans tracking-tight space-y-3.5 border border-slate-850">
          <div className="flex items-start gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest leading-normal">
                {selectedNotice.title}
              </h4>
              <p className="text-[11.5px] font-bold text-slate-300 mt-0.5">
                {selectedNotice.subtitle}
              </p>
            </div>
          </div>
          
          <p className="text-xs leading-relaxed font-medium text-slate-300 text-justify">
            {selectedNotice.body}
          </p>

          <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Fiduciary Unit ID:</span>
              <span className="font-bold text-slate-250">ABDM-HFR-UP-LKO-1337</span>
            </div>
            <div className="flex justify-between">
              <span>State Nodal Officer:</span>
              <span className="font-bold text-slate-250">{selectedNotice.officer}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Hotdesk Email:</span>
              <span className="font-bold text-rose-450 underline">{selectedNotice.email}</span>
            </div>
          </div>
        </div>

        {/* DPDP Redressal / Grievance Escalation Form */}
        <div className="border p-4 bg-slate-50/30 rounded-xl space-y-3">
          <span className="block text-[10.5px] font-extrabold text-slate-700 uppercase">
            Data Principal Grievance & Redressal Lodge
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Complainant / Grievant</label>
              <input
                type="text"
                placeholder="Ex. Suresh Chandra"
                value={grievantName}
                onChange={(e) => setGrievantName(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white text-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Grievance Type</label>
              <select
                value={grivType}
                onChange={(e) => setGrivType(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white text-slate-900 focus:outline-hidden"
              >
                <option value="Correction of personal data">Correction of personal data</option>
                <option value="Access request under Section 11">Access request under Section 11</option>
                <option value="Unauthorized data processing report">Unauthorized processing report</option>
                <option value="Grievance officer escalations">Grievance officer escalations</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-501 uppercase mb-1">Brief Details / Claim Context</label>
            <textarea
              placeholder="Provide exact context of dispute, incorrect ABHA address spelling or unapproved EMR linkage."
              rows={2}
              value={grivDetails}
              onChange={(e) => setGrivDetails(e.target.value)}
              className="w-full text-xs border rounded-lg p-2 bg-white text-slate-900 focus:outline-hidden"
            />
          </div>
          <button
            onClick={() => {
              if (!grievantName || !grivDetails) {
                setErrorMessage("Please supply your name and grievance details before lodgement.");
                return;
              }
              const newGriv = {
                id: `GRIV-${Math.floor(1000 + Math.random() * 9000)}`,
                name: grievantName,
                type: grivType,
                status: "Pending Investigation",
                registeredAt: new Date().toISOString().split("T")[0]
              };
              setDpdpGrievanceLog(prev => [newGriv, ...prev]);
              
              const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
              const newAudit = {
                id: auditId,
                timestamp: new Date().toISOString(),
                actor: "Grievance System Gateway",
                action: "Lodge DPDP Disagreement Dispute",
                patientId: "N/A",
                patientName: grievantName,
                status: "PENDING_INVESTIGATION",
                consentId: "N/A",
                severity: "WARNING",
                details: `Patient registered official dispute ID ${newGriv.id} of class '${grivType}'. Escaled to UP Grievance Nodal.`
              };
              setPrivacySecurityLogs(prev => [newAudit, ...prev]);

              setGrievantName("");
              setGrivDetails("");
              setSuccessMessage(`Grievance ${newGriv.id} lodged successfully! Retain code is ${newGriv.id} for further follow-ups.`);
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Lodge Formal Redressal Claim Ticket
          </button>
        </div>
      </div>

      {/* Right Column: Act of Patient Rights (Erasure / Forget) & Grievance Registry */}
      <div className="lg:col-span-5 space-y-4">
        {/* Right to be Forgotten (ERASURE SANBOX) */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 text-left space-y-3.5">
          <div className="flex items-center gap-1 border-b pb-2">
            <Lock className="text-rose-600 h-4 md:h-5 w-4 md:w-5" />
            <h4 className="text-xs font-bold text-slate-800 uppercase">
              Statutory Right To Erasure (Sec 12)
            </h4>
          </div>

          <p className="text-[11.5px] text-slate-550 leading-relaxed">
            Data Principals may enforce complete removal of medical history once treatment concludes, or upon withdrawal of consent. Exercising this deletes local caches and indexes.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[9.5px] font-bold text-slate-550 uppercase mb-1">Select Concluded Patient</label>
              <select
                value={dpdpErasePatientId}
                onChange={(e) => setDpdpErasePatientId(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white text-slate-900 focus:outline-hidden"
              >
                <option value="">-- Choose Patient for Total Purge --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (UHID: {p.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9.5px] font-bold text-slate-550 uppercase mb-1">Official Purge Warrant Reason</label>
              <input
                type="text"
                value={dpdpEraseReason}
                onChange={(e) => setDpdpEraseReason(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white text-slate-900 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => {
                if (!dpdpErasePatientId) {
                  setErrorMessage("Select a patient whose historical data needs complete erasure.");
                  return;
                }
                const pat = patients.find(p => p.id === dpdpErasePatientId);
                if (!pat) return;

                // Create Audit Log
                const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
                const newAudit = {
                  id: auditId,
                  timestamp: new Date().toISOString(),
                  actor: "DPO State Coordinator Unit",
                  action: "Enforce Right to Forget (Erasure)",
                  patientId: pat.id,
                  patientName: pat.name,
                  status: "DATA_ERASED",
                  consentId: "N/A",
                  severity: "CRITICAL",
                  details: `DPDP Act Sec 12 request processed. Clinical histories, local FHIR payload, and demographic indexes deleted from primary disks.`
                };
                setPrivacySecurityLogs(prev => [newAudit, ...prev]);
                setSuccessMessage(`Data purge warrant succeeded! Patient ${pat.name}'s histories have been cryptographically erased from local disks.`);
                setDpdpErasePatientId("");
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Enforce Complete Data Erasure / De-linkage
            </button>
          </div>
        </div>

        {/* Live Grievances Log registry */}
        <div className="border border-slate-200 rounded-xl p-5 bg-white text-left space-y-3">
          <span className="block text-[10.5px] font-extrabold text-slate-500 uppercase pb-1 border-b">
            Active Grievance Redressal Registry
          </span>

          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {dpdpGrievanceLog.map((griv, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-slate-800">{griv.name} <span className="font-mono text-[9px] text-indigo-700">[{griv.id}]</span></div>
                  <div className="text-[10px] text-slate-500">{griv.type}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Lodge Date: {griv.registeredAt}</div>
                </div>
                <div className="shrink-0">
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                    griv.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-850 animate-pulse"
                  }`}>
                    {griv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- SECTION 3: SECURE AUDIT LOGGING VIEW ---
interface SecurityAuditTrailPanelProps {
  privacySecurityLogs: any[];
  setPrivacySecurityLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
  auditSearchQuery: string;
  setAuditSearchQuery: (s: string) => void;
  auditSeverityFilter: "ALL" | "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  setAuditSeverityFilter: (s: "ALL" | "INFO" | "SUCCESS" | "WARNING" | "CRITICAL") => void;
  setSuccessMessage: (m: string) => void;
  patients: Patient[];
}

export const SecurityAuditTrailPanel: React.FC<SecurityAuditTrailPanelProps> = ({
  privacySecurityLogs,
  setPrivacySecurityLogs,
  auditSearchQuery,
  setAuditSearchQuery,
  auditSeverityFilter,
  setAuditSeverityFilter,
  setSuccessMessage,
  patients
}) => {
  // Filter security logs based on filters
  const filteredLogs = privacySecurityLogs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.patientName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(auditSearchQuery.toLowerCase());
    
    const matchesSeverity = auditSeverityFilter === "ALL" || log.severity === auditSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  // Action simulators to trigger visual updates
  const simulateAuditAction = (type: "approved_view" | "blocked_view" | "unauthorized") => {
    const randomPat = patients[Math.floor(Math.random() * patients.length)] || { id: "P-100", name: "Rishabh Malhotra" };
    const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
    let newLog: any = null;

    if (type === "approved_view") {
      newLog = {
        id: auditId,
        timestamp: new Date().toISOString(),
        actor: "Dr. Arvind Swaminathan (HPR-10255)",
        action: "Access EMR medical snapshot",
        patientId: randomPat.id,
        patientName: randomPat.name,
        status: "APPROVED_WITH_CONSENT",
        consentId: `CON-${Math.floor(1001 + Math.random() * 8999)}`,
        severity: "SUCCESS",
        details: `Successfully accessed and decrypted JSON longitudinal EMR logs. Active signature checked OK.`
      };
    } else if (type === "blocked_view") {
      newLog = {
        id: auditId,
        timestamp: new Date().toISOString(),
        actor: "SysPortal Gateway Auditor",
        action: "Query EMR diagnostic files",
        patientId: randomPat.id,
        patientName: randomPat.name,
        status: "BLOCKED_CONSENT_EXPIRED",
        consentId: "CON-EXPIRED-220",
        severity: "WARNING",
        details: `Access request rejected because clinical authorization limits expired on ${new Date().toISOString().split("T")[0]}.`
      };
    } else {
      newLog = {
        id: auditId,
        timestamp: new Date().toISOString(),
        actor: "Unknown Remote IP (103.45.201.12)",
        action: "Attempt Unauthenticated EMR Retrieval",
        patientId: randomPat.id,
        patientName: randomPat.name,
        status: "REJECTED_BAD_CREDENTIALS",
        consentId: "N/A",
        severity: "CRITICAL",
        details: `CRITICAL INTEGRITY VULNERABILITY DETECTED. Unsigned request blocked at system boundaries. Source credentials invalid.`
      };
    }

    setPrivacySecurityLogs(prev => [newLog, ...prev]);
    setSuccessMessage(`Simulated Action recorded in cryptographic security chain: ${newLog.id}`);
  };

  const downloadAuditTrailJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(privacySecurityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `abdm_privacy_security_audit_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMessage("Security logs downloaded successfully! Complies with NHA audit schema 2.1.0.");
  };

  return (
    <div className="space-y-4">
      {/* Simulation Dashboard & Search Bar */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="space-y-1.5 max-w-xl">
          <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-rose-600 animate-pulse" /> Cryptographically Chained Audit Ledger
          </h4>
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Every clinical access block, consent request, decryption process, and administrative master key rotation receives a sequential SHA-256 certificate for end-to-end immutability.
          </p>
        </div>

        {/* Live Simulation Controllers */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <button
            onClick={() => simulateAuditAction("approved_view")}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-2 rounded-lg cursor-pointer"
          >
            📂 Sim Record Access
          </button>
          <button
            onClick={() => simulateAuditAction("blocked_view")}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2.5 py-2 rounded-lg cursor-pointer"
          >
            🚫 Sim Blocked Access
          </button>
          <button
            onClick={() => simulateAuditAction("unauthorized")}
            className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold px-2.5 py-2 rounded-lg cursor-pointer"
          >
            🚨 Sim Ext Attack
          </button>
        </div>
      </div>

      {/* Structured Ledger Filters & Listing Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Searching logs */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor, action, details..."
              value={auditSearchQuery}
              onChange={(e) => setAuditSearchQuery(e.target.value)}
              className="w-full bg-white text-xs border rounded-lg pl-9 pr-4 py-2 text-slate-900 focus:outline-hidden border-slate-350"
            />
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
            <span className="text-[11px] font-bold text-slate-500">SEVERITY:</span>
            <select
              value={auditSeverityFilter}
              onChange={(e: any) => setAuditSeverityFilter(e.target.value)}
              className="text-xs border rounded-lg p-1.5 bg-white text-slate-900 font-semibold focus:outline-hidden"
            >
              <option value="ALL">ALL LEVELS</option>
              <option value="SUCCESS">SUCCESS ONLY</option>
              <option value="INFO">INFO ONLY</option>
              <option value="WARNING">WARNINGS ONLY</option>
              <option value="CRITICAL">CRITICAL ONLY</option>
            </select>

            <button
              onClick={downloadAuditTrailJson}
              className="bg-slate-905 hover:bg-slate-805 bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition"
            >
              <Download className="h-3.5 w-3.5" /> Export SHA Logs
            </button>
          </div>
        </div>

        {/* Audit Log Table rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-100 uppercase text-[9.5px] font-extrabold text-slate-500 border-b">
              <tr>
                <th className="p-3">Reference Block</th>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Requestor / Actor</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">Consent Ticket</th>
                <th className="p-3">Status Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y text-left">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                    No high-security audited events conform with your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = "bg-slate-100 text-slate-700";
                  if (log.severity === "SUCCESS") badgeColor = "bg-green-100 text-green-800 border-green-200 border";
                  if (log.severity === "INFO") badgeColor = "bg-blue-100 text-blue-800 border-blue-200 border";
                  if (log.severity === "WARNING") badgeColor = "bg-amber-100 text-amber-800 border-amber-200 border";
                  if (log.severity === "CRITICAL") badgeColor = "bg-rose-100 text-rose-800 border-rose-200 border";

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/50 transition font-medium">
                        <td className="p-3 font-mono text-[10px] text-indigo-700 font-extrabold">{log.id}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{log.timestamp}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 leading-tight">{log.actor}</div>
                          <div className="text-[10px] text-slate-400">Patient: {log.patientName}</div>
                        </td>
                        <td className="p-3 text-slate-700 text-xs">{log.action}</td>
                        <td className="p-3 font-mono text-[9px] bg-slate-50 px-1 py-0.5 rounded text-slate-500 font-bold">{log.consentId}</td>
                        <td className="p-3">
                          <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="bg-slate-50/30 px-3 py-2 border-b text-[10px] text-slate-500 leading-relaxed italic border-t-0 font-sans">
                          📝 <strong className="text-slate-700 not-italic">Block Trace details:</strong> {log.details} 
                          <span className="font-mono text-[9px] text-slate-300 block select-all mt-0.5">Integrity Hash: SHA256({log.id}-{log.status}-SaltKey_2026_UPHOSP)</span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- SECTION 4: SECURE ENCRYPTED CLINICAL DATA STORAGE ---
interface SecureClinicalStoragePanelProps {
  secureStorageStatus: any;
  setSecureStorageStatus: any;
  setSuccessMessage: (m: string) => void;
  setPrivacySecurityLogs: (logs: any[] | ((prev: any[]) => any[])) => void;
}

export const SecureClinicalStoragePanel: React.FC<SecureClinicalStoragePanelProps> = ({
  secureStorageStatus,
  setSecureStorageStatus,
  setSuccessMessage,
  setPrivacySecurityLogs
}) => {
  const [zkpAbhaID, setZkpAbhaID] = React.useState("tiwary@sbx");
  const [zkpLog, setZkpLog] = React.useState<string[]>([]);
  const [zkpProgress, setZkpProgress] = React.useState(0);
  const [isZkpActive, setIsZkpActive] = React.useState(false);

  const rotateDbKeystoreMasterKey = () => {
    setSuccessMessage("Generating master cryptographic wrapped key inside Cloud HSM Module...");
    const auditId = `LOG-SE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAudit = {
      id: auditId,
      timestamp: new Date().toISOString(),
      actor: "Hardware Security module v2",
      action: "Key Rotation - AES-256",
      patientId: "N/A",
      patientName: "N/A",
      status: "KEY_ROTATED_PASSED",
      consentId: "N/A",
      severity: "CRITICAL",
      details: "Re-encrypted internal clinical caches. rotated DB master key block parameters. Fips-140-2 compliant status OK."
    };
    setPrivacySecurityLogs(prev => [newAudit, ...prev]);
    setSecureStorageStatus(prev => ({
      ...prev,
      lastBackup: new Date().toLocaleString()
    }));
    setTimeout(() => {
      setSuccessMessage("Cryptographic master database key rotated and backup updated successfully!");
    }, 1000);
  };

  const handleRunZkpVerification = () => {
    if (!zkpAbhaID) return;
    setIsZkpActive(true);
    setZkpProgress(0);
    setZkpLog(["[SYSTEM] Initiating Non-Interactive Zero-Knowledge Proof (NIZKP) sandbox...", "[SYSTEM] Fetching patient's public parameters from ABHA root registry..."]);
    
    const interval = setInterval(() => {
      setZkpProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsZkpActive(false);
          setZkpLog(prev => [
            ...prev,
            "[BLOCKCHAIN] Generating blinding factors r and s...",
            "[PROOF_GEN] Computed verification parameter V = H(r || g^x) mod P.",
            "[SERVER] Transmitting proof witness vector to NHA Validator node...",
            "[NHA_VALIDATOR] Cryptographic verification: MATCHED. Secret not revealed on server!",
            "✅ SUCCESS: ZKP Witness confirmed secure. Clinical data decrypted in local context vault successfully."
          ]);
          return 100;
        }
        return p + 20;
      });
    }, 450);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Left Column: Local Encrypted clinical Storage Status */}
      <div className="lg:col-span-6 border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-center gap-1.5 border-b pb-2.5">
          <HardDrive className="h-5 w-5 text-indigo-700" />
          <h3 className="font-extrabold text-slate-800 text-sm">AES-255-GCM Local Database Parameters</h3>
        </div>

        <p className="text-slate-550 text-xs leading-relaxed">
          ABDM guidelines prevent hospitals from caching central health records forever without local hardware protection. Below is our isolated state configuration tracking local caches.
        </p>

        {/* Dashboard Grid stats */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-slate-50 border rounded-xl rounded-b-none space-y-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Encryption Standard</span>
            <div className="text-xs font-black text-slate-800">{secureStorageStatus.encryptionType}</div>
          </div>
          <div className="p-3.5 bg-slate-50 border rounded-xl rounded-b-none space-y-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Active Key Bits</span>
            <div className="text-xs font-black text-indigo-700">{secureStorageStatus.keyBits} Bit (Hardware Hardened)</div>
          </div>
          <div className="p-3.5 bg-slate-50 border rounded-xl rounded-t-none space-y-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Protected Cache Records</span>
            <div className="text-xs font-black text-slate-800">{secureStorageStatus.cachedRecordsCount} Patient EMRs</div>
          </div>
          <div className="p-3.5 bg-slate-50 border rounded-xl rounded-t-none space-y-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Zero-Knowledge status</span>
            <div className="text-xs font-black text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Checked</div>
          </div>
        </div>

        <div className="space-y-3.5 border p-4 bg-slate-50/20 rounded-xl">
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">Interactive Cryptographic HSM Sandbox</span>
          </div>
          <p className="text-[11px] text-slate-550 leading-relaxed">
            Rotate local encryption keys to fulfill FIPS-140-2 compliance. Rotation cycles re-encrypt clinical database segments securely using a derived SHA-3 master keystore.
          </p>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
            <span>Last HSM Master Key Rotation:</span>
            <span className="font-mono text-slate-800 font-bold">{secureStorageStatus.lastBackup}</span>
          </div>

          <button
            onClick={rotateDbKeystoreMasterKey}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer leading-tight transition"
          >
            <RefreshCw className="h-4 w-4" /> Rotate Cloud HSM Database Master Key Now
          </button>
        </div>
      </div>

      {/* Right Column: Zero Knowledge Proof Verification Hub */}
      <div className="lg:col-span-6 border border-slate-200 rounded-xl p-5 bg-slate-50/15 space-y-4">
        <div className="flex items-center gap-1.5 border-b pb-2.5">
          <Lock className="h-5 w-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-800 text-sm">ZKP Zero-Knowledge Clinical Proof Verifier</h3>
        </div>

        <p className="text-slate-550 text-xs leading-relaxed">
          Zero-Knowledge Proofs (ZKP) allow our EMR software to verify a patient's identity and healthcare eligibility status without actually exposing their underlying private key or identifiers to the hospital server.
        </p>

        <div className="space-y-3 font-sans">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Patient ABHA Address</label>
            <input
              type="text"
              value={zkpAbhaID}
              onChange={(e) => setZkpAbhaID(e.target.value)}
              className="w-full text-xs font-mono font-bold border rounded-lg p-2 bg-white text-slate-900"
              placeholder="e.g. pat@sbx"
            />
          </div>

          <button
            onClick={handleRunZkpVerification}
            disabled={isZkpActive || !zkpAbhaID}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
          >
            {isZkpActive ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
            Generate Fresh Cryptographic Witness & Proof
          </button>

          {/* Terminal for Proof Logs */}
          <div className="p-3.5 bg-slate-950 font-mono text-[10px] text-green-400 rounded-xl h-44 overflow-y-auto space-y-1 shadow-inner text-left">
            {isZkpActive && (
              <div className="w-full bg-slate-800 h-1.5 rounded-sm overflow-hidden mb-2">
                <div className="bg-green-400 h-full transition-all" style={{ width: `${zkpProgress}%` }} />
              </div>
            )}
            
            {zkpLog.length === 0 ? (
              <div className="text-slate-505 italic text-center pt-10">
                Awaiting request. Click button above to execute cryptographic non-interactive zero-knowledge proofs (NIZKP).
              </div>
            ) : (
              zkpLog.map((log, idx) => (
                <div key={idx} className={`${log.startsWith("✅") ? "text-emerald-350 font-bold" : log.startsWith("[BLOCKCHAIN]") ? "text-indigo-400" : "text-green-400"}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
