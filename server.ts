import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

import { 
  Patient, Encounter, PmjayClaim, HospitalBed, ConsentLog, 
  HfrRegistry, HprRegistry, AbhaMaster, Department, Appointment, 
  Admission, BillingRecord, PmjayPackage, AuditLogEntry 
} from "./src/types";

// Global state cache (Simulates our compliant hospital database)
const db: {
  patients: Patient[];
  encounters: Encounter[];
  claims: PmjayClaim[];
  beds: HospitalBed[];
  consentLogs: ConsentLog[];
  hfr: HfrRegistry[];
  hpr: HprRegistry[];
  abhaMaster: AbhaMaster[];
  departments: Department[];
  appointments: Appointment[];
  admissions: Admission[];
  billing: BillingRecord[];
  pmjayPackages: PmjayPackage[];
  auditLogs: AuditLogEntry[];
} = {
  patients: [
    {
      id: "UHID-108291",
      name: "Ramesh Chandra Kumar",
      guardianName: "Bihari Lal Kumar",
      gender: "Male" as const,
      dob: "1968-08-15",
      phone: "9876543210",
      aadhaar: "1234-5678-9012",
      abhaId: "ramesh.kumar@sbx",
      abhaNumber: "45-9102-3342-8812",
      pmjayId: "P-78192-33",
      address: "12, Gole Market, Near Central Post Office",
      state: "Delhi",
      district: "New Delhi",
      bloodGroup: "O+",
      socioeconomicCategory: "BPL (Below Poverty Line)",
      insuranceType: "Cashless PM-JAY" as const,
      registeredAt: "2026-05-20T08:30:00Z"
    },
    {
      id: "UHID-291024",
      name: "Priyanka Devi Patel",
      guardianName: "Sanjay Patel",
      gender: "Female" as const,
      dob: "1983-11-23",
      phone: "8899001122",
      aadhaar: "9876-5432-1088",
      abhaId: "priyanka.patel@sbx",
      abhaNumber: "12-8871-2918-0012",
      pmjayId: "P-12883-99",
      address: "Village Rampur, P.O. Sadar",
      state: "Uttar Pradesh",
      district: "Lucknow",
      bloodGroup: "B+",
      socioeconomicCategory: "SECC Eligible",
      insuranceType: "Cashless PM-JAY" as const,
      registeredAt: "2026-05-22T10:15:00Z"
    },
    {
      id: "UHID-881290",
      name: "Amit Sharma",
      guardianName: "RK Sharma",
      gender: "Male" as const,
      dob: "1995-04-05",
      phone: "7654321098",
      aadhaar: "4532-1245-9988",
      address: "Block C, Sector 4",
      state: "Haryana",
      district: "Gurugram",
      bloodGroup: "A+",
      socioeconomicCategory: "General / APL",
      insuranceType: "Self-Pay" as const,
      registeredAt: "2026-05-24T14:22:00Z"
    }
  ],
  encounters: [
    {
      id: "ENC-1001",
      patientId: "UHID-108291",
      patientName: "Ramesh Chandra Kumar",
      doctorId: "HPR-33290",
      doctorName: "Dr. Arvind Swaminathan",
      department: "Cardiology",
      date: "2026-05-24T09:15:00Z",
      chiefComplaints: "Exertional dyspnea and retrosternal heaviness for last 2 weeks.",
      allergies: "NKA (No Known Allergies)",
      vitals: {
        bp: "138/88",
        pulse: 82,
        temp: 98.4,
        spo2: 96,
        respRate: 18
      },
      soapNotes: {
        subjective: "Patient describes retrosternal compressive chest pain radiating to left arm when climbing stairs. Relieved by rest.",
        objective: "S1 S2 normal. No added murmurs. Lungs clear to auscultation. Minimal pedal edema.",
        assessment: "Chronic Stable Angina, NYHA Class II. R/O Coronary Artery Disease. Hypertension controlled.",
        plan: "Schedule ECG & Echo. Advise coronary angiograph. Double antiplatelets and nitrate support started."
      },
      diagnoses: [
        { code: "I20.9", display: "Angina pectoris, unspecified", system: "ICD-10" as const },
        { code: "371073007", display: "Retro-sternal chest pain", system: "SNOMED-CT" as const }
      ],
      prescriptions: [
        {
          medicine: "Ecosprin 75",
          generic: "Aspirin 75 mg",
          dosage: "1 Tab",
          frequency: "Once daily (1-0-0)",
          duration: "30 Days",
          instructions: "After Breakfast",
          substitutionAllowed: true,
          dispensed: true
        },
        {
          medicine: "Clopilet 75",
          generic: "Clopidogrel 75 mg",
          dosage: "1 Tab",
          frequency: "Once daily (0-1-0)",
          duration: "30 Days",
          instructions: "After Lunch",
          substitutionAllowed: true,
          dispensed: true
        },
        {
          medicine: "Monotrate 20",
          generic: "Isosorbide Mononitrate 20 mg",
          dosage: "1 Tab",
          frequency: "Twice daily (1-0-1)",
          duration: "15 Days",
          instructions: "Before Food",
          substitutionAllowed: false,
          dispensed: true
        }
      ],
      labOrders: [
        {
          testCode: "883-9",
          testName: "ECG 12 Lead",
          category: "Radiology" as const,
          status: "Completed" as const,
          resultValue: "Sinus Rhythm with T-wave inversions in V4-V6.",
          criticalAlert: false,
          reportNotes: "Ischemic changes noted in lateral leads. Match with clinical profile."
        },
        {
          testCode: "29258-2",
          testName: "Troponin I",
          category: "Biochemistry" as const,
          status: "Completed" as const,
          resultValue: "0.02 ng/mL (Normal Range: <0.04 ng/mL)",
          criticalAlert: false,
          reportNotes: "No acute myocardial necrosis detected at present."
        }
      ],
      treatmentStatus: "OPD Ongoing" as const
    }
  ],
  claims: [
    {
      id: "CLM-9912",
      patientId: "UHID-291024",
      patientName: "Priyanka Devi Patel",
      pmjayId: "P-12883-99",
      diagnosisCode: "K80.20",
      procedureCode: "SG013",
      procedureName: "Laparoscopic Cholecystectomy",
      packageCost: 24000,
      preAuthStatus: "Approved" as const,
      claimStatus: "Approved for Settlement" as const,
      clinicalDocUrl: "/docs/usg_cholelithiasis.pdf",
      investigationDocUrl: "/docs/cbc_lft.pdf",
      submissionDate: "2026-05-23T11:00:00Z",
      queries: [],
      fraudAnalysis: {
        score: 12,
        flags: ["Valid ultrasound attached", "Direct clinical mismatch resolved"],
        explanation: "No anomalies detected. Ultrasound confirms gall bladder calculi (9mm). Surgical indication correlates perfectly with pain history in upper abdomen.",
        recommendation: "Approve" as const,
        auditedAt: "2026-05-23T11:45:00Z"
      }
    }
  ],
  beds: [
    { id: "B-101", type: "General Ward" as const, bedNumber: "GW-01", pricePerDay: 450, status: "Occupied" as const, patientId: "UHID-291024", patientName: "Priyanka Devi Patel", admittedAt: "2026-05-23T14:30:00Z" },
    { id: "B-102", type: "General Ward" as const, bedNumber: "GW-02", pricePerDay: 450, status: "Available" as const },
    { id: "B-103", type: "General Ward" as const, bedNumber: "GW-03", pricePerDay: 450, status: "Available" as const },
    { id: "B-201", type: "Semi Private" as const, bedNumber: "SP-01", pricePerDay: 1200, status: "Available" as const },
    { id: "B-202", type: "Semi Private" as const, bedNumber: "SP-02", pricePerDay: 1200, status: "Available" as const },
    { id: "B-301", type: "Private" as const, bedNumber: "PV-01", pricePerDay: 2800, status: "Available" as const },
    { id: "B-401", type: "ICU" as const, bedNumber: "ICU-01", pricePerDay: 6500, status: "Available" as const },
    { id: "B-402", type: "ICU" as const, bedNumber: "ICU-02", pricePerDay: 6500, status: "Available" as const }
  ],
  consentLogs: [
    {
      id: "CNS-4902",
      patientId: "UHID-108291",
      patientName: "Ramesh Chandra Kumar",
      doctorName: "Dr. Arvind Swaminathan",
      purpose: "Longitudinal Clinical History Review for Cardiac Evaluation",
      scope: ["Prescriptions", "Diagnostic Reports", "Discharge Summaries"],
      status: "Active" as const,
      validUntil: "2026-06-25T10:15:00Z",
      grantedAt: "2026-05-24T09:10:00Z"
    }
  ],
  hfr: [
    { id: "HFR-IN-1200", facilityName: "Central Health City Hospital", type: "Multi-Specialty Private", abdmId: "chcity.hfr@ndhm", state: "Delhi", district: "New Delhi", validationStatus: "Verified" as const },
    { id: "HFR-IN-2500", facilityName: "Sadar District Government Hospital", type: "District General Hospital", abdmId: "sadar.gov@ndhm", state: "Uttar Pradesh", district: "Lucknow", validationStatus: "Verified" as const }
  ],
  hpr: [
    { id: "HPR-33290", name: "Dr. Arvind Swaminathan", role: "Doctor" as const, abdmNumber: "arvind@hpr", specialty: "Cardiology (DM)", registrationNo: "MCI/12839/DL", credentialVerified: true, signatureLinked: true },
    { id: "HPR-90112", name: "Dr. Shruti Aggarwal", role: "Doctor" as const, abdmNumber: "shruti@hpr", specialty: "General Medicine (MD)", registrationNo: "MCI/77812/UP", credentialVerified: true, signatureLinked: true },
    { id: "HPR-44120", name: "Sister Rosamma Varughese", role: "Nurse" as const, abdmNumber: "rosamma@hpr", specialty: "Critical Care / ICU", registrationNo: "INC/9102/DL", credentialVerified: true, signatureLinked: false }
  ],
  abhaMaster: [
    { id: "12-8871-2918-0012", abhaId: "priyanka.patel@sbx", name: "Priyanka Devi Patel", aadhaar: "9876-5432-1088", gender: "Female", dob: "1983-11-23", phone: "8899001122", status: "Active", updatedAt: "2026-05-22T10:15:00Z" },
    { id: "45-9102-3342-8812", abhaId: "ramesh.kumar@sbx", name: "Ramesh Chandra Kumar", aadhaar: "1234-5678-9012", gender: "Male", dob: "1968-08-15", phone: "9876543210", status: "Active", updatedAt: "2026-05-20T08:30:00Z" },
    { id: "55-2201-9988-3412", abhaId: "amit.sharma@sbx", name: "Amit Sharma", aadhaar: "4532-1245-9988", gender: "Male", dob: "1995-04-05", phone: "7654321098", status: "Active", updatedAt: "2026-05-24T14:22:00Z" }
  ],
  departments: [
    { code: "CARD", name: "Cardiology", hod: "Dr. Arvind Swaminathan", totalBeds: 25, occupiedBeds: 8, opdCharge: 600, status: "Operational" },
    { code: "MED", name: "General Medicine", hod: "Dr. Shruti Aggarwal", totalBeds: 50, occupiedBeds: 22, opdCharge: 400, status: "Operational" },
    { code: "OPHT", name: "Ophthalmology", hod: "Dr. Arvind Swaminathan", totalBeds: 10, occupiedBeds: 1, opdCharge: 350, status: "Operational" },
    { code: "NEUR", name: "Neurology", hod: "Dr. Shruti Aggarwal", totalBeds: 15, occupiedBeds: 12, opdCharge: 800, status: "Operational" }
  ],
  appointments: [
    { id: "APT-1002", patientId: "UHID-108291", patientName: "Ramesh Chandra Kumar", doctorName: "Dr. Arvind Swaminathan", department: "Cardiology", dateTime: "2026-05-25T11:00:00Z", roomNo: "Room 101", consultType: "OPD", status: "Scheduled" },
    { id: "APT-1003", patientId: "UHID-291024", patientName: "Priyanka Devi Patel", doctorName: "Dr. Shruti Aggarwal", department: "General Medicine", dateTime: "2026-05-25T14:30:00Z", roomNo: "Room 205", consultType: "Follow-up", status: "Checked In" }
  ],
  admissions: [
    { id: "ADM-8001", patientId: "UHID-291024", patientName: "Priyanka Devi Patel", bedId: "B-101", bedNumber: "GW-01", bedType: "General Ward", admittingDoctor: "Dr. Shruti Aggarwal", admittedAt: "2026-05-23T14:30:00Z", dailyRate: 450, status: "Admitted" }
  ],
  billing: [
    {
      id: "INV-1004",
      patientId: "UHID-291024",
      patientName: "Priyanka Devi Patel",
      billDate: "2026-05-25T09:00:00Z",
      items: [
        { name: "General Ward Bed Charges (2 Days)", quantity: 2, unitPrice: 450 },
        { name: "Laparoscopic Cholecystectomy Kit", quantity: 1, unitPrice: 12500 },
        { name: "Consumables & PPE Kit", quantity: 1, unitPrice: 1500 }
      ],
      totalAmount: 14900,
      insuranceStatus: "Cashless PM-JAY",
      paymentStatus: "Paid"
    }
  ],
  pmjayPackages: [
    { code: "SG013", specialty: "General Surgery", procedureName: "Laparoscopic Cholecystectomy", packageCost: 24000, defaultSlaHours: 48, status: "Active" },
    { code: "CR001", specialty: "Cardiology", procedureName: "Coronary Angiography", packageCost: 15000, defaultSlaHours: 24, status: "Active" },
    { code: "NE005", specialty: "Neurology", procedureName: "Brain MRI with Contrast", packageCost: 9500, defaultSlaHours: 12, status: "Active" }
  ],
  auditLogs: [
    { id: "AUD-5091", timestamp: "2026-05-25T10:00:00Z", eventType: "LOGIN", actor: "SuperAdmin (NHA Administrator)", endpoint: "/api/session/login", resourceId: "SYS-ADMIN", status: "SUCCESS", integrityHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
    { id: "AUD-5092", timestamp: "2026-05-25T10:15:00Z", eventType: "EMR_ACCESS", actor: "Dr. Arvind (Doctor)", endpoint: "/api/patients/UHID-108291", resourceId: "UHID-108291", status: "SUCCESS", integrityHash: "f68c34ea81a5a92a559d80327e5ec01cd7a2fcf88cb6de990a424a7cf500e212" },
    { id: "AUD-5093", timestamp: "2026-05-25T10:20:00Z", eventType: "CLAIM_SUBMISSION", actor: "Ayushman Mitra (NHA Coordinator)", endpoint: "/api/claims", resourceId: "CLM-9912", status: "SUCCESS", integrityHash: "7a26fba4c13a0fc35292c2a05cf25470d069b1876bd692138a0fcf60021b3cd9" }
  ]
};

// --- INVENTORY DATABASE ---
import { InventoryItem, Vendor, GoodsReceivedNote } from "./src/types";

const inventoryDb: {
  items: InventoryItem[];
  vendors: Vendor[];
  grns: GoodsReceivedNote[];
} = {
  items: [
    {
      id: "INV-001",
      name: "Surgical Gloves (Size 7.5, Sterile)",
      category: "Critical Consumables" as const,
      centralStockUnits: 2500,
      departmentIssuedUnits: 1200,
      unissuedGrnUnits: 0,
      batchNumber: "B-GLV-9912",
      expiryDate: "2026-12-15",
      vendorId: "VND-101",
      vendorName: "Medisurge Healthcare India",
      unitCost: 15,
      reorderLevel: 500
    },
    {
      id: "INV-002",
      name: "Propofol Injection 10mg/mL (20mL)",
      category: "Anesthetics" as const,
      centralStockUnits: 80,
      departmentIssuedUnits: 140,
      unissuedGrnUnits: 0,
      batchNumber: "B-PPF-2210",
      expiryDate: "2026-06-18",
      vendorId: "VND-102",
      vendorName: "Bharat Anesthetics Pharmachem",
      unitCost: 210,
      reorderLevel: 100
    },
    {
      id: "INV-003",
      name: "Disposable N95 Face Masks",
      category: "Personal Protective Equipment" as const,
      centralStockUnits: 4200,
      departmentIssuedUnits: 3000,
      unissuedGrnUnits: 0,
      batchNumber: "B-N95-8822",
      expiryDate: "2028-04-30",
      vendorId: "VND-103",
      vendorName: "Suraksha Medical Tex",
      unitCost: 8,
      reorderLevel: 1000
    },
    {
      id: "INV-004",
      name: "Ceftriaxone Injection 1g (Antibiotic)",
      category: "General Medicines" as const,
      centralStockUnits: 450,
      departmentIssuedUnits: 720,
      unissuedGrnUnits: 1000,
      batchNumber: "B-CFT-3304",
      expiryDate: "2026-05-29",
      vendorId: "VND-101",
      vendorName: "Medisurge Healthcare India",
      unitCost: 45,
      reorderLevel: 250
    }
  ],
  vendors: [
    {
      id: "VND-101",
      name: "Medisurge Healthcare India",
      contactPerson: "Mr. Rajeev Mehra",
      phone: "9810234567",
      email: "orders@medisurge.in",
      gstNumber: "07AAACM4829J1Z1",
      contractStatus: "Active" as const
    },
    {
      id: "VND-102",
      name: "Bharat Anesthetics Pharmachem",
      contactPerson: "Dr. Sandeep Kapoor",
      phone: "9888123456",
      email: "gov@bharatpharmachem.co.in",
      gstNumber: "09AABCB1029R2Z0",
      contractStatus: "Active" as const
    },
    {
      id: "VND-103",
      name: "Suraksha Medical Tex",
      contactPerson: "Mrs. Anita Rao",
      phone: "7011928374",
      email: "sales@surakshamask.com",
      gstNumber: "33AAFCS9924K1Z2",
      contractStatus: "Under Review" as const
    }
  ],
  grns: [
    {
      id: "GRN-9901",
      grnNumber: "NDHM-GRN-2026-1022",
      dateReceived: "2026-05-24T11:20:00Z",
      purchaseOrderId: "PO-2026-9904",
      vendorName: "Medisurge Healthcare India",
      itemsReceived: [
        {
          name: "Surgical Gloves (Size 7.5, Sterile)",
          quantity: 1000,
          unitPrice: 15,
          batchNumber: "B-GLV-9912",
          expiryDate: "2026-12-15"
        }
      ],
      qualityCheckedBy: "Inventory Analyst R. Verma",
      status: "Approved" as const
    }
  ]
};

// --- API ENDPOINTS ---

// Inventory endpoints
app.get("/api/inventory", (req, res) => {
  res.json(inventoryDb.items);
});

app.post("/api/inventory", (req, res) => {
  const newItem: InventoryItem = {
    ...req.body,
    id: `INV-${Math.floor(100 + Math.random() * 900)}`
  };
  inventoryDb.items.push(newItem);
  res.json(newItem);
});

app.post("/api/inventory/issue", (req, res) => {
  const { id, quantity } = req.body;
  const numQty = parseInt(quantity) || 0;
  const item = inventoryDb.items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: "Inventory item not found" });
  }
  if (item.centralStockUnits < numQty) {
    return res.status(400).json({ error: "Insufficient stock in central store" });
  }
  item.centralStockUnits -= numQty;
  item.departmentIssuedUnits += numQty;
  res.json(item);
});

