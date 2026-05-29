import React, { useState } from "react";
import { 
  Database, Search, Play, Plus, RefreshCw, FileText, CheckCircle, 
  AlertCircle, ShieldCheck, Download, Trash2, ArrowUpRight, Code
} from "lucide-react";
import { 
  Patient, AbhaMaster, HprRegistry, Department, Appointment, 
  Admission, BillingRecord, PmjayClaim, PmjayPackage, ConsentLog, 
  AuditLogEntry 
} from "../types";

interface ExplorerProps {
  patients: Patient[];
  abhaMaster: AbhaMaster[];
  doctors: HprRegistry[];
  departments: Department[];
  appointments: Appointment[];
  admissions: Admission[];
  billing: BillingRecord[];
  claims: PmjayClaim[];
  pmjayPackages: PmjayPackage[];
  consentLogs: ConsentLog[];
  auditLogs: AuditLogEntry[];
  onAddRow: (tableName: string, data: any) => void;
  onDeleteRow?: (tableName: string, id: string) => void;
  onVerifyIntegrity: () => void;
}

const TABLES_LIST = [
  { id: "patients", label: "Patients", countKey: "patients", icon: "👤", desc: "National UHID Patient Demographic Profiles" },
  { id: "abha_master", label: "ABHA_Master", countKey: "abhaMaster", icon: "🪪", desc: "ABDM Central Identity Registry mappings" },
  { id: "doctors", label: "Doctors", countKey: "doctors", icon: "🥼", desc: "HPR Verified Healthcare Professionals list" },
  { id: "departments", label: "Departments", countKey: "departments", icon: "🏢", desc: "Specialized Clinical Ward & Bed Units setup" },
  { id: "appointments", label: "Appointments", countKey: "appointments", icon: "📅", desc: "Scheduled Patient Clinical consult records" },
  { id: "admissions", label: "Admissions", countKey: "admissions", icon: "🛏️", desc: "Active Inpatient Bed and Ward assignments" },
  { id: "billing", label: "Billing", countKey: "billing", icon: "🧾", desc: "Hospital Central Ledger Bills & Invoices" },
  { id: "claims", label: "Claims", countKey: "claims", icon: "🛡️", desc: "PM-JAY Cashless Claims & Audit logs" },
  { id: "pmjay_packages", label: "PMJAY_Packages", countKey: "pmjayPackages", icon: "📦", desc: "Pradhan Mantri Ayushman procedure rate master" },
  { id: "consent_log", label: "Consent_Log", countKey: "consentLogs", icon: "📝", desc: "DPDP Explicit Electronic consents tracker" },
  { id: "audit_log", label: "Audit_Log", countKey: "auditLogs", icon: "🔐", desc: "Immutable NCSC Cyber security access trail" }
];

