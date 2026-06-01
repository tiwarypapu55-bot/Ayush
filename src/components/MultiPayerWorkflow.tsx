import React, { useState, useEffect } from "react";
import { 
  Building2, Sparkles, Receipt, ShieldCheck, HeartHandshake, Globe, ShoppingBag, 
  Settings, UserPlus, Search, HelpCircle, DollarSign, Calculator, Plus, Eye,
  CheckCircle2, PlusCircle, Laptop, Crown, ShieldAlert, FileSpreadsheet, UserCheck,
  PlaneTakeoff, Send, ShoppingCart, RefreshCw, Package, ArrowRight, Table, Star,
  Percent, Coins, HelpCircle as HelpIcon, ArrowUpRight, Scale, ChevronRight, X,
  BadgeAlert, Undo2, Ban, FolderSync, ShieldPlus, Landmark, Award, Clock
} from "lucide-react";
import { Patient, Encounter, HospitalBed } from "../types";

// Pricing catalog item template
interface PricingItem {
  id: string;
  name: string;
  category: "Consultation" | "Diagnostic" | "Procedure" | "Lounge";
  baseRate: number; // Cash standard
  corporateRates: Record<string, number>; // Corporate negotiated rates
  cghsRate: number; // Ayushman maximum limits
}

interface corporateInsuranceCarrier {
  id: string;
  name: string;
  acronym: string;
  logo: string;
  status: "active" | "maintenance";
  defaultDiscount: number; // percentage
  copayRatio: number; // e.g. 0.15 for 15% patient copay
  creditLimit: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "Silver Club" | "Gold Circle" | "Presidential Wellness";
  yearlyFee: number;
  discountOnDiagnostics: number; // percentage
  discountOnConsultations: number; // percentage
  perks: string[];
}

interface ProcedureBundle {
  id: string;
  name: string;
  description: string;
  includedServices: string[];
  bundleCost: number;
  savingRatio: number; // percentage vs itemized
}

interface BillLineItem {
  id: string;
  description: string;
  rawCost: number;
  assignedPayer: "Cash" | "TPA" | "Corporate" | "Embassy" | "Subscription" | "Ayushman";
  splitRatio: {
    insurance: number; // fraction
    corporate: number; // fraction
    patient: number; // fraction
  };
}

interface MedicalEscrowDeposit {
  id: string;
  patientId: string;
  amount: number;
  depositedAt: string;
  remarks: string;
}

interface RefundClaim {
  id: string;
  patientId: string;
  patientName: string;
  itemDescription: string;
  amount: number;
  status: "Pending Desk" | "Approved" | "Disbursed" | "Rejected";
  reason: string;
  requestedAt: string;
}

interface MultiPayerWorkflowProps {
  patients: Patient[];
  encounters: Encounter[];
  beds: HospitalBed[];
  onAddPatient: (pat: Patient) => void;
  onRefreshData?: () => void;
}

// Global Static Master Datasets
const MOCK_INSURERS: corporateInsuranceCarrier[] = [
  { id: "TATA", name: "Tata AIG General Corporate Health Plan", acronym: "TATA-AIG", logo: "🤝", status: "active", defaultDiscount: 15, copayRatio: 0.10, creditLimit: 2500000 },
  { id: "STAR", name: "Star Health Premium Corporate Network", acronym: "STAR-HLT", logo: "⭐", status: "active", defaultDiscount: 12, copayRatio: 0.15, creditLimit: 1500000 },
  { id: "ICICI", name: "ICICI Lombard Private Corporate Credit", acronym: "ICICI-LMB", logo: "🦁", status: "active", defaultDiscount: 10, copayRatio: 0.20, creditLimit: 1800000 },
];

const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "SUB-01", name: "Executive Longevity Silver Membership", tier: "Silver Club", yearlyFee: 5000, discountOnDiagnostics: 15, discountOnConsultations: 10, perks: ["Free Annual Lipid Profiler", "Priority Helpline Access", "Dietician Consultation Unit"] },
  { id: "SUB-02", name: "Royal Premium Gold Wellness Alliance", tier: "Gold Circle", yearlyFee: 15000, discountOnDiagnostics: 25, discountOnConsultations: 20, perks: ["Free Whole-Body MRI", "Priority Fast-track Escort", "Companion Lounge Access"] },
  { id: "SUB-03", name: "Imperial Presidential Anti-Aging Lifespan Program", tier: "Presidential Wellness", yearlyFee: 45000, discountOnDiagnostics: 40, discountOnConsultations: 35, perks: ["24/7 Dedicated Concierge MD", "Imperial Lounge Free Bar", "Genetic Risk Mapping Pro", "Executive Valet Assistance"] }
];

const MOCK_PROCEDURE_BUNDLES: ProcedureBundle[] = [
  { 
    id: "BNDL-001", 
    name: "Cardiac Triple-Care Bypass Surgery Package", 
    description: "Full-Care comprehensive coronary bypass bypass bundle at flat rate.",
    includedServices: ["7-Days Luxury Coronary Suite Stay", "Surgeon & Anesthesia Service Fees", "Advanced Cardiac Labs + Echo Panels", "Gourmet dietician plan", "Post-op Tele-follow-up"],
    bundleCost: 295000,
    savingRatio: 22 
  },
  { 
    id: "BNDL-002", 
    name: "Imperial Longevity Wellness & Genetic Risk Map Scan", 
    description: "Premium preventative evaluation package for high-equity segments.",
    includedServices: ["Multi-Organ Whole-Body MRI Scan", "Full Genome Diagnostic Panel Sequencing", "Invited Global Consultant Counseling", "Organic Juicery Dining Set"],
    bundleCost: 65000,
    savingRatio: 18 
  },
  {
    id: "BNDL-003",
    name: "Maternity Executive Care Suite Pack",
    description: "Premium childbirth, luxury suite, and pediatric starter checklist.",
    includedServices: ["3-Days Maharaja Maternity Suite Stay", "Expert Ob-Gyn Consultation Pro", "Immediate Pediatric Vitals Screen", "Presidential Luxury Care Package for Newborn"],
    bundleCost: 140000,
    savingRatio: 15
  }
];