app.get("/api/vendors", (req, res) => {
  res.json(inventoryDb.vendors);
});

app.post("/api/vendors", (req, res) => {
  const newVendor: Vendor = {
    ...req.body,
    id: `VND-${Math.floor(100 + Math.random() * 90) || 120}`
  };
  inventoryDb.vendors.push(newVendor);
  res.json(newVendor);
});

app.get("/api/grn", (req, res) => {
  res.json(inventoryDb.grns);
});

app.post("/api/grn", (req, res) => {
  const newGrn: GoodsReceivedNote = {
    ...req.body,
    id: `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
    dateReceived: new Date().toISOString(),
    status: "Approved"
  };
  inventoryDb.grns.push(newGrn);
  
  // Also increment corresponding item stock
  newGrn.itemsReceived.forEach(grnItem => {
    const matched = inventoryDb.items.find(inv => inv.name.toLowerCase() === grnItem.name.toLowerCase());
    if (matched) {
      matched.centralStockUnits += grnItem.quantity;
      matched.batchNumber = grnItem.batchNumber;
      matched.expiryDate = grnItem.expiryDate;
    } else {
      // Create fresh item category depending on name keyword
      const fresh: InventoryItem = {
        id: `INV-${Math.floor(100 + Math.random() * 900)}`,
        name: grnItem.name,
        category: "Critical Consumables",
        centralStockUnits: grnItem.quantity,
        departmentIssuedUnits: 0,
        unissuedGrnUnits: 0,
        batchNumber: grnItem.batchNumber,
        expiryDate: grnItem.expiryDate,
        vendorId: "VND-101",
        vendorName: newGrn.vendorName,
        unitCost: grnItem.unitPrice,
        reorderLevel: 100
      };
      inventoryDb.items.push(fresh);
    }
  });

  res.json(newGrn);
});

// Patient management
app.get("/api/patients", (req, res) => {
  res.json(db.patients);
});

app.post("/api/patients", (req, res) => {
  const newPatient = {
    ...req.body,
    id: `UHID-${Math.floor(100000 + Math.random() * 900000)}`,
    registeredAt: new Date().toISOString()
  };
  db.patients.push(newPatient);
  res.json(newPatient);
});

// ABHA Card creation/verification flow (Mock verification via OTP)
app.post("/api/abdm/abha/create-otp", (req, res) => {
  const { aadhaar } = req.body;
  if (!aadhaar) {
    return res.status(400).json({ error: "Aadhaar number is required" });
  }
  // Simulate sending a security OTP via UIDAI registry
  res.json({
    success: true,
    message: "Aadhaar verification OTP sent to your registered mobile number",
    txnId: `txn-${Math.floor(Math.random() * 1000000)}`
  });
});

app.post("/api/abdm/abha/verify-otp", (req, res) => {
  const { aadhaar, otp, name } = req.body;
  if (!otp) {
    return res.status(400).json({ error: "OTP is required" });
  }

  // Create a randomized ABHA profile linked to this user
  const cleanId = name.toLowerCase().replace(/\s+/g, ".") + "@sbx";
  const numText = Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join("");
  const abhaNumber = `${numText.slice(0, 2)}-${numText.slice(2, 6)}-${numText.slice(6, 10)}-${numText.slice(10, 14)}`;

  res.json({
    success: true,
    abhaId: cleanId,
    abhaNumber,
    aadhaarVerified: true
  });
});

// Scan & Share Token Generator (reducing OPD queue time)
app.post("/api/abdm/scan-share", (req, res) => {
  const { abhaId, name } = req.body;
  const tokenNo = String(Math.floor(101 + Math.random() * 899));
  
  // Find if patient exists, or create a quick demographic placeholder
  let patient = db.patients.find(p => p.abhaId === abhaId);
  if (!patient) {
    const freshUhid = `UHID-${Math.floor(100000 + Math.random() * 900000)}`;
    patient = {
      id: freshUhid,
      name: name || "Scanned ABDM Patient",
      guardianName: "Self / Relative",
      gender: "Other",
      dob: "1990-01-01",
      phone: "9911223344",
      aadhaar: "XXXX-XXXX-XXXX",
      abhaId,
      address: "Address synchronized from ABDM profile",
      state: "Delhi",
      district: "New Delhi",
      bloodGroup: "O+",
      socioeconomicCategory: "General",
      insuranceType: "Self-Pay",
      registeredAt: new Date().toISOString()
    };
    db.patients.push(patient);
  }

  res.json({
    success: true,
    token: tokenNo,
    timeEstimated: "10 mins",
    queueSize: db.encounters.length + 4,
    patient
  });
});

// Bed management
app.get("/api/beds", (req, res) => {
  res.json(db.beds);
});

app.post("/api/beds/allocate", (req, res) => {
  const { bedId, patientId, patientName } = req.body;
  const bed = db.beds.find(b => b.id === bedId);
  if (!bed) return res.status(404).json({ error: "Bed not found" });

  bed.status = "Occupied";
  bed.patientId = patientId;
  bed.patientName = patientName;
  bed.admittedAt = new Date().toISOString();

  res.json(bed);
});

app.post("/api/beds/release", (req, res) => {
  const { bedId } = req.body;
  const bed = db.beds.find(b => b.id === bedId);
  if (!bed) return res.status(404).json({ error: "Bed not found" });

  bed.status = "Available";
  delete bed.patientId;
  delete bed.patientName;
  delete bed.admittedAt;

  res.json(bed);
});

// Clinical Encounters (EMR SOAP)
app.get("/api/encounters", (req, res) => {
  res.json(db.encounters);
});

app.post("/api/encounters", (req, res) => {
  const encounter = {
    ...req.body,
    id: `ENC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString()
  };
  db.encounters.push(encounter);
  res.json(encounter);
});

