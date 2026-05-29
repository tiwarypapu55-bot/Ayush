import React, { useState, useEffect } from "react";
import { 
  Package, 
  Truck, 
  FileText, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  ArrowDownCircle, 
  BadgeAlert, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ShieldCheck, 
  Sliders, 
  HelpCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  Trash2, 
  FileCheck, 
  Lock, 
  Activity,
  SlidersHorizontal,
  PlusCircle,
  TrendingUp,
  Workflow,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { InventoryItem, Vendor, GoodsReceivedNote } from "../types";

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  
  // Outer Workspace Navigation
  const [activeTab, setActiveTab] = useState<"items" | "grn" | "vendors">("items");
  
  // Multi-tier Submenus States
  const [itemsSubTab, setItemsSubTab] = useState<"ledger" | "issue" | "reorder" | "add_item">("ledger");
  const [grnSubTab, setGrnSubTab] = useState<"ledger" | "create" | "po_drafts">("ledger");
  const [vendorsSubTab, setVendorsSubTab] = useState<"directory" | "register" | "cdsco_verify">("directory");

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [stockSearch, setStockSearch] = useState("");
  const [stockSortedBy, setStockSortedBy] = useState<"name" | "stockAsc" | "stockDesc" | "expiry">("name");

  // Form states and builders
  const [issueItemId, setIssueItemId] = useState("");
  const [issueQuantity, setIssueQuantity] = useState(10);
  const [issueDept, setIssueDept] = useState("OPD General Ward");
  const [issueTechnicianId, setIssueTechnicianId] = useState("HPR-7740-9102");
  
  // Issue Checklist states
  const [issueCheck1, setIssueCheck1] = useState(false);
  const [issueCheck2, setIssueCheck2] = useState(false);
  const [issueCheck3, setIssueCheck3] = useState(false);

  // Department Issue history tracking
  const [departmentIssues, setDepartmentIssues] = useState<any[]>([
    {
      id: "ISS-4012",
      itemName: "Surgical Gloves (Size 7.5, Sterile)",
      itemId: "INV-001",
      quantity: 120,
      department: "General Surgery OT",
      technicianId: "HPR-7740-9102",
      dateIssued: "2026-05-28T14:30:00Z",
      status: "Verified & Dispatched"
    },
    {
      id: "ISS-3891",
      itemName: "Disposable Syringes 5ml with Needle",
      itemId: "INV-002",
      quantity: 500,
      department: "OPD General Ward",
      technicianId: "HPR-4412-8821",
      dateIssued: "2026-05-27T09:15:00Z",
      status: "Verified & Dispatched"
    },
    {
      id: "ISS-3712",
      itemName: "N95 Respirator Masks (3M)",
      itemId: "INV-003",
      quantity: 200,
      department: "ER Trauma Unit",
      technicianId: "HPR-9011-3829",
      dateIssued: "2026-05-26T11:45:00Z",
      status: "Verified & Dispatched"
    }
  ]);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New Vendor Form State
  const [vName, setVName] = useState("");
  const [vContact, setVContact] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vGst, setVGst] = useState("");
  const [vStatus, setVStatus] = useState<'Active' | 'Under Review' | 'Expired'>("Active");

  // Search vendor directory
  const [vendorSearch, setVendorSearch] = useState("");

  // New GRN states
  const [grnNum, setGrnNum] = useState("");
  const [grnPO, setGrnPO] = useState("");
  const [grnVendor, setGrnVendor] = useState("");
  const [grnItemName, setGrnItemName] = useState("");
  const [grnItemQty, setGrnItemQty] = useState(100);
  const [grnItemPrice, setGrnItemPrice] = useState(25);
  const [grnBatch, setGrnBatch] = useState("B-FRESH-99");
  const [grnExpiry, setGrnExpiry] = useState("2027-12-31");
  const [grnInspect1, setGrnInspect1] = useState(false);
  const [grnInspect2, setGrnInspect2] = useState(false);

  // New Item (Direct Consumable Addition) states
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<'Critical Consumables' | 'Surgical Instruments' | 'Personal Protective Equipment' | 'General Medicines' | 'Anesthetics'>("Critical Consumables");
  const [newItemStock, setNewItemStock] = useState<number>(200);
  const [newItemVendorName, setNewItemVendorName] = useState("");
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(45);
  const [newItemReorder, setNewItemReorder] = useState<number>(50);
  const [newItemBatch, setNewItemBatch] = useState("B-DIR-66");
  const [newItemExpiry, setNewItemExpiry] = useState("2028-06-30");

  // Draft Purchase Orders (POs) List State
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([
    {
      id: "PO-2026-8041",
      vendorName: "Medisurge Healthcare India",
      itemName: "Surgical Gloves (Size 7.5, Sterile)",
      quantity: 1500,
      unitPrice: 15,
      deliveryLocation: "Central Store A",
      deliveryDate: "2026-06-10",
      status: "Transmitted to CDSCO Gateway"
    },
    {
      id: "PO-2026-4412",
      vendorName: "Bharat Anesthetics Pharmachem",
      itemName: "Propofol Injection 10mg/mL (20mL)",
      quantity: 500,
      unitPrice: 210,
      deliveryLocation: "Cold Storage Room 3",
      deliveryDate: "2026-06-05",
      status: "Approved"
    }
  ]);

  // PO Creation Form State
  const [poVendor, setPoVendor] = useState("");
  const [poItemName, setPoItemName] = useState("");
  const [poQty, setPoQty] = useState<number>(500);
  const [poPrice, setPoPrice] = useState<number>(35);
  const [poDate, setPoDate] = useState("25-06-2026");
  const [poLocation, setPoLocation] = useState("Central Store A");

  // Interactive Email Overlay State
  const [emailVendor, setEmailVendor] = useState<Vendor | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // CDSCO Gateway simulator states
  const [cdscoSelectedVendor, setCdscoSelectedVendor] = useState("");
  const [cdscoCustomId, setCdscoCustomId] = useState("");
  const [cdscoInspectLog, setCdscoInspectLog] = useState<string[]>([]);
  const [cdscoStatus, setCdscoStatus] = useState<"idle" | "verifying" | "certified" | "failed">("idle");
  const [cdscoCertDetails, setCdscoCertDetails] = useState<any | null>(null);

  // Load backend data helper
  const loadData = async () => {
    try {
      const [iRes, vRes, gRes] = await Promise.all([
        fetch("/api/inventory").then(r => r.json()),
        fetch("/api/vendors").then(r => r.json()),
        fetch("/api/grn").then(r => r.json())
      ]);
      setItems(iRes);
      setVendors(vRes);
      setGrns(gRes);
      if (iRes.length > 0) {
        setIssueItemId(iRes[0].id);
      }
      if (vRes.length > 0) {
        setGrnVendor(vRes[0].name);
        setPoVendor(vRes[0].name);
        setCdscoSelectedVendor(vRes[0].id);
        setNewItemVendorName(vRes[0].name);
      }
    } catch (err) {
      console.error("Failed to load inventory stack", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearMessage = () => setTimeout(() => setMessage(null), 4000);

  // 1. Department Issue Stock
  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueItemId) return;
    if (!issueCheck1 || !issueCheck2 || !issueCheck3) {
      setMessage({ type: 'error', text: "Safety protocol check incomplete! Please tick all pre-issue checklist parameters." });
      clearMessage();
      return;
    }

    try {
      const selectedItem = items.find(i => i.id === issueItemId);
      if (!selectedItem) {
        setMessage({ type: 'error', text: "Consumable item matching could not be traced." });
        clearMessage();
        return;
      }
      
      const resp = await fetch("/api/inventory/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: issueItemId, quantity: issueQuantity })
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ 
          type: 'success', 
          text: `SUCCESS: Distributed ${issueQuantity} units of ${selectedItem.name} to ${issueDept}. Logged under ABDM Custodian ${issueTechnicianId}!` 
        });
        
        // Append to local state list of issued records for dashboard transparency
        const newIssue = {
          id: `ISS-${Math.floor(4000 + Math.random() * 5000)}`,
          itemName: selectedItem.name,
          itemId: selectedItem.id,
          quantity: issueQuantity,
          department: issueDept,
          technicianId: issueTechnicianId,
          dateIssued: new Date().toISOString(),
          status: "Verified & Dispatched"
        };
        setDepartmentIssues(prev => [newIssue, ...prev]);

        setIssueQuantity(10);
        setIssueCheck1(false);
        setIssueCheck2(false);
        setIssueCheck3(false);
        loadData();
      } else {
        setMessage({ type: 'error', text: data.error || "Issue transaction failed" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Server connection failed" });
    }
    clearMessage();
  };

  // 2. Direct Consumable Registration
  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemVendorName) return;

    try {
      const matchedVendor = vendors.find(v => v.name === newItemVendorName);
      const resp = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          category: newItemCategory,
          centralStockUnits: newItemStock,
          departmentIssuedUnits: 0,
          unissuedGrnUnits: 0,
          batchNumber: newItemBatch,
          expiryDate: newItemExpiry,
          vendorId: matchedVendor?.id || "VND-GENERIC",
          vendorName: newItemVendorName,
          unitCost: newItemUnitCost,
          reorderLevel: newItemReorder
        })
      });

      if (resp.ok) {
        setMessage({ type: 'success', text: `Consumable "${newItemName}" added to Central Stock Ledger successfully!` });
        setNewItemName("");
        setNewItemBatch("B-DIR-01");
        setNewItemStock(200);
        loadData();
        setItemsSubTab("ledger");
      } else {
        setMessage({ type: 'error', text: "Failed to persist new asset register" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Server connection failure" });
    }
    clearMessage();
  };

  // 3. Register Certified Vendor
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;
    try {
      const resp = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vName,
          contactPerson: vContact,
          phone: vPhone,
          email: vEmail,
          gstNumber: vGst,
          contractStatus: vStatus
        })
      });
      if (resp.ok) {
        setMessage({ type: 'success', text: `CDSCO Vendor "${vName}" successfully registered & indexed!` });
        setVName(""); setVContact(""); setVPhone(""); setVEmail(""); setVGst("");
        loadData();
        setVendorsSubTab("directory");
      } else {
        setMessage({ type: 'error', text: "Failed to save vendor" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Encountered server connection fault" });
    }
    clearMessage();
  };

  // 4. Create Goods Received Note (GRN)
  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnNum || !grnVendor || !grnItemName) return;
    if (!grnInspect1 || !grnInspect2) {
      setMessage({ type: 'error', text: "Pre-acceptance biological cargo quarantine and temperature inspection checks must be checked!" });
      clearMessage();
      return;
    }

    try {
      const resp = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grnNumber: grnNum,
          purchaseOrderId: grnPO,
          vendorName: grnVendor,
          itemsReceived: [
            {
              name: grnItemName,
              quantity: grnItemQty,
              unitPrice: grnItemPrice,
              batchNumber: grnBatch,
              expiryDate: grnExpiry
            }
          ],
          qualityCheckedBy: "Bio-safety Inspector Desk (Certified)"
        })
      });
      if (resp.ok) {
        setMessage({ type: 'success', text: `GRN ${grnNum} stored. Stock for "${grnItemName}" auto-adjusted (+${grnItemQty} Units) on database server!` });
        setGrnNum(""); setGrnPO(""); setGrnItemName("");
        setGrnInspect1(false); setGrnInspect2(false);
        loadData();
        setGrnSubTab("ledger");
      } else {
        setMessage({ type: 'error', text: "Failed to store Goods Received Note" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Server connection fault" });
    }
    clearMessage();
  };

  // 5. Submit Draft Purchase Order Requisition
  const triggerProcurePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poVendor || !poItemName) return;
    
    const newPO = {
      id: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: poVendor,
      itemName: poItemName,
      quantity: poQty,
      unitPrice: poPrice,
      deliveryLocation: poLocation,
      deliveryDate: poDate,
      status: "Draft Approved"
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setMessage({ type: 'success', text: `Purchase Order requisition ${newPO.id} logged. Transcribing to Gov gateway...` });
    setPoItemName("");
    clearMessage();
  };

  // 6. Rapid Stock Replenishment (Triggered from Low Stock action)
  const handleReplenishStock = async (item: InventoryItem) => {
    try {
      const targetGrnNumber = `AUTO-REORDER-${Math.floor(10000 + Math.random() * 90000)}`;
      const resp = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grnNumber: targetGrnNumber,
          purchaseOrderId: `REORDER-L-${item.id}`,
          vendorName: item.vendorName,
          itemsReceived: [
            {
              name: item.name,
              quantity: 500,
              unitPrice: item.unitCost,
              batchNumber: `B-AUTO-REP-${Math.floor(100 + Math.random() * 900)}`,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year expiration
            }
          ],
          qualityCheckedBy: "NHA Auto-Replenishment Engine"
        })
      });

      if (resp.ok) {
        setMessage({ type: "success", text: `REORDER ALERT: Standard 500 units of "${item.name}" replenished via auto-GRN receipt ${targetGrnNumber}!` });
        loadData();
      } else {
        setMessage({ type: "error", text: "Replenishment failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Replenishment process crashed" });
    }
    clearMessage();
  };

  // 7. Simulated CDSCO National Registry Live Portal Probing
  const runCdscoProbeTest = () => {
    const targetId = cdscoCustomId || cdscoSelectedVendor;
    const info = vendors.find(v => v.id === targetId || v.gstNumber === targetId || v.name === targetId);
    
    setCdscoStatus("verifying");
    setCdscoInspectLog([`▶ Connecting to Ministry of Health & Family Welfare CDSCO licensing gateway...`]);

    const logs = [
      `▶ Routing verified package parameters. Client credentials verified.`,
      `▶ Querying National Drug Registration Database for licensee license forms...`,
      `▶ MATCH FOUND: Form 20-B (Retail) & Form 21-B (Wholesale) drug retail certification validated.`,
      `▶ Probing WHO-GMP manufacturing status profile score index...`,
      `▶ SECURE ENCRYPT KEY check complete. FIPS-140-2 compliance verified.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setCdscoInspectLog(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        if (info) {
          setCdscoStatus("certified");
          setCdscoCertDetails({
            licensee: info.name,
            gstin: info.gstNumber,
            manger: info.contactPerson,
            registrationCode: `CDSCO-ND-HFR-${info.id.replace('VND-', '930')}-Y6`,
            status: "CERTIFIED COMPLIANT",
            scopes: ["Schedules H, H1 & G general antibiotics", "Surgical material handling", "Central medical grade cold chain transport"],
            issueDate: "2024-04-12",
            authorizedAt: "New Delhi Headquarters"
          });
        } else {
          setCdscoStatus("certified");
          setCdscoCertDetails({
            licensee: targetId || "CDSCO Sandbox Provider",
            gstin: "27AAPCS9031K1Z5",
            manger: "Officer Sandbox Audit Desk",
            registrationCode: `CDSCO-SANDBOX-AUTH-99`,
            status: "COMPLIANT GATEWAY VERIFIED",
            scopes: ["Personal Protection Equipment Class III", "Sterilised Surgical consumable supply clearance"],
            issueDate: new Date().toISOString().split("T")[0],
            authorizedAt: "Sandbox Virtual Vault Agency"
          });
        }
      }
    }, 450);
  };

  const isExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date();
  };

  const isExpiringSoon = (expiryStr: string) => {
    const timeDiff = new Date(expiryStr).getTime() - new Date().getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 45; // Expand warning range slightly to 45 days
  };

  const sortedAndFilteredItems = () => {
    let list = filterCategory === "All" ? items : items.filter(i => i.category === filterCategory);
    if (stockSearch) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(stockSearch.toLowerCase()) || 
        item.id.toLowerCase().includes(stockSearch.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(stockSearch.toLowerCase())
      );
    }
    
    return list.slice().sort((a, b) => {
      if (stockSortedBy === "name") return a.name.localeCompare(b.name);
      if (stockSortedBy === "stockAsc") return a.centralStockUnits - b.centralStockUnits;
      if (stockSortedBy === "stockDesc") return b.centralStockUnits - a.centralStockUnits;
      if (stockSortedBy === "expiry") return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return 0;
    });
  };

  const categories = [
    "All", 
    "Critical Consumables", 
    "Surgical Instruments", 
    "Personal Protective Equipment", 
    "General Medicines", 
    "Anesthetics"
  ];

  return (
    <div className="space-y-6" id="inventory-workspace">
      {/* Header banner */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
            Medical Consumables Operations • CDSCO Link
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-5.5 w-5.5 text-blue-400 animate-pulse" /> Central Store & Hospital Inventory Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Monitor batch controls, distribute department supplies, log direct Goods Received Notes (GRN), and verify active CDSCO vendors.</p>
        </div>
        <div className="flex gap-4 text-xs font-mono select-none">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center">
            <span className="text-[9px] text-slate-500 uppercase block">Store Stock Level</span>
            <strong className="text-blue-400 text-sm">
              {items.reduce((acc, c) => acc + c.centralStockUnits, 0).toLocaleString()} Units
            </strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center">
            <span className="text-[9px] text-slate-500 uppercase block">Vendors Network</span>
            <strong className="text-green-500 text-sm font-semibold">{vendors.length} Approved</strong>
          </div>
        </div>
      </div>

      {/* Message center */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border text-xs leading-normal transition-all duration-250 shadow-xs ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-805 border-emerald-250' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Email Composer Overlay (When selecting vendor contact) */}
      {emailVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold">Transmit Procurement Query Quote</h4>
                <p className="text-[11px] text-slate-400">To: {emailVendor.name} ({emailVendor.email})</p>
              </div>
              <button 
                onClick={() => setEmailVendor(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsSendingEmail(true);
              setTimeout(() => {
                setIsSendingEmail(false);
                setEmailVendor(null);
                setMessage({ type: "success", text: `Procurement outbound query safely transmitted to ${emailVendor.name} SMTP endpoint!` });
                clearMessage();
              }, 1200);
            }} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Subject Title</label>
                <input 
                  type="text" 
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Urgent Request for Quote - CEFTRI_BATCH_90"
                  className="w-full border rounded p-2 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Message Body</label>
                <textarea 
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Subject to immediate central warehouse storage clearance, we request immediate delivery quotation..."
                  className="w-full border rounded p-2 focus:outline-hidden"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? "Transmitting over secure SMTP..." : "Send Outbound RFQ Securely"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Primary Tabs */}
      <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200 shadow-2xs" id="inventory-tabs">
        <button
          onClick={() => { setActiveTab("items"); }}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "items" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className="h-3.5 w-3.5 text-blue-500" /> Stock Ledger & Department Issue
        </button>
        <button
          onClick={() => { setActiveTab("grn"); }}
          className={`flex-1 py-1 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "grn" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-indigo-500" /> Goods Received Notes & POs
        </button>
        <button
          onClick={() => { setActiveTab("vendors"); }}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "vendors" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck className="h-3.5 w-3.5 text-orange-500" /> Vendor Registry & CDSCO Verify
        </button>
      </div>

      {/* RENDER TAB 1: STOCK LEDGER & ISSUE */}
      {activeTab === "items" && (
        <div className="space-y-4 animate-fade-in" id="stock-ledger-workspace">
          {/* Submenu navigation for Tab 1 */}
          <div className="flex flex-wrap gap-1.5 border-b pb-2 flex-row md:items-center">
            <button
              onClick={() => setItemsSubTab("ledger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                itemsSubTab === "ledger" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" /> 📋 Warehouse Stock Status
            </button>
            <button
              onClick={() => setItemsSubTab("issue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                itemsSubTab === "issue" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ArrowDownCircle className="h-3.5 w-3.5" /> 📦 Department Issue Form
            </button>
            <button
              onClick={() => setItemsSubTab("reorder")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                itemsSubTab === "reorder" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" /> ⚡ Low Stock & Reorders
              {items.filter(i => i.centralStockUnits <= i.reorderLevel).length > 0 && (
                <span className="bg-rose-500 text-white font-extrabold px-1.5 py-0.2 text-[8px] rounded-full animate-bounce">
                  {items.filter(i => i.centralStockUnits <= i.reorderLevel).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setItemsSubTab("add_item")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                itemsSubTab === "add_item" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" /> ➕ Add New Consumable
            </button>
          </div>

          {/* VIEW A: Warehouse Stock Status */}
          {itemsSubTab === "ledger" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hospital Central Store Stock Status</h3>
                  <p className="text-[11px] text-slate-500">Expiries and reorders audited in real-time mode</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, ID or batch..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="text-xs border border-slate-300 pl-8 pr-3 py-1.5 rounded-lg w-52 focus:outline-hidden"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg whitespace-nowrap bg-slate-50 py-1.5 px-3 focus:outline-hidden font-bold"
                  >
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Sorter */}
                  <select
                    value={stockSortedBy}
                    onChange={(e) => setStockSortedBy(e.target.value as any)}
                    className="text-xs border border-slate-300 rounded-lg whitespace-nowrap bg-slate-50 py-1.5 px-3 focus:outline-hidden font-semibold text-blue-700"
                  >
                    <option value="name">Sort A-Z</option>
                    <option value="stockAsc">Stock: Low to High</option>
                    <option value="stockDesc">Stock: High to Low</option>
                    <option value="expiry">Expiry: Soonest</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                      <th className="p-3 pl-4">Consumable Details</th>
                      <th className="p-2">Category</th>
                      <th className="p-3 font-mono">Central Store</th>
                      <th className="p-3 font-mono">Dept Issued</th>
                      <th className="p-3">Batch & Expiry</th>
                      <th className="p-3">Safety Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {sortedAndFilteredItems().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-450 italic font-medium">
                          No consumables match your filtered criteria. Move to the "Add Consumable" tab or create a fresh PO!
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredItems().map(item => {
                        const isLow = item.centralStockUnits <= item.reorderLevel;
                        const expired = isExpired(item.expiryDate);
                        const soon = isExpiringSoon(item.expiryDate);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition duration-150">
                            <td className="p-3 pl-4">
                              <strong className="text-slate-900 block font-bold text-xs">{item.name}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {item.id} • Unit Cost: ₹{item.unitCost} • Vendor: {item.vendorName}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900">
                              {item.centralStockUnits.toLocaleString()} units
                            </td>
                            <td className="p-3 font-mono text-slate-600">
                              {item.departmentIssuedUnits.toLocaleString()} units
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <div className="text-slate-700">Batch: <strong>{item.batchNumber}</strong></div>
                              <div className={`text-[10px] font-bold ${
                                expired ? "text-rose-600 font-bold" : soon ? "text-amber-600" : "text-slate-500"
                              }`}>
                                Expiry: {item.expiryDate} {expired && "(EXPIRED)"} {soon && "(Expiring Soon)"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1.5">
                                {isLow && (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-250 text-[9px] font-extrabold py-0.5 px-2 rounded-md max-w-max">
                                    <AlertCircle className="h-3 w-3" /> Reorder Needed ({item.reorderLevel} units trigger)
                                  </span>
                                )}
                                {expired && (
                                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[9px] font-extrabold py-0.5 px-2 rounded-md max-w-max">
                                    <BadgeAlert className="h-3 w-3" /> CRITICAL EXPIRED
                                  </span>
                                )}
                                {!isLow && !expired && !soon && (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[9px] font-extrabold py-0.5 px-2 rounded-md max-w-max">
                                    <CheckCircle className="h-3 w-3" /> Optimum Supply
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW B: Department Stock Issue Form */}
          {itemsSubTab === "issue" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-blue-600" /> Department Stock Issue Dispatch
                </h3>
                
                <form onSubmit={handleIssueStock} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Consumable *</label>
                      <select
                        value={issueItemId}
                        onChange={(e) => setIssueItemId(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden font-bold text-indigo-900"
                        required
                      >
                        {items.map(i => (
                          <option key={i.id} value={i.id}>{i.name} (Stock: {i.centralStockUnits} un.)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Distribute Units *</label>
                      <input
                        type="number"
                        min={1}
                        value={issueQuantity}
                        onChange={(e) => setIssueQuantity(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Department Wing *</label>
                      <select
                        value={issueDept}
                        onChange={(e) => setIssueDept(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden font-semibold"
                      >
                        <option value="OPD General Ward">OPD General Ward</option>
                        <option value="Cardiology ICU">Cardiology ICU</option>
                        <option value="General Surgery OT">General Surgery OT</option>
                        <option value="Pediatrics Wing">Pediatrics Wing</option>
                        <option value="Clinical Pathology Lab">Clinical Pathology Lab</option>
                        <option value="ER Trauma Unit">ER Trauma Unit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Attending Clinician / HPR ID *</label>
                      <input 
                        type="text"
                        required
                        value={issueTechnicianId}
                        onChange={(e) => setIssueTechnicianId(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                        placeholder="e.g. HPR-1029-4412"
                      />
                    </div>
                  </div>

                  {/* High Quality Quality Check Checklist Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-250 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Pre-issue Double Audit Verification Protocol</span>
                    
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                        <input 
                          type="checkbox"
                          checked={issueCheck1}
                          onChange={(e) => setIssueCheck1(e.target.checked)}
                          className="mt-0.5 rounded cursor-pointer"
                        />
                        <span>Verifying that correct batch numbers conform to NABL specifications and that Indian Pharmacopoeia reference details correspond.</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                        <input 
                          type="checkbox"
                          checked={issueCheck2}
                          onChange={(e) => setIssueCheck2(e.target.checked)}
                          className="mt-0.5 rounded cursor-pointer"
                        />
                        <span>Confirm sterile outer packaging is completely undamaged and sealed tightly.</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                        <input 
                          type="checkbox"
                          checked={issueCheck3}
                          onChange={(e) => setIssueCheck3(e.target.checked)}
                          className="mt-0.5 rounded cursor-pointer"
                        />
                        <span>Authorized audit: confirming patient safety clearance guidelines for drug schedules (Form 20/21) is recorded.</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="h-4 w-4" /> Confirm Issue & Update EMR Store Catalog
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-600 space-y-3">
                  <span className="font-bold text-slate-800 text-xs block uppercase tracking-wider border-b pb-1">Safety Clearance Rules</span>
                  <p>
                    All issued medical materials are automatically routed through ABDM's FHIR-compliant sandbox database.
                  </p>
                  <p className="text-amber-700 font-semibold bg-amber-50 border border-amber-200 p-2.5 rounded-md">
                    ⚠️ Batch expiration check warning: In accordance with the Ministry of National Health registry directives, never distribute expired medicines or surgical instruments. Expired items are flagged and quarantined.
                  </p>
                  <div className="font-mono text-[10px] text-slate-500 bg-white p-2.5 rounded border">
                    HL7 Inventory Payload Token:<br />
                    <span className="text-blue-600 font-bold select-all">tx_hfr_token_{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                </div>
              </div>

              {/* DEPARTMENT STOCK ISSUE RECORD TABLE */}
              <div className="col-span-1 lg:col-span-12 bg-white p-5 rounded-xl border border-slate-200 shadow-3xs hover:border-slate-300 transition duration-150" id="department-issues-dispatch-table">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    📋 Department Issue Records ({departmentIssues.length})
                  </span>
                  <span className="text-[8px] font-mono font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded leading-none border border-blue-200 uppercase">
                    EMR STORE CATALOG FEED
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200 font-sans">
                  <table className="w-full text-left text-[11px] text-slate-750">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-2 pl-3">Issue/Reference ID</th>
                        <th className="p-2">Consumable Details</th>
                        <th className="p-2">Target Wing</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2 font-mono">Attending Clinician</th>
                        <th className="p-2">Date/Time Issued</th>
                        <th className="p-2 pr-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentIssues.map((issue, idx) => {
                        return (
                          <tr key={issue.id || idx} className="hover:bg-slate-50/60 transition-colors font-sans text-[11px]">
                            <td className="p-2 pl-3 font-mono font-bold text-slate-900 leading-tight">
                              {issue.id}
                            </td>
                            <td className="p-2">
                              <div className="font-semibold text-slate-800 leading-snug">{issue.itemName}</div>
                              <div className="text-[9px] text-slate-400 font-mono font-semibold">{issue.itemId}</div>
                            </td>
                            <td className="p-2">
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2 py-0.5 rounded-md text-[10.5px]">
                                {issue.department}
                              </span>
                            </td>
                            <td className="p-2 font-mono font-bold text-xs text-slate-800">
                              {issue.quantity} units
                            </td>
                            <td className="p-2 text-slate-600 font-medium font-mono text-[10.5px]">
                              {issue.technicianId}
                            </td>
                            <td className="p-2 font-mono text-[10px] text-slate-500">
                              {new Date(issue.dateIssued).toLocaleString()}
                            </td>
                            <td className="p-2 pr-3 text-right">
                              <span className="text-[8.5px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                                {issue.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {departmentIssues.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400 italic text-xs">
                            No stock issues dispatched in this session.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: Low Stock Alerts & Reorders */}
          {itemsSubTab === "reorder" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <BadgeAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" /> National Safety Low-Stock Reorder Board
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  The items listed below are currently below safe hospital reserves threshold. Click "Rapid PO Replenish" to trigger automated server data synchronization and restock!
                </p>

                <div className="space-y-3">
                  {items.filter(i => i.centralStockUnits <= i.reorderLevel).length === 0 ? (
                    <div className="p-8 text-center italic bg-green-50/50 border border-green-200 text-green-700 rounded-xl text-xs flex justify-center items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" /> Optimal Stock levels maintained. All consumable items are completely above reorder thresholds!
                    </div>
                  ) : (
                    items.filter(i => i.centralStockUnits <= i.reorderLevel).map(item => (
                      <div key={item.id} className="border p-4 bg-slate-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs transition hover:border-amber-300">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 text-sm">{item.name}</strong>
                            <span className="text-[10px] bg-rose-550 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200 font-bold font-mono">
                              Low {item.centralStockUnits} un. remaining
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-505 mt-1 font-medium font-mono">
                            Item ID: {item.id} • Category: {item.category} • Target safe reserve size: {item.reorderLevel} units
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Preferred Vendor Partner: <strong>{item.vendorName}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleReplenishStock(item)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition-all text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Rapid PO Replenish (+500 Units)
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: Add New Consumable Asset Form */}
          {itemsSubTab === "add_item" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-7xl mx-auto" id="add-consumable-asset-grid">
              {/* Form Side */}
              <div className="lg:col-span-5 bg-white rounded-xl border p-5 shadow-xs" id="add-consumable-form-card">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-1.5">
                  <PlusCircle className="h-4.5 w-4.5 text-blue-600" /> Add New Consumable Asset Register
                </h3>

                <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Asset Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Sterile Cannula Gauge 22G IP"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-605 uppercase mb-1">Category Classification *</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as any)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden"
                      >
                        <option value="Critical Consumables">Critical Consumables</option>
                        <option value="Surgical Instruments">Surgical Instruments</option>
                        <option value="Personal Protective Equipment">Personal Protective Equipment</option>
                        <option value="General Medicines">General Medicines</option>
                        <option value="Anesthetics">Anesthetics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Contractor Vendor Partner *</label>
                      <select
                        value={newItemVendorName}
                        onChange={(e) => setNewItemVendorName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden font-bold text-indigo-700"
                      >
                        {vendors.map(v => (
                          <option key={v.id} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Initial Stock Units *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={newItemStock}
                        onChange={(e) => setNewItemStock(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Unit Net Cost (₹) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={newItemUnitCost}
                        onChange={(e) => setNewItemUnitCost(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Low Reorder Threshold *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newItemReorder}
                        onChange={(e) => setNewItemReorder(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Schedules Batch Reference *</label>
                      <input
                        type="text"
                        required
                        value={newItemBatch}
                        onChange={(e) => setNewItemBatch(e.target.value)}
                        className="w-full text-xs border rounded p-2 focus:outline-hidden"
                        placeholder="e.g. B-CAN-99"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Expiration Cutoff Date *</label>
                      <input
                        type="date"
                        required
                        value={newItemExpiry}
                        onChange={(e) => setNewItemExpiry(e.target.value)}
                        className="w-full text-xs border rounded p-2 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-1 shadow-sm transition cursor-pointer text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> Save Asset Details to Central Server Database
                  </button>
                </form>
              </div>

              {/* Table Side */}
              <div className="lg:col-span-7 bg-white rounded-xl border p-5 shadow-xs" id="consumable-registry-table-card">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    📦 Centrally Registered Asset Ledger ({items.length})
                  </span>
                  <span className="text-[8px] font-mono font-bold text-indigo-805 text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded leading-none border border-indigo-200 uppercase">
                    asset register hub
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200 font-sans">
                  <table className="w-full text-left text-[11px] text-slate-750">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-2 pl-3">Asset Code & Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Central Stock</th>
                        <th className="p-2">Batch / Expiry</th>
                        <th className="p-2">Unit Cost</th>
                        <th className="p-2 pr-3 text-right">Vendor Partner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => {
                        const isLow = item.centralStockUnits <= item.reorderLevel;
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors font-sans text-[11px]">
                            <td className="p-2 pl-3">
                              <div className="font-bold text-slate-900 leading-tight">{item.name}</div>
                              <div className="text-[9px] font-mono text-slate-400 font-semibold">{item.id}</div>
                            </td>
                            <td className="p-2">
                              <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block ${
                                item.category === "Critical Consumables" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                item.category === "Surgical Instruments" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                item.category === "Personal Protective Equipment" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                item.category === "General Medicines" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className={`font-mono text-xs font-bold leading-none ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                                {item.centralStockUnits}
                              </div>
                              {isLow && (
                                <span className="text-[7.5px] font-bold text-rose-600 animate-pulse uppercase tracking-wider block mt-0.5">
                                  ⚠️ LOW (REORDER: {item.reorderLevel})
                                </span>
                              )}
                            </td>
                            <td className="p-2 font-mono text-[9.5px] text-slate-600">
                              <div className="font-semibold">{item.batchNumber}</div>
                              <div className="text-[8.5px] text-slate-400">{item.expiryDate}</div>
                            </td>
                            <td className="p-2 font-mono font-medium text-slate-850 text-slate-800 text-xs">
                              ₹{item.unitCost}
                            </td>
                            <td className="p-2 pr-3 text-right">
                              <div className="font-semibold text-slate-755 text-slate-750 leading-tight">{item.vendorName}</div>
                              <div className="text-[8.5px] font-mono text-slate-400">{item.vendorId}</div>
                            </td>
                          </tr>
                        );
                      })}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-400 italic text-xs">
                            No consumable assets registered in store index.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: GOODS RECEIVED NOTES (GRN) & PURCHASE ORDERS */}
      {activeTab === "grn" && (
        <div className="space-y-4 animate-fade-in" id="grn-registry-workspace">
          {/* Subtabs nested beneath Tab 2 */}
          <div className="flex flex-wrap gap-1.5 border-b pb-2">
            <button
              onClick={() => setGrnSubTab("ledger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                grnSubTab === "ledger" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" /> 📋 GRN Receipts Ledger
            </button>
            <button
              onClick={() => {
                setGrnSubTab("create");
                // Pre-populate mock values to make input friendly
                setGrnNum(`NDHM-GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                setGrnPO(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                grnSubTab === "create" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> ➕ Log Cargo Goods Received Note
            </button>
            <button
              onClick={() => setGrnSubTab("po_drafts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                grnSubTab === "po_drafts" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" /> ⚡ Procurement Purchase Orders (POs)
            </button>
          </div>

          {/* VIEW A: GRN List Ledger */}
          {grnSubTab === "ledger" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Goods Received Notes (GRN) Receipts</h3>
                <p className="text-[11px] text-slate-500">Inspected shipments and NABL batch clearances catalog</p>
              </div>

              <div className="divide-y divide-slate-100">
                {grns.map(note => (
                  <div key={note.id} className="p-4 bg-slate-50/25 space-y-3 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <strong className="text-slate-900 text-sm font-bold font-mono">{note.grnNumber}</strong>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {note.id} • PO Reference: {note.purchaseOrderId} • Date Received: {new Date(note.dateReceived).toLocaleString()}
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-850 border border-emerald-200 text-[9px] font-extrabold py-0.5 px-2 rounded-full uppercase tracking-wider">
                        ★ {note.status} BY CLINICAL WAREHOUSE
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-slate-705 space-y-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Vendor Supplier Details:</div>
                      <div className="font-bold text-slate-950">{note.vendorName}</div>
                      
                      <div className="mt-3 overflow-hidden border rounded-lg">
                        <table className="w-full text-left bg-slate-550/10 bg-slate-50">
                          <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500">
                            <tr>
                              <th className="p-2 pl-3">Material / Consumable</th>
                              <th className="p-2 text-right">Quantity</th>
                              <th className="p-2 text-right">Unit Price</th>
                              <th className="p-2">Batch Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-[11px] text-slate-700 bg-white">
                            {note.itemsReceived.map((ri, iIdx) => (
                              <tr key={iIdx}>
                                <td className="p-2 pl-3 font-semibold text-slate-900">{ri.name}</td>
                                <td className="p-2 text-right font-mono font-bold">{ri.quantity.toLocaleString()}</td>
                                <td className="p-2 text-right font-mono">₹{ri.unitPrice}</td>
                                <td className="p-2 font-mono text-slate-500 text-[10px]">
                                  {ri.batchNumber} (Exp: {ri.expiryDate})
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t pt-2">
                      <span>Inspection Desk Authority: <strong>{note.qualityCheckedBy}</strong></span>
                      <span className="text-slate-400 font-mono text-[9px]">FHIR HL7 Asset Exchange Compliant</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW B: Log Cargo Goods Received Note */}
          {grnSubTab === "create" && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-indigo-650" /> Log Cargo Goods Received Note (GRN)
              </h3>

              <form onSubmit={handleCreateGRN} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GRN Identification Code *</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        value={grnNum}
                        onChange={(e) => setGrnNum(e.target.value)}
                        placeholder="e.g. NDHM-GRN-2026-9041"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setGrnNum(`NDHM-GRN-2026-${Math.floor(10000 + Math.random() * 90000)}`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 rounded-lg"
                        title="Auto Generate code"
                      >
                        🧬
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Purchase Order PO ID *</label>
                    <input
                      type="text"
                      required
                      value={grnPO}
                      onChange={(e) => setGrnPO(e.target.value)}
                      placeholder="e.g. PO-2026-4412"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered CDSCO Vendor *</label>
                  <select
                    value={grnVendor}
                    onChange={(e) => setGrnVendor(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-bold text-slate-800"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Received consumable material structure */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                  <span className="block text-[9px] font-extrabold uppercase text-indigo-750 tracking-wider border-b pb-1">Received Material Inventory Specification</span>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Material/Drug Name *</label>
                    <input
                      type="text"
                      required
                      value={grnItemName}
                      onChange={(e) => setGrnItemName(e.target.value)}
                      placeholder="e.g. Disposable Sterile Syringe 5ml IP"
                      className="w-full text-xs bg-white border rounded p-2 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Quantity Received *</label>
                      <input
                        type="number"
                        min={1}
                        value={grnItemQty}
                        onChange={(e) => setGrnItemQty(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-white border rounded p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Unit Price (₹) *</label>
                      <input
                        type="number"
                        min={1}
                        value={grnItemPrice}
                        onChange={(e) => setGrnItemPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-xs bg-white border rounded p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Batch Code Code *</label>
                      <input
                        type="text"
                        required
                        value={grnBatch}
                        onChange={(e) => setGrnBatch(e.target.value)}
                        className="w-full text-xs bg-white border rounded p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Expiry Date *</label>
                      <input
                        type="date"
                        required
                        value={grnExpiry}
                        onChange={(e) => setGrnExpiry(e.target.value)}
                        className="w-full text-xs bg-white border rounded p-2 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Pre-receipt Inspection Checks Box */}
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200">
                  <span className="block text-[10px] uppercase font-extrabold text-indigo-900 mb-2.5">Biological Cargo Acceptance Inspection Checks</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer text-indigo-950 font-medium">
                      <input 
                        type="checkbox"
                        checked={grnInspect1}
                        onChange={(e) => setGrnInspect1(e.target.checked)}
                        className="mt-0.5 rounded cursor-pointer"
                        required
                      />
                      <span>Inspect package crates and confirm physical protection compliance. Thermal temperature logging complies with cold chain protocol.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-indigo-950 font-medium">
                      <input 
                        type="checkbox"
                        checked={grnInspect2}
                        onChange={(e) => setGrnInspect2(e.target.checked)}
                        className="mt-0.5 rounded cursor-pointer"
                        required
                      />
                      <span>Physical quantity checks conform to purchase order (PO) line items. CDSCO analytical batch validation clearance report is attached.</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-slate-800 text-slate-100 font-bold text-xs py-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileCheck className="h-4 w-4" /> Confirm Cargo Check & Store Stock on Server
                </button>
              </form>
            </div>
          )}

          {/* VIEW C: Draft Purchase Orders (POs) Builder & Board */}
          {grnSubTab === "po_drafts" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Draft PO Form */}
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" /> Draft New Purchase Order (PO)
                </h3>

                <form onSubmit={triggerProcurePO} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Target Registered Vendor *</label>
                    <select
                      value={poVendor}
                      onChange={(e) => setPoVendor(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-slate-50 p-2.5 rounded-lg font-bold"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Material / Clinical Consumable *</label>
                    <input 
                      type="text" 
                      required
                      value={poItemName}
                      onChange={(e) => setPoItemName(e.target.value)}
                      className="w-full text-xs border rounded-lg p-2.5"
                      placeholder="e.g. Disposable Infusion Sets Type-I IP"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-605 uppercase mb-1">Quantity Requested</label>
                      <input 
                        type="number" 
                        required
                        min={1}
                        value={poQty}
                        onChange={(e) => setPoQty(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-605 uppercase mb-1">Target Unit Rate (₹)</label>
                      <input 
                        type="number" 
                        required
                        min={1}
                        value={poPrice}
                        onChange={(e) => setPoPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Delivery Location</label>
                      <select
                        value={poLocation}
                        onChange={(e) => setPoLocation(e.target.value)}
                        className="w-full text-xs border bg-slate-50 rounded-lg p-2"
                      >
                        <option value="Central Store A">Central Store A</option>
                        <option value="Clinical Path Depot">Clinical Path Depot</option>
                        <option value="Cold Storage Room 3">Cold Storage Room 3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Delivery Cutoff</label>
                      <input 
                        type="text"
                        required
                        value={poDate}
                        onChange={(e) => setPoDate(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2 font-mono"
                        placeholder="e.g. 15-06-2026"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border text-[11px] text-slate-500 font-mono">
                    Estimated Procurement Requisition Value:<br />
                    <strong className="text-slate-900 text-xs">₹{(poQty * poPrice).toLocaleString()} INS (Net GST Extra)</strong>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    <Plus className="h-4 w-4" /> Log Draft PO & Align CDSCO Schedule
                  </button>
                </form>
              </div>

              {/* POs list board */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-md inline-block uppercase tracking-wider mb-2">
                  Active Procurement Purchase Orders
                </span>
                
                <div className="space-y-3">
                  {purchaseOrders.map(po => (
                    <div key={po.id} className="border p-4 rounded-xl bg-slate-50 hover:bg-slate-50/10 hover:border-indigo-200 transition text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-950">{po.id}</span>
                          <span className="text-slate-400 font-mono text-[10px] pl-2">• Deliv. Location: {po.deliveryLocation}</span>
                        </div>
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                          {po.status}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-slate-900 text-sm block">{po.itemName}</strong>
                        <div className="text-slate-600 flex justify-between">
                          <span>Quantity Requisitioned: <strong>{po.quantity.toLocaleString()} un.</strong></span>
                          <span>Unit Cost Rate: <strong>₹{po.unitPrice}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t flex justify-between">
                          <span>Target Vendor: <strong>{po.vendorName}</strong></span>
                          <span>Expected: <strong>{po.deliveryDate}</strong></span>
                        </div>
                      </div>

                      {/* PO Action Bridge directly to GRN Creation */}
                      <div className="flex justify-end gap-2 pt-1.5 border-t border-dashed">
                        <button 
                          onClick={() => {
                            setGrnSubTab("create");
                            setGrnPO(po.id);
                            setGrnVendor(po.vendorName);
                            setGrnItemName(po.itemName);
                            setGrnItemQty(po.quantity);
                            setGrnItemPrice(po.unitPrice);
                            setGrnNum(`NDHM-GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                            setMessage({ type: "success", text: `PO details transcription successful! Pre-filled receipt form for cargo checks...` });
                            clearMessage();
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold px-2.5 py-1 text-[11px] rounded border border-indigo-200 transition"
                        >
                          Generate Cargo GRN Receipt Box
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 3: VENDOR REGISTRY & CDSCO SIMULATOR */}
      {activeTab === "vendors" && (
        <div className="space-y-4 animate-fade-in" id="vendors-registry-workspace">
          {/* Subtabs for Tab 3 */}
          <div className="flex flex-wrap gap-1.5 border-b pb-2">
            <button
              onClick={() => setVendorsSubTab("directory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                vendorsSubTab === "directory" ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" /> Approved Vendor Directory
            </button>
            <button
              onClick={() => setVendorsSubTab("register")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                vendorsSubTab === "register" ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> ➕ New Vendor Registration
            </button>
            <button
              onClick={() => {
                setVendorsSubTab("cdsco_verify");
                setCdscoStatus("idle");
                setCdscoInspectLog([]);
                setCdscoCertDetails(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                vendorsSubTab === "cdsco_verify" ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-orange-450" /> 🔐 CDSCO License Verification Gateway
            </button>
          </div>

          {/* VIEW A: Approved Vendor list Directory */}
          {vendorsSubTab === "directory" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hospital Approved Vendors Directory</h3>
                  <p className="text-[11px] text-slate-505">Registered drugs, therapeutics & supplies CDSCO providers board</p>
                </div>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-450 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search vendor name, Kam, GST..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    className="text-xs border pl-8 pr-3 py-1.5 rounded-lg w-56 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {vendors
                  .filter(v => 
                    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                    v.contactPerson.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                    v.gstNumber.toLowerCase().includes(vendorSearch.toLowerCase())
                  )
                  .map(v => (
                    <div key={v.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-950 font-bold text-sm">{v.name}</strong>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase border ${
                            v.contractStatus === "Active" ? "bg-green-50 text-green-700 border-green-250" : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {v.contractStatus}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">Vendor ID: {v.id} • CDSCO GSTIN license code: {v.gstNumber}</div>
                        <div className="text-slate-600 mt-1 font-medium">Key Account Manager: <strong>{v.contactPerson}</strong></div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 text-left sm:text-right text-xs font-mono">
                        <div className="text-slate-500">
                          <div>📞 {v.phone}</div>
                          <div>✉ {v.email}</div>
                        </div>

                        {/* Interactive actions for Quote procurement emails */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setEmailVendor(v);
                              setEmailSubject(`Procurement Material Purchase query quote - UHID Central Vault`);
                              setEmailBody(`To ${v.contactPerson},\n\nMediNexus Central Store and Inventory Desk requests an urgent procurement quote under FDA compliant schedule H guidelines for immediate warehouse receipt.\n\nThank you.`);
                            }}
                            className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border transition flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3 text-orange-600" /> Send RFQ Quote Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW B: New Vendor Registration */}
          {vendorsSubTab === "register" && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-orange-600" /> Register Certified Vendor Partner
              </h3>

              <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Company legal Name *</label>
                  <input
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Apex Biotech Distributers Pvt Ltd"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Key Account Manager *</label>
                  <input
                    type="text"
                    required
                    value={vContact}
                    onChange={(e) => setVContact(e.target.value)}
                    placeholder="e.g. Anand Sen"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">GSTIN Reg No *</label>
                    <input
                      type="text"
                      required
                      value={vGst}
                      onChange={(e) => setVGst(e.target.value)}
                      placeholder="e.g. 07AAACM4829J1Z1"
                      className="w-full text-center text-xs border rounded p-2 focus:outline-hidden font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Mobile Contact *</label>
                    <input
                      type="text"
                      required
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      placeholder="98XXXXXX88"
                      className="w-full text-center text-xs border rounded p-2 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={vEmail}
                      onChange={(e) => setVEmail(e.target.value)}
                      placeholder="orders@apexbiotech.co.in"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Initial License Contract State</label>
                    <select
                      value={vStatus}
                      onChange={(e) => setVStatus(e.target.value as any)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 cursor-pointer font-semibold"
                    >
                      <option value="Active">Active Clearance</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Expired">Temporary Hold</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-2.5 rounded-lg cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" /> Validate CDSCO Code & Save Contract
                </button>
              </form>
            </div>
          )}

          {/* VIEW C: CDSCO License Verification Gateway */}
          {vendorsSubTab === "cdsco_verify" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs" id="cdsco-compliance-portal">
              {/* CDSCO Form selection trigger */}
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-orange-900 bg-orange-50 px-3 py-1 rounded-md inline-block uppercase tracking-wider mb-2">
                  CDSCO National Licensing Gateway Link
                </span>
                
                <p className="text-[11px] text-slate-550 leading-normal">
                  Select an approved vendor from the database HFR profile or enter a custom Central Drug Registry reference license key to execute a live regulatory verification probe.
                </p>

                <div className="space-y-3 font-medium">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select DB HFR Vendor Profile</label>
                    <select
                      value={cdscoSelectedVendor}
                      onChange={(e) => {
                        setCdscoSelectedVendor(e.target.value);
                        setCdscoCustomId("");
                      }}
                      className="w-full border p-2.5 bg-slate-50 rounded-lg focus:outline-hidden font-bold"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} (License ID: {v.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[10px] text-slate-400 font-extrabold tracking-wider">OR ENTER MANUAL License</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-606 uppercase mb-1">Custom Licenses No / GSTIN Key</label>
                    <input 
                      type="text"
                      className="w-full border rounded-lg p-2.5 font-mono text-center font-bold tracking-widest bg-amber-50/20 text-indigo-900"
                      value={cdscoCustomId}
                      onChange={(e) => setCdscoCustomId(e.target.value)}
                      placeholder="e.g. 07AAACM482J1Z1"
                    />
                  </div>

                  <button
                    onClick={runCdscoProbeTest}
                    disabled={cdscoStatus === "verifying"}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Lock className={`h-4 w-4 ${cdscoStatus === "verifying" ? "animate-spin" : ""}`} /> 
                    {cdscoStatus === "verifying" ? "Simulating Gateway Handshake..." : "Execute National Registry Verification"}
                  </button>
                </div>
              </div>

              {/* CDSCO Diagnostic Terminal Box */}
              <div className="lg:col-span-7 bg-slate-950 text-emerald-400 p-5 rounded-2xl border border-slate-900 font-mono text-[11px] space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                {/* Visual header */}
                <div className="flex justify-between items-center bg-slate-900/45 p-2 rounded border border-slate-800 text-[10px]">
                  <span>ENDPOINT: gov.cdsco.nic.in/api/v2/verify</span>
                  <span className="text-orange-500 font-bold tracking-widest uppercase">CDSCO Portal GATEWAYv2</span>
                </div>

                {/* Log outputs */}
                <div className="flex-1 space-y-1.5 max-h-48 overflow-y-auto pt-2">
                  {cdscoStatus === "idle" && (
                    <div className="text-slate-500 italic text-center py-6">
                      ◀ CDSCO Licensing Gateway ready. Output diagnostics stream will populate here on test execution.
                    </div>
                  )}

                  {cdscoInspectLog.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed animate-fade-in">
                      {log}
                    </div>
                  ))}

                  {cdscoStatus === "verifying" && (
                    <div className="text-[10px] text-amber-500 animate-pulse bg-amber-950/20 px-2 py-1 rounded max-w-max border border-amber-900 mt-2">
                      Probing National Registry Keystore... please standby.
                    </div>
                  )}
                </div>

                {/* Cert Badge Card output */}
                {cdscoStatus === "certified" && cdscoCertDetails && (
                  <div className="bg-emerald-950/25 border-2 border-emerald-500 rounded-xl p-4 text-emerald-100 mt-2 space-y-2.5 animate-fade-in shadow-xl">
                    <div className="flex justify-between items-start border-b border-emerald-500 pb-1.5">
                      <div>
                        <span className="text-[8px] tracking-widest uppercase font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                          GOVERNMENT OF INDIA REGULATION CERTIFIED
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{cdscoCertDetails.licensee}</h4>
                      </div>
                      <span className="text-[9px] bg-emerald-900 text-white font-bold p-1 rounded font-mono border border-emerald-800">
                        {cdscoCertDetails.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed">
                      <div>
                        <span className="text-emerald-450 block text-[9px]">REGISTRY NO:</span>
                        <strong className="text-white select-all">{cdscoCertDetails.registrationCode}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-450 block text-[9px]">GSTIN/TIN:</span>
                        <strong className="text-white select-all">{cdscoCertDetails.gstin}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-450 block text-[9px]">OFFICIAL HEAD DEPUTY:</span>
                        <strong className="text-emerald-200">{cdscoCertDetails.manger}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-450 block text-[9px]">AUTHORIZED ON:</span>
                        <strong className="text-emerald-200">{cdscoCertDetails.issueDate}</strong>
                      </div>
                    </div>

                    <div className="border-t border-emerald-500/50 pt-2 text-[10px]">
                      <span className="text-emerald-405 font-bold block pb-1 uppercase text-[9px]">Registered Pharmaceutical scopes:</span>
                      <ul className="list-disc leading-normal pl-4 text-[10px] text-zinc-300">
                        {cdscoCertDetails.scopes.map((sc: string, idx: number) => (
                          <li key={idx}>{sc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