export default function MultiPayerWorkflow({ patients, encounters, beds, onAddPatient, onRefreshData }: MultiPayerWorkflowProps) {
  // Navigation tabs
  const [activeWorkspace, setActiveWorkspace] = useState<"payer-segments" | "advanced-pricing" | "smart-billing">("payer-segments");

  // Premium Toast Notification state & helper to bypass iFrame alert blocks
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Shadow window.alert locally with our gorgeous custom sliding notifications
  const alert = (message: string) => {
    showToast(message, "success");
  };
  
  // Tab 1 Sub-Tab: Active Payer Mode
  const [selectedPayerType, setSelectedPayerType] = useState<"Cash" | "TPA" | "Corporate" | "Embassy" | "Subscription" | "Ayushman">("Cash");

  // Filter patients of specific class, provide smart guest fallback if none
  const nonAyushmanPats = patients.filter(p => p.insuranceType !== "Cashless PM-JAY");
  const helperGuestPatient: Patient = {
    id: "UHID-GUEST-990",
    name: "Devendra Singhania",
    guardianName: "Alok Singhania",
    gender: "Male",
    dob: "1981-04-14",
    phone: "+91 99120 01129",
    aadhaar: "8821-4455-9011",
    insuranceType: "TPA Private",
    registeredAt: new Date().toISOString(),
    address: "Singhania Penthouse, Altamount Road, Mumbai",
    state: "Maharashtra",
    district: "Mumbai",
    bloodGroup: "B+",
    socioeconomicCategory: "General Class"
  };
  
  const activeFocusPatients = nonAyushmanPats.length > 0 ? nonAyushmanPats : [helperGuestPatient];
  const [focusedPatientId, setFocusedPatientId] = useState<string>(activeFocusPatients[0].id);
  const activePatientObj = activeFocusPatients.find(p => p.id === focusedPatientId) || activeFocusPatients[0];

  // System Catalog Store
  const [tariffCatalog, setTariffCatalog] = useState<PricingItem[]>([
    { id: "PRC-101", name: "Comprehensive Neuro-Oncological Assessment Session", category: "Consultation", baseRate: 2000, corporateRates: { "TATA": 1700, "STAR": 1800, "ICICI": 1750 }, cghsRate: 350 },
    { id: "PRC-102", name: "256-Slice High-Definition Dual Brain MRI Contrast", category: "Diagnostic", baseRate: 9805, corporateRates: { "TATA": 8200, "STAR": 8500, "ICICI": 8100 }, cghsRate: 3200 },
    { id: "PRC-103", name: "Advanced Robotics Laparoscopic Cholecystectomy Suite", category: "Procedure", baseRate: 85000, corporateRates: { "TATA": 72000, "STAR": 76000, "ICICI": 74000 }, cghsRate: 22000 },
    { id: "PRC-104", name: "Cardiopulmonary Stress Telemetry & ECG Holter Scan", category: "Diagnostic", baseRate: 4500, corporateRates: { "TATA": 3800, "STAR": 3900, "ICICI": 3850 }, cghsRate: 1540 },
    { id: "PRC-105", name: "Presidential Luxury Suite Daily Retainer Bed Rate", category: "Lounge", baseRate: 35000, corporateRates: { "TATA": 28000, "STAR": 30000, "ICICI": 29000 }, cghsRate: 0 },
  ]);

  // Pricing Modifiers (Dynamic Tariff & Seasonal Multipliers)
  const [activeSeason, setActiveSeason] = useState<"standard" | "monsoon" | "festive_peak">("standard");
  const [useWeekendMarkup, setUseWeekendMarkup] = useState<boolean>(false);
  const [enrolledConsultantGrade, setEnrolledConsultantGrade] = useState<"resident" | "specialist" | "director" | "invited_global">("specialist");
  const [selectedBundleId, setSelectedBundleId] = useState<string>("BNDL-001");
  const [assignedBundlesList, setAssignedBundlesList] = useState<{ id: string; patientId: string; bundleName: string; cost: number; date: string }[]>([
    { id: "ASS-B-091", patientId: activePatientObj.id, bundleName: "Cardiac Triple-Care Bypass Surgery Package", cost: 295000, date: "2026-05-29" }
  ]);

  // State: Split Billing Configuration Live Worksheet
  const [activeBillItems, setActiveBillItems] = useState<BillLineItem[]>([
    { id: "BL-01", description: "Maharaja Royal Suite Stay (2 Days)", rawCost: 90000, assignedPayer: "Corporate", splitRatio: { insurance: 0.5, corporate: 0.3, patient: 0.2 } },
    { id: "BL-02", description: "Laparoscopic Surgical Operating consumable Kit", rawCost: 65000, assignedPayer: "TPA", splitRatio: { insurance: 0.8, corporate: 0, patient: 0.2 } },
    { id: "BL-03", description: "256-Slice High-Definition Dual Brain MRI Contrast", rawCost: 9805, assignedPayer: "Cash", splitRatio: { insurance: 0, corporate: 0.5, patient: 0.5 } },
    { id: "BL-04", description: "Global Super-Specialist Consultant Visit (Special Invitee)", rawCost: 15000, assignedPayer: "Cash", splitRatio: { insurance: 0, corporate: 0, patient: 1.0 } }
  ]);

  // Dynamic Multipliers calculation
  const getMultiplier = () => {
    let mul = 1.0;
    // Seasonal multiplier
    if (activeSeason === "monsoon") mul += 0.12; // +12% dengue/monsoon flu surcharge
    if (activeSeason === "festive_peak") mul += 0.08; // +8% festive high-occupancy markup
    
    // Weekend markup
    if (useWeekendMarkup) mul += 0.15; // +15% night/weekend emergency tariff

    return mul;
  };

  const getConsultantGradeFactor = () => {
    switch (enrolledConsultantGrade) {
      case "resident": return 1.0;
      case "specialist": return 1.5;
      case "director": return 2.5;
      case "invited_global": return 4.0;
    }
  };

  // State: Direct Billing Checkout Receipts (Cash Segment)
  const [cashDirectSettleLog, setCashDirectSettleLog] = useState<{ id: string; name: string; gross: number; discount: number; settled: number; date: string; payMode: string }[]>([
    { id: "CSH-RCPT-901", name: "Devendra Singhania", gross: 24800, discount: 1240, settled: 23560, date: "2026-05-28", payMode: "UPI Spark Direct" }
  ]);
  const [cashPayMode, setCashPayMode] = useState("Direct Credit Card Pro");
  
  // State: Insurance TPA Claims Workflow
  const [tpaClaimLogs, setTpaClaimLogs] = useState<{ id: string; name: string; carrier: string; status: "Approved" | "Review Pending" | "Discharged Queried"; preAuthRef: string; cover: number; patientPay: number }[]>([
    { id: "TPA-CL-550", name: "Devendra Singhania", carrier: "STAR-HLT", status: "Approved", preAuthRef: "PRE-AUTH-8819", cover: 112500, patientPay: 18500 }
  ]);
  const [preAuthIcdCode, setPreAuthIcdCode] = useState("I25.10 (Coronary Arteriopathy)");
  const [activePreAuthCarrier, setActivePreAuthCarrier] = useState("STAR");

  // State: Corporate Credit Settler with Extended Fields for Wages/Charges auditing
  const [corporateInvoices, setCorporateInvoices] = useState<{
    id: string;
    company: string;
    patient: string;
    patientId: string;
    sumCredit: string;
    amountValue: number;
    approvedBy: string;
    status: "Awaiting Month-End Clearance" | "Settled Credit Ledger" | "Partially Cleared";
    payablesList: {
      id: string;
      type: "Doctor Wage" | "Staff Wage" | "Supplier Charge";
      payeeName: string;
      description: string;
      amount: number;
    }[];
    clearedAmount?: number;
    transactionRef?: string;
    clearanceDate?: string;
  }[]>([
    { 
      id: "CORP-TX-9902", 
      company: "TATA General Corporate", 
      patient: "Devendra Singhania", 
      patientId: "UHID-GUEST-990",
      sumCredit: "₹1,77,000", 
      amountValue: 177000,
      approvedBy: "Alok Sen (CHRO)", 
      status: "Awaiting Month-End Clearance",
      payablesList: [
        { id: "PAY-1", type: "Doctor Wage", payeeName: "Dr. Arvind (Senior Cardio)", description: "Consultation & OT supervision", amount: 15000 },
        { id: "PAY-2", type: "Staff Wage", payeeName: "OT Staff Sneha (Lead)", description: "OT Surgical Scrub assistance", amount: 5000 },
        { id: "PAY-3", type: "Supplier Charge", payeeName: "Chiron Medical Implants Group", description: "Vascular Suture Packs & Supplies", amount: 12000 }
      ],
      clearedAmount: undefined,
      transactionRef: undefined,
      clearanceDate: undefined
    }
  ]);
  const [corpApprovedBy, setCorpApprovedBy] = useState("Sumira Nadkarni (Internal Credit Auditor)");
  const [selectedCorpEmployer, setSelectedCorpEmployer] = useState("TATA");

  // Dynamic staging state for custom corporate payee wage/material bookings
  const [appliedPayablesMap, setAppliedPayablesMap] = useState<Record<string, {
    id: string;
    type: "Doctor Wage" | "Staff Wage" | "Supplier Charge";
    payeeName: string;
    description: string;
    amount: number;
  }[]>>({
    "UHID-GUEST-990": [
      { id: "PAY-1", type: "Doctor Wage", payeeName: "Dr. Arvind (Senior Cardio)", description: "Consultation & OT supervision", amount: 15000 },
      { id: "PAY-2", type: "Staff Wage", payeeName: "OT Staff Sneha (Lead)", description: "OT Surgical Scrub assistance", amount: 5000 },
      { id: "PAY-3", type: "Supplier Charge", payeeName: "Chiron Medical Implants Group", description: "Vascular Suture Packs & Supplies", amount: 12000 }
    ]
  });

  const [payeeTypeInput, setPayeeTypeInput] = useState<"Doctor Wage" | "Staff Wage" | "Supplier Charge">("Doctor Wage");
  const [payeeNameInput, setPayeeNameInput] = useState("Dr. Amit Sharma (Lead Cardiac Surgeon)");
  const [serviceDescInput, setServiceDescInput] = useState("Specialist Cardiothoracic Surgeon Intra-Op Surcharge");
  const [payableAmountInput, setPayableAmountInput] = useState("25000");

  const [selectedClearanceInvoiceId, setSelectedClearanceInvoiceId] = useState<string | null>(null);
  const [clearancePayAmount, setClearancePayAmount] = useState("");
  const [clearanceTxRef, setClearanceTxRef] = useState("");
  const [clearanceDate, setClearanceDate] = useState(() => new Date().toISOString().split('T')[0]);

  // State: Embassy Support logs
  const [embassyGuarantees, setEmbassyGuarantees] = useState<{ id: string; patient: string; nationality: string; guaranteeAmt: number; interpreter: string; currency: "USD" | "EUR" | "GBP" | "INR"; escortsName: string }[]>([
    { id: "EMB-8802", patient: "Hiroshi Takahashi", nationality: "Japan National", guaranteeAmt: 12500, interpreter: "Yes (Japanese Liaison)", currency: "USD", escortsName: "Special Embassy Chauffeur" }
  ]);
  const [embNational, setEmbNational] = useState("Japan");
  const [embInterpreterNeeded, setEmbInterpreterNeeded] = useState("Yes (Japanese Liaison)");
  const [embCurrencyPreference, setEmbCurrencyPreference] = useState<"USD" | "EUR" | "GBP" | "INR">("USD");

  // State: Subscription Club Membership Plan logs
  const [patientSubscriptionLedger, setPatientSubscriptionLedger] = useState<{ id: string; name: string; schemeName: string; yearlyFee: number; activeStatus: "Active Member" | "Renew Required" }[]>([
    { id: "SUB-P-202", name: "Devendra Singhania", schemeName: "Imperial Presidential Anti-Aging Lifespan Program", yearlyFee: 45000, activeStatus: "Active Member" }
  ]);
  const [selectedNewSubscriptionId, setSelectedNewSubscriptionId] = useState("SUB-01");

  // State: Ayushman Cashless Claims dispatch logs
  const [ayushmanDispatches, setAyushmanDispatches] = useState<{ claimId: string; patientName: string; nationalCode: string; procedure: string; baseRate: number; cghsPackageClaim: number; dispatchStatus: "NHA Audited & Cleared" | "Awaiting State Claim Release" }[]>([
    { claimId: "PMJAY-CL-8803", patientName: "Arundhati Roy", nationalCode: "SG-012 Laparoscopic", procedure: "Advanced Robotics Laparoscopic Cholecystectomy Suite", baseRate: 85000, cghsPackageClaim: 22000, dispatchStatus: "Awaiting State Claim Release" }
  ]);
  const [ayushmanSelectedProcedureId, setAyushmanSelectedProcedureId] = useState("PRC-103");

  // State: Escrow Deposits & Wallet Settlements
  const [escrowDeposits, setEscrowDeposits] = useState<MedicalEscrowDeposit[]>([
    { id: "ESC-3001", patientId: activePatientObj.id, amount: 75000, depositedAt: "2026-05-29 09:30 AM", remarks: "Initial Cashless Hold Deposit for Bypass ICU reserve room" }
  ]);
  const [newDepositAmount, setNewDepositAmount] = useState<string>("50000");
  const [depositRemarks, setDepositRemarks] = useState<string>("Pre-admission Surgery Hold Reserve Balance");

  // State: Refunds Registry with active Approval cycles
  const [refundClaims, setRefundClaims] = useState<RefundClaim[]>([
    { id: "RFD-4401", patientId: activePatientObj.id, patientName: activePatientObj.name, itemDescription: "Unused sterile cardiac catheterization probe kit", amount: 14500, status: "Pending Desk", reason: "Surgical team changed catheter size mid-procedure; box unopened.", requestedAt: "2026-05-29" },
    { id: "RFD-4402", patientId: activePatientObj.id, patientName: activePatientObj.name, itemDescription: "Double booking air-conditioning charge overpay", amount: 6000, status: "Approved", reason: "Transferred earlier than estimated from private room to central ICU ward.", requestedAt: "2026-05-28" }
  ]);
  const [refundRequestDesc, setRefundRequestDesc] = useState<string>("");
  const [refundRequestAmt, setRefundRequestAmt] = useState<string>("");
  const [refundRequestReason, setRefundRequestReason] = useState<string>("");

  // Handler: Assign Surgical/Procedural Bundle to Patient
  const handleAssignBundle = () => {
    const matchedBundle = MOCK_PROCEDURE_BUNDLES.find(b => b.id === selectedBundleId);
    if (!matchedBundle) return;
    
    const newAss = {
      id: `ASS-B-${Math.floor(100 + Math.random() * 899)}`,
      patientId: focusedPatientId,
      bundleName: matchedBundle.name,
      cost: matchedBundle.bundleCost,
      date: new Date().toISOString().substring(0, 10)
    };
    
    setAssignedBundlesList(prev => [newAss, ...prev]);
    alert(`Successfully Assigned "${matchedBundle.name}" to Patient ${activePatientObj.name}! Bundled flat-price logged: ₹${matchedBundle.bundleCost.toLocaleString()}`);
  };

  // States for custom bill line item creation
  const [newBillSvcName, setNewBillSvcName] = useState("");
  const [newBillSvcCost, setNewBillSvcCost] = useState("");

  const handleAddBillLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillSvcName || !newBillSvcCost) {
      alert("Please fill out both service description and raw baseline cost.");
      return;
    }
    const costVal = parseFloat(newBillSvcCost) || 0;
    const newItem: BillLineItem = {
      id: `BL-${Math.floor(10 + Math.random() * 89)}`,
      description: newBillSvcName,
      rawCost: costVal,
      assignedPayer: "Cash",
      splitRatio: { insurance: 0.0, corporate: 0.0, patient: 1.0 }
    };
    setActiveBillItems(prev => [...prev, newItem]);
    setNewBillSvcName("");
    setNewBillSvcCost("");
    alert(`Successfully appended billing service item: "${newBillSvcName}" (Raw: ₹${costVal.toLocaleString()}) with default 100% Patient split.`);
  };

  const handleDeleteBillLineItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this billing line item?")) {
      setActiveBillItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Handler: Add custom pricing item
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomCategory, setNewCustomCategory] = useState<PricingItem["category"]>("Procedure");
  const [newCustomBase, setNewCustomBase] = useState("");
  
  const handleAddCustomPriceRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName || !newCustomBase) {
      alert("Please provide service name and custom baseline rate tariff.");
      return;
    }
    const rateVal = parseFloat(newCustomBase);
    const newItem: PricingItem = {
      id: `PRC-${Math.floor(200 + Math.random() * 799)}`,
      name: newCustomName,
      category: newCustomCategory,
      baseRate: rateVal,
      corporateRates: {
        "TATA": Math.round(rateVal * 0.85),
        "STAR": Math.round(rateVal * 0.88),
        "ICICI": Math.round(rateVal * 0.90),
      },
      cghsRate: Math.round(rateVal * 0.35)
    };
    setTariffCatalog(prev => [...prev, newItem]);
    setNewCustomName("");
    setNewCustomBase("");
    alert(`Custom out-of-scheme department rate added cleanly! Code: ${newItem.id}`);
  };

  // Cash Billing Process
  const triggerCashDirectSettle = () => {
    let grossTotal = activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0);
    let disc = Math.round(grossTotal * 0.05); // 5% discount for cash payment direct settlement
    let netVal = grossTotal - disc;
    
    // Create direct record
    const newRcpt = {
      id: `CSH-RCPT-${Math.floor(100 + Math.random() * 899)}`,
      name: activePatientObj.name,
      gross: grossTotal,
      discount: disc,
      settled: netVal,
      date: new Date().toISOString().substring(0, 10),
      payMode: cashPayMode
    };

    setCashDirectSettleLog(prev => [newRcpt, ...prev]);
    alert(`Receipt ${newRcpt.id} printed! ₹${newRcpt.settled.toLocaleString()} settled cleanly under Cash Desk.`);
  };

  // Insurance TPA claim submission
  const dispatchInsuranceClaim = () => {
    const grossTotal = activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0);
    const copayFactor = activePreAuthCarrier === "TATA" ? 0.10 : activePreAuthCarrier === "STAR" ? 0.15 : 0.20;
    const covered = Math.round(grossTotal * (1 - copayFactor));
    const ptPay = grossTotal - covered;

    const newClaim = {
      id: `TPA-CL-${Math.floor(500 + Math.random() * 499)}`,
      name: activePatientObj.name,
      carrier: `${activePreAuthCarrier}-HLT`,
      status: "Review Pending" as const,
      preAuthRef: `PRE-AUTH-${Math.floor(1000 + Math.random() * 8999)}`,
      cover: covered,
      patientPay: ptPay
    };

    setTpaClaimLogs(prev => [newClaim, ...prev]);
    alert(`Comprehensive Insurance Claim Packet dispatched successfully! Pre-Auth check issued.`);
  };

  // Apply dynamic charges & wages for Corporate Sponsor Patients
  const handleAddCorporatePayable = (patientId: string) => {
    let finalPayee = payeeNameInput.trim();
    let finalDesc = serviceDescInput.trim();
    let finalAmount = payableAmountInput.trim();

    // Support automatic mock defaults if fields are left empty on dynamic addition!
    if (!finalPayee) finalPayee = "Dr. Amit Sharma (Lead Cardiac Surgeon)";
    if (!finalDesc) finalDesc = "Specialist Cardiothoracic Surgeon Intra-Op Surcharge";
    if (!finalAmount) finalAmount = "25000";

    const amt = parseFloat(finalAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please provide a valid positive amount.");
      return;
    }

    const newItem = {
      id: `PAY-${Math.floor(1000 + Math.random() * 8999)}`,
      type: payeeTypeInput,
      payeeName: finalPayee,
      description: finalDesc,
      amount: amt
    };

    setAppliedPayablesMap(prev => {
      const current = prev[patientId] || [];
      return {
        ...prev,
        [patientId]: [...current, newItem]
      };
    });

    setPayeeNameInput("");
    setServiceDescInput("");
    setPayableAmountInput("");
    alert(`Successfully applied ₹${amt.toLocaleString()} payable to ${newItem.payeeName} against this patient's corporate folder!`);
  };

  const handleDeleteCorporatePayable = (patientId: string, itemId: string) => {
    setAppliedPayablesMap(prev => {
      const current = prev[patientId] || [];
      return {
        ...prev,
        [patientId]: current.filter(item => item.id !== itemId)
      };
    });
  };

  // Upgraded: Settle Corporate invoices with custom Applied Wages / Supplier Charges
  const emitCorporateCreditInvoice = () => {
    const baselineRaw = activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0);
    const customPayables = appliedPayablesMap[activePatientObj.id] || [];
    const payablesSum = customPayables.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRaw = baselineRaw + payablesSum;

    const newInv = {
      id: `CORP-TX-${Math.floor(1000 + Math.random() * 8999)}`,
      company: `${selectedCorpEmployer} General Corporate`,
      patient: activePatientObj.name,
      patientId: activePatientObj.id,
      sumCredit: `₹${totalRaw.toLocaleString()}`,
      amountValue: totalRaw,
      approvedBy: corpApprovedBy,
      status: "Awaiting Month-End Clearance" as const,
      payablesList: customPayables,
      clearedAmount: undefined,
      transactionRef: undefined,
      clearanceDate: undefined
    };

    setCorporateInvoices(prev => [newInv, ...prev]);

    // Clear staging payables since they are now bound to the formal outstanding invoice
    setAppliedPayablesMap(prev => ({
      ...prev,
      [activePatientObj.id]: []
    }));

    alert(`Corporate claim invoice ${newInv.id} compiled & dispatched!\n- Baseline Medicals: ₹${baselineRaw.toLocaleString()}\n- Professional Fees & Supplies: ₹${payablesSum.toLocaleString()}\n- Grand Claim balance: ₹${totalRaw.toLocaleString()}\nAwaiting month-end clearing agency review.`);
  };

  // Process and record subsequent payments on clearance of corporate bill
  const handleCorporateClearance = (invoiceId: string) => {
    const amt = parseFloat(clearancePayAmount);
    if (!clearancePayAmount || isNaN(amt) || amt <= 0) {
      alert("Please enter a valid cleared payment amount.");
      return;
    }
    if (!clearanceTxRef) {
      alert("Bank transaction transfer reference/UTR is mandatory for audit accounting.");
      return;
    }

    setCorporateInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: "Settled Credit Ledger" as const,
          clearedAmount: amt,
          transactionRef: clearanceTxRef,
          clearanceDate: clearanceDate
        };
      }
      return inv;
    }));

    setSelectedClearanceInvoiceId(null);
    setClearancePayAmount("");
    setClearanceTxRef("");
    alert(`Corporate payment clearance recorded successfully!\n- UTR Ref: ${clearanceTxRef}\n- Cleared sum: ₹${amt.toLocaleString()}\n- Disbursed all attached consultant fees, care wages, and vendor materials.`);
  };

  // Add Embassy Direct guarantee
  const addEmbassyGuarantee = (e: React.FormEvent) => {
    e.preventDefault();
    const totalRaw = activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0);
    const guaranteeVal = Math.round(totalRaw / 83.5); // convert to currency
    const newEmb = {
      id: `EMB-${Math.floor(8000 + Math.random() * 999)}`,
      patient: activePatientObj.name,
      nationality: `${embNational} Foreign Liaison`,
      guaranteeAmt: guaranteeVal,
      interpreter: embInterpreterNeeded,
      currency: embCurrencyPreference,
      escortsName: "Regular Air Ambulance Concierge"
    };
    setEmbassyGuarantees(prev => [newEmb, ...prev]);
    alert(`Embassy guarantee protocol registered! Interpreter services assigned.`);
  };

  // Settle membership subscription plan benefits
  const handleEnrollSubscription = () => {
    const plan = MOCK_SUBSCRIPTION_PLANS.find(p => p.id === selectedNewSubscriptionId);
    if (!plan) return;
    const newSubRec = {
      id: `SUB-P-${Math.floor(100 + Math.random() * 899)}`,
      name: activePatientObj.name,
      schemeName: plan.name,
      yearlyFee: plan.yearlyFee,
      activeStatus: "Active Member" as const
    };
    setPatientSubscriptionLedger(prev => [newSubRec, ...prev]);
    alert(`Enrolled ${activePatientObj.name} in standard medical club: ${plan.name}. Autodiscounts configured.`);
  };

  // Settle Ayushman claim codes
  const dispatchAyushmanClaimCode = () => {
    const selectedCatalogItem = tariffCatalog.find(p => p.id === ayushmanSelectedProcedureId);
    if (!selectedCatalogItem) return;
    
    // package cost CGHS limit or default to baseline
    const claimCost = selectedCatalogItem.cghsRate || 5000;

    const newClaim = {
      claimId: `PMJAY-CL-${Math.floor(1000 + Math.random() * 8999)}`,
      patientName: activePatientObj.name,
      nationalCode: `NHA-${selectedCatalogItem.id}`,
      procedure: selectedCatalogItem.name,
      baseRate: selectedCatalogItem.baseRate,
      cghsPackageClaim: claimCost,
      dispatchStatus: "Awaiting State Claim Release" as const
    };

    setAyushmanDispatches(prev => [newClaim, ...prev]);
    alert(`Ayushman PM-JAY package mapped and submitted cleanly! Status: Awaiting NHA Audit Gateway.`);
  };

  // Escrow Wallet Deposit Flow
  const handleAddEscrowDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepositAmount) return;
    const val = parseFloat(newDepositAmount) || 0;
    const newDep: MedicalEscrowDeposit = {
      id: `ESC-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: focusedPatientId,
      amount: val,
      depositedAt: new Date().toLocaleString(),
      remarks: depositRemarks
    };
    setEscrowDeposits(prev => [newDep, ...prev]);
    setNewDepositAmount("");
    setDepositRemarks("Hospitalization Escrow Deposit Settle");
    alert(`Escrow security fund of ₹${val.toLocaleString()} deposited safely into UHID: ${focusedPatientId}`);
  };

  // Adjust advance settlement
  const settleBillLineFromEscrow = (itemId: string, cost: number) => {
    const totalDeposited = escrowDeposits
      .filter(d => d.patientId === focusedPatientId)
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (totalDeposited < cost) {
      alert(`Insufficient funds in Escrow! Deposited amount: ₹${totalDeposited.toLocaleString()}, Line item cost: ₹${cost.toLocaleString()}. Please deposit more funds first.`);
      return;
    }

    // Deduct
    const deduction: MedicalEscrowDeposit = {
      id: `ESC-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: focusedPatientId,
      amount: -cost,
      depositedAt: new Date().toLocaleString(),
      remarks: `Deduction for settled bill item: ${itemId}`
    };

    setEscrowDeposits(prev => [deduction, ...prev]);
    alert(`Successfully adjusted. ₹${cost.toLocaleString()} settled cleanly from patient escrow pocket!`);
  };

  // Submit Refund requests
  const handleRequestRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundRequestDesc || !refundRequestAmt) return alert("Fill out refund description and amount.");
    
    const newRef: RefundClaim = {
      id: `RFD-${Math.floor(4000 + Math.random() * 999)}`,
      patientId: focusedPatientId,
      patientName: activePatientObj.name,
      itemDescription: refundRequestDesc,
      amount: parseFloat(refundRequestAmt) || 1200,
      status: "Pending Desk",
      reason: refundRequestReason,
      requestedAt: new Date().toISOString().substring(0, 10)
    };

    setRefundClaims(prev => [newRef, ...prev]);
    setRefundRequestDesc("");
    setRefundRequestAmt("");
    setRefundRequestReason("");
    alert(`Refund docket ${newRef.id} registered under desk audit scrutiny!`);
  };

  // Process approval loop
  const approveRefundClaim = (claimId: string) => {
    setRefundClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status: "Approved" };
      }
      return c;
    }));
    alert(`Supervisor review passed for claim ${claimId}!`);
  };

  const disburseRefundClaim = (claimId: string) => {
    setRefundClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status: "Disbursed" };
      }
      return c;
    }));
    alert(`Cash reimbursement printed for ${claimId}! Funds disbursed to original source.`);
  };

  // Split-billing modifiers helper
  const handleItemSplitChange = (itemId: string, field: "insurance" | "corporate" | "patient", fraction: number) => {
    setActiveBillItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const otherFields = field === "insurance" ? ["corporate", "patient"] : field === "corporate" ? ["insurance", "patient"] : ["insurance", "corporate"];
        const updateRatio = { ...item.splitRatio };
        updateRatio[field] = fraction;
        
        // auto-adjust remaining fraction to keep total sum as 1.0
        const remaining = 1.0 - fraction;
        updateRatio[otherFields[0] as "insurance"|"corporate"|"patient"] = parseFloat((remaining / 2).toFixed(2));
        updateRatio[otherFields[1] as "insurance"|"corporate"|"patient"] = parseFloat((remaining / 2).toFixed(2));
        
        return { ...item, splitRatio: updateRatio };
      }
      return item;
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative" id="multi-payer-comprehensive-workspace">
      
      {/* Floating System Messages Overlay */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-slate-900 border border-slate-800 text-white shadow-2xl px-5 py-4 rounded-2xl flex items-center gap-3 max-w-sm transition-all duration-300 transform scale-100 animate-fadeIn">
          <div className="bg-[#003580] text-emerald-400 rounded-full p-2 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Audit Workflow Notification</p>
            <p className="text-xs text-slate-100 font-bold mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white cursor-pointer p-1 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Visual Identity Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 text-white p-6 relative">
        <div className="absolute right-0 top-0 p-5 opacity-10 select-none">
          <Award className="h-28 w-28 text-white rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black bg-rose-500/20 text-rose-300 px-3 py-1 rounded-sm border border-rose-500/30">
              Multi-Payer Clinical Settle Layer
            </span>
            <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-sm border border-emerald-500/30">
              National Health Grid Audited
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-300 ml-auto font-mono">
              Workspace Instance: Active 2026
            </span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                <Building2 className="h-7 w-7 text-rose-400 shrink-0" />
                Medinex Multi-Payer Clinical Operations &amp; smart billing Workdesk
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-normal">
                Bypasses standardized PM-JAY package ceilings to enable hybrid hospital billing. Serves premium commercial patients, corporate accounts, embassy partnerships, direct-paying cash citizens, and dual-mode outpatient services.
              </p>
            </div>

            {/* Global Active Focus Selector */}
            <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-2xl flex items-center gap-3.5 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-mono font-bold text-rose-400 block">Workspace Patient desk</span>
                <p className="text-xs font-black text-white leading-tight">{activePatientObj.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{activePatientObj.id}</p>
              </div>
              <select 
                value={focusedPatientId} 
                onChange={(e) => setFocusedPatientId(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs text-white font-bold max-w-[200px] shadow-sm focus:ring-2 focus:ring-rose-500"
              >
                {activeFocusPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0, 10)})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="bg-slate-100 border-b p-2.5 flex flex-wrap gap-1.5 select-none font-semibold">
        <button
          onClick={() => setActiveWorkspace("payer-segments")}
          className={`px-5 py-3 text-xs font-black transition flex items-center gap-2 rounded-xl cursor-pointer ${
            activeWorkspace === "payer-segments" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Payer Segment Desks</span>
        </button>
        <button
          onClick={() => setActiveWorkspace("advanced-pricing")}
          className={`px-5 py-3 text-xs font-black transition flex items-center gap-2 rounded-xl cursor-pointer ${
            activeWorkspace === "advanced-pricing" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Advanced Pricing architect</span>
        </button>
        <button
          onClick={() => setActiveWorkspace("smart-billing")}
          className={`px-5 py-3 text-xs font-black transition flex items-center gap-2 rounded-xl cursor-pointer ${
            activeWorkspace === "smart-billing" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Smart Split-Billing &amp; Audit Escrows</span>
        </button>
      </div>

      <div className="p-6">
        
        {/* WORKSPACE 1: PAYER CATEGORY SEGMENT WORKDESK */}
        {activeWorkspace === "payer-segments" && (
          <div className="space-y-6">
            
            {/* Header Description Row */}
            <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl flex items-start gap-3 text-slate-705">
              <Star className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase">Payer-Specific Clinical Workflow Gateways</h4>
                <p className="text-[11px] leading-relaxed mt-0.5 text-slate-600">
                  Select a Payer Category below to load specialized financial adapters. Standardize Direct Self-Pay, dispatch TPA Pre-authorizations, settle Corporate Credit accounts, reconcile Embassy guarantees, configure Membership Loyalty plans, or map official Ayushman claims codes.
                </p>
              </div>
            </div>

            {/* Payer Selector Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 select-none">
              {[
                { type: "Cash" as const, label: "Cash / Direct Card", r: "Direct billing", icon: "🪙", col: "from-amber-600 to-amber-700" },
                { type: "TPA" as const, label: "TPA Private Ins.", r: "Insurance workflow", icon: "🛡️", col: "from-blue-600 to-blue-700" },
                { type: "Corporate" as const, label: "Corporate Sponsor", r: "Credit settlement", icon: "🏢", col: "from-indigo-650 to-indigo-700" },
                { type: "Embassy" as const, label: "Embassy Liaison", r: "International billing", icon: "🏛️", col: "from-rose-700 to-rose-800" },
                { type: "Subscription" as const, label: "Subscription Club", r: "Membership plans", icon: "💳", col: "from-violet-600 to-violet-700" },
                { type: "Ayushman" as const, label: "Ayushman PM-JAY", r: "Package claims", icon: "🦁", col: "from-emerald-700 to-emerald-800" }
              ].map(p => {
                const isSelected = selectedPayerType === p.type;
                return (
                  <div
                    key={p.type}
                    onClick={() => setSelectedPayerType(p.type)}
                    className={`cursor-pointer transition rounded-2xl p-4 flex flex-col justify-between border min-h-[110px] hover:scale-[1.03] ${
                      isSelected 
                        ? `bg-slate-900 text-white shadow-md border-slate-950 scale-[1.01]` 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{p.icon}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-white/10 text-rose-300 border border-white/20" : "bg-slate-200 text-slate-650"
                      }`}>
                        {p.type}
                      </span>
                    </div>

                    <div className="mt-2 text-left">
                      <strong className="text-[11.5px] font-black block leading-snug">{p.label}</strong>
                      <span className={`text-[9px] block ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{p.r}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-Panel Layout based on Selected Payer Category */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              
              {/* SUB-PAYER 1: CASH / DIRECT BILLING */}
              {selectedPayerType === "Cash" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-amber-900 uppercase block tracking-widest text-amber-700">🪙 Self-Pay Direct settlement</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase">Process Fast-Track Cash Billing</h3>
                    
                    <div className="space-y-3.5">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-700">
                        <p className="flex justify-between font-bold">
                          <span>Patient UHID Pointer:</span>
                          <span className="text-slate-900">{activePatientObj.id}</span>
                        </p>
                        <p className="flex justify-between font-bold">
                          <span>Patient Fullname:</span>
                          <strong className="text-slate-950">{activePatientObj.name}</strong>
                        </p>
                        <p className="flex justify-between">
                          <span>Standard Discount Mode:</span>
                          <strong className="text-green-600">5% Instant Direct Payment Incentive</strong>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Receipt Target Payment Gateway Choice</label>
                        <select 
                          value={cashPayMode} 
                          onChange={(e) => setCashPayMode(e.target.value)}
                          className="w-full bg-slate-50 border text-xs font-bold px-3 py-2.5 rounded-lg text-slate-800"
                        >
                          <option value="Direct Credit Card Pro">Direct Credit Card Pro (HDFC Merchant)</option>
                          <option value="UPI Spark Direct">UPI Spark Direct QR Code scan</option>
                          <option value="Sovereign Cash Reserves">Sovereign Cash Hand-over</option>
                          <option value="Direct Real-Time Bank RTGS">Direct Real-Time Bank RTGS / NEFT Transfer</option>
                        </select>
                      </div>

                      <button
                        onClick={triggerCashDirectSettle}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                      >
                        <DollarSign className="h-4 w-4" /> Finalize Direct Self-Pay Settle
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase">Direct Cash Receipt Audit Ledger</h3>
                    <div className="overflow-x-auto text-[11px] font-medium text-slate-700">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-[9.5px] uppercase font-bold text-slate-400">
                            <th className="p-2.5">Receipt #</th>
                            <th className="p-2.5">Patient</th>
                            <th className="p-2.5 text-right">Gross Total</th>
                            <th className="p-2.5 text-right">Cash disc</th>
                            <th className="p-2.5 text-right text-slate-900">Paid Sum</th>
                            <th className="p-2.5">Pay Mode</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-mono font-bold">
                          {cashDirectSettleLog.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="p-2.5 text-indigo-700">{log.id}</td>
                              <td className="p-2.5 font-sans font-bold text-slate-900">{log.name}</td>
                              <td className="p-2.5 text-right">₹{log.gross.toLocaleString()}</td>
                              <td className="p-2.5 text-right text-emerald-600">-₹{log.discount.toLocaleString()}</td>
                              <td className="p-2.5 text-right text-indigo-950 font-black">₹{log.settled.toLocaleString()}</td>
                              <td className="p-2.5 font-sans font-semibold text-slate-500 text-[9.5px]">{log.payMode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-PAYER 2: PRIVATE TPA INSURANCE WORKFLOW */}
              {selectedPayerType === "TPA" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-blue-900 uppercase block tracking-widest text-blue-600">🛡️ Insurance Pre-Authorizations</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase">Dispatch Claim Validation Packet</h3>
                    
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Pre-Auth Carrier</label>
                          <select 
                            value={activePreAuthCarrier} 
                            onChange={(e) => setActivePreAuthCarrier(e.target.value)}
                            className="w-full bg-slate-50 border text-xs px-2 py-2 rounded-lg font-bold"
                          >
                            <option value="STAR">Star Insurance Ltd</option>
                            <option value="TATA">Tata AIG Premium</option>
                            <option value="ICICI">ICICI Lombard Pro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Diagnoses ICD-10 Code</label>
                          <input 
                            type="text" 
                            value={preAuthIcdCode}
                            onChange={(e) => setPreAuthIcdCode(e.target.value)}
                            className="w-full bg-slate-50 border text-xs px-2.5 py-2 rounded-lg font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50/60 border border-blue-200.5 p-3.5 rounded-xl text-[10px] text-blue-950 leading-relaxed space-y-1">
                        <strong className="font-extrabold text-blue-900 block uppercase text-[9px]">TPA Real-Time Integrity Validations:</strong>
                        <p>✓ Patient Active Cashless Policy verified on grid.</p>
                        <p>✓ Co-payment Ratio calculated automatically based on regulatory limits.</p>
                        <p>⚖️ Net insurer responsibility estimated cleanly via PMS engines.</p>
                      </div>

                      <button
                        onClick={dispatchInsuranceClaim}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                      >
                        <ShieldPlus className="h-4 w-4" /> Dispatch Corporate Claim to TPA
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase">Active TPA Clinical Claim Trackers</h3>
                    <div className="overflow-x-auto text-[11px] font-medium text-slate-700">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-[9.5px] uppercase font-bold text-slate-500">
                            <th className="p-2.5">Claim ID</th>
                            <th className="p-2.5">Insured Patient</th>
                            <th className="p-2.5">Carrier</th>
                            <th className="p-2.5 text-right">Cover Paid</th>
                            <th className="p-2.5 text-right">Co-Pay Pay</th>
                            <th className="p-2.5">Workflow Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-semibold text-slate-800">
                          {tpaClaimLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono text-indigo-700 font-bold">{log.id}</td>
                              <td className="p-2.5 font-bold">{log.name}</td>
                              <td className="p-2.5 font-mono text-[10px]">{log.carrier}</td>
                              <td className="p-2.5 text-right font-mono text-emerald-800 font-black">₹{log.cover.toLocaleString()}</td>
                              <td className="p-2.5 text-right font-mono text-rose-800 font-bold">₹{log.patientPay.toLocaleString()}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase inline-block ${
                                  log.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-PAYER 3: CORPORATE CREDIT SETTLEMENT */}
              {selectedPayerType === "Corporate" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Management of Sponsor Patients, Allocation & Payables */}
                  <div className="lg:col-span-6 space-y-6 animate-fadeIn">
                    {/* Patient Selector and Configuration Row */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] font-black text-indigo-900 uppercase block tracking-widest flex items-center gap-1.5 text-indigo-600">
                        <Building2 className="h-4 w-4" /> Corporate Patient Board & Allocation Desk
                      </span>
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Select Corporate Sponsor Patient</label>
                        <select
                          value={focusedPatientId}
                          onChange={(e) => setFocusedPatientId(e.target.value)}
                          className="w-full bg-white border text-xs px-3 py-2.5 rounded-lg font-bold shadow-2xs"
                        >
                          {activeFocusPatients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-950 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-[11.5px]">Assigned Corporate Sponsor: <strong>{selectedCorpEmployer}</strong></p>
                          <p className="text-[10px] text-indigo-700">Pre-authorized Credit Coverage Active & Verified</p>
                        </div>
                        <span className="bg-[#003580] text-white text-[9.5px] font-black font-mono px-2 py-0.5 rounded uppercase">Verified</span>
                      </div>
                    </div>

                    {/* Wages and Material Supply Overhead Allocator Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                      <div className="border-b pb-2 flex justify-between items-center text-xs">
                        <h4 className="font-black text-slate-900 uppercase flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-amber-600" /> Apply Sponsor-linked Payables
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">NABH Compliant</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                        Add and apply doctor consultation fees, nursing OT wages, or supplier material/implant costs to be billed back to the sponsor against their services or material supply used for this patient.
                      </p>

                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Expense/Payable Category</label>
                            <select
                              value={payeeTypeInput}
                              onChange={(e) => setPayeeTypeInput(e.target.value as any)}
                              className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-bold font-sans"
                            >
                              <option value="Doctor Wage">🩺 Doctor Professional Fees (Wages)</option>
                              <option value="Staff Wage">🧑‍⚕️ Staff & Nursing Coordinator Wages</option>
                              <option value="Supplier Charge">📦 Supplier Material/Implant Charges</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Payee Name / Vendor Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Dr. Arvind, Staff Sneha, AstraZeneca Co"
                              value={payeeNameInput}
                              onChange={(e) => setPayeeNameInput(e.target.value)}
                              className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Service / Material Used Description</label>
                            <input
                              type="text"
                              placeholder="e.g. Surgeon Procedure Fee, Implant suture pack, Special consultations"
                              value={serviceDescInput}
                              onChange={(e) => setServiceDescInput(e.target.value)}
                              className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Expense/Amount (₹)</label>
                            <input
                              type="number"
                              placeholder="12000"
                              value={payableAmountInput}
                              onChange={(e) => setPayableAmountInput(e.target.value)}
                              className="w-full bg-slate-50 border text-xs font-mono font-bold px-2.5 py-2.5 rounded-lg"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCorporatePayable(focusedPatientId)}
                          className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-3 rounded-lg cursor-pointer flex justify-center items-center gap-1.5 transition"
                        >
                          <Plus className="h-4 w-4" /> Apply Dynamic Overhead Surcharge
                        </button>
                      </div>

                      {/* Staging Applied Payables Breakdown for Patient */}
                      <div className="border-t pt-3 space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Applied Overheads for {activePatientObj?.name || "Patient"}:</span>
                        {(appliedPayablesMap[focusedPatientId] || []).length > 0 ? (
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                            {(appliedPayablesMap[focusedPatientId] || []).map(item => (
                              <div key={item.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-[10.5px]">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase text-white ${
                                      item.type === "Doctor Wage" ? "bg-cyan-700" : item.type === "Staff Wage" ? "bg-indigo-600" : "bg-amber-600"
                                    }`}>{item.type}</span>
                                    <span className="font-bold text-slate-900">{item.payeeName}</span>
                                  </div>
                                  <p className="text-slate-500 text-[10px] mt-0.5">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-extrabold text-indigo-950">₹{item.amount.toLocaleString()}</span>
                                  <button
                                    onClick={() => handleDeleteCorporatePayable(focusedPatientId, item.id)}
                                    className="text-rose-500 hover:text-rose-700 font-extrabold p-1 cursor-pointer"
                                    title="Delete overhead"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No custom payables or material supplies applied against this corporate folder yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Authorize & Dispatch Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] font-black text-indigo-900 uppercase block tracking-widest text-indigo-600">🏢 Credit Sponsorship Settler</span>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Issue Invoice & Bind Applied Ledger</h4>
                      
                      <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Employer Partner</label>
                            <select 
                              value={selectedCorpEmployer} 
                              onChange={(e) => setSelectedCorpEmployer(e.target.value)}
                              className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-bold"
                            >
                              <option value="TATA">Tata Motors Private</option>
                              <option value="STAR">Star Alliance Group</option>
                              <option value="ICICI">ICICI Corporate Desk</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Sponsor Credit Lim</label>
                            <span className="block text-xs font-bold font-mono text-indigo-700 bg-slate-50 border px-2.5 py-2.5 rounded-lg">₹25,00,000 Active</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Authorized Employer Signatory</label>
                          <input 
                            type="text" 
                            value={corpApprovedBy}
                            onChange={(e) => setCorpApprovedBy(e.target.value)}
                            className="w-full bg-slate-50 border text-xs font-semibold px-3 py-2.5 rounded-lg"
                          />
                        </div>

                        {/* Calculations summary preview */}
                        <div className="bg-slate-50 p-3.5 rounded-lg text-[11px] font-sans border space-y-1.5 text-slate-700">
                          <div className="flex justify-between">
                            <span>Base Medical Svc Bill Cost:</span>
                            <span className="font-mono">₹{(activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-indigo-700 font-semibold">
                            <span>Applied Doctor/Staff Wages & Supply Costs:</span>
                            <span className="font-mono">+₹{((appliedPayablesMap[focusedPatientId] || []).reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-1.5 mt-1 flex justify-between font-extrabold text-indigo-950 text-xs">
                            <span>Total Corporate Invoice Value:</span>
                            <span className="font-mono">₹{((activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0)) + ((appliedPayablesMap[focusedPatientId] || []).reduce((acc, curr) => acc + curr.amount, 0))).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={emitCorporateCreditInvoice}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                        >
                          <Landmark className="h-4 w-4" /> Issue Periodic Credit Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Settlements Ledger & Subsequent Payment Clearance */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                      <h3 className="text-xs font-black text-slate-900 uppercase">Corporate Credit Settlements Ledger</h3>
                      <div className="overflow-x-auto text-[11px] font-medium text-slate-700">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b text-[9.5px] uppercase font-bold text-slate-400">
                              <th className="p-2.5">Invoice ID</th>
                              <th className="p-2.5">Employer Co</th>
                              <th className="p-2.5">Patient Employee</th>
                              <th className="p-2.5 text-right font-bold">Invoice Balance</th>
                              <th className="p-2.5 text-right">Status / Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-semibold">
                            {corporateInvoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-mono text-indigo-705 text-indigo-600 font-bold">{inv.id}</td>
                                <td className="p-2.5 font-bold text-slate-900">{inv.company}</td>
                                <td className="p-2.5">{inv.patient}</td>
                                <td className="p-2.5 text-right font-mono font-extrabold text-indigo-950">
                                  {inv.sumCredit}
                                </td>
                                <td className="p-2.5 text-right">
                                  {inv.status === "Settled Credit Ledger" ? (
                                    <span className="bg-emerald-50 border border-emerald-250 text-emerald-850 text-emerald-800 px-2.5 py-1 rounded text-[8.5px] font-black uppercase">
                                      ✓ Settled Cleared
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedClearanceInvoiceId(inv.id);
                                        setClearancePayAmount(inv.amountValue.toString());
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-755 text-white font-black text-[9.5px] py-1 px-2.5 rounded cursor-pointer select-none"
                                    >
                                      Settle Clearance
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PAYMENT COMPLIANCE / CLEARANCE INTERACTIVE CARD PANEL */}
                    {selectedClearanceInvoiceId && (
                      <div className="bg-amber-50/50 border border-amber-300 rounded-2xl p-5 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[10px] font-black text-amber-900 uppercase block tracking-wider flex items-center gap-1.5 font-bold">
                            <Coins className="h-4 w-4 text-amber-600" /> Record Corporate payment clearance
                          </span>
                          <button
                            onClick={() => setSelectedClearanceInvoiceId(null)}
                            className="bg-white border border-amber-200 rounded p-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5 text-amber-900" />
                          </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <p className="font-semibold text-slate-800 text-[11.5px]">
                            Recording Clearance reference for Invoice: <strong className="font-mono text-indigo-700">{selectedClearanceInvoiceId}</strong>
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Cleared Paid Amount (₹)</label>
                              <input
                                type="number"
                                value={clearancePayAmount}
                                onChange={(e) => setClearancePayAmount(e.target.value)}
                                className="w-full bg-white border text-xs px-2.5 py-2 rounded-lg font-mono font-bold shadow-2xs text-[#003580]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Clearance Date</label>
                              <input
                                type="date"
                                value={clearanceDate}
                                onChange={(e) => setClearanceDate(e.target.value)}
                                className="w-full bg-white border text-xs px-2.5 py-2 rounded-lg font-semibold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">UTR Bank transaction Reference / Receipt ID</label>
                            <input
                              type="text"
                              placeholder="e.g. CORP-UTR-84931-20"
                              value={clearanceTxRef}
                              onChange={(e) => setClearanceTxRef(e.target.value)}
                              className="w-full bg-white border text-xs px-3 py-2.5 rounded-lg shadow-2xs font-mono text-slate-700 uppercase"
                            />
                          </div>

                          <button
                            onClick={() => handleCorporateClearance(selectedClearanceInvoiceId)}
                            className="w-full bg-[#003580] text-white hover:bg-slate-900 font-extrabold py-2.5 rounded-lg text-xs cursor-pointer select-none"
                          >
                            ✓ Process & release Wages to Doctors/Staff/Suppliers
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUBSIDIARY ACCOUNTING LEDGER & AUDIT TRAIL REPORTS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                      <span className="text-[10px] font-black text-emerald-950 uppercase block tracking-widest flex items-center gap-1.5 text-emerald-700">
                        <FileSpreadsheet className="h-4 w-4" /> Corporate Payables Release Audit Ledger
                      </span>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                        Below are the cleared entries showing disbursed professional fees to consultants, coordinators, and implants vendors after payment release from corporate.
                      </p>

                      <div className="space-y-4 text-xs font-sans font-medium">
                        {corporateInvoices.filter(inv => inv.status === "Settled Credit Ledger").map(inv => {
                          const payablesTotal = inv.payablesList?.reduce((acc, c) => acc + c.amount, 0) || 0;
                          const baseFee = inv.amountValue - payablesTotal;
                          
                          // Proportional distribution factor (e.g. if partial clearance occurred)
                          const cleanPayFactor = inv.clearedAmount ? (inv.clearedAmount / inv.amountValue) : 1;

                          return (
                            <div key={inv.id} className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/5 space-y-3">
                              <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <div>
                                  <span className="font-mono text-indigo-700 font-black text-xs block">{inv.id} (Disbursed Voucher)</span>
                                  <span className="text-[9.5px] text-slate-500 font-bold">Employer: {inv.company} • Employee: {inv.patient}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-extrabold text-emerald-700 block">Released: ₹{(inv.clearedAmount || inv.amountValue).toLocaleString()}</span>
                                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black font-mono">UTR: {inv.transactionRef || "SYSTEM-SETTLE"}</span>
                                </div>
                              </div>

                              <div className="space-y-2 mt-2">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Accounting Allocation breakdown:</span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                                  {/* Doctor professional wages */}
                                  {inv.payablesList?.filter(p => p.type === "Doctor Wage").map(payable => (
                                    <div key={payable.id} className="p-2 border border-slate-100 rounded-lg bg-white shadow-3xs">
                                      <div className="flex justify-between font-semibold">
                                        <span className="text-cyan-800 font-bold">🩺 Doc Wage: {payable.payeeName}</span>
                                        <span className="font-mono font-extrabold">₹{Math.round(payable.amount * cleanPayFactor).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                        <span>Details: {payable.description}</span>
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded text-[8px]">✓ Disbursed HPR</span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Staff duties wages */}
                                  {inv.payablesList?.filter(p => p.type === "Staff Wage").map(payable => (
                                    <div key={payable.id} className="p-2 border border-slate-100 rounded-lg bg-white shadow-3xs">
                                      <div className="flex justify-between font-semibold">
                                        <span className="text-indigo-800 font-bold font-semibold">🧑‍⚕️ Staff Fee: {payable.payeeName}</span>
                                        <span className="font-mono font-extrabold font-bold">₹{Math.round(payable.amount * cleanPayFactor).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                        <span>Details: {payable.description}</span>
                                        <span className="text-indigo-700 font-black bg-indigo-50 px-1 rounded text-[8px]">✓ Paid Payroll</span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Supplier material charges */}
                                  {inv.payablesList?.filter(p => p.type === "Supplier Charge").map(payable => (
                                    <div key={payable.id} className="p-2 border border-slate-100 rounded-lg bg-white shadow-3xs">
                                      <div className="flex justify-between font-semibold">
                                        <span className="text-amber-800 font-bold">📦 Supplier: {payable.payeeName}</span>
                                        <span className="font-mono font-extrabold">₹{Math.round(payable.amount * cleanPayFactor).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                        <span>Details: {payable.description}</span>
                                        <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded text-[8px]">✓ Cleared EFT</span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Net Hospital Treasury share */}
                                  <div className="p-2 border border-[#003580]/10 rounded-lg bg-indigo-50/10 shadow-3xs col-span-1 md:col-span-2">
                                    <div className="flex justify-between font-semibold text-slate-900">
                                      <span className="font-bold text-indigo-950 flex items-center gap-1 font-semibold">🏦 Net Hospital Treasury retainment</span>
                                      <span className="font-mono font-extrabold text-[#003580]">₹{Math.round(baseFee * cleanPayFactor).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9.5px] text-slate-450 text-slate-500 mt-0.5">Retained central clinical care revenue share from corporate payment settlement clearances.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {corporateInvoices.filter(inv => inv.status === "Settled Credit Ledger").length === 0 && (
                          <div className="text-center p-3 border rounded border-dashed text-slate-400 text-xs italic">
                            No corporate invoice settled today yet. Settle an active invoice above to run the payout accounting allocations.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-PAYER 4: EMBASSY / CO-PAYS / LIAISON */}
              {selectedPayerType === "Embassy" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-rose-900 uppercase block tracking-widest text-rose-700">🏛️ Imperial Embassy Liaison</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase">Diplomatic Guarantee Registry</h3>
                    
                    <form onSubmit={addEmbassyGuarantee} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Liaison Nationality</label>
                          <input 
                            type="text" 
                            value={embNational}
                            onChange={(e) => setEmbNational(e.target.value)}
                            className="w-full bg-slate-50 border text-xs px-2 py-2 rounded-lg font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Consulate Interpreter</label>
                          <select 
                            value={embInterpreterNeeded} 
                            onChange={(e) => setEmbInterpreterNeeded(e.target.value)}
                            className="w-full bg-slate-50 border text-xs px-2 py-2 rounded-lg font-bold"
                          >
                            <option value="Yes (Japanese Liaison)">Yes (Japanese Liaison)</option>
                            <option value="Yes (French Liaison)">Yes (French Liaison)</option>
                            <option value="Not Required">Language Barrier None</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Inbound Currency Preference</label>
                          <select 
                            value={embCurrencyPreference} 
                            onChange={(e: any) => setEmbCurrencyPreference(e.target.value)}
                            className="w-full bg-slate-50 border text-xs px-2 py-2 rounded-lg font-bold"
                          >
                            <option value="USD">USD ($) United States</option>
                            <option value="EUR">EUR (€) Eurozone</option>
                            <option value="GBP">GBP (£) Sterling</option>
                            <option value="INR">INR (₹) India sovereign</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Exchange Rates</label>
                          <span className="block text-xs font-mono font-bold bg-slate-50 border px-2 py-2 rounded-lg text-slate-700">
                            {embCurrencyPreference === "USD" ? "1 USD = ₹83.50" : embCurrencyPreference === "EUR" ? "1 EUR = ₹90.10" : "Fixed Rate Matrix"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-700 hover:bg-rose-800 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                      >
                        <PlaneTakeoff className="h-4 w-4" /> Link Embassy Diplomatic Guarantee
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase">Diplomatic Consular Guarantee Letters</h3>
                    <div className="space-y-2.5">
                      {embassyGuarantees.map(g => (
                        <div key={g.id} className="border border-slate-200 hover:border-slate-300 p-3.5 rounded-xl bg-white flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 font-black text-slate-950 text-xs">
                              <span>🗺️</span>
                              <span>{g.patient}</span>
                              <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.2 rounded font-mono uppercase">{g.nationality}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold grid grid-cols-2 gap-x-2.5 mt-1">
                              <p>Liaison Currency: <strong className="font-mono text-slate-800">{g.currency}</strong></p>
                              <p>Interpreter Unit: <strong className="text-slate-800">{g.interpreter}</strong></p>
                              <p className="col-span-2 text-[9.5px] text-indigo-700">Escort: {g.escortsName}</p>
                            </div>
                          </div>

                          <span className="bg-emerald-50 border border-emerald-250 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded text-[10px] text-right shrink-0">
                            Verified Value: {g.currency === "USD" ? "$" : g.currency === "EUR" ? "€" : "₹"}{g.guaranteeAmt.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-PAYER 5: SUBSCRIPTION PLANS & MEMBERSHIP MEMBERS */}
              {selectedPayerType === "Subscription" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-violet-900 uppercase block tracking-widest text-violet-700">💳 Membership Clubs &amp; Plans</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase">Enroll Member Active Insurance</h3>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Subscription Club Tier</label>
                        <select 
                          value={selectedNewSubscriptionId} 
                          onChange={(e) => setSelectedNewSubscriptionId(e.target.value)}
                          className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-bold"
                        >
                          {MOCK_SUBSCRIPTION_PLANS.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name} (₹{plan.yearlyFee.toLocaleString()}/yr)</option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const matchedPlan = MOCK_SUBSCRIPTION_PLANS.find(p => p.id === selectedNewSubscriptionId);
                        if (!matchedPlan) return null;
                        return (
                          <div className="bg-violet-50 border border-violet-205 p-3.5 rounded-xl space-y-1.5 text-[10.5px]">
                            <strong className="text-violet-900 font-extrabold uppercase text-[9px]">Plan Autodiscounts:</strong>
                            <p className="flex justify-between font-medium">
                              <span>Pathology/Radiology:</span>
                              <strong className="text-slate-900">{matchedPlan.discountOnDiagnostics}% Off</strong>
                            </p>
                            <p className="flex justify-between font-medium">
                              <span>Specialist consultations:</span>
                              <strong className="text-slate-900">{matchedPlan.discountOnConsultations}% Off</strong>
                            </p>
                            <div className="pt-1.5 mt-1 border-t space-y-1 text-slate-600 font-semibold text-[9.5px]">
                              {matchedPlan.perks.map((p, i) => (
                                <p key={i} className="flex items-center gap-1">★ {p}</p>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <button
                        onClick={handleEnrollSubscription}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                      >
                        <Plus className="h-4 w-4" /> Finalize Subscription Membership Enrollment
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase">Subscription Membership Ledger</h3>
                    <div className="space-y-2">
                      {patientSubscriptionLedger.map(sub => (
                        <div key={sub.id} className="bg-slate-50/50 hover:bg-slate-50 border p-3 border-slate-200.5 rounded-xl flex items-center justify-between gap-4 font-semibold text-xs transition">
                          <div>
                            <strong className="text-slate-950 font-black block">{sub.name}</strong>
                            <span className="text-[10px] text-violet-700 block">{sub.schemeName}</span>
                          </div>
                          
                          <div className="text-right shrink-0 space-y-1">
                            <span className="bg-violet-100 text-violet-800 text-[8px] font-black uppercase px-2 py-0.5 rounded block">
                              {sub.activeStatus}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold block">
                              Dues: ₹{sub.yearlyFee}/yr Paid
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-PAYER 6: AYUSHMAN CLAIM CODES */}
              {selectedPayerType === "Ayushman" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-semibold">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-emerald-900 uppercase block tracking-widest text-emerald-700">🦁 Cashless Ayushman PM-JAY</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase">Select National Package Claims Codes</h3>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Diagnostic / Procedure Mismatch check</label>
                        <select 
                          value={ayushmanSelectedProcedureId} 
                          onChange={(e) => setAyushmanSelectedProcedureId(e.target.value)}
                          className="w-full bg-slate-50 border text-xs px-2.5 py-2.5 rounded-lg font-bold"
                        >
                          {tariffCatalog.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const matchedItem = tariffCatalog.find(p => p.id === ayushmanSelectedProcedureId);
                        if (!matchedItem) return null;
                        return (
                          <div className="bg-emerald-50 border border-emerald-205 p-3.5 rounded-xl space-y-2 text-[10.5px] text-emerald-950 leading-relaxed">
                            <strong className="text-emerald-900 font-extrabold uppercase text-[9px] block">NHA Contract Ceilings:</strong>
                            <p className="flex justify-between font-bold">
                              <span>Department/Category:</span>
                              <span>{matchedItem.category}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Regular Commercial Rate:</span>
                              <span className="font-mono">₹{matchedItem.baseRate.toLocaleString()}</span>
                            </p>
                            <p className="flex justify-between border-t border-emerald-250 pt-1.5 font-bold text-emerald-900">
                              <span>NHA Maximized Cashless Claim Code Rate:</span>
                              <strong className="font-mono text-xs">
                                {matchedItem.cghsRate > 0 ? `₹${matchedItem.cghsRate.toLocaleString()}` : "Not Covered (Self-Pay only)"}
                              </strong>
                            </p>
                          </div>
                        );
                      })()}

                      <button
                        onClick={dispatchAyushmanClaimCode}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition select-none"
                      >
                        <ShieldCheck className="h-4 w-4" /> Submit Cashless Claim Package to NHA
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase">National Health Claim Dispatch Queue</h3>
                    <div className="overflow-x-auto text-[11px] font-medium text-slate-750 text-slate-700">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-[9.5px] uppercase font-bold text-slate-500">
                            <th className="p-2.5">Claim Ref</th>
                            <th className="p-2.5">Beneficiary</th>
                            <th className="p-2.5">National Code</th>
                            <th className="p-2.5 text-right">Standard Rate</th>
                            <th className="p-2.5 text-right">CGHS Package Claim</th>
                            <th className="p-2.5">Audit Queue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-mono font-bold text-slate-800">
                          {ayushmanDispatches.map(claim => (
                            <tr key={claim.claimId} className="hover:bg-slate-50">
                              <td className="p-2.5 text-indigo-700 font-bold">{claim.claimId}</td>
                              <td className="p-2.5 font-sans font-bold text-slate-900">{claim.patientName}</td>
                              <td className="p-2.5">{claim.nationalCode}</td>
                              <td className="p-2.5 text-right font-medium text-slate-500">₹{claim.baseRate.toLocaleString()}</td>
                              <td className="p-2.5 text-right font-black text-emerald-800">₹{claim.cghsPackageClaim.toLocaleString()}</td>
                              <td className="p-2.5">
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 font-sans font-black px-1.5 py-0.5 rounded text-[8.5px] uppercase">
                                  {claim.dispatchStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* WORKSPACE 2: ADVANCED PRICING CONTROL CENTER */}
        {activeWorkspace === "advanced-pricing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tariff Config Column Left */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Dynamic Rates Adjuster Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-black text-rose-900 uppercase block tracking-wider text-rose-700">⚙️ Dynamic Tariff Modifiers</span>
                <h3 className="text-xs font-black text-slate-950 uppercase">Flexible Dynamic Tariff Controls</h3>
                
                <div className="p-4 bg-slate-50 rounded-xl space-y-4 text-xs font-semibold text-slate-750">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Monsoon / Flu High-Demand Season Markup</label>
                    <div className="flex gap-2">
                      {[
                        { id: "standard", desc: "No Markup", fact: "1.0x" },
                        { id: "monsoon", desc: "Monsoon Dengue Surcharge (+12%)", fact: "1.12x" },
                        { id: "festive_peak", desc: "Winter High-Occupancy Markup (+8%)", fact: "1.08x" }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setActiveSeason(s.id as any)}
                          className={`flex-1 px-3 py-2 text-[10px] font-black border text-center rounded-lg transition shrink-0 cursor-pointer ${
                            activeSeason === s.id 
                              ? "bg-slate-950 text-white border-slate-950 shadow-sm" 
                              : "bg-white hover:bg-slate-150 text-slate-700"
                          }`}
                        >
                          <p>{s.fact}</p>
                          <p className="text-[8px] font-semibold text-slate-400 leading-tight">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 select-none">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Weekend &amp; Night Emergency Surcharge (+15%)</span>
                      <p className="text-[9.5px] text-slate-400 font-semibold">Taxis and operations during late hours.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={useWeekendMarkup}
                      onChange={(e) => setUseWeekendMarkup(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-slate-900 border-slate-300 rounded cursor-pointer"
                    />
                  </div>

                  {/* Pricing Factor multiplier visualizer */}
                  <div className="bg-indigo-900 text-white rounded-xl p-3.5 select-none font-mono text-[10.5px]">
                    <div className="flex justify-between items-center text-xs">
                      <span>Live Combined Pricing Multiplier:</span>
                      <strong className="text-sm text-[#00ebc7]">x{getMultiplier().toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultant Tiers Specific Pricing */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-black text-rose-900 uppercase block tracking-wider text-rose-700">🩺 Professional Doctor Grade Settle Card</span>
                <h3 className="text-xs font-black text-slate-955 uppercase">Consultant-Specific Specific Pricing</h3>
                
                <div className="space-y-2.5">
                  {[
                    { grade: "resident" as const, name: "Resident Surgeon (General Outpatient Duty)", mult: "1.0x Factor Rate", cost: "₹1,500 Base Consult" },
                    { grade: "specialist" as const, name: "Senior Consultant Surgeon Advisor", mult: "1.5x Premium Rate", cost: "₹2,250 Base Consult" },
                    { grade: "director" as const, name: "Distinguished Department Director Supervisor", mult: "2.5x Executive Rate", cost: "₹3,750 Base Consult" },
                    { grade: "invited_global" as const, name: "Invited Global Super-Specialist Guest", mult: "4.0x Ultra-Equity Rate", cost: "₹6,000 Special Consult" }
                  ].map(grade => {
                    const isSelected = enrolledConsultantGrade === grade.grade;
                    return (
                      <div 
                        key={grade.grade}
                        onClick={() => setEnrolledConsultantGrade(grade.grade)}
                        className={`cursor-pointer transition rounded-xl p-3 border leading-tight flex justify-between items-center ${
                          isSelected ? "border-indigo-650 bg-indigo-50/50 scale-[1.01]" : "hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <strong className="text-slate-900 text-xs font-black block">{grade.name}</strong>
                          <span className="text-[10px] text-slate-500 font-semibold">{grade.cost}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                        }`}>
                          {grade.mult}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Custom Tariff Catalog Ledger Right */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Add Custom Department Rate */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-950 uppercase">Add New Department Custom Tariff</h3>
                <form onSubmit={handleAddCustomPriceRate} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      placeholder="Service / Procedure description"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      className="w-full bg-slate-50 border text-xs px-2.5 py-2 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <select 
                      value={newCustomCategory} 
                      onChange={(e: any) => setNewCustomCategory(e.target.value)}
                      className="w-full bg-slate-50 border text-xs px-2.5 py-2 rounded-lg font-semibold"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Procedure">Procedure</option>
                    </select>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      placeholder="Baseline Rate"
                      value={newCustomBase}
                      onChange={(e) => setNewCustomBase(e.target.value)}
                      className="w-full bg-slate-50 border text-xs px-2.5 py-2 rounded-lg font-semibold font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-4 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2 rounded-lg cursor-pointer transition select-none flex justify-center items-center gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Register Custom baseline Tariff
                  </button>
                </form>
              </div>

              {/* Dynamic Applied Price matrix table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-3 select-none">
                  <div>
                    <h3 className="text-xs font-black text-slate-950 uppercase">Active Dynamic Pricing matrix</h3>
                    <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                      Baseline rates automatically adjusted by the Live Multiplier Factor (<b>x{getMultiplier().toFixed(2)}</b>).
                    </p>
                  </div>
                  <span className="text-[9.5px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-black font-mono">LIVE UPDATE</span>
                </div>

                <div className="overflow-x-auto text-[11px] font-semibold text-slate-700">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[9.5px] uppercase font-bold text-slate-500">
                        <th className="p-3">Svc Code</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Clinical Description</th>
                        <th className="p-3 text-right">Baseline Price</th>
                        <th className="p-3 text-right text-rose-800">Dynamic Multiplied Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-800">
                      {tariffCatalog.map(item => {
                        const multipliedCost = Math.round(item.baseRate * getMultiplier());
                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-indigo-700 font-bold">{item.id}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8.5px] font-black uppercase px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-950">{item.name}</td>
                            <td className="p-3 text-right font-mono text-slate-400">₹{item.baseRate.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono font-black text-indigo-950 text-xs">
                              ₹{multipliedCost > 0 ? multipliedCost.toLocaleString() : "Contact Billing Desk"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Procedure Bundles Engine */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-black text-rose-900 uppercase block tracking-wider text-rose-700">📦 Procedural and Surgical Bundles</span>
                <h3 className="text-xs font-black text-slate-955 uppercase">Procedure Bundles Engine</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 select-none">
                    {MOCK_PROCEDURE_BUNDLES.map(bundle => {
                      const isSelected = selectedBundleId === bundle.id;
                      return (
                        <div 
                          key={bundle.id}
                          onClick={() => setSelectedBundleId(bundle.id)}
                          className={`cursor-pointer transition rounded-xl p-3 border flex flex-col justify-between min-h-[150px] ${
                            isSelected ? "border-rose-500 bg-rose-500/10 shadow-xs" : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-rose-700 font-black">SAVE {bundle.savingRatio}%</span>
                              <span className="text-slate-400 font-bold">{bundle.id}</span>
                            </div>
                            <strong className="text-xs font-bold text-slate-900 block mt-1 leading-snug">{bundle.name}</strong>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-snug">{bundle.description}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-dashed mt-2 select-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Bundled Flat-Price</span>
                            <strong className="text-xs font-black font-mono text-slate-950">₹{bundle.bundleCost.toLocaleString()}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 flex flex-wrap justify-between items-center gap-2 select-none">
                    <span className="text-xs text-slate-650">
                      Target Assignees: <strong>{activePatientObj.name}</strong> (UHID: {activePatientObj.id})
                    </span>
                    <button
                      onClick={handleAssignBundle}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <PlusCircle className="h-4 w-4" /> Link Active Surgical Bundle to Bed Ledger
                    </button>
                  </div>

                  {/* Assigned Packages Ledger Display */}
                  {assignedBundlesList.filter(b => b.patientId === activePatientObj.id).length > 0 && (
                    <div className="border-t pt-4 mt-2">
                      <span className="text-[10px] uppercase font-black text-indigo-900 block tracking-wider mb-2">
                        Linked Packages Ledger ({activePatientObj.name})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {assignedBundlesList.filter(b => b.patientId === activePatientObj.id).map(ass => (
                          <div key={ass.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs font-semibold gap-3 hover:bg-slate-100 transition duration-150">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-indigo-700 font-bold tracking-tight">#{ass.id} &bull; Mapped {ass.date}</span>
                              <p className="text-slate-900 font-bold leading-normal">{ass.bundleName}</p>
                            </div>
                            <span className="font-mono text-xs font-black text-indigo-950 shrink-0">
                              ₹{ass.cost.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* WORKSPACE 3: SMART SPLIT-BILLING & ESCROW ENGINE */}
        {activeWorkspace === "smart-billing" && (
          <div className="space-y-6">
            
            {/* Split Billing Worksheet */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-black text-rose-900 uppercase block tracking-wider text-rose-700">✂️ Multiple Payer splits</span>
              <div className="flex justify-between items-center border-b pb-3 select-none">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase">Itemized Bill-Splitting Worksheet</h3>
                  <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
                    Allocate proportions of individual clinical services to Primary TPA Insurance, Secondary HR Corporate sponsorship, or Direct Cash.
                  </p>
                </div>
                <span className="text-[9.5px] bg-slate-100 border text-slate-705 px-2.5 py-0.5 rounded font-black font-mono">BETA</span>
              </div>

              {/* Form to Add New Service Item to Bill */}
              <form onSubmit={handleAddBillLineItem} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-end gap-3.5">
                <div className="flex-1 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">New Billing Service/Item Description</label>
                  <input
                    type="text"
                    placeholder="e.g. ICU Monitor Charges, Ventilator Surcharge, Consultant Fee..."
                    value={newBillSvcName}
                    onChange={(e) => setNewBillSvcName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold"
                  />
                </div>
                <div className="w-full md:w-[150px] space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Raw Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newBillSvcCost}
                    onChange={(e) => setNewBillSvcCost(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs font-mono font-bold px-3 py-2.5 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-rose-650 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition select-none shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </form>

              <div className="overflow-x-auto text-[11px] font-semibold text-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border @border border-b text-[9px] uppercase font-bold text-slate-400">
                      <th className="p-3">Item Name</th>
                      <th className="p-3 text-right">Raw baseline Svc Cost</th>
                      <th className="p-3 text-center">Insurance Share fraction</th>
                      <th className="p-3 text-center">Sponsor Corporate fraction</th>
                      <th className="p-3 text-center">Patient Cash copay</th>
                      <th className="p-3 text-right">Split Calculation Log</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono font-bold text-slate-800">
                    {activeBillItems.map(item => {
                      const insPart = Math.round(item.rawCost * item.splitRatio.insurance);
                      const corpPart = Math.round(item.rawCost * item.splitRatio.corporate);
                      const ptPart = Math.round(item.rawCost * item.splitRatio.patient);
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-black text-slate-950 text-xs w-[250px]">
                            {item.description}
                          </td>
                          <td className="p-3 text-right text-slate-500">₹{item.rawCost.toLocaleString()}</td>
                          
                          {/* Insurance split */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <select 
                                value={item.splitRatio.insurance} 
                                onChange={(e) => handleItemSplitChange(item.id, "insurance", parseFloat(e.target.value))}
                                className="bg-slate-100 border text-[10px] rounded px-1.5 py-1 text-slate-700 font-bold"
                              >
                                <option value="0.0">0%</option>
                                <option value="0.2">20%</option>
                                <option value="0.5">50%</option>
                                <option value="0.8">80%</option>
                                <option value="1.0">100%</option>
                              </select>
                              <span className="text-[10px] font-normal font-sans text-slate-400">({insPart > 0 ? `₹${insPart.toLocaleString()}` : "N/A"})</span>
                            </div>
                          </td>

                          {/* Corporate split */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <select 
                                value={item.splitRatio.corporate} 
                                onChange={(e) => handleItemSplitChange(item.id, "corporate", parseFloat(e.target.value))}
                                className="bg-slate-100 border text-[10px] rounded px-1.5 py-1 text-slate-705 text-slate-700 font-bold"
                              >
                                <option value="0.0">0%</option>
                                <option value="0.2">20%</option>
                                <option value="0.3">30%</option>
                                <option value="0.5">50%</option>
                                <option value="1.0">100%</option>
                              </select>
                              <span className="text-[10px] font-normal font-sans text-slate-400">({corpPart > 0 ? `₹${corpPart.toLocaleString()}` : "N/A"})</span>
                            </div>
                          </td>

                          {/* Patient Cash split */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <select 
                                value={item.splitRatio.patient} 
                                onChange={(e) => handleItemSplitChange(item.id, "patient", parseFloat(e.target.value))}
                                className="bg-slate-100 border text-[10px] rounded px-1.5 py-1 text-slate-705 text-slate-700 font-bold"
                              >
                                <option value="0.0">0%</option>
                                <option value="0.2">20%</option>
                                <option value="0.5">50%</option>
                                <option value="1.0">100%</option>
                              </select>
                              <span className="text-[10px] font-normal font-sans text-slate-405 text-slate-400">({ptPart > 0 ? `₹${ptPart.toLocaleString()}` : "N/A"})</span>
                            </div>
                          </td>

                          {/* Computed Splits visual */}
                          <td className="p-3 text-right">
                            <div className="text-[10px] space-y-0.5 text-right leading-tight">
                              {insPart > 0 && <p className="text-blue-800">TPA: ₹{insPart.toLocaleString()}</p>}
                              {corpPart > 0 && <p className="text-indigo-800">Corp: ₹{corpPart.toLocaleString()}</p>}
                              {ptPart > 0 && <p className="text-rose-800">Pt: ₹{ptPart.toLocaleString()}</p>}
                              <button 
                                onClick={() => settleBillLineFromEscrow(item.id, ptPart)}
                                className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-sans font-black px-1.5 py-0.5 rounded mt-1 shadow-2xs select-none relative cursor-pointer"
                              >
                                Settle Pt Share from Deposit Escrow
                              </button>
                            </div>
                          </td>

                          {/* Delete Action column */}
                          <td className="p-3 text-right shrink-0">
                            <button
                              onClick={() => handleDeleteBillLineItem(item.id)}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer"
                              title="Delete Item"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Aggregation Summary panel split */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 select-none text-[11px] font-mono">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-750">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Gross Baseline Cumulative Svc Cost</span>
                    <strong className="text-base font-black block">
                      ₹{activeBillItems.reduce((acc, curr) => acc + curr.rawCost, 0).toLocaleString()}
                    </strong>
                  </div>
                  <div className="space-y-1 pt-3 md:pt-0">
                    <span className="text-[9px] uppercase font-bold text-blue-400">Total Primary TPA Insurance Share</span>
                    <strong className="text-base font-black block text-blue-300">
                      ₹{activeBillItems.reduce((acc, curr) => acc + Math.round(curr.rawCost * curr.splitRatio.insurance), 0).toLocaleString()}
                    </strong>
                  </div>
                  <div className="space-y-1 pt-3 md:pt-0">
                    <span className="text-[9px] uppercase font-bold text-indigo-400">Total HR Corporate Credit Share</span>
                    <strong className="text-base font-black block text-indigo-300">
                      ₹{activeBillItems.reduce((acc, curr) => acc + Math.round(curr.rawCost * curr.splitRatio.corporate), 0).toLocaleString()}
                    </strong>
                  </div>
                  <div className="space-y-1 pt-3 md:pt-0 font-extrabold text-white">
                    <span className="text-[9px] uppercase font-black text-rose-400">Net Patient Out-Of-Pocket Copay</span>
                    <strong className="text-base font-black block text-[#00ebc7]">
                      ₹{activeBillItems.reduce((acc, curr) => acc + Math.round(curr.rawCost * curr.splitRatio.patient), 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Escrows and Refund Workflows side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Deposit management System */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-black text-amber-900 block uppercase tracking-wider text-amber-700">🪙 Escrow &amp; Advance Settle Ledger</span>
                <h3 className="text-xs font-black text-slate-950 uppercase">Pre-Admission Deposits &amp; Escrow Ledger</h3>
                
                <form onSubmit={handleAddEscrowDeposit} className="space-y-3.5">
                  <div className="bg-slate-50 p-4 rounded-xl text-xs font-semibold leading-normal space-y-1">
                    <p className="flex justify-between font-bold text-slate-500 text-[10px]">CURRENT RETAILED Escrow Wallet Balance</p>
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-slate-400 font-sans text-[11px]">UHID Active Vault:</span>
                      <strong className="text-lg font-black font-mono text-emerald-800">
                        ₹{escrowDeposits
                          .filter(d => d.patientId === focusedPatientId)
                          .reduce((acc, curr) => acc + curr.amount, 0)
                          .toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deposit Fund Amount (₹)</label>
                    <input 
                      type="number" 
                      value={newDepositAmount}
                      onChange={(e) => setNewDepositAmount(e.target.value)}
                      placeholder="₹50000"
                      className="w-full bg-slate-50 border text-xs font-bold font-mono px-3 py-2.5 rounded-xl block shadow-3xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Receipt Remarks / Authorization References</label>
                    <input 
                      type="text" 
                      value={depositRemarks}
                      onChange={(e) => setDepositRemarks(e.target.value)}
                      className="w-full bg-slate-50 border text-xs px-3 py-2 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-2.5 rounded-xl cursor-pointer transition select-none flex justify-center items-center gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4" /> Deposit Fund to Escrow Ledger
                  </button>
                </form>

                {/* Deposit Audit Queue list */}
                <div className="space-y-2 border-t pt-4">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">Escrow Hold Deposits log</span>
                  <div className="max-h-[150px] overflow-y-auto space-y-1.5">
                    {escrowDeposits
                      .filter(d => d.patientId === focusedPatientId)
                      .map(log => (
                        <div key={log.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-[10.5px]">
                          <div>
                            <span className="font-mono text-slate-405 text-slate-400 block tracking-wide">{log.id} - {log.depositedAt}</span>
                            <span className="text-slate-700 font-semibold">{log.remarks}</span>
                          </div>
                          <strong className={`font-mono font-extrabold ${log.amount > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {log.amount > 0 ? "+" : ""}₹{log.amount.toLocaleString()}
                          </strong>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

              {/* Refund Workflows */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-black text-rose-900 block uppercase tracking-wider text-rose-700">🔄 Compliance Refund Bureau</span>
                <h3 className="text-xs font-black text-slate-955 uppercase">Reimbursement and Refund Claims</h3>
                
                <form onSubmit={handleRequestRefund} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Item / Consumable to Reject</label>
                    <input 
                      type="text" 
                      value={refundRequestDesc}
                      onChange={(e) => setRefundRequestDesc(e.target.value)}
                      placeholder="e.g. Unused Box Cardiac Catheters, Discharged early deduction"
                      className="w-full bg-white border text-xs px-2.5 py-2 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Refund Sum (₹)</label>
                    <input 
                      type="number" 
                      value={refundRequestAmt}
                      onChange={(e) => setRefundRequestAmt(e.target.value)}
                      className="w-full bg-white border text-xs font-mono font-bold px-2 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Clinical Audit justification</label>
                    <input 
                      type="text" 
                      value={refundRequestReason}
                      onChange={(e) => setRefundRequestReason(e.target.value)}
                      placeholder="e.g. Returned unopened sterile pack to pharmacy box"
                      className="w-full bg-white border text-xs px-2.5 py-2 rounded-lg"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 rounded-lg cursor-pointer transition select-none flex justify-center items-center gap-1.5"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> File Refund Audit Docket
                  </button>
                </form>

                {/* Claims and Disbursement states list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">Active Refund Dispatch Claims Queue</span>
                  <div className="space-y-2">
                    {refundClaims.map(claim => (
                      <div key={claim.id} className="border border-slate-205 p-3.5 rounded-xl bg-slate-50/50 flex flex-col justify-between md:flex-row md:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-700 font-black text-xs">{claim.id}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-750 px-1.5 py-0.5 rounded font-black font-mono">EST: {claim.requestedAt}</span>
                            <strong className="text-slate-900 text-xs font-bold block">{claim.itemDescription}</strong>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold italic">Justification: {claim.reason}</p>
                          <p className="text-[9.5px] text-slate-450 text-slate-400">UHID Ref: {claim.patientId} • beneficiary Name: {claim.patientName}</p>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5 justify-center">
                          <span className="text-xs font-mono font-black text-[#003580] block">₹{claim.amount.toLocaleString()}</span>
                          
                          {/* Live Dynamic Actions buttons */}
                          {claim.status === "Pending Desk" && (
                            <button
                              onClick={() => approveRefundClaim(claim.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] px-2 py-1 rounded shadow-2xs select-none cursor-pointer"
                            >
                              ✓ Approve Refund
                            </button>
                          )}
                          {claim.status === "Approved" && (
                            <button
                              onClick={() => disburseRefundClaim(claim.id)}
                              className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] px-2.5 py-1 rounded shadow-2xs select-none cursor-pointer"
                            >
                              💸 Disburse Cash Settle
                            </button>
                          )}
                          {claim.status === "Disbursed" && (
                            <span className="bg-green-100 text-emerald-800 border border-green-250 font-black text-[8.5px] uppercase px-2 py-0.5 rounded">
                              ✓ Settle Disbursed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}

const CORPORATION_DETAILS_SAFE = {
  acronym: "CORP",
  defaultDiscount: 10,
  copayRatio: 0.15,
  deductible: 5000,
  logo: "🏢"
};