// Fetch Consent & Registry List
app.get("/api/consents", (req, res) => {
  res.json(db.consentLogs);
});

app.post("/api/consents", (req, res) => {
  const consent = {
    ...req.body,
    id: `CNS-${Math.floor(1000 + Math.random() * 9000)}`,
    grantedAt: new Date().toISOString(),
    status: "Active"
  };
  db.consentLogs.push(consent);
  res.json(consent);
});

app.get("/api/hfr", (req, res) => {
  res.json(db.hfr);
});

app.get("/api/hpr", (req, res) => {
  res.json(db.hpr);
});

// Extended master tables GET routes
app.get("/api/abha_master", (req, res) => {
  res.json(db.abhaMaster);
});

app.get("/api/departments", (req, res) => {
  res.json(db.departments);
});

app.get("/api/appointments", (req, res) => {
  res.json(db.appointments);
});

app.get("/api/admissions", (req, res) => {
  res.json(db.admissions);
});

app.get("/api/billing", (req, res) => {
  res.json(db.billing);
});

app.get("/api/pmjay_packages", (req, res) => {
  res.json(db.pmjayPackages);
});

app.get("/api/audit_logs", (req, res) => {
  res.json(db.auditLogs);
});

// Dynamic admin insertion hub endpoint
app.post("/api/admin/add-row", (req, res) => {
  const { tableName, rowData } = req.body;
  if (!tableName || !rowData) {
    return res.status(400).json({ error: "Missing tableName or rowData" });
  }

  let record: any = { ...rowData };
  
  switch (tableName) {
    case "patients":
      if (!record.id) record.id = `UHID-${Math.floor(100000 + Math.random() * 899999)}`;
      if (!record.registeredAt) record.registeredAt = new Date().toISOString();
      db.patients.push(record);
      break;
    case "abha_master":
      if (!record.id) record.id = `${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.updatedAt) record.updatedAt = new Date().toISOString();
      db.abhaMaster.push(record);
      break;
    case "doctors": // Maps to hpr
      if (!record.id) record.id = `HPR-${Math.floor(10000 + Math.random() * 89999)}`;
      db.hpr.push(record);
      break;
    case "departments":
      if (!record.code) record.code = `DEPT-${Math.floor(100 + Math.random() * 899)}`;
      db.departments.push(record);
      break;
    case "appointments":
      if (!record.id) record.id = `APT-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.dateTime) record.dateTime = new Date().toISOString();
      db.appointments.push(record);
      break;
    case "admissions":
      if (!record.id) record.id = `ADM-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.admittedAt) record.admittedAt = new Date().toISOString();
      db.admissions.push(record);
      break;
    case "billing":
      if (!record.id) record.id = `INV-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.billDate) record.billDate = new Date().toISOString();
      if (!record.items) record.items = [];
      db.billing.push(record);
      break;
    case "claims":
      if (!record.id) record.id = `CLM-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.submissionDate) record.submissionDate = new Date().toISOString();
      db.claims.push(record);
      break;
    case "pmjay_packages":
      if (!record.code) record.code = `PKG-${Math.floor(100 + Math.random() * 899)}`;
      db.pmjayPackages.push(record);
      break;
    case "consent_log": // Maps to consentLogs
      if (!record.id) record.id = `CNS-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.grantedAt) record.grantedAt = new Date().toISOString();
      db.consentLogs.push(record);
      break;
    case "audit_log":
      if (!record.id) record.id = `AUD-${Math.floor(1000 + Math.random() * 8999)}`;
      if (!record.timestamp) record.timestamp = new Date().toISOString();
      db.auditLogs.push(record);
      break;
    default:
      return res.status(400).json({ error: `Unknown master table name: ${tableName}` });
  }

  // Record an audit trail for the insert
  const logEntry = {
    id: `AUD-${Math.floor(1000 + Math.random() * 8999)}`,
    timestamp: new Date().toISOString(),
    eventType: "DATA_SYNC" as const,
    actor: "SuperAdmin (NHA Administrator)",
    endpoint: `/api/admin/add-row/${tableName}`,
    resourceId: record.id || record.code || "UNKNOWN",
    status: "SUCCESS" as const,
    integrityHash: "a5944ad7b1df2c2c019a55ce656461cfa7de41e4649f935fba491a13b0069bc9"
  };
  db.auditLogs.unshift(logEntry);

  res.json({ success: true, record });
});

