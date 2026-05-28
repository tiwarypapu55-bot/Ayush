export interface Patient {
  id: string; // National UHID
  name: string;
  guardianName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  aadhaar: string;
  abhaId?: string; // e.g. tiwary@sbx
  abhaNumber?: string; // 14-digit ABHA Number
  pmjayId?: string; // Ayushman Card ID
  address: string;
  state: string;
  district: string;
  bloodGroup: string;
  socioeconomicCategory: string;
  insuranceType: 'Cashless PM-JAY' | 'TPA Private' | 'Self-Pay';
  registeredAt: string;
  scanShareToken?: string; // ABDM OPD Token
}

export interface ClinicalVitals {
  bp: string; // e.g. 120/80
  pulse: number; // bpm
  temp: number; // °F
  spo2: number; // %
  respRate: number; // /min
}

export interface DiagnosisCode {
  code: string; // ICD-10 or SNOMED CT
  display: string;
  system: 'ICD-10' | 'SNOMED-CT' | 'LOINC';
}

export interface Medication {
  medicine: string; // Brand name
  generic: string; // Generic formula
  dosage: string; // e.g., 500mg
  frequency: string; // e.g., Twice daily (1-0-1)
  duration: string; // e.g., 5 Days
  instructions: string; // e.g. After food
  substitutionAllowed: boolean;
  dispensed?: boolean;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  chiefComplaints: string;
  allergies?: string;
  vitals: ClinicalVitals;
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  diagnoses: DiagnosisCode[];
  prescriptions: Medication[];
  labOrders: {
    testCode: string; // LOINC
    testName: string;
    category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Radiology';
    status: 'Pending' | 'Sample Collected' | 'Processing' | 'Completed';
    resultValue?: string;
    criticalAlert?: boolean;
    dicomUrl?: string; // For RIS
    reportNotes?: string;
  }[];
  treatmentStatus: 'OPD Ongoing' | 'Recommended Admission' | 'Admitted' | 'Discharged';
}

export interface PmjayClaim {
  id: string;
  patientId: string;
  patientName: string;
  pmjayId: string;
  diagnosisCode: string;
  procedureCode: string;
  procedureName: string;
  packageCost: number;
  preAuthStatus: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Queried';
  claimStatus: 'Draft' | 'Submitted' | 'Approved for Settlement' | 'Queried' | 'Paid';
  clinicalDocUrl: string;
  investigationDocUrl: string;
  submissionDate: string;
  queries?: string[];
  fraudAnalysis?: {
    score: number; // 0-100%
    flags: string[];
    explanation: string;
    recommendation: 'Approve' | 'Flag for Auditor Review' | 'Reject / Investigate';
    auditedAt?: string;
  };
}

export interface HospitalBed {
  id: string;
  type: 'General Ward' | 'Semi Private' | 'Private' | 'ICU' | 'NICU' | 'PICU' | 'Isolation Ward';
  bedNumber: string;
  pricePerDay: number;
  status: 'Available' | 'Occupied';
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
}

export interface ConsentLog {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  purpose: string;
  scope: string[]; // e.g. ['Prescriptions', 'Diagnostic Reports']
  status: 'Active' | 'Revoked';
  validUntil: string;
  grantedAt: string;
}

export interface HfrRegistry {
  id: string;
  facilityName: string;
  type: string;
  abdmId: string;
  state: string;
  district: string;
  validationStatus: 'Verified' | 'Pending';
}

export interface HprRegistry {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse';
  abdmNumber: string; // Professional Registry ABHA
  specialty: string;
  registrationNo: string;
  credentialVerified: boolean;
  signatureLinked: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Critical Consumables' | 'Surgical Instruments' | 'Personal Protective Equipment' | 'General Medicines' | 'Anesthetics';
  centralStockUnits: number;
  departmentIssuedUnits: number;
  unissuedGrnUnits: number;
  batchNumber: string;
  expiryDate: string;
  vendorId: string;
  vendorName: string;
  unitCost: number;
  reorderLevel: number;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  contractStatus: 'Active' | 'Under Review' | 'Expired';
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  dateReceived: string;
  purchaseOrderId: string;
  vendorName: string;
  itemsReceived: {
    name: string;
    quantity: number;
    unitPrice: number;
    batchNumber: string;
    expiryDate: string;
  }[];
  qualityCheckedBy: string;
  status: 'Approved' | 'Quarantined';
}

export interface AbhaMaster {
  id: string; // ABHA Number (14 digits)
  abhaId: string; // e.g. tiwary@sbx
  name: string;
  aadhaar: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  status: 'Active' | 'Suspended' | 'Deactivated';
  updatedAt: string;
}

export interface Department {
  code: string; // e.g., CARD
  name: string;
  hod: string; // HPR doctor name
  totalBeds: number;
  occupiedBeds: number;
  opdCharge: number;
  status: 'Operational' | 'Under Maintenance';
}

export interface Appointment {
  id: string; // APT-XXXX
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  dateTime: string;
  roomNo: string;
  consultType: 'OPD' | 'Tele-Consultation' | 'Follow-up';
  status: 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled';
}

export interface Admission {
  id: string; // ADM-XXXX
  patientId: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  bedType: string;
  admittingDoctor: string;
  admittedAt: string;
  dailyRate: number;
  status: 'Admitted' | 'Discharged';
}

export interface BillingItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface BillingRecord {
  id: string; // INV-XXXX
  patientId: string;
  patientName: string;
  billDate: string;
  items: BillingItem[];
  totalAmount: number;
  insuranceStatus: 'Cashless PM-JAY' | 'TPA Private' | 'Self-Pay';
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
}

export interface PmjayPackage {
  code: string; // e.g., SG013
  specialty: string;
  procedureName: string;
  packageCost: number;
  defaultSlaHours: number;
  status: 'Active' | 'Suspended';
}

export interface AuditLogEntry {
  id: string; // AUD-XXXX
  timestamp: string;
  eventType: 'LOGIN' | 'EMR_ACCESS' | 'CLAIM_SUBMISSION' | 'CONSENT_REVOKE' | 'DECRYPT_UHID' | 'BIOMETRIC_VERIFY' | 'API_HIT' | 'DATA_SYNC';
  actor: string; // Name & Role, e.g., "Dr. Arvind (Doctor)"
  endpoint: string;
  resourceId: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  integrityHash: string; // SHA-256 format mockup
}