export default function SuperAdminDatabaseExplorer({
  patients,
  abhaMaster,
  doctors,
  departments,
  appointments,
  admissions,
  billing,
  claims,
  pmjayPackages,
  consentLogs,
  auditLogs,
  onAddRow,
  onDeleteRow,
  onVerifyIntegrity
}: ExplorerProps) {
  const [selectedTable, setSelectedTable] = useState<string>("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [activeQueryFilter, setActiveQueryFilter] = useState<string>("all");
  const [isInserting, setIsInserting] = useState(false);
  const [integrityVerified, setIntegrityVerified] = useState<"idle" | "verifying" | "success">("idle");
  const [integrityLogs, setIntegrityLogs] = useState<string[]>([]);

  // Insert form fields state
  const [formData, setFormData] = useState<any>({});

  const counts: Record<string, number> = {
    patients: patients.length,
    abhaMaster: abhaMaster.length,
    doctors: doctors.length,
    departments: departments.length,
    appointments: appointments.length,
    admissions: admissions.length,
    billing: billing.length,
    claims: claims.length,
    pmjayPackages: pmjayPackages.length,
    consentLogs: consentLogs.length,
    auditLogs: auditLogs.length
  };

  const getTableData = () => {
    switch (selectedTable) {
      case "patients": return patients;
      case "abha_master": return abhaMaster;
      case "doctors": return doctors;
      case "departments": return departments;
      case "appointments": return appointments;
      case "admissions": return admissions;
      case "billing": return billing;
      case "claims": return claims;
      case "pmjay_packages": return pmjayPackages;
      case "consent_log": return consentLogs;
      case "audit_log": return auditLogs;
      default: return [];
    }
  };

  const currentData = getTableData();

  // Apply query filter logic
  const getFilteredData = () => {
    let result = [...currentData];

    // Text search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((row: any) => {
        return Object.values(row).some(
          val => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        );
      });
    }

    // Advanced dynamic query shortcuts
    if (activeQueryFilter === "unpaid_bills" && selectedTable === "billing") {
      result = result.filter((b: any) => b.paymentStatus !== "Paid");
    } else if (activeQueryFilter === "high_risk_claims" && selectedTable === "claims") {
      result = result.filter((c: any) => c.fraudAnalysis?.score > 50 || c.fraudAnalysis?.recommendation === "Reject / Investigate");
    } else if (activeQueryFilter === "unapproved_claims" && selectedTable === "claims") {
      result = result.filter((c: any) => c.preAuthStatus !== "Approved");
    } else if (activeQueryFilter === "critical_icu" && selectedTable === "admissions") {
      result = result.filter((a: any) => a.bedType === "ICU" || a.bedNumber.includes("ICU"));
    } else if (activeQueryFilter === "revoked_consents" && selectedTable === "consent_log") {
      result = result.filter((c: any) => c.status === "Revoked" || c.status === "Expired");
    } else if (activeQueryFilter === "active_consents" && selectedTable === "consent_log") {
      result = result.filter((c: any) => c.status === "Active");
    } else if (activeQueryFilter === "security_alerts" && selectedTable === "audit_log") {
      result = result.filter((a: any) => a.status === "DENIED" || a.status === "FLAGGED");
    } else if (activeQueryFilter === "opd_consults" && selectedTable === "appointments") {
      result = result.filter((a: any) => a.consultType === "OPD");
    }

    return result;
  };

  const filteredData = getFilteredData();

  // Verification pipeline simulation
  const handleVerifyIntegrityLocal = () => {
    setIntegrityVerified("verifying");
    const newLog = `[Database Auditor] Commencing HMAC SHA-256 verification sequence across 11 master tables at ${new Date().toLocaleTimeString()}...`;
    setIntegrityLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setIntegrityVerified("success");
      onVerifyIntegrity();
      const sLog = `[Database Auditor] All tables validated successfully. Block hashes match central NHA registry signatures. Integrity verified (100%).`;
      setIntegrityLogs(prev => [sLog, ...prev]);
    }, 1800);
  };

  const getColumns = () => {
    if (currentData.length === 0) return [];
    // Extract columns from first record
    return Object.keys(currentData[0]).filter(key => typeof currentData[0][key] !== "object");
  };

  const columns = getColumns();

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
  };

  const getInsertPlaceholderFields = () => {
    switch (selectedTable) {
      case "patients":
        return [
          { name: "name", label: "Patient Full Name", type: "text", required: true, desc: "e.g. Anand Murthy" },
          { name: "guardianName", label: "Father / Spouse Name", type: "text", required: true },
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], defaultValue: "Male" },
          { name: "dob", label: "Date of Birth", type: "date", required: true, desc: "YYYY-MM-DD" },
          { name: "phone", label: "Mobile Number", type: "text", required: true },
          { name: "aadhaar", label: "Aadhaar Card Reference", type: "text", required: true, desc: "12 digits" },
          { name: "abhaId", label: "ABHA ID Alias", type: "text", desc: "e.g. anand@sbx" },
          { name: "address", label: "Permanent Address", type: "text", required: true },
          { name: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], defaultValue: "O+" },
          { name: "insuranceType", label: "Insurance Type", type: "select", options: ["Cashless PM-JAY", "TPA Private", "Self-Pay"], defaultValue: "Cashless PM-JAY" }
        ];
      case "abha_master":
        return [
          { name: "abhaId", label: "ABHA ID Alias", type: "text", required: true, desc: "e.g. sunita@sbx" },
          { name: "abhaNumber", label: "ABHA 14-Digit Number", type: "text", required: true, desc: "XX-XXXX-XXXX-XXXX" },
          { name: "name", label: "Holder Name", type: "text", required: true },
          { name: "aadhaar", label: "Linked Aadhaar Card", type: "text", required: true },
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], defaultValue: "Male" },
          { name: "dob", label: "Date of Birth", type: "date", required: true },
          { name: "phone", label: "Registered Mobile", type: "text", required: true },
          { name: "status", label: "System Status", type: "select", options: ["Active", "Suspended", "Deactivated"], defaultValue: "Active" }
        ];
      case "doctors":
        return [
          { name: "name", label: "Doctor Full Name", type: "text", required: true, desc: "e.g. Dr. Shruti Aggarwal" },
          { name: "role", label: "HPR Role Designation", type: "select", options: ["Doctor", "Nurse"], defaultValue: "Doctor" },
          { name: "abdmNumber", label: "HPR ID alias", type: "text", required: true, desc: "e.g. shruti@hpr" },
          { name: "specialty", label: "Medical Specialty", type: "text", required: true, desc: "e.g. General Medicine (MD)" },
          { name: "registrationNo", label: "State Medical Council Code", type: "text", required: true, desc: "e.g. MCI/77812/UP" },
          { name: "credentialVerified", label: "NHA Verified Profile", type: "boolean", defaultValue: true },
          { name: "signatureLinked", label: "Cryptographic e-Sign Enabled", type: "boolean", defaultValue: true }
        ];
      case "departments":
        return [
          { name: "code", label: "Department Short Code", type: "text", required: true, desc: "e.g. NEUR" },
          { name: "name", label: "Department Title", type: "text", required: true, desc: "e.g. Neurology Block" },
          { name: "hod", label: "Head of Department (MD/DM)", type: "text", required: true },
          { name: "totalBeds", label: "Total Bed Allocations", type: "number", defaultValue: 20 },
          { name: "occupiedBeds", label: "Occupied Beds", type: "number", defaultValue: 0 },
          { name: "opdCharge", label: "OPD Consultation Charge (₹)", type: "number", defaultValue: 300 },
          { name: "status", label: "Operational Status", type: "select", options: ["Operational", "Under Maintenance"], defaultValue: "Operational" }
        ];
      case "appointments":
        return [
          { name: "patientId", label: "Patient UHID", type: "text", required: true, desc: "e.g. UHID-108291" },
          { name: "patientName", label: "Patient Name", type: "text", required: true },
          { name: "doctorName", label: "Doctor on Duty", type: "text", required: true },
          { name: "department", label: "Clinical Department", type: "text", required: true },
          { name: "roomNo", label: "OPD Room Number", type: "text", required: true, desc: "e.g. Room 402" },
          { name: "consultType", label: "Consultation Type", type: "select", options: ["OPD", "Tele-Consultation", "Follow-up"], defaultValue: "OPD" },
          { name: "status", label: "Appointment Status", type: "select", options: ["Scheduled", "Checked In", "Completed", "Cancelled"], defaultValue: "Scheduled" }
        ];
      case "admissions":
        return [
          { name: "patientId", label: "Patient UHID Reference", type: "text", required: true },
          { name: "patientName", label: "Admitted Patient Name", type: "text", required: true },
          { name: "bedId", label: "Hospital Bed ID", type: "text", required: true, desc: "e.g. B-102" },
          { name: "bedNumber", label: "Bed Number Alias", type: "text", required: true, desc: "e.g. GW-02" },
          { name: "bedType", label: "Bed Class", type: "select", options: ["General Ward", "Semi Private", "Private", "ICU", "Isolation Ward"], defaultValue: "General Ward" },
          { name: "admittingDoctor", label: "Admitting Consultant Doctor", type: "text", required: true },
          { name: "dailyRate", label: "Room Cost (₹/Day)", type: "number", defaultValue: 450 },
          { name: "status", label: "Inpatient Admission Status", type: "select", options: ["Admitted", "Discharged"], defaultValue: "Admitted" }
        ];
      case "billing":
        return [
          { name: "patientId", label: "Patient UHID", type: "text", required: true },
          { name: "patientName", label: "Patient Bill Head", type: "text", required: true },
          { name: "totalAmount", label: "Total Invoice Charge (₹)", type: "number", required: true },
          { name: "insuranceStatus", label: "Insurance Category", type: "select", options: ["Cashless PM-JAY", "TPA Private", "Self-Pay"], defaultValue: "Self-Pay" },
          { name: "paymentStatus", label: "Payment Ledger Status", type: "select", options: ["Paid", "Unpaid", "Pending"], defaultValue: "Unpaid" }
        ];
      case "claims":
        return [
          { name: "patientId", label: "Patient UHID Reference", type: "text", required: true },
          { name: "patientName", label: "Ayushman Beneficiary Name", type: "text", required: true },
          { name: "pmjayId", label: "PMJAY Ayushman Card ID", type: "text", required: true, desc: "e.g. P-12883-99" },
          { name: "diagnosisCode", label: "ICD-10 Diagnostic Code", type: "text", required: true, desc: "e.g. K80.20" },
          { name: "procedureCode", label: "PMJAY Procedure Package Code", type: "text", required: true, desc: "e.g. SG013" },
          { name: "procedureName", label: "PMJAY Treatment Procedure Title", type: "text", required: true },
          { name: "packageCost", label: "Sanctioned Cost Sum (₹)", type: "number", required: true }
        ];
      case "pmjay_packages":
        return [
          { name: "code", label: "Package/Procedure Code", type: "text", required: true, desc: "e.g. SG013" },
          { name: "specialty", label: "Specialty Classification", type: "text", required: true, desc: "e.g. Surgical Gastroenterology" },
          { name: "procedureName", label: "Official Treatment Package Name", type: "text", required: true },
          { name: "packageCost", label: "Standard Cashless Cap Cost (₹)", type: "number", required: true },
          { name: "defaultSlaHours", label: "Standard NHA SLA Target (Hrs)", type: "number", defaultValue: 24 },
          { name: "status", label: "Package Registry Status", type: "select", options: ["Active", "Suspended"], defaultValue: "Active" }
        ];
      case "consent_log":
        return [
          { name: "patientId", label: "Consenting Patient UHID", type: "text", required: true },
          { name: "patientName", label: "Patient Name", type: "text", required: true },
          { name: "doctorName", label: "Authorised Doctor / HPR", type: "text", required: true },
          { name: "purpose", label: "Medical Purpose of View", type: "text", required: true, desc: "e.g. Cardiovascular follow-up EMR audit" },
          { name: "scope", label: "Scope (JSON array format list)", type: "text", defaultValue: '["Prescriptions", "Diagnostic Reports"]' },
          { name: "validUntil", label: "Valid Expiry Date", type: "date", required: true },
          { name: "status", label: "Declaration Status", type: "select", options: ["Active", "Revoked"], defaultValue: "Active" }
        ];
      case "audit_log":
        return [
          { name: "eventType", label: "Cyber Event Category", type: "select", options: ["LOGIN", "EMR_ACCESS", "CLAIM_SUBMISSION", "CONSENT_REVOKE", "DECRYPT_UHID", "BIOMETRIC_VERIFY", "API_HIT", "DATA_SYNC"], defaultValue: "API_HIT" },
          { name: "actor", label: "Action Actor & Designation", type: "text", required: true, desc: "e.g. Sister Rosamma (Nurse)" },
          { name: "endpoint", label: "Server Context Route hit", type: "text", required: true, desc: "e.g. /api/patients/UHID-108291" },
          { name: "resourceId", label: "Affected Row Primary ID", type: "text", required: true, desc: "e.g. UHID-108291" },
          { name: "status", label: "Security Status", type: "select", options: ["SUCCESS", "DENIED", "FLAGGED"], defaultValue: "SUCCESS" }
        ];
      default:
        return [];
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalVal: any = value;
    if (type === "number") {
      finalVal = parseFloat(value) || 0;
    } else if (type === "checkbox") {
      finalVal = (e.target as HTMLInputElement).checked;
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalVal }));
  };

  const handleSubmitNewRow = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRow(selectedTable, formData);
    setIsInserting(false);
    setFormData({});
    // Trigger success flash
    setIntegrityLogs(prev => [
      `[Database Client] Inserted 1 new row into table '${selectedTable.toUpperCase()}' matching schema standards.`,
      ...prev
    ]);
  };

  const handleExportCSV = () => {
    if (currentData.length === 0) return;
    const headerRow = columns.join(",");
    const csvRows = currentData.map((row: any) => 
      columns.map(col => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const fullCsv = [headerRow, ...csvRows].join("\n");
    const blob = new Blob([fullCsv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `master_table_${selectedTable}.csv`);
    a.click();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveQueryFilter("all");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" id="enterprise-database-explorer">
      {/* Tab Header Banner styled elegantly in minimalist gray */}
      <div className="bg-slate-900 px-6 py-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Database className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-200 font-mono">
              Enterprise Storage Registry
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            NHA Central Federated Database Explorer
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 leading-normal">
            Secure schema auditing of 11 core compliant database tables under DPDP, Aadhaar Act, and Ayushman Mission policies.
          </p>
        </div>

        {/* Audit controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleVerifyIntegrityLocal}
            disabled={integrityVerified === "verifying"}
            className="bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${integrityVerified === "verifying" ? "animate-spin text-amber-300" : "text-emerald-400"}`} />
            {integrityVerified === "verifying" ? "Auditing Hashes..." : "Verify Table Hashes"}
          </button>
          
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export Schema CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Side: 11 Database Tables selector sidebar menu */}
        <div className="w-full lg:w-80 border-r border-slate-200 bg-slate-50 p-4.5 flex flex-col gap-1.5 justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2.5 mb-2.5">
              Federated Core Schemas ({TABLES_LIST.length})
            </span>
            <div className="space-y-1">
              {TABLES_LIST.map((t) => {
                const isActive = selectedTable === t.id;
                const count = counts[t.countKey] || 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTable(t.id);
                      setSelectedRow(null);
                      setIsInserting(false);
                      setActiveQueryFilter("all");
                    }}
                    className={`w-full text-left rounded-xl p-2.5 text-xs transition duration-150 flex items-center justify-between border cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t.icon}</span>
                      <div>
                        <p className={`font-semibold tracking-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                          {t.label}
                        </p>
                        <p className={`text-[10.5px] line-clamp-1 leading-tight mt-0.5 ${isActive ? "text-indigo-100" : "text-slate-455"}`}>
                          {t.desc}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                      isActive 
                        ? "bg-indigo-700 text-white border-indigo-500" 
                        : "bg-slate-100 text-slate-650 border-slate-200"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Summary Footer */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 mt-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
              HMS Sandbox Node Metrics
            </span>
            <div className="grid grid-cols-2 gap-3 mt-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                <p className="text-[10px] text-slate-500">Master Rows</p>
                <strong className="text-slate-800 text-sm">
                  {Object.values(counts).reduce((a, b) => a + b, 0)}
                </strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                <p className="text-[10px] text-slate-500">Security Mode</p>
                <strong className="text-emerald-600 text-[11px] flex items-center justify-center gap-0.5">
                  🛡️ Active
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Data Table & Dynamic Actions */}
        <div className="flex-1 p-5 flex flex-col gap-4 bg-white">
          {/* Filtering, Inserting rows, search inputs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
            {/* Search inputs */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder={`Search rows in central ${selectedTable.toUpperCase()} table...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
              />
            </div>

            {/* Structured query helpers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Context-specific visual queries */}
              {selectedTable === "billing" && (
                <button
                  onClick={() => setActiveQueryFilter(activeQueryFilter === "unpaid_bills" ? "all" : "unpaid_bills")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                    activeQueryFilter === "unpaid_bills" 
                      ? "bg-rose-50 border-rose-200 text-rose-700" 
                      : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Play className="h-3 w-3 fill-rose-600 border-none text-rose-600" />
                  Show Unpaid Invoices
                </button>
              )}

              {selectedTable === "claims" && (
                <>
                  <button
                    onClick={() => setActiveQueryFilter(activeQueryFilter === "high_risk_claims" ? "all" : "high_risk_claims")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                      activeQueryFilter === "high_risk_claims" 
                        ? "bg-rose-50 border-rose-200 text-rose-700" 
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <AlertCircle className="h-3 w-3 text-rose-600" />
                    High Fraud Alert (&gt;50%)
                  </button>
                  <button
                    onClick={() => setActiveQueryFilter(activeQueryFilter === "unapproved_claims" ? "all" : "unapproved_claims")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                      activeQueryFilter === "unapproved_claims" 
                        ? "bg-amber-50 border-amber-250 text-amber-700" 
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Play className="h-3 w-3 text-amber-600" />
                    Pending / Queries
                  </button>
                </>
              )}

              {selectedTable === "admissions" && (
                <button
                  onClick={() => setActiveQueryFilter(activeQueryFilter === "critical_icu" ? "all" : "critical_icu")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                    activeQueryFilter === "critical_icu" 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Play className="h-3 w-3 text-indigo-600" />
                  Filter critical ICU
                </button>
              )}

              {selectedTable === "consent_log" && (
                <>
                  <button
                    onClick={() => setActiveQueryFilter(activeQueryFilter === "active_consents" ? "all" : "active_consents")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 relative ${
                      activeQueryFilter === "active_consents" 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping absolute top-1 right-1" />
                    Active Consent
                  </button>
                  <button
                    onClick={() => setActiveQueryFilter(activeQueryFilter === "revoked_consents" ? "all" : "revoked_consents")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                      activeQueryFilter === "revoked_consents" 
                        ? "bg-slate-100 border-slate-300 text-slate-700" 
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    Revoked / Expired
                  </button>
                </>
              )}

              {selectedTable === "audit_log" && (
                <button
                  onClick={() => setActiveQueryFilter(activeQueryFilter === "security_alerts" ? "all" : "security_alerts")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                    activeQueryFilter === "security_alerts" 
                      ? "bg-orange-50 border-orange-200 text-orange-700" 
                      : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                  Show Denied / Flagged
                </button>
              )}

              {selectedTable === "appointments" && (
                <button
                  onClick={() => setActiveQueryFilter(activeQueryFilter === "opd_consults" ? "all" : "opd_consults")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center gap-1.5 ${
                    activeQueryFilter === "opd_consults" 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  OPD consultations
                </button>
              )}

              {activeQueryFilter !== "all" && (
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1.5 text-[11px] font-bold text-indigo-650 hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}

              <button
                onClick={() => setIsInserting(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer transition flex items-center gap-1 shadow-md hover:shadow-lg"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Row
              </button>
            </div>
          </div>

          {/* Table display area */}
          {filteredData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-3xl">📭</span>
              <p className="text-sm font-semibold text-slate-700 mt-2">
                No records matching search parameters
              </p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                Try modifying your text query, resetting active filters, or inserting a brand new compliant row.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-3.5 text-xs text-indigo-650 font-bold hover:underline cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto border rounded-2xl style-scroll">
              <table className="min-w-full divide-y divide-slate-150 text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider sticky top-0">
                  <tr>
                    {columns.slice(0, 6).map((col) => (
                      <th key={col} className="px-4 py-3 border-b text-slate-600 font-bold">
                        {col.replace(/([A-Z])/g, " $1").replace("abha", "ABHA")}
                      </th>
                    ))}
                    <th className="px-4 py-3 border-b text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredData.map((row: any, index: number) => {
                    const isSelected = selectedRow && selectedRow.id === row.id;
                    const primaryId = row.id || row.code;
                    return (
                      <tr
                        key={primaryId || index}
                        onClick={() => handleRowClick(row)}
                        className={`hover:bg-slate-50/80 cursor-pointer font-sans transition-colors ${
                          isSelected ? "bg-indigo-50/40 hover:bg-indigo-50/50" : ""
                        }`}
                      >
                        {columns.slice(0, 6).map((col) => {
                          const val = row[col];
                          return (
                            <td key={col} className="px-4 py-3.5 whitespace-nowrap text-xs max-w-xs truncate">
                              {/* Customize values visually */}
                              {col === "id" || col === "code" || col === "abhaNumber" ? (
                                <span className="font-mono bg-slate-105 border border-slate-200/60 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
                                  {val}
                                </span>
                              ) : col === "status" || col === "preAuthStatus" || col === "paymentStatus" ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  val === "Active" || val === "Approved" || val === "Paid" || val === "Operational" || val === "SUCCESS"
                                    ? "bg-green-50 border-green-200 text-green-705"
                                    : val === "Suspended" || val === "Queried" || val === "Unpaid" || val === "DENIED"
                                    ? "bg-rose-50 border-rose-250 text-rose-700"
                                    : "bg-amber-50 border-amber-200 text-amber-705"
                                }`}>
                                  {val}
                                </span>
                              ) : typeof val === "boolean" ? (
                                <span className={`font-semibold ${val ? "text-emerald-600" : "text-slate-400"}`}>
                                  {val ? "● Verified" : "○ Pending"}
                                </span>
                              ) : col.toLowerCase().includes("cost") || col.toLowerCase().includes("charge") || col.toLowerCase().includes("rate") || col.toLowerCase().includes("amount") ? (
                                <strong className="font-semibold text-slate-900">
                                  ₹{Number(val).toLocaleString("en-IN")}
                                </strong>
                              ) : (
                                String(val ?? "—")
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-[10px] bg-slate-100 hover:bg-slate-150 border rounded px-1.5 py-0.5 text-slate-600 font-bold transition">
                              Open ↗
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Database activity/HMAC audits ledger logs */}
          <div className="bg-slate-900 rounded-2xl flex flex-col p-4 text-xs font-mono border border-slate-800 text-slate-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-indigo-400" />
                NHA Database Terminal Audits LOG
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ACTIVE PIPELINE LISTENER
              </span>
            </div>
            <div className="space-y-1.5 line-clamp-3 overflow-y-auto max-h-24 leading-relaxed pr-2">
              {integrityLogs.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic">
                  No active queries executed. Click "Verify Table Hashes" to audit cryptographic signatures...
                </p>
              ) : (
                integrityLogs.map((log, index) => (
                  <div key={index} className="border-l-2 border-indigo-500 pl-2 text-[10.5px]">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Row JSON and Attributes Detail View */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              Metadata Property Inspector
            </h3>
            {selectedRow && (
              <span className="text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-750 px-1.5 py-0.5 rounded border border-indigo-200">
                {selectedTable.toUpperCase()}
              </span>
            )}
          </div>

          {!selectedRow ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-200/80">
              <span className="text-2xl text-slate-300">🔍</span>
              <h4 className="text-xs font-bold text-slate-600 mt-1.5">No Object Selected</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal max-w-[200px]">
                Click on any database row in the central table view to inspect its raw JSON payload and audit integrity signatures.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 style-scroll">
              <div className="bg-white rounded-2xl border border-slate-200 p-4.5 space-y-3.5">
                {/* Visual properties representation */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                    Object Primary Identifier
                  </h4>
                  <p className="font-mono text-xs font-bold text-indigo-650 bg-slate-50 border border-slate-150 inline-block px-2 py-0.5 rounded mt-1">
                    {selectedRow.id || selectedRow.code || "N/A Schema Standard"}
                  </p>
                </div>

                <div className="border-t border-slate-150/60 pt-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                    Structured Schema fields
                  </span>
                  <div className="space-y-2.5 mt-2">
                    {Object.keys(selectedRow)
                      .filter(key => typeof selectedRow[key] !== "object")
                      .map((key) => {
                        const val = selectedRow[key];
                        return (
                          <div key={key} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-1.5 text-xs">
                            <span className="text-slate-405 font-medium text-[11px]">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <strong className="text-slate-800 text-right text-[11px] truncate max-w-[160px]">
                              {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val ?? "—")}
                            </strong>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Secure checksum display */}
                <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Cryptographic Integrity Valid</strong>
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-mono break-all leading-tight">
                      ROW-SIG: SHA256({(selectedRow.id || selectedRow.code || "row") + "_secure_hms"})
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-1">
                  JSON Raw Payload Block
                </span>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] text-slate-300 font-mono overflow-auto max-h-56 style-scroll">
                  {JSON.stringify(selectedRow, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insert Modal / Overlay Form */}
      {isInserting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-250 shadow-2xl max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-indigo-300">
                  INSERT ROW INTO TABLE
                </h3>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Schema: {selectedTable.toUpperCase()} Module
                </h4>
              </div>
              <button
                onClick={() => setIsInserting(false)}
                className="text-slate-300 hover:text-white font-semibold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto style-scroll">
              {/* Left Column: Input Form */}
              <form onSubmit={handleSubmitNewRow} className="lg:col-span-5 flex flex-col gap-4 lg:border-r lg:pr-6 border-slate-100">
                <span className="block text-xs font-bold text-slate-500 uppercase pb-1 border-b">
                  🆕 Row Field Values
                </span>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 style-scroll">
                  {getInsertPlaceholderFields().map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.desc && (
                        <span className="text-[10.5px] text-slate-400 leading-none">
                          {field.desc}
                        </span>
                      )}

                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          required={field.required}
                          onChange={handleFormChange}
                          value={formData[field.name] ?? field.defaultValue ?? ""}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-indigo-500 text-slate-800 focus:outline-hidden"
                        >
                          <option value="">Select Option</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] ?? ""}
                          onChange={handleFormChange}
                          placeholder={`Provide ${field.label.toLowerCase()}`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-indigo-500 text-slate-800 focus:outline-hidden"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-4 border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsInserting(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-650 hover:bg-slate-50 cursor-pointer transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4.5 py-2 text-xs font-bold cursor-pointer transition shadow hover:shadow-md"
                  >
                    Execute Insert
                  </button>
                </div>
              </form>

              {/* Right Column: Schema Table Live Preview */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    📋 Active Table Registry ({currentData.length})
                  </span>
                  <span className="text-[8px] font-mono font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded leading-none border border-indigo-200 uppercase">
                    live registry database
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[50vh] border border-slate-150 rounded-2xl style-scroll">
                  <table className="min-w-full divide-y divide-slate-150 text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider sticky top-0 bg-slate-50 z-10 select-none">
                      <tr>
                        {columns.slice(0, 4).map((col) => (
                          <th key={col} className="px-3 py-2.5 text-slate-600 font-bold border-b">
                            {col.replace(/([A-Z])/g, " $1").replace("abha", "ABHA")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                      {currentData.map((row: any, rIdx: number) => {
                        const primId = row.id || row.code;
                        return (
                          <tr key={primId || rIdx} className="hover:bg-slate-50/60 transition-colors font-sans">
                            {columns.slice(0, 4).map((col) => {
                              const val = row[col];
                              return (
                                <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[150px] truncate font-medium text-slate-700">
                                  {col === "id" || col === "code" || col === "abhaNumber" ? (
                                    <span className="font-mono bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-800">
                                      {val}
                                    </span>
                                  ) : col === "status" || col === "preAuthStatus" || col === "paymentStatus" ? (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border inline-block ${
                                      val === "Active" || val === "Approved" || val === "Paid" || val === "Operational" || val === "SUCCESS"
                                        ? "bg-green-50 border-green-200 text-green-700 font-bold"
                                        : val === "Suspended" || val === "Queried" || val === "Unpaid" || val === "DENIED"
                                        ? "bg-rose-50 border-rose-250 text-rose-700 font-bold"
                                        : "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                                    }`}>
                                      {val}
                                    </span>
                                  ) : typeof val === "boolean" ? (
                                    <span className={`font-semibold ${val ? "text-emerald-600" : "text-slate-400"}`}>
                                      {val ? "● Verified" : "○ Pending"}
                                    </span>
                                  ) : col.toLowerCase().includes("cost") || col.toLowerCase().includes("charge") || col.toLowerCase().includes("rate") || col.toLowerCase().includes("amount") ? (
                                    <strong className="font-semibold text-slate-900 font-mono text-[11px]">
                                      ₹{Number(val).toLocaleString("en-IN")}
                                    </strong>
                                  ) : (
                                    String(val ?? "—")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {currentData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 italic text-xs">
                            No records in this database table view.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-slate-400 italic mt-auto flex items-center gap-1 text-slate-500 font-mono select-none">
                  🛡️ Cryptographic HMAC SHA-256 signing sequence is executed instantly upon submitting new records.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