app.post("/api/admin/audit-verify", (req, res) => {
  const auditVerificationEntry = {
    id: `AUD-${Math.floor(1000 + Math.random() * 8999)}`,
    timestamp: new Date().toISOString(),
    eventType: "BIOMETRIC_VERIFY" as const,
    actor: "SuperAdmin (National Security Officer)",
    endpoint: "/api/admin/audit-verify",
    resourceId: "CRYPTO-LEDGER",
    status: "SUCCESS" as const,
    integrityHash: "bd2c3fa7e12918bb05c75deae12cfdc811cfa5920de65cc529bfa59dd6c801e8"
  };
  db.auditLogs.unshift(auditVerificationEntry);
  res.json({ success: true, verifiedAt: new Date().toISOString() });
});

// ePrescription dispensing update
app.post("/api/pharmacy/dispense", (req, res) => {
  const { encounterId, medicineIndex } = req.body;
  const encounter = db.encounters.find(e => e.id === encounterId);
  if (!encounter) return res.status(404).json({ error: "Encounter not found" });
  if (encounter.prescriptions[medicineIndex]) {
    encounter.prescriptions[medicineIndex].dispensed = true;
  }
  res.json(encounter);
});

// Laboratory report update
app.post("/api/lab/submit-result", (req, res) => {
  const { encounterId, orderIndex, resultValue, criticalAlert, reportNotes } = req.body;
  const encounter = db.encounters.find(e => e.id === encounterId);
  if (!encounter) return res.status(404).json({ error: "Encounter not found" });
  if (encounter.labOrders[orderIndex]) {
    encounter.labOrders[orderIndex].status = "Completed";
    encounter.labOrders[orderIndex].resultValue = resultValue;
    encounter.labOrders[orderIndex].criticalAlert = !!criticalAlert;
    encounter.labOrders[orderIndex].reportNotes = reportNotes;
  }
  res.json(encounter);
});

// Ayushman claims list
app.get("/api/claims", (req, res) => {
  res.json(db.claims);
});

app.post("/api/claims", (req, res) => {
  const claim = {
    ...req.body,
    id: `CLM-${Math.floor(4000 + Math.random() * 5999)}`,
    submissionDate: new Date().toISOString()
  };
  db.claims.push(claim);
  res.json(claim);
});

// Update claim query or status
app.post("/api/claims/action", (req, res) => {
  const { claimId, action, queryText } = req.body; // action: 'approve' | 'query' | 'reject' | 'pay'
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) return res.status(404).json({ error: "Claim not found" });

  if (action === "approve") {
    claim.preAuthStatus = "Approved";
    claim.claimStatus = "Approved for Settlement";
  } else if (action === "reject") {
    claim.preAuthStatus = "Rejected";
  } else if (action === "query") {
    claim.preAuthStatus = "Queried";
    if (!claim.queries) claim.queries = [];
    claim.queries.push(queryText || "NHA auditor requested additional verification logs.");
  } else if (action === "pay") {
    claim.claimStatus = "Paid";
  }

  res.json(claim);
});

// --- GEMINI POWERED INTELLIGENT INTEGRATION ---

// 1. Ayushman Claims Smart Audit & Fraud Prevention Engine
app.post("/api/claims/audit-fraud", async (req, res) => {
  const { claimData, clinicHistory } = req.body;

  if (!claimData) {
    return res.status(400).json({ error: "Missing claim payload" });
  }

  const prompt = `
You are an expert medical audit director and fraud inspector at the National Health Authority (NHA), India, checking PM-JAY (Pradhan Mantri Jan Arogya Yojana) cashless insurance reimbursement claims.
Analyze the following clinical data and claim details for potential fraud, price inflation, duplicate claims, unnecessary clinical procedures, billing split-tricks, or diagnostic inconsistencies.

### CLAIM SUBMISSION:
- Patient Name: ${claimData.patientName}
- PM-JAY Card ID: ${claimData.pmjayId || "N/A"}
- Diagnosis Code/ICD-10 Submitted: ${claimData.diagnosisCode}
- PM-JAY Procedure Code / Package Selected: ${claimData.procedureCode} - ${claimData.procedureName}
- Claimed package cost: ₹${claimData.packageCost}
- Attachment Files checklist: Detailed Clinical Notes, Ultrasound/Labs, Surgery Checklist

### CLINICAL HISTORY (EMR EXCERPTS) OF ENCOUNTER:
${JSON.stringify(clinicHistory, null, 2)}

Identify issues such as:
1. Mismatch between active EMR symptoms vs high-reimbursement procedure (e.g., admitting for simple cough but claiming open-heart surgery).
2. "Unbundling/Splitting" — submitting 3 minor claims instead of 1 bundled procedural package.
3. Length of stay inflation (e.g., patient state is healthy but kept in private/ICU ward beds to pump state package fees).
4. Evidence check: does the clinical documentation list adequate diagnosis?

Generate a JSON object containing EXACTLY:
{
  "score": <number from 0 to 100 representing fraud risk index, where 0-25 is low, 26-60 is moderate, 61-100 is high fraud alert>,
  "flags": [ <array of strings indicating specific security/clinical anomalies found, or empty array if none> ],
  "explanation": "<detailed audit narrative from clinical perspective highlighting findings>",
  "recommendation": "<'Approve' or 'Flag for Auditor Review' or 'Reject / Investigate'>"
}
Do not write markdown backticks or explanations outside the JSON block.
`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Elegant rule-based backup algorithm if the key is missing (for local/preview sandbox)
      console.log("No key found, triggering local rule-based PM-JAY Audit engine.");
      let score = 5;
      const flags: string[] = [];
      let explanation = "Clinical parameters demonstrate perfect concordance. Patient registers typical indications. Sound diagnostics verified.";
      let recommendation: "Approve" | "Flag for Auditor Review" | "Reject / Investigate" = "Approve";

      if (claimData.procedureCode === "SU004" && (!clinicHistory || clinicHistory.indexOf("hip") === -1 && clinicHistory.indexOf("fracture") === -1)) {
        score = 80;
        flags.push("Surgical-Anatomy Disagreement: Total Hip Replacement claimed, but no corresponding fracture, arthropathy, or severe joint trauma discovered in SOAP assessment");
        flags.push("Diagnostic package mismatch");
        explanation = "Claim red flagged. The requested procedure code (SU004 - Hip replacement) lists no logical or clinical support in the doctor's initial exam records. Patient history indicates cardio symptoms rather than orthopedic pathology.";
        recommendation = "Reject / Investigate";
      } else if (clinicHistory && clinicHistory.length < 30) {
        score = 45;
        flags.push("Insufficient clinical clinical-evidence payload");
        explanation = "Moderate Alert: Clinical notes list extremely sparse descriptions. While matching the general code, complete operative indices and preoperative records are inadequate to establish immediate cashless support without auditor clearance.";
        recommendation = "Flag for Auditor Review";
      }
      return res.json({ score, flags, explanation, recommendation });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Risk probability index from 0 to 100" },
            flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific anomaly list" },
            explanation: { type: Type.STRING, description: "Professional medical audit defense rationale" },
            recommendation: { type: Type.STRING, description: "Approve, Flag for Auditor Review, or Reject / Investigate" }
          },
          required: ["score", "flags", "explanation", "recommendation"]
        }
      }
    });

    const bodyText = response.text ? response.text.trim() : "";
    const resData = JSON.parse(bodyText);
    res.json(resData);
  } catch (err: any) {
    console.error("Gemini Claim audit failed", err);
    res.status(500).json({ error: "Intelligent claiming audit failed: " + err.message });
  }
});

// 2. ABDM Interoperability FHIR Bundle Generator
app.post("/api/emr/fhir-bundle", async (req, res) => {
  const { encounter } = req.body;

  if (!encounter) {
    return res.status(400).json({ error: "Encounter records are required" });
  }

  const prompt = `
You are an integration engine for the National Digital Health Mission (NDHM) / National Health Authority (NHA) of India.
Convert this local EMR Clinical Encounter into a fully valid ABDM-compliant **HL7 FHIR JSON Bundle (v4.0.1)**.

### LOCAL CLINICAL ENCOUNTER INFO:
${JSON.stringify(encounter, null, 2)}

The output should represent an interoperable electronic health exchange document containing:
- A Bundle resource of type "document"
- Entry 1: Composition (representing ABDM OPD prescription / summary structure, referencing clinician, patient and encounters)
- Entry 2: Patient linked with our ABDM UHID/ABHA details
- Entry 3: Practitioner (clinician with HPR identification)
- Entry 4: Encounter
- Entry 5: List of Condition/Diagnosis (using ICD-10 or SNOMED-CT codes)
- Entry 6: List of MedicationRequests representing ePrescriptions

Generate a raw valid readable FHIR JSON object. Avoid nesting markdown formatting backticks or other annotations outside the strictly parsed JSON structure.
`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Stunning beautiful static fallback FHIR bundle
      console.log("No key found, triggering offline native FHIR Builder.");
      const demoBundle = {
        resourceType: "Bundle",
        id: `bundle-abdm-${encounter.id}`,
        type: "document",
        timestamp: new Date().toISOString(),
        entry: [
          {
            fullUrl: `urn:uuid:composition-${encounter.id}`,
            resource: {
              resourceType: "Composition",
              status: "final",
              type: {
                coding: [{ system: "http://loinc.org", code: "11502-2", display: "Laboratory report" }]
              },
              subject: { reference: `urn:uuid:patient-${encounter.patientId}` },
              date: encounter.date || new Date().toISOString(),
              author: [{ display: encounter.doctorName || "HPR Doctor" }],
              title: "ABDM Interoperable OPD Summary"
            }
          },
          {
            fullUrl: `urn:uuid:patient-${encounter.patientId}`,
            resource: {
              resourceType: "Patient",
              id: encounter.patientId,
              name: [{ text: encounter.patientName }],
              gender: encounter.patientGender || "other"
            }
          }
        ]
      };
      return res.json({ fhir: demoBundle });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const bodyText = response.text ? response.text.trim() : "";
    const fhirResource = JSON.parse(bodyText);
    res.json({ fhir: fhirResource });
  } catch (err: any) {
    console.error("Gemini FHIR conversion failed", err);
    res.status(500).json({ error: "FHIR Bundling failed on server: " + err.message });
  }
});

// Start listening or hook Vite Dev Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`National ABDM/PM-JAY HMS server running on port ${PORT}`);
  });
}

startServer();
